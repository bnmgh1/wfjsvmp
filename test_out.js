function MD5(sMessage) {
  function RotateLeft(lValue, iShiftBits) {
    return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 641 + 1629 * (1583 + 1900 * 693);
    lY8 = lY & 1648 + 2000 * (321 + 1124 * 955);
    lX4 = lX & 1324 + 1500 * (343 + 1414 * 506);
    lY4 = lY & 526 + 1106 * (237 + 1254 * 774);
    lResult = (lX & 406 + 1283 * (193 + 1262 * 663)) + (lY & 777 + 1706 * (1015 + 1372 * 458));
    if (lX4 & lY4) {
      return lResult ^ 912 + 1808 * (177 + 1030 * 1153) ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 1550 + 1931 * (1027 + 1331 * 417)) {
        return lResult ^ 1341 + 1383 * (1377 + 1820 * 1279) ^ lX8 ^ lY8;
      } else return lResult ^ 1332 + 1588 * (19 + 1146 * 590) ^ lX8 ^ lY8;
    } else return lResult ^ lX8 ^ lY8;
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
  function ConvertToWordArray(sMessage) {
    var lWordCount;
    var cbb0;
    var lMessageLength = sMessage.length;
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
  b = 1153 + 1389 * (606 + 1678 * 743);
  d = 40 + 1999 * (475 + 1202 * 1674);
  a = 867 + 1355 * (1080 + 1487 * 1271);
  c = 130 + 1014 * (1228 + 1933 * 138);
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 686 + 1721 * (50 + 1948 * 1078));
    d = FF(d, a, b, c, x[k + 1], S12, 100 + 1810 * (801 + 1419 * 1520));
    c = FF(c, d, a, b, x[k + 2], S13, 1621 + 1778 * (166 + 1947 * 175));
    b = FF(b, c, d, a, x[k + 3], S14, 874 + 1228 * (317 + 1298 * 2039));
    a = FF(a, b, c, d, x[k + 4], S11, 4 + 1245 * (1612 + 1707 * 1937));
    d = FF(d, a, b, c, x[k + 5], S12, 260 + 1007 * (1698 + 1880 * 633));
    c = FF(c, d, a, b, x[k + 6], S13, 15 + 1571 * (322 + 1307 * 1374));
    b = FF(b, c, d, a, x[k + 7], S14, 1561 + 1564 * (526 + 1036 * 2622));
    a = FF(a, b, c, d, x[k + 8], S11, 91 + 1065 * (401 + 1834 * 906));
    d = FF(d, a, b, c, x[k + 9], S12, 969 + 1442 * (445 + 1845 * 878));
    c = FF(c, d, a, b, x[k + 10], S13, 177 + 1856 * (1529 + 1653 * 1399));
    b = FF(b, c, d, a, x[k + 11], S14, 838 + 1032 * (887 + 1854 * 1204));
    a = FF(a, b, c, d, x[k + 12], S11, 1802 + 1845 * (920 + 1508 * 648));
    d = FF(d, a, b, c, x[k + 13], S12, 141 + 1154 * (835 + 1392 * 2648));
    c = FF(c, d, a, b, x[k + 14], S13, 1486 + 1548 * (1100 + 1780 * 1013));
    b = FF(b, c, d, a, x[k + 15], S14, 876 + 1617 * (546 + 1293 * 591));
    a = GG(a, b, c, d, x[k + 1], S21, 298 + 1828 * (1604 + 1677 * 1346));
    d = GG(d, a, b, c, x[k + 6], S22, 620 + 1418 * (1795 + 1999 * 1137));
    c = GG(c, d, a, b, x[k + 11], S23, 532 + 1303 * (1101 + 1918 * 257));
    b = GG(b, c, d, a, x[k + 0], S24, 754 + 1320 * (513 + 1662 * 1787));
    a = GG(a, b, c, d, x[k + 5], S21, 1373 + 1808 * (1252 + 1607 * 1236));
    d = GG(d, a, b, c, x[k + 10], S22, 938 + 1395 * 27251);
    c = GG(c, d, a, b, x[k + 15], S23, 1273 + 1732 * (158 + 1003 * 2092));
    b = GG(b, c, d, a, x[k + 4], S24, 608 + 1080 * (1038 + 1497 * 2405));
    a = GG(a, b, c, d, x[k + 9], S21, 182 + 1862 * (1583 + 1985 * 153));
    d = GG(d, a, b, c, x[k + 14], S22, 872 + 1861 * (302 + 1048 * 1679));
    c = GG(c, d, a, b, x[k + 3], S23, 1193 + 1611 * (1147 + 1175 * 2169));
    b = GG(b, c, d, a, x[k + 8], S24, 541 + 1420 * (1192 + 1663 * 492));
    a = GG(a, b, c, d, x[k + 13], S21, 829 + 1900 * (366 + 1672 * 897));
    d = GG(d, a, b, c, x[k + 2], S22, 108 + 1279 * (341 + 1605 * 2067));
    c = GG(c, d, a, b, x[k + 7], S23, 304 + 1371 * (909 + 1585 * 798));
    b = GG(b, c, d, a, x[k + 12], S24, 454 + 1282 * (450 + 1272 * 1452));
    a = HH(a, b, c, d, x[k + 5], S31, 319 + 1353 * (701 + 1162 * 2731));
    d = HH(d, a, b, c, x[k + 8], S32, 953 + 1320 * (769 + 1205 * 1428));
    c = HH(c, d, a, b, x[k + 11], S33, 1512 + 1670 * (935 + 1038 * 1060));
    b = HH(b, c, d, a, x[k + 14], S34, 1238 + 1906 * (1361 + 1574 * 1419));
    a = HH(a, b, c, d, x[k + 1], S31, 1136 + 1545 * (225 + 1805 * 991));
    d = HH(d, a, b, c, x[k + 4], S32, 492 + 1667 * (303 + 1880 * 406));
    c = HH(c, d, a, b, x[k + 7], S33, 1114 + 1785 * (1122 + 1676 * 1383));
    b = HH(b, c, d, a, x[k + 10], S34, 1189 + 1573 * (1397 + 1893 * 1074));
    a = HH(a, b, c, d, x[k + 13], S31, 1705 + 1709 * (355 + 1526 * 261));
    d = HH(d, a, b, c, x[k + 0], S32, 552 + 1842 * (186 + 1645 * 1299));
    c = HH(c, d, a, b, x[k + 3], S33, 1358 + 1753 * (15 + 1098 * 1856));
    b = HH(b, c, d, a, x[k + 6], S34, 830 + 1913 * 39743);
    a = HH(a, b, c, d, x[k + 9], S31, 304 + 1709 * (925 + 1735 * 1232));
    d = HH(d, a, b, c, x[k + 12], S32, 351 + 1685 * (816 + 1055 * 2178));
    c = HH(c, d, a, b, x[k + 15], S33, 679 + 1697 * (21 + 1071 * 292));
    b = HH(b, c, d, a, x[k + 2], S34, 409 + 1966 * (371 + 1721 * 975));
    a = II(a, b, c, d, x[k + 0], S41, 1356 + 1596 * (615 + 1491 * 1721));
    d = II(d, a, b, c, x[k + 7], S42, 455 + 1040 * (1083 + 1386 * 781));
    c = II(c, d, a, b, x[k + 14], S43, 1325 + 1374 * (829 + 1649 * 1270));
    b = II(b, c, d, a, x[k + 5], S44, 1448 + 1507 * (435 + 1828 * 1538));
    a = II(a, b, c, d, x[k + 12], S41, 1091 + 1896 * (1299 + 1359 * 659));
    d = II(d, a, b, c, x[k + 3], S42, 1641 + 1829 * (269 + 1644 * 798));
    c = II(c, d, a, b, x[k + 10], S43, 413 + 1162 * (556 + 1441 * 2564));
    b = II(b, c, d, a, x[k + 1], S44, 1153 + 1727 * (886 + 1857 * 698));
    a = II(a, b, c, d, x[k + 8], S41, 99 + 1085 * (20 + 1806 * 956));
    d = II(d, a, b, c, x[k + 15], S42, 1364 + 1836 * (89 + 1864 * 1246));
    c = II(c, d, a, b, x[k + 6], S43, 1126 + 1970 * (917 + 1965 * 706));
    b = II(b, c, d, a, x[k + 13], S44, 1463 + 1663 * (338 + 1253 * 628));
    a = II(a, b, c, d, x[k + 4], S41, 1124 + 1289 * (784 + 1526 * 2109));
    d = II(d, a, b, c, x[k + 11], S42, 670 + 1807 * (946 + 1801 * 975));
    c = II(c, d, a, b, x[k + 2], S43, 1408 + 1421 * (781 + 1295 * 390));
    b = II(b, c, d, a, x[k + 9], S44, 1515 + 1630 * (1091 + 1770 * 1369));
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  // console.log("456")
  return temp.toLowerCase();
  // console.log(a)
  // console.log(b)
  // console.log(c)
  // console.log(d)
}
// zcj_console = console.log;console.log = function(){if(arguments[0] === "hello"){debugger;}return zcj_console.apply(this,arguments)}
window["console"].log(MD5("123"));