var express = require('express');
var app = express();


//setup
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/public', express.static(__dirname + '/public'));


//different views
app.get('/', function(req, res){
  res.render('index');
});


//server port setup
app.listen(app.get('port'));
