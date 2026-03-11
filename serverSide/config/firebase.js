const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN);


serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.database();

module.exports = db;
