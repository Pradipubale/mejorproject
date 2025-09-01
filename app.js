if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Routes
const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");
const users = require("./routes/user.js");

// MongoDB Atlas URL from .env
const dbUrl = process.env.ATLASDB_URL;
const PORT = process.env.PORT || 8080;

// MongoDB Connection
async function main() {
  try {
    await mongoose.connect(dbUrl, {
      tls: true, // Ensures secure connection for Atlas
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}
main();

// View Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Session options
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // 1 day
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
      secret: process.env.SECRET,

  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Root route
app.get("/", (req, res) => {
  res.render("/listings");
});

// Routes
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", users);

// Demo user for testing
app.get("/demouser", async (req, res) => {
  try {
    let fakeUser = new User({
      email: "student@gmail.com",
      username: "delta-student",
    });
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
  } catch (err) {
    res.send(err.message);
  }
});

// Error handler
// Error handler
app.use((err, req, res, next) => {
  // ✅ Force numeric status code
  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  const message = err.message || "Something went wrong!";

  res.status(statusCode).render("error.ejs", { err: { statusCode, message } });
});


// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
