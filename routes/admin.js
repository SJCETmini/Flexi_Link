var express = require('express');
var router = express.Router();

var loginregister = require('../helpers/registerandlogin/adminlogin')
var monitize = require("../helpers/adminHelpers/monetize")
var userdetails = require('../helpers/registerandlogin/userlogin')
var gymdetails = require('../helpers/gymregister/gymreg')
const membershipdetails=require('../helpers/membership/membership');
var customer  = require("../helpers/users/auth");


const verifyLogin=(req,res,next)=>{
  if(req.session.adminloggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

router.get("/", verifyLogin,(req, res) => {
    res.render('adminDash/admindashboard');
});



router.post("/gyms", (req, res) => {
  console.log(req.body);
  gymdetails.findGymsByName(req.body.gymName)
      .then(async (gyms) => {
          console.log("Serverside", gyms);
          try {
              const gymsWithMemberCount = await Promise.all(gyms.map(async (gym) => {
                  const memberCount = await membershipdetails.findthenumberofmembers(gym._id);
                  return {
                      _id: gym._id,
                      name: gym.name,
                      owner: gym.owner,
                      addressdisp: gym.addressdisp,
                      memberCount
                  };
              }));
              res.json({ response: gymsWithMemberCount });
          } catch (error) {
              console.error("Error fetching member counts:", error);
              res.status(500).json({ error: "An error occurred while processing your request." });
          }
      })
      .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "An error occurred while processing your request." });
      });
});





// FOR SEARCHING USER BY ID

// router.post('/users', async (req, res) => {
//   try {
//       const userId = req.body.userId;
//       const user = await customer.findById(userId) || await userdetails.findById(userId);

//       if (user) {
//           res.json({ success: true, user });
//       } else {
//           res.json({ success: false, message: 'User not found' });
//       }
//   } catch (error) {
//       console.error('Error fetching user:', error);
//       res.status(500).json({ success: false, error: 'An error occurred while processing your request.' });
//   }
// });





/* GET users listing. */
// router.get('/pending',verifyLogin, function(req, res, next) {
//   monitize.fetch_details().then((response)=>{
//     console.log(response)
//     userdetails.fds1(response.applied).then((response)=>{

//       console.log(response)


//       res.render('admin/adminhome',{users : response});

//     })
//   })
  
// });

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


// router.get('/review-application',verifyLogin,(req,res)=>{
//   console.log(req.query.id)
//   console.log(req.query.username)
//   gymdetails.ownerFind(req.query.id).then((response)=>{
//     console.log(response)
//   })



// })






module.exports = router;
