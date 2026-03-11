const db = require("../config/firebase");
const students = require("../students.json");

async function uploadStudents() {
  try {
    for (const student of students) {
      if (!student.admission_no) {
        console.log("Skipped student (no admission_no)");
        continue;
      }

      await db.ref("students/" + student.admission_no).set(student);

      console.log("Uploaded:", student.admission_no);
    }

    console.log("✅ All students uploaded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

uploadStudents();
