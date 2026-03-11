const express = require("express");
const db = require("../config/firebase");

const router = express.Router();

/* Get All Courses/Fee Details */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.ref("course").once("value");
    const courses = snapshot.val();
    if (!courses) return res.json([]);
    
    // If it's an object (Firebase often returns objects for nodes), convert to array
    const coursesArray = typeof courses === 'object' && !Array.isArray(courses) 
      ? Object.keys(courses).map(key => ({ id: key, ...courses[key] }))
      : courses;

    res.json(coursesArray);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

/* Update Course/Fee Details */
router.put("/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const updateData = req.body;
    
    // Ensure we don't accidentally overwrite the KEY if provided in body
    if (updateData.KEY && updateData.KEY !== key) {
        delete updateData.KEY;
    }

    await db.ref("course/" + key).update(updateData);
    res.json({ message: "Course updated successfully", key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
