var user = require("../../model/userModel");
var SendOtp = require('sendotp');
const sendOtp = new SendOtp('277721ALds15TD095ce418d7');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var JWTSECRET = 'shivendra123';


var register = ((req,res)=>{
    console.log('AAAAAAAAAAAAAAAAAAAAAAAa',req.body);

    req.checkBody({
        'firstName': {
            notEmpty : true,
            isLength : {
                options : [{min: 5 , max: 30}],
                errorMessage : 'Invalid FirstName, Length Should be in 5 to 30 Character'
            },
            errorMessage : 'Please Fill The First Name'
        },
        'lastName': {
            notEmpty : true,
            isLength : {
                options : [{min : 5 , max : 30}],
                errorMessage : 'Invalid LastName, Length Should be in 5 to 30 Character'
            },
            errorMessage : 'Please Fill The LastName'
        },
        'email' : {
            notEmpty : true,
            errorMessage : 'Please fill the E-mail Address'
        },
        'mobile' :{
            notEmpty : true,
            errorMessage : 'Please fill the Mobile no.'
        }, 
        'password' : {
            notEmpty : true, 
            isLength : {
                options : [{min : 5 , max : 8}],
                errorMessage : 'Invalid Password, Length Should Be in 5 to 8 Caharacter'
            },
            errorMessage : 'Please Fill The Password'
        }
    });

    const errors = req.validationErrors();
    if(errors){
        var errorMessage = [];
        errors.forEach((err)=>{
            errorMessage.push(err.msg);
        });
        return res.send({ code : 101, status : false , message : errorMessage[0], })
    }else{

    user.findOne({$or : [{email : req.body.email}, {mobile : req.body.password}]}).then((response)=>{
        if(response){
            return res.json({code : 101, status: false , message : "The Mobile no. You entered is Already Registered"})
        }

        const pass = bcrypt.hashSync(req.body.password, );
        var User = new user({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobile : req.body.mobile,
            password : pass,
            verifyNumber : false,

        })
        User.save((err,user)=>{
            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',user);
            if(err) {
                console.log('Error', err);
                return res.json({code:101,status : false , message : "Signup Not Successful"});
            }else {
                sendOtp.send("8357968250","NEEMAP", function(err, data){
                    console.log(',,,,,,,,,,,,,,,,,,,,,,,',err);
                    console.log('=======================',data);
                    var token = jwt.sign({id: users._id},JWTSECRET);
                    res.cookie('jwtToken',[token,true]);
                 return res.json({code:100,status : true, message : "User SuccessFully saved, Please verify Your Mobile no.",
                    data : {firstName : user.firstName,
                    lastName : user.lastName,
                    email : user.email,
                    mobile: user.mobile}
                });
                })
            }
        })

    })
    
}
});

var verifyOtpMobile = ((req,res)=>{
    console.log('111111111111111111111111',req.body);
    
    req.checkBody({
        'verifyOtp': {
            notEmpty : true,
            errorMessage : 'Plese Fill The Otp Number'
        },
        'mobile' : {
            notEmpty : true,
            errorMessage : 'Please Fill The Mobile No.'
        }
    });

    const errors = req.validationErrors();
    if(errors){
        var errorMessage = [];
        errors.forEach((err)=>{
            errorMessage.push(err.msg);
        });
        return res.send({ code : 101,status : false, message : errorMessage[0]})
    }else{

    var verifyOtp = req.body.verifyOtp;
    var mobile = req.body.mobile;
    sendOtp.verify(mobile,verifyOtp, ((resp,err)=>{
        console.log('222222222222222222222',err);
        if(err.type == "error"){
            return res.json({ code : 101,status : false , message : 'Invalid Otp'})
        }else{

        if(err.type == "success"){
            user.findOneAndUpdate({mobile: req.body.mobile},{$set : {verifyNumber : true}}, {new:true}).then((respo)=>{
                if(respo){
                    console.log('333333333333333333',respo);
                return res.json({ code : 100, status : true, message : 'Otp Verified Successfully'})
                }
            })
        }else {
            return res.json({code: 101,status : false, message: 'OTP Verification Failed'})
        }
    }
    }))
}
})


var login = ((req,res)=>{

    var log = {
        email : req.body.email,
        mobile : req.body.mobile,
        password : req.body.password
    }

    req.checkBody({
        // 'email' : {
        //     notEmpty : true,
        //     errorMessage : 'Please Fiil The E-mail Address'
        // },
        // 'mobile': {
        //     notEmpty : true,
        //     errorMessage : 'Please Fill The Mobile Number'
        // }, 
        'password' : {
            notEmpty : true, 
            isLength : {
                options : [{min : 5 , max : 8}],
                errorMessage : 'Invalid Password, Length Should Be in 5 to 8 Caharacter'
            },
            errorMessage : 'Please Fill The Password'
        }
    })

    const errors = req.validationErrors();
    if(errors){
        var errorMessage = [];
        errors.forEach((err)=>{
            errorMessage.push(err.msg);
        });
        return res.send({code:101, status : false , message : errorMessage[0]})
    }else{

    user.findOne({$or:[{email:log.email}, {mobile: log.mobile}]}).then(async(resp)=>{
        if(resp!=null){
            if( await bcrypt.compare(req.body.password, resp.password)){
                if(resp.verifyNumber == false){
                    return res.json({code : 101, status : false , message : 'Please Verify Your Mobile no.'})
                }else {
                    
                    return res.json({
                        code: 100,
                        status: true,
                        message: 'Login Successfully',
                       data :   { firstName : resp.firstName,
                        lastName: resp.lastName,
                        email : resp.email,
                        mobile : resp.mobile}
                    })
                }
            }else{
                return res.json({code : 101 ,  status : false , message : 'incorrect password'})
            }
        }else{
            return res.json({code : 101 , status : false, message : 'Please Signup'})
        }
    })
}
})

module.exports = {register
    ,verifyOtpMobile,
    // login
};