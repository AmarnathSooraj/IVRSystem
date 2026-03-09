const express = require("express");
const db = require("../config/firebase");

const router = express.Router();

/* Add Student */
router.post("/add", async (req, res) => {
  try {
    const student = req.body;
    const newRef = db.ref("students").push();
    await newRef.set(student);
    res.json({ message: "Student added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get All Students */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.ref("students").once("value");
    const students = snapshot.val();
    if (!students) return res.json([]);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get Student by Admission No (For IVR) */
router.get("/:admission_no", async (req, res) => {
  try {
    const admissionNo = req.params.admission_no;
    const snapshot = await db.ref("students").once("value");
    const students = snapshot.val();

    if (!students) return res.json({ message: "Student not found" });

    const result = Object.values(students).find(
      (s) => s.admission_no === admissionNo,
    );

    if (result) {
      res.json(result);
    } else {
      res.json({ message: "Student not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
