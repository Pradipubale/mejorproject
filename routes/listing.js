const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");

const upload=multer({storage});

// ---------------------- Validation Middleware ----------------------

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errmsg = error.details.map(el => el.message).join(", ");
    return next(new ExpressError(errmsg, 400)); // pass to error handler
  }
  next();
};

// ---------------------- Routes ----------------------

// Get all listings
router.get("/", wrapAsync(listingController.index));

// New listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show listing
router.get("/:id", wrapAsync(listingController.showListing));

// Create listing
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"), // Handles image upload
  validateListing,                 // Validates form data
  wrapAsync(listingController.createListing) // Calls your controller
);

// Edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// Update listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"), // Add this if you also want to update the image
  validateListing,
  wrapAsync(listingController.updateListing)
);

// Delete listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);

// Search route
// (Add your search route here when needed)

module.exports = router;
