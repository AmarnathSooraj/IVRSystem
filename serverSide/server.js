const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");

dotenv.config();

const studentRoutes = require("./routes/studentRoutes");
const db = require("./config/firebase");
const {
  jwt: { AccessToken },
  Twilio,
} = require("twilio");
const VoiceGrant = AccessToken.VoiceGrant;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get("/api/token", (req, res) => {
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.API_KEY,
    process.env.API_SECRET,
    { identity: "react-user" },
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID,
  });

  token.addGrant(voiceGrant);

  res.send({
    token: token.toJwt(),
  });
});


app.post("/api/voice", (req, res) => {
  res.type("text/xml");
  res.send(`
    <Response>
      <Say>Welcome to College of Engineering vadakara. How can I help you today?</Say>
      <Gather numDigits="1" action="/api/menu">
        <Say>Press 1 for marks, or press 2 for fees.</Say>
      </Gather>
      <Say>We didn't receive any input. Goodbye.</Say>
    </Response>
    `);
});

// app.post("/api/menu", (req, res) => {
//   const digit = req.body.Digits;
//   res.type("text/xml");

//   if (digit === "1") {
//     res.send(`
//       <Response>
//         <Say>Please enter your admission number followed by the hash key.</Say>
//         <Gather action="/api/marks" method="POST" finishOnKey="#">
//           <Say>Waiting for your admission number.</Say>
//         </Gather>
//       </Response>
//     `);
//   } else if (digit === "2") {
//     res.send(`
//       <Response>
//         <Say>Please enter your admission number followed by the hash key.</Say>
//         <Gather action="/api/fees" method="POST" finishOnKey="#">
//           <Say>Waiting for your admission number.</Say>
//         </Gather>
//       </Response>
//     `);
//   } else {
//     res.send(`
//       <Response>
//         <Say>Invalid option. Returning to the main menu.</Say>
//         <Redirect>/api/voice</Redirect>
//       </Response>
//     `);
//   }
// });

// app.post("/api/marks", async (req, res) => {
//   const admissionNo = req.body.Digits;
//   res.type("text/xml");
//   try {
//     const snapshot = await db.ref("students").once("value");
//     const students = snapshot.val();
//     const student = Object.values(students || {}).find(s => s.admission_no === admissionNo);

//     if (student) {
//       res.send(`
//         <Response>
//           <Say>The marks for student ${student.name} are ${student.marks}.</Say>
//           <Say>Thank you for calling. Goodbye.</Say>
//         </Response>
//       `);
//     } else {
//       res.send(`
//         <Response>
//           <Say>Student with admission number ${admissionNo} not found.</Say>
//           <Redirect>/api/voice</Redirect>
//         </Response>
//       `);
//     }
//   } catch (error) {
//     res.send(`<Response><Say>An error occurred. Please try again later.</Say></Response>`);
//   }
// });

// app.post("/api/fees", async (req, res) => {
//   const admissionNo = req.body.Digits;
//   res.type("text/xml");
//   try {
//     const snapshot = await db.ref("students").once("value");
//     const students = snapshot.val();
//     const student = Object.values(students || {}).find(s => s.admission_no === admissionNo);

//     if (student) {
//       res.send(`
//         <Response>
//           <Say>The fee status for student ${student.name} is ${student.fees}.</Say>
//           <Say>Thank you for calling. Goodbye.</Say>
//         </Response>
//       `);
//     } else {
//       res.send(`
//         <Response>
//           <Say>Student with admission number ${admissionNo} not found.</Say>
//           <Redirect>/api/voice</Redirect>
//         </Response>
//       `);
//     }
//   } catch (error) {
//     res.send(`<Response><Say>An error occurred. Please try again later.</Say></Response>`);
//   }
// });


// Student routes


app.use("/api/students", studentRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
