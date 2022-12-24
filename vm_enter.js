var {JSDOM} = require("jsdom");
var {window} = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
global["window"] = window;
fs = require("fs");

// zcj_console = console.log;
// console.log = function () {
//     try{
//         if (arguments[0] === window) {
//         debugger
//     }
//     }
//     catch (e){
//
//     }
//
//     return zcj_console.apply(undefined, arguments);
// }

var OPCODE = {
    PASS: 11, // 这是个无用字节码,不作任何操作
    PUSH_NUM: 12,
    PUSH_STR: 13,
    PUSH_NULL: 14,
    PUSH_UNDEFINED: 15,

    PUSH_WINDOW: 65, // 主要是this可能是构造器,导致这个this不是window了.
    PUSH_VAR: 66, // 将变量池里的变量压入栈
    MOV_VAR: 67,  // 对变量进行赋值
    PUSH_THIS: 68, // push this => 泛指window
    PUSH_CONSTANT: 69, // push 变量池

    GET_OBJ: 51, // window.console , 获取对象下的属性/对象 ; 数组也是对象,同理;
    SET_OBJ: 52, // window.console = xxx ; 数组也是对象,同理;
    APPLY: 53, // 方法调用
    COMPUTE: 54, // 运算,两个参数
    SINGLE_COMPUTE: 55, // 运算,单个参数
    UPDATE: 56, // a++ ++a --a a--

    NEW_ARRAY: 30, //创建一个空的数组
    NEW_OBJECT: 31, //创建一个空对象
    NEW_FUNC: 32, // 创建一个function
    NEW_CONSTRUCT: 33, // new 一个构造体

    UPDATE_STACK: 20,
    vm_decrement_stack: 21,

    TRY: 40,
    CATCH: 41,
    TRUE: 42,
    FALSE: 43,
    THROW: 44,
    CATCH_OVER: 45,
    DELETE: 46,
    DEBUG: 47,

    RETURN: 88,
    IS_TRUE: 89,
    SKIP_BLOCK: 90,
    GOTO: 91, // 跳转到循环头位置
    BREAK: 92, // break, 正常的思路应该是break出一段代码的.
    CONTINUE: 93, // continue

    '*': 1000,
    '/': 1001,
    '%': 1002,
    '+': 1003,
    '-': 1004,
    '<<': 1005,
    '>>': 1006,
    '>>>': 1007,
    '>': 1008,
    '<': 1009,
    '>=': 1010,
    '<=': 1011,
    '==': 1012,
    '===': 1013,
    '!==': 1014,
    '!=': 1015,
    '&': 1016,
    '^': 1017,
    '|': 1018,
    '=': 1019,
    '*=': 1020,
    '/=': 1021,
    '%=': 1022,
    '&=': 1023,
    '+=': 1024,
    '-=': 1025,
    '<<=': 1026,
    '>>=': 1027,
    '^=': 1028,
    '|=': 1029,
    'in': 1030,
    'instanceof': 1031,
};
var OPCODE1 = {
    '!': 1032,
    '+': 1033,
    '-': 1034,
    '~': 1035,
    'typeof': 1036,
    'void': 1037,
};
(function (constant) {

    function vm_enter(opcode, index, constant, stack, obj_arr) {

        function vm_opcodeToString(e, s) {
            cz = String["fromCharCode"];
            zc = [];
            for (m = 0; m < e.length; m++) {
                zc[m] = cz["apply"](String, [e[m]]);
            }
            return s = zc.join('');
        }

        function vm_push(e, s) {
            return vm_stack[vm_esp++] = e, s;
        }

        function vm_push_2(e, s) {
            return vm_stack[vm_esp] = e, vm_esp++, s;
        }

        function vm_push_fake_3(e, s) {
            return vm_stack[++vm_esp] = e, vm_esp--, s;
        }

        function vm_push_fake_2(e, s) {
            return s = vm_stack[vm_esp], vm_stack[vm_esp++] = s, vm_esp--, e;
        }

        function vm_push_fake_1(e, s) {
            return vm_stack[vm_esp + 1] = e, s;
        }

        function vm_update_stack(e, s) {

            return vm_esp++, s;
        }

        function vm_decrement_stack(e, s) {

            return vm_esp--, s;
        }

        function vm_slice() {
            var result;
            // 字符串长度
            h = vm_get_opcode();
            // result = opcode.slice(index, index + h).split("").map((opc) => {
            //     return opc.charCodeAt() - 32
            // });
            result = opcode.slice(index, index + h);
            index += h;
            return result;
        }

        function vm_stack_slice(s, e) {
            return vm_stack.splice(s, e);
        }

        function vm_get_value() {
            return vm_stack[--vm_esp];
        }

        function vm_get_value_fake() {
            return vm_stack[vm_esp - 1];
        }

        function vm_get_opcode() {
            return opcode[index++];
        }

        function vmExpression_single_calc(symbol, opNum1) {
            switch (symbol) {
                case "!":
                    return !opNum1
                case "+":
                    return +opNum1
                case "-":
                    return -opNum1
                case "~":
                    return ~opNum1
                case "typeof":
                    return typeof opNum1;
                case "void":
                    return void opNum1;
                default:
                    // debugger;
                    console.log("vmExpression_single_calc 没有这个 symbol =>", symbol);
                    return undefined
            }
        }

        function vmExpression_calc(symbol, opNum2, opNum1) {
            switch (symbol) {
                case "*":
                    return opNum1 * opNum2
                case "/":
                    return opNum1 / opNum2
                case "%":
                    return opNum1 % opNum2
                case "+":
                    return opNum1 + opNum2
                case "-":
                    return opNum1 - opNum2
                case "<<":
                    return opNum1 << opNum2
                case ">>":
                    return opNum1 >> opNum2
                case ">>>":
                    return opNum1 >>> opNum2
                case ">":
                    return opNum1 > opNum2
                case "<":
                    return opNum1 < opNum2
                case ">=":
                    return opNum1 >= opNum2
                case "<=":
                    return opNum1 <= opNum2
                case "==":
                    return opNum1 == opNum2
                case "===":
                    return opNum1 === opNum2
                case "!==":
                    return opNum1 !== opNum2
                case "!=":
                    return opNum1 != opNum2
                case "&":
                    return opNum1 & opNum2
                case "^":
                    return opNum1 ^ opNum2
                case "|":
                    return opNum1 | opNum2
                case "&&":
                    return opNum1 && opNum2
                case "||":
                    return opNum1 || opNum2
                case "=":
                    return opNum1 = opNum2
                case "*=":
                    return opNum1 *= opNum2
                case "/=":
                    return opNum1 /= opNum2
                case "%=":
                    return opNum1 %= opNum2
                case "&=":
                    return opNum1 &= opNum2
                case "+=":
                    return opNum1 += opNum2
                case "-=":
                    return opNum1 -= opNum2
                case "<<=":
                    return opNum1 <<= opNum2
                case ">>=":
                    return opNum1 >>= opNum2
                case "^=":
                    return opNum1 ^= opNum2
                case "|=":
                    return opNum1 |= opNum2
                case "in":
                    return opNum1 in opNum2
                case "instanceof":
                    return opNum1 instanceof opNum2
                default:
                    console.log("vmExpression_calc 没有这个 symbol =>", symbol)
                    return undefined
            }
        }

        function vm_call(s, e, p, args, constant) {
            var i;
            if (!p_constant) var p_constant = {};
            for (i = 0; i < p.length; i++) {
                p_constant[p[i]] = args[i];
            }
            Object.setPrototypeOf(p_constant, constant);
            p_constant["arguments"] = args;
            // 通过args把需要的参数放到当前常量池中去,然后开始调用
            h = vm_enter.apply(this, [opcode.slice(s, e), 0, p_constant, [], []]);

            return h;
        }

        var is_console = false;
        var vm_stack, h, y, d, g, m, cz, zc,
            hj, jk, lk, ik,
            vm_esp = 0, vm_constant = constant;

        for (var i in obj_arr) {
            vm_constant[obj_arr[i]] = this["window"][obj_arr[i]];
        }

        let get_key = (object, value) => {
            return Object.keys(object).find(key => object[key] === value)
        };

        vm_stack = !stack ? [] : stack;

        for (; ;) {
            // g = vm_get_opcode();
            g = opcode[index++];

            // console.log(g, "对应的指令 =>", get_key(OPCODE, g), " , 下一条指令 =>", opcode[index] , " index => " , index - 1);
            // if (!get_key(OPCODE, g)) {
            //     debugger
            // }

            // console.log(get_key(OPCODE, g));
            // g = opcode[index++];
            // if (vm_esp === -1) {
            //     console.log("堆栈索引都到-1了！！gg");
            //     debugger;
            // }

            if (Number.isNaN(g) || !g) {
                break
            }
            switch (g) {
                case OPCODE.PUSH_WINDOW:
                    vm_push(window);
                    break
                case OPCODE.PUSH_STR:
                    h = vm_opcodeToString.apply(undefined, [vm_slice()]);
                    vm_push(h);
                    // if (is_console) {
                    //     console.log("push 字符串 => ", h);
                    // }
                    break
                case OPCODE.PUSH_NUM:
                    h = vm_get_opcode();
                    vm_push(h);
                    break
                case OPCODE.PUSH_NULL:
                    vm_push(null);
                    break
                case OPCODE.PUSH_UNDEFINED:
                    vm_push(void 0);
                    break
                case OPCODE.PUSH_CONSTANT:
                    vm_push(vm_constant);
                    break
                case OPCODE.PUSH_THIS:
                    vm_push(this);
                    break
                case OPCODE.PUSH_VAR:
                    d = vm_get_value();
                    y = vm_get_value();
                    // console.log("push key => ", y);
                    if (d === undefined || y === undefined || d[y] === undefined) {
                        vm_push(undefined);
                        // console.log(" 对象 => ", !!d && d.toString(), " key => ", y)
                        break;
                    }
                    if (d === vm_constant && !d.hasOwnProperty(y)) {
                        h = d.__proto__;
                        while (h != null) {
                            if (h.hasOwnProperty(y)) {
                                d = h;
                                break
                            }
                            h = h.__proto__;
                        }
                    }
                    vm_push(d[y]);
                    if (is_console) {
                        console.log("push 对象 => ", d[y].toString(), "对象 => ", d.toString(), " key => ", y);
                    }
                    break
                case OPCODE.MOV_VAR:
                    /* 变量池或者其他的 */
                    d = vm_get_value();
                    /* key */
                    y = vm_get_value();
                    if (d === vm_constant && !d.hasOwnProperty(y)) {
                        h = d.__proto__;
                        while (h != null) {
                            if (h.hasOwnProperty(y)) {
                                d = h;
                                break
                            }
                            h = h.__proto__;
                        }
                    }
                    /* value */
                    h = vm_get_value();
                    d[y] = h;
                    break
                case OPCODE.COMPUTE:
                    /* d是第二个 */
                    d = vm_get_value();
                    /* y是第一个 */
                    y = vm_get_value();
                    /* symbol */
                    h = vm_get_value();
                    vm_push(vmExpression_calc(h, d, y));
                    break
                case OPCODE.SINGLE_COMPUTE:
                    /* 这里有二个值, 堆栈里的值,一个是标识符 */
                    d = vm_get_value();
                    /* symbol */
                    y = vm_get_value();
                    vm_push(vmExpression_single_calc(y, d));
                    break
                case OPCODE.UPDATE:
                    /* 这里有二个值, 对象, key 最后是标识符 */
                    /* 对象 */
                    d = vm_get_value();
                    /* key */
                    h = vm_get_value();
                    /* symbol */
                    y = vm_get_value();
                    switch (y) {
                        case "++":
                            d[h]++;
                            break
                        case "--":
                            d[h]--;
                            break
                    }
                    break
                case OPCODE.NEW_ARRAY:
                    /* new 一个 array 后面跟的是初始化的对象个数 */
                    y = vm_get_opcode();
                    // d = Array();
                    // for (var i = 0; i < y; i++) {
                    //     d[y - i - 1] = vm_get_value();
                    // }
                    d = vm_stack_slice(vm_esp - y, y);
                    vm_esp = vm_esp - y;
                    vm_push(d);
                    break
                case OPCODE.GET_OBJ:
                    /* 对象, key, 将值压入堆栈 */
                    y = vm_get_value();
                    d = vm_get_value();
                    h = y[d];
                    // h = vm_get_value()[vm_get_value()];
                    if (is_console) {
                        try {
                            console.log("GET_OBJ => ", d[y].toString(), "对象 => ", d.toString(), " key => ", y);
                        } catch (e) {
                            // debugger;
                        }
                    }
                    vm_push(h);

                    break;
                case OPCODE.SET_OBJ:
                    /* 对象,key,进行赋值 */
                    y = vm_get_value();
                    d = vm_get_value();
                    h = vm_get_value();
                    y[d] = h;

                    // if (is_console) {
                    //     console.log("SET_OBJ => ", d[y].toString(), "对象 => ", d.toString(), " key => ", y);
                    // }

                    /* 这样更具迷惑性 */
                    // vm_get_value()[vm_get_value()] = vm_get_value();
                    break
                case OPCODE.NEW_OBJECT:
                    y = {};
                    d = vm_get_opcode();

                    for (var i = 0; i < d; i++) {
                        m = vm_get_value();
                        h = vm_get_value();
                        y[h] = m;
                    }
                    vm_stack_slice(vm_esp, vm_stack.length - 1);
                    vm_push(y);
                    break
                case OPCODE.APPLY:
                    /* 定义在window下的方法,this是window,那在构造方法下呢? */
                    /* 调用者 */
                    y = vm_get_value();
                    /* 自定义方法 */
                    h = vm_get_value();
                    /* 传参 */
                    d = vm_get_value();

                    if (h === undefined) {
                        debugger
                        break
                    }
                    if (!!h.aaa) {
                        /* 这里this还没判断啊~ 很烦 */
                        d = h.apply(y, d);
                    } else {
                        /*  方法  */
                        if (h.name === "toString") {
                            /* toString(16) */
                            if (d.length > 1) {
                                console.log("toString 传参超过2个 ~~");
                            } else {
                                d = y.toString(d[0]);
                            }

                        } else if (h === undefined) {
                            /* 调用者为空 有bug 有bug */
                            // console.log("调用者为空 有bug!!!")
                            // debugger;
                            break;
                        } else {
                            d = h.apply(y, d);
                        }
                    }
                    /* 方法调用管你要不要值,我都直接push到堆栈里呢 */
                    vm_push(d);
                    break
                case OPCODE.NEW_FUNC:
                    y = vm_get_opcode();
                    d = index;
                    index += y;
                    vm_push(function () {
                        return zzz.aaa = d,
                            zzz.bbb = index,
                            zzz.ccc = vm_stack[--vm_esp],
                            zzz;
                        function zzz() {
                            h = vm_call.apply(this, [zzz.aaa, zzz.bbb, zzz.ccc, arguments, vm_constant]);
                            return h;
                        }
                    }
                    ());
                    break
                case OPCODE.IS_TRUE:
                    y = vm_get_value();
                    if (!!y) {
                        index++;
                    } else {
                        d = vm_get_opcode();
                        index += d;
                    }
                    break
                case OPCODE.SKIP_BLOCK:
                    y = vm_get_opcode();
                    index += y;
                    break
                case OPCODE.GOTO:
                    /* 这里可能会有问题 */
                    index -= vm_get_opcode();
                    break
                case OPCODE.NEW_CONSTRUCT:
                    /* 传参 */
                    d = vm_get_value();

                    /* 调用者/自定义方法 */
                    y = vm_get_value();

                    h = new y(...d);

                    vm_push(h);

                    // try {
                    //     vm_push(new y(...d));
                    // } catch (e) {
                    //     console.log("new 出霸哥~");
                    //     debugger;
                    //     // throw "new 出霸哥~"
                    // }
                    break
                case OPCODE.BREAK:
                    y = vm_get_opcode();
                    index += y;
                    if (index > opcode.length) {
                        console.log("break 超出当前opcode字节码数组长度~ return 上一层");
                        return [OPCODE.BREAK, y];
                    }
                    break
                case OPCODE.CONTINUE:
                    y = vm_get_opcode();
                    index -= y;
                    if (index < 0 || index > opcode.length) {
                        console.log("continue 超出当前opcode字节码数组长度~ return 上一层");
                        return [OPCODE.CONTINUE, y];
                    }
                    break
                case OPCODE.PASS:
                    break
                case OPCODE.TRUE:
                    h = void 0;
                    y = !h;
                    vm_push(y);
                    break
                case OPCODE.FALSE:
                    m = void 0;
                    d = !!m;
                    vm_push(d);
                    break
                case OPCODE.THROW:
                    throw vm_get_value();
                case OPCODE.TRY:
                    try {
                        /* 现在的索引 */
                        d = index;
                        /* try opcode */
                        y = vm_slice();
                        d += y.length + 1;
                        h = vm_enter(y, 0, vm_constant, vm_stack, []);
                        if (!!h) {
                            d = h[0] , y = h[1];
                            /* 这里多了2 try + slice 导致的index+2 */
                            switch (d) {
                                case OPCODE.BREAK:
                                    index += y;
                                    if (index > opcode.length) {
                                        console.log("try break 超出当前opcode字节码数组长度~ return 上一层");
                                        return [OPCODE.BREAK, y];
                                    }
                                    break
                                case OPCODE.CONTINUE:
                                    index -= y;
                                    if (index < 0 || index > opcode.length) {
                                        console.log("try continue 超出当前opcode字节码数组长度~ return 上一层");
                                        return [OPCODE.CONTINUE, y];
                                    }
                                    break
                                default:
                                    console.log("try 非BREAK CONTINUE 指令返回 => return ", h);
                                    return h;

                            }
                        }

                    } catch (e) {
                        vm_push(e);
                        index = d + 2;
                    }
                    break
                case OPCODE.UPDATE_STACK:
                    /* 把之前的值拿下来 */
                    vm_esp++;
                    break
                case OPCODE.DECREMENT_STACK:
                    vm_esp--;
                    break
                case OPCODE.DELETE:
                    d = vm_get_value();
                    // h = vm_get_value();
                    // delete h[d];
                    delete vm_get_value()[d];
                    break
                case OPCODE.RETURN:
                    y = vm_get_value();
                    return y;
                case OPCODE.DEBUG:
                    debugger;
                    break

                case OPCODE["*"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h * d;
                    vm_push(y);
                    break;

                case OPCODE["/"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h / d;
                    vm_push(y);
                    break;

                case OPCODE["%"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h % d;
                    vm_push(y);
                    break;

                case OPCODE["+"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h + d;
                    vm_push(y);
                    break;

                case OPCODE["-"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h - d;
                    vm_push(y);
                    break;

                case OPCODE["<<"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h << d;
                    vm_push(y);
                    break;

                case OPCODE[">>"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h >> d;
                    vm_push(y);
                    break;

                case OPCODE[">>>"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h >>> d;
                    vm_push(y);
                    break;

                case OPCODE[">"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h > d;
                    vm_push(y);
                    break;

                case OPCODE["<"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h < d;
                    vm_push(y);
                    break;

                case OPCODE[">="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h >= d;
                    vm_push(y);
                    break;

                case OPCODE["<="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h <= d;
                    vm_push(y);
                    break;

                case OPCODE["=="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h == d;
                    vm_push(y);
                    break;

                case OPCODE["==="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h === d;
                    vm_push(y);
                    break;

                case OPCODE["!=="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h !== d;
                    vm_push(y);
                    break;

                case OPCODE["!="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h != d;
                    vm_push(y);
                    break;

                case OPCODE["&"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h & d;
                    vm_push(y);
                    break;

                case OPCODE["^"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h ^ d;
                    vm_push(y);
                    break;

                case OPCODE["|"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h | d;
                    vm_push(y);
                    break;

                case OPCODE["="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h = d;
                    vm_push(y);
                    break;

                case OPCODE["*="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h *= d;
                    vm_push(y);
                    break;

                case OPCODE["/="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h /= d;
                    vm_push(y);
                    break;

                case OPCODE["%="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h %= d;
                    vm_push(y);
                    break;

                case OPCODE["&="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h &= d;
                    vm_push(y);
                    break;

                case OPCODE["+="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h += d;
                    vm_push(y);
                    break;

                case OPCODE["-="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h -= d;
                    vm_push(y);
                    break;
                case OPCODE["<<="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h <<= d;
                    vm_push(y);
                    break;
                case OPCODE[">>="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h >>= d;
                    vm_push(y);
                    break;
                case OPCODE["^="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h ^= d;
                    vm_push(y);
                    break;
                case OPCODE["|="]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h |= d;
                    vm_push(y);
                    break;
                case OPCODE["in"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h in d;
                    vm_push(y);
                    break;
                case OPCODE["instanceof"]:
                    d = vm_get_value();
                    h = vm_get_value();
                    y = h instanceof d;
                    vm_push(y);
                    break;
                case OPCODE1["!"]:
                    d = vm_get_value();
                    h = vm_get_value_fake();
                    y = !d;
                    vm_push(y);
                    break;
                case OPCODE1["+"]:
                    d = vm_get_value();
                    h = vm_get_value_fake();
                    y = +d
                    vm_push(y);
                    break;
                case OPCODE1["-"]:
                    d = vm_get_value();
                    h = vm_get_value_fake();
                    y = -d;
                    vm_push(y);
                    break;
                case OPCODE1["~"]:
                    d = vm_get_value();
                    h = vm_get_value_fake();
                    y = ~d
                    vm_push(y);
                    break;
                case OPCODE1["typeof"]:
                    d = vm_get_value();
                    h = vm_get_value_fake();
                    y = typeof d;
                    vm_push(y);
                    break;
                case OPCODE1["void"]:
                    d = vm_get_value();
                    h = vm_get_value_fake();
                    y = void d;
                    vm_push(y);
                    break;
                default:
                    console.log("index => ", index, "opcode => err => ", g);
                    debugger;
            }
        }

    }
    var opcode = eval(fs.readFileSync("./opcode.txt") + '')
    /* collect 存放for循环test 后 IS_TRUE的索引 */
    vm_enter(opcode, 0, constant, void 0, ['window']);
}).apply(window, [constant = {"$_jsvmp": true}])


// console.log(window.md5(''))



