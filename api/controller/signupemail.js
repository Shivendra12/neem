var user = require("../../model/userModel");
var SendOtp = require('sendotp');
const sendOtp = new SendOtp('232881A0qhC1tUiPK5b7bbad0');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var randomstring = require('randomstring');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'shivendra.techgropse@gmail.com',
      pass: 'gropse@7117'
    }
  });


var signupemail = ((req,res)=>{
    console.log('AAAAAAAAAAAAAAAAAAAAAAAa',req.body);
    const otp = randomstring.generate(6);

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
        'password': {
            notEmpty : true, 
            isLength : {
                options  : [{min : 5, max : 8}],
                errorMessage : 'Invalid Password, Length Should be in 5 to 8 Character'
            },
        errorMessage : 'Please Fill The Password'
        },
    });

    const errors = req.validationErrors();
    if(errors){
        var errorMessage = [];
        errors.forEach((err)=>{
            errorMessage.push(err.msg);
        });
        return res.send({status : false , message : errorMessage[0], })
    }else{

    user.findOne({email : req.body.email}).then((response)=>{
        if(response){
            return res.json({status: false , message : "The E-mail. You entered is Already Registered"})
        }

        const pass = bcrypt.hashSync(req.body.password );
        var User = new user({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobile : req.body.mobile,
            password : pass,
            otp : otp,
            verifyEmail : false,

        })

     

    
        User.save((err,user)=>{
            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',user);
            if(err) {
                console.log('Error', err);
                return res.json({code:101,status : false , message : "Signup Not Successful"});
            }else {
                const mailOptions = {
                    from: 'shivendra.techgropse@gmail.com', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Account Activation | Neem', // Subject line
                    html: `
                            <body>
                            <h1>Hello ${req.body.email}</h1>
                            <h2>This is Your One Time Password : ${otp}</h2>
                    `// plain text body
                  };
                transporter.sendMail(mailOptions, function (err, info) {
                    if(err)
                      console.log(err)
                    else
                      console.log(info);
                 });

                 return res.json({code:100,status : true, message : "User SuccessFully saved, Please verify Your Mobile no."});
            }
        })

    })
    
}
});

var verifyEmail = ((req,res)=>{
    console.log('req.body',req.body);
    var email = req.body.email;
    var otp	=	req.body.otp;

    try{
            user.findOne({$and : [{email: email},{otp: otp}]},async(err,User) => {
                console.log('88888888888888888888888888888',  User);
                if (err) {
                    console.log('errrr2222',err);
                    return res.json({code : 101, status : false, message : 'Error Occured'});
                }
                if(User){
                console.log('7777777777777',  User);
                if(User.verifyEmail == true){
                    console.log('User11111',User.verifyEmail == true);
                     return res.json({code: 101, status : false, message : 'Error! Account already activated'});
                 } else{
                     User.verifyEmail = true;
                     User.save( function(err, saved){
                        if(err){
                         console.log('ERROR', err)    
                        return res.json({status: false, message:"Something went wrong"});
                        }
                        if(!saved){
                            return res.json({status: false, message:"Please try again"});
                        }
                        // console.log('saved1111',saved);
                            return res.json({code:100,status : false, message : 'E-mail VeriFied'});            
                    });
                 }
                }else {
                    return res.json({status : false ,message : 'Enter Correct Otp'});
                } 
            
            })
            

      
    }catch (error) {
        console.log("Errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr4",error);
        
        return res.json({status:false,message:"Error. Please try again"});
    }
});


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
        return res.send({status : false , message : errorMessage[0]})
    }else{

    user.findOne({$or:[{email:log.email}, {mobile: log.mobile}]}).then((resp)=>{
        if(resp!=null){
            if( bcrypt.compare(req.body.password, resp.password)){
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

module.exports = {signupemail
    ,verifyEmail,
    login
};