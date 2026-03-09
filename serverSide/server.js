const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");

dotenv.config();

const studentRoutes = require("./routes/studentRoutes");
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
app.get("/token", (req, res) => {
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


app.post("/incoming", (req, res) => {
  res.type("text/xml");
  res.send(`
    <Response>
      <Say>Welcome to College of Engineering vadakara, What can I help for you</Say>
      <Gather numDigits="1" action="/menu">
      <Say>Press 1 for marks</Say>
      <Say>Press 2 for fees</Say>
   </Gather>
    </Response>
    `);
  console.log(req);
});


// Student routes
app.use("/students", studentRoutes);

// Serve React frontend
const clientDist = path.join(__dirname, "../clientSide/dist");
app.use(express.static(clientDist));
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
