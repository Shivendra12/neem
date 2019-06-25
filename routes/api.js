var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var JWTSECRET = 'shivendra123';
var user = require('../model/userModel');
var sign = require('../api/controller/sign');
var signupemail = require('../api/controller/signupemail');


var verifyTokenAPII=function(req,res,next){
    // console.log('qqqqq',req.cookies.jwtToken[0]);
    if(req.cookies.jwtToken){
       token = req.cookies.jwtToken[0];
      console.log('ssss',token);
        // tokenStatus	=req.cookies.jwtToken[1];
        jwt.verify(token,JWTSECRET, function(err, decoded) {
          console.log('wwwwww',decoded);
          if (err)return res.redirect('/');
            user.findOne({_id: decoded.id}).then(function(res){
              // console.log('ssss',user.findOne,res);
              if(res==null || res=='')return res.redirect('/');
              console.log('35521',res)
              if(res){
                req.currentUser = res;
                console.log('current',res);
                return next();
              }
            }).catch(function(err){
              return res.redirect('/');
            });
        });
      
    }else {
      return res.redirect('/');
    }
  };
  

/* GET Api page. */
router.post('/register',sign.register);
router.post('/verifyOtpMobile',sign.verifyOtpMobile);
router.post('/login',signupemail.login);
router.post('/signupemail',signupemail.signupemail)
router.post('/verifyEmail',signupemail.verifyEmail);
module.exports = router;
