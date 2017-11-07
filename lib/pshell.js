/* pshell.js - promisified shell
 * Execute a shell command, used with async/await. 
 * Optionally change directories first 
 */
 
const promisify = require('util').promisify;
const cp = require('child_process');

// Promisified functions
const p_exec = promisify(cp.exec);
const p_execFile = promisify(cp.execFile);

module.exports = {
    exec: function(command, dir) {
        if (dir != undefined) {
            command = "pushd "+dir+"; "+command+";popd";
        }
        //console.log("command: "+command);
        p_exec(command);         
    },
    execFile: function(command, callback, dir) {
        if (dir != undefined) {
            command = "pushd "+dir+"; "+command+";popd";
        }
        p_execFile(file, args, options, function(error, stdout, stderr) {
            callback(error, stdout, stderr);
        });
    }
}