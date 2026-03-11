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


app.use("/api/students", studentRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
