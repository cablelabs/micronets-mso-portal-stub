/* portal.js
 * Non-CA endpoints
 * Manage registration tokens
 */
 
var express = require('express');
var router = express.Router();
var registration = require('../lib/registration.js');


/* GET registration token. */
router.get('/registration-token/:deviceID', function(req, res, next) {
    var token = {}
    token.registration = {"token": registration.begin(req.params.deviceID)}
    res.send(JSON.stringify(token, null, 2)+"\n");
});

// Debugging only
router.get('/registrations', function(req, res, next) {
    res.send(registration.dump()+"\n");
});

module.exports = router;
