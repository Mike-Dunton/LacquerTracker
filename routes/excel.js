var Polish = require('../app/models/polish');
var User = require('../app/models/user');
var sanitizer = require('sanitizer');
var csv = require('ya-csv');
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
    var reader = csv.createCsvFileReader(req.files.spreadsheet.path, {columnsFromHeader:true, 'separator': ','});
    reader.addListener('data', function(data) {
        if (data.name.length > 0 && data.brand.length > 0) {
            Polish.find({name:sanitizer.sanitize(data.name.replace(/[?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-").replace(/^\s+|\s+$/g,'')), brand:sanitizer.sanitize(data.brand.replace(/[()?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-").replace(/^\s+|\s+$/g,''))}, function(err, polish) {
                if (polish.length !== 0) {
                    req.user.wantedpolish.remove(polish[0].id);
                    req.user.ownedpolish.addToSet(polish[0].id);
                    req.user.save();
                    if (polish[0].batch.length === 0) {
                        if (data.collection) {
                            if (data.collection.length > 0) {
                                polish[0].batch = sanitizer.sanitize(data.collection);
                                polish[0].keywords = polish[0].name + " " + polish[0].brand + " " + sanitizer.sanitize(data.collection) + " " + polish[0].code;
                                polish[0].dateupdated = new Date();
                                polish[0].save();
                            }
                        }
                    }
                    if (polish[0].colorcat.length === 0) {
                        if (data.color) {
                            if (data.color.length > 0) {
                                var input = sanitizer.sanitize(data.color.toLowerCase().split(" "));
                                var formatted = [];
                                var colors = ['black','blue','brown','clear','copper','coral','gold','green','grey','multi','nude','orange','pink','purple','red','silver','teal','white','yellow'];
                                for (i=0; i<colors.length; i++) {
                                    if (input.indexOf(colors[i]) !== -1) {
                                        formatted.push(colors[i]);
                                    }
                                }
                                polish[0].colorcat = formatted.toString();
                                polish[0].dateupdated = new Date();
                                polish[0].save();
                            }
                        }
                    }
                    if (polish[0].indie.length === 0) {
                        if (data.indie) {
                            if (data.indie.length > 0) {
                                if (data.indie === "yes") {
                                    polish[0].indie = "on";
                                    polish[0].dateupdated = new Date();
                                    polish[0].save();
                                } else if (data.indie === "no") {
                                    polish[0].indie = "off";
                                    polish[0].dateupdated = new Date();
                                    polish[0].save();
                                }
                            }
                        }
                    }
                    if (polish[0].type.length === 0) {
                        if (data.type) {
                            if (data.type.length > 0) {
                                var input = sanitizer.sanitize(data.type.toLowerCase().split(" "));
                                var formatted = [];
                                var types = ["blackened", "crackle", "crelly", "creme", "duochrome", "flakie", "fleck", "foil", "frost", "gel", "glitter", "glow", "holo", "jelly", "magnetic", "matte", "metallic", "neon", "pen", "scented", "sheer", "shimmer", "striper", "texture", "thermal", "uv"];
                                for (i=0; i<types.length; i++) {
                                    if (input.indexOf(types[i]) !== -1) {
                                        formatted.push(types[i]);
                                    }
                                }
                                polish[0].type = formatted.toString();
                                polish[0].dateupdated = new Date();
                                polish[0].save();
                            }
                        }
                    }
                    if (polish[0].code.length === 0) {
                        if (data.code) {
                            if (data.code.length > 0) {
                                polish[0].code = sanitizer.sanitize(data.code);
                                polish[0].keywords = polish[0].name + " " + polish[0].brand + " " + polish[0].batch + " " + sanitizer.sanitize(data.code);
                                polish[0].dateupdated = new Date();
                                polish[0].save();
                            }
                        }
                    }
                } else {
                    var newPolish = new Polish ({
                        name: sanitizer.sanitize(data.name.replace(/[?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-").replace(/^\s+|\s+$/g,'')),
                        brand: sanitizer.sanitize(data.brand.replace(/[()?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-").replace(/^\s+|\s+$/g,'')),
                        keywords: sanitizer.sanitize(data.name.replace(/[?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-").replace(/^\s+|\s+$/g,'')) + " " + sanitizer.sanitize(data.brand.replace(/[()?]/g,"").replace(/[&]/g,"and").replace(/[\/]/g,"-").replace(/^\s+|\s+$/g,'')),
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
                        req.user.ownedpolish.addToSet(newPolish.id);
                        req.user.save();
                        if (data.collection) {
                            if (data.collection.length > 0) {
                                newPolish.batch = sanitizer.sanitize(data.collection);
                                newPolish.keywords = newPolish.name + " " + newPolish.brand + " " + sanitizer.sanitize(data.collection) + " " + newPolish.code;
                                newPolish.save();
                            }
                        }
                        if (data.color) {
                            if (data.color.length > 0) {
                                var input = sanitizer.sanitize(data.color.toLowerCase().split(" "));
                                var formatted = [];
                                var colors = ['black','blue','brown','clear','copper','coral','gold','green','grey','multi','nude','orange','pink','purple','red','silver','teal','white','yellow'];
                                for (i=0; i<colors.length; i++) {
                                    if (input.indexOf(colors[i]) !== -1) {
                                        formatted.push(colors[i]);
                                    }
                                }
                                newPolish.colorcat = formatted.toString();
                                newPolish.save();
                            }
                        }
                        if (data.indie) {
                            if (data.indie.length > 0) {
                                if (data.indie === "yes") {
                                    newPolish.indie = "on";
                                    newPolish.save();
                                } else if (data.indie === "no") {
                                    newPolish.indie = "off";
                                    newPolish.save();
                                } else {
                                    newPolish.indie = '';
                                    newPolish.save();
                                }
                            }
                        }
                        if (data.type) {
                            if (data.type.length > 0) {
                                var input = sanitizer.sanitize(data.type.toLowerCase().split(" "));
                                var formatted = [];
                                var types = ["blackened", "crackle", "crelly", "creme", "duochrome", "flakie", "fleck", "foil", "frost", "gel", "glitter", "glow", "holo", "jelly", "magnetic", "matte", "metallic", "neon", "pen", "scented", "sheer", "shimmer", "striper", "texture", "thermal", "uv"];
                                for (i=0; i<types.length; i++) {
                                    if (input.indexOf(types[i]) !== -1) {
                                        formatted.push(types[i]);
                                    }
                                }
                                newPolish.type = formatted.toString();
                                newPolish.save();
                            }
                        }
                        if (data.code) {
                            if (data.code.length > 0) {
                                newPolish.code = sanitizer.sanitize(data.code);
                                newPolish.keywords = newPolish.name + " " + newPolish.brand + " " + newPolish.batch + " " + sanitizer.sanitize(data.code);
                                newPolish.save();
                            }
                        }
                    })
                }
            })
        }
    })
    reader.addListener('end', function(){
        res.redirect('/profile');
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