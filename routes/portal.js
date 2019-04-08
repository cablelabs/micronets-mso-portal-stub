/* portal.js
 * Non-CA endpoints
 * Manage registration tokens
 */

'use strict';

const express = require('express');
const router = express.Router();
const registration = require('../lib/registration.js');

/* POST registration token. */
router.post('/registration/token', function(req, res, next) {
    let token = {}
    token.accessToken = registration.begin(req.body);
    res.setHeader('content-type', 'application/json');
    var msg = JSON.stringify(token, null, 2)+"\n";
    res.send(msg);
    console.log(msg);
});

// Debugging only
router.get('/registration/list', function(req, res, next) {
    res.send(registration.dump()+"\n");
});

// Moved here from internal.js (Ashwini refactor)
var subscribers = {};

// Static subscribers for testing
function addSubscriber(id, name, ssid) {
    var subscriber = {};
    subscriber.id = id;
    subscriber.name = name;
    subscriber.ssid = ssid;
    subscribers[id] = subscriber;
}

addSubscriber("7B2A-BE88-08817Z", "Grandma", "Grandma's LINKSYS 1900");
addSubscriber("1ZT5-OE63-57383B", "Bob T. Builder", "Bob's TP-LINK AC1200");
addSubscriber("9XE3-JI34-00132A", "Alice I. Wonderland", "Alice's Netgear AC1750");

// This is just to get subscriber info that will be required by the client. For now, just SSID
// TODO: This should be protected, only allow requests from internal endpoints.
router.get('/subscriber/:subscriberID', function(req, res, next) {
    // Check for valid user token
    if (subscribers[req.params.subscriberID] == undefined) {
        // Invalid request.
        res.status(400);
        var error = {};
        error.error = "Subscriber not found";
        error.status = 400;
        res.send(JSON.stringify(error, null, 2));
    }
    else {
        //res.send(JSON.stringify(subscribers[req.params.subscriberID], null, 2));
        res.json(subscribers[req.params.subscriberID]);
    }
});


module.exports = router;
