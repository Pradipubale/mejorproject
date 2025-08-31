const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const Review = require("../models/review");

// ✅ Create a new review
router.post("/", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const review = new Review(req.body.review);
    review.author = req.user._id; // user must be logged in

    await review.save();

    // link review to listing
    listing.reviews.push(review);
    await listing.save({ validateModifiedOnly: true });

    req.flash("success", "Review added successfully!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while adding the review!");
    res.redirect("/listings");
  }
});

// ✅ Delete a review
router.delete("/:reviewId", async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    // remove review from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // delete review itself
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while deleting the review!");
    res.redirect("/listings");
  }
});

module.exports = router;
