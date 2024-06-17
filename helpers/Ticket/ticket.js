const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const { resolve } = require('path');

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


module.exports={
    getTicketCountForUser,
    generateTicket,
    formatDateTime,
    findAllwithid,
    findMyticket,
    findAllwithGym,
    verifyTicket,
    findcureentmonthtic,
    calculateincomefromtic
}
