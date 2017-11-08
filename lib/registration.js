/* registration.js
 * Create/manage registration contexts
 * TODO: Expire/remove aged contexts
 */

const uuidv4 = require('uuid/v4');

// Private
var contexts = {}
var uuids = false;

// Generate registration tokens. Short alpha strings for debugging, uuids for production
function generateToken() {

    if (!uuids) {
        var len = 5;
        var index;
        var alphaStr = "";

        for(index=0;index<len;index++) {
            var ch = Math.floor(Math.random()*26) + 65;
            alphaStr += String.fromCharCode(ch);
        }
        return (alphaStr);
    }
    else {
        return uuidv4();
    }
}

// Public. 
var self = module.exports = {

    // Establish registration context, associate deviceID. Replace existing if found.
    begin: function(deviceID, clientID) {
        self.end(self.find(deviceID));   // if present. 
        var context = {};
        context.token = generateToken();
        context.deviceID = deviceID;
        context.clientID = clientID;
        context.timestamp = Date.now();

        contexts[context.token] = context;
        self.debug && console.log(self.dump());
        return context.token;
    },
    // Pair subscriber with device. We'll need this information later when we return the CERT.
    pair: function(token, subscriber) {

        var context = contexts[token];
        if (context != undefined) {
            context.subscriber = subscriber;
            return true;
        }
        else {
            return false;
        }
    }, 
    end: function(token) {
        if (token != undefined) {
            delete contexts[token];
        }
    },
    dump: function() {
        return (JSON.stringify(contexts, null, 2));
    },
    get: function(token) {
        return contexts[token];
    },
    // Lookup context by deviceID.
    find: function(deviceID) {
        var tokens = Object.keys(contexts);
        for (var token of tokens) {
            var context = contexts[token];
            if (context.deviceID === deviceID) {
                //console.log("found context for "+deviceID);
                return token;
            }
        }
        return undefined;
    },
    debug: true
 }