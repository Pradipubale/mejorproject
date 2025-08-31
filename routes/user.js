const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

// SIGNUP ROUTE
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success");

      // Redirect to the saved URL or default listings page
      const redirectUrl = res.locals.redirectUrl || req.session.redirectUrl || "/listings";
      delete req.session.redirectUrl; // Clear after using
      res.redirect(redirectUrl);
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup");
  }
});

// LOGIN ROUTES
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),

  async(req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");

    // Redirect to the saved URL or default listings page
    const redirectUrl = res.locals.redirectUrl || req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl; // Clear after using
    res.redirect(redirectUrl);
  }
);

// LOGOUT ROUTE
router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);

    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
