'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI);
const dns = require('dns');

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}))
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlSchema = new mongoose.Schema({
  original_url: {type: String},
  short_url: {type: Number}
})

const URL = mongoose.model('URL', urlSchema);

const createAndSaveURL = function(fullUrl, done){
  URL.countDocuments({}, (err,count)=>{
    var u = new URL({original_url: fullUrl, short_url: count});
    u.save((err,data)=>{
      if (err){return done(err)}
      return done(null,data);
    })
  });
}
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});
app.route('/api/shorturl/new/').post((req,res)=>{
  
  dns.lookup(req.body.url,function(err,address,family){
    if (err){return res.json({"error": err})}
    createAndSaveURL(req.body.url,(err,data)=>{
      if (err){
        return res.json({"error":"unable to create short url"})
      }
      return res.json(data);
    });
  })
})

app.route('/api/short_url/:shorty').get((req, res)=>{
  URL.find({short_url: req.params.shorty},function(err,data){
    if (err){res.json({"error":"invalid URL"})}
    res.redirect(data.original_url);
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});

