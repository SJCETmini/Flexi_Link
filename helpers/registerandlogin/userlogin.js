// var db=require('../../config/connection')
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const { resourceLimits } = require('worker_threads');
const { resolve } = require('path');
const gymownerSchema = new Schema({
    email: String,
    username: String,
    password: String,
    verified: { type: Boolean, default: false } // Add the 'verified' field with default value false
  });
  

const gymowner= mongoose.model('owner', gymownerSchema);

function register(userData){
    console.log(userData)
    return new Promise(async(resolve,reject)=>{
        
        userData.password=await bcrypt.hash(userData.password,10)
        const newowner = new gymowner();
        newowner.email=userData.email;
        newowner.username=userData.username;
        newowner.password=userData.password;
        newowner.save();
        resolve(newowner);
    })

}

function login(userdata){
    return new Promise(async(resolve,reject)=>{
        let response={};
        const eml=userdata.email;
        const psd=userdata.password;
        const filter={email:eml}
        const val=await gymowner.findOne(filter).exec();
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



    function fd(ids){
        console.log(ids)
        return new Promise(async(resolve,reject)=>{

            const idswithoutdate = ids.map(ids1 => ids1.owner);
            console.log(idswithoutdate)
            
                try {
                    // Find GymOwners with the provided _id values
                    const owners = await gymowner.find({ _id: { $in: idswithoutdate } }, 'email username _id');
                    console.log(owners)
            
                    // Extract emails and usernames from the retrieved GymOwners
                    const result = owners.map(owner => ({
                        id:owner._id,    
                        email: owner.email,
                        username: owner.username
                    }));
            
                    resolve(result)
                } catch (error) {
                    console.error('Error fetching emails and usernames:', error);
                    throw error;
                }
            
        })
    }

    function fds1(ids){
        return new Promise(async(resolve,reject)=>{

            const result=[];

            
            for (const item of ids){
                console.log(item.owner)
                const owner = await gymowner.findById(item.owner);
                console.log(owner)

                owner.applieddate=item.date

                console.log(owner.applieddate)

                result.push(owner)


            }

            resolve(result)

        })
    }





    // async function fnd(){
    //     const filter={email:eml}
    //     const val=await user.findOne(filter).exec();
    //     if(val){

    //         bcrypt.compare(psd, val.password, function(err, result) {
    //             if(result){
    //                 console.log("success");
    //             }else{
    //                 console.log("wrong password");
    //             }
    //         });
    //     }
    //     else{
    //        console.log("seen");
    //     }
    // }

    // fnd();

function getFulldetails(idsArray){
    return new Promise(async(resolve,reject)=>{
        const owners = await gymowner.find({ _id: { $in: idsArray } }).lean().exec();
        console.log(owners)
        resolve(owners)


    })

}
module.exports = {
    register,
    login,
    fd,fds1,getFulldetails
    
}
  