
const request = require('request-promise');

var self = module.exports = {

	gateway: process.env.gateway,
	micronetName: "security",
	deviceID: "abcd1234",
	device: {},

	createMicronet: async function() {

		console.log("Creating '" + self.micronetName + "' Micronet on Gateway: " + self.gateway);

		// delete pre-emptively
		await self.deleteMicronet(self.micronetName);
		
		// Create new micronet
		body = {
		    "micronet": {
		        "micronetId": self.micronetName,
		        "ipv4Network": {
		            "network": "10.135.1.0",
		            "mask": "255.255.255.0",
		            "gateway":"10.135.1.1"
		        },
		        "interface": "wlp2s0",
		        "vlan": 101
		    }
		};

		try {
			uri = `http://${self.gateway}:5000/micronets/v1/gateway/micronets`;
			self.micronet = await request({uri: uri, headers: "application/json", method: "POST", json: body});
			console.log("Micronet created: "+JSON.stringify(self.micronet));
		} catch (e) {
			if (e.statusCode != 201) {
				console.log("Unable to create micronet: "+JSON.stringify(e));					
			}
		} 
	},
	deleteMicronet: async function() {
		try {
			uri = `http://${self.gateway}:5000/micronets/v1/gateway/micronets/${self.micronetName}`;
			await request({uri: uri,	method: "DELETE"});
		} catch (e) {
			if (e.statusCode != 404 && e.statusCode != 204) {
				console.log("Unable to delete micronet: "+JSON.stringify(e));					
			}
		} 
	},
	createDevice: async function(mac) {

		await self.deleteDevice();

		body = {
		    "device": {
		        "deviceId": self.deviceID,
		        "macAddress": {
		           "eui48": mac
		        },
		        "networkAddress": {
		           "ipv4": "10.135.1.3"
		        },
		        "psk": "736b697070957220687410612076657379207665727920676f6f642063617421"
		    }
		}

		try {
			uri = `http://${self.gateway}:5000/micronets/v1/gateway/micronets/${self.micronetName}/devices`;
			response = await request({uri: uri, headers: "application/json", method: "POST", json: body});
			self.device = response;
			console.log("Device created: "+JSON.stringify(self.device));
		} catch (e) {
			if (e.statusCode != 201) {
				console.log("Unable to create device: "+JSON.stringify(e));					
			}
		} 
	},
	deleteDevice: async function() {
		try {
			uri = `http://${self.gateway}:5000/micronets/v1/gateway/micronets/${self.micronetName}/devices/${self.deviceID}`;
			response = await request({uri: uri,	method: "DELETE"});
		} catch (e) {
			if (e.statusCode != 404 && e.statusCode != 204) {
				console.log("Unable to delete device: "+JSON.stringify(e));					
			}
		} 
	},
	getDevice: async function() {
		try {
			uri = `http://${self.gateway}:5000/micronets/v1/gateway/micronets/${self.micronetName}/devices/${self.deviceID}`;
			return await request({uri: uri,	method: "GET"});
		} catch (e) {
			if (e.statusCode != 200) {
				console.log("Unable to get device: "+JSON.stringify(e));					
			}
		} 
	},
	updateDevicePSK: async function() {
		try {
			uri = `http://${self.gateway}:5000/micronets/v1/gateway/micronets/${self.micronetName}/devices/${self.deviceID}`;
			device = self.device;
			// rotate the PSK by one character
			psk = self.device.device.psk
			device.device.psk = psk[psk.length - 1] + psk.substring(0, psk.length - 1);
			self.device = await request({uri: uri,	method: "PUT", json: device});
			console.log("Device PSK Updated: "+self.device.device.psk);
			return self.device
		} catch (e) {
			if (e.statusCode != 200) {
				console.log("Unable to update PSK: "+e.statusCode);					
			}
		} 
	},
	onboard: async function(uri) {
		body = {
		    "dpp": {
		    	"akms": ["psk" ],
		        "uri": uri
		    }
		}

		try {
			uri = `http://${self.gateway}:5000/micronets/v1/gateway/micronets/${self.micronetName}/devices/${self.deviceID}/onboard`;
			await request({uri: uri,	method: "PUT", json: body});
			console.log("DPP Onboard Initiated");					
		} catch (e) {
			if (e.statusCode != 200) {
				console.log("Unable to initiate onboard: "+JSON.stringify(e));					
			}
		} 
	},
	doOnboard: async function(mac, uri) {
		await self.createDevice(mac);
		//console.log("await - device created");
		await self.onboard(uri);
	}
}