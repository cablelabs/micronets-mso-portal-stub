/* dpp.js
 * 
 *  STUBBED Endpoints specific to DPP operation
 */

'use strict';

const express = require('express');
const router = express.Router();
const session = require('express-session');
const URL = require('url');
const sessionCookieName = '3010.connect.sid'; 
const http = require('http');

// Note: we need httpOnly: false so that xhr login can store cookie.
//router.use(session({ secret: 'micronets-dpp', name: sessionCookieName, httpOnly: false }));
router.use(session({ secret: 'micronets-dpp', name: sessionCookieName }));

function checkAuth (req, res, next) {
	var urlPath = URL.parse(req.url).pathname;

	if (!req.session || !req.session.authenticated) {
		res.status(401).send('not authenticated');
	}
	else {
		next();
	}
}

// Mobile config
router.get('/config', function(req, res, next) {
	var config = {
		"deviceClasses" : ["Medical", "Security", "Personal", "Generic", "Shared"]
	}
	res.send(JSON.stringify(config));
});

// POST dpp/onboard 
router.post('/onboard', checkAuth, function(req, res, next) {

	console.log('\n POST ONBOARD REQUEST BODY : '+ JSON.stringify(req.body));
 	console.log('\n POST ONBOARD REQUEST HEADERS : '+ JSON.stringify(req.headers))  ;  


 	// Lookup subscriber MM endpoint

    // Forward to MM (STUB: Send to our local endpoint)

    /*
	var post_options = {
		host: "localhost",
		port: '3010',
		path: '/mm-stub/v1/onboard',
		method: 'POST',
		//headers: {
		//    'Content-Type': 'application/json',
		//    'Content-Length': Buffer.byteLength(post_data)
		//}
		headers: req.headers
	};

	// Set up the request
	var post_req = http.request(post_options, function(res2) {
		res2.setEncoding('utf8');

        var data = '';

	    // A chunk of data has been recieved.
	    res2.on('data', (chunk) => {
	        data += chunk;
	    });
	 
	    // The whole response has been received.
	    res2.on('end', () => {
	    	// return to sender
	    	console.log("response from MM: "+ data);
	    	res.send(data);
	    });

	});

	// post the data
	post_req.write(JSON.stringify(req.body));
	post_req.end();


    */
    setTimeout(function(){

    	var response = {
			"message" : {
				"messageId" : 2,
				"messageType" : "EVENT:DPP:DPPOnboardingCompleteEvent",
				"requiresResponse" : false,
				"messageBody" : {
					"DPPOnboardingCompleteEvent" : {
						"deviceId" : "MyDevice01",
						"reason" : "This is only a test",
						"micronetId" : "mockmicronet007",
						"macAddress" : req.body.mac
					}
				},
				"dataFormat" : "application/json"
			}
		}
	    console.log("/onboard: \n" + JSON.stringify(response, undefined, 2));
	    res.send(JSON.stringify(response));
    }, 5000);
});

// POST submit login form
router.post('/login', function(req, res, next) {

	// Our stub just hardcodes user/pass
	const userInfo = {
	    "alice": {
	        "sub": "9XE3-JI34-00132A",
	        "username": "alice",
	        "password": "alice"
	    },
	    
	    "bob": {
	        "sub": "1ZT5-OE63-57383B",
	        "username": "bob",
	        "password": "bob"
	    },
	    
	    "grandma": {
	        "sub": "7B2A-BE88-08817Z",
	        "username": "grandma",
	        "password": "grandma"
	    }
	};

    const username = req.body.username.trim();
    const password = req.body.password.trim();

    // Establish session
	if (userInfo[username] && userInfo[username].password == password) {
		// authorized, establish session
		req.session.username = username;
		req.session.authenticated = true;
		res.status(201).end();
	}
	else {
		res.status(401).end();
	}

    // ***************************************************** //
});

router.post('/logout', function(req, res, next) {
	if (!req.session || !req.session.authenticated) {
		res.status(200).end();  
	}
	else {
		req.session.destroy(function(err){  
	        if(err){  
	            res.status(500).send('failed to destroy session');
	        }  
	        else  
	        {  
	            res.status(204).end();  
	        }  
	    });  
	}
});

// debug endpoint to test for active session
router.post('/checksession', checkAuth, function(req, res) {
	res.status(200).send('authenticated');
});

module.exports = router;

