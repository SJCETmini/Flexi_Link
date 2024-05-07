const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for gym
const gymSchema = new Schema({
  name: String,
  membershipFee: Number,
  monthlyFee: Number,
  dailyFee: Number,
  workingHours:{
    morningStartTime: String,
    morningEndTime: String
  },
  peakTimes: {
    morningPeakStartTime: String,
    morningPeakEndTime: String,
    nightPeakStartTime: String,
    nightPeakEndTime: String
  },
  holidayDays: [String],
  description: String,
  images: [{
    data: Buffer,
    contentType: String,
    imageName: String
  }],
  video: {
    data: Buffer,        // Video binary data
    contentType: String, // MIME type of the video
    videoName: String    // Name of the video
  },
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  owner: { type: Schema.Types.ObjectId, ref: 'owner' }, // Foreign key to gym owner
  customers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // References to customers
  reviews: [{ 
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who left the review
    rating: Number,
    comment: String
  }],
  aminities:[String],
  specialities:[String]
});

// Index the 'location' field for geospatial queries
gymSchema.index({ location: '2dsphere' });


// Define schema for gym owner


// Create models
const Gym = mongoose.model('Gym', gymSchema);


function gymregisterstep1(gymData){
    console.log(gymData)
    return new Promise(async(resolve, reject) => {
      console.log(gymData.aminities)
      const newgym = new Gym();
      newgym.name = gymData.gymName;
      newgym.membershipFee = gymData.membershipFee;
      newgym.monthlyFee = gymData.monthlyFees;
      newgym.dailyFee = gymData.dailyfees;
      newgym.peakTimes.morningPeakStartTime = gymData.morningPeakStartTime;
      newgym.peakTimes.morningPeakEndTime = gymData.morningPeakEndTime;
      newgym.peakTimes.nightPeakStartTime = gymData.nightPeakStartTime;
      newgym.peakTimes.nightPeakEndTime = gymData.nightPeakEndTime;
      newgym.description = gymData.gymDescription;
      newgym.owner = gymData.gymowner;
      newgym.holidayDays = gymData.holidayDays;
      
      newgym.specialities=gymData.specialties;
      newgym.aminities=gymData.amenities
      newgym.workingHours.morningStartTime=gymData.startingtime
      newgym.workingHours.morningEndTime=gymData.closingtime
      // Set location coordinates to New Delhi, India (28.6139° N, 77.2090° E)
      newgym.location.coordinates = [77.2090, 28.6139]; // [longitude, latitude]
      
      newgym.save()
          .then((savedGym) => {
              resolve(savedGym);
          })
          .catch((error) => {
              reject(error);
          });
  });

}

function gymregisterstep2(id,locationdata){

  return new Promise(async(resolve,reject)=>{
    const [longitude, latitude] = locationdata.coordinates.split(',').map(coord => parseFloat(coord));

    const updatedGym = await Gym.findByIdAndUpdate(id, {
      $set: {
        "location.coordinates": [longitude, latitude],
        address: locationdata.address
      }
    }, { new: true });

    resolve(updatedGym)

})
}

function gymregisterfinal(gymId,videoData){
  return new Promise(async(resolve,reject)=>{
    const updatedGym = await Gym.findByIdAndUpdate(gymId, {
      $set: {
        video: {
          data: videoData.data,
          contentType: videoData.contentType,
          videoName: videoData.videoName
        }
      }
    }, { new: true });

    resolve(updatedGym)

  })
}

function gymregisterstep3(id,imageData){
  return new Promise(async(resolve,reject)=>{


    const updatedGym = await Gym.findByIdAndUpdate(id, { $push: { images: imageData } }, { new: true });

    resolve(updatedGym)



})
}

function calculatedailyfee(monthlyFee,holidays){
    const totalDaysInMonth = 30;
  
    // Calculate the number of working days in the month
    const workingDaysInMonth = totalDaysInMonth - holidays.length;
  
    // Calculate the daily fee
    const dailyFee = monthlyFee / workingDaysInMonth;
    
    return dailyFee;
}

function getdetailsofownersgym(id){
  return new Promise(async(resolve,reject)=>{
    const all = await Gym.find({owner:id}).lean();

    console.log("hiii")
    all.forEach(gym => {
      gym.images.forEach(image => {
        image.data = image.data.toString('base64');
      });
    });

    resolve(all)


})
}

function chk(id,imageData){
  return new Promise(async(resolve,reject)=>{
    const gym = await Gym.findById(id)

   

    resolve(gym)
})
}

function ownerFind(ownerId){
  return new Promise(async(resolve,reject)=>{
    try {
      const gyms = await Gym.find({ owner: ownerId }).exec();
      resolve(gyms);
  } catch (error) {
      console.error('Error finding gyms by owner:', error);
      throw error;
  }
  })
}

function findNearestGyms(longitude, latitude, stop){
  return new Promise(async(resolve,reject)=>{
    try {
      const gyms = await Gym.find({
          location: {
              $near: {
                  $geometry: {
                      type: 'Point',
                      coordinates: [longitude, latitude]
                  }
              }
          }
      }).limit(stop).lean();

     // console.log(gyms)

     gyms.forEach(gym => {
      gym.images.forEach(image => {
        image.data = image.data.toString('base64');
      });
    });

      resolve(gyms)
  } catch (error) {
      console.error('Error finding gyms:', error);
      throw error;
  }
  })
}


// async function findNearestGyms(longitude, latitude) {
//   try {
//       const gyms = await Gym.find({
//           location: {
//               $near: {
//                   $geometry: {
//                       type: 'Point',
//                       coordinates: [longitude, latitude]
//                   }
//               }
//           }
//       }).limit(5).lean();

//       console.log(gyms)

//       return gyms;
//   } catch (error) {
//       console.error('Error finding gyms:', error);
//       throw error;
//   }
// }


function findgyms(id){
  return new Promise(async(resolve,reject)=>{
    const gym=await Gym.findById(id).lean();
    if (gym.video) {
      gym.video.data = gym.video.data.toString('base64');
  }
  
    gym.images.forEach(image => {
      image.data = image.data.toString('base64');
    });
  gym.dailyFee=Math.round(gym.dailyFee)
    resolve(gym)
  })
}

function findgymformembership(id,userid){
  return new Promise(async(resolve,reject)=>{
    const gym=await Gym.findById(id).lean();
    if(gym.customers.includes(userid)){
      gym.member=true
      gym.amounttobe=gym.monthlyFee
    }
    else{
      gym.member=false
      gym.amounttobe=gym.monthlyFee+gym.membershipFee
    }
    resolve(gym)
  })
}


function sortGym(type) {
  return new Promise(async (resolve, reject) => {
    try {
      const gyms = await Gym.find({ specialities: { $in: [type] } }).lean();

      gyms.forEach(gym => {
        gym.images.forEach(image => {
          image.data = image.data.toString('base64');
        });
      });

      resolve(gyms);
    } catch (error) {
      console.error('Error finding gyms:', error);
      throw error;;
    }
  });
}



module.exports = { calculatedailyfee,
gymregisterstep1,gymregisterstep2,gymregisterstep3,chk,
getdetailsofownersgym,ownerFind,findNearestGyms,gymregisterfinal,findgyms,findgymformembership,sortGym};
