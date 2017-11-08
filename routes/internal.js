/* internal.js
 * Routes for stubbed private APIs
 * Mockup used to tie into the MSO subscriber accounts system
 */

var express = require('express');
var router = express.Router();
var subscribers = {};

// Static subscribers for testing
function addSubscriber(id, name, ssid) {
    subscriber = {};
    subscriber.id = id;
    subscriber.name = name;
    subscriber.ssid = ssid;
    subscribers[id] = subscriber;
}

addSubscriber(1, "Grandma", "Grandma's WiFi");
addSubscriber(2, "Uncle Bob", "Uncle Bob's WiFi");
addSubscriber(3, "Wendell", "Wendels's WiFi");

// This is just to get subscriber info that will be required by the client. For now, just SSID
router.get('/subscriber/:subscriberID', function(req, res, next) {
    // Check for valid user token
    if (subscribers[req.params.subscriberID] == undefined) {
        // Invalid request.
        res.status(400);
        var error = {};
        error.error = "Subscriber not found";
        error.status = 400;
        res.send(JSON.stringify(error, null, 2)+"\n");
    }
    else {
        res.send(JSON.stringify(subscribers[req.params.subscriberID], null, 2)+"\n");
    }
});

module.exports = router;
