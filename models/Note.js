// Require mongoose
let mongoose = require("mongoose");
// Create a schema class
let Schema = mongoose.Schema;

// make the schema for the comments
let NoteSchema = new Schema({
  body: {
    type: String, 
  }, 
  createdAt: {
		type: Date, 
		default: Date.now
	}
});

// Remember, Mongoose will automatically save the ObjectIds of the notes
// These ids are referred to in the Article model


let Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;