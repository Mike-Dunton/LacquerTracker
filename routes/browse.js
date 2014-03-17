var Polish = require('../app/models/polish');
var User = require('../app/models/user');
var Review = require('../app/models/review');
var Photo = require('../app/models/photo');
var UserPhoto = require('../app/models/userphoto');
var Blog = require('../app/models/blog');
var BlogComment = require('../app/models/blogcomment');
var ForumPost = require('../app/models/forumpost');
var ForumComment = require('../app/models/forumcomment');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var nodemailer = require('nodemailer');
var sanitizer = require('sanitizer');
var markdown = require('markdown').markdown;
var _ = require('lodash');
var simple_recaptcha = require('simple-recaptcha');
var pagedown = require("pagedown");
var safeConverter = pagedown.getSanitizingConverter();


module.exports = function(app, passport) {


app.get('/browse', function(req, res) {
    Polish.find().distinct('brand', function(error, brands) {
        var allbrands = brands;

        data = {};
        data.title = 'Browse - Lacquer Tracker';
        data.brands = allbrands;
        data.browsekeywords = req.body.keywords;
        data.browsebrand = req.body.brand;
        data.browsecolorcat = req.body.colorcat;
        data.browsetype = req.body.type;
        data.browseindie = req.body.indie;

        Polish.find({})
        .sort({dateupdated: -1})
        .limit(10)
        .exec(function (err, polishes) {
            var statuses = [];
            if (req.isAuthenticated()) {

                data.browseowned = req.body.owned;
                data.browsewanted = req.body.wanted;

                for (i=0; i < polishes.length; i++) {
                    if (req.user.ownedpolish.indexOf(polishes[i].id) > -1) {
                        statuses.push("owned");
                    } else if (req.user.wantedpolish.indexOf(polishes[i].id) > -1) {
                        statuses.push("wanted");
                    } else {
                        statuses.push("");
                    }
                }
                var returnedpolish = polishes;
                data.polishes = returnedpolish;
                data.status = statuses;
                res.render('browse.ejs', data);
            } else {
                var returnedpolish = polishes;
                data.polishes = returnedpolish;
                data.status = statuses;
                res.render('browse.ejs', data);
            }
        });
    })
});



app.post('/browse', function(req, res) {
    Polish.find().distinct('brand', function(error, brands) {
        var allbrands = brands;

        data = {};
        data.title = 'Browse - Lacquer Tracker';
        data.brands = allbrands;
        data.browsekeywords = req.body.keywords;
        data.browsebrand = req.body.brand;
        data.browsecolorcat = req.body.colorcat;
        data.browsetype = req.body.type;
        data.browseindie = req.body.indie;


        var filterOptions = _.transform(req.body, function(result, value, key) {
            result[key] = new RegExp(value.replace(/[^A-Za-z 0-9!']/g,''), "i");
        });

        var polishkeys = _.keys(Polish.schema.paths);

        var polishFilter = _.pick(filterOptions, polishkeys);

        var skipto = req.params.page * 100;

        Polish.find(polishFilter, function(err, polishes) {

            var returnedpolish = [];
            var statuses = [];

            if (req.isAuthenticated()) {

                data.browseowned = req.body.owned;
                data.browsewanted = req.body.wanted;

                if (req.body.owned === "on" && req.body.wanted === "on") {
                    for (i=0; i < polishes.length; i++) {
                        if (req.user.ownedpolish.indexOf(polishes[i].id) > -1) {
                            returnedpolish.push(polishes[i]);
                            statuses.push("owned");
                        } else if (req.user.wantedpolish.indexOf(polishes[i].id) > -1) {
                            returnedpolish.push(polishes[i]);
                            statuses.push("wanted");
                        }
                    }
                    data.polishes = returnedpolish;
                    data.status = statuses;
                    res.render('browse.ejs', data);
                } else if (req.body.owned === "on") {
                    for (i=0; i < polishes.length; i++) {
                        if (req.user.ownedpolish.indexOf(polishes[i].id) > -1) {
                            returnedpolish.push(polishes[i]);
                            statuses.push("owned");
                        }
                    }
                    data.polishes = returnedpolish;
                    data.status = statuses;
                    res.render('browse.ejs', data);
                } else if (req.body.wanted === "on") {
                    for (i=0; i < polishes.length; i++) {
                        if (req.user.wantedpolish.indexOf(polishes[i].id) > -1) {
                            returnedpolish.push(polishes[i]);
                            statuses.push("wanted");
                        }
                    }
                    data.polishes = returnedpolish;
                    data.status = statuses;
                    res.render('browse.ejs', data);
                } else {
                    for (i=0; i < polishes.length; i++) {
                        if (req.user.ownedpolish.indexOf(polishes[i].id) > -1) {
                            statuses.push("owned");
                        } else if (req.user.wantedpolish.indexOf(polishes[i].id) > -1) {
                            statuses.push("wanted");
                        } else {
                            statuses.push("");
                        }
                    }
                    returnedpolish = polishes;
                    data.polishes = returnedpolish;
                    data.status = statuses;
                    res.render('browse.ejs', data);
                }
            } else {
                returnedpolish = polishes;
                data.polishes = returnedpolish;
                data.status = statuses;
                res.render('browse.ejs', data);
            }
        })
    })
});


};



//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    //if user is authenticated in the session, carry on
    if (req.isAuthenticated())
    return next();

    //if they aren't, redirect them to the login page
    req.session.returnTo = req.path;
    res.redirect('/login');
};