const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");

dotenv.config();

const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const ivrRoutes = require("./routes/ivrRoutes");
const db = require("./config/firebase");
const {
  jwt: { AccessToken },
  Twilio,
} = require("twilio");
const VoiceGrant = AccessToken.VoiceGrant;
const transporter = require("./config/emailConfig");
const crypto = require("crypto");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);

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

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_ACCOUNT_TOKEN
);

app.get("/api/twilio/stats", async (req, res) => {
  try {
    // Active Calls (in progress or ringing)
    const activeCalls = await twilioClient.calls.list({ status: "in-progress", limit: 50 });
    const ringingCalls = await twilioClient.calls.list({ status: "ringing", limit: 50 });
    const totalActive = activeCalls.length + ringingCalls.length;

    // Calls Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCalls = await twilioClient.calls.list({ startTimeAfter: startOfDay, limit: 1000 });
    const totalToday = todayCalls.length;

    // Calculate Completion Rate and Average Duration
    let totalDuration = 0;
    let completedCalls = 0;

    todayCalls.forEach(call => {
      if (call.status === "completed") {
        completedCalls++;
        if (call.duration) {
          totalDuration += parseInt(call.duration, 10);
        }
      }
    });

    const completionRate = totalToday > 0 ? Math.round((completedCalls / totalToday) * 100) : 0;
    const avgDuration = completedCalls > 0 ? Math.round(totalDuration / completedCalls) : 0;

    // Recent Logs (top 5 or as requested)
    const logLimit = parseInt(req.query.limit) || 5;
    const recentLogs = await twilioClient.calls.list({ limit: logLimit });
    const formattedLogs = recentLogs.map(call => ({
      time: new Date(call.startTime || call.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      callerId: call.from,
      action: call.direction === 'inbound' ? 'Incoming Call' : 'Outgoing Call',
      status: call.status
    }));

    res.json({
      activeCalls: totalActive,
      callsToday: totalToday,
      avgDuration: avgDuration,
      completionRate: completionRate,
      recentLogs: formattedLogs
    });

  } catch (error) {
    console.error("Error fetching Twilio stats:", error);
    res.status(500).json({ error: "Failed to fetch Twilio statistics" });
  }
});

app.use("/api", ivrRoutes); app.use("/api/students", studentRoutes);

// --- Auth & Admin Flow Routes ---

// 1. Request Admin Access
app.post("/api/auth/request-access", async (req, res) => {
  const { name, email, phone, origin } = req.body;

  if (!name || !email || !phone || !origin) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const requestId = crypto.randomUUID();
    const newRequest = {
      name,
      email,
      phone,
      status: "pending",
      timestamp: Date.now()
    };

    // Save request to Firebase RTDB
    await db.ref(`adminRequests/${requestId}`).set(newRequest);

    // Send email to the head admin
    // Using the explicit frontend origin to bypass Vite proxy localhost limits
    const approvalLink = `${origin}/api/auth/approve/${requestId}`;

    const mailOptions = {
      from: "collegeivr5@gmail.com",
      to: "collegeivr5@gmail.com", // Sending to the admin
      subject: "New Admin Access Request - College IVR",
      html: `
        <h2>New Admin Sandbox Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <br/>
        <a href="${approvalLink}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
          Approve Request & Send Password
        </a>
        <br/><br/>
        <p><small>Clicking approve will automatically generate a password and email it back to the requested user.</small></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Request sent successfully to admin." });
  } catch (error) {
    console.error("Error requesting access:", error);
    res.status(500).json({ error: "Failed to process request." });
  }
});

// 2. Approve Request (Accessed via Email Link)
app.get("/api/auth/approve/:requestId", async (req, res) => {
  const { requestId } = req.params;

  try {
    const snapshot = await db.ref(`adminRequests/${requestId}`).once("value");
    const requestData = snapshot.val();

    if (!requestData) {
      return res.status(404).send("<h3>Request not found.</h3>");
    }

    if (requestData.status === "approved") {
      return res.status(400).send("<h3>This request has already been approved!</h3>");
    }

    // Generate a secure random password
    const generatedPassword = crypto.randomBytes(4).toString("hex"); // e.g., 'a1b2c3d4'
    const emailKey = requestData.email.replace(/[.#$\[\]]/g, "_"); // Firebase keys cannot contain certain chars

    // Save as official admin
    await db.ref(`admins/${emailKey}`).set({
      name: requestData.name,
      email: requestData.email,
      phone: requestData.phone,
      password: generatedPassword, // Storing raw for simplicity in this demo, real systems should hash!
    });

    // Mark request as approved
    await db.ref(`adminRequests/${requestId}`).update({ status: "approved" });

    // Email the user back their credentials
    const mailOptions = {
      from: "collegeivr5@gmail.com",
      to: requestData.email,
      subject: "Your IVR Admin Access is Approved!",
      html: `
        <h2>Welcome to the College IVR System</h2>
        <p>Your request for admin access has been approved.</p>
        <p>Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${requestData.email}</p>
          <p><strong>Password:</strong> ${generatedPassword}</p>
        </div>
        <p>Please log in at the dashboard.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send(`
      <div style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h2 style="color: #10B981;">Access Approved Successfully! ✓</h2>
        <p>The user has been added to the system and an email was dispatched containing their password.</p>
      </div>
    `);
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).send("<h3>Failed to approve request. Please check server logs.</h3>");
  }
});

// 3. Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const emailKey = email.replace(/[.#$\[\]]/g, "_");
    const snapshot = await db.ref(`admins/${emailKey}`).once("value");
    const adminData = snapshot.val();

    if (!adminData || adminData.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Success
    res.status(200).json({
      message: "Login successful",
      user: { name: adminData.name, email: adminData.email }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
