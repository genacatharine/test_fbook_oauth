var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// After passport
const cookieSession = require('cookie-session') // can be anything you want

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// this gives me req.session
app.use(cookieSession({ secret: 'keyboardcat' }));

const passport = require('passport')

// A relatively simple data structure that has some urls, and a method or two that are specific to the GitHub API
const FacebookStrategy = require('passport-facebook').Strategy

// Tells passport to use that github-specific data structure
passport.use(new FacebookStrategy(

  // filling in the blanks on the GitHub strategy
  {
    clientID: '02c5724c5294678ed302',
    clientSecret: '660cad53bbd992b102caccc573b38489d51153a7',
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email'],
    enableProof: true
  },

  // after both API calls were made
  function onSuccessfulLogin(token, refreshToken, profile, done) {
    // I've processed the initial login of the user
    //this was different on facebook passport github directions
    // function(accessToken, refreshToken, profile, cb) {
    // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    // This happens once
    done(null, {token, profile});
  }

));

app.use(passport.initialize());
app.use(passport.session());

// take in whatever was passed into `done` inside the FacebookStrategy config
passport.serializeUser((object, done) => {
  console.log("Serialize User", {token: object})

  // when I call `done` _here_, I am passing in the data to be saved to the session
  done(null, {token: object.token})
})

passport.deserializeUser((object, done) => {
  console.log("Deserialize User", object)
  done(null, object)
})

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['user_friends', 'manage_pages'] }));

// makes 2 api calls to facebook
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
