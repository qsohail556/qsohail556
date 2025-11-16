const Listing = require("./models/listing.js")
const Review = require("./models/review")
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema , reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req ,res ,next) => {
    if(!req.isAuthenticated()){
       req.session.redirectUrl = req.originalUrl;
       req.flash("error" , "you must be loggin");
       return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req ,res ,next) => {
    if(req.session.redirectUrl){
       res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req ,res ,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals (res.locals.currUser._id)){
       req.flash("error" , "you are not the owner of this listing");
       return res.redirect(`/listings/${id}`);
    }
    next();
}   

module.exports.isReviewAuthor = async(req ,res ,next) => {
    let {id , reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Cannot find that review!");
        return res.redirect(`/listings/${id}`);
    }
    if(!review.author.equals (req.user._id)){
       req.flash("error" , "you are not the author of this review");
       return res.redirect(`/listings/${id}`);
    }
    next(); 
} 


module.exports.validateListing = (req, res, next) => {
    if (!req.body || !req.body.listing) {
        throw new ExpressError(400, "Invalid request: 'listing' data is missing");
    }

    // ✅ Validate only the 'listing' part
    const { error } = listingSchema.validate({ listing: req.body.listing });
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


module.exports.validateReview = (req, res, next) => {
    if (!req.body || !req.body.review) {
        throw new ExpressError(400, "Invalid request: 'review' is required");
    }

    const {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(", "); 
        throw new ExpressError(400 , errMsg); 
    }else{
        next();
    }
}; 