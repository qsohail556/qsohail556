const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:      String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  Reviews:[
    {
      type: Schema.Types.ObjectId,
      ref:"Review",
    },
  ],

  owner: {
    type : Schema.Types.ObjectId,
    ref : "User",
  }

});

listingSchema.post("findOneAndDelete" , async(listing) => {
  if(listing && listing.Reviews.length) {                         // Also added a check for an empty array
    await Review.deleteMany({_id: {$in : listing.Reviews}}) 
  };    
})  


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;