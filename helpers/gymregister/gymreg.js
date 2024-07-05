const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const revenue = require('../Ticket/ticket');
const { response } = require('express');
const user=require('../users/auth')
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
  addressdisp:String,
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
      newgym.addressdisp=gymData.address;
      
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

function removeGym(id){

  return new Promise(async(resolve,reject)=>{

    const x=await Gym.deleteOne({ _id: id });
     

      resolve(x);
  })

}

function detils_for_analytics(id){
  return new Promise(async(resolve,reject)=>{

    console.log(id)
    const gyms = await Gym.find({ owner: id }).select('_id name');

    console.log(gyms)
    revenue.calculate_revenue_for_all_gym(gyms).then((response)=>{
      //console.log('caught')
      //console.log(response)
      resolve(response)
    })

    //resolve()

  })

}
async function calculateAverageRating(ownerId) {
  try {
    const result = await Gym.aggregate([
      // Match gyms owned by the specified owner
      { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
      // Unwind the reviews array to de-normalize the data
      { $unwind: '$reviews' },
      // Group by owner and calculate the average rating
      {
        $group: {
          _id: '$owner',
          averageRating: { $avg: '$reviews.rating' }
        }
      }
    ]);

    if (result.length > 0) {
      return result[0].averageRating;
    } else {
      return 0; // If no reviews found, return 0
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
    throw error;
  }
}

function requirement_monitize(id){
  return new Promise(async(resolve,reject)=>{
    const gyms = await Gym.find({ owner: id }).select('_id');
    const response = await revenue.calculate_revenue_for_all_gym(gyms);
    
    let averagerating = false;
    const averageRatingValue = await calculateAverageRating(id);
    console.log('ghh', averageRatingValue);
    if (averageRatingValue > 3.5) {
      averagerating = true;
    }
      const data_for_purpose={
        monthlyRevenue:response.actualrevenue,
        membersEnrolled:response.membercondition,
        averagerating,
        allmet:response.actualrevenue&&response.membercondition&&averagerating
      }

      resolve(data_for_purpose)
    })
  }




async function findGymsByName(gymName) {
  try {
    const gyms = await Gym.find({ name: gymName })
      .populate('owner', 'email username verified')
      .lean()
      .exec();
      gyms.forEach(gym => {
        gym.images.forEach(image => {
          image.data = image.data.toString('base64');
        });
      });
    return gyms;
  } catch (error) {
    console.error("Error finding gyms by name:", error);
    throw error;
  }
}

function addreview(gymId, newReview){
  return new Promise(async(resolve,reject)=>{
    const gym = await Gym.findByIdAndUpdate(
            gymId,
            { 
              $push: { reviews: newReview }
            },
            { new: true }
          ).exec();

  resolve(gym)
  })
}

function count(){
  return new Promise(async(resolve,reject)=>{
    const count = await Gym.countDocuments().exec();
    const usercount=await user.user.countDocuments().exec();
    console.log('gym count',count)
    console.log('user count',usercount)

    const x={
      gymcount:count,
      usercount:usercount
    }
    resolve(x)

  })


}

// async function addReview(gymId, newReview) {
//   try {
//     const gym = await Gym.findByIdAndUpdate(
//       gymId,
//       { 
//         $push: { reviews: newReview }
//       },
//       { new: true }
//     ).exec();

//     if (!gym) {
//       throw new Error('Gym not found');
//     }

//     return gym;
//   } catch (error) {
//     console.error("Error adding review:", error);
//     throw error;
//   }
// }

// // Example usage
// (async () => {
//   const gymId = 'your_gym_id_here'; // Replace with the actual gym ID
//   const newReview = {
//     user: 'user_id_here', // Replace with the actual user ID
//     rating: 5,
//     comment: 'Excellent gym with top-notch facilities!'
//   };

//   const updatedGym = await addReview(gymId, newReview);
//   console.log(updatedGym);
// })();






module.exports = { calculatedailyfee,
gymregisterstep1,gymregisterstep2,gymregisterstep3,chk,
getdetailsofownersgym,ownerFind,findNearestGyms,gymregisterfinal,findgyms,
findgymformembership,sortGym,removeGym,detils_for_analytics,requirement_monitize,findGymsByName,addreview,calculateAverageRating,count};
