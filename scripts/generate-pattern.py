"""Generate the AKKI triangle (tribar) pattern tile. Usage: python3 scripts/generate-pattern.py public/brand/pattern.svg"""
import math, sys

def gen(L=120.0, band_ratio=0.15, cut=2.6, grid=5.0, hband=7.0,
        greys=("#2B2A2A", "#343232", "#3E3C3C"), bg="#080808"):
    H = L * math.sqrt(3) / 2
    W, TH = L, 2 * H
    f = lambda v: f"{v:.2f}"

    def tribar(A, B, C):
        cx = (A[0] + B[0] + C[0]) / 3; cy = (A[1] + B[1] + C[1]) / 3
        r = H / 3
        k = (r - band_ratio * L) / r
        inn = [(cx + k * (P[0] - cx), cy + k * (P[1] - cy)) for P in (A, B, C)]
        a, b, c = inn

        def hit(p, d, s0, s1):
            # intersect ray p + t d with segment s0-s1
            ex, ey = s1[0] - s0[0], s1[1] - s0[1]
            den = d[0] * ey - d[1] * ex
            t = ((s0[0] - p[0]) * ey - (s0[1] - p[1]) * ex) / den
            return (p[0] + t * d[0], p[1] + t * d[1])

        a2 = hit(a, (a[0] - c[0], a[1] - c[1]), A, B)
        b2 = hit(b, (b[0] - a[0], b[1] - a[1]), B, C)
        c2 = hit(c, (c[0] - b[0], c[1] - b[1]), C, A)
        bars = [[a2, B, b2, b, a], [b2, C, c2, c, b], [c2, A, a2, a, c]]
        out = []
        for i, bar in enumerate(bars):
            pts = " ".join(f"{f(x)},{f(y)}" for x, y in bar)
            out.append(f'<polygon points="{pts}" fill="{greys[i]}" stroke="{bg}" stroke-width="{cut}" stroke-linejoin="miter"/>')
        return out

    cells = []
    for row, y0 in ((0, 0.0), (1, H)):
        off = 0.0 if row == 0 else L / 2
        for x0 in (-L + off, off, L + off):
            # up cell (counter-clockwise order kept consistent)
            cells.append(("u", x0, y0))
        for x0 in (-L / 2 + off, L / 2 + off, 3 * L / 2 + off - L):
            cells.append(("d", x0, y0))
    body = [f'<rect width="{f(W)}" height="{f(TH)}" fill="{bg}"/>']
    outlines = []
    for kind, x0, y0 in cells:
        if kind == "u":
            A, B, C = (x0 + L / 2, y0), (x0, y0 + H), (x0 + L, y0 + H)
        else:
            A, B, C = (x0 + L / 2, y0 + H), (x0 + L, y0), (x0, y0)
        body += tribar(A, B, C)
        outlines.append(f'<polygon points="{f(A[0])},{f(A[1])} {f(B[0])},{f(B[1])} {f(C[0])},{f(C[1])}" fill="none" stroke="{bg}" stroke-width="{grid}" stroke-linejoin="miter"/>')
    body += outlines
    for y in (0, H, 2 * H):
        body.append(f'<rect x="0" y="{f(y - hband / 2)}" width="{f(W)}" height="{f(hband)}" fill="{bg}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{f(W)}" height="{f(TH)}" '
            f'viewBox="0 0 {f(W)} {f(TH)}">' + "".join(body) + "</svg>")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "public/brand/pattern.svg"
    open(out, "w").write(gen(L=120, band_ratio=0.195, cut=3.2, grid=4.2, hband=6.5))
    dim = out.replace(".svg", "-dim.svg")
    open(dim, "w").write(gen(L=120, band_ratio=0.195, cut=3.2, grid=4.2, hband=6.5, greys=("#1C1B1B", "#212020", "#262525")))
    print("wrote", out, "and", dim)
