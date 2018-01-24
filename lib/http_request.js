/* http_request.js
 * Make an external http request while processing one.
 * TODO: Promisify this.
 */

const http = require('http');

var self = module.exports = {

    http_get: function(url, callback) {

        http.get(url, (resp) => {
            var data = '';
         
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
         
            // The whole response has been received.
            resp.on('end', () => {
                var json = JSON.parse(data);
                //console.log("http_request: "+json);
                callback(null, json);
            });
         
        }).on("error", (err) => {
            console.log("Error: " + err.message);
            callback(err.message, null);
        });
    },

    http_post: function(url, body, callback) {

        
        // TODO: https://stackoverflow.com/questions/6158933/how-to-make-an-http-post-request-in-node-js
    }

}
