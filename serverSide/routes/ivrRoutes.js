const express = require("express");
const router = express.Router();
const ivrController = require("../controllers/ivrController");

// The /api prefix is applied in server.js
router.post("/voice", ivrController.mainMenu);
router.post("/menu", ivrController.handleMenu);
router.post("/studentAuth", ivrController.studentAuth);
router.post("/studentDetails", ivrController.studentDetails);
router.post("/furtherQuestions", ivrController.furtherQuestions);
router.post("/returnMainMenu", ivrController.returnMainMenu);
router.post("/deptDetails", ivrController.deptDetails);
router.post("/call-status", ivrController.callStatus);
router.get("/stream-logs", ivrController.streamLogs);
router.get("/sms-test", ivrController.testSMS);

module.exports = router;
