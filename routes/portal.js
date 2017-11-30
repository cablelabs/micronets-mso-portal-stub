/* portal.js
 * Non-CA endpoints
 * Manage registration tokens
 */

'use strict';

const express = require('express');
const router = express.Router();
const registration = require('../lib/registration.js');

/* POST registration token. */
router.post('/registration-token', function(req, res, next) {
    let token = {}
    token.registration = {"token": registration.begin(req.body)}
    res.setHeader('content-type', 'application/json');
    res.send(JSON.stringify(token, null, 2)+"\n");
});

// Debugging only
router.get('/registrations', function(req, res, next) {
    res.send(registration.dump()+"\n");
});

module.exports = router;
