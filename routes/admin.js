var express = require('express');
var router = express.Router();

var loginregister = require('../helpers/registerandlogin/adminlogin')
var monitize = require("../helpers/adminHelpers/monetize")
var userdetails = require('../helpers/registerandlogin/userlogin')
var gymdetails = require('../helpers/gymregister/gymreg')



const verifyLogin=(req,res,next)=>{
  if(req.session.adminloggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

router.get("/",verifyLogin,(req,res)=>{
  res.render('admin/admin_dashboard')
})

/* GET users listing. */
router.get('/pending',verifyLogin, function(req, res, next) {
  monitize.fetch_details().then((response)=>{
    console.log(response)
    userdetails.fds1(response.applied).then((response)=>{

      console.log(response)


      res.render('admin/adminhome',{users : response});

    })
  })
  
});

router.get('/login',(req,res)=>{
  res.render('admin/adminlogin')
})


router.post('/login',(req,res)=>{
  loginregister.login(req.body).then((response)=>{
    if(response.status){
      req.session.admin= response.val
      req.session.adminloggedIn=true
    }  
    res.redirect("/admin");
    console.log(response)
  })
})


router.get('/review-application',verifyLogin,(req,res)=>{
  console.log(req.query.id)
  console.log(req.query.username)
  gymdetails.ownerFind(req.query.id).then((response)=>{
    console.log(response)
  })



})






module.exports = router;
