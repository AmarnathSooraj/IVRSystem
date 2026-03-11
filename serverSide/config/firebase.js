const admin = require("firebase-admin");
const path = require("path");

let serviceAccount;
if (process.env.FIREBASE_ADMIN) {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN);
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
} else if (process.env.FIREBASE_ADMIN_PATH) {
  const absolutePath = path.resolve(__dirname, "..", process.env.FIREBASE_ADMIN_PATH);
  serviceAccount = require(absolutePath);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.database();

module.exports = db;
