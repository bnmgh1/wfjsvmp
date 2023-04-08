window.md5 = function MD5(sMessage) {
  function RotateLeft(lValue, iShiftBits) {
    return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 1072 + 1906 * (1546 + 1731 * 650);
    lY8 = lY & 791 + 1479 * (1276 + 1767 * 821);
    lX4 = lX & 40 + 1992 * (1370 + 1941 * 277);
    lY4 = lY & 639 + 1397 * (957 + 1192 * 644);
    lResult = (lX & 1023 + 1271 * (1440 + 1506 * 560)) + (lY & 1134 + 1337 * (345 + 1808 * 444));
    if (lX4 & lY4) {
      return lResult ^ 8 + 1524 * (184 + 1454 * 969) ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 892 + 1452 * (830 + 1991 * 371)) {
        return lResult ^ 530 + 1066 * (1234 + 1467 * 2059) ^ lX8 ^ lY8;
      } else {
        return lResult ^ 1360 + 1368 * (998 + 1340 * 585) ^ lX8 ^ lY8;
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
    window["console"].log(symbol, opNum2, opNum1);
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
  a = 718 + 1275 * (389 + 1235 * 1100);
  b = 917 + 1556 * (475 + 1490 * 1735);
  c = 608 + 1394 * (183 + 1947 * 944);
  d = 966 + 1804 * (896 + 1826 * 82);
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 1058 + 1167 * (1122 + 1314 * 2356));
    d = FF(d, a, b, c, x[k + 1], S12, 469 + 1963 * (507 + 1700 * 1170));
    c = FF(c, d, a, b, x[k + 2], S13, 999 + 1590 * (563 + 1345 * 283));
    b = FF(b, c, d, a, x[k + 3], S14, 1846 + 1965 * (802 + 1927 * 858));
    a = FF(a, b, c, d, x[k + 4], S11, 737 + 1654 * (548 + 1711 * 1455));
    d = FF(d, a, b, c, x[k + 5], S12, 521 + 1333 * (441 + 1604 * 561));
    c = FF(c, d, a, b, x[k + 6], S13, 1171 + 1408 * (813 + 1148 * 1745));
    b = FF(b, c, d, a, x[k + 7], S14, 1466 + 1533 * (924 + 1829 * 1515));
    a = FF(a, b, c, d, x[k + 8], S11, 301 + 1409 * (387 + 1474 * 852));
    d = FF(d, a, b, c, x[k + 9], S12, 1177 + 1369 * (1062 + 1208 * 1412));
    c = FF(c, d, a, b, x[k + 10], S13, 1080 + 1453 * (1279 + 1958 * 1509));
    b = FF(b, c, d, a, x[k + 11], S14, 1005 + 1559 * (751 + 1718 * 860));
    a = FF(a, b, c, d, x[k + 12], S11, 162 + 1552 * (104 + 1468 * 792));
    d = FF(d, a, b, c, x[k + 13], S12, 14 + 1227 * (919 + 1459 * 2376));
    c = FF(c, d, a, b, x[k + 14], S13, 862 + 1072 * (957 + 1260 * 2067));
    b = FF(b, c, d, a, x[k + 15], S14, 481 + 1139 * (784 + 1398 * 776));
    a = GG(a, b, c, d, x[k + 1], S21, 1274 + 1924 * (808 + 1210 * 1773));
    d = GG(d, a, b, c, x[k + 6], S22, 1162 + 1209 * (62 + 1611 * 1656));
    c = GG(c, d, a, b, x[k + 11], S23, 293 + 1718 * (1690 + 1865 * 200));
    b = GG(b, c, d, a, x[k + 0], S24, 1194 + 1280 * (1207 + 1219 * 2512));
    a = GG(a, b, c, d, x[k + 5], S21, 423 + 1066 * (1503 + 1678 * 2008));
    d = GG(d, a, b, c, x[k + 10], S22, 434 + 1701 * 22349);
    c = GG(c, d, a, b, x[k + 15], S23, 1157 + 1318 * (286 + 1052 * 2621));
    b = GG(b, c, d, a, x[k + 4], S24, 1515 + 1553 * (71 + 1345 * 1862));
    a = GG(a, b, c, d, x[k + 9], S21, 1228 + 1282 * (830 + 1967 * 225));
    d = GG(d, a, b, c, x[k + 14], S22, 666 + 1505 * (728 + 1148 * 1895));
    c = GG(c, d, a, b, x[k + 3], S23, 199 + 1456 * (932 + 1408 * 2003));
    b = GG(b, c, d, a, x[k + 8], S24, 566 + 1743 * (23 + 1354 * 493));
    a = GG(a, b, c, d, x[k + 13], S21, 1053 + 1084 * (214 + 1400 * 1878));
    d = GG(d, a, b, c, x[k + 2], S22, 1369 + 1559 * (1237 + 1660 * 1639));
    c = GG(c, d, a, b, x[k + 7], S23, 945 + 1628 * (378 + 1588 * 671));
    b = GG(b, c, d, a, x[k + 12], S24, 234 + 1457 * (761 + 1503 * 1081));
    a = HH(a, b, c, d, x[k + 5], S31, 1378 + 1470 * (276 + 1156 * 2527));
    d = HH(d, a, b, c, x[k + 8], S32, 130 + 1139 * (517 + 1840 * 1084));
    c = HH(c, d, a, b, x[k + 11], S33, 410 + 1828 * (50 + 1008 * 998));
    b = HH(b, c, d, a, x[k + 14], S34, 1372 + 1548 * (484 + 1408 * 1954));
    a = HH(a, b, c, d, x[k + 1], S31, 867 + 1189 * (1421 + 1815 * 1280));
    d = HH(d, a, b, c, x[k + 4], S32, 1033 + 1701 * (480 + 1230 * 608));
    c = HH(c, d, a, b, x[k + 7], S33, 304 + 1040 * (63 + 1518 * 2622));
    b = HH(b, c, d, a, x[k + 10], S34, 326 + 1835 * (256 + 1183 * 1474));
    a = HH(a, b, c, d, x[k + 13], S31, 850 + 1537 * (366 + 1934 * 229));
    d = HH(d, a, b, c, x[k + 0], S32, 1100 + 1418 * (713 + 1623 * 1710));
    c = HH(c, d, a, b, x[k + 3], S33, 447 + 1403 * (514 + 1278 * 1992));
    b = HH(b, c, d, a, x[k + 6], S34, 584 + 1117 * (1265 + 1670 * 40));
    a = HH(a, b, c, d, x[k + 9], S31, 484 + 1205 * (85 + 1388 * 2185));
    d = HH(d, a, b, c, x[k + 12], S32, 894 + 1287 * (867 + 1083 * 2778));
    c = HH(c, d, a, b, x[k + 15], S33, 763 + 1079 * (431 + 1454 * 338));
    b = HH(b, c, d, a, x[k + 2], S34, 144 + 1521 * (1241 + 1345 * 1612));
    a = II(a, b, c, d, x[k + 0], S41, 1526 + 1751 * (735 + 1483 * 1577));
    d = II(d, a, b, c, x[k + 7], S42, 1079 + 1248 * (857 + 1455 * 620));
    c = II(c, d, a, b, x[k + 14], S43, 500 + 1653 * (479 + 1618 * 1076));
    b = II(b, c, d, a, x[k + 5], S44, 343 + 1082 * (759 + 1565 * 2502));
    a = II(a, b, c, d, x[k + 12], S41, 1331 + 1960 * (798 + 1821 * 476));
    d = II(d, a, b, c, x[k + 3], S42, 82 + 1044 * (592 + 1216 * 1890));
    c = II(c, d, a, b, x[k + 10], S43, 645 + 1448 * (735 + 1562 * 1898));
    b = II(b, c, d, a, x[k + 1], S44, 928 + 1831 * (164 + 1755 * 697));
    a = II(a, b, c, d, x[k + 8], S41, 1468 + 1947 * (13 + 1318 * 730));
    d = II(d, a, b, c, x[k + 15], S42, 212 + 1212 * (438 + 1839 * 1913));
    c = II(c, d, a, b, x[k + 6], S43, 572 + 1463 * (1044 + 1932 * 967));
    b = II(b, c, d, a, x[k + 13], S44, 981 + 1113 * (1202 + 1662 * 707));
    a = II(a, b, c, d, x[k + 4], S41, 388 + 1437 * (1424 + 1775 * 1626));
    d = II(d, a, b, c, x[k + 11], S42, 1492 + 1945 * (331 + 1269 * 1286));
    c = II(c, d, a, b, x[k + 2], S43, 191 + 1433 * (473 + 1029 * 487));
    b = II(b, c, d, a, x[k + 9], S44, 1695 + 1715 * (190 + 1095 * 2104));
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