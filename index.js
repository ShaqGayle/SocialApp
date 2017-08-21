var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');

//Schemas for User, Post, and Comments
var User = require('./models/User');
var Topic = require('./models/Topic');

//setup
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({secret: 'asdkfjla', saveUninitialized: true, resave: true}));

var authenticated = function(req, res, next){
  if(req.session) return next();

  return res.redirect('/login');
};

//different views
app.get('/', function(req, res){
  if(req.session && req.session.user){
    Topic.find({}, null, {sort: {created_At: -1}}, function(err, tweets){
      if (err) throw err;

      res.render('index', {
        title: 'Home',
        tweets: tweets
      });
    });
  } else res.render('welcome', {
    title: "Welcome"
  });
});

app.get('/login', function(req, res){
  res.render('login', {
    title: "Log In"
  });
});

app.get('/register', function(req, res){
  res.render('register', {
    title: "Register"
  });
});

app.get('/users.json', function(req, res){
  User.find({}, function(err, users) {
    if (err) throw err;

    res.send(users);
  });
});

app.get('/me', authenticated, function(req, res){
  res.render('me', {
    username: req.session.user.username
  });
});

app.get('/tweet', authenticated, function(req, res){
  res.render('tweet', {
    title: 'Tweet Something!'
  });
});

app.get('/status/:id', authenticated, function(req, res){
  Topic.findOne({_id: req.params.id}, function(err, tweet){
    User.findOne({_id: tweet.author}, function(e, user){
      res.render('status', {username: user.username, content: tweet.message});
    });
  });
});

app.get('/user/@:username', authenticated, function(req, res){
  User.findOne({username: req.params.username}, function(err, user){
    Topic.find({author: user._id}, function(e, tweets){
      res.render('user', {user: user, title: user.username, tweets: tweets});
    });
  });
})

//POST requests
app.post('/login', function(req, res){
  User.findOne({username: req.body.username}, function(err, user) {
    if (err) {
      res.render('error', {
        title: 'error',
        error: 'Could not login'
      });
    }

    if (!user) return res.render('error', {title: 'error', error: 'User cannot be found'});

    if(user.compare(req.body.password)) {
      req.session.user = user;
      req.session.save();

      res.redirect('/me');
    }
  });
});

app.post('/register', function(req, res){
if(req.body.username && req.body.password) {
  //register
  User.create({
    username: req.body.username,
    password: req.body.password
  }, function(error, user){
    if (error){
      res.render('error', {
        title: 'error',
        error: 'Could not create user'
      });
    } else {
      res.send(user);
    }
  });
} else {
  res.render('error', {
    title: 'error',
    error: 'username and password required'
  })
}
});

app.post('/tweet', function(req, res){
  if(!req.body || !req.body.tweet)
    return res.render('error', {title: 'error', error: 'Need a message'});

  //Tweet exists
  Topic.create({
    // topic: req.body.title,
    message: req.body.tweet,
    author: req.session.user._id
  }, function(error, tweet){
    if (error){
      res.render('error', {
        title: 'error',
        error: 'Could not create user'
      });
    } else {
      res.redirect('/status/' + tweet._id);
    }
  });
});

//mongoose commands
var db = mongoose.connect('mongodb://localhost:27017/AniMates')

//server port setup
app.listen(app.get('port'));
