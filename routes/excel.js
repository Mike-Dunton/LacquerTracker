var Polish = require('../app/models/polish');
var User = require('../app/models/user');
var sanitizer = require('sanitizer');
var csv = require('fast-csv');
var fs = require('node-fs');
var path = require('path');

module.exports = function(app, passport) {


//Import owned polish from CSV
app.get('/import', isLoggedIn, function(req, res) {

    data = {};
    data.title = 'Import Owned Polish - Lacquer Tracker';
    res.render('import.ejs', data);
});

app.post('/import', isLoggedIn, function(req, res) {
    csv.fromPath(req.files.spreadsheet.path, {headers:true}).on("record", function(data) {
        if (data.name.length > 0 && data.brand.length > 0) {
            Polish.find({name:{ $regex: new RegExp("^" + data.name.toLowerCase(), "i") }, brand:{ $regex: new RegExp("^" + data.brand.toLowerCase(), "i") }}, function(err, polish) {
                console.log(polish.length);
                if (polish.length !== 0) {
                    req.user.wantedpolish.remove(polish[0].id);
                    req.user.ownedpolish.addToSet(polish[0].id);
                    polish[0].dateupdated = new Date();
                    req.user.save(function(err) {
                        if (typeof polish[0].batch == "undefined" || polish[0].batch.length === 0) {
                            if (data.collection) {
                                if (data.collection.length > 0) {
                                    polish[0].batch = sanitizer.sanitize(data.collection);
                                    polish[0].save();
                                }
                            }
                        }
                        if (typeof polish[0].colorcat == "undefined" || polish[0].colorcat.length === 0) {
                            if (data.color) {
                                if (data.color.length > 0) {
                                    if (data.color.toLowerCase() === "black") {polish[0].colorcat = "black";}
                                    if (data.color.toLowerCase() === "blue") {polish[0].colorcat = "blue";}
                                    if (data.color.toLowerCase() === "brown") {polish[0].colorcat = "brown";}
                                    if (data.color.toLowerCase() === "clear") {polish[0].colorcat = "clear";}
                                    if (data.color.toLowerCase() === "gold") {polish[0].colorcat = "gold";}
                                    if (data.color.toLowerCase() === "green") {polish[0].colorcat = "green";}
                                    if (data.color.toLowerCase() === "grey") {polish[0].colorcat = "grey";}
                                    if (data.color.toLowerCase() === "nude") {polish[0].colorcat = "nude";}
                                    if (data.color.toLowerCase() === "orange") {polish[0].colorcat = "orange";}
                                    if (data.color.toLowerCase() === "pink") {polish[0].colorcat = "pink";}
                                    if (data.color.toLowerCase() === "purple") {polish[0].colorcat = "purple";}
                                    if (data.color.toLowerCase() === "red") {polish[0].colorcat = "red";}
                                    if (data.color.toLowerCase() === "silver") {polish[0].colorcat = "silver";}
                                    if (data.color.toLowerCase() === "white") {polish[0].colorcat = "white";}
                                    if (data.color.toLowerCase() === "yellow") {polish[0].colorcat = "yellow";}
                                    polish[0].save();
                                }
                            }
                        }
                        if (typeof polish[0].indie == "undefined" || polish[0].indie.length === 0) {
                            if (data.indie) {
                                if (data.indie.length > 0) {
                                    if (data.indie === "yes") {
                                        polish[0].indie = "on";
                                        polish[0].save();
                                    } else if (data.indie === "no") {
                                        polish[0].indie = "off";
                                        polish[0].save();
                                    }
                                }
                            }
                        }
                        if (typeof polish[0].type == "undefined" || polish[0].type.length === 0) {
                            if (data.type) {
                                if (data.type.length > 0) {
                                    var input = sanitizer.sanitize(data.type.toLowerCase().split(" "));
                                    var formatted = [];
                                    var types = ["blackened", "crackle", "crelly", "creme", "duochrome", "flakie", "glitter", "glow", "holo", "jelly", "magnetic", "matte", "metallic", "neon", "scented", "sheer", "shimmer", "striper", "texture", "thermal", "uv"];
                                    for (i=0; i<types.length; i++) {
                                        if (input.indexOf(types[i]) !== -1) {
                                            formatted.push(types[i]);
                                        }
                                    }
                                    polish[0].type = formatted.toString();
                                    polish[0].save();
                                }
                            }
                        }
                        if (typeof polish[0].code == "undefined" || polish[0].code.length === 0) {
                            if (data.code) {
                                if (data.code.length > 0) {
                                    polish[0].code = sanitizer.sanitize(data.code);
                                    polish[0].save();
                                }
                            }
                        }
                        polish[0].save();
                    })
                } else {
                    var newPolish = new Polish ({
                        name: sanitizer.sanitize((data.name).replace(/[?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-")),
                        brand: sanitizer.sanitize((data.brand).replace(/[?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-")),
                        batch: '',
                        colorcat: '',
                        indie: '',
                        type: '',
                        code: '',
                        swatch: '',
                        dupes: '',
                        dateupdated: new Date(),
                    });
                    newPolish.save(function(err) {
                        if (data.collection) {
                            if (data.collection.length > 0) {
                                newPolish.batch = sanitizer.sanitize(data.collection);
                            }
                        }
                        if (data.color) {
                            if (data.color.length > 0) {
                                if (data.color.toLowerCase() === "black") {newPolish.colorcat = "black";}
                                if (data.color.toLowerCase() === "blue") {newPolish.colorcat = "blue";}
                                if (data.color.toLowerCase() === "brown") {newPolish.colorcat = "brown";}
                                if (data.color.toLowerCase() === "clear") {newPolish.colorcat = "clear";}
                                if (data.color.toLowerCase() === "gold") {newPolish.colorcat = "gold";}
                                if (data.color.toLowerCase() === "green") {newPolish.colorcat = "green";}
                                if (data.color.toLowerCase() === "grey") {newPolish.colorcat = "grey";}
                                if (data.color.toLowerCase() === "nude") {newPolish.colorcat = "nude";}
                                if (data.color.toLowerCase() === "orange") {newPolish.colorcat = "orange";}
                                if (data.color.toLowerCase() === "pink") {newPolish.colorcat = "pink";}
                                if (data.color.toLowerCase() === "purple") {newPolish.colorcat = "purple";}
                                if (data.color.toLowerCase() === "red") {newPolish.colorcat = "red";}
                                if (data.color.toLowerCase() === "silver") {newPolish.colorcat = "silver";}
                                if (data.color.toLowerCase() === "white") {newPolish.colorcat = "white";}
                                if (data.color.toLowerCase() === "yellow") {newPolish.colorcat = "yellow";}
                            }
                        }
                        if (data.indie) {
                            if (data.indie.length > 0) {
                                if (data.indie === "yes") {
                                    newPolish.indie = "on";
                                } else if (data.indie === "no") {
                                    newPolish.indie = "off";
                                } else {
                                    newPolish.indie = '';
                                }
                            }
                        }
                        if (data.type) {
                            if (data.type.length > 0) {
                                var input = sanitizer.sanitize(data.type.toLowerCase().split(" "));
                                var formatted = [];
                                var types = ["blackened", "crackle", "crelly", "creme", "duochrome", "flakie", "glitter", "glow", "holo", "jelly", "magnetic", "matte", "metallic", "neon", "scented", "sheer", "shimmer", "striper", "texture", "thermal", "uv"];
                                for (i=0; i<types.length; i++) {
                                    if (input.indexOf(types[i]) !== -1) {
                                        formatted.push(types[i]);
                                    }
                                }
                                newPolish.type = formatted.toString();
                            }
                        }
                        if (data.code) {
                            if (data.code.length > 0) {
                                newPolish.code = sanitizer.sanitize(data.code);
                            }
                        }
                        newPolish.save(function(err) {
                            newPolish.keywords = sanitizer.sanitize(newPolish.name.replace(/[?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-")) + " " + sanitizer.sanitize(newPolish.brand.replace(/[?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-")) + " " + sanitizer.sanitize(newPolish.batch) + " " + sanitizer.sanitize(newPolish.code);
                            newPolish.save(function(err) {
                                req.user.ownedpolish.addToSet(newPolish.id);
                                req.user.save();
                            })
                        })
                    })
                }
            })
        }
    }).on("end", function() {
        fs.unlink(req.files.spreadsheet.path, function(err) {
            res.redirect('/profile');
        })
    });
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