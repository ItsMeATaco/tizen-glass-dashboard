import ctypes, ctypes.util, os, sys
libc = ctypes.CDLL("libc.so.6", use_errno=True)
libc.open.restype = ctypes.c_int
libc.ioctl.restype = ctypes.c_int
libc.mmap.restype = ctypes.c_void_p
libc.mmap.argtypes = [ctypes.c_void_p, ctypes.c_size_t, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_long]

out = []
try:
    out.append("IOMEM:" + open("/proc/iomem").read().replace("\n", "|")[:400])
except Exception as e:
    out.append("IOMEM:ERR")

# _IOWR('s',1,16-byte struct)
IOC = 0xC0107301
class Info(ctypes.Structure):
    _fields_ = [("type", ctypes.c_uint32), ("index", ctypes.c_uint32), ("start", ctypes.c_uint32), ("size", ctypes.c_uint32)]

fd = libc.open("/dev/sdp_mem", os.O_RDWR | os.O_SYNC)
out.append("open=%d" % fd)
if fd >= 0:
    info = Info(0, 0, 0x20000000, 0x100000)
    r = libc.ioctl(fd, IOC, ctypes.byref(info))
    out.append("ioctl=%d errno=%d" % (r, ctypes.get_errno()))
    if r == 0:
        m = libc.mmap(None, 0x100000, 3, 1, fd, 0)
        out.append("mmap=%s" % hex(m if m else 0))
        if m and m != 0xFFFFFFFF:
            p = ctypes.cast(m, ctypes.POINTER(ctypes.c_uint32))
            out.append("read:" + " ".join("%08x" % p[i] for i in range(8)))
print("\n".join(out))
