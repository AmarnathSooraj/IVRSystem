require("dotenv").config();
const db = require("../config/firebase");
const placementsData = require("./placement.json");

const uploadPlacements = async () => {
  try {
    const placementsRef = db.ref("placements");

    // Iterating through the placement data and setting each entry using its "KEY"
    const uploadPromises = placementsData.map(async (placement) => {
      if (placement.KEY) {
        await placementsRef.child(placement.KEY).set(placement);
        console.log(`Uploaded placement for: ${placement.KEY}`);
      } else {
        console.warn("Skipping placement entry without a KEY:", placement);
      }
    });

    await Promise.all(uploadPromises);
    console.log("All placement details uploaded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error uploading placements:", error);
    process.exit(1);
  }
};

uploadPlacements();
