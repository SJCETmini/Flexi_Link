const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

const membershipSchema = new Schema({
    gymid: { type: Schema.Types.ObjectId, ref: 'Gym' },
    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    username:String,
    gymname:String,
    issueddate: { type: Date, default: Date.now },
    expirydate: { 
        type: Date, 
        default: function() {
            const now = new Date();
            now.setDate(now.getDate() + 182); // Adding 1 day (24 hours)
            return now;
        }
    },
    membershipid: { type: String, default: generateMembershipID( Math.floor(Math.random() * (4 - 9 + 1)) + 9) },
    price:Number
});

const membership = mongoose.model('membership', membershipSchema);

function generatemembership(id,name,price,userid,username){
    return new Promise(async(resolve,reject)=>{
        const newMembership= new membership()
        newMembership.gymid=id
        newMembership.gymname=name
        newMembership.price=price
        newMembership.userid=userid
        newMembership.username=username


        newMembership.save()
        .then((savedGym) => {
            // Format the date before resolving
            
            
            resolve(savedGym);
        })
        .catch((error) => {
            reject(error);
        });


    })
}



function generateMembershipID(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charLength = characters.length;
    let membershipID = '';

    for (let i = 0; i < length; i++) {
        const seed = Date.now() + i; // Using a unique seed for each character
        const randomIndex = crypto.createHash('sha256').update(seed.toString()).digest('hex')[0];
        membershipID += characters.charAt(parseInt(randomIndex, 16) % charLength);
    }

    return membershipID;
}

function findthenumberofmembers(id){
    return new Promise(async(resolve,reject)=>{
        var x=await membership.countDocuments({gymid:id})
        resolve(x)
    })
}


function formatDateTime(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = months[date.getMonth()];
    const hour = date.getHours();
    const minute = date.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
  
    var returndate=`${day}, ${dayOfMonth} ${month} | ${formattedHour}:${minute < 10 ? '0' : ''}${minute} ${ampm}`;
    console.log(returndate)
    return returndate
  }



function findAllwithid(id){
    return new Promise(async(resolve,reject)=>{
        const all = await membership.find({userid:id}).lean();
      
            const promises = all.map(async(element) => {
            element.expired = membershipExpiration(element)
            console.log("Expiration:",element.expired)
            element.formattedexdate= new Date(element.expirydate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
            element.formattedisdate= new Date(element.issueddate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
            return element;
            }
        );
            await Promise.all(promises);
            resolve(all);
       
        
    })
}


// Example: Generate a membership ID with a length of 8 characters
function membershipExpiration(obj) {
    if (obj && obj.expirydate) {
        const expiryDate = new Date(obj.expirydate);
        if (expiryDate > Date.now()) {
            console.log("membership is valid");
            return true; // Optionally return a boolean indicating validity
        } else {
            console.log("membership has expired");
            return false; // Optionally return a boolean indicating validity
        }
    } else {
        console.log("Error: No expiry date provided or invalid object format");
        return false; // Optionally return a boolean indicating validity
    }
}



function findMymembership(id){
    return new Promise(async(resolve,reject)=>{
        const memb=await membership.findById(id).lean();
        resolve(memb)
    })
}


function findAllwithGym(gymId) {
    return new Promise(async (resolve, reject) => {
        try {
            // Query the memberships associated with the gym ID
            const allmemberships = await membership.find({ gymid: gymId }).lean();
            
            // Process each membership asynchronously
            const processedmemberships = await Promise.all(allmemberships.map(async (membership) => {
                // Calculate expiration and format date for each membership
                membership.expired = membershipExpiration(membership);
                membership.formattedexdate= new Date(membership.expirydate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                });
                membership.formattedisdate = new Date(membership.issueddate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                });
                return membership;
            }));

            // Resolve with the processed memberships
            resolve(processedmemberships);
        } catch (error) {
            // If an error occurs during database query or processing, reject the promise
            reject(error);
        }
    });
}

function findRevenue(id){
    return new Promise(async(resolve,reject)=>{
        const now = new Date();
        now.setDate(now.getDate() -30);
        //const tick=await ticket.find({gymid:id,issueddate:{$gte:now}})
        const allmemberships = await membership.find({ gymid: id,issueddate:{$gte:now} })

        var price=0
        allmemberships.forEach(tic=>{
            price=price+tic.price

        })
        //console.log(price)
        resolve(price)

        
    })
}




module.exports={
    generatemembership,
    formatDateTime,
    findAllwithid,
    findMymembership,
    findAllwithGym,
    findthenumberofmembers,
    findRevenue
}