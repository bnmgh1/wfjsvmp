window.md5 = function MD5(sMessage) {
  function RotateLeft(lValue, iShiftBits) {
    return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 1025 + 1243 * (481 + 1022 * 1690);
    lY8 = lY & 973 + 1975 * (258 + 1675 * 649);
    lX4 = lX & 1237 + 1343 * (219 + 1494 * 535);
    lY4 = lY & 1249 + 1825 * (495 + 1324 * 444);
    lResult = (lX & 1133 + 1210 * (449 + 1454 * 610)) + (lY & 898 + 1145 * (837 + 1748 * 536));
    if (lX4 & lY4) {
      return lResult ^ 1028 + 1956 * (1215 + 1976 * 555) ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 304 + 1033 * (805 + 1235 * 841)) {
        return lResult ^ 739 + 1873 * (1019 + 1233 * 1394) ^ lX8 ^ lY8;
      } else {
        return lResult ^ 110 + 1049 * (1261 + 1585 * 645) ^ lX8 ^ lY8;
      }
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }
  function F(x, y, z) {
    return x & y | ~x & z;
  }
  function G(x, y, z) {
    return x & z | y & ~z;
  }
  function H(x, y, z) {
    return x ^ y ^ z;
  }
  function I(x, y, z) {
    return y ^ (x | ~z);
  }
  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function vmExpression_calc(symbol, opNum2, opNum1) {
    switch (symbol) {
      case "*":
        return opNum1 * opNum2;
      case "/":
        return opNum1 / opNum2;
      case "%":
        return opNum1 % opNum2;
      case "+":
        return opNum1 + opNum2;
      case "-":
        return opNum1 - opNum2;
      case "<<":
        return opNum1 << opNum2;
      case ">>":
        return opNum1 >> opNum2;
      case ">>>":
        return opNum1 >>> opNum2;
      case ">":
        return opNum1 > opNum2;
      case "<":
        return opNum1 < opNum2;
      case ">=":
        return opNum1 >= opNum2;
      case "<=":
        return opNum1 <= opNum2;
      case "==":
        return opNum1 == opNum2;
      case "===":
        return opNum1 === opNum2;
      case "!==":
        return opNum1 !== opNum2;
      case "!=":
        return opNum1 != opNum2;
      case "&":
        return opNum1 & opNum2;
      case "^":
        return opNum1 ^ opNum2;
      case "|":
        return opNum1 | opNum2;
      case "&&":
        return opNum1 && opNum2;
      case "||":
        return opNum1 || opNum2;
      case "=":
        return opNum1 = opNum2;
      case "*=":
        return opNum1 *= opNum2;
      case "/=":
        return opNum1 /= opNum2;
      case "%=":
        return opNum1 %= opNum2;
      case "&=":
        return opNum1 &= opNum2;
      case "+=":
        return opNum1 += opNum2;
      case "-=":
        return opNum1 -= opNum2;
      case "<<=":
        return opNum1 <<= opNum2;
      case ">>=":
        return opNum1 >>= opNum2;
      case "^=":
        return opNum1 ^= opNum2;
      case "|=":
        return opNum1 |= opNum2;
      case "in":
        return opNum1 in opNum2;
      case "instanceof":
        return opNum1 instanceof opNum2;
      default:
        // console.log("vmExpression_calc 没有这个 symbol =>", symbol)
        return undefined;
    }
  }
  function ConvertToWordArray(sMessage) {
    var lWordCount;
    var cbb0;
    var bin_symbols = ['*', '/', '%', '+', '-', '<<', '>>', '>>>', '&', '^', '|'];
    var symbol,
      iii = 0;
    var lMessageLength = sMessage.length;
    var ua = window["navigator"].userAgent;
    ua = ua.split('').map(function (it) {
      return it.charCodeAt();
    });
    var sss = +sMessage[sMessage.length - 1];
    var qqq = sMessage.length - sss;
    var m = (sss + '').charCodeAt();
    for (symbol in bin_symbols) {
      var s = m;
      // console.log(m, s);
      ua.map(function (it) {
        return s = vmExpression_calc(bin_symbols[symbol], it, s);
      });
      // console.log(m, s);
      if (qqq === iii++) {
        sMessage = sMessage.replace(sss + "", (s + '')[0]);
      }
    }
    var lNumberOfWords_temp1 = lMessageLength + 8;
    // console.log(lNumberOfWords_temp1)
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - lNumberOfWords_temp1 % 64) / 64;
    // console.log(lNumberOfWords_temp2)
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    // console.log(lNumberOfWords)
    var lWordArray = [];
    // console.log(lWordArray)
    var lBytePosition = 0;
    var lByteCount;
    for (lByteCount = 0; lByteCount < lMessageLength; lByteCount++) {
      lWordCount = (lByteCount - lByteCount % 4) / 4;
      // console.log(lWordCount)
      lBytePosition = lByteCount % 4 * 8;
      // console.log(lByteCount)
      // console.log("lWordArray[lWordCount]")
      // console.log(sMessage)
      // console.log(sMessage.charCodeAt(lByteCount))
      // console.log(lWordArray[lWordCount])
      // console.log(lWordArray[lWordCount] | (sMessage.charCodeAt(lByteCount)<<lBytePosition))
      lWordArray[lWordCount] = lWordArray[lWordCount] | sMessage.charCodeAt(lByteCount) << lBytePosition;

      // console.log(lWordArray)
    }
    // console.log("cllllll")
    lWordCount = (lByteCount - lByteCount % 4) / 4;
    lBytePosition = lByteCount % 4 * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | 0x80 << lBytePosition;
    // console.log(lWordArray)
    cbb0 = lNumberOfWords - 2;
    lWordArray[cbb0] = lMessageLength << 3;
    cbb0 = lNumberOfWords - 1;
    lWordArray[cbb0] = lMessageLength >>> 29;
    // console.log(lWordArray)
    return lWordArray;
  }
  function WordToHex(lValue) {
    var WordToHexValue = "",
      WordToHexValue_temp = "",
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = lValue >>> lCount * 8 & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  var x = [];
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  var S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  var S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  var S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;
  x = ConvertToWordArray(sMessage);
  // console.log("dadada")
  // console.log(x)
  // b = 0x67452301;
  // d = 0xEFCDAB89;
  // a = 0x98BADCFE;
  // c = 0x10325476;
  a = 295 + 1971 * (1013 + 1725 * 509);
  b = 1529 + 1878 * (1318 + 1526 * 1403);
  c = 738 + 1322 * (267 + 1735 * 1117);
  d = 1054 + 1111 * (1659 + 1975 * 123);
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 344 + 1824 * (129 + 1015 * 1952));
    d = FF(d, a, b, c, x[k + 1], S12, 532 + 1623 * (1506 + 1930 * 1246));
    c = FF(c, d, a, b, x[k + 2], S13, 1145 + 1477 * (547 + 1301 * 315));
    b = FF(b, c, d, a, x[k + 3], S14, 1132 + 1371 * (1064 + 1310 * 1809));
    a = FF(a, b, c, d, x[k + 4], S11, 712 + 1977 * (510 + 1213 * 1717));
    d = FF(d, a, b, c, x[k + 5], S12, 974 + 1573 * (204 + 1680 * 454));
    c = FF(c, d, a, b, x[k + 6], S13, 1337 + 1371 * (521 + 1059 * 1943));
    b = FF(b, c, d, a, x[k + 7], S14, 397 + 1588 * (49 + 1026 * 2608));
    a = FF(a, b, c, d, x[k + 8], S11, 432 + 1594 * (732 + 1702 * 652));
    d = FF(d, a, b, c, x[k + 9], S12, 409 + 1390 * (115 + 1831 * 918));
    c = FF(c, d, a, b, x[k + 10], S13, 569 + 1592 * (285 + 1076 * 2507));
    b = FF(b, c, d, a, x[k + 11], S14, 646 + 1096 * (603 + 1911 * 1100));
    a = FF(a, b, c, d, x[k + 12], S11, 46 + 1738 * (12 + 1630 * 637));
    d = FF(d, a, b, c, x[k + 13], S12, 83 + 1056 * (241 + 1193 * 3377));
    c = FF(c, d, a, b, x[k + 14], S13, 1534 + 1896 * (1198 + 1418 * 1038));
    b = FF(b, c, d, a, x[k + 15], S14, 1227 + 1262 * (333 + 1611 * 608));
    a = GG(a, b, c, d, x[k + 1], S21, 1794 + 1992 * (254 + 1306 * 1587));
    d = GG(d, a, b, c, x[k + 6], S22, 372 + 1916 * (1685 + 1774 * 948));
    c = GG(c, d, a, b, x[k + 11], S23, 713 + 1000 * (1257 + 1820 * 353));
    b = GG(b, c, d, a, x[k + 0], S24, 608 + 1586 * (247 + 1546 * 1599));
    a = GG(a, b, c, d, x[k + 5], S21, 115 + 1071 * (358 + 1651 * 2032));
    d = GG(d, a, b, c, x[k + 10], S22, 776 + 1661 * 22887);
    c = GG(c, d, a, b, x[k + 15], S23, 13 + 1588 * (817 + 1136 * 2014));
    b = GG(b, c, d, a, x[k + 4], S24, 248 + 1900 * (132 + 1479 * 1384));
    a = GG(a, b, c, d, x[k + 9], S21, 38 + 1600 * (967 + 1197 * 296));
    d = GG(d, a, b, c, x[k + 14], S22, 872 + 1861 * (433 + 1441 * 1221));
    c = GG(c, d, a, b, x[k + 3], S23, 815 + 1935 * (982 + 1605 * 1322));
    b = GG(b, c, d, a, x[k + 8], S24, 1031 + 1830 * (749 + 1124 * 565));
    a = GG(a, b, c, d, x[k + 13], S21, 849 + 1618 * (190 + 1894 * 930));
    d = GG(d, a, b, c, x[k + 2], S22, 552 + 1352 * (1085 + 1099 * 2855));
    c = GG(c, d, a, b, x[k + 7], S23, 547 + 1926 * (805 + 1996 * 451));
    b = GG(b, c, d, a, x[k + 12], S24, 1354 + 1368 * (142 + 1249 * 1386));
    a = HH(a, b, c, d, x[k + 5], S31, 954 + 1748 * (1691 + 1947 * 1261));
    d = HH(d, a, b, c, x[k + 8], S32, 80 + 1941 * (445 + 1944 * 602));
    c = HH(c, d, a, b, x[k + 11], S33, 1072 + 1437 * (550 + 1532 * 835));
    b = HH(b, c, d, a, x[k + 14], S34, 1157 + 1763 * (541 + 1830 * 1320));
    a = HH(a, b, c, d, x[k + 1], S31, 356 + 1674 * (352 + 1428 * 1156));
    d = HH(d, a, b, c, x[k + 4], S32, 214 + 1519 * (423 + 1767 * 474));
    c = HH(c, d, a, b, x[k + 7], S33, 369 + 1235 * (1117 + 1588 * 2110));
    b = HH(b, c, d, a, x[k + 10], S34, 70 + 1667 * (482 + 1028 * 1867));
    a = HH(a, b, c, d, x[k + 13], S31, 270 + 1566 * (1494 + 1885 * 230));
    d = HH(d, a, b, c, x[k + 0], S32, 442 + 1396 * (992 + 1215 * 2320));
    c = HH(c, d, a, b, x[k + 3], S33, 932 + 1185 * (101 + 1765 * 1708));
    b = HH(b, c, d, a, x[k + 6], S34, 29 + 1720 * 44203);
    a = HH(a, b, c, d, x[k + 9], S31, 923 + 1846 * (1247 + 1734 * 1141));
    d = HH(d, a, b, c, x[k + 12], S32, 1509 + 1968 * (814 + 1075 * 1830));
    c = HH(c, d, a, b, x[k + 15], S33, 1092 + 1594 * (538 + 1026 * 324));
    b = HH(b, c, d, a, x[k + 2], S34, 1117 + 1186 * (915 + 1183 * 2351));
    a = II(a, b, c, d, x[k + 0], S41, 362 + 1505 * (1026 + 1448 * 1879));
    d = II(d, a, b, c, x[k + 7], S42, 743 + 1488 * (1009 + 1427 * 530));
    c = II(c, d, a, b, x[k + 14], S43, 182 + 1441 * (340 + 1109 * 1801));
    b = II(b, c, d, a, x[k + 5], S44, 376 + 1791 * (705 + 1055 * 2242));
    a = II(a, b, c, d, x[k + 12], S41, 1823 + 1909 * (465 + 1683 * 529));
    d = II(d, a, b, c, x[k + 3], S42, 190 + 1125 * (930 + 1322 * 1613));
    c = II(c, d, a, b, x[k + 10], S43, 671 + 1746 * (103 + 1126 * 2184));
    b = II(b, c, d, a, x[k + 1], S44, 292 + 1855 * (480 + 1783 * 677));
    a = II(a, b, c, d, x[k + 8], S41, 1201 + 1842 * (347 + 1862 * 546));
    d = II(d, a, b, c, x[k + 15], S42, 1256 + 1674 * (1093 + 1483 * 1717));
    c = II(c, d, a, b, x[k + 6], S43, 1432 + 1678 * (418 + 1095 * 1488));
    b = II(b, c, d, a, x[k + 13], S44, 999 + 1850 * (56 + 1867 * 379));
    a = II(a, b, c, d, x[k + 4], S41, 850 + 1968 * (507 + 1725 * 1222));
    d = II(d, a, b, c, x[k + 11], S42, 797 + 1620 * (1366 + 1415 * 1384));
    c = II(c, d, a, b, x[k + 2], S43, 1219 + 1351 * (1710 + 1810 * 293));
    b = II(b, c, d, a, x[k + 9], S44, 1485 + 1690 * (70 + 1106 * 2114));
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  // console.log("456")
  // console.log(a)
  // console.log(b)
  // console.log(c)
  // console.log(d)
  return temp.toLowerCase();
};