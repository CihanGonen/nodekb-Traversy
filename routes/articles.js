const express = require('express');
const router = express.Router(); 

//Bring in article model
let Article = require('../modules/article');
//Bring in user model
let User = require('../modules/user');

//Add Route
router.get('/add',ensureAuthenticated,(req,res)=>{
  res.render('add_article', {
    title:'add article',
  });
});


//Express Validator to check stuff
const { check, validationResult } = require('express-validator');//we need it right thereeeeeeeeeeeeeeeeeeee
//Add Submit POST Route
router.post('/add',
  [
    check('title').isLength({min:1}).trim().withMessage('Title required'),
    //check('author').isLength({min:1}).trim().withMessage('Author required'),
    check('body').isLength({min:1}).trim().withMessage('Body required')
  ]
  ,
  (req,res,next)=>{

  let article = new Article({
  title:req.body.title,
  author:req.user._id,
  body:req.body.body
  });

 const errors = validationResult(req);

 if (!errors.isEmpty()) {
  console.log(errors);
     res.render('add_article',
      { 
       article:article,
       errors: errors.mapped()
      });
   }
   else{
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(err=>{
    if(err)throw err;
    req.flash('success','Article Added');
    res.redirect('/');
  });
 }
});

//Load Edit Form
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
  Article.findById(req.params.id,(err,article)=>{
    if(article.author != req.user._id){
      req.flash('danger','Not Authorized');
      res.redirect('/');
    }
    res.render('edit_article', {
      title:'Edit Article',
      article:article
    });
  });
});


//Update Submit POST Route
router.post('/edit/:id',(req,res)=>{
  let article = {};
  article.title = req.body.title; //sağ taraftaki tanım için body-parser lazım
  article.author =req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id};

  Article.update(query,article,(err)=>{
    if(err){
      console.log(err);
      return;
    }
    else{
      req.flash('success', req.body.title+' Updated')
      res.redirect('/');
    }
  });
});

//Delete Article
router.delete('/:id',(req,res)=>{
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id};

  Article.findById(req.params.id,(err,article)=>{
    if(article.author != req.user._id){   //bi şekilde silme butonu gözükürse 
      res.status(500).send();             //yazar değilse sildirmiyoruz
    }
    else{
      Article.remove(query,(err)=>{
        if(err){
          console.log(err);
        }
        req.flash('danger','Article Deleted');
        res.send('Success');//main.js den request aldığımız için response göndermeliyiz
      });
    }
  });
});


//Get Single Article (we put it down bottom at a purpose)
router.get('/:id',(req,res)=>{
  Article.findById(req.params.id,(err,article)=>{
    User.findById(article.author,(err,user)=>{
      res.render('article', {
        article:article,
        author:user.name
      });
    });
  });
});

//Access Control
function ensureAuthenticated (req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
};

module.exports = router;