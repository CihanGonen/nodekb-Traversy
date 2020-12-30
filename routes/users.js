const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Bring in user model
let User = require('../modules/user');

//Register Form
router.get('/register',(req,res)=>{
  res.render('register');
});

//Express Validator to check stuff
const { check, validationResult } = require('express-validator');//we need it right 

//Register Process
router.post('/register',
  [
    check('name').isLength({min:1}).trim().withMessage('Name required'),
    check('email').isLength({min:1}).trim().withMessage('Email required'),
    check('email').isEmail().trim().withMessage('Email is not valid'),
    check('username').isLength({min:1}).trim().withMessage('Username required'),
    check('password').isLength({min:1}).trim().withMessage('Password required'),
    check('password2').custom((value,{req})=>{
      if(value != req.body.password){
        req.flash('danger','Passwords do not match');
        return;
      }
      return true;
    })
  ],
  (req,res,next)=>{
    let newUser = new User({
      name : req.body.name,
      email : req.body.email,
      username : req.body.username,
      password : req.body.password,
      password2 : req.body.password2
    });
  const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.render('register',{
        errors:errors
      })
    }
    else{
       newUser.name = req.body.name;
       newUser.email = req.body.email;
       newUser.username = req.body.username;
       newUser.password = req.body.password;

       bcrypt.genSalt(10,(err,salt)=>{
          bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err){
              console.log(err);
            }
            newUser.password = hash;
            newUser.save((err)=>{
              if(err){
                console.log(err);
                return;
              }
              else{
                req.flash('success','You are now registered and can login');
                res.redirect('/users/login');
              }
            })
        });
       })
    }
});  

//Login Form
router.get('/login',(req,res)=>{
  res.render('login');
});

//Login Process
router.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash:true
  })(req,res,next);
});

//Logout 
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success','You are logged out');
  res.redirect('/users/login');
});

module.exports = router;