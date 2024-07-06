
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const owners=require("../registerandlogin/userlogin")


const monitizeSchema = new Schema({
    // other fields in your main schema
    applied: [{
        owner: { type: Schema.Types.ObjectId, ref: 'owner' },
        date: { type: Date }
    }],
    
    verified: [{ type: Schema.Types.ObjectId, ref: 'owner' }]
});



const Monitize = mongoose.model('Monitize', monitizeSchema);



function apply(ownerId) {
    return new Promise(async (resolve, reject) => {
        try {
            const monetization = await Monitize.findOne({});
            if (!monetization) {
                // If monetization document doesn't exist, create a new one
                const newMonetization = new Monitize({
                    applied: [{ owner: ownerId, date: new Date() }], // Insert ownerId and current date into applied array
                    verified: []
                });
                await newMonetization.save();
                resolve("Owner added to the applied array.");
            } else {
                if (monetization.applied.some(entry => entry.owner.equals(ownerId))) {
                    resolve("Owner already exists in the applied array.");
                } else if (monetization.verified.some(entry => entry.equals(ownerId))) {
                    resolve("Owner already exists in the verified array.");
                } else {
                    monetization.applied.push({ owner: ownerId, date: new Date() }); // Insert ownerId and current date into applied array
                    await monetization.save();
                    resolve("Owner added to the applied array.");
                }
            }
        } catch (error) {
            console.error("Error processing monetization:", error);
            reject(error);
        }
    });
}

function fetch_details_applied(){
    return new Promise(async(resolve,reject)=>{
        const ownersverification= await Monitize.findOne({}).lean()
        .select('applied')
        console.log(ownersverification)
        const applied_array=ownersverification.applied;
        const ownersArray = applied_array.map(item => item.owner);
        owners.getFulldetails(ownersArray).then((response)=>{
            resolve(response)
        })
      

    })
}

function update_reviewarray(ownerId){
    return new Promise(async(resolve,reject)=>{

        const document = await Monitize.findOne({ 'applied.owner': ownerId });
        
    
        if (!document) {
          console.log('Owner not found in applied array');
        }
    
        // Remove the owner from the applied array
        document.applied = document.applied.filter(appliedEntry => !appliedEntry.owner.equals(ownerId));
    
        // Add the owner to the verified array
        document.verified.push(ownerId);
    
        // Save the updated document
        await document.save();

        resolve(document)

    })
}

function fetch_details(){
    return new Promise(async(resolve,reject)=>{
        const monetization = await Monitize.findOne({});
        resolve(monetization)

    })
}


module.exports = {
    apply,
    fetch_details,
    fetch_details_applied,
    update_reviewarray
}





