# micronets-mso-portal-stub

This is a mockup of the mso-portal, and is used to test the registration server and to validate the REST interface between the two servers. It provides a way to test the front end functionality without an actual back end.

## Overview
Implemented using Node.js, it has 4 distinct route tables:

- index (default routes, not used at this time)
- portal (mso-portal endpoints, primarily for registration tokens)
- ca (pass-thru requests to the CA)
- internal (stubbed private API for mso accounts endpoint)

## Requirements
- node.js version 8.0 or above (tested with 8.9 on MacOS Sierra) [download](https://nodejs.org/en/download/)
- jq (JSON parser, required ONLY if you need to use the test scripts) [download](https://stedolan.github.io/jq/download/)

## OpenSSL
We use OpenSSL as a local CA. Everything needed should be in the `test/ca` folder. The CA configuration mimicks what we have on `secradius`, and the mso-portal-stub server can be configured to run on that server as well. See the configuration stuff in `routes/ca.js`.

**IMPORTANT** - Before using the local CA for the first time:

    cd test/ca
    ./initca

This will create `index.txt` and `serial`. **These files are not checked into the repo.**

## Registration Token
The mso-portal needs to manage the device registration process from the time the device has been selected for onboarding until the required certs have been returned to the registration server (and passed thru to the device). I renamed the "user token" to "registration token" as it is created before the user is known, and is used to manage a registration context (session information). The registration context is needed to associate the token with the selected device, the client (registration server), the subscriber, and the certificate request.

**NOTE:** This stub server uses a short random alpha string for the registration token. The actual mso-portal will use a JWT token. 

## API

### Request Registration Token:
Method: POST

The deviceID and clientID are provided in the POST body as JSON data. An authorization token is generated (and returned). The token is used internally to identify a registration context when it receives subsequent requests in this registration process (csrt, cert). The deviceID and clientID are stored in the registration context.

#### url: `/portal/registration/token`

Header Fields:

    content-type: "application/json"

POST data:

    {
      "clientID": "<clientID>", // Unique identifier for the registration server. 
      "deviceID": "<deviceID>", // Unique identifier for the device. 
      "vendor": "<vendor>",		// Device manufacturer/vendor
      "type": "<type>",			// Device type - friendly name, eg. "Heartrate Monitor"
      "model": "<model>",		// Device model - eg. "Accu-Pulse"
      "serial": "<serial>,"		// Device serial (manufacturer's serial, NOT deviceID)
      "macAddress": "<MAC>,"	// Device MAC address
      "modelUID64": "<uid-64>"  // UID-64 model indentifier for looking up MUD
      "mudURL": "<url>,"		// Location of device MUD file
      "class": "<class>"		// Device Class (eg. Medical)
    }

#### response:

    {
    	"acessToken": "SYABZ"
    }

### Request CSR Template
Method: POST

The CSR "template" is just metadata that the client (device) needs when generating a CSR. For now, it is just the encryption type. In addition to the registration token (used to identify the registration context) we also provide the subscriberID, as at this point the subscriber has been authenticated and we know the subscriberID. The mso-portal will need to make an internal request to the accounts/billing server to retrieve the subscriber information that we will need to return to the registration server (and ultimately to the device). Initially this is just the SSID, but we also return the subscriberID and subscriber name for display/debug purposes. The subscriber information is not returned here, but added to the registration context. It will be later returned when the certificate is signed and returned.

#### url: `/ca/csrt`

Header Fields:

    content-type: "application/json"
    authorization: "<registration token>"

POST data:

    {
      "subscriberID": "<subscriberID>"	
    }

The `subscriberID` identifies a subscriber account. The Registration Server obtains this when the subscriber authenticates using the clinic browser (eg. scanning QR Code)

#### response: 
(optional debug: contents of the registration context)

	{
	  "csrTemplate": {
	    "keyType": "RSA:2048"
	  },
	  "debug": {
	    "context": {
	      "token": "EXPZF",
	      "clientID": "www.happyclinic.com",
	      "deviceID": "730c8aa0a2e535c8caa3e1398c6fdbb476223088551d45315fc4c9941cf55f9e",
	      "timestamp": 1510077436128,
	      "subscriber": {
	        "id": 1,
	        "name": "Grandma",
	        "ssid": "Grandma's WiFi"
	      }
	    }
	  }
	}

### Submit CSR:
Method: POST

The CSR is submitted to the CA. A wifi certificate is created and signed. The wifi certificate, CA certificate are base64 encoded and returned as JSON along with subscriber metadata.

#### url: `/ca/cert/`

Header Fields:

    content-type: "application/json"
    authorization: "<registration token>"

POST data:

    {
      "csr": "<base64 encoded CSR>"
    }

**NOTE:** The CSR, wifiCert and caCert are base64 encoded to preserve line endings. **REQUIRED!**

#### response:
The response is ultimately returned to the device.

    {
	  "subscriber": {
		"id": 1,
		"name": "Grandma",
		"ssid": "Grandma's WiFi"
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
      "ssid": "Grandma's WiFi"
    }


## Repository Layout
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

## Build
Edit `package.json` to be sure the docker remote registry URL is correct for the `docker_publish` script

```  "scripts": {
    "start": "node ./mso-portal",
    "docker-build": "docker build -t community.cablelabs.com:4567/micronets-docker/micronets-mso-portal-stub .",
    "docker-publish": "docker login community.cablelabs.com:4567; docker push community.cablelabs.com:4567/micronets-docker/micronets-mso-portal-stub"
  },
```
Install packages, build and publish:
```
  npm install
  npm run docker_build
  npm run docker_publish
```
## Deploy
The Micronets MSO Portal (stub) is deployed as a docker container.
Docker deployment instructions can be found [here](https://github.com/cablelabs/micronets/wiki/Docker-Deployment-Guide)

NOTE: MSO Portal (stub) is intended as a test backend and cannot be run simultaneously with the actual MSO Portal without special configuration.

The environment variables to be passed to the authorization server are:
```
  -e PORT=3010              # port to listen on
```

## Example run command
```
docker run -d --name=micronets-mso-portal-stub  -p 3010:3010 -e PORT=3010 community.cablelabs.com:4567/micronets-docker/micronets-mso-portal-stub:latest
```
