//load the things we need
var mongoose = require('mongoose');


//define the schema for our blog post model
var blogcommentSchema = mongoose.Schema({
	parentid: {type: String, ref: 'Blog'},
	userid: String,
	username: String,
	message: String,
	datefull: Date,
	date: String,
});


//create the model for users and expose it to our app
module.exports = mongoose.model('BlogComment', blogcommentSchema);