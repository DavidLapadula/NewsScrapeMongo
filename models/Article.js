// require mongoose library and instatiate schema class
let mongoose = require('mongoose'); 
let Schema = mongoose.Schema; 

// make new article schema
let ArticleSchema = new Schema ({
    
    // title  links must be a string
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    },
    desc: {
      type: String,
      required: true
    },
    imgLink: {
      type: String,
      required: true
    },
    saved: {
      type: Boolean,
      default: false
    },
    // Save the ObjectId. ref is for the comment model for each article
    comments: [{
      type: Schema.Types.ObjectId,
      ref: "Note"
    }]
  });
  
  // Create the Article model with the ArticleSchema
  let Article = mongoose.model("Article", ArticleSchema);
  
  // Export the model
  module.exports = Article; 