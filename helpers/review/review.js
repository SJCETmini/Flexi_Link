const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
    gymid: { type: Schema.Types.ObjectId, ref: 'Gym' },
    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    rating:Number,
    reviewtext:String
});

const review = mongoose.model('review', reviewSchema);

function generateriview(gymid,userid,rating,opinion){
    return new Promise(async(resolve,reject)=>{
        const newreview= new review()
        newreview.gymid=gymid
        newreview.userid=userid
        newreview.rating=rating
        newreview.reviewtext=opinion


        newreview.save()
        .then((savedreview) => {
            // Format the date before resolving
            
            
            resolve(savedreview);
        })
        .catch((error) => {
            reject(error);
        });


    })
}

module.exports={
    generateriview
}