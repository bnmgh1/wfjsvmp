window.md5 = function MD5(sMessage) {
  function RotateLeft(lValue, iShiftBits) {
    return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 1447 + 1501 * (423 + 1829 * 782);
    lY8 = lY & 338 + 1338 * (1045 + 1887 * 850);
    lX4 = lX & 1396 + 1798 * (1720 + 1721 * 346);
    lY4 = lY & 280 + 1116 * (379 + 1983 * 485);
    lResult = (lX & 639 + 1944 * (1548 + 1659 * 332)) + (lY & 1463 + 1540 * (334 + 1212 * 575));
    if (lX4 & lY4) {
      return lResult ^ 519 + 1139 * (463 + 1124 * 1677) ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 1156 + 1846 * (1490 + 1543 * 376)) {
        return lResult ^ 1160 + 1723 * (1372 + 1812 * 1031) ^ lX8 ^ lY8;
      } else {
        return lResult ^ 904 + 1596 * (755 + 1065 * 631) ^ lX8 ^ lY8;
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
      z = 0;
    var lMessageLength = sMessage.length;
    var ua = window["navigator"].userAgent;
    ua = ua.split('').map(function (it) {
      return it.charCodeAt();
    });
    var sss = +sMessage[sMessage.length - 1];
    var qqq = sMessage.length - sss;
    var m = (sss + '').charCodeAt();
    var iii = 0;
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
  a = 655 + 1719 * (126 + 1232 * 818);
  b = 761 + 1416 * (492 + 1286 * 2209);
  c = 608 + 1253 * (594 + 1563 * 1308);
  d = 832 + 1059 * (456 + 1543 * 166);
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 135 + 1205 * (7 + 1914 * 1567));
    d = FF(d, a, b, c, x[k + 1], S12, 187 + 1177 * (675 + 1133 * 2928));
    c = FF(c, d, a, b, x[k + 2], S13, 258 + 1319 * (735 + 1593 * 288));
    b = FF(b, c, d, a, x[k + 3], S14, 1092 + 1286 * (1049 + 1590 * 1589));
    a = FF(a, b, c, d, x[k + 4], S11, 907 + 1559 * (1618 + 1766 * 1495));
    d = FF(d, a, b, c, x[k + 5], S12, 1082 + 1552 * (57 + 1562 * 495));
    c = FF(c, d, a, b, x[k + 6], S13, 425 + 1730 * (1361 + 1895 * 860));
    b = FF(b, c, d, a, x[k + 7], S14, 257 + 1101 * (1183 + 1311 * 2943));
    a = FF(a, b, c, d, x[k + 8], S11, 100 + 1383 * (462 + 1715 * 746));
    d = FF(d, a, b, c, x[k + 9], S12, 1364 + 1971 * (191 + 1207 * 982));
    c = FF(c, d, a, b, x[k + 10], S13, 87 + 1303 * (916 + 1079 * 3054));
    b = FF(b, c, d, a, x[k + 11], S14, 838 + 1032 * (79 + 1886 * 1184));
    a = FF(a, b, c, d, x[k + 12], S11, 659 + 1173 * (1691 + 1865 * 824));
    d = FF(d, a, b, c, x[k + 13], S12, 1079 + 1332 * (508 + 1415 * 2257));
    c = FF(c, d, a, b, x[k + 14], S13, 286 + 1960 * (136 + 1091 * 1306));
    b = FF(b, c, d, a, x[k + 15], S14, 1470 + 1947 * (867 + 1305 * 486));
    a = GG(a, b, c, d, x[k + 1], S21, 975 + 1373 * (958 + 1361 * 2209));
    d = GG(d, a, b, c, x[k + 6], S22, 799 + 1509 * (1401 + 1887 * 1132));
    c = GG(c, d, a, b, x[k + 11], S23, 81 + 1536 * (767 + 1680 * 249));
    b = GG(b, c, d, a, x[k + 0], S24, 424 + 1895 * (522 + 1634 * 1266));
    a = GG(a, b, c, d, x[k + 5], S21, 517 + 1401 * (1334 + 1407 * 1822));
    d = GG(d, a, b, c, x[k + 10], S22, 240 + 1609 * 23627);
    c = GG(c, d, a, b, x[k + 15], S23, 125 + 1628 * (727 + 1641 * 1360));
    b = GG(b, c, d, a, x[k + 4], S24, 1448 + 1500 * (740 + 1204 * 2153));
    a = GG(a, b, c, d, x[k + 9], S21, 636 + 1583 * (1254 + 1278 * 280));
    d = GG(d, a, b, c, x[k + 14], S22, 299 + 1931 * (834 + 1613 * 1051));
    c = GG(c, d, a, b, x[k + 3], S23, 539 + 1788 * (517 + 1044 * 2200));
    b = GG(b, c, d, a, x[k + 8], S24, 671 + 1870 * (260 + 1879 * 331));
    a = GG(a, b, c, d, x[k + 13], S21, 517 + 1792 * (921 + 1560 * 1019));
    d = GG(d, a, b, c, x[k + 2], S22, 230 + 1977 * (872 + 1121 * 1914));
    c = GG(c, d, a, b, x[k + 7], S23, 558 + 1735 * (79 + 1961 * 510));
    b = GG(b, c, d, a, x[k + 12], S24, 807 + 1211 * (899 + 1526 * 1281));
    a = HH(a, b, c, d, x[k + 5], S31, 4 + 1098 * (1300 + 1309 * 2987));
    d = HH(d, a, b, c, x[k + 8], S32, 113 + 1768 * (834 + 1473 * 872));
    c = HH(c, d, a, b, x[k + 11], S33, 162 + 1025 * (692 + 1294 * 1386));
    b = HH(b, c, d, a, x[k + 14], S34, 340 + 1290 * (612 + 1636 * 2018));
    a = HH(a, b, c, d, x[k + 1], S31, 932 + 1578 * (1308 + 1860 * 941));
    d = HH(d, a, b, c, x[k + 4], S32, 38 + 1007 * (640 + 1209 * 1045));
    c = HH(c, d, a, b, x[k + 7], S33, 1111 + 1551 * (723 + 1879 * 1420));
    b = HH(b, c, d, a, x[k + 10], S34, 460 + 1241 * (1348 + 1678 * 1536));
    a = HH(a, b, c, d, x[k + 13], S31, 339 + 1515 * (1630 + 1923 * 233));
    d = HH(d, a, b, c, x[k + 0], S32, 1522 + 1652 * (682 + 1306 * 1824));
    c = HH(c, d, a, b, x[k + 3], S33, 203 + 1647 * (90 + 1378 * 1574));
    b = HH(b, c, d, a, x[k + 6], S34, 189 + 1500 * 50686);
    a = HH(a, b, c, d, x[k + 9], S31, 1062 + 1097 * (891 + 1280 * 2602));
    d = HH(d, a, b, c, x[k + 12], S32, 212 + 1507 * (482 + 1685 * 1525));
    c = HH(c, d, a, b, x[k + 15], S33, 718 + 1418 * (949 + 1697 * 220));
    b = HH(b, c, d, a, x[k + 2], S34, 145 + 1604 * (869 + 1424 * 1444));
    a = II(a, b, c, d, x[k + 0], S41, 160 + 1181 * (204 + 1112 * 3119));
    d = II(d, a, b, c, x[k + 7], S42, 1435 + 1490 * (918 + 1927 * 392));
    c = II(c, d, a, b, x[k + 14], S43, 383 + 1128 * (445 + 1133 * 2252));
    b = II(b, c, d, a, x[k + 5], S44, 1113 + 1712 * (394 + 1840 * 1345));
    a = II(a, b, c, d, x[k + 12], S41, 785 + 1467 * (107 + 1697 * 683));
    d = II(d, a, b, c, x[k + 3], S42, 1525 + 1559 * (303 + 1022 * 1506));
    c = II(c, d, a, b, x[k + 10], S43, 601 + 1403 * (1190 + 1461 * 2094));
    b = II(b, c, d, a, x[k + 1], S44, 207 + 1518 * (167 + 1568 * 941));
    a = II(a, b, c, d, x[k + 8], S41, 879 + 1336 * (52 + 1712 * 819));
    d = II(d, a, b, c, x[k + 15], S42, 1177 + 1355 * (949 + 1804 * 1744));
    c = II(c, d, a, b, x[k + 6], S43, 811 + 1499 * (1222 + 1549 * 1177));
    b = II(b, c, d, a, x[k + 13], S44, 843 + 1957 * (918 + 1758 * 380));
    a = II(a, b, c, d, x[k + 4], S41, 876 + 1735 * (760 + 1575 * 1518));
    d = II(d, a, b, c, x[k + 11], S42, 1523 + 1569 * (1126 + 1350 * 1498));
    c = II(c, d, a, b, x[k + 2], S43, 45 + 1311 * (318 + 1473 * 372));
    b = II(b, c, d, a, x[k + 9], S44, 596 + 1927 * (1330 + 1753 * 1169));
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