window.md5 = function MD5(sMessage) {
  function RotateLeft(lValue, iShiftBits) {
    return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 820 + 1786 * (808 + 1690 * 711);
    lY8 = lY & 1352 + 1819 * (1177 + 1373 * 859);
    lX4 = lX & 669 + 1607 * (290 + 1625 * 411);
    lY4 = lY & 4 + 1356 * (931 + 1366 * 579);
    lResult = (lX & 859 + 1279 * (172 + 1672 * 502)) + (lY & 1236 + 1343 * (592 + 1871 * 427));
    if (lX4 & lY4) {
      return lResult ^ 1234 + 1883 * (1058 + 1800 * 633) ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 64 + 1989 * (840 + 1078 * 500)) {
        return lResult ^ 35 + 1009 * (256 + 1233 * 2589) ^ lX8 ^ lY8;
      } else {
        return lResult ^ 848 + 1232 * (28 + 1629 * 535) ^ lX8 ^ lY8;
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
        window["console"].log("md5 vmExpression_calc 没有这个 symbol =>", symbol);
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
  a = 457 + 1404 * (54 + 1562 * 790);
  b = 137 + 1760 * (720 + 1867 * 1224);
  c = 499 + 1133 * (241 + 1274 * 1775);
  d = 622 + 1478 * (1228 + 1756 * 104);
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 230 + 1330 * (885 + 1533 * 1772));
    d = FF(d, a, b, c, x[k + 1], S12, 778 + 1242 * (1010 + 1622 * 1938));
    c = FF(c, d, a, b, x[k + 2], S13, 50 + 1333 * (257 + 1103 * 412));
    b = FF(b, c, d, a, x[k + 3], S14, 1006 + 1520 * (993 + 1115 * 1917));
    a = FF(a, b, c, d, x[k + 4], S11, 967 + 1084 * (1151 + 1721 * 2207));
    d = FF(d, a, b, c, x[k + 5], S12, 1216 + 1243 * (550 + 1290 * 748));
    c = FF(c, d, a, b, x[k + 6], S13, 1082 + 1437 * (759 + 1365 * 1438));
    b = FF(b, c, d, a, x[k + 7], S14, 881 + 1224 * (575 + 1069 * 3247));
    a = FF(a, b, c, d, x[k + 8], S11, 981 + 1433 * (5 + 1182 * 1045));
    d = FF(d, a, b, c, x[k + 9], S12, 1217 + 1569 * (686 + 1856 * 802));
    c = FF(c, d, a, b, x[k + 10], S13, 223 + 1818 * (789 + 1034 * 2284));
    b = FF(b, c, d, a, x[k + 11], S14, 1494 + 1996 * (1278 + 1567 * 736));
    a = FF(a, b, c, d, x[k + 12], S11, 544 + 1403 * (660 + 1451 * 886));
    d = FF(d, a, b, c, x[k + 13], S12, 431 + 1811 * (1242 + 1298 * 1809));
    c = FF(c, d, a, b, x[k + 14], S13, 1011 + 1159 * (1155 + 1675 * 1438));
    b = FF(b, c, d, a, x[k + 15], S14, 759 + 1030 * (669 + 1425 * 842));
    a = GG(a, b, c, d, x[k + 1], S21, 91 + 1937 * (334 + 1159 * 1839));
    d = GG(d, a, b, c, x[k + 6], S22, 1464 + 1981 * (280 + 1260 * 1292));
    c = GG(c, d, a, b, x[k + 11], S23, 1293 + 1644 * (290 + 1597 * 245));
    b = GG(b, c, d, a, x[k + 0], S24, 508 + 1002 * (1069 + 1281 * 3054));
    a = GG(a, b, c, d, x[k + 5], S21, 1293 + 1826 * (1089 + 1697 * 1159));
    d = GG(d, a, b, c, x[k + 10], S22, 1288 + 1505 * 25259);
    c = GG(c, d, a, b, x[k + 15], S23, 679 + 1686 * (1395 + 1637 * 1316));
    b = GG(b, c, d, a, x[k + 4], S24, 450 + 1313 * (1494 + 1754 * 1688));
    a = GG(a, b, c, d, x[k + 9], S21, 1132 + 1898 * (484 + 1599 * 187));
    d = GG(d, a, b, c, x[k + 14], S22, 494 + 1417 * (696 + 1360 * 1699));
    c = GG(c, d, a, b, x[k + 3], S23, 377 + 1546 * (1392 + 1593 * 1667));
    b = GG(b, c, d, a, x[k + 8], S24, 309 + 1741 * (162 + 1162 * 575));
    a = GG(a, b, c, d, x[k + 13], S21, 439 + 1891 * (444 + 1738 * 867));
    d = GG(d, a, b, c, x[k + 2], S22, 386 + 1506 * (221 + 1850 * 1523));
    c = GG(c, d, a, b, x[k + 7], S23, 65 + 1958 * (655 + 1713 * 517));
    b = GG(b, c, d, a, x[k + 12], S24, 1021 + 1499 * (333 + 1143 * 1382));
    a = HH(a, b, c, d, x[k + 5], S31, 848 + 1366 * (496 + 1033 * 3043));
    d = HH(d, a, b, c, x[k + 8], S32, 1230 + 1481 * (1033 + 1893 * 810));
    c = HH(c, d, a, b, x[k + 11], S33, 1162 + 1700 * (1785 + 1797 * 601));
    b = HH(b, c, d, a, x[k + 14], S34, 1060 + 1930 * (285 + 1269 * 1739));
    a = HH(a, b, c, d, x[k + 1], S31, 844 + 1784 * (73 + 1006 * 1540));
    d = HH(d, a, b, c, x[k + 4], S32, 593 + 1528 * (323 + 1221 * 682));
    c = HH(c, d, a, b, x[k + 7], S33, 624 + 1960 * (699 + 1975 * 1069));
    b = HH(b, c, d, a, x[k + 10], S34, 412 + 1172 * (913 + 1008 * 2708));
    a = HH(a, b, c, d, x[k + 13], S31, 9 + 1845 * (140 + 1953 * 189));
    d = HH(d, a, b, c, x[k + 0], S32, 17 + 1637 * (353 + 1049 * 2292));
    c = HH(c, d, a, b, x[k + 3], S33, 1448 + 1887 * (1087 + 1325 * 1428));
    b = HH(b, c, d, a, x[k + 6], S34, 585 + 1182 * 64322);
    a = HH(a, b, c, d, x[k + 9], S31, 631 + 1094 * (435 + 1656 * 2017));
    d = HH(d, a, b, c, x[k + 12], S32, 102 + 1359 * (1041 + 1535 * 1856));
    c = HH(c, d, a, b, x[k + 15], S33, 50 + 1070 * (889 + 1331 * 372));
    b = HH(b, c, d, a, x[k + 2], S34, 401 + 1639 * (1431 + 1757 * 1145));
    a = II(a, b, c, d, x[k + 0], S41, 1878 + 1931 * (804 + 1055 * 2010));
    d = II(d, a, b, c, x[k + 7], S42, 391 + 1204 * (737 + 1459 * 641));
    c = II(c, d, a, b, x[k + 14], S43, 1055 + 1314 * (963 + 1127 * 1943));
    b = II(b, c, d, a, x[k + 5], S44, 1257 + 1732 * (244 + 1632 * 1499));
    a = II(a, b, c, d, x[k + 12], S41, 455 + 1452 * (1008 + 1375 * 851));
    d = II(d, a, b, c, x[k + 3], S42, 1234 + 1728 * (34 + 1091 * 1273));
    c = II(c, d, a, b, x[k + 10], S43, 1446 + 1459 * (1 + 1181 * 2492));
    b = II(b, c, d, a, x[k + 1], S44, 450 + 1369 * (42 + 1497 * 1093));
    a = II(a, b, c, d, x[k + 8], S41, 1581 + 1858 * (321 + 1172 * 860));
    d = II(d, a, b, c, x[k + 15], S42, 523 + 1727 * (189 + 1067 * 2314));
    c = II(c, d, a, b, x[k + 6], S43, 719 + 1467 * (511 + 1040 * 1792));
    b = II(b, c, d, a, x[k + 13], S44, 455 + 1898 * (1253 + 1530 * 450));
    a = II(a, b, c, d, x[k + 4], S41, 186 + 1180 * (1669 + 1689 * 2081));
    d = II(d, a, b, c, x[k + 11], S42, 941 + 1743 * (200 + 1127 * 1616));
    c = II(c, d, a, b, x[k + 2], S43, 344 + 1771 * (763 + 1262 * 321));
    b = II(b, c, d, a, x[k + 9], S44, 690 + 1597 * (459 + 1757 * 1408));
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
window["console"].log(window.md5("1"));