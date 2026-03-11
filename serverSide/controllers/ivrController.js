const db = require("../config/firebase");
const { parseSpokenNumbers } = require("../utils/nlpUtils");

const formatNameForSpeech = (name) => {
  if (!name) return "";
  return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

// Twilio Google Voice setting
const VOICE_SETTING = 'voice="Google.en-US-Standard-F"';
// Improve Speech-to-Text accuracy using standard settings
const GATHER_SETTINGS = 'input="speech dtmf" timeout="5" language="en-US"';

let clients = [];
// Store Q&A history temporarily based on CallSid
const callHistory = {};
const twilioClient = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_TOKEN);

exports.streamLogs = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  clients.push(res);
  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
};

const sendVoiceResponse = (res, xmlString) => {
  const sayMatches = [...xmlString.matchAll(/<Say[^>]*>([\s\S]*?)<\/Say>/g)];
  if (sayMatches.length > 0) {
    sayMatches.forEach(match => {
      const text = match[1].trim();
      console.log(`\n[IVR SPEAKING]: ${text}\n`);
      clients.forEach(client => client.write(`data: ${JSON.stringify({ text, timestamp: new Date().toISOString() })}\n\n`));
    });
  }
  res.type("text/xml");
  res.send(xmlString);
};

// Helper to log Q&A for the final SMS
const logQA = (callSid, question, answer) => {
  if (!callSid) return;
  if (!callHistory[callSid]) {
    callHistory[callSid] = [];
  }
  callHistory[callSid].push(`Q: ${question}\nA: ${answer}`);
};

// Helper to trigger the summary SMS
const sendSummarySMS = async (callSid, callerNumber) => {
  if (!callSid || !callHistory[callSid]) return;
  
  const history = callHistory[callSid];
  if (history.length > 0) {
    const smsBody = `College of Engineering Vadakara - Student Enquiry Summary:\n\n${history.join('\n\n')}`;
    // Hardcode the destination number since this is a Twilio Trial account and this is the only verified number.
    const verifiedDestinationNumber = "+918075595509"; 

    try {
      await twilioClient.messages.create({
        body: smsBody,
        from: process.env.TWILIO_PHONE_NUMBER || "+18302228555",
        to: verifiedDestinationNumber
      });
      console.log(`\n[SMS SENT] Successfully sent summary SMS to ${verifiedDestinationNumber}\n`);
    } catch (err) {
      console.error(`\n[SMS ERROR] Failed to send summary SMS: ${err.message}\n`);
    }
  }
  // Clean up memory
  delete callHistory[callSid];
};

exports.mainMenu = (req, res) => {
  sendVoiceResponse(res, `
    <Response>
      <Gather ${GATHER_SETTINGS} action="/api/menu" numDigits="1">
        <Say ${VOICE_SETTING}>Welcome to college of Engineering vadakara ! Press 1 for student details. Press 2 for department details.</Say>
      </Gather>
      <Say ${VOICE_SETTING}>We didn't receive any input. Goodbye.</Say>
    </Response>
  `);
};

exports.handleMenu = (req, res) => {
  const digit = req.body.Digits;
  const speech = req.body.SpeechResult ? req.body.SpeechResult.toLowerCase() : "";

  console.log(`\n[USER INPUT - MENU]: Digits: "${digit || 'none'}", Speech: "${speech || 'none'}"\n`);

  if (digit === "1" || speech.includes("student")) {
    logQA(req.body.CallSid, `Menu Selection: ${digit || speech}`, "Navigated to Student Details. Prompting for admission number.");
    sendVoiceResponse(res, `
      <Response>
        <Say ${VOICE_SETTING}>Please enter your student admission number on the keypad followed by the hash key, or just say it clearly.</Say>
        <Gather action="/api/studentAuth" method="POST" ${GATHER_SETTINGS} finishOnKey="#">
          <Say ${VOICE_SETTING}>Waiting for your admission number.</Say>
        </Gather>
      </Response>
    `);
  } else if (digit === "2" || speech.includes("department") || speech.includes("dept")) {
    logQA(req.body.CallSid, `Menu Selection: ${digit || speech}`, "Navigated to Department Details. Prompting for fee type.");
    sendVoiceResponse(res, `
      <Response>
        <Say ${VOICE_SETTING}>The department offers excellent facilities, experienced faculty, and strong industry placements.</Say>
        <Gather action="/api/deptDetails" method="POST" ${GATHER_SETTINGS} numDigits="1">
          <Say ${VOICE_SETTING}>Which fee do you need to know? Press 1 for merit, press 2 for NRI, or press 3 for management.</Say>
        </Gather>
      </Response>
    `);
  } else {
    logQA(req.body.CallSid, `Menu Selection: ${digit || speech}`, "Invalid selection. Returning to main menu.");
    sendVoiceResponse(res, `
      <Response>
        <Say ${VOICE_SETTING}>Sorry, I didn't catch that. Returning to the main menu.</Say>
        <Redirect>/api/voice</Redirect>
      </Response>
    `);
  }
};

exports.studentAuth = async (req, res) => {
  let admissionNo = req.body.Digits || parseSpokenNumbers(req.body.SpeechResult);

  console.log(`\n[USER INPUT - STUDENT AUTH]: Digits/Speech parsed as Admission No: "${admissionNo || 'none'}"\n`);

  try {
    const snapshot = await db.ref("students").once("value");
    const students = snapshot.val();
    const student = Object.values(students || {}).find(s => s.admission_no == admissionNo);

    if (student) {
      logQA(req.body.CallSid, `Entered Admission No: ${admissionNo}`, `Student match found: ${student.name}. Prompting for CGPA or Semester.`);
      sendVoiceResponse(res, `
        <Response>
          <Say ${VOICE_SETTING}>The student name is ${formatNameForSpeech(student.name)}.</Say>
          <Gather action="/api/studentDetails?admnNo=${admissionNo}" method="POST" ${GATHER_SETTINGS} numDigits="1">
            <Say ${VOICE_SETTING}>Press 1 for CGPA, or press 2 for the semester.</Say>
          </Gather>
        </Response>
      `);
    } else {
      logQA(req.body.CallSid, `Entered Admission No: ${req.body.SpeechResult || admissionNo}`, "Student not found. Redirecting to main menu.");
      sendVoiceResponse(res, `
        <Response>
          <Say ${VOICE_SETTING}>Student with admission number ${req.body.SpeechResult || admissionNo} not found.</Say>
          <Redirect>/api/voice</Redirect>
        </Response>
      `);
    }
  } catch (error) {
    sendVoiceResponse(res, `<Response><Say ${VOICE_SETTING}>An error occurred. Please try again later.</Say></Response>`);
  }
};

exports.studentDetails = async (req, res) => {
  const digit = req.body.Digits;
  const speech = req.body.SpeechResult ? req.body.SpeechResult.toLowerCase() : "";
  const admissionNo = req.query.admnNo;

  console.log(`\n[USER INPUT - STUDENT DETAILS]: Digits: "${digit || 'none'}", Speech: "${speech || 'none'}"\n`);

  try {
    const snapshot = await db.ref("students").once("value");
    const students = snapshot.val();
    const student = Object.values(students || {}).find(s => s.admission_no == admissionNo);

    if (student) {
      if (digit === "1" || speech.includes("cgpa")) {
        const answer = `The CGPA for ${formatNameForSpeech(student.name)} is ${student.cgpa || student.marks || "not available"}.`;
        logQA(req.body.CallSid, "What is the CGPA?", answer);
        
        sendVoiceResponse(res, `
          <Response>
            <Say ${VOICE_SETTING}>${answer}</Say>
            <Gather action="/api/furtherQuestions?admnNo=${admissionNo}" method="POST" ${GATHER_SETTINGS}>
              <Say ${VOICE_SETTING}>Do you have any further questions about this student? You can ask for a specific semester SGPA, fee concession, or another detail.</Say>
            </Gather>
          </Response>
        `);
      } else if (digit === "2" || speech.includes("sem")) {
        const answer = `The semester for ${formatNameForSpeech(student.name)} is ${student.semester || "not available"}.`;
        logQA(req.body.CallSid, "What is the current semester?", answer);

        sendVoiceResponse(res, `
          <Response>
            <Say ${VOICE_SETTING}>${answer}</Say>
            <Gather action="/api/furtherQuestions?admnNo=${admissionNo}" method="POST" ${GATHER_SETTINGS}>
              <Say ${VOICE_SETTING}>Do you have any further questions about this student? You can ask for a specific semester SGPA, CGPA, or fee concession.</Say>
            </Gather>
          </Response>
        `);
      } else {
        logQA(req.body.CallSid, `Student Detail Selection: ${digit || speech}`, "Invalid choice. Hanging up.");
        res.send(`
          <Response>
            <Say ${VOICE_SETTING}>Invalid choice.</Say>
            <Say ${VOICE_SETTING}>Thank you.</Say>
            <Hangup />
          </Response>
        `);
      }
    } else {
      logQA(req.body.CallSid, `Fetch details for admission no: ${admissionNo}`, "Student record lost unexpectedly.");
      res.send(`
        <Response>
          <Say ${VOICE_SETTING}>Student not found.</Say>
          <Redirect>/api/voice</Redirect>
        </Response>
      `);
    }
  } catch (error) {
    res.send(`<Response><Say ${VOICE_SETTING}>An error occurred.</Say></Response>`);
  }
};

exports.furtherQuestions = async (req, res) => {
  const speech = req.body.SpeechResult ? req.body.SpeechResult.toLowerCase() : "";
  const admissionNo = req.query.admnNo;

  console.log(`\n[USER INPUT - FURTHER QUESTIONS]: Speech: "${speech || 'none'}"\n`);

  if (!speech || speech.includes("no") || speech.includes("none")) {
    sendVoiceResponse(res, `
      <Response>
        <Say ${VOICE_SETTING}>Would you like to return to the main menu? Say yes or no.</Say>
        <Gather action="/api/returnMainMenu" method="POST" ${GATHER_SETTINGS} numDigits="1" />
      </Response>
    `);
    return;
  }

  try {
    const snapshot = await db.ref("students").once("value");
    const students = snapshot.val();
    const student = Object.values(students || {}).find(s => s.admission_no == admissionNo);

    if (student) {
      let responseSpeech = "";
      
      if (speech.includes("sgpa") || speech.includes("semester mark") || speech.includes("semester result")) {
        if (speech.includes("first") || speech.includes("1")) responseSpeech = `First semester SGPA is ${student.s1_sgpa || "not available"}.`;
        else if (speech.includes("second") || speech.includes("2")) responseSpeech = `Second semester SGPA is ${student.s2_sgpa || "not available"}.`;
        else if (speech.includes("third") || speech.includes("3")) responseSpeech = `Third semester SGPA is ${student.s3_sgpa || "not available"}.`;
        else if (speech.includes("fourth") || speech.includes("4")) responseSpeech = `Fourth semester SGPA is ${student.s4_sgpa || "not available"}.`;
        else responseSpeech = `Please specify which semester SGPA you want. We have records up to semester 4.`;
      } else if (speech.includes("cgpa")) {
         responseSpeech = `The CGPA is ${student.cgpa || "not available"}.`;
      } else if (speech.includes("fee") || speech.includes("concession")) {
         responseSpeech = `The fee concession is ${student.fee_concession || "not available"}.`;
      } else if (speech.includes("email") || speech.includes("mail")) {
         responseSpeech = `The email is ${student.email || "not available"}.`;
      } else if (speech.includes("phone") || speech.includes("mobile")) {
         // Format mobile number with spaces so it's read digit by digit
         const formattedMobile = student.mobile_no ? student.mobile_no.toString().split('').join(' ') : "not available";
         responseSpeech = `The mobile number is ${formattedMobile}.`;
      } else {
         responseSpeech = "I am sorry, I do not have that specific information.";
      }

      logQA(req.body.CallSid, speech, responseSpeech);

      sendVoiceResponse(res, `
        <Response>
          <Say ${VOICE_SETTING}>${responseSpeech}</Say>
          <Gather action="/api/furtherQuestions?admnNo=${admissionNo}" method="POST" ${GATHER_SETTINGS}>
            <Say ${VOICE_SETTING}>Do you have any other questions?</Say>
          </Gather>
        </Response>
      `);
    } else {
      sendVoiceResponse(res, `
        <Response>
          <Say ${VOICE_SETTING}>Student information lost. Thank you.</Say>
          <Hangup />
        </Response>
      `);
    }
  } catch (error) {
    sendVoiceResponse(res, `<Response><Say ${VOICE_SETTING}>An error occurred while finding the answer.</Say><Hangup /></Response>`);
  }
};

exports.returnMainMenu = async (req, res) => {
  const digit = req.body.Digits;
  const speech = req.body.SpeechResult ? req.body.SpeechResult.toLowerCase() : "";

  console.log(`\n[USER INPUT - RETURN TO MAIN MENU]: Digits: "${digit || 'none'}", Speech: "${speech || 'none'}"\n`);

  if (digit === "1" || speech.includes("yes") || speech.includes("main menu")) {
    logQA(req.body.CallSid, `Return to Main Menu: ${digit || speech}`, "Returned to Main Menu.");
    sendVoiceResponse(res, `
      <Response>
        <Say ${VOICE_SETTING}>Returning to the main menu.</Say>
        <Redirect>/api/voice</Redirect>
      </Response>
    `);
  } else {
    logQA(req.body.CallSid, `Return to Main Menu: ${digit || speech || 'no'}`, "Declined to return. Call hanging up naturally.");
    await sendSummarySMS(req.body.CallSid, req.body.From);
    sendVoiceResponse(res, `
      <Response>
        <Say ${VOICE_SETTING}>Thank you for calling. Goodbye.</Say>
        <Hangup />
      </Response>
    `);
  }
};

exports.deptDetails = async (req, res) => {
  const digit = req.body.Digits;
  const speech = req.body.SpeechResult ? req.body.SpeechResult.toLowerCase() : "";

  console.log(`\n[USER INPUT - DEPT DETAILS]: Digits: "${digit || 'none'}", Speech: "${speech || 'none'}"\n`);

  let feeAmount = "";
  if (digit === "1" || speech.includes("merit")) {
    feeAmount = "35000 rupees";
  } else if (digit === "2" || speech.includes("nri") || speech.includes("n r i")) {
    feeAmount = "100000 rupees";
  } else if (digit === "3" || speech.includes("management")) {
    feeAmount = "65000 rupees";
  } else {
    logQA(req.body.CallSid, `Fee Detail Query: ${digit || speech}`, "Invalid fee type selected.");
    sendVoiceResponse(res, `
      <Response>
        <Say ${VOICE_SETTING}>Invalid selection.</Say>
        <Say ${VOICE_SETTING}>Thank you.</Say>
        <Hangup />
      </Response>
    `);
    return;
  }

  logQA(req.body.CallSid, `Fee Detail Query: ${digit || speech}`, `The requested fee is ${feeAmount}.`);
  await sendSummarySMS(req.body.CallSid, req.body.From);

  sendVoiceResponse(res, `
    <Response>
      <Say ${VOICE_SETTING}>The requested fee is ${feeAmount}.</Say>
      <Say ${VOICE_SETTING}>Thank you.</Say>
      <Hangup />
    </Response>
  `);
};

exports.callStatus = async (req, res) => {
  const callStatus = req.body.CallStatus;
  const callSid = req.body.CallSid;
  const callerNumber = req.body.From;

  console.log(`\n[WEBHOOK ALERTS] CallStatus Webhook Fired: ${callStatus} for ${callerNumber}\n`);

  // We only care when the call completes
  if (callStatus === "completed") {
    await sendSummarySMS(callSid, callerNumber);
  }

  res.sendStatus(200);
};

exports.testSMS = async (req, res) => {
  const toParam = req.query.to || "+18302228555";
  try {
    const message = await twilioClient.messages.create({
      body: "Test SMS from IVR System",
      from: process.env.TWILIO_PHONE_NUMBER || "+18302228555",
      to: toParam
    });
    res.json({ success: true, messageSid: message.sid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, detailed: err });
  }
};
