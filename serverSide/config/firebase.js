const admin = require("firebase-admin");
const serviceAccount = require("../firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.database();

module.exports = db;
