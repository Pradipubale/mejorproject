const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {       // Add this field
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

// Apply passport-local-mongoose plugin to schema
// This will automatically handle hashing the password, adding username, and authentication methods
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema); // Model name must be "User"
