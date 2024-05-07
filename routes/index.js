var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('./home/Homeindex');
});

router.get('/registergym', function(req, res, next) {
  res.render('./gym-owner/registergym');
});
router.get('/owner-dashboard', function(req, res, next) {
  res.render('./gym-owner/owner-dashboard');
});
router.get('/gymimage', function(req, res, next) {
  res.render('./gym-owner/gymimage');
});
router.get('/getaddress', function(req, res, next) {
  res.render('./gym-owner/getaddress');
});
router.get('/check', function(req, res, next) {
  res.render('./gym-owner/check');
});

router.get('/ticket', function(req, res, next) {
  res.render('./users/ticket');
});


module.exports = router;
