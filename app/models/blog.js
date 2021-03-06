//load the things we need
var mongoose = require('mongoose');


//define the schema for our blog post model
var blogSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    title: String,
    message: String,
    date: String,
    datesort: Date,
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment'}],
});


//create the model for users and expose it to our app
module.exports = mongoose.model('Blog', blogSchema);