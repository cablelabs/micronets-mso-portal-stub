/* mm-stub.js
 * Local stub for MM functionality, specific to DPP
 * Notes:
 * 	 - Actual implementation should use client certificates
 */

 'use strict';

 /*
<3>AP-STA-DISCONNECTED b8:27:eb:6e:3a:6f
<3>AP-STA-CONNECTED b8:27:eb:6e:3a:6f
*/


const express = require('express');
const router = express.Router();
const URL = require('url');
const ws = require('../lib/websockets.js');
var randomHex = require('randomhex');
/*
// Track response objects so we can respond later
let requests = {};

// Register callback for ws replies
ws.onMessage(function(reply) {


});


// POST dpp/onboard. 
// Here relayed from MSO Portal. This is a synchronous request - wait for response from gateway if connectWait = true
router.post('/onboard', function(req, res, next) {
    
    let message = req.body;

    // TODO: Get MUD url, and do whatever preprocessing is required with that.
    
    //	$ curl -L https://registry.micronets.in/mud/v1/mud-url/{req.body.vendor}/{req.body.key}
//
    //	# This returns the URL for the device MUD file
    //	# Process as required
    //

    // You'll need to track this operation, including:
    //   - the PSK you generate (for updating psk/vlan later in hostapd)
    //   - whatever you glean from processing the MUD file, eg. which vlan to assign
    //   - this http POST response object so you can return the request when onboard completes or times out
	//

    // Generate PSK (save it - Craig will need it later)
    message.psk = randomHex(32).substring(2);

    var messageId = ws.send()

    console.log("/mm-stub/onboard: \n" + JSON.stringify(req.body, undefined, 2));
    // res.send(JSON.stringify(req.body));

    var reply = { 
    	"response": "mm-stub = received request",
    	"request-body": req.body
    };

    res.send(JSON.stringify(reply));

    // TODO: timeout response
});
*/

// WS connection management code
module.exports = router;
