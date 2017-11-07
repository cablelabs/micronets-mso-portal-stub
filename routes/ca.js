/* ca.js
 * This is a mockup of the MSO CA wrapper. TBD: Forward CA related requests to the actual CA. 
   - CSR Template:  Returns a JSON CSR Template - information that the device will need to create the CSR
   - Certificate: Returns a signed device certificate + CA certificate + metadata (SSID, etc) that the device will need to use the certificate
 */

'use strict';

const express = require('express');
const router = express.Router();
const registration = require('../lib/registration.js');
const http_request = require('../lib/http_request.js').http_request;
const pshell = require('../lib/pshell.js');  // promisified shell commands (exec, spawn, execFile, etc)
const fsp = require('fs-extra');
const path = require('path');


// Return extra info in responses
const debug = true;

let caConfig = {};

// Delete all client certs so we can resubmit the same CSR
const localTest = true;

if (localTest) {
    caConfig.dir = path.join(__dirname, '../', 'test', 'ca');
    caConfig.secret = "secblanket";
}
else {
    caConfig.dir = "/etc/freeradius/certs";
    caConfig.secret = "secblanket";
}

// For the mockup, our "accounts" server is this node instance. (http://localhost:3010)
function accountsURL(req) {
    return "http://"+req.headers.host+"/internal/subscriber/";
}

// Return a CSR Template. The device needs to know the key type to put into the CSR, maybe other things in the future.
// We need to be sure there is an active registration context and a valid subscriberID to associate with that context.
router.get('/csrt/:token/:subscriberID', function(req, res, next) {
    // First check for valid subscriberID
    http_request(accountsURL(req)+req.params.subscriberID, function(error, subscriber){
        //console.log("accounts - error: "+error);
        if (error != null || subscriber.error != null) {
            let err = {};
            err.error = error ? error : subscriber.error;
            err.status = 400;

            res.status(err.status);
            res.send(JSON.stringify(err, null, 2)+"\n");
        }
        else {
            // Valid subscriberID, now check for active registration token.
            if (registration.pair(req.params.token, subscriber) == true) {
                // Success 
                var template = {"csrTemplate": {"keyType": "RSA:2048"}};
                if (debug == true) {
                    template.debug = {"context": registration.get(req.params.token)};
                }
                res.send(JSON.stringify(template, null, 2)+"\n");
            }
            else {
                var err = {};
                err.error = "Registration token not found";
                err.status = 400;

                res.status(err.status);
                res.send(JSON.stringify(err, null, 2)+"\n");                
            }
        }
    });
});

// Create a device certificate. Return the device certificate, the ca-certificate, 
// device identifier (could be manufacturer deviceID), and SSID.
// POST body is expected to be JSON, with csr and token elements
router.post('/cert', function(req, res) {

    let returnObj = {};

    (async () => {
        try {

            // Ensure we have a ./tmp directory
            await fsp.mkdirp(caConfig.dir+"/tmp");

            // Retrieve registration context
            const context = registration.get(req.body.token);
            var ret;

            //console.log("post: "+JSON.stringify(req.body));

            // We need the CSR saved to a file.
            const csrFile = caConfig.dir+"/tmp/csr.tmp";
            const crtFile = caConfig.dir+"/tmp/crt.tmp";
            const caPemFile = caConfig.dir+"/ca.pem";
            const caKeyFile = caConfig.dir+"/ca.key";

            // csr was base64 encoded to preserve line endings
            var b64string = req.body.csr;
            await fsp.writeFile(csrFile, Buffer.from(b64string, 'base64').toString('utf8'), 'utf8');

            // Generate the certificate
            await pshell.exec("openssl ca -keyfile ca.key -cert ca.pem -in tmp/csr.tmp -key secblanket -out tmp/crt.tmp -config client.cnf -batch", caConfig.dir);
            var returnObj = {};

            var caCert = await fsp.readFile(caPemFile);
            var wifiCert = await fsp.readFile(crtFile);

            returnObj.subscriber = context.subscriber;  // SubscriberID, Subscriber Name, SSID
            returnObj.wifiCert = wifiCert.toString('base64');
            returnObj.caCert = caCert.toString('base64');

            res.send(JSON.stringify(returnObj)+"\n");

        } catch (e) {
            console.log('/cert error: ', e);
            let err = {};
            err.error = e;
            err.status = 400;

            res.status(err.status);
            res.send(JSON.stringify(err, null, 2)+"\n");
        } finally {
            // Remove the registration context
            registration.end(req.body.token);
        }
    })();
});

module.exports = router;

