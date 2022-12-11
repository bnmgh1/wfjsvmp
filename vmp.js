// function vm_enter(e, i, r, f, t) {
//     function n(e) {
//         d[_++] = e;
//     }
//     function l() {
//         var r;
//         g = o();
//         r = e.slice(i, i + g);
//         i += g;
//         return r;
//     }
//     function s() {
//         return String.fromCharCode.apply(void 0, arguments);
//     }
//     function o() {
//         return e[i++];
//     }
//     function u(e, i) {
//         if ("!" === e) {
//             return !i;
//         }
//         if ("+" === e) {
//             return +i;
//         }
//         if ("-" === e) {
//             return -i;
//         }
//         if ("~" === e) {
//             return ~i;
//         }
//         if ("typeof" === e) {
//             return typeof i;
//         }
//         if ("void" !== e) {
//             debugger;
//         }
//     }
//     function a(e, i, r) {
//         return "*" === e ? r * i : "/" === e ? r / i : "%" === e ? r % i : "+" === e ? r + i : "-" === e ? r - i : "<<" === e ? r << i : ">>" === e ? r >> i : ">>>" === e ? r >>> i : ">" === e ? r > i : "<" === e ? r < i : ">=" === e ? r >= i : "<=" === e ? r <= i : "==" === e ? r == i : "===" === e ? r === i : "!==" === e ? r !== i : "!=" === e ? r != i : "&" === e ? r & i : "~" === e ? ~opNum : "^" === e ? r ^ i : "|" === e ? r | i : "&&" === e ? r && i : "||" === e ? r || i : "=" === e ? i : "*=" === e ? r * i : "/=" === e ? r / i : "%=" === e ? r % i : "&=" === e ? r & i : "+=" === e ? r + i : "-=" === e ? r - i : "<<=" === e ? r << i : ">>=" === e ? r >> i : "^=" === e ? r ^ i : "|=" === e ? r ^ i : "in" === e ? r in i : "instanceof" === e ? r instanceof i : void 0;
//     }
//     function p(i, r, f, t, n) {
//         var l;
//         if (!s) {
//             var s = {};
//         }
//         for (l = 0; l < f.length; l++) {
//             s[f[l]] = t[l];
//         }
//         Object.setPrototypeOf(s, n);
//         s.arguments = t;
//         g = vm_enter.apply(this, [ e.slice(i, r), 0, s, [], [] ]);
//         return g;
//     }
//     var d, g, c, h, v, _ = 0;
//     var y = r;
//     for (var w in t) {
//         y[t[w]] = this.window[t[w]];
//     }
//     d = f || [];
//     for (;;) {
//         v = o();
//         if (Number.isNaN(v) || !v) {
//             break;
//         }
//         if (65 !== v) {
//             if (13 !== v) {
//                 if (12 !== v) {
//                     if (14 !== v) {
//                         if (69 !== v) {
//                             if (68 !== v) {
//                                 if (66 !== v) {
//                                     if (67 !== v) {
//                                         if (54 !== v) {
//                                             if (55 !== v) {
//                                                 if (56 !== v) {
//                                                     if (30 !== v) {
//                                                         if (51 !== v) {
//                                                             if (52 !== v) {
//                                                                 if (31 !== v) {
//                                                                     if (53 !== v) {
//                                                                         if (32 !== v) {
//                                                                             if (89 !== v) {
//                                                                                 if (90 !== v) {
//                                                                                     if (91 !== v) {
//                                                                                         if (33 !== v) {
//                                                                                             if (92 !== v) {
//                                                                                                 if (93 !== v) {
//                                                                                                     if (11 !== v) {
//                                                                                                         if (42 !== v) {
//                                                                                                             if (43 !== v) {
//                                                                                                                 if (44 === v) {
//                                                                                                                     throw d[--_];
//                                                                                                                 }
//                                                                                                                 if (40 !== v) {
//                                                                                                                     if (20 !== v) {
//                                                                                                                         if (21 !== v) {
//                                                                                                                             if (46 !== v) {
//                                                                                                                                 if (88 === v) {
//                                                                                                                                     c = d[--_];
//                                                                                                                                     return c;
//                                                                                                                                 }
//                                                                                                                                 if (47 !== v) {
//                                                                                                                                     debugger;
//                                                                                                                                 } else {
//                                                                                                                                     debugger;
//                                                                                                                                 }
//                                                                                                                             } else {
//                                                                                                                                 h = d[--_];
//                                                                                                                                 g = d[--_];
//                                                                                                                                 delete g[h];
//                                                                                                                             }
//                                                                                                                         } else {
//                                                                                                                             _--;
//                                                                                                                         }
//                                                                                                                     } else {
//                                                                                                                         _++;
//                                                                                                                     }
//                                                                                                                 } else {
//                                                                                                                     try {
//                                                                                                                         h = i;
//                                                                                                                         c = l();
//                                                                                                                         h += c.length + 1;
//                                                                                                                         g = vm_enter(c, 0, y, d, []);
//                                                                                                                         if (g) {
//                                                                                                                             h = g[0], c = g[1];
//                                                                                                                             i -= 2;
//                                                                                                                             if (92 === h) {
//                                                                                                                                 i += c;
//                                                                                                                                 if (i > e.length) {
//                                                                                                                                     return [ 92, c ];
//                                                                                                                                 }
//                                                                                                                             } else {
//                                                                                                                                 if (93 !== h) {
//                                                                                                                                     return g;
//                                                                                                                                 }
//                                                                                                                                 i -= c;
//                                                                                                                                 if (i < 0 || i > e.length) {
//                                                                                                                                     return [ 93, c ];
//                                                                                                                                 }
//                                                                                                                             }
//                                                                                                                         }
//                                                                                                                     } catch (e) {
//                                                                                                                         n(e);
//                                                                                                                         i = h + 2;
//                                                                                                                     }
//                                                                                                                 }
//                                                                                                             } else {
//                                                                                                                 n(!1);
//                                                                                                             }
//                                                                                                         } else {
//                                                                                                             n(!0);
//                                                                                                         }
//                                                                                                     }
//                                                                                                 } else {
//                                                                                                     c = o();
//                                                                                                     i -= c;
//                                                                                                     if (i < 0 || i > e.length) {
//                                                                                                         return [ 93, c ];
//                                                                                                     }
//                                                                                                 }
//                                                                                             } else {
//                                                                                                 c = o();
//                                                                                                 i += c;
//                                                                                                 if (i > e.length) {
//                                                                                                     return [ 92, c ];
//                                                                                                 }
//                                                                                             }
//                                                                                         } else {
//                                                                                             h = d[--_];
//                                                                                             c = d[--_];
//                                                                                             n(new c(...h));
//                                                                                         }
//                                                                                     } else {
//                                                                                         i -= o();
//                                                                                     }
//                                                                                 } else {
//                                                                                     c = o();
//                                                                                     i += c;
//                                                                                 }
//                                                                             } else {
//                                                                                 c = d[--_];
//                                                                                 if (c) {
//                                                                                     i++;
//                                                                                 } else {
//                                                                                     h = o();
//                                                                                     i += h;
//                                                                                 }
//                                                                             }
//                                                                         } else {
//                                                                             c = o();
//                                                                             h = i;
//                                                                             i += c;
//                                                                             n(function() {
//                                                                                 function e() {
//                                                                                     g = p.apply(this, [ e.start, e.end, e.params, arguments, y ]);
//                                                                                     return g;
//                                                                                 }
//                                                                                 return e.start = h, e.end = i, e.params = d[--_], e;
//                                                                             }());
//                                                                         }
//                                                                     } else {
//                                                                         c = d[--_];
//                                                                         g = d[--_];
//                                                                         h = d[--_];
//                                                                         if (void 0 === g) {
//                                                                             debugger;
//                                                                         }
//                                                                         if (g.start) {
//                                                                             h = g.apply(c, h);
//                                                                         } else if ("toString" === g.name) {
//                                                                             if (h.length > 1) {
//                                                                                 debugger;
//                                                                             }
//                                                                             h = c.toString(h[0]);
//                                                                         } else if (void 0 === g) {
//                                                                             debugger;
//                                                                         } else {
//                                                                             h = g.apply(c, h);
//                                                                         }
//                                                                         n(h);
//                                                                     }
//                                                                 } else {
//                                                                     c = new Object();
//                                                                     h = o();
//                                                                     for (w = 0; w < h; w++) {
//                                                                         v = d[--_];
//                                                                         g = d[--_];
//                                                                         c[g] = v;
//                                                                     }
//                                                                     n(c);
//                                                                 }
//                                                             } else {
//                                                                 c = d[--_];
//                                                                 h = d[--_];
//                                                                 g = d[--_];
//                                                                 c[h] = g;
//                                                             }
//                                                         } else {
//                                                             c = d[--_];
//                                                             h = d[--_];
//                                                             g = c[h];
//                                                             n(g);
//                                                         }
//                                                     } else {
//                                                         c = o();
//                                                         h = d.splice(_ - c, c);
//                                                         _ -= c;
//                                                         n(h);
//                                                     }
//                                                 } else {
//                                                     h = d[--_];
//                                                     g = d[--_];
//                                                     c = d[--_];
//                                                     "++" === c ? h[g]++ : "--" === c && h[g]--;
//                                                 }
//                                             } else {
//                                                 h = d[--_];
//                                                 c = d[--_];
//                                                 n(u(c, h));
//                                             }
//                                         } else {
//                                             h = d[--_];
//                                             c = d[--_];
//                                             g = d[--_];
//                                             n(a(g, h, c));
//                                         }
//                                     } else {
//                                         h = d[--_];
//                                         c = d[--_];
//                                         if (h === y && !h.hasOwnProperty(c)) {
//                                             g = h.__proto__;
//                                             while (null != g) {
//                                                 if (g.hasOwnProperty(c)) {
//                                                     h = g;
//                                                     break;
//                                                 }
//                                                 g = g.__proto__;
//                                             }
//                                         }
//                                         g = d[--_];
//                                         h[c] = g;
//                                     }
//                                 } else {
//                                     h = d[--_];
//                                     c = d[--_];
//                                     if (void 0 === h || void 0 === c || void 0 === h[c]) {
//                                         n(void 0);
//                                         continue;
//                                     }
//                                     if (h === y && !h.hasOwnProperty(c)) {
//                                         g = h.__proto__;
//                                         while (null != g) {
//                                             if (g.hasOwnProperty(c)) {
//                                                 h = g;
//                                                 break;
//                                             }
//                                             g = g.__proto__;
//                                         }
//                                     }
//                                     n(h[c]);
//                                 }
//                             } else {
//                                 n(this);
//                             }
//                         } else {
//                             n(y);
//                         }
//                     } else {
//                         n(void 0);
//                     }
//                 } else {
//                     g = o();
//                     n(g);
//                 }
//             } else {
//                 g = s.apply(void 0, l());
//                 n(g);
//             }
//         } else {
//             n(window);
//         }
//     }
// }
(function (e, f) {
    var cL = {
            e: 0x210,
            f: 0x227,
            g: 0x20e,
            h: 0x209,
            i: 0x201,
            j: 0x208
        }, cy = d, g = e();
    while (!![]) {
        try {
            var h = parseInt(cy(cL.e)) / 0x1 + -parseInt(cy(cL.f)) / 0x2 + parseInt(cy(0x20d)) / 0x3 * (-parseInt(cy(cL.g)) / 0x4) + parseInt(cy(cL.h)) / 0x5 * (-parseInt(cy(0x206)) / 0x6) + parseInt(cy(0x1f0)) / 0x7 + parseInt(cy(cL.i)) / 0x8 + -parseInt(cy(0x21e)) / 0x9 * (-parseInt(cy(cL.j)) / 0xa);
            if (h === f)
                break;
            else
                g['push'](g['shift']());
        } catch (i) {
            g['push'](g['shift']());
        }
    }
}(c, 0x51688));
var b = (function () {
    var cM = { e: 0x215 }, e = !![];
    return function (f, g) {
        var h = e ? function () {
            var cz = d;
            if (g) {
                var i = g[cz(cM.e)](f, arguments);
                return g = null, i;
            }
        } : function () {
        };
        return e = ![], h;
    };
}());
(function () {
    var cQ = {
            e: 0x1f1,
            f: 0x21f
        }, cA = d, f;
    try {
        var g = Function(cA(0x207) + cA(cQ.e) + ');');
        f = g();
    } catch (h) {
        f = window;
    }
    f[cA(cQ.f)](a, 0xfa0);
}()), (function () {
    var cR = {
        e: 0x217,
        f: 0x203,
        g: 0x220
    };
    b(this, function () {
        var cB = d, e = new RegExp('function\x20*\x5c(\x20*\x5c)'), f = new RegExp('\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)', 'i'), g = a(cB(cR.e));
        !e[cB(0x213)](g + cB(cR.f)) || !f['test'](g + cB(cR.g)) ? g('0') : a();
    })();
}());
function c() {
    var d9 = [
        'C3rHCNq',
        'CgfYyw1Z',
        'it09',
        'z2DLCG',
        'C3rYAw5N',
        'AKDLrvO',
        'ywjkswC',
        'Aw5ZDgfUy2vVzG',
        'BMfTzq',
        'zgvIDq',
        'te1tr0G',
        'D2HPBguGkhrYDwuPihT9',
        'x19WCM90B19F',
        'nda3nta4mfnbvxHhzG',
        'pt09',
        'y2HHAw4',
        'C2XPy2u',
        'y29UC3rYDwn0B3i',
        'mZm2Bw9eCxvV',
        'CMv0DxjUicHMDw5JDgLVBIGPia',
        'mZqXnZCZmfLfvKLWsa',
        'ntm1ntbUENLvCwe',
        'CMretge',
        'y291BNrLCG',
        'uxbLu3O',
        'mtu3nZrQr0DQuKW',
        'mJa0tMz2wen3',
        'CNzWvva',
        'nta1ndK0EhzLwNHY',
        'wKfpEeu',
        'AgfZt3DUuhjVCgvYDhK',
        'DgvZDa',
        'CLzPz1m',
        'yxbWBhK',
        'C2v0uhjVDg90ExbLt2y',
        'Aw5PDa',
        'Axnoyu4',
        'sujtDeK',
        'rvfktvy',
        'BgvUz3rO',
        'DM9Pza',
        'C3rHDgvpyMPLy3q',
        'mtHtzhDgs00',
        'C2v0sw50zxj2ywW',
        'Aw5WDxq',
        'seTRyMO',
        'D0vts1m',
        'zNjVBunOyxjdB2rL',
        'C3bSAwnL',
        'zw5K',
        'Dg9tDhjPBMC',
        'mtaYmJK5mgXPCwP1qq',
        'wujszMK',
        'vMnTyLO',
        'mtaXmduYr3PzALnu',
        'E30Uy29UC3rYDwn0B3iOiNjLDhvYBIb0AgLZiIKOicK',
        'pdW9',
        'pJ4+'
    ];
    c = function () {
        return d9;
    };
    return c();
}
function d(a, b) {
    var e = c();
    return d = function (f, g) {
        f = f - 0x1ef;
        var h = e[f];
        if (d['ZEougc'] === undefined) {
            var i = function (m) {
                var n = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
                var o = '', p = '';
                for (var q = 0x0, r, s, t = 0x0; s = m['charAt'](t++); ~s && (r = q % 0x4 ? r * 0x40 + s : s, q++ % 0x4) ? o += String['fromCharCode'](0xff & r >> (-0x2 * q & 0x6)) : 0x0) {
                    s = n['indexOf'](s);
                }
                for (var u = 0x0, v = o['length']; u < v; u++) {
                    p += '%' + ('00' + o['charCodeAt'](u)['toString'](0x10))['slice'](-0x2);
                }
                return decodeURIComponent(p);
            };
            d['xuimhQ'] = i, a = arguments, d['ZEougc'] = !![];
        }
        var j = e[0x0], k = f + j, l = a[k];
        return !l ? (h = d['xuimhQ'](h), a[k] = h) : h = l, h;
    }, d(a, b);
}
function vm_enter(j, k, m, q, x) {
    var d3 = {
            e: 0x218,
            f: 0x1fa,
            g: 0x228,
            h: 0x214,
            i: 0x205,
            j: 0x215,
            k: 0x21b,
            l: 0x1fe,
            m: 0x219,
            n: 0x226,
            o: 0x1fc,
            p: 0x224,
            q: 0x212,
            r: 0x200,
            s: 0x221
        }, d2 = {
            e: 0x225,
            f: 0x1f5
        }, cZ = {
            e: 0x216,
            f: 0x215,
            g: 0x204
        }, cY = {
            e: 0x1f3,
            f: 0x202,
            g: 0x1f6,
            h: 0x1fb
        }, cX = {
            e: 0x21a,
            f: 0x1ef,
            g: 0x211,
            h: 0x21c
        }, cV = { e: 0x223 }, cH = d;
    function z(O) {
        G[L++] = O;
    }
    function A() {
        var cC = d, O;
        return H = C(), O = j[cC(0x204)](k, k + H), k += H, O;
    }
    function B() {
        var cD = d;
        return String[cD(cV.e)][cD(0x215)](void 0x0, arguments);
    }
    function C() {
        return j[k++];
    }
    function D(O, P) {
        var cE = d;
        if ('!' === O)
            return cE(0x21a) !== cE(cX.e) ? [
                0x5d,
                q
            ] : !P;
        if ('+' === O)
            return +P;
        if ('-' === O)
            return -P;
        if ('~' === O) {
            if (cE(cX.f) !== cE(cX.f))
                C = F[--q], m = B[--x], D(K(N, x));
            else
                return ~P;
        }
        if ('typeof' === O)
            return 'ZAOxE' !== cE(cX.g) ? [
                0x5c,
                q
            ] : typeof P;
        if (cE(cX.h) !== O)
            debugger;
    }
    function E(O, P, Q) {
        var cF = d;
        return '*' === O ? Q * P : '/' === O ? Q / P : '%' === O ? Q % P : '+' === O ? Q + P : '-' === O ? Q - P : '<<' === O ? Q << P : '>>' === O ? Q >> P : cF(cY.e) === O ? Q >>> P : '>' === O ? Q > P : '<' === O ? Q < P : '>=' === O ? Q >= P : '<=' === O ? Q <= P : '==' === O ? Q == P : cF(cY.f) === O ? Q === P : cF(cY.g) === O ? Q !== P : '!=' === O ? Q != P : '&' === O ? Q & P : '~' === O ? ~opNum : '^' === O ? Q ^ P : '|' === O ? Q | P : '&&' === O ? Q && P : '||' === O ? Q || P : '=' === O ? P : '*=' === O ? Q * P : '/=' === O ? Q / P : '%=' === O ? Q % P : '&=' === O ? Q & P : '+=' === O ? Q + P : '-=' === O ? Q - P : cF(0x1f2) === O ? Q << P : '>>=' === O ? Q >> P : '^=' === O ? Q ^ P : '|=' === O ? Q ^ P : 'in' === O ? Q in P : cF(cY.h) === O ? Q instanceof P : void 0x0;
    }
    function F(O, P, Q, R, S) {
        var cG = d, T;
        if (!U)
            var U = {};
        for (T = 0x0; T < Q[cG(0x21b)]; T++) {
            U[Q[T]] = R[T];
        }
        return Object[cG(cZ.e)](U, S), U['arguments'] = R, H = vm_enter[cG(cZ.f)](this, [
            j[cG(cZ.g)](O, P),
            0x0,
            U,
            [],
            []
        ]), H;
    }
    var G, H, I, J, K, L = 0x0, M = m;
    for (var N in x) {
        M[x[N]] = this['window'][x[N]];
    }
    G = q || [];
    for (;;) {
        K = C();
        if (Number[cH(d3.e)](K) || !K)
            break;
        if (0x41 !== K) {
            if (0xd !== K) {
                if (0xc !== K) {
                    if (0xe !== K) {
                        if (0x45 !== K) {
                            if (0x44 !== K) {
                                if (0x42 !== K) {
                                    if ('pBqoi' !== cH(d3.f)) {
                                        if (0x43 !== K) {
                                            if (0x36 !== K) {
                                                if (0x37 !== K) {
                                                    if (0x38 !== K) {
                                                        if (0x1e !== K) {
                                                            if (cH(d3.g) === cH(d3.g)) {
                                                                if (0x33 !== K) {
                                                                    if (0x34 !== K) {
                                                                        if (0x1f !== K) {
                                                                            if (0x35 !== K) {
                                                                                if (0x20 !== K) {
                                                                                    if (0x59 !== K) {
                                                                                        if (0x5a !== K) {
                                                                                            if (0x5b !== K) {
                                                                                                if (0x21 !== K) {
                                                                                                    if (0x5c !== K) {
                                                                                                        if (0x5d !== K) {
                                                                                                            if (0xb !== K) {
                                                                                                                if (cH(d3.h) !== 'rVigS')
                                                                                                                    return function (P) {
                                                                                                                    }[cH(d3.i)]('while\x20(true)\x20{}')[cH(d3.j)]('counter');
                                                                                                                else {
                                                                                                                    if (0x2a !== K) {
                                                                                                                        if (0x2b !== K) {
                                                                                                                            if (0x2c === K)
                                                                                                                                throw G[--L];
                                                                                                                            if (0x28 !== K) {
                                                                                                                                if (0x14 !== K) {
                                                                                                                                    if (0x15 !== K) {
                                                                                                                                        if (0x2e !== K) {
                                                                                                                                            if (0x58 === K)
                                                                                                                                                return I = G[--L], I;
                                                                                                                                            if (0x2f !== K)
                                                                                                                                                debugger;
                                                                                                                                            else
                                                                                                                                                debugger;
                                                                                                                                        } else
                                                                                                                                            J = G[--L], H = G[--L], delete H[J];
                                                                                                                                    } else
                                                                                                                                        L--;
                                                                                                                                } else
                                                                                                                                    L++;
                                                                                                                            } else
                                                                                                                                try {
                                                                                                                                    J = k, I = A(), J += I[cH(0x21b)] + 0x1, H = vm_enter(I, 0x0, M, G, []);
                                                                                                                                    if (H) {
                                                                                                                                        J = H[0x0], I = H[0x1], k -= 0x2;
                                                                                                                                        if (0x5c === J) {
                                                                                                                                            k += I;
                                                                                                                                            if (k > j[cH(d3.k)])
                                                                                                                                                return [
                                                                                                                                                    0x5c,
                                                                                                                                                    I
                                                                                                                                                ];
                                                                                                                                        } else {
                                                                                                                                            if (0x5d !== J)
                                                                                                                                                return H;
                                                                                                                                            k -= I;
                                                                                                                                            if (k < 0x0 || k > j[cH(0x21b)])
                                                                                                                                                return [
                                                                                                                                                    0x5d,
                                                                                                                                                    I
                                                                                                                                                ];
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                } catch (P) {
                                                                                                                                    z(P), k = J + 0x2;
                                                                                                                                }
                                                                                                                        } else {
                                                                                                                            if (cH(0x20f) !== cH(d3.l))
                                                                                                                                z(!0x1);
                                                                                                                            else {
                                                                                                                                m = z(), C -= F;
                                                                                                                                if (q < 0x0 || m > B[cH(0x21b)])
                                                                                                                                    return [
                                                                                                                                        0x5d,
                                                                                                                                        D
                                                                                                                                    ];
                                                                                                                            }
                                                                                                                        }
                                                                                                                    } else
                                                                                                                        z(!0x0);
                                                                                                                }
                                                                                                            }
                                                                                                        } else {
                                                                                                            I = C(), k -= I;
                                                                                                            if (k < 0x0 || k > j[cH(d3.k)])
                                                                                                                return [
                                                                                                                    0x5d,
                                                                                                                    I
                                                                                                                ];
                                                                                                        }
                                                                                                    } else {
                                                                                                        I = C(), k += I;
                                                                                                        if (k > j[cH(0x21b)])
                                                                                                            return [
                                                                                                                0x5c,
                                                                                                                I
                                                                                                            ];
                                                                                                    }
                                                                                                } else
                                                                                                    J = G[--L], I = G[--L], z(new I(...J));
                                                                                            } else
                                                                                                cH(0x1f9) === 'jGeEZ' ? k -= C() : q--;
                                                                                        } else
                                                                                            I = C(), k += I;
                                                                                    } else
                                                                                        cH(0x222) === cH(d3.m) ? H -= J() : (I = G[--L], I ? k++ : (J = C(), k += J));
                                                                                } else
                                                                                    I = C(), J = k, k += I, z((function () {
                                                                                        var cJ = cH;
                                                                                        function T() {
                                                                                            var cI = d;
                                                                                            return H = F[cI(0x215)](this, [
                                                                                                T[cI(0x1f4)],
                                                                                                T['end'],
                                                                                                T['params'],
                                                                                                arguments,
                                                                                                M
                                                                                            ]), H;
                                                                                        }
                                                                                        return T[cJ(0x1f4)] = J, T[cJ(d2.e)] = k, T[cJ(d2.f)] = G[--L], T;
                                                                                    }()));
                                                                            } else {
                                                                                I = G[--L], H = G[--L], J = G[--L];
                                                                                if (void 0x0 === H)
                                                                                    debugger;
                                                                                if (H['start'])
                                                                                    J = H[cH(d3.j)](I, J);
                                                                                else {
                                                                                    if (cH(d3.n) === H[cH(d3.o)]) {
                                                                                        if (J['length'] > 0x1)
                                                                                            debugger;
                                                                                        J = I[cH(0x226)](J[0x0]);
                                                                                    } else {
                                                                                        if (void 0x0 === H)
                                                                                            debugger;
                                                                                        else
                                                                                            J = H[cH(d3.j)](I, J);
                                                                                    }
                                                                                }
                                                                                z(J);
                                                                            }
                                                                        } else {
                                                                            I = new Object(), J = C();
                                                                            for (N = 0x0; N < J; N++) {
                                                                                K = G[--L], H = G[--L], I[H] = K;
                                                                            }
                                                                            z(I);
                                                                        }
                                                                    } else
                                                                        I = G[--L], J = G[--L], H = G[--L], I[J] = H;
                                                                } else
                                                                    I = G[--L], J = G[--L], H = I[J], z(H);
                                                            } else
                                                                q('0');
                                                        } else
                                                            I = C(), J = G['splice'](L - I, I), L -= I, z(J);
                                                    } else
                                                        J = G[--L], H = G[--L], I = G[--L], '++' === I ? J[H]++ : '--' === I && J[H]--;
                                                } else
                                                    J = G[--L], I = G[--L], z(D(I, J));
                                            } else
                                                J = G[--L], I = G[--L], H = G[--L], z(E(H, J, I));
                                        } else {
                                            J = G[--L], I = G[--L];
                                            if (J === M && !J[cH(0x212)](I)) {
                                                H = J[cH(0x200)];
                                                while (null != H) {
                                                    if (H[cH(0x212)](I)) {
                                                        J = H;
                                                        break;
                                                    }
                                                    H = H[cH(0x200)];
                                                }
                                            }
                                            H = G[--L], J[I] = H;
                                        }
                                    } else
                                        F = q(), m = B[cH(d3.p)](x - D, K), N -= x, M(z);
                                } else {
                                    J = G[--L], I = G[--L];
                                    if (void 0x0 === J || void 0x0 === I || void 0x0 === J[I]) {
                                        if ('QpeSz' !== cH(0x20c))
                                            k(j), k = A + 0x2;
                                        else {
                                            z(void 0x0);
                                            continue;
                                        }
                                    }
                                    if (J === M && !J[cH(d3.q)](I)) {
                                        if (cH(0x20a) !== 'rdDLa')
                                            throw H[--J];
                                        else {
                                            H = J[cH(0x200)];
                                            while (null != H) {
                                                if (H[cH(d3.q)](I)) {
                                                    J = H;
                                                    break;
                                                }
                                                H = H[cH(d3.r)];
                                            }
                                        }
                                    }
                                    z(J[I]);
                                }
                            } else
                                cH(0x221) === cH(d3.s) ? z(this) : (F = q[--m], B = x[--D], K = N[x], M(z));
                        } else
                            z(M);
                    } else
                        z(void 0x0);
                } else
                    H = C(), z(H);
            } else
                H = B['apply'](void 0x0, A()), z(H);
        } else
            z(window);
    }
}
function a(e) {
    var d7 = {
        e: 0x1f8,
        f: 0x205,
        g: 0x20b,
        h: 0x1f7,
        i: 0x1fd,
        j: 0x215
    };
    function f(g) {
        var cK = d;
        if (typeof g === cK(d7.e))
            return function (h) {
            }[cK(d7.f)](cK(0x1ff))['apply'](cK(d7.g));
        else
            ('' + g / g)['length'] !== 0x1 || g % 0x14 === 0x0 ? function () {
                return !![];
            }[cK(0x205)](cK(0x1fd) + cK(d7.h))['call']('action') : function () {
                return ![];
            }[cK(0x205)](cK(d7.i) + cK(d7.h))[cK(d7.j)](cK(0x21d));
        f(++g);
    }
    try {
        if (e)
            return f;
        else
            f(0x0);
    } catch (g) {
    }
}

opcode = eval(fs.readFileSync("./opcode.txt") + '');
vm_enter(opcode, 0, {
    "$_jsvmp": true
}, void 0, ["document", 'console', "Error", "window", "console", "RegExp", "length", "name", "Object", "undefined", "Math", "Array", "parseFloat", "Date", "String", "parent", "top", "location", "self", "setTimeout", "event", "frameElement", "stop", "Event", "focus", "blur", "close", "getComputedStyle", "setInterval", "clearInterval", "clearTimeout", "parseInt", "JSON", "open", "Function", "DOMParser", "status", "encodeURIComponent", "XMLHttpRequest", "onload", "pageYOffset", "pageXOffset", "scrollTo", "document", "Error", "window", "console", "RegExp", "length", "name", "Object", "undefined", "Math", "Array", "parseFloat", "Date", "String", "parent", "top", "location", "self", "setTimeout", "event", "frameElement", "stop", "Event", "focus", "blur", "close", "getComputedStyle", "setInterval", "clearInterval", "clearTimeout", "parseInt", "JSON", "open", "Function", "DOMParser", "status", "encodeURIComponent", "XMLHttpRequest", "onload", "pageYOffset", "pageXOffset", "scrollTo"]);