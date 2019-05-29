var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({

    email :{
        type: String,
        trim : true,
        required : true,
    },
    // name :{
    //     type: String,
    //     trim : true,
    //     required : true,
    // },
    firstName :{
        type : String,
        trim : true,
        required : true,
    },
    lastName : {
        type: String,
        trim : true,
        required : true
    },
    // mobile : {
    //     type : String, 
    //     trim : true,
    //     required : true
    // },
    password : {
        type : String,
        trim :  true,
        required : true,
    },
    otp	:{ type: String ,default: null},


    // verifyNumber : {
    //     type : Boolean,
    //     required : true
    // }, 

    createdAt : {
        type : String,
        default : new Date()
    },
    verifyEmail : {type : Boolean , required : true},

    // status : {
    //     activeEmailToken : {type :String},
    //     activeEmailTokenExp : {type : String},
    // }
})
var user = mongoose.model("user" , userSchema);

module.exports = user;