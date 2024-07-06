const passport = require('passport');
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  gid : String,
  name: String,
  member : {type: Schema.Types.ObjectId, ref: 'Gym'},
  //add history
  password : String,
  email:String



});

const user= mongoose.model('User', userSchema);

var GoogleStrategy = require('passport-google-oauth20').Strategy;

function userauth(id,gname){
  //console.log(userData)
  return new Promise(async(resolve,reject)=>{
    const person = await user.findOne({gid:id});
    if(person){
      resolve(person)
    }
    else{
      const newuser=new user();
      newuser.gid=id
      newuser.name=gname

      newuser.save()
      resolve(newuser)

    }
  })

}

function register(userData){
  console.log(userData)
  return new Promise(async(resolve,reject)=>{
      
      userData.password=await bcrypt.hash(userData.password,10)
      const newowner = new user();
      newowner.email=userData.email;
      newowner.name=userData.username;
      newowner.password=userData.password;
      newowner.save();
      resolve(newowner);
  })

}


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID1,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET1,
    callbackURL: "http://localhost:3000/users/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // Call the callback function (cb) with null for error and the profile for user
    console.log(profile.id)
    console.log(profile.displayName)
    userauth(profile.id,profile.displayName).then((response)=>{
      cb(null, response);

    })
    
  }
));


function login(userdata){
  return new Promise(async(resolve,reject)=>{
      let response={};
      const eml=userdata.email;
      const psd=userdata.password;
      const filter={email:eml}
      const val=await user.findOne(filter).exec();
      if(val){

          bcrypt.compare(psd, val.password, function(err, result) {
              if(result){
                  //console.log(val)
                  response.val=val;
                  response.status=true;
                  resolve(response)
              }else{
                  console.log("wrong password");
                  resolve({status:false})
              }
          });
      }
      else{
         //console.log("seen");
         resolve({status:false})
      }
  }
  )
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports={
  user,
  register,
  login
}
