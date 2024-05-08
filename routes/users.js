var express = require('express');
var router = express.Router();
var http = require('http');
const geoip = require('geoip-lite');
var stripe = require('stripe')
const passport = require('passport')
const gymhelpers = require('../helpers/gymregister/gymreg');
const { model } = require('mongoose');
const ticketgenerator=require('../helpers/Ticket/ticket');
const membershipgenerator=require('../helpers/membership/membership');
require('dotenv').config();
const moment = require('moment');
const chat=require('../helpers/ai/chatbot')


let stripeGateway = stripe(process.env.stripe_api)
let DOMAIN = process.env.DOMAIN;
require("../helpers/users/auth")

/* GET users listing. */

// router.get('/', function(req, res, next) {
//   res.render('./users/recentBookings', {user:true, layout: 'userLayout'});
// });

// router.get('/', function(req, res, next) {
//   res.render('./home/Homeindex', {layout: 'normalLayout'});
// });

router.get('/success',(req,res)=>{
 



  res.render("./users/paysucces",{id:req.query.gymid,gymname:req.query.gymName,price:req.query.price,member:req.query.member})
})

router.get('/display-membership-card',(req,res)=>{

  console.log("USER:",req.session.user.name);

  if(!req.query.membershipGenerated){
    console.log(req.query.price)
    membershipgenerator.generatemembership(req.query.id,req.query.gymName,req.query.price,req.session.user._id,req.session.user.name).then((response)=>{
  
      response.formattedisdate=membershipgenerator.formatDateTime(new Date(response.issueddate))
      response.formattedexdate=membershipgenerator.formatDateTime(new Date(response.expirydate))
  
      res.render("./users/membership-details",{username: response.username,gymname: response.gymname,formatedisdate:response.formattedisdate,formattedexdate:response.formattedexdate,id:response.membershipid,price:response.price})

    })
  }else{
    membershipgenerator.findMymembership(req.query.id).then((response)=>{
      response.formattedisdate=membershipgenerator.formatDateTime(new Date(response.issueddate))
      response.formattedexdate=membershipgenerator.formatDateTime(new Date(response.expirydate))

     // console.log("--**--",response.formattedisdate)

      res.render("./users/membership-details",{username: response.username,gymname: response.gymname,formatedisdate:response.formattedisdate,formattedexdate:response.formattedexdate,id:response.membershipid,price:response.price})
  
    })
  }


  // res.render("./users/membership-details");
})


router.get('/my_ticket',(req,res)=>{
  if(!req.query.ticketGenerated){
    console.log(req.query.price)
    ticketgenerator.generateTicket(req.query.id,req.query.gymName,req.query.price,req.session.user._id,req.session.user.name).then((response)=>{
  
      response.formattedisdate=ticketgenerator.formatDateTime(new Date(response.issueddate))
      response.formattedexdate=ticketgenerator.formatDateTime(new Date(response.expirydate))
  
      //console.log(response.formattedisdate)
  
      res.render("./users/ticket",{gymname: response.gymname,formatedisdate:response.formattedisdate,formattedexdate:response.formattedexdate,id:response.ticketid,price:response.price})
      
    })
  }else{
    ticketgenerator.findMyticket(req.query.id).then((response)=>{
      response.formattedisdate=ticketgenerator.formatDateTime(new Date(response.issueddate))
      response.formattedexdate=ticketgenerator.formatDateTime(new Date(response.expirydate))

     // console.log("--**--",response.formattedisdate)

      res.render("./users/ticket",{gymname: response.gymname,formatedisdate:response.formattedisdate,formattedexdate:response.formattedexdate,id:response.ticketid,price:response.price})
  
  
    })
  }
 
})

router.get('/member/payment',(req,res)=>{
  console.log(req.query.id)

  console.log(req.session.user._id)
  
  
  gymhelpers.findgymformembership(req.query.id,req.session.user._id).then((response)=>{
    console.log(response.member)
    res.render('./users/membership',{response})
  })
  
})

router.get('/cancel',(req,res)=>{
  res.send("cancel")
})


router.get('/', function(req, res, next) {
  if(req.session.userloggedIn){
   
  http.get('http://api.ipify.org', function(resp) {
    let ipaddress = '';

    resp.on('data', function(ip) {
      ipaddress += ip.toString();
    });

    resp.on('end', function() {
      const location = geoip.lookup(ipaddress);
      console.log(location);
      const longitude = location.ll[0]; // Longitude from geolocation result
      const latitude = location.ll[1]; // Latitude from geolocation result

      gymhelpers.findNearestGyms(longitude, latitude, 5).then((closegym)=>{
        console.log(closegym)
        res.render('./users/dashboard', { 
          user: true, 
          name:req.session.user.name, 
          layout: 'userLayout',
          gymscloser:closegym,
          userloggedin:true
        });
      });
    }) 
  })}
  else{
    
    res.render('./users/dashboard', { user: true, layout: 'userLayout' ,gymscloser:null,userloggedin:false});
  }
});

router.get('/recent', function(req, res, next) {
  //console.log(req.session.user._id)
  ticketgenerator.findAllwithid(req.session.user._id).then((response)=>{
   // =ticketgenerator.formatDateTime(new Date(response.issueddate))
  console.log(response.formattedisdate)
    res.render('./users/recentBookings', {user:true, name:req.session.user.name, layout: 'userLayout',response});
  })
  //console.log("hi")
});

router.get('/membership-card', function(req, res, next) { 
  
  membershipgenerator.findAllwithid(req.session.user._id).then((response)=>{

    res.render('./users/membership-card', {user:true, name:req.session.user.name, layout: 'userLayout',response});
   
  })

});

router.get('/gym-list', function(req, res, next) {
if(req.query.type==="exploreMore"){

  http.get('http://api.ipify.org', function(resp) {
    let ipaddress = '';

    resp.on('data', function(ip) {
      ipaddress += ip.toString();
    });

    resp.on('end', function() {
      const location = geoip.lookup(ipaddress);
      console.log(location);
      const longitude = location.ll[0]; // Longitude from geolocation result
      const latitude = location.ll[1]; // Latitude from geolocation result

      gymhelpers.findNearestGyms(longitude, latitude, 50).then((closegym)=>{
        console.log(closegym)
        res.render('./users/gym-list', { user: true, layout: 'userLayout' ,gyms:closegym});
      });
      })

      
     
  })
}else if(req.query.type==="speciality") {
  if(req.session.userloggedIn){
    console.log("Speciality:",req.query.id)
    gymhelpers.sortGym(req.query.id).then((gyms)=>{

      console.log(gyms)

      res.render('./users/gym-list', {user:true, layout: 'userLayout',gyms});
    });
  }else{
    res.render('./users/dashboard', { user: true, layout: 'userLayout' ,gymscloser:null,userloggedin:false});
  }
}
 
});


router.get('/gym-detail', function(req, res, next) {
  console.log(req.query.id)

  console.log("USER",req.session.user);


  gymhelpers.findgyms(req.query.id).then((response) => {
    console.log(response.name)
    const morningStartTime = response.workingHours.morningStartTime + ' AM';
    const morningEndTime = response.workingHours.morningEndTime + ' PM';
    // Convert the start and end times to 24-hour format for easier comparison
    const startTime = moment(morningStartTime, 'hh:mm A').format('HH:mm');
    const endTime = moment(morningEndTime, 'hh:mm A').format('HH:mm');
    // Get the current time in 24-hour format
    const currentTime = moment().format('HH:mm');
    // Check if the current time is between the start and end times
    const isOpen = currentTime >= startTime && currentTime < endTime;

    const iconMap = {
      "Locker": "fa-solid fa-door-closed",
      "Car Parking": "fa-solid fa-car",
      "Bike Parking": "fa-solid fa-motorcycle",
      "Shower": "fa-solid fa-shower",
      "CCTV": "fa-solid fa-eye",
      "Lounge": "fa-solid fa-couch"
    };
    console.log(response.location.coordinates[0])
    console.log("Amneties", response.aminities)
    res.render('./users/gym-detail', {
      user: true,
      details: response,
      longitude:response.location.coordinates[0],
      lattitude:response.location.coordinates[1],
      status: isOpen,
      amenities: response.aminities,
      iconMap,
      layout: 'userLayout'
    });
  });
});


router.get('/login',(req,res)=>{
  res.render('./users/login')
})

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/users' }),
  function(req, res) {
    // Successful authentication, redirect home.
    //req.session.user= response.val
    req.session.userloggedIn=true
    req.session.user=req.user

    console.log(req.user)
    res.redirect("/users")
   
  });

  router.get('/chat', (req, res) => {
    res.render('./chat-bot/chat');
  });
  router.get('/loader.gif', (req, res) => {
    res.sendFile(__dirname + '/loader.gif');
  });

  router.post('/chat', async (req, res) => {
    try {
      const userInput = req.body?.userInput;
      console.log('incoming /chat req', userInput)
      if (!userInput) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
  
      const response = await chat.runChat(userInput);
      res.json({ response });
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post("/stripe-checkout", async (req, res) => {
    
    const booking = req.body;
    console.log(booking)
    booking.dailyFee = parseInt(booking.dailyFee);

    try {
        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${DOMAIN}/users/success?gymid=${booking.gymid}&gymName=${booking.gymName}&price=${booking.dailyFee}`,
            cancel_url: `${DOMAIN}/users/cancel`,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: booking.gymName
                        

                    },
                    unit_amount: booking.dailyFee
                },
                quantity: 1
            }],
            metadata: {
              userId: req.session._id // Add user ID as metadata
          }


            // Remove billing_address_collection since it's not required for INR transactions within India
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while creating Stripe Checkout session.' });
    }
});

router.post("/member/stripe-checkout", async (req, res) => {
    
  const booking = req.body;
  console.log(booking)
  booking.Fee = parseInt(booking.Fee);

  try {
      const session = await stripeGateway.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          success_url: `${DOMAIN}/users/success?gymid=${booking.gymid}&gymName=${booking.gymName}&price=${booking.Fee}&member=true`,
          cancel_url: `${DOMAIN}/users/cancel`,
          line_items: [{
              price_data: {
                  currency: 'usd',
                  product_data: {
                      name: booking.gymName
                      

                  },
                  unit_amount: booking.Fee
              },
              quantity: 1
          }],
          metadata: {
            userId: req.session._id // Add user ID as metadata
        }


          // Remove billing_address_collection since it's not required for INR transactions within India
      });

      res.json({ url: session.url });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while creating Stripe Checkout session.' });
  }
});





module.exports = router;
