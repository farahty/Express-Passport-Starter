var LocalStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var config = require('./config.js');

module.exports = function (passport, app, User) {


    app.get('/login', function (req, res) {
        res.render('users/login', {message: req.flash('auth')});
    });

    app.get('/signup', function (req, res) {
        res.render('users/signup');
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

    app.get('/auth/facebook', passport.authenticate('facebook', {
        authType: 'rerequest',
        scope: ['email','public_profile']
    }));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));
    app.get('/logout', function(req, res) {
        req.logout();
        req.flash('auth' , 'Logout successfully');
        res.redirect('/login');
    });
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            User.findOne({'username': username}, function (err, user) {
                if (err) return done(err);
                if (!user) return done(null, false, req.flash('auth', 'No user found.'));
                if (user.password != password) return done(null, false, req.flash('auth', 'Oops! Wrong password.'));
                return done(null, user);
            });

        })
    );

    passport.use(new facebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'displayName', 'photos', 'email', 'first_name' ,'last_name',
            'age_range','link','gender','locale','timezone','updated_time','verified']
    }, function (token, refreshToken, profile, done) {
        console.log(profile);
        process.nextTick(function () {
            User.findOne({'auth_id': profile.id, 'auth': 'facebook'}, function (err, user) {
                if (err) return done(err);

                if (user) {
                    return done(null, user);
                } else {

                    var newUser = new User();
                    newUser.password = '202018109';
                    newUser.name = profile.displayName;
                    newUser.username = profile.emails[0].value;
                    newUser.auth = 'facebook';
                    newUser.auth_id = profile.id;
                    newUser.avatar = profile.photos[0].value;
                    newUser.access_token = token;
                    console.log(refreshToken);
                    newUser.save(function (err, user) {
                        if (err) return done(err);
                        return done(null, user);
                    });

                }

            });
        });
    }));


};
