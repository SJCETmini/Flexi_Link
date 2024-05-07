const passport = require('passport');
require('dotenv').config();

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  gid : String,
  name: String,
  member : {type: Schema.Types.ObjectId, ref: 'Gym'}
  //add history


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

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
