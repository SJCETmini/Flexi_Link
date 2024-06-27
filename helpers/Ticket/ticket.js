const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const { resolve } = require('path');
const membership = require('../membership/membership')
const TicketSchema = new Schema({
    gymid: { type: Schema.Types.ObjectId, ref: 'Gym' },
    userid: { type: Schema.Types.ObjectId, ref: 'User' },
    username: String,
    gymname:String,
    issueddate: { type: Date, default: Date.now },
    expirydate: { 
        type: Date, 
        default: function() {
            const now = new Date();
            now.setDate(now.getDate() + 1); // Adding 1 day (24 hours)
            return now;
        }
    },
    ticketid: { type: String, default: generateTicketID( Math.floor(Math.random() * (4 - 9 + 1)) + 9) },
    price:Number
});

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






  function generateTicketID(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charLength = characters.length;
      let ticketID = '';
  
      for (let i = 0; i < length; i++) {
          const seed = Date.now() + i; // Using a unique seed for each character
          const randomIndex = crypto.createHash('sha256').update(seed.toString()).digest('hex')[0];
          ticketID += characters.charAt(parseInt(randomIndex, 16) % charLength);
      }
  
      return ticketID;
  }
  

const ticket = mongoose.model('ticket', TicketSchema);

async function getTicketCountForUser(userId, gymId) {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

        console.log("USERID:", userId);
        console.log("GYMID:", gymId);
        console.log("Start of Month:", startOfMonth);
        console.log("End of Month:", endOfMonth);
        const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
        const gymObjectId = mongoose.Types.ObjectId.createFromHexString(gymId);

        const ticketCount = await ticket.countDocuments({
            userid: userObjectId,
            gymid: gymObjectId,
            issueddate: { $gte: startOfMonth, $lte: endOfMonth }
        });
        console.log("Ticket Count:", ticketCount);
        return ticketCount;
    } catch (error) {
        console.error('Error getting ticket count:', error);
        throw new Error('Error fetching ticket count');
    }
};


function generateTicket(id,name,price,userid,username){
    return new Promise(async(resolve,reject)=>{
        const newticket= new ticket()
        newticket.gymid=id
        newticket.gymname=name
        newticket.price=price
        newticket.userid=userid
        newticket.username=username


        newticket.save()
        .then((savedGym) => {
            // Format the date before resolving
            
            
            resolve(savedGym);
        })
        .catch((error) => {
            reject(error);
        });


    })
}

async function getValidTicketForUser(userId, gymId) {
    try {
        const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
        const gymObjectId = mongoose.Types.ObjectId.createFromHexString(gymId);
      const currentDate = new Date();
  
      const existing = await ticket.findOne({
        userid: userObjectId,
        gymid: gymObjectId,
        expirydate: { $gt: currentDate }
      });
  
      return existing;
    } catch (error) {
      throw new Error(`Failed to get ticket for user: ${error.message}`);
    }
  }
  

function findAllwithid(id){
    return new Promise(async(resolve,reject)=>{
        const all = await ticket.find({userid:id}).lean();
      
            const promises = all.map(async(element) => {
            element.expired = ticketExpiration(element)
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

// Example: Generate a ticket ID with a length of 8 characters
function ticketExpiration(obj) {
    if (obj && obj.expirydate) {
        const expiryDate = new Date(obj.expirydate);
        if (expiryDate > Date.now()) {
            console.log("Ticket is valid");
            return true; // Optionally return a boolean indicating validity
        } else {
            console.log("Ticket has expired");
            return false; // Optionally return a boolean indicating validity
        }
    } else {
        console.log("Error: No expiry date provided or invalid object format");
        return false; // Optionally return a boolean indicating validity
    }
}


function findMyticket(id){
    return new Promise(async(resolve,reject)=>{
        const tic=await ticket.findById(id).lean();
        resolve(tic)
    })
}

function findAllwithGym(gymId) {
    return new Promise(async (resolve, reject) => {
        try {
            // Query the tickets associated with the gym ID
            const allTickets = await ticket.find({ gymid: gymId, }).lean();
            
            // Process each ticket asynchronously
            const processedTickets = await Promise.all(allTickets.map(async (ticket) => {
                // Calculate expiration and format date for each ticket
                ticket.expired = ticketExpiration(ticket);
                ticket.formattedisdate = new Date(ticket.issueddate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                });
                return ticket;
            }));

            // Resolve with the processed tickets
            resolve(processedTickets);
        } catch (error) {
            // If an error occurs during database query or processing, reject the promise
            reject(error);
        }
    });
}

function verifyTicket(num, tic) {
    return new Promise(async(resolve, reject) => {
        try {
            console.log("Original value:", num);
        
            if (num.length !== 24) {
                console.log("Trimming the last character...");
                num = num.substring(0, 24);
                console.log("Trimmed hex string:", num);
            }

            num = mongoose.Types.ObjectId.createFromHexString(num); 
            console.log("ObjectId:", num);

            const sample = await ticket.find({ gymid: num, ticketid: tic});
            console.log("Sample:", sample);
            resolve(sample);
        } catch (error) {
            console.log("Error:", error);
            reject(error);
        }
    });
}


function findcureentmonthtic(gym){
    return new Promise(async(resolve,reject)=>{
        const now = new Date();
        now.setDate(now.getDate() -30);
        const tick=await ticket.countDocuments({gymid:gym,issueddate:{$gte:now}})
        resolve(tick)
    })
  }

  function calculateincomefromtic(id){
    return new Promise(async(resolve,reject)=>{

        const now = new Date();
        now.setDate(now.getDate() -30);
        const tick=await ticket.find({gymid:id,issueddate:{$gte:now}})
        console.log(tick)
        var price=0
        tick.forEach(tic=>{
            price=price+tic.price

        })
        resolve(price)
       
      

    })
  }

  function calculate_revenue_for_all_gym(gyms){
    return new Promise(async(resolve,reject)=>{
        const now = new Date();
    now.setDate(now.getDate() - 30);

    let wholeRevenue = 0;
    let totalMemberships = 0;

    // Iterate over each gym and calculate the revenue
    const revenuePromises = gyms.map(async (gym) => {
      const tickets = await ticket.find({ gymid: gym._id, issueddate: { $gte: now } });
      let totalRevenue = 0;

      tickets.forEach(ticket => {
        totalRevenue += ticket.price;
      });
      const memberships = await membership.membership.find({ gymid: gym._id, issueddate: { $gte: now } });
      let membershipRevenue = 0;
      let membershipCount = memberships.length;
      memberships.forEach(membership => {
        membershipRevenue += membership.price;
      });

      // Combine the revenues
      const finalRevenue = totalRevenue + membershipRevenue;

      wholeRevenue += finalRevenue;
      totalMemberships += membershipCount;

      return { _id: gym._id, name: gym.name, revenue: finalRevenue };
    });

    // Wait for all revenue calculations to complete
    const gymsWithRevenue = await Promise.all(revenuePromises);
    //console.log('hey hello')
    //console.log('Whole gym revenue',wholeRevenue)
    //console.log(gymsWithRevenue)
    let totalgym=gymsWithRevenue.length
    var membercondition=false
    var actualrevenue=false
    var rating=false
    if (totalMemberships>1) {
        membercondition=true
    }
    if (wholeRevenue>1000) {
        actualrevenue=true
    }
    const result = {
        gymsWithRevenue,
        wholeRevenue,
        totalMemberships,
        totalgym,
        membercondition,
        actualrevenue,
        rating
      };
    resolve(result);


    })
  }


module.exports={
    getTicketCountForUser,
    generateTicket,
    getValidTicketForUser,
    formatDateTime,
    findAllwithid,
    findMyticket,
    findAllwithGym,
    verifyTicket,
    findcureentmonthtic,
    calculateincomefromtic,
    calculate_revenue_for_all_gym
}
