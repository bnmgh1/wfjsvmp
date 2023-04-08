code = "var b = {\"a\":\"c\",1:1,b:\"3\"};var a = 10; a += b[1];"
code = "var a = function(){ console.log(1);}; a();"
code = "throw new Error('zcj');"
code = "var e = \"e\"\n" +
    "try {\n" +
    "    var q = \"123\";\n" +
    "    throw \"zcj\";\n" +
    "} catch (e) {\n" +
    "    console.log(e);\n" +
    "    var s = \"456\";\n" +
    "    try{\n" +
    "        q = \"777\";\n" +
    "        throw \"zcj\";\n" +
    "    }catch(e){\n" +
    "        q = \"888\"\n" +
    "    }finally{\n" +
    "        \n" +
    "    }\n" +
    "}finally{\n" +
    "    console.log(e);\n" +
    "    var m = \"1\";\n" +
    "}\n" +
    "console.log(s);\n" +
    "console.log(q);\n" +
    "console.log(m);"
code = "var a = {'a':{}}; a.a.c = 1000; console.log(a.a.c);"
code = "var c = 1;var a = b = 1; console.log(b);"
code = "function e() {\n" +
    "var r = [\"mJCZodK3nNfKsNPmwa\", \"r0vzq094vvC\", \"qZfbqLbOtwjdzW\", \"odC4mJuYzMD3te9m\", \"q1vbq09N\", \"rKzVta\", \"ruvzwu1cC1vczZfnswLzverbBW\", \"sdfRzvbrqq\", \"rfzVqG\", \"q2XRwu1syW\", \"rKvz\", \"BgvUz3rO\", \"q2TbveLrwuTcAgrt\", \"ChjVDg90ExbL\", \"ruzZvK53BZnduq\", \"mZeZmZu4mhHRCeLisq\", \"t0HJEuzQyYTlrey4t3HRk05trtjAu0fbsvn3nKWYsxbdEwDArfjWuKzeuvzfqvLuwgGWl0Hcy2zdrwndsMDJt0DbrK1dmKPeu2X4tKffzgXtA0u\", \"y29UC3rYDwn0B3i\", \"AxrLCMf0B3i\", \"rvzrq0HrvvDqD3rHqvrJqurcwq\", \"rLzbzK5rwve\", \"zgvMAw5LuhjVCgvYDhK\", \"rLzbwePN\", \"nwjpBunPrq\", \"q2Tfre94D2y\", \"q1vJzuPOme1gz2Xr\", \"r2WWuuLervHdEhGWqLe\", \"sgXbrKvcme5buJfJshPvEezbwwnxD1vbrNHZyG\", \"rgXbve9sC00\", \"mti2otuXm2TJELzKwG\", \"q2Tvze93wq\", \"q2Tfuu1sAW\", \"mZi4ota2mdH4zuv6rKS\", \"rvvfrKLNrKm\", \"mZKWmJG5mMDdDeXRza\", \"r2XVzu9sC2q\", \"qZfrzK5Omfy\", \"C3LTyM9S\", \"sdbbzK1rwvjbqMm\", \"r0vvqLbNCW\", \"rvvfrKLN\", \"Dw5KzwzPBMvK\", \"r2WWuuLetu0\", \"rfzVAuPNqvjbuJq\", \"sdfVrez4twjcDW\", \"mZeYmdaXnM9PvvPezq\", \"zNvUy3rPB24\"];\n" +
    "return (e = function () {\n" +
    "return r;\n" +
    "})();\n" +
    "}\n" +
    "\n" +
    "console.log(e(\"dadasd\"))"
code = "var ji = {\"y\":90, \"ds\":78}\nvar m = 'y';console.log(ji[m])"
code = "var a = 0;\n" +
    "var b = 1;\n" +
    "switch (a){\n" +
    "    case 0:\n" +
    "        console.log(\"0\");\n" +
    "    case b:\n" +
    "        console.log(\"1\")\n" +
    "        break\n" +
    "    case 2:\n" +
    "        console.log(2);\n" +
    "}"
code = "var a = 1;console.log(a.toString());"
code = "var a = 10;var b = {'c':100}; a += b.c;console.log(a);"
code = "var a = 1; a ? console.log(1) : console.log(2);console.log('end');"
code = "typeof module === \"object\" && typeof module.exports === \"object\""
code = "var ji = {\"y\":90, \"ds\":78}\n" +
    "for (var i in ji){\n" +
    "console.log(zcj);console.log(i);\n" +
    "}"
code = "var i = 0,length = 20;for(;i < length;i++){ console.log(i);if (i < 10) { continue; } else { break;}  }";
code = "var i = 0,length = 20;for(;i < length;){ i++;console.log(i);if (i < 10) { continue; } else if ( i > 50 ) { break } }console.log('end')";
code = "var i = 0,length = 20;for(;;){ i++;console.log(i);if (i < 10) { continue; } else if ( i > 50 ) { break }  } console.log('end')";
code = "var i = 0,length = 20;for(;;i++){ console.log(i);if (i < 10) { continue; } else if ( i > 50 ) { break }  } console.log('end')";
code = "typeof module === \"object\" && typeof module.exports === \"object\" && console.log(1) || console.log('a')"
code = "function a(){try{var a; return (a = 100);}catch(e){}}console.log(a());"
code = "var d;function a(){function b(a){console.log(a);d = a;} return b;} a()(1);console.log(d);"
code = "function a(){console.log('a',arguments[0]);function b(){ " +
    "console.log('b call => ',arguments[0]);}b(55555555555);console.log('a',arguments[0],arguments[1]);}a(4,5);"
code = "function a(){var target = arguments[0] || {};console.log(target);if(target = 1){console.log(target)}}a({'a':'a'});"
code = "var target = {'a':'b'};var a = function(){console.log('a')};a.fn = a.prototype;a.ex = a.fn.ex = function(){console.log('ex')};" +
    "        if (typeof target !== \"object\" && !a.ex(target)) {\n" +
    "            target = {};\n" +
    "        }" +
    "console.log(typeof target !== \"object\" && !a.ex(target));console.log(target);console.log(typeof target === \"boolean\");"
code = "var a = {\n" +
    "  'b': 1,\n" +
    "  'a': Array.isArray || 1,\n" +
    "  'c': '123'\n" +
    "}\n" +
    "console.log(a);"
code = "console.log(typeof module === \"object\" && typeof module.exports === \"object\");"
code = "for (var zcj = Object.keys({\n" +
    "      \"submit\": true,\n" +
    "      \"change\": true,\n" +
    "      \"focusin\": true\n" +
    "    }), zcj1 = 0; zcj1 < zcj.length; zcj1++) {\n" +
    "      var i = zcj[zcj1];console.log(i);}"
code = "function assert(func){func(123);}assert((function(a){console.log(a)}));"
code = "function a(){return 1 ? 1 == 2 && 3 : 4;}console.log(a());"
code = "var b = 0;function a(c){return 1 && c;}for(var i = 0;i < 100;i++){b += a(i);console.log(b);}"
code = "var a = b = c = 1; a = {}; b = c = a.a = 100;console.log(a,b,c)"
code = "var structure={},dataType='1';(structure[dataType] = structure[dataType] || []).push(5);console.log(structure)"
code = "var jQuery = {fn:{}};\n" +
    "var init = jQuery.fn.init = function (selector, context){ console.log(arguments[0])};console.log(init);"
code = "var a = setTimeout(function(){console.log(123)});console.log('a',a);"
code = "var wait = undefined,jQuery={readyWait:1};jQuery['a'] = 5;if (wait !== true && --jQuery.readyWait > 0) {\n" +
    "                console.log('bug');\n" +
    "            }console.log(jQuery);"
code = "var a = 1;console.log(--a);"
code = "var e;(e = function aaa(){console.log(aaa);})();"
code = "var a = 0; console.log(a); var e = !0 ? (a = 10) : 5;console.log(e);console.log(a);"
code = "var a = {'key':1};var deep;var q = {};" +
    "if (a !== undefined) {\n" +
    "        (q['key'] ? target : deep || (deep = {}))['key'] = a['key'];\n" +
    "      }" +
    "console.log(a);console.log(deep);"
code = "var e = {};    \n" +
    "(e.a = function () {\n" +
    "console.log(this);\n" +
    "})();"
code = "var b,se = {};if(true){(b = se.aa = {'a':1,'c':'aaa','dd':{'ccc':'123'}}).dd.m = b.dd.ccc;console.log(b);}"
code = "console.log(String.fromCharCode.apply(undefined,[99,99,99]));"
code = "for(var i = 0; ;){\n" +
    "   console.log(i);\n" +
    "   i++;\n" +
    "if (i == 7)    {try{console.log('zcj1');continue;}catch(e){console.log(e);}}\n" +
    "else if(i == 9){try{console.log('zcj');break;}catch(e){console.log(e);break}}\n" +
    "}console.log('end')"
code = "var b,se = {};(function(){console})(),(b = se.aa = {'a':1,'c':'aaa','dd':{'ccc':'123'}}).dd.a.m = b.dd.c.ccc;"
