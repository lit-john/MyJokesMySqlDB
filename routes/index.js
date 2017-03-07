var express = require('express');
var mysql = require('mysql');

var router = express.Router();

/* 
 * Create a JSON object to hold mysql connection information.
 * 
 * NOTE: You should change these to YOUR database information
 * 
 * I am getting all my code from https://github.com/mysqljs/mysql
 */

var dbConnectionInfo = {
  host : 'eu-cdbr-azure-west-d.cloudapp.net',
  user : 'b47ff697093cd7',
  password : 'ba0d7edd',
  database : 'acsm_2c9fb776bf962de'
};

router.get('/login', function(req, res, next) {
  res.render('login');  
});

router.post('/login', function(req, res, next) {
  var username = req.body.username;
  
  username = username.trim();
  
  if (username.length == 0) {
    res.redirect('/login');
  }
  else {
    req.session.username = username;
    res.redirect('/');
  }
});

router.get('/', function(req, res, next) {
  // Connect to the Database
  var dbConnection = mysql.createConnection(dbConnectionInfo);
  dbConnection.connect();

  // If we receive an error event handle it. I have placed this here because of a
  // bug in the mysql package which causes a 'PROTOCOL_SEQUENCE_TIMEOUT' error
  dbConnection.on('error', function(err) {
    if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
      // Let's just ignore this
      console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
    } else {
      // I really should do something better here
      console.log('Got a DB Error: ', err);
    }
  });

  dbConnection.query('SELECT * FROM jokes', function(err, results, fields){
    if (err) {
      throw err;
    }

    var allJokes = new Array();

    for (var i=0; i<results.length; i++) {
      var joke = {};
      joke.id = results[i].id;
      joke.text = results[i].text;
      joke.date = new Date(results[i].date);

      console.log(JSON.stringify(joke));

      allJokes.push(joke);
    }
   
    dbConnection.end();

    res.render('jokeList', {jokes: allJokes});
  });

});




module.exports = router;