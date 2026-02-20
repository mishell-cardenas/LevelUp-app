import "dotenv/config";
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "levelup";

async function seed() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in .env file");
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);

    // ============ USERS ============
    await db.collection("users").deleteMany({});
    await db.collection("users").insertMany([
      { username: "jordan", createdAt: new Date() },
      { username: "alex", createdAt: new Date() },
      { username: "sam", createdAt: new Date() },
    ]);
    console.log("✅ Created users");

    // ============ GAMES ============
    await db.collection("games").deleteMany({});
    await db.collection("games").insertMany([
      {
        steamId: "1245620",
        name: "Elden Ring",
        headerImage:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
        description:
          "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace.",
        genres: ["Action", "RPG"],
        cachedAt: new Date(),
      },
      {
        steamId: "1086940",
        name: "Baldur's Gate 3",
        headerImage:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
        description: "Gather your party and return to the Forgotten Realms.",
        genres: ["RPG", "Strategy"],
        cachedAt: new Date(),
      },
      {
        steamId: "413150",
        name: "Stardew Valley",
        headerImage:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg",
        description: "Build the farm of your dreams.",
        genres: ["Simulation", "RPG"],
        cachedAt: new Date(),
      },
      {
        steamId: "367520",
        name: "Hollow Knight",
        headerImage:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg",
        description: "Forge your own path in Hollow Knight!",
        genres: ["Action", "Indie"],
        cachedAt: new Date(),
      },
    ]);
    console.log("✅ Created games");

    // ============ REVIEWS ============
    await db.collection("reviews").deleteMany({});
    const reviewResult = await db.collection("reviews").insertMany([
      {
        steamId: "1245620",
        username: "alex",
        rating: 5,
        comment: "Masterpiece. 200 hours in and still finding new areas.",
        createdAt: new Date("2024-01-20"),
      },
      {
        steamId: "1245620",
        username: "sam",
        rating: 4,
        comment: "Amazing but brutally difficult. Not for everyone.",
        createdAt: new Date("2024-01-18"),
      },
      {
        steamId: "1245620",
        username: "jordan",
        rating: 5,
        comment: "Best open world I have ever explored.",
        createdAt: new Date("2024-02-05"),
      },
      {
        steamId: "1086940",
        username: "jordan",
        rating: 5,
        comment: "Best RPG of the decade. The choices actually matter.",
        createdAt: new Date("2024-01-12"),
      },
      {
        steamId: "1086940",
        username: "alex",
        rating: 4,
        comment: "Incredible but very long. Set aside 100+ hours.",
        createdAt: new Date("2024-01-08"),
      },
      {
        steamId: "413150",
        username: "jordan",
        rating: 5,
        comment: "Perfect comfort game. So relaxing.",
        createdAt: new Date("2023-09-20"),
      },
      {
        steamId: "413150",
        username: "sam",
        rating: 5,
        comment: "Accidentally played until 3am. Multiple times.",
        createdAt: new Date("2023-08-15"),
      },
      {
        steamId: "367520",
        username: "sam",
        rating: 5,
        comment: "Beautiful, haunting, and incredibly tight gameplay.",
        createdAt: new Date("2023-07-10"),
      },
    ]);
    console.log(`✅ Created reviews (${reviewResult.insertedCount} documents)`);

    // ============ LIBRARY ============
    await db.collection("library").deleteMany({});
    const libraryResult = await db.collection("library").insertMany([
      {
        username: "jordan",
        steamId: "1245620",
        gameName: "Elden Ring",
        headerImage:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
        status: "Playing",
        platform: "Steam",
        priority: 1,
        progressPercent: 45,
        dropReason: null,
        dateAdded: new Date("2024-01-15"),
        dateLastPlayed: new Date("2024-02-10"),
      },
      {
        username: "jordan",
        steamId: "1086940",
        gameName: "Baldur's Gate 3",
        headerImage:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
        status: "On Hold",
        platform: "Steam",
        priority: 2,
        progressPercent: 30,
        dropReason: "Got distracted by Elden Ring",
        dateAdded: new Date("2023-12-01"),
        dateLastPlayed: new Date("2024-01-10"),
      },
      {
        username: "jordan",
        steamId: "413150",
        gameName: "Stardew Valley",
        headerImage:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg",
        status: "Completed",
        platform: "Switch",
        priority: null,
        progressPercent: 100,
        dropReason: null,
        dateAdded: new Date("2023-06-01"),
        dateLastPlayed: new Date("2023-09-15"),
      },
    ]);
    console.log("✅ Created library");

    // ============ JOURNAL ============
    await db.collection("journal").deleteMany({});
    const libraryIds = Object.values(libraryResult.insertedIds);
    await db.collection("journal").insertMany([
      {
        libraryId: libraryIds[0],
        whereILeftOff: "Just beat Margit, at Stormveil Castle entrance",
        currentObjectives: "Explore Stormveil Castle, find Godrick",
        importantDetails: "Have +3 Uchigatana, need more vigor",
        decisionsMade: "Killed Patches, probably shouldnt have",
        sessionRating: 5,
        hoursPlayed: 3,
        createdAt: new Date("2024-02-10"),
      },
      {
        libraryId: libraryIds[0],
        whereILeftOff: "Stuck on Margit",
        currentObjectives: "Beat Margit or go level up",
        importantDetails: "Found Rogier who can help",
        decisionsMade: "Summoned wolves for help",
        sessionRating: 3,
        hoursPlayed: 2,
        createdAt: new Date("2024-02-08"),
      },
      {
        libraryId: libraryIds[1],
        whereILeftOff: "Druid Grove, talking to Kagha",
        currentObjectives: "Decide whether to side with druids or tieflings",
        importantDetails:
          "Shadowheart seems suspicious, Gale wants magic items",
        decisionsMade: "Recruited everyone I could find",
        sessionRating: 4,
        hoursPlayed: 4,
        createdAt: new Date("2024-01-10"),
      },
    ]);
    console.log("✅ Created journal");

    // ============ INDEXES ============
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    await db.collection("library").createIndex({ username: 1 });
    await db
      .collection("library")
      .createIndex({ username: 1, steamId: 1 }, { unique: true });
    await db.collection("journal").createIndex({ libraryId: 1 });
    await db.collection("games").createIndex({ steamId: 1 }, { unique: true });
    await db.collection("reviews").createIndex({ steamId: 1 });
    console.log("✅ Created indexes");

    console.log("\n🎮 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
  }
}

seed();
