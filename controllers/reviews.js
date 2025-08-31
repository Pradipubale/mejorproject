const Listing=require("../models/listing");
const Review=require("../models/review");


module.exports.createReview=async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // Create new review
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id; // Store the logged-in user as author
  await newReview.save();

  // Add review to listing
  listing.reviews.push(newReview._id);
  await listing.save();

  req.flash("success", "Review added!");
  res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview=async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
}