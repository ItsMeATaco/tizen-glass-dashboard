// Read-only live-system recon. Runs in the TizenBrew service sandbox (Node 4.x).
// Posts findings back to the operator PC. No writes to the TV.
var fs = require('fs');
var http = require('http');
var cp = require('child_process');
function read(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return 'ERR ' + e.message; } }
function exec(c) { try { return cp.execSync(c, { timeout: 5000 }).toString(); } catch (e) { return 'ERR ' + e.message; } }
var SUID = parseInt('4000', 8), SGID = parseInt('2000', 8);
var out = {};
out.kernel = read('/proc/version');
out.passwd = read('/etc/passwd');
out.osrelease = read('/etc/os-release');
out.mounts = read('/proc/mounts');
out.uname = exec('uname -a');
out.id = exec('id');
var dirs = ['/bin', '/sbin', '/usr/bin', '/usr/sbin', '/usr/local/bin'];
var suid = [], bins = {};
dirs.forEach(function (d) {
  var list; try { list = fs.readdirSync(d); } catch (e) { return; }
  bins[d] = list.length;
  list.forEach(function (f) {
    var p = d + '/' + f;
    try { var st = fs.statSync(p); if ((st.mode & SUID) || (st.mode & SGID)) suid.push(p + ' mode=' + st.mode.toString(8)); } catch (e) { }
  });
});
out.setuid = suid;
out.binCounts = bins;
out.hasSu = exec('which su sudo');
var body = JSON.stringify(out);
var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, function (res) { });
req.on('error', function (e) { });
req.write(body); req.end();
