const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const expressValidator=require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

const config = require('./config/database');
const passport = require('passport');

mongoose.connect(config.database);
let db = mongoose.connection;

//Check connection (true connections)
db.once('open',()=>{
  console.log("Connected to MongoDB");
})

//Check for DB errors
db.on('error',(err)=>{
  console.log(err);
});


//Init app
const app = express();

//Bring in models
let Article = require('./modules/article');

//Load View Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//Set Public Folder
app.use(express.static(path.join(__dirname,'public')));


//Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));


//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//Passport Config
require('./config/passport')(passport);
//Pasport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
  res.locals.user=req.user || null; //giriş yapılmış mı kontrolü
  next();
});

//Home Route
app.get('/',(req,res)=>{

  Article.find({},(err,articles)=>{
    if(err){
      console.log(err);
    }
    else{
      res.render('index', {
        title:'sa',
        articles:articles
      });
    }
  });
});

//Route Files
let articles = require('./routes/articles');
app.use('/articles',articles);
let users = require('./routes/users');
app.use('/users',users);

//Start Server
app.listen(3000,() =>{
  console.log('Server started');
});