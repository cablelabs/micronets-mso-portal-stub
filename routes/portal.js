/* portal.js
 * Non-CA endpoints
 * Manage registration tokens
 */

'use strict';

const express = require('express');
const router = express.Router();
const registration = require('../lib/registration.js');

/* GET registration token. */
router.get('/registration-token/:deviceID', function(req, res, next) {
	console.log(JSON.stringify(req.headers));
    let token = {}
    token.registration = {"token": registration.begin(req.params.deviceID,"clientxxx")}
    res.send(JSON.stringify(token, null, 2)+"\n");
});

// New, use post, deviceID and clientID in body
/* POST registration token. */
router.post('/registration-token', function(req, res, next) {
    let token = {}
    token.registration = {"token": registration.begin(req.body)}
    res.send(JSON.stringify(token, null, 2)+"\n");
});

// Debugging only
router.get('/registrations', function(req, res, next) {
    res.send(registration.dump()+"\n");
});

module.exports = router;
