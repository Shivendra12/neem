var express = require('express');
var router = express.Router();
var sign = require('../api/controller/sign');
var signupemail = require('../api/controller/signupemail');

/* GET Api page. */
router.post('/register',sign.register);
router.post('/verifyOtpMobile',sign.verifyOtpMobile);
router.post('/login',signupemail.login);
router.post('/signupemail',signupemail.signupemail)
router.post('/verifyEmail',signupemail.verifyEmail);
module.exports = router;
