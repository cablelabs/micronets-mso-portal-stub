/* websockets.js
 *
 *  - minimal implementation for mso-portal-stub (mm-stub)
 *  - ws-proxy must be running - no retry logic
 *  - not intended for actual use, just to demonstrate the DPP cow path
 */

/*
const WebSocket = require('ws');
const fs = require('fs');
const exec = require('child_process').exec;
let messageId = 1000;

// Do NOT use this in production
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Temp for testing
const subscriberID="7B2A-BE88-08817Z";
const gatewayID="Gateway757";
const peerId = subscriberID+":"+gatewayID;
const wsproxyurl="wss://ws-proxy-api.micronets.in:5050/micronets/v1/ws-proxy/sven";
var messageCallback = function(){};
var connected = false;

const ws = new WebSocket(wsproxyurl,{
    key: fs.readFileSync('./keys/micronets-ws-dpp-client.key.pem'),
    cert: fs.readFileSync('./keys/micronets-ws-dpp-client.cert.pem'),
    ca: fs.readFileSync('./keys/micronets-ws-root.cert.pem')
});

ws.on('open', function open() {
	console.log("open");
	connected = true;
	ws.on('error', function(evt) {
		console.log("The socket had an error", evt.error);
	});
});

ws.on('message', function incoming(data) {
	var reply = JSON.parse(data);
	if (reply.message.messageType == 'CONN:HELLO') {
		console.log("received HELLO");
		sendPing();
	}
	else {
		console.log("Received: "+ data);
		messageCallback(reply);
	}
});

function sendHello() {
	var message = {
		'message': {
			'messageId': ++messageId, 
    		'messageType': 'CONN:HELLO',
    		'requiresResponse': false,
    		'peerClass': 'micronets-ws-dpp-client',
    		'peerId': peerId 
    	}
    };
    ws.send(JSON.stringify(message));
    console.log("HELLO sent");
}

function sendPing() {
	var message = {
		'message': {
			'messageId': ++messageId, 
    		'messageType': 'CONN:PING',
    		'requiresResponse': false,
    		'peerClass': 'micronets-ws-dpp-client',
    		'peerId': peerId 
    	}
    };
    ws.send(JSON.stringify(message));
    console.log("PING sent");
}
function sendPong() {
	var message = {
		'message': {
			'messageId': ++messageId, 
    		'messageType': 'CONN:PONG',
    		'requiresResponse': false,
    		'peerClass': 'micronets-ws-dpp-client',
    		'peerId': peerId 
    	}
    };
    ws.send(JSON.stringify(message));
    console.log("PONG sent");
}

// Just need this until websocket is open, then registered events will keep from exiting.
setTimeout(function(){

},1000);

var self = module.exports = {
	send: function(messageType, body) {
		if (!connected) {
			console.log("websocket not connected");
			return 0;
		}
        var message = {
			'message': {
				'messageId': ++messageId, 
	    		'messageType': 'CONN:PONG',
	    		'requiresResponse': false,
	    		'peerClass': 'micronets-ws-dpp-client',
	    		'peerId': peerId,
	    		'body': body
	    	}
	    };
	    ws.send(JSON.stringify(message));
	    return messageId;
    },
    onMessage: function(callback) {
    	messageCallback = callback;
    }
}
*/
