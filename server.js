var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');


passport.use(new Strategy(
    (username, password, cb) => {
        db.users.findByUsername(username, (err, user) => {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password != password) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    db.users.findById(id, (err, user) => {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});


var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/gh-pages'));
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
    extended: true
}));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

app.get('/libro',require('connect-ensure-login').ensureLoggedIn(),(req, res) => {
    res.sendFile(__dirname + '/gh-pages/readme.html');
});

app.get('/', (req, res) => {
    res.render('home', {
        user: req.user
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
        failureRedirect: '/'
    }),
    (req, res) => {
        res.redirect('/');
    });

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        res.render('profile', {
            user: req.user
        });
    });


app.listen(3000);
