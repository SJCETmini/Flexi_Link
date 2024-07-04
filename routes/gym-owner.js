var express = require("express");
const multer = require('multer');
const session = require('express-session');
var router = express.Router();
//var x=require("../public/images")

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, '../public/images');
//   },
//   filename: (req, file, cb) => {
//     console.log(file);
//     cb(null, extractFileName(file));
//   }
// });
// const upload = multer({ storage: storage });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

var loginregister = require('../helpers/registerandlogin/userlogin')
var gymregister = require("../helpers/gymregister/gymreg")
var monitize = require("../helpers/adminHelpers/monetize")
var ticket=require('../helpers/Ticket/ticket')
const membershipgenerator=require('../helpers/membership/membership');


const verifyLogin=(req,res,next)=>{
  if(req.session.ownerloggedIn){
    next()
  }else{
    res.redirect('/gym-owner/login')
  }
}

/* GET home page. */
router.get("/registergym", verifyLogin,function (req, res, next) {
  res.render("gym-owner/registergym");

});

router.get("/removegym",(req,res)=>{
  x=req.query.id
  console.log('gym id : ',req.query.id)
  console.log(x.length)
  gymregister.removeGym(req.query.id).then((response)=>{
    console.log(response)
    res.redirect('/gymowner')
  })
})

router.get('/address',function(req,res){
console.log("hiii")
  res.render("gym-owner/getaddress");


})

router.post('/address',function(req,res){

  gymregister.gymregisterstep2(req.session.gymregid,req.body).then((response)=>{
  res.redirect("/gymowner/imageupload")
  })

  
})


router.get("/register", function (req, res, next) {
  res.render("gym-owner/register");
});

router.get("/imageupload", function (req, res, next) {
  res.render("gym-owner/gymimage");
});


router.post('/imageupload', upload.array('photos', 6), function (req, res, next) {
  var files = req.files;
  var redirectSent = false; // Flag to track if redirect has been sent
  
  for (let i = 0; i < files.length; i++) {
      //console.log("hi");
      const imageData = {
          data: files[i].buffer,
          contentType: files[i].mimetype,
          imageName: files[i].originalname
      };

      gymregister.gymregisterstep3(req.session.gymregid, imageData).then((response) => {
          console.log(response);
          
          // Check if redirect has already been sent
          if (!redirectSent) {
              redirectSent = true;
              res.redirect("/gymowner/videoupload");
          }
      }).catch((error) => {
          console.error(error);
          
          
      });
  }
});

router.get("/videoupload",(req,res)=>{
  res.render("gym-owner/videoupload")

})

router.post('/videoupload', upload.single('video'), async (req, res) => {
  var redirectSent = false;

    // Create a new Video document with the file data
    const videoData = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      videoName: req.file.originalname
    };

    gymregister.gymregisterfinal(req.session.gymregid,videoData).then((response)=>{
      console.log(response)
      if (!redirectSent) {
        redirectSent = true;
        res.redirect("/gymowner");
    }
    })

    // Save the video document to the database
    

    // Respond with success message
 
});



router.get("/videoview",(req,res)=>{
  const l='661a3b70b70955d23acab3ea'
  gymregister.chk(l).then((response)=>{
    //res.writeHead(200, {'Content-Type': 'multipart/form-data'});
    res.set('Content-Type', response.video.contentType);

    // Send video data as response
    res.send(response.video.data);
  })

})



router.get("/login",(req,res,next)=>{

  res.render("gym-owner/login")
})

router.post("/login",(req,res,next)=>{
  loginregister.login(req.body).then((response)=>{
    if(response.status){
      req.session.gymowner= response.val
      console.log(response.val)
      req.session.ownerloggedIn=true
    }  
    res.redirect("/gymowner");
    console.log(response)
  })
})

router.post('/register',(req,res,next)=>{
  loginregister.register(req.body).then((response)=>{
    console.log(response)
    req.session.gymowner= response
    req.session.ownerloggedIn=true
    res.redirect("/gymowner");
  })
})


router.post("/registergym", verifyLogin,function (req, res, next) {
 req.body.gymowner=req.session.gymowner._id
 req.body.verified=req.session.gymowner.verified

 //console.log(req.body)

 console.log('---***',req.body.verified)
  
  if (req.body.holidayDays) {
    
  }else{
    req.body.holidayDays=[]
  }
  req.body.dailyfees=gymregister.calculatedailyfee(req.body.monthlyFees,req.body.holidayDays)

  gymregister.gymregisterstep1(req.body).then((response)=>{
    console.log(response)
    req.session.gymregid=response._id
    res.redirect("/gymowner/address")
  }) 
});

router.get('/proceed-application',(req,res)=>{
  monitize.apply(req.session.gymowner._id).then((response)=>{
    console.log(response)
    res.redirect('/gymowner')
  })
})

router.get("/",verifyLogin, function (req, res, next) {
  gymregister.getdetailsofownersgym(req.session.gymowner._id).then((response)=>{
    console.log(response)
    res.render("gym-owner/owner-dashboard",{username:req.session.gymowner.username,response})
  })

//console.log(req.session.gymowner.username)
});


router.get('/apply-for-monetization',verifyLogin,(req,res)=>{
  gymregister.requirement_monitize(req.session.gymowner._id).then((response)=>{
    
    console.log(response)
    res.render('gym-owner/monitize',{conditions:response})
  })

 

  // monitize.apply(req.session.gymowner._id).then((response)=>{
  //   console.log(response)
  // })

  

})

router.get("/analytics",(req,res)=>{
  gymregister.detils_for_analytics(req.session.gymowner._id).then((response)=>{
    //console.log('final')
    //console.log('gg',response)
    console.log(response)
    res.render("gym-owner/analytics",{response})
  })
  

})

router.get('/videos', async (req, res) => {
  try {
    const videoId = '661a3b70b70955d23acab3ea'
    
    // Retrieve video object from the database
    const video = await gymregister.getVideoById(videoId);

    if (!video) {
      return res.status(404).send('Video not found');
    }

    // Set content type header
    res.set('Content-Type', video.contentType);

    // Send video data as response
    res.send(video.data);
  } catch (err) {
    console.error('Error retrieving video:', err);
    res.status(500).send('Internal Server Error');
  }
});



// OWNER GYM DETAIL PAGE

// router.get('/owner-gym-detail', function(req, res, next) {
//   const gymId = req.query.id;
//   console.log("GYM ID:", gymId);
//   // Check if gymId is provided and is a valid format
//   if (!gymId) {
//       return res.status(400).send('Gym ID is required');
//   }
//   ticket.findAllwithGym(gymId)
//       .then((tickets) => {
//           console.log(tickets)
//           res.render('gym-owner/owner-gym-detail', { tickets });
//       })
//       .catch((error) => {
//           console.error('Error:', error);
//           res.status(500).send('An error occurred while fetching gym details');
//       });
// });

// Express route handling the form submission and returning the response as JSON
router.post("/ticket-verification", (req, res) => {
  console.log(req.body);
  ticket.verifyTicket(req.body.gymId, req.body.ticketid)
      .then((response) => {
          console.log(response[0].gymid);
          res.json({ response: response }); // Return the response as JSON
      })
      .catch((error) => {
          // Handle error
          console.error(error);
          res.status(500).json({ error: "An error occurred while processing your request." });
      });
});



router.get('/owner-gym-detail', async (req, res, next) => {
  try {
      const gymId = req.query.id;
      console.log("GYM ID:", gymId);

      //ticket.calculateincomefromtic(gymId)
      // Check if gymId is provided and is a valid format
      if (!gymId) {
          return res.status(400).send('Gym ID is required');
      }
      
      const [tickets, details, membership, noofmembers,dailyfeeuser,tickdailyamt,tickmemamt] = await Promise.all([
        ticket.findAllwithGym(gymId),
        gymregister.findgyms(gymId),
        membershipgenerator.findAllwithGym(gymId),
        membershipgenerator.findthenumberofmembers(gymId),
        ticket.findcureentmonthtic(gymId),ticket.calculateincomefromtic(gymId),
        membershipgenerator.findRevenue(gymId)
    ]);

    var total=tickdailyamt+tickmemamt
      // console.log("Tickets",tickets)
      // console.log("Coordinates",details.location.coordinates)
      // console.log("Amneties", details.aminities)
      console.log("Address", details.address)
      const iconMap = {
        "Locker": "fa-solid fa-door-closed",
        "Car Parking": "fa-solid fa-car",
        "Bike Parking": "fa-solid fa-motorcycle",
        "Shower": "fa-solid fa-shower",
        "CCTV": "fa-solid fa-eye",
        "Lounge": "fa-solid fa-couch"
      };
      res.render('gym-owner/owner-gym-detail', { tickets,noofmembers, details, membership, amenities: details.aminities, iconMap,gymId,dailyfeeuser,total});
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while fetching gym details');
  }
});




module.exports = router;


