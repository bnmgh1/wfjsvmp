window.md5 = function MD5(sMessage) {
  function RotateLeft(lValue, iShiftBits) {
    return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 1113 + 1507 * (192 + 1651 * 863);
    lY8 = lY & 726 + 1222 * (947 + 1053 * 1668);
    lX4 = lX & 755 + 1601 * (689 + 1390 * 482);
    lY4 = lY & 1270 + 1707 * (110 + 1709 * 368);
    lResult = (lX & 317 + 1013 * (725 + 1453 * 729)) + (lY & 651 + 1302 * (374 + 1336 * 617));
    if (lX4 & lY4) {
      return lResult ^ 250 + 1178 * (87 + 1193 * 1528) ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 829 + 1139 * (1029 + 1618 * 582)) {
        return lResult ^ 692 + 1796 * (755 + 1800 * 996) ^ lX8 ^ lY8;
      } else {
        return lResult ^ 452 + 1667 * (1591 + 1977 * 325) ^ lX8 ^ lY8;
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
  a = 1624 + 1641 * (598 + 1667 * 633);
  b = 686 + 1953 * (946 + 1423 * 1447);
  c = 1564 + 1718 * (539 + 1702 * 876);
  d = 514 + 1197 * (812 + 1508 * 150);
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 660 + 1135 * (620 + 1895 * 1680));
    d = FF(d, a, b, c, x[k + 1], S12, 1393 + 1929 * (230 + 1717 * 1179));
    c = FF(c, d, a, b, x[k + 2], S13, 711 + 1449 * (1837 + 1937 * 215));
    b = FF(b, c, d, a, x[k + 3], S14, 116 + 1699 * (252 + 1534 * 1247));
    a = FF(a, b, c, d, x[k + 4], S11, 447 + 1382 * (1496 + 1680 * 1773));
    d = FF(d, a, b, c, x[k + 5], S12, 242 + 1912 * (717 + 1935 * 324));
    c = FF(c, d, a, b, x[k + 6], S13, 1491 + 1546 * (50 + 1838 * 993));
    b = FF(b, c, d, a, x[k + 7], S14, 513 + 1510 * (512 + 1293 * 2176));
    a = FF(a, b, c, d, x[k + 8], S11, 448 + 1929 * (217 + 1025 * 895));
    d = FF(d, a, b, c, x[k + 9], S12, 163 + 1724 * (809 + 1935 * 700));
    c = FF(c, d, a, b, x[k + 10], S13, 13 + 1268 * (1479 + 1938 * 1747));
    b = FF(b, c, d, a, x[k + 11], S14, 502 + 1478 * (1772 + 1904 * 818));
    a = FF(a, b, c, d, x[k + 12], S11, 436 + 1142 * (135 + 1634 * 967));
    d = FF(d, a, b, c, x[k + 13], S12, 667 + 1208 * (206 + 1283 * 2745));
    c = FF(c, d, a, b, x[k + 14], S13, 66 + 1660 * (45 + 1568 * 1073));
    b = FF(b, c, d, a, x[k + 15], S14, 289 + 1280 * (392 + 1321 * 731));
    a = GG(a, b, c, d, x[k + 1], S21, 1043 + 1741 * (418 + 1399 * 1695));
    d = GG(d, a, b, c, x[k + 6], S22, 1534 + 1767 * (118 + 1212 * 1506));
    c = GG(c, d, a, b, x[k + 11], S23, 367 + 1831 * (284 + 1383 * 254));
    b = GG(b, c, d, a, x[k + 0], S24, 276 + 1822 * (661 + 1348 * 1596));
    a = GG(a, b, c, d, x[k + 5], S21, 661 + 1176 * (299 + 1845 * 1656));
    d = GG(d, a, b, c, x[k + 10], S22, 355 + 1252 * 30364);
    c = GG(c, d, a, b, x[k + 15], S23, 277 + 1972 * (1551 + 1662 * 1108));
    b = GG(b, c, d, a, x[k + 4], S24, 398 + 1950 * (1425 + 1502 * 1327));
    a = GG(a, b, c, d, x[k + 9], S21, 1113 + 1425 * (14 + 1965 * 203));
    d = GG(d, a, b, c, x[k + 14], S22, 858 + 1716 * (437 + 1858 * 1027));
    c = GG(c, d, a, b, x[k + 3], S23, 1256 + 1769 * (541 + 1601 * 1450));
    b = GG(b, c, d, a, x[k + 8], S24, 1577 + 1878 * (786 + 1372 * 451));
    a = GG(a, b, c, d, x[k + 13], S21, 934 + 1585 * (735 + 1752 * 1026));
    d = GG(d, a, b, c, x[k + 2], S22, 947 + 1137 * (1302 + 1973 * 1891));
    c = GG(c, d, a, b, x[k + 7], S23, 1374 + 1997 * (680 + 1673 * 519));
    b = GG(b, c, d, a, x[k + 12], S24, 1530 + 1607 * (440 + 1368 * 1077));
    a = HH(a, b, c, d, x[k + 5], S31, 1098 + 1435 * (40 + 1716 * 1744));
    d = HH(d, a, b, c, x[k + 8], S32, 349 + 1478 * (1460 + 1887 * 814));
    c = HH(c, d, a, b, x[k + 11], S33, 244 + 1037 * (486 + 1824 * 972));
    b = HH(b, c, d, a, x[k + 14], S34, 816 + 1021 * (1052 + 1561 * 2672));
    a = HH(a, b, c, d, x[k + 1], S31, 1004 + 1516 * (862 + 1118 * 1630));
    d = HH(d, a, b, c, x[k + 4], S32, 449 + 1567 * (470 + 1614 * 503));
    c = HH(c, d, a, b, x[k + 7], S33, 946 + 1627 * (273 + 1587 * 1603));
    b = HH(b, c, d, a, x[k + 10], S34, 1030 + 1687 * (702 + 1172 * 1618));
    a = HH(a, b, c, d, x[k + 13], S31, 1044 + 1695 * (1032 + 1839 * 218));
    d = HH(d, a, b, c, x[k + 0], S32, 184 + 1730 * (873 + 1126 * 2020));
    c = HH(c, d, a, b, x[k + 3], S33, 14 + 1701 * (606 + 1451 * 1447));
    b = HH(b, c, d, a, x[k + 6], S34, 159 + 1590 * 47817);
    a = HH(a, b, c, d, x[k + 9], S31, 837 + 1373 * (1289 + 1425 * 1867));
    d = HH(d, a, b, c, x[k + 12], S32, 704 + 1127 * (587 + 1356 * 2534));
    c = HH(c, d, a, b, x[k + 15], S33, 154 + 1837 * (126 + 1528 * 189));
    b = HH(b, c, d, a, x[k + 2], S34, 789 + 1974 * (1512 + 1736 * 962));
    a = II(a, b, c, d, x[k + 0], S41, 744 + 1734 * (1410 + 1452 * 1626));
    d = II(d, a, b, c, x[k + 7], S42, 655 + 1580 * (960 + 1597 * 446));
    c = II(c, d, a, b, x[k + 14], S43, 551 + 1039 * (294 + 1163 * 2382));
    b = II(b, c, d, a, x[k + 5], S44, 907 + 1917 * (233 + 1457 * 1517));
    a = II(a, b, c, d, x[k + 12], S41, 1431 + 1810 * (1139 + 1331 * 705));
    d = II(d, a, b, c, x[k + 3], S42, 796 + 1222 * (857 + 1852 * 1060));
    c = II(c, d, a, b, x[k + 10], S43, 557 + 1003 * (672 + 1450 * 2952));
    b = II(b, c, d, a, x[k + 1], S44, 541 + 1868 * (1609 + 1986 * 603));
    a = II(a, b, c, d, x[k + 8], S41, 143 + 1504 * (1397 + 1811 * 687));
    d = II(d, a, b, c, x[k + 15], S42, 296 + 1246 * (1011 + 1225 * 2793));
    c = II(c, d, a, b, x[k + 6], S43, 1512 + 1796 * (160 + 1503 * 1013));
    b = II(b, c, d, a, x[k + 13], S44, 1499 + 1567 * (895 + 1357 * 615));
    a = II(a, b, c, d, x[k + 4], S41, 994 + 1683 * (1304 + 1850 * 1332));
    d = II(d, a, b, c, x[k + 11], S42, 218 + 1203 * (1118 + 1295 * 2037));
    c = II(c, d, a, b, x[k + 2], S43, 177 + 1014 * (638 + 1425 * 497));
    b = II(b, c, d, a, x[k + 9], S44, 1350 + 1567 * (735 + 1985 * 1270));
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