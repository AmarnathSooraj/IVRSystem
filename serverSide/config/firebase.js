const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.database();

module.exports = db;
