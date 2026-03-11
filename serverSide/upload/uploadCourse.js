require("dotenv").config();
const db = require("../config/firebase");
const courses = require("./course.json");

async function uploadCourses() {
  try {
    for (const course of courses) {
      if (!course.KEY) {
        console.log("Skipped course (no KEY property)");
        continue;
      }

      // Upload to 'Course' collection/path with 'KEY' as the document key
      await db.ref("course/" + course.KEY).set(course);

      console.log("Uploaded course:", course.KEY);
    }

    console.log("✅ All courses uploaded successfully to 'Course' path!");
    process.exit();
  } catch (error) {
    console.error("❌ Error uploading courses:", error);
    process.exit(1);
  }
}

uploadCourses();
