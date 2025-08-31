const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing");
const User = require("../models/user");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");

  // Clear existing data
  await Listing.deleteMany({});
  await User.deleteMany({});

  // Create a demo user as owner
  const demoUser = new User({ username: "demo-user", email: "demo@example.com" });
  await User.register(demoUser, "helloworld");
  console.log("Demo user created:", demoUser.username);

  // Add owner to each listing
  const listingsWithOwner = initData.data.map((listing) => ({
    ...listing,
    owner: demoUser._id
  }));

  // Insert listings
  await Listing.insertMany(listingsWithOwner);
  console.log("Database initialized with sample listings.");

  mongoose.connection.close();
}

main().catch((err) => console.error(err));
