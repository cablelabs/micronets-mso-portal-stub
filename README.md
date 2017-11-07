# mso-portal-stub

This is a stand-in for the TBD mso-portal, and is used to test the registration server and to validate the REST interface between the two servers.

## Overview
Implemented using Node.js, it has 3 distinct route tables:

- index (default routes, not used at this time)
- portal (mso-portal endpoints, primarily for registration tokens)
- ca (pass-thru requests to the CA)

## Requirements
- node.js version 8.0 or above (tested with 8.0 on MacOS Sierra) [download](https://nodejs.org/en/download/)
- jq (JSON parser, required ONLY if you need to use the test scripts) [download](https://stedolan.github.io/jq/download/)

## OpenSSL
We use OpenSSL as a local CA. Everything needed should be in the `test/ca` folder. The CA configuration mimicks what we have on `secradius`, and the mso-portal-stub server can be configured to run on that server as well. See the configuration stuff in `routes/ca.js`.
**IMPORTANT** - 
Before using the local CA for the first time:

    cd test/ca
    ./initca

This will create `index.txt` and `serial`. These files are not checked into the repo.

## Registration Token
The mso-portal needs to manage the device registration process from the time the device has been selected for onboarding until the required certs have been returned to the registration server (and passed thru to the device). I renamed the "user token" to "registration token" as it is created before the user is known, and is used to manage a registration context (session information). The registration context is needed to associate the token with the selected device, the subscriber, and the certificate request.

## Public REST Interface

### Get Registration Token:
Method: GET

The deviceID is provided in the URL. A random token is generated (and returned). The token is used internally to identify a registration context. The deviceID is stored in the registration context.

#### url: `/portal/registration-token/<deviceID>`
- deviceID:  Unique identifier for the device. TBD how the deviceID is initially created, for our testing we use a sha256 of the device's public key.

#### response:

    {
      "registration": {
        "token": "SYABZ"
      }
    }

### Get CSR Template
Method: GET

The CSR "template" is just metadata that the client (device) needs when generating a CSR. For now, it is just the encryption type. In addition to the registration token (used to identify the registration context) we also provide the subscriberID, as at this point the subscriber has been authenticated and we know the subscriberID. The mso-portal will need to make an internal request to the accounts/billing server to retrieve the subscriber information that we need to return to the registration server (and ultimately to the device). Initially this is just the SSID, but we also return the subscriberID and subscriber name for display/debug purposes. The subscriber information is not returned here, but added to the registration context. It will be later returned when the certificate is signed and returned.

#### url: `/ca/csrt/<token>/<subscriberID`
- token:  Registration token
- subscriberID: Identifies a subscriber account. The Registration Server obtains this when the subscriber authenticates using the clinic browser (eg. scanning QR Code)

#### response: 
(optional debug: contents of the registration context)

	{
	  "csr_template": {
	    "key_type": "RSA:2048"
	  },
	  "debug": {
	    "context": {
	      "token": "EXPZF",
	      "deviceID": "730c8aa0a2e535c8caa3e1398c6fdbb476223088551d45315fc4c9941cf55f9e",
	      "timestamp": 1510077436128,
	      "subscriber": {
	        "id": 1,
	        "name": "Grandma",
	        "SSID": "Grandma's WiFi"
	      }
	    }
	  }
	}

### Submit CSR:
Method: POST,  Content-Type: application/json

The registration token and the CSR are supplied in the POST body as JSON. 
NOTE: The CSR, wifiCert and caCert are base64 encoded to preserve line endings. REQUIRED!

#### url: `/ca/cert/`
    {
      "token": "<token>",
      "csr": "<base64 encoded CSR>"
    }

#### response:
The response is ultimately returned to the device.

    {
	  "subscriber": {
		"id": 1,
		"name": "Grandma",
		"SSID": "Grandma's WiFi"
	},
	  "wifiCert": "<base64 encoded WiFi Certificate>",
	  "caCert": "<base64 encoded CA Certificate>"
    }

## Private REST Interface
This is a stub for the accounts/billing endpoint.

### Get Subscriber:
Method: GET

The subscriberID is provided in the URL. The required subscriber information is returned. For now, all we really need is the SSID but we return Subscriber Name for display purposes.

#### url: `/internal/subscriber/<subscriberID>`
- subscriberID:  Unique identifier for subscriber (obtained by the registration server when subscriber is authenticated)

#### response:

    {
      "id": 1,
      "name": "Grandma",
      "SSID": "Grandma's WiFi"
    }


## Layout
- *mso-portal.js* - application wrapper (http server)
- *app.js* - application main
- *lib/* - local modules
- *node-modules* - installed modules
- *public/* - express resources (not used)
- *routes/* -
	- *index.js* - default routes (not used)
	- *portal.js* - non-ca urls (registration token)
	- *ca.js* - ca urls (not used)
	- *internal.js* - private API (accounts/billing, etc)
- *test/* -
	- *ca/* - local CA files
	- *client/* - client files generated by the test scripts (keys, token, deviceID, csr, certs, etc)
	- *scripts/* - (no arguments required. Results are stored in `test/client` folder)
		- *clean* - delete all client files (token, certs, csr, csrt, deviceID, keys)
		- *gen-clientkey* - generate key pair and deviceID (sha256 of public key)
		- *get-token* - request registration token
		- *get-csrt* - request CSR template
		- *gen-csr* - generate a CSR
		- *submit-csr* - submit CSR (certs/metadata returned)
		- *portal-test* - runs all of the above in sequence (except `clean`)
- *views/* - express templates (not used)

