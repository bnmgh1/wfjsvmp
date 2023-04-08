var {JSDOM} = require("jsdom");
// 在浏览器里运行话, 更好点
var {window} = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
global["window"] = window;

var {parse} = require("@babel/parser");
traverse = require("@babel/traverse").default;
generator = require("@babel/generator").default;
type = require("@babel/types");
fs = require("fs");
var code;
/* 保存整个js里属于window的对象 console,Object,document */
var obj = [];
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
    DECREMENT_STACK: 21,

    TRY: 40,
    CATCH: 41,
    TRUE: 42,
    FALSE: 43,
    THROW: 44,
    CATCH_OVER: 45,
    DELETE: 46,
    DEBUG: 47,
    FORIN: 48,
    FINALLY: 49,

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
    "**": 1032,

}
var OPCODE1 = {
    '!': 1032,
    '+': 1033,
    '-': 1034,
    '~': 1035,
    'typeof': 1036,
    'void': 1037,
}

var NEW_OPCODE = {};
var NEW_OPCODE1 = {};

/* 一个指令对应几种字节码, 也意味着vmp代码cases会翻几倍 */
var times = 2,
    turn, vmp_turn;
/* 开关, 膨胀指令对应字节码以及vm代码混淆 */
turn = vmp_turn = 1;
/* 用字符串symbol函数调用来计算结果. 使用频率为 1/4 */
var use_symbol_rate = 4;
/* 新增的花指令函数名称 */
var junk_func_name = [];
/* 替换运算的概率 1/2 */
var junk_code_rate = 2;
/* 不添加花指令函数的概率 */
var not_new_junk_rate = 2;
/* vm方法复制几倍 */
var vm_copy_count = 1;

/* 是否让字符串字节码 + 66 */
var string_code = true;
// string_code = false;

/* 回填模式 */
var mode = {
    backfill_identifier: "PUSH_MOV_identifier",
    backfill_break: "BREAK",
    backfill_continue: "CONTINUE",
    backfill_member_expression: "GET_SET_OBJ",
    continue_position: "插眼",
    backfill_CONSTANT: "CONSTANT",
    backfill_IS_TRUE: "IS_TRUE",
}
/* 保存不同变量的作用域进行数字命名,不是修改js,再作用域下添加一个id对象. 使用ast直接对js重命名变量真的很卡 */
var identifier_binding_track = [];

/* PASS的opcode 直接删了否则占用性能 */
function delete_opcode(opcode, mode) {
    var index;
    while (true) {
        index = opcode.indexOf(mode);
        if (index !== -1) {
            opcode.splice(index, 1);
        } else break;
    }
    return opcode;
}

/* 适用于回填单个指令的方法 */
function backfill_opcode(opcode, mode, replace_code) {
    var index;
    while (true) {
        index = opcode.indexOf(mode);
        if (index !== -1) {
            opcode[index] = replace_code;
        } else break;
    }
    return opcode;
}

/* 回填break */
function backfill_break(opcode) {
    var index;
    var len;
    while (true) {
        index = opcode.indexOf(mode.backfill_break);
        if (index !== -1) {
            opcode[index] = OPCODE.BREAK;
            len = opcode.length - index - 2;
            opcode[index + 1] = len;
        } else break;
    }
    return opcode;
}

/* for 循环 continue */
function backfill_continue_for(opcode) {
    var index;
    var len;
    var continue_postion = opcode.indexOf(mode.continue_position);
    if (continue_postion === -1) {
        return opcode;
    }
    while (true) {
        index = opcode.indexOf(mode.backfill_continue);
        if (index !== -1) {
            opcode[index] = OPCODE.CONTINUE;
            len = continue_postion - index - 2;
            opcode[index + 1] = (-len);
        } else break;
    }
    opcode.splice(continue_postion, 1);
    return opcode;
}

/* 回填continue */
function backfill_continue(opcode) {
    var index;
    var len;
    while (true) {
        index = opcode.indexOf(mode.backfill_continue);
        if (index !== -1) {
            opcode[index] = OPCODE.CONTINUE;
            len = index + 2;
            opcode[index + 1] = len;
        } else break;
    }
    return opcode;
}

/* 字符串转数字数组 */
function strToNumArr(str) {
    return str.split("").map((str) => {
        if (string_code) return str.charCodeAt() + 66;
        else return str.charCodeAt();
    });
}

/* 字符串转字节码数组 */
function strToOpcode(str) {
    var opcode = [];
    opcode.push(OPCODE.PUSH_STR);
    var str_opcode = strToNumArr(str);
    opcode.push(str_opcode.length << 6);
    opcode = opcode.concat(str_opcode);
    return opcode;
}

/* push update_stack 指令. */
function push_update_stack(opcode, node) {
    if ("VariableDeclarator|ConditionalExpression|WhileStatement" +
        "LogicalExpression|BinaryExpression|IfStatement" +
        "|UnaryExpression|CallExpression|ReturnStatement|AssignmentExpression".indexOf(node.parentPath.type) !== -1) {
        opcode.push(OPCODE.UPDATE_STACK);
    }
    return opcode;
}

/* 遍历节点 转成字节码 */
function generate(node) {
    var opcode = [];
    switch (node.type) {
        case "DebuggerStatement":
            opcode.push(OPCODE.DEBUG);
            break
        case "NullLiteral":
            opcode.push(OPCODE.PUSH_NULL);
            break
        case "BooleanLiteral":
            switch (node.node.value) {
                case true:
                    opcode.push(OPCODE.TRUE);
                    break
                case false:
                    opcode.push(OPCODE.FALSE);
                    break
            }
            break
        case "ExpressionStatement":
            opcode = generate(node.get("expression"));
            break
        case "VariableDeclaration":
            for (var i = 0; i < node.node.declarations.length; i++) opcode = opcode.concat(generate(node.get("declarations")[i]));
            break
        case "VariableDeclarator":
            /* 赋值主要是要从变量池里拿到对象直接进行操作,不同于把值或者对象push到堆栈里 */
            opcode = opcode.concat(delete_opcode(generate(node.get("id")), mode.backfill_identifier));
            // opcode = backfill_opcode(opcode, mode.backfill_identifier, OPCODE.MOV_VAR);
            if (!node.node.init) {
                /*没有init push null*/
                opcode.push(OPCODE.PUSH_UNDEFINED);
            } else {
                opcode = opcode.concat(generate(node.get("init")));
            }
            opcode = backfill_opcode(opcode, mode.backfill_identifier, OPCODE.PUSH_VAR);
            opcode.push(OPCODE.MOV_VAR);
            opcode.push(OPCODE.DECREMENT_STACK);
            break
        case "NumericLiteral":
            opcode.push(OPCODE.PUSH_NUM);
            opcode.push(node.node.value);
            break
        case "StringLiteral":
            opcode = strToOpcode(node.node.value);
            break
        case "ObjectExpression":
            /* 主要逻辑写在 ObjectProperty 即可 */
            var len = node.node.properties.length;
            for (var i = len - 1; i > -1; i--) {
                opcode = opcode.concat(generate(node.get("properties")[i]));
            }
            opcode.push(OPCODE.NEW_OBJECT);
            opcode.push(len);
            break
        case "ObjectProperty":
            /* 要不就直接提取var b = {"a":"c"} 他的key, b["a"] = "c"; 酱紫容易写 他妈的 , 不写逻辑了 */
            var key_opcode = generate(node.get("key"));
            key_opcode = delete_opcode(key_opcode, mode.backfill_identifier);
            var value_opcode = generate(node.get("value"));
            opcode = opcode.concat(key_opcode);
            opcode = opcode.concat(value_opcode);
            break
        case "BlockStatement":
            var len = node.node.body.length;
            for (var i = 0; i < len; i++) {
                opcode = opcode.concat(generate(node.get("body")[i]));
            }
            break
        case "ReturnStatement":
            var ret_opcode = generate(node.get("argument"));
            if (!!ret_opcode) {
                opcode = opcode.concat(ret_opcode);
            } else {
                opcode.push(OPCODE.PUSH_NULL);
            }
            opcode.push(OPCODE.RETURN);
            break
        case "IfStatement":
            var test_opcode = generate(node.get("test"));
            opcode = opcode.concat(test_opcode);
            opcode.push(OPCODE.IS_TRUE);
            var csq_opcode = generate(node.get("consequent"));
            if (!!node.node.alternate) {
                opcode.push(csq_opcode.length + 2);
                opcode = opcode.concat(csq_opcode);
                /*有 else if 时, 需要在consequent里接着push 一个跳出这个if指令*/
                opcode.push(OPCODE.SKIP_BLOCK);
                var alternate_opcode = generate(node.get("alternate"));
                opcode.push(alternate_opcode.length);
                opcode = opcode.concat(alternate_opcode);

            } else {
                opcode.push(csq_opcode.length);
                opcode = opcode.concat(csq_opcode);
            }
            break
        case "UnaryExpression":
            var operator = node.node.operator;
            if (operator === "delete") {
                // opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_member_expression, OPCODE.PASS));
                opcode = opcode.concat(delete_opcode(generate(node.get("argument")), mode.backfill_member_expression));
                opcode.push(OPCODE.DELETE)
            } else {
                // opcode = opcode.concat(strToOpcode(node.node.operator));
                opcode = opcode.concat(generate(node.get("argument")));
                // opcode.push(OPCODE.SINGLE_COMPUTE);
                opcode.push(OPCODE1[operator]);
            }

            break
        case "ThrowStatement":
            opcode = opcode.concat(generate(node.get("argument")));
            opcode.push(OPCODE.THROW);
            break
        case "TryStatement":
            opcode.push(OPCODE.TRY);
            var block_opcode = generate(node.get("block"));
            opcode.push(block_opcode.length);
            var handler_opcode = generate(node.get("handler"));
            if (!handler_opcode) {
                handler_opcode = [];
            }
            opcode = opcode.concat(block_opcode);
            opcode.push(OPCODE.SKIP_BLOCK);
            opcode.push(handler_opcode.length);
            opcode = opcode.concat(handler_opcode);
            var finalizer_opcode = [];
            if (!!node.node.finalizer) {
                finalizer_opcode = generate(node.get("finalizer"));
                opcode.push(OPCODE.FINALLY);
                opcode.push(finalizer_opcode.length);
                opcode = opcode.concat(finalizer_opcode);
            }
            break
        case "CatchClause":
            /* catch(e){}  */
            var param_opcode = generate(node.get("param"))
            var block_opcode = generate(node.get("body"));
            // opcode.push(OPCODE.CATCH);
            // opcode.push(param_opcode.length + block_opcode.length);
            /* push e参数 */
            var p_opcode = []
            // p_opcode = p_opcode.concat(backfill_opcode(param_opcode, mode.backfill_identifier, OPCODE.PASS));
            p_opcode = p_opcode.concat(delete_opcode(param_opcode, mode.backfill_identifier));
            opcode.push(p_opcode.length);
            opcode = opcode.concat(p_opcode);
            opcode.push(block_opcode.length + 1);
            opcode.push(OPCODE.MOV_VAR);
            opcode = opcode.concat(block_opcode);
            break

        /* es6 语法 new a(...arg) */
        // case "SpreadElement":
        //     break

        /*比较麻烦的节点*/
        case "Identifier":
            /* 在window下的对象,或者是 MemberExpression.property 也就是 a[b] 这个b的key, 我们就需要把参数名称push到堆栈里 */
            /* 都不是的则直接命名带上id */
            var name = node.node.name;
            if (name === "arguments") {
                // opcode = opcode.concat(strToOpcode(name));
                opcode = opcode.concat(strToOpcode("$5"));
                opcode.push(OPCODE.PUSH_CONSTANT);
                opcode.push(mode.backfill_identifier);
                break
            }
            var biding;
            var index;
            if (node.parentPath.type === "FunctionDeclaration" && node.parentPath.get("id") === node) {
                biding = node.parentPath.parentPath.scope.getBinding(name);
            } else {
                biding = node.scope.getBinding(name);
            }
            index = identifier_binding_track.indexOf(biding);
            var reNameId;
            if (!!biding && index !== -1) {
                reNameId = identifier_binding_track[index].reNameId;
                opcode.push(OPCODE.PUSH_NUM);
                opcode.push(reNameId);
                opcode.push(mode.backfill_CONSTANT);
                opcode.push(mode.backfill_identifier);
            }
            if (window.hasOwnProperty(name) && !biding) {
                opcode = opcode.concat(strToOpcode(name));
                /* push this 或者 vm_constant 交由上层回填 */
                opcode.push(mode.backfill_CONSTANT);
                // opcode.push(OPCODE.PUSH_WINDOW);
                opcode.push(mode.backfill_identifier);
                break
            } else if (node.parentPath.type === "MemberExpression" && node.parentPath.get("property") === node) {
                /* 又得分情况 a.b a[b] 是完全不一样的！！！ */
                if (!!biding && index !== -1) {
                    opcode = []; // 清除前面生成的代码
                }
                if (node.parentPath.node.computed) {
                    if (!!biding) {
                        if (index === -1) {
                            reNameId = identifier_binding_track.length + 100;
                            biding.reNameId = reNameId;
                            biding.oldName = name;
                            identifier_binding_track.push(biding);
                        } else {
                            reNameId = identifier_binding_track[index].reNameId;
                        }
                        opcode.push(OPCODE.PUSH_NUM);
                        opcode.push(reNameId);
                        opcode.push(mode.backfill_CONSTANT);
                        opcode.push(mode.backfill_identifier);
                    } else {
                        /* 直接存到this里 */
                        opcode = opcode.concat(strToOpcode(name));
                        opcode.push(OPCODE.PUSH_WINDOW);
                        opcode.push(mode.backfill_identifier);
                    }
                } else {
                    opcode = opcode.concat(strToOpcode(name));
                    opcode.push(mode.backfill_identifier);
                }

            } else {
                if (!!biding && index !== -1) {
                    break;
                }
                /* 走到这里就是普通对象 */
                if (!!biding) {
                    if (index === -1) {
                        reNameId = identifier_binding_track.length + 100;
                        biding.reNameId = reNameId;
                        biding.oldName = name;
                        identifier_binding_track.push(biding);
                    } else {
                        reNameId = identifier_binding_track[index].reNameId;
                    }
                    opcode.push(OPCODE.PUSH_NUM);
                    opcode.push(reNameId);
                    opcode.push(mode.backfill_CONSTANT);
                    opcode.push(mode.backfill_identifier);
                } else {
                    /* 直接存到this里 */
                    opcode = opcode.concat(strToOpcode(name));
                    opcode.push(OPCODE.PUSH_WINDOW);
                    opcode.push(mode.backfill_identifier);
                }
            }
            break
        case "ArrayExpression":
            var len = node.node.elements.length;
            for (var i = 0; i < len; i++) {
                opcode = opcode.concat(generate(node.get("elements")[i]));
            }
            opcode.push(OPCODE.NEW_ARRAY);
            opcode.push(len);
            break
        case "AssignmentExpression":
            /*  主要照顾下左边的赋值对象 */
            // var str_opcode = strToOpcode(node.node.operator);
            var operator = node.node.operator;
            var right_opcode = generate(node.get("right"));
            var left_opcode = generate(node.get("left"));
            if (node.get("right").type == "AssignmentExpression") {
                opcode = opcode.concat(right_opcode);
                opcode.push(OPCODE.DECREMENT_STACK);
                switch (node.get("left").type) {
                    case "Identifier":
                        /* 要用常量池里的对象去接收值呢 */
                        // opcode = opcode.concat(backfill_opcode(left_opcode, mode.backfill_identifier, OPCODE.PASS));
                        opcode = opcode.concat(delete_opcode(left_opcode, mode.backfill_identifier));
                        break
                    case "MemberExpression":
                        opcode = opcode.concat(left_opcode);
                        /* 遍历MemberExpression 节点, 会获取到值, 把最后GET_OBJ指令替换成SET_OBJ即可*/
                        // opcode[opcode.lastIndexOf(mode.backfill_member_expression)] = OPCODE.PASS;
                        opcode.splice(opcode.lastIndexOf(mode.backfill_member_expression), 1);
                        /* 其余的都直接替换成 GET_OBJ,其实这里可以不写这个代码,运行到最后会自动补全get obj 指令 */
                        opcode = backfill_opcode(opcode, mode.backfill_member_expression, OPCODE.GET_OBJ);
                        break
                    default:
                        debugger;
                }
                opcode = opcode.concat(generate(node.get("right").get("left")));
            } else {
                switch (node.get("left").type) {
                    case "Identifier":
                        /* 要用常量池里的对象去接收值呢 */
                        // opcode = opcode.concat(backfill_opcode(generate(node.get("left")), mode.backfill_identifier, OPCODE.PASS));
                        opcode = opcode.concat(delete_opcode(generate(node.get("left")), mode.backfill_identifier));
                        break
                    case "MemberExpression":
                        opcode = opcode.concat(left_opcode);
                        /* 遍历MemberExpression 节点, 会获取到值, 把最后GET_OBJ指令替换成SET_OBJ即可*/
                        // opcode[opcode.lastIndexOf(mode.backfill_member_expression)] = OPCODE.PASS;
                        opcode.splice(opcode.lastIndexOf(mode.backfill_member_expression), 1);
                        /* 其余的都直接替换成 GET_OBJ,其实这里可以不写这个代码,运行到最后会自动补全get obj 指令 */
                        opcode = backfill_opcode(opcode, mode.backfill_member_expression, OPCODE.GET_OBJ);
                        break
                    default:
                        debugger;
                }
                if (node.node.operator !== "=") {
                    // console.log("AssignmentExpression 符号 => ", node.node.operator);
                    if (chance(use_symbol_rate)) {
                        opcode = opcode.concat(strToOpcode(operator));
                        opcode = opcode.concat(left_opcode);
                        opcode = opcode.concat(right_opcode);
                        opcode.push(OPCODE.COMPUTE);
                    } else {
                        opcode = opcode.concat(left_opcode);
                        opcode = opcode.concat(right_opcode);
                        opcode.push(OPCODE[operator]);
                    }

                } else {
                    opcode = opcode.concat(right_opcode);
                }
            }
            switch (node.get("left").type) {
                case "Identifier":
                    /* 要用常量池里的对象去接收值呢 */
                    opcode.push(OPCODE.MOV_VAR);
                    break
                case "MemberExpression":
                    opcode.push(OPCODE.SET_OBJ);
                    break
                default:
                    debugger;
            }

            /* if ((a = 1)) 这种的 怪恶心的 , 怎么判断是否会用到这个值
            *  */
            // opcode = push_update_stack(opcode, node);
            if ("ExpressionStatement|".indexOf(node.parentPath.type) > 0) {
                opcode.push(OPCODE.DECREMENT_STACK);
            }
            break
        case "BinaryExpression":
            var operator = node.node.operator;
            // opcode = opcode.concat(strToOpcode(node.node.operator));
            var left_opcode = generate(node.get("left"));
            var right_opcode = generate(node.get("right"));
            if (chance(use_symbol_rate)) {
                opcode = opcode.concat(strToOpcode(operator));
                opcode = opcode.concat(left_opcode);
                opcode = opcode.concat(right_opcode);
                opcode.push(OPCODE.COMPUTE);
            } else {
                if (!(operator in OPCODE)) throw "该计算符未录入 => " + operator;
                opcode = opcode.concat(left_opcode);
                opcode = opcode.concat(right_opcode);
                opcode.push(OPCODE[operator])
            }
            break
        case "UpdateExpression":
            var str_opcode = strToOpcode(node.node.operator);
            // var argument_opcode = generate(node.get("argument"));
            if (node.node.prefix) {
                /* ++a */
                if (type.isIdentifier(node.node.argument)) {
                    /* 直接 push 参数名 */
                    // opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_identifier, OPCODE.PASS));
                    opcode = opcode.concat(delete_opcode(generate(node.get("argument")), mode.backfill_identifier));
                    opcode = opcode.concat(str_opcode);
                    opcode.push(OPCODE.UPDATE);

                } else if (type.isMemberExpression(node.node.argument)) {
                    // opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_member_expression, OPCODE.PASS));
                    opcode = opcode.concat(delete_opcode(generate(node.get("argument")), mode.backfill_member_expression));
                    opcode = opcode.concat(str_opcode);
                    opcode.push(OPCODE.UPDATE);
                } else {
                    debugger;
                    console.log("UpdateExpression  argument 非正常节点 =>");
                }
                /*上面已经把值++完了,下面把值push到堆栈里用 */
                opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_identifier, OPCODE.PUSH_VAR));
            } else {
                /* a++ */
                opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_identifier, OPCODE.PUSH_VAR));
                if (type.isIdentifier(node.node.argument)) {
                    /* 先把值push到堆栈里给他们用,然后++ */
                    // opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_identifier, OPCODE.PASS));
                    opcode = opcode.concat(delete_opcode(generate(node.get("argument")), mode.backfill_identifier));
                    opcode = opcode.concat(str_opcode);
                    opcode.push(OPCODE.UPDATE);
                } else if (type.isMemberExpression(node.node.argument)) {
                    // opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_member_expression, OPCODE.PASS));
                    opcode = opcode.concat(delete_opcode(generate(node.get("argument")), mode.backfill_member_expression));
                    opcode = opcode.concat(str_opcode);
                    opcode.push(OPCODE.UPDATE);
                } else {
                    debugger;
                    console.log("UpdateExpression  argument 非正常节点 =>");
                }
            }
            break
        case "MemberExpression":
            /* push key , push 对象, push GET_OBJ */
            /* object 可能是MemberExpression 直接遍历就行 */
            var object_opcode = generate(node.get("object"));
            var property_opcode = generate(node.get("property"));
            object_opcode = backfill_opcode(object_opcode, mode.backfill_identifier, OPCODE.PUSH_VAR);
            /* 只push一个key */
            if (node.node.computed) {
                property_opcode = backfill_opcode(property_opcode, mode.backfill_identifier, OPCODE.PUSH_VAR);
            } else {

                // property_opcode = backfill_opcode(property_opcode, mode.backfill_identifier, OPCODE.PASS);
                // property_opcode = backfill_opcode(property_opcode, mode.backfill_CONSTANT, OPCODE.PASS);

                property_opcode = delete_opcode(property_opcode, mode.backfill_identifier);
                property_opcode = delete_opcode(property_opcode, mode.backfill_CONSTANT);
            }
            // opcode = opcode.concat(object_opcode);
            opcode = opcode.concat(property_opcode);
            opcode = opcode.concat(object_opcode);
            /* push get 还是 set */
            opcode.push(mode.backfill_member_expression);
            break
        case "CallExpression":
            var len = node.node.arguments.length;
            for (var i = 0; i < len; i++) {
                opcode = opcode.concat(generate(node.get("arguments")[i]));
            }
            opcode.push(OPCODE.NEW_ARRAY);
            opcode.push(len);
            var callee_opcode = generate(node.get("callee"));
            opcode = opcode.concat(backfill_opcode(callee_opcode, mode.backfill_member_expression, OPCODE.GET_OBJ));
            switch (node.get("callee").type) {
                case "MemberExpression":
                    /* 这里还需要把调用者push到堆栈里,这里直接让堆栈索引+1 解决掉重复获取调用者造成性能损失 */
                    // opcode = opcode.concat(generate(node.get("callee").get("object")));
                    opcode.push(OPCODE.UPDATE_STACK);
                    break
                case "AssignmentExpression":
                    /* 赋值完以后堆栈++ 就得到了方法, 然后push调用者 */
                    opcode.push(OPCODE.PUSH_THIS);
                    /**
                     * 这里巨傻逼,判断是否赋值语句完,把e push 到堆栈里
                     * (e = function () {
                     * return r;
                     * })();
                     */
                    break
                default:
                    opcode.push(OPCODE.PUSH_NULL);
                // console.log("CallExpression 这里不知道要不要管 =>", node.get("callee").type)
                // debugger;
            }
            opcode.push(OPCODE.APPLY);
            if ("ExpressionStatement".indexOf(node.parentPath.type) > 0) {
                opcode.push(OPCODE.DECREMENT_STACK);
            }
            break
        case "FunctionDeclaration":
            /* 第一步先把传参push到堆栈里组成数组 */
            if (type.isIdentifier(node.node.id)) {
                /* 加入到变量池里 */
                // opcode = opcode.concat(backfill_opcode(generate(node.get("id")), mode.backfill_identifier, OPCODE.PASS));
                opcode = opcode.concat(delete_opcode(generate(node.get("id")), mode.backfill_identifier, OPCODE.PASS));
            } else {
                debugger;
            }

            var len = node.node.params.length;
            var paramopcode = [];
            for (var i = 0; i < len; i++) {
                switch (node.get("params")[i].type) {
                    case "Identifier":
                        paramopcode = paramopcode.concat(generate(node.get("params")[i]));
                        break
                    default:
                        console.log("FunctionDeclaration 的 params 有非Identifier节点, 非要这样写代码吗? ");
                        debugger;
                }
            }
            // paramopcode = backfill_opcode(paramopcode, mode.backfill_identifier, OPCODE.PASS);
            // paramopcode = backfill_opcode(paramopcode, mode.backfill_CONSTANT, OPCODE.PASS);
            paramopcode = delete_opcode(paramopcode, mode.backfill_identifier);
            paramopcode = delete_opcode(paramopcode, mode.backfill_CONSTANT);
            /* 把参数组成一个数组并push到堆栈里 */
            paramopcode.push(OPCODE.NEW_ARRAY);
            paramopcode.push(len);
            opcode = opcode.concat(paramopcode);
            /* 先将new function 字节码push到 opcode中去 */
            opcode.push(OPCODE.NEW_FUNC);
            var blockSta_opcode = generate(node.get("body"));
            opcode.push(blockSta_opcode.length);
            opcode = opcode.concat(blockSta_opcode);
            opcode.push(OPCODE.MOV_VAR);
            // debugger;

            break
        case "FunctionExpression":
            /* 第一步先把传参push到堆栈里组成数组 */
            if (!!node.node.id) {
                if (type.isIdentifier(node.node.id)) {
                    /* 加入到变量池里 */
                    // opcode = opcode.concat(backfill_opcode(generate(node.get("id")), mode.backfill_identifier, OPCODE.PASS));
                    opcode = opcode.concat(delete_opcode(generate(node.get("id")), mode.backfill_identifier));
                    // 这里感觉要判断一下最好
                    // opcode.push(OPCODE.UPDATE_STACK);
                } else {
                    debugger;
                }
            }
            var len = node.node.params.length;
            var paramopcode = [];
            for (var i = 0; i < len; i++) {
                switch (node.get("params")[i].type) {
                    case "Identifier":
                        paramopcode = paramopcode.concat(generate(node.get("params")[i]));
                        break
                    default:
                        console.log("FunctionDeclaration 的 params 有非Identifier节点, 非要这样写代码吗? ");
                        debugger;
                }
            }
            // paramopcode = backfill_opcode(paramopcode, mode.backfill_identifier, OPCODE.PASS);
            // paramopcode = backfill_opcode(paramopcode, mode.backfill_CONSTANT, OPCODE.PASS);
            paramopcode = delete_opcode(paramopcode, mode.backfill_identifier);
            paramopcode = delete_opcode(paramopcode, mode.backfill_CONSTANT);
            /* 把参数组成一个数组并push到堆栈里 */
            paramopcode.push(OPCODE.NEW_ARRAY);
            paramopcode.push(len);
            opcode = opcode.concat(paramopcode);
            /* 先将new function 字节码push到 opcode中去 */
            opcode.push(OPCODE.NEW_FUNC);
            var blockSta_opcode = generate(node.get("body"));
            opcode.push(blockSta_opcode.length);
            opcode = opcode.concat(blockSta_opcode);
            if (!!node.node.id) {
                if (type.isIdentifier(node.node.id)) {
                    opcode.push(OPCODE.MOV_VAR);
                }
            }
            break
        case "ForStatement":
            // for循环
            var all_block_opcode = [];
            // 这里是初始化赋值其实是可以单独拿出去的,因为他只运行一次呢~
            var init_opcode = generate(node.get("init"));
            if (!!init_opcode) {
                opcode = opcode.concat(init_opcode);
            }
            // 判断
            var test_opcode = generate(node.get("test"));
            if (!!test_opcode) {
                opcode = opcode.concat(test_opcode);
                opcode.push(OPCODE.IS_TRUE);
            } else {
                opcode.push(OPCODE.TRUE);
                opcode.push(OPCODE.IS_TRUE);
            }

            var block_opcode = generate(node.get("body"));
            all_block_opcode = all_block_opcode.concat(block_opcode);
            var update_opcode = generate(node.get("update"));
            /* continue 要跳到update这里啊 */
            all_block_opcode.push(mode.continue_position);
            if (!!update_opcode) {
                all_block_opcode = all_block_opcode.concat(update_opcode);
            } else {
                all_block_opcode.push(OPCODE.PASS);
                // all_block_opcode.push(OPCODE.PASS);
            }
            all_block_opcode = backfill_continue_for(all_block_opcode);
            if (!!test_opcode) {
                all_block_opcode = all_block_opcode.concat(test_opcode);
                all_block_opcode.push(OPCODE.IS_TRUE);
                // 这里的2是后面只有2条指令了,一个是得到goto指令,一个是回滚多少个opcode的长度
                all_block_opcode.push(2);
            } else {
                all_block_opcode.push(OPCODE.TRUE);
                all_block_opcode.push(OPCODE.IS_TRUE);
                all_block_opcode.push(2);
            }

            // 这个时候true,就要运行goto,跳到block继续运行
            all_block_opcode.push(OPCODE.GOTO);
            all_block_opcode.push(all_block_opcode.length);
            // 到这里才确定,如果第一次判断失败,需要跳过多少条指令
            opcode.push(all_block_opcode.length);
            opcode = opcode.concat(all_block_opcode);
            opcode = backfill_break(opcode);
            break
        case "ForInStatement":
            /*
            for(var a in b) {} 直接用AST改写成For循环即可,不想写.
            转不了了 , 开写
            */
            var left_opcode;
            var right_opcode = generate(node.get("right"));
            switch (node.get("left").type) {
                case "VariableDeclaration":
                    // left_opcode = backfill_opcode(generate(node.get("left").get("declarations")[0].get("id")), mode.backfill_identifier,
                    //     OPCODE.PASS);
                    left_opcode = delete_opcode(generate(node.get("left").get("declarations")[0].get("id")), mode.backfill_identifier);
                    break
                case "Identifier":
                    // left_opcode = backfill_opcode(generate(node.get("left")), mode.backfill_identifier,
                    //     OPCODE.PASS);
                    left_opcode = delete_opcode(generate(node.get("left")), mode.backfill_identifier);
                    break
                case "MemberExpression":
                    // left_opcode = backfill_opcode(generate(node.get("left")), mode.backfill_member_expression,
                    //     OPCODE.PASS);
                    left_opcode = delete_opcode(generate(node.get("left")), mode.backfill_member_expression);
                    break
            }

            opcode = opcode.concat(left_opcode);
            opcode = opcode.concat(right_opcode);
            opcode.push(OPCODE.FORIN);
            var block_opcode = generate(node.get("body"));
            opcode.push(block_opcode.length + 3);

            switch (node.get("left").type) {
                case "VariableDeclaration":
                case "Identifier":
                    opcode.push(OPCODE.MOV_VAR);
                    break
                case "MemberExpression":
                    opcode.push(OPCODE.SET_OBJ);
                    break
            }
            opcode = opcode.concat(block_opcode);
            opcode.push(mode.backfill_continue);
            opcode.push("占个字节数");
            opcode = backfill_break(opcode);
            opcode = backfill_continue(opcode);
            break
        case "NewExpression":
            var callee_opcode = generate(node.get("callee"));
            opcode = opcode.concat(callee_opcode);
            var len = node.node.arguments.length;
            for (var i = 0; i < len; i++) {
                opcode = opcode.concat(generate(node.get("arguments")[i]));
            }
            opcode.push(OPCODE.NEW_ARRAY);
            opcode.push(len);
            opcode.push(OPCODE.NEW_CONSTRUCT);
            break
        case "ThisExpression":
            opcode.push(OPCODE.PUSH_THIS);
            break
        case "WhileStatement":
            var while_opcode = [];
            var test_opcode = generate(node.get("test"));
            var blockSta_opcode = generate(node.get("body"));
            while_opcode = while_opcode.concat(test_opcode);
            while_opcode.push(OPCODE.IS_TRUE);
            /* +2 是还有2个指令 GOTO 和 while_opcode指令的长度 */
            while_opcode.push(blockSta_opcode.length + 2);
            while_opcode = while_opcode.concat(blockSta_opcode);
            while_opcode.push(OPCODE.GOTO);
            opcode = opcode.concat(while_opcode);
            opcode.push(while_opcode.length);
            opcode = backfill_break(opcode);
            opcode = backfill_continue(opcode);
            break
        case "BreakStatement":
            /* 有好几种可以break => for switch while  */
            /* 思路一: while for 都有一个test节点, 运行完判断test结果, 如果真的话, 就往一个数组里push一个索引.
            这样如果要跳出循环,就可以到这个位置,并直接给他一个false 结束. 容易有bug. */
            /* 思路二: 获取后面要跳过的字节码长度,需要回填,这个是最好的. */
            // opcode.push(OPCODE.BREAK);
            opcode.push(mode.backfill_break);
            opcode.push("占个字节数");
            break
        case "ContinueStatement":
            // opcode.push(OPCODE.CONTINUE);
            opcode.push(mode.backfill_continue);
            opcode.push("占个字节数");

            break
        case "SwitchStatement":
            /* 恶心节点之1, 确实如果break不去找到要跳过的索引,这个就很难做 */
            var SwitchCaseopcode;
            var discriminant_opcode = generate(node.get("discriminant"));
            var len = node.node.cases.length;
            for (var i = 0; i < len; i++) {
                opcode = opcode.concat(discriminant_opcode);
                SwitchCaseopcode = generate(node.get("cases")[i]);
                if (len > (i + 1)) {
                    var index = SwitchCaseopcode.indexOf(mode.backfill_IS_TRUE);
                    SwitchCaseopcode[index] = SwitchCaseopcode.length - index + 1;
                    /* 这里的skip是因为可能要执行下一个case */
                    SwitchCaseopcode.push(OPCODE.SKIP_BLOCK);
                    /* compute is_true */
                    var test_opcode = generate(node.get("cases")[i + 1].get("test"));
                    if (!test_opcode) {
                        /* default */
                        test_opcode = discriminant_opcode;
                    }
                    /* 3是 COMPUTE  IS_TRUE backfill_IS_TRUE */
                    SwitchCaseopcode.push(test_opcode.length + discriminant_opcode.length + 3);

                } else {
                    /* 最后一个 */
                    var index = SwitchCaseopcode.indexOf(mode.backfill_IS_TRUE);
                    SwitchCaseopcode[index] = SwitchCaseopcode.length;
                }
                opcode = opcode.concat(SwitchCaseopcode);
            }
            opcode = backfill_break(opcode);
            break
        case "SwitchCase":
            var test_opcode = generate(node.get("test"));
            var consequent_opcode = [];
            if (!!test_opcode) {
                opcode = opcode.concat(test_opcode);
            } else {
                opcode = opcode.concat(generate(node.parentPath.get("discriminant")));
            }
            // opcode.push(OPCODE.COMPUTE);
            opcode.push(OPCODE["=="]);
            opcode.push(OPCODE.IS_TRUE);
            opcode.push(mode.backfill_IS_TRUE);
            var len = node.node.consequent.length;
            for (var i = 0; i < len; i++) {
                consequent_opcode = consequent_opcode.concat(generate(node.get("consequent")[i]));
            }
            // opcode.push(consequent_opcode.length + 2);
            opcode = opcode.concat(consequent_opcode);
            break
        case "SequenceExpression":
            for (var i = 0; i < node.node.expressions.length; i++) {
                opcode = opcode.concat(generate(node.get("expressions")[i]));
            }
            break
        case "DoWhileStatement":
            var blockSta_opcode = generate(node.get("body"));
            opcode = opcode.concat(blockSta_opcode);
            var test_opcode = generate(node.get("test"));

            opcode = opcode.concat(test_opcode);
            opcode.push(OPCODE.GOTO);
            opcode.push(test_opcode.length + blockSta_opcode.length + 1);
            /* 回填continue */
            var index = opcode.indexOf(mode.backfill_continue);
            while (index !== -1) {
                var len = opcode.length - test_opcode.length - index - 4;
                opcode[index] = OPCODE.CONTINUE;
                opcode[index + 1] = -len;
                index = opcode.indexOf(mode.backfill_continue);
            }
            opcode = backfill_break(opcode);
            break
        case "RegExpLiteral":
            /**
             * var patt = /runoob/i => new RegExp("runoob","i"); 用AST直接转得了
             */
            break
        case "ConditionalExpression":
            var test_opcode = generate(node.get("test"));
            var csq_opcode = generate(node.get("consequent"));
            var alternate_opcode = generate(node.get("alternate"));
            opcode = opcode.concat(test_opcode);
            opcode.push(OPCODE.IS_TRUE);
            opcode.push(csq_opcode.length + 2);
            opcode = opcode.concat(csq_opcode);
            opcode.push(OPCODE.SKIP_BLOCK);
            opcode.push(alternate_opcode.length);
            opcode = opcode.concat(alternate_opcode);
            // opcode = push_update_stack(opcode, node);
            break
        case "LogicalExpression":
            /* symbol */
            var left_opcode = generate(node.get("left"));
            var right_opcode = generate(node.get("right"));
            opcode = opcode.concat(left_opcode);
            opcode.push(OPCODE.IS_TRUE);
            /* 我真的是判断一大堆,判断nmb的 不判断了, 爱用不用,不用也给我在堆栈里趴着 cnm的 */
            // var parent_type = "" +
            //     "ArrayExpression|ForInStatement|NewExpression|ForStatement|LogicalExpression|AssignmentExpression|ConditionalExpression|VariableDeclarator" +
            //     "|ObjectProperty|UnaryExpression|BinaryExpression|IfStatement|" +
            //     "ReturnStatement|CallExpression|MemberExpression";
            var parent_type = "";
            switch (node.node.operator) {
                case "&&":
                    /* var target = 1 && 2 */
                    if (parent_type.indexOf(node.parentPath.type) === -1) {
                        opcode.push(right_opcode.length + 2);
                        opcode = opcode.concat(right_opcode);
                        opcode.push(OPCODE.SKIP_BLOCK);
                        opcode.push(1);
                        /* 如果为真,则继续往下走,然后这次的值或者对象就不放入变量池中,为假则让堆栈索引+1 */
                        opcode.push(OPCODE.UPDATE_STACK);
                    } else {
                        opcode.push(right_opcode.length);
                        opcode = opcode.concat(right_opcode);
                    }
                    break
                case "||":
                    if (parent_type.indexOf(node.parentPath.type) === -1) {
                        opcode.push(2);
                        opcode.push(OPCODE.SKIP_BLOCK);
                        opcode.push(right_opcode.length + 2);
                        opcode = opcode.concat(right_opcode);
                        opcode.push(OPCODE.SKIP_BLOCK);
                        opcode.push(1);
                        opcode.push(OPCODE.UPDATE_STACK);
                    } else {
                        opcode.push(2);
                        opcode.push(OPCODE.SKIP_BLOCK);
                        opcode.push(right_opcode.length);
                        opcode = opcode.concat(right_opcode);
                    }

                    break
                default:
                    console.log("LogicalExpression 非 && || 符号 =>", node.node.left.operator)
            }
            break
        default:
            if (node.type == undefined) {
                return;
            }
            console.log("type =>", node.type, " , code =>", node + '');
            debugger
            break
    }
    /* 默认回填push Identifier节点 */
    if (node.type !== "Identifier" && opcode.indexOf(mode.backfill_identifier) !== -1) {
        opcode = backfill_opcode(opcode, mode.backfill_identifier, OPCODE.PUSH_VAR);
    }
    /* 默认回填 GET_OBJ */
    if (node.type !== "MemberExpression" && opcode.indexOf(mode.backfill_member_expression) !== -1) {
        opcode = backfill_opcode(opcode, mode.backfill_member_expression, OPCODE.GET_OBJ);
    }
    if (opcode.indexOf(undefined) !== -1) {
        debugger;
        console.log("生成的字节码有undefined => ", node + '')
    }
    return opcode;
}

/* function 预编译阶段需要把方法放到上面去 */
const function_unshift = {
    'BlockStatement|Program'(path) {
        var func_node = [];
        var not_func_node = [];
        for (var i = 0; i < path.node.body.length; i++) {
            if (path.get("body")[i].type === "FunctionDeclaration") {
                func_node.push(path.node.body[i]);
            } else {
                not_func_node.push(path.node.body[i]);
            }
        }
        func_node = func_node.concat(not_func_node);
        path.node.body = func_node;
    }
}
/* 删除无用代码  => ;  */
const remove_empty = {
    EmptyStatement(path) {
        path.remove();
    }
}
/* 提取console等属性,属于再window下的属性,单独push window来获取对象. 用this可能会出错. */
const get_object = {
    Identifier(path) {
        var name = path.node.name;
        if (!!Object.getOwnPropertyDescriptor(window, name) && obj.indexOf(name) === -1) {
            obj.push(name);
        }
    }
}
/* var a = { a : 1 } => var a = { "a" : 1 } */
const change_obj_key = {
    ObjectProperty(path) {
        if (path.get("key").type === "Identifier") {
            path.get("key").replaceWith(type.StringLiteral(path.node.key.name));
        }
    }
}
/* 给 for(;;) a = b; => for(;;) { a = b;} */
const add_block = {
    "ForInStatement|ForStatement|WhileStatement"(path) {
        if (path.get("body").type !== "BlockStatement") {
            path.get("body").replaceWith(type.blockStatement([path.node.body]));
            path.get("body").skip();
        }
    },
    IfStatement(path) {
        if (path.get("consequent").type !== "BlockStatement") {
            path.get("consequent").replaceWith(type.blockStatement([path.node.consequent]));
            path.get("consequent").skip();
        }
        var alternate_node = path.node.alternate;
        if (!!alternate_node && "IfStatement|BlockStatement".indexOf(path.get("alternate").type) === -1) {
            path.get("alternate").replaceWith(type.blockStatement([alternate_node]));
            path.get("alternate").skip();
        }
    }

}
/* var patt = /runoob/i; => new RegExp("runoob","i"); */
const change_pattern = {
    RegExpLiteral(path) {
        var exp = type.expressionStatement(type.newExpression(type.identifier("RegExp"), [type.stringLiteral(path.node.pattern),
            type.stringLiteral(path.node.flags)]));
        path.replaceWith(exp);
    }
}
/* forIn 循环 转 for循环, 用不了了舍弃舍弃~ */
const forIn_to_for = {
    ForInStatement(path) {
        var right_node = path.node.right;
        var block_node = path.node.body;
        var left_node = path.node.left;
        var init_node = [];
        init_node.push(type.variableDeclarator(type.identifier("zcj"),
            type.conditionalExpression(
                type.unaryExpression("!", right_node, true),
                type.arrayExpression([]),
                type.callExpression(
                    type.memberExpression(type.identifier("Object"), type.identifier("keys"), false)
                    , [right_node])
            )
        ));
        var block_body_node;

        if (path.get("left").type === "VariableDeclaration") {
            /* 把初始化都丢到for循环上面去*/
            block_body_node = type.expressionStatement(type.assignmentExpression("=", left_node.declarations[0].id,
                type.memberExpression(type.identifier("zcj"), type.identifier("zcj1"), true)
            ));
            init_node = init_node.concat(left_node.declarations);
        } else {
            block_body_node = type.expressionStatement(type.assignmentExpression("=", left_node,
                type.memberExpression(type.identifier("zcj"), type.identifier("zcj1"), true)
            ));
        }
        block_node.body.unshift(block_body_node);
        init_node.push(type.variableDeclarator(type.identifier("zcj1"), type.numericLiteral(0)))
        var new_for_node =
            type.forStatement(
                type.variableDeclaration("var", init_node)
                , type.binaryExpression("<", type.identifier("zcj1"),
                    type.memberExpression(type.identifier("zcj"), type.identifier("length"), false)),
                type.updateExpression("++", type.identifier("zcj1"), false)
                , block_node
            )
        path.replaceWith(new_for_node);
    }
}
/* 把大数字转成算数表达式 */
const num_to_express = {
    NumericLiteral(path) {
        var val = path.node.value
        if (val > 65535) {
            var ran1 = rnd(1000, 2000);
            var remainder = val % ran1;
            var multiple = (val - remainder) / ran1;
            var bin_node = type.binaryExpression("+", type.numericLiteral(remainder), type.binaryExpression("*", type.numericLiteral(ran1), type.numericLiteral(multiple)));
            path.replaceWith(bin_node);
        }
    }
}
/* 删除console.log */
const deleteConsole = {
    CallExpression(path) {
        if (path.get("callee").type === "MemberExpression" && path.get("callee").get("object").type === "Identifier" && path.node.callee.object.name === "console") {
            path.remove();
        }
    }
}
/* a.map(it => return 1;) => a.map(function(it){return 1});  https://babeljs.io/repl 把es6转es5 */
const arr_func_to_func = {
    ArrowFunctionExpression(path) {
        var body = path.node.body;
        if (path.get("body").type !== "BlockStatement" && path.get("body").type !== "ReturnStatement") {
            body = type.blockStatement([type.returnStatement(body)]);
        }
        path.replaceWith(type.functionExpression(null, path.node.params, body));
    }
}

/* var b,se = {};(b = se.aa = {'a':1,'c':'aaa','dd':{'ccc':'123'}}).dd.m = b.dd.ccc; =>
*                  (b = se.aa = {'a':1,'c':'aaa','dd':{'ccc':'123'}}),b.dd.m = b.dd.ccc;
* 可能会有问题,遇到语法还得添加判断
* 后来才知道, v8先从左边对象开始,再右边 */
const sequencing = {
    MemberExpression(path) {
        if ((!!(path.get("object").type === "AssignmentExpression"))) {
            console.log("sequencing => ", path + '')
            var assign_node = path.node.object, parent_path;
            parent_path = path.findParent(p => p.isAssignmentExpression());
            if (!parent_path) {
                // path.get("object").replaceWith(path.node.object.left);
                // path.replaceWith(type.sequenceExpression([assign_node, path.node]));
            } else {
                path.get("object").replaceWith(path.node.object.left);
                parent_path.replaceWith(type.sequenceExpression([assign_node, parent_path.node]));
            }

            // debugger;
        } else return;
    }
}
/* `<div class="mm" ${a}style="transform: rotateY(${10 + 10 * iw}deg);">` => 字符串拼接 */
const tempToStr = {
    TemplateLiteral(path) {
        var expressions = path.node.expressions;
        var quasis = path.node.quasis;
        if (quasis.length === 1) {
            path.replaceWith(type.stringLiteral(quasis[i].value.raw));
            path.skip();
        }
        var binaryExpression;
        binaryExpression = type.binaryExpression("+", type.stringLiteral(quasis[0].value.raw), expressions[0]);
        binaryExpression = type.binaryExpression("+", binaryExpression, type.stringLiteral(quasis[1].value.raw));
        for (var i = 1; i < expressions.length; i++) {
            binaryExpression = type.binaryExpression("+", binaryExpression, expressions[i]);
            binaryExpression = type.binaryExpression("+", binaryExpression, type.stringLiteral(quasis[i + 1].value.raw));
        }
        path.replaceWith(type.ExpressionStatement(binaryExpression));
        path.skip();
    }
}
/* 改变window下属性的访问方式 */
const changeBuiltinObjects = {
    Identifier(path) {
        let name = path.node.name;
        if (!!window.hasOwnProperty(name) && "window|undefined".indexOf(name) === -1) {
            if (!!path.scope.getBinding(name) || (path.parentPath.type === "MemberExpression" && path.parentPath.get("property") === path)) {
                return;
            }
            path.replaceWith(type.memberExpression(type.identifier("window"), type.stringLiteral(name), true));
            path.skip();
        }
    }
}

/* 工具类放在后面 */

/* 取区间随机数 */
function rnd(n, m) {
    var random = Math.floor(Math.random() * (m - n + 1) + n);
    return random;
}

/* 计算概率 */
function chance(m) {
    /* m为2 则是1/2 概率 */
    return rnd(0, m - 1) === 0;
}

/* 打乱数组 */
function shuffle(arr) {
    let _arr = arr.slice(); //slice不会影响原来的数组，但是splice就会影响原来的arr数组
    for (let i = 0; i < _arr.length; i++) {
        let j = rnd(0, i);
        let t = _arr[i];
        _arr[i] = _arr[j];
        _arr[j] = t;
    }
    return _arr;
}

/* 生成随机字节码,并选择要几个字节码对应一个指令 */
function expand_opcode(i) {
    var z;
    var len = 0;
    for (z in OPCODE) {
        len += 1;
    }
    for (z in OPCODE1) {
        len += 1;
    }
    var ALL_OPCODE = [...Array((len - 2) * times + 2).keys()];
    ALL_OPCODE[0] = ALL_OPCODE.length;
    ALL_OPCODE = shuffle(ALL_OPCODE);

    for (z in OPCODE) {
        /* 指令对应的字节码 */
        var t = [];
        var code;
        if (z === "BREAK" || z === "CONTINUE" || z === "FINALLY" || z === "SKIP_BLOCK") {
            t.push(ALL_OPCODE.pop());
        } else {
            for (var m = 0; m < i; m++) {
                t.push(ALL_OPCODE.pop());
            }
        }
        NEW_OPCODE[z] = t;
        NEW_OPCODE[z].index = 0;
    }
    OPCODE = new Proxy(OPCODE, {
        get(target, p, receiver) {
            if (NEW_OPCODE[p].index >= NEW_OPCODE[p].length) {
                NEW_OPCODE[p].index = 0;
            }
            return NEW_OPCODE[p][NEW_OPCODE[p].index++];
        }
    });
    for (z in OPCODE1) {
        /* 指令对应的字节码 */
        var t = [];
        var code;
        for (var m = 0; m < i; m++) {
            t.push(ALL_OPCODE.pop());
        }
        NEW_OPCODE1[z] = t;
        NEW_OPCODE1[z].index = 0;
    }
    OPCODE1 = new Proxy(OPCODE1, {
        get(target, p, receiver) {
            if (NEW_OPCODE1[p].index >= NEW_OPCODE1[p].length) {
                NEW_OPCODE1[p].index = 0;
            }
            return NEW_OPCODE1[p][NEW_OPCODE1[p].index++];
        }
    });
}

/* 改写js */
function transform_js(ast) {
    // traverse(ast, deleteConsole);
    traverse(ast, arr_func_to_func);
    traverse(ast, change_obj_key);
    traverse(ast, tempToStr);
    for (var i = 0; i < 2; i++) {
        traverse(ast, num_to_express);
    }
    traverse(ast, remove_empty);
    traverse(ast, change_pattern);
    traverse(ast, add_block);
    // traverse(ast, forIn_to_for);
    // traverse(ast, get_object);
    traverse(ast, function_unshift);
    traverse(ast, changeBuiltinObjects);

    // var ast_ = parse(generator(ast).code);
    return ast;
}

/* 至少大于1 */
if (turn) {
    expand_opcode(times);
}


/* vm专用混淆函数 */

/* 花指令 */
const junkCodeModule = {
    'FunctionDeclaration'(path) {
        if (!(path.node.id.name === "vm_enter")) return;
        // 保存path scope里的 二项式花指令函数
        // let func_operator = {};
        var all_func_node = [];
        var all_func_id_node = [];
        // 保存path scope里的 方法调用花指令函数
        let globalFuncNameIdentifier = {};
        path.traverse({
                BinaryExpression(path_) {
                    if (path_.getFunctionParent() === path) {
                        // 二项式计算
                        var bin_symbols = [
                            '*', '/', '%', '+', '-', '<<', '>>', '>>>', '>', '<', '>=', '<=', '==', '===', '!==', '!=', '&', '^', '|',
                        ];
                        let operator = path_.node.operator;
                        let left = path_.node.left;
                        let right = path_.node.right;
                        let a = type.identifier("a");
                        let b = type.identifier("b");
                        let func;
                        let func_2;
                        let funcNameIdentifier;
                        let funcNameIdentifier1;
                        if (globalFuncNameIdentifier.hasOwnProperty(operator) && chance(not_new_junk_rate)) {
                            funcNameIdentifier = globalFuncNameIdentifier[operator][rnd(0, globalFuncNameIdentifier[operator].length - 1)];
                        } else {
                            let BlockStatement = path_.getFunctionParent().get("body");
                            funcNameIdentifier = BlockStatement.scope.generateUidIdentifier("_" + Math.random().toString(36).substr(9));
                            funcNameIdentifier1 = BlockStatement.scope.generateUidIdentifier("_" + Math.random().toString(36).substr(9));
                            if (!globalFuncNameIdentifier[operator]) {
                                globalFuncNameIdentifier[operator] = [];
                            }
                            var random_number = rnd(0, 2000);
                            var random_number1 = rnd(0, 2000);
                            var random_symbol = bin_symbols[rnd(0, bin_symbols.length - 1)];
                            while (random_symbol === operator) {
                                random_symbol = bin_symbols[rnd(0, bin_symbols.length - 1)];
                            }
                            var o_ast = parse("typeof a === 'number' && typeof b === 'number' ? b = (a = a - 1671 , b + 587): this".replace("1671", random_number + '').replace("587", random_number1 + ''));
                            var conditionalExp1;
                            traverse(o_ast, {
                                ConditionalExpression(p_) {
                                    conditionalExp1 = p_.node;
                                    p_.stop();
                                }
                            });
                            globalFuncNameIdentifier[operator].push(funcNameIdentifier);

                            func_2 = type.functionDeclaration(
                                funcNameIdentifier1,
                                [a, b], type.blockStatement([
                                    type.returnStatement(
                                        type.sequenceExpression([conditionalExp1,
                                                type.conditionalExpression(
                                                    type.binaryExpression("==", type.thisExpression(), type.identifier("constant")),
                                                    type.binaryExpression(operator, a, b),
                                                    type.binaryExpression(random_symbol, a, b)
                                                )
                                            ]
                                        )
                                    )
                                ]));
                            o_ast = parse("b = typeof a === 'number' && typeof b === 'number' ?  (a = a - 1671 , b + 587): b".replace("- 1671", "+ " + random_number + '').replace("+ 587", "- " + random_number1 + ''));
                            traverse(o_ast, {
                                AssignmentExpression(p_) {
                                    conditionalExp1 = p_.node;
                                    p_.stop();
                                }
                            });
                            func = type.functionDeclaration(
                                funcNameIdentifier,
                                [a, b], type.blockStatement([
                                    type.returnStatement(
                                        type.sequenceExpression([conditionalExp1, type.callExpression(funcNameIdentifier1, [a, b])])
                                    )]));

                            // func = type.functionDeclaration(
                            //     funcNameIdentifier,
                            //     [a, b],
                            //     type.blockStatement([type.returnStatement(
                            //         type.binaryExpression(operator,
                            //             a,
                            //             b)
                            //     )])
                            // );

                            // 这里把生成的方法,往函数作用域内最上方丢.
                            // (方法可以生成的更恶心些) 嵌套2层,对数字进行计算操作,更具迷惑性
                            all_func_node.push(func);
                            all_func_node.push(func_2);

                        }
                        var call_node = type.callExpression(funcNameIdentifier, [left, right]);
                        if (chance(junk_code_rate)) {
                            path_.replaceWith(call_node);
                        }

                    }
                },
                MemberExpression(path_) {
                    // 方法调用转花指令函数
                    if (path_.getFunctionParent() === path && path_.parentPath.type !== "CallExpression" && !(path_.parentPath.type == "AssignmentExpression"
                        && path_.parentPath.get("left") === path_) && path_.parentPath.type !== "UpdateExpression"
                        && type.isStringLiteral(path_.node.property) &&
                        type.isIdentifier(path_.node.object)) {
                        let obj_name = path_.node.object.name;
                        let func_name = path_.node.property.value;
                        let a = type.identifier("a");
                        let b = type.identifier("b");
                        let funcNameIdentifier
                        if (!globalFuncNameIdentifier.hasOwnProperty("memberExpression")) {
                            let BlockStatement = path_.getFunctionParent().get("body");
                            funcNameIdentifier = BlockStatement.scope.generateUidIdentifier("_" + Math.random().toString(36).substr(9));
                            // globalFuncNameIdentifier["memberExpression"] = funcNameIdentifier;
                            let func = type.functionDeclaration(
                                funcNameIdentifier,
                                [a, b],
                                type.blockStatement([type.returnStatement(
                                    type.memberExpression(a, b, true)
                                )])
                            );
                            func.zcj = true;
                            // 这里把生成的方法,往函数作用域内最上方丢.
                            // (方法可以生成的更恶心些) 嵌套2层
                            //BlockStatement.node.body.unshift(func);
                            all_func_node.push(func);

                        } else funcNameIdentifier = globalFuncNameIdentifier["memberExpression"];
                        var call_node = type.callExpression(funcNameIdentifier, [type.identifier(obj_name), type.stringLiteral(func_name)]);
                        if (chance(junk_code_rate)) {
                            path_.replaceWith(call_node);
                        }

                    }
                },
                FunctionDeclaration(path_) {
                    if (path_.node.params.length === 0) {
                        path_.node.params.push(type.identifier("s"));
                        path_.node.params.push(type.identifier("e"));
                    }
                },
                AssignmentExpression(path_) {
                    // if (path_.getFunctionParent() === path && path_.parentPath.type === path_.type) {
                    //     // 二项式计算
                    //     let operator = path_.node.operator;
                    //     if (operator != "=") {
                    //         let left = path_.node.left;
                    //         let right = path_.node.right;
                    //         let a = type.identifier("a");
                    //         let b = type.identifier("b");
                    //         let func;
                    //         let funcNameIdentifier;
                    //         if (globalFuncNameIdentifier.hasOwnProperty(operator) && chance(junk_code_rate)) {
                    //             funcNameIdentifier = globalFuncNameIdentifier[operator][rnd(0, globalFuncNameIdentifier[operator].length - 1)];
                    //         } else {
                    //             let BlockStatement = path_.getFunctionParent().get("body");
                    //             funcNameIdentifier = BlockStatement.scope.generateUidIdentifier("_" + Math.random().toString(36).substr(9));
                    //             if (!globalFuncNameIdentifier[operator]) {
                    //                 globalFuncNameIdentifier[operator] = [];
                    //             }
                    //             globalFuncNameIdentifier[operator].push(funcNameIdentifier);
                    //             func = type.functionDeclaration(
                    //                 funcNameIdentifier,
                    //                 [a, b],
                    //                 type.blockStatement([type.returnStatement(
                    //                     type.assignmentExpression(operator, a, b)
                    //                 )])
                    //             );
                    //             // 这里把生成的方法,往函数作用域内最上方丢.
                    //             // (方法可以生成的更恶心些) 嵌套2层,对数字进行计算操作,更具迷惑性
                    //             //BlockStatement.node.body.unshift(func);
                    //             all_func_node.push(func);
                    //         }
                    //
                    //         var call_node = type.callExpression(funcNameIdentifier, [left, right]);
                    //         if (chance(junk_code_rate)) {
                    //             path_.replaceWith(call_node);
                    //         }
                    //     }
                    // }
                },
                UnaryExpression(path_) {
                    if (path_.getFunctionParent() === path) {
                        let operator = path_.node.operator;
                        if (operator != "delete") {
                            let left = path_.node.argument;
                            // let right = path_.node.right;
                            let a = type.identifier("a");
                            let b = type.identifier("b");
                            let func;
                            let funcNameIdentifier;

                            if (globalFuncNameIdentifier.hasOwnProperty("_" + operator) && chance(not_new_junk_rate)) {
                                funcNameIdentifier = globalFuncNameIdentifier["_" + operator][rnd(0, globalFuncNameIdentifier["_" + operator].length - 1)];
                            } else {
                                let BlockStatement = path_.getFunctionParent().get("body");
                                funcNameIdentifier = BlockStatement.scope.generateUidIdentifier("_" + Math.random().toString(36).substr(9));
                                // globalFuncNameIdentifier["_" + operator] = funcNameIdentifier;
                                if (!globalFuncNameIdentifier["_" + operator]) {
                                    globalFuncNameIdentifier["_" + operator] = [];
                                }
                                globalFuncNameIdentifier["_" + operator].push(funcNameIdentifier);
                                func = type.functionDeclaration(
                                    funcNameIdentifier,
                                    [a, b],
                                    type.blockStatement([type.returnStatement(
                                        type.unaryExpression(operator, a)
                                    )])
                                );
                                // 这里把生成的方法,往函数作用域内最上方丢.
                                // (方法可以生成的更恶心些) 嵌套2层,对数字进行计算操作,更具迷惑性
                                //BlockStatement.node.body.unshift(func);
                                all_func_node.push(func);
                            }
                            var parent_path = path_.findParent(p => p.isSwitchCase());
                            var param1;
                            if (!!parent_path && type.isAssignmentExpression(parent_path.node.consequent[1].expression)) {
                                param1 = parent_path.node.consequent[1].expression.left;
                            } else {
                                param1 = type.identifier("h");
                            }
                            var call_node = type.callExpression(funcNameIdentifier, [left, param1]);
                            path_.replaceWith(call_node);
                        }
                    }
                },
            }
        );
        all_func_node = shuffle(all_func_node);
        for (var i in all_func_node) {
            path.insertBefore(all_func_node[i]);
            all_func_id_node.push(all_func_node[i].id);
            junk_func_name.push(all_func_node[i].id.name);
        }
        path.insertBefore(
            type.variableDeclaration("var", [
                type.variableDeclarator(type.identifier("qa"),
                    type.arrayExpression(all_func_id_node))
            ])
        );

        // var for_ast = parse(
        //     "for (var i = 0; i < qa.length; i++) {\n" +
        //     "    constant[\"$_\" + i] = qa[i].bind(constant).call.bind(qa[i].bind(constant));\n" +
        //     "}");
        var for_ast = parse(
            '(function () {\n' +
            '            var i = 0;\n' +
            '            qa.map(it => {constant["$_" + i] = it.bind(constant).call.bind(it.bind(constant)), i++})\n' +
            '        })();'
        )
        var for_node;
        traverse(for_ast, {
            "ForStatement|ExpressionStatement"(p) {
                for_node = p.node;
                p.stop();
            }
        });
        path.insertBefore(for_node);

        path.skip();
    }
}
/* 复制代码块 */
const copy_block = {
    SwitchStatement(path) {
        /* 找到 字节码 switch 语句,开始复制 */
        if (path.get("discriminant").type === "Identifier" && path.node.discriminant.name === "g") {
            var cases = path.node.cases;
            var new_cases = [], consequent, symbol, m, id, default_case;
            for (var i = 0; i < cases.length; i++) {
                consequent = cases[i].consequent;
                if (!cases[i].test) {
                    default_case = cases[i];
                    break
                }
                id = cases[i].test.object.name;
                if (cases[i].test.computed) {
                    /* 这种是 OPCODE["*"] */
                    symbol = cases[i].test.property.value;
                } else symbol = cases[i].test.property.name;

                if (id === "OPCODE") {
                    for (m = 0; m < NEW_OPCODE[symbol].length; m++) {
                        // new_cases.push(type.switchCase(type.numericLiteral(NEW_OPCODE[symbol][m]), consequent));
                        new_cases.push(type.switchCase(cases[i].test, consequent));
                    }
                } else {
                    for (m = 0; m < NEW_OPCODE1[symbol].length; m++) {
                        // new_cases.push(type.switchCase(type.numericLiteral(NEW_OPCODE1[symbol][m]), consequent));
                        new_cases.push(type.switchCase(cases[i].test, consequent));
                    }
                }
            }
            new_cases = shuffle(new_cases);
            new_cases.push(default_case);
            path.node.cases = new_cases;
            path.skip();
        }
    }
}
/* vm_push 有概率转-> vm_push_2  -> get_value 有概率变成 -> vm_stack[--vm_esp] */
const push_to_push2 = {
    FunctionDeclaration(path) {
        if (!(path.node.id.name === "vm_enter")) return;
        /* 把vm_push -> vm_push2 1/2吧 */
        var scope_ = path.scope;
        var binding = scope_.getBinding("vm_push");
        var reference = binding.referencePaths;
        for (var i = 0; i < reference.length; i++) {
            if (reference[i].parentPath.type === "CallExpression") {
                if (chance(2)) {
                    reference[i].replaceWith(type.identifier("vm_push_2"));
                }
            }
        }
        binding = scope_.getBinding("vm_get_value");
        reference = binding.referencePaths;
        for (i = 0; i < reference.length; i++) {
            if (reference[i].parentPath.type === "CallExpression") {
                if (chance(2)) {
                    reference[i].parentPath.replaceWithSourceString("vm_stack[--vm_stack.$0]");
                }
            }
        }
    }
}

var func_name_track = {};
var _ = [];

/* 复制vm代码 */
const copy_vm_function = {
    FunctionDeclaration(path) {
        if (!(path.node.id.name === "vm_enter")) return;
        var old_func_name, func_name;
        var scope_ = path.scope;
        var func_node = [];
        var block_body = path.node.body.body;
        var a; // 需要bind vm_stack this
        for (var i = 0; i < block_body.length; i++) {
            if (type.isFunctionDeclaration(block_body[i])) {
                a = false;
                old_func_name = block_body[i].id.name
                func_name_track[old_func_name] = [old_func_name];
                for (var j = 0; j < vm_copy_count; j++) {
                    func_name = scope_.generateUidIdentifier("_" + Math.random().toString(36).substr(9));
                    func_name_track[old_func_name].push(func_name.name);
                    func_node.push(
                        type.functionDeclaration(func_name, block_body[i].params, block_body[i].body)
                    );
                }
                (path.get("body").get("body"))[i].traverse({
                    Identifier(p) {
                        if (p.node.name === "vm_stack") {
                            p.replaceWith(type.thisExpression());
                            a = true;
                        }

                    }
                });
                if (a) _ = _.concat(func_name_track[old_func_name]);
                // debugger;

            } else break;
        }
        _ = shuffle(_);
        func_node = shuffle(func_node);
        block_body = func_node.concat(block_body);
        path.get("body").replaceWith(type.blockStatement(block_body));
        path.stop();
    }
}
/* 我也忘记干嘛用的了 */
const replace_vm_function = {
    FunctionDeclaration(path) {
        if (!(path.node.id.name === "vm_enter")) return;
        var reference, func_name_t, j, m = 0, func_name, scope_ = path.scope;
        for (var old_func_name in func_name_track) {
            func_name_t = func_name_track[old_func_name];
            reference = scope_.getBinding(old_func_name).referencePaths;
            for (j = 0; j < reference.length; j++) {
                if (reference[j].parentPath.type !== "FunctionDeclaration") {
                    reference[j].node.name = func_name_t[m++];
                    if (m === func_name_t.length) {
                        m = 0;
                    }
                }
            }
            func_name = scope_.generateUidIdentifier("_" + Math.random().toString(36).substr(9)).name;
            (j = _.indexOf(old_func_name)) > -1 ? _[j] = func_name : j;
            scope_.rename(old_func_name, func_name);
        }
    }
}
/* 堆栈push进行加垃圾代码,要跟运算函数混合 */
const add_dead_code = {
    SwitchStatement(path) {
        /* 找到 字节码 switch 语句,开始复制 */
        if (!(path.get("discriminant").type === "Identifier" && path.node.discriminant.name === "g")) return;
        var bin_symbols = [
            '*', '/', '%', '+', '-', '<<', '>>', '>>>', '>', '<', '>=', '<=', '==', '===', '!==', '!=', '&', '^', '|',
        ];
        var ass_symbols = ['*=', '/=', '%=', '&=', '+=', '-=', '<<=', '>>=', '^=', '|=']
        // var unary_symbols = ['!', '+', '-', '~', 'typeof', 'void'];
        var unary_symbols = ['!', 'typeof', 'void'];
        var symbols = bin_symbols.concat(unary_symbols);
        var id = ["hj", "jk", "lk", "ik"];
        var id1 = ["m", "cz", "zc",]
        var func_name = ["vm_push_fake_1", "vm_push_fake_2", "vm_push_fake_3"]
        path.traverse({
            SwitchCase(path_) {
                if (path_.get("test").type === "MemberExpression" && !!path_.node.test && path_.node.test.computed) {
                    if (path_.node.test.object.name === "OPCODE") {
                        /* 找到运算的地方 */
                        id = shuffle(id);
                        id1 = shuffle(id1);
                        var d = type.identifier("d");
                        var h = type.identifier("h");
                        var new_d = type.identifier(id1[0]);
                        var new_h = type.identifier(id1[1]);
                        func_name = shuffle(func_name);
                        var new_case = [], symbol;
                        var push_value = [], compute_node = [];
                        // path_.scope.rename("y", id[0]); // 这样有问题

                        // 2个值
                        new_case[0] = path_.node.consequent[0];
                        new_case[1] = path_.node.consequent[1];
                        // 运算
                        compute_node[0] = path_.node.consequent[2];
                        // push 堆栈
                        push_value[0] = path_.node.consequent[3];

                        for (var i = 1; i < id.length; i++) {
                            let now_id = type.identifier(id[i]);
                            symbol = symbols[rnd(0, symbols.length - 1)];
                            var ary_node;
                            if (bin_symbols.indexOf(symbol) !== -1) {
                                ary_node = type.expressionStatement(
                                    type.assignmentExpression("=", now_id,
                                        type.binaryExpression(symbol, new_h, new_d))
                                )
                            } else if (unary_symbols.indexOf(symbol) !== -1) {
                                ary_node = type.expressionStatement(
                                    type.assignmentExpression("=", now_id,
                                        type.unaryExpression(symbol, new_d))
                                )
                            }
                            compute_node.push(ary_node);
                            // if (ass_symbos.indexOf(symbol) !== -1) {
                            //     compute_node.push(type.expressionStatement(
                            //         type.assignmentExpression("=",now_id ,
                            //             type.assignmentExpression(symbol, new_h, new_d))
                            //     ));
                            // } else {
                            //     compute_node.push(type.expressionStatement(
                            //         type.assignmentExpression("=", now_id,
                            //             type.binaryExpression(symbol, new_h, new_d))
                            //     ));
                            // }

                            push_value.push(type.expressionStatement(
                                type.callExpression(type.identifier(func_name[i - 1]), [
                                    now_id
                                ])
                            ));
                        }
                        path_.traverse({
                            Identifier(p) {
                                if (p.node.name === "d") {
                                    p.replaceWith(new_d);
                                } else if (p.node.name === "h") {
                                    p.replaceWith(new_h);
                                }
                                p.skip();
                            }
                        });
                        compute_node[0].expression.left.name = id[0];
                        push_value[0].expression.arguments[0].name = id[0];
                        // new_case.push(compute_node[0]);
                        compute_node = shuffle(compute_node);
                        push_value = shuffle(push_value);
                        new_case = new_case.concat(compute_node);
                        new_case = new_case.concat(push_value);
                        new_case.push(
                            type.breakStatement()
                        );
                        path_.node.consequent = new_case;
                    } else if (path_.node.test.object.name === "OPCODE1") {
                        id = shuffle(id);
                        id1 = shuffle(id1);
                        var d = type.identifier("d");
                        var h = type.identifier("h");
                        var new_d = type.identifier(id1[0]);
                        var new_h = type.identifier(id1[1]);
                        func_name = shuffle(func_name);
                        var new_case = [], symbol;
                        var push_value = [], compute_node = [];
                        // path_.scope.rename("y", id[0]); // 这样有问题
                        path_.traverse({
                            Identifier(p) {
                                if (p.node.name === "d") {
                                    p.replaceWith(new_d);
                                } else if (p.node.name === "h") {
                                    p.replaceWith(new_h);
                                }
                                p.skip();
                            }
                        });
                        // 2个值
                        new_case[0] = path_.node.consequent[0];
                        new_case[1] = path_.node.consequent[1];
                        // 运算
                        compute_node[0] = path_.node.consequent[2];
                        // push 堆栈
                        push_value[0] = path_.node.consequent[3];

                        for (var i = 1; i < id.length; i++) {
                            let now_id = type.identifier(id[i]);
                            symbol = unary_symbols[rnd(0, unary_symbols.length - 1)];
                            var ary_node;
                            if (bin_symbols.indexOf(symbol) !== -1) {
                                ary_node = type.expressionStatement(
                                    type.assignmentExpression("=", now_id,
                                        type.binaryExpression(symbol, new_h, new_d))
                                )
                            } else if (unary_symbols.indexOf(symbol) !== -1) {
                                ary_node = type.expressionStatement(
                                    type.assignmentExpression("=", now_id,
                                        type.unaryExpression(symbol, new_d))
                                )
                            }

                            compute_node.push(ary_node);
                            push_value.push(type.expressionStatement(
                                type.callExpression(type.identifier(func_name[i - 1]), [
                                    now_id
                                ])
                            ));
                        }
                        compute_node[0].expression.left.name = id[0];
                        push_value[0].expression.arguments[0].name = id[0];
                        // new_case.push(compute_node[0]);
                        compute_node = shuffle(compute_node);
                        push_value = shuffle(push_value);
                        new_case = new_case.concat(compute_node);
                        new_case = new_case.concat(push_value);
                        new_case.push(
                            type.breakStatement()
                        );
                        path_.node.consequent = new_case;
                    }

                    path_.skip();
                }
            }
        });

    }
}
/* 把所有方法保存到一个对象里 */
const replace_call = {
    FunctionDeclaration(path) {
        var scope_ = path.scope;
        var reference, id;
        var ran = ["d", "m", "h", "y", "zc", "cz", "hj", "jk", "lk", "ik"];
        for (var len = 0; len < junk_func_name.length; len++) {
            reference = scope_.getBinding(junk_func_name[len]).referencePaths;
            for (var i = 0; i < reference.length; i++) {
                if (reference[i].parentPath.type === "CallExpression") {
                    id = ran[rnd(0, ran.length - 1)];
                    if (!scope_.getBinding(id)) id = "this"
                    reference[i].parentPath.node.arguments.unshift(
                        type.identifier(id)
                    );
                    reference[i].replaceWith(
                        type.memberExpression(
                            type.identifier("constant"),
                            type.stringLiteral(`$_${len}`), true
                        )
                    );
                }
            }
        }
        path.stop();
    }
}
/* 把所有方法保存到一个对象里 */
const replace_vm_call = {
    FunctionDeclaration(path) {
        if (!(path.node.id.name === "vm_enter")) return;
        var scope_ = path.scope;
        var reference;
        var block_body = path.node.body.body;
        var vm_func_node = [];
        var len;
        var ran = ["d", "m", "h", "y", "zc", "cz", "hj", "jk", "lk", "ik"];
        for (len = 0; len < block_body.length; len++) {
            if (type.isFunctionDeclaration(block_body[len])) {
                reference = scope_.getBinding(block_body[len].id.name).referencePaths;
                vm_func_node.push(block_body[len].id);
                for (var i = 0; i < reference.length; i++) {
                    if (reference[i].parentPath.type === "CallExpression") {
                        reference[i].parentPath.node.arguments.unshift(
                            type.identifier(ran[rnd(0, ran.length - 1)])
                        );
                        reference[i].replaceWith(
                            type.memberExpression(
                                type.identifier("zcj"),
                                type.stringLiteral(`_$${len}`), true
                            )
                        );
                    }
                }
            } else break;
        }


        var for_ast = parse(
            // "if(!('_$0' in constant)){\n" +
            "for (var i = 0; i < qa.length; i++) {\n" +
            "    zcj[\"_$\" + i] = qa[i].bind(constant).call.bind(qa[i].bind(constant));\n" +
            "}");
        var for_node;
        traverse(for_ast, {
            'IfStatement|ForStatement'(p) {
                for_node = p.node;
                p.stop();
            }
        });
        block_body.unshift(for_node);
        block_body.unshift(type.variableDeclaration(
            "var", [
                type.variableDeclarator(
                    type.identifier("zcj"),
                    type.arrayExpression([])
                )
            ]
        ));
        block_body.unshift(
            type.variableDeclaration("var", [
                type.variableDeclarator(type.identifier("qa"),
                    type.arrayExpression(vm_func_node))
            ])
        );
        path.get("body").replaceWith(type.blockStatement(block_body));
        path.stop();
    }
}
/* vm_stack函数替换指针 */
const replace_vmstack_call = {
    FunctionDeclaration(path) {
        if (!(path.node.id.name === "vm_enter")) return;
        var scope_ = path.scope;
        var reference;
        var block_body = path.node.body.body;
        var vm_func_node = [];
        var len;
        var ran = ["d", "m", "h", "y", "zc", "cz", "hj", "jk", "lk", "ik"];
        for (len = 0; len < _.length; len++) {
            reference = scope_.getBinding(_[len]).referencePaths;
            vm_func_node.push(_[len]);
            for (var i = 0; i < reference.length; i++) {
                if (reference[i].parentPath.type === "CallExpression") {
                    reference[i].parentPath.node.arguments.unshift(
                        type.identifier(ran[rnd(0, ran.length - 1)])
                    );
                    reference[i].replaceWith(
                        type.memberExpression(
                            type.identifier("zcj"),
                            type.numericLiteral(len), true
                        )
                    );
                }

            }
        }


        var var_code = type.variableDeclaration("var", [
            type.variableDeclarator(type.identifier("zcj"),
                type.arrayExpression(_.map(it => type.identifier(it)))
            )
        ]);
        var last_node = block_body.pop();
        block_body.push(var_code);
        var ast_ = parse("zcj = zcj.map(it => it.bind(vm_stack).call.bind(it.bind(vm_stack)));");
        var bind_node;
        traverse(ast_, {
            ExpressionStatement(path) {
                bind_node = path.node;
                path.stop();
            }
        });
        block_body.push(bind_node);
        block_body.push(last_node);
        path.get("body").replaceWith(type.blockStatement(block_body));
        path.stop();
    }
}

/* opcode 回填 */
const return_opcode = {
    MemberExpression(path) {
        var obj;
        var node;
        if (path.get("object").type === "Identifier") {
            if (path.node.object.name === "OPCODE") {
                obj = OPCODE;
            } else if (path.node.object.name === "OPCODE1") {
                obj = OPCODE1;
            } else return;

            if (path.node.computed) {
                node = type.numericLiteral(obj[path.node.property.value]);
            } else {
                node = type.numericLiteral(obj[path.node.property.name]);
            }

            path.replaceWith(node);
        }

    }
}
/* y = h &= d; -> y = h = h & d; */
const noname = {
    // 想不到用啥名称, 就用noname
    AssignmentExpression(path) {
        var operator = path.node.operator;
        if (operator !== "=") {
            operator = operator.slice(0, operator.length - 1);
            var new_assign = type.assignmentExpression("=", path.node.left, type.binaryExpression(
                operator, path.node.left, path.node.right
            ));
            // var new_assign = type.binaryExpression(
            //     operator, path.node.left, path.node.right
            // );
            path.replaceWith(new_assign);
        }
    }
}

var s_track = [], s_name;

/* 提取字符串和数字, 挺影响速度的 */
const noname1 = {
    FunctionExpression(path) {
        var scope_ = path.scope;
        s_name = scope_.generateUidIdentifier("_" + Math.random().toString(36).substr(9)).name;
        path.traverse({
            'StringLiteral|NumericLiteral'(p) {
                var val = p.node.value, index;
                if (typeof val === "string" && val.length > 100) {
                    return;
                }
                (index = s_track.indexOf(val)) === -1 ? index = s_track.push(val) - 1 : index;
                p.replaceWith(type.memberExpression(
                    type.identifier(s_name), type.numericLiteral(index), true
                ));
                p.skip();
            },
        });
        s_track = s_track.map(it => {
            return typeof it === "number" ? type.numericLiteral(it) : typeof it === "string" && type.stringLiteral(it)
        });

        var var_node = type.variableDeclaration(
            "var", [
                type.variableDeclarator(
                    type.identifier(s_name), type.arrayExpression(s_track)
                )
            ]
        );
        path.node.body.body.unshift(var_node);
        path.stop();
    }
}

/* 删掉前几行代码,node运行环境的代码 */
const delete_code = {
    Program(path) {
        for (let i = 0; i < 6; i++) {
            path.node.body.shift();
        }
    }
}

function new_vmp_code() {
    a = +new Date();

    var vm_code = fs.readFileSync("./new_vm_enter.js") + '';
    ast = parse(vm_code);
    traverse(ast, noname);
    traverse(ast, delete_code);
    traverse(ast, copy_block);
    ast = parse(generator(ast).code);
    traverse(ast, push_to_push2);
    traverse(ast, add_dead_code);
    ast = parse(generator(ast).code);
    traverse(ast, copy_vm_function);
    ast = parse(generator(ast).code);
    traverse(ast, replace_vm_function);
    traverse(ast, return_opcode);
    traverse(ast, replace_vmstack_call);

    /* 生成花指令函数 */
    traverse(ast, junkCodeModule);
    ast = parse(generator(ast).code);
    traverse(ast, replace_call);

    console.log("vmp混淆耗时 -> ", +new Date() - a);

    // ast = parse(generator(ast).code);
    // traverse(ast, replace_vm_call);

    a = +new Date();

    var vmp_code = generator(ast).code;
    vmp_code = vmp_code.replace('fs.readFileSync("./opcode.txt") + \'\'', JSON.stringify(opcode));

    const {obfuscate} = require('./vm_obfuscate.js');
    vmp_code = obfuscate(vmp_code);


    // ast = parse(vmp_code);
    // traverse(ast, noname1);
    // vmp_code = generator(ast).code;

    fs.writeFileSync("./out/vmp_out.js", vmp_code);
    console.log("obfuscate混淆(压缩)耗时 -> ", +new Date() - a);

}

// 选择js进行加密
// code = fs.readFileSync("./test/jquery.js") + ''
code = fs.readFileSync("./test/md5.js") + ''
// code = fs.readFileSync("./test/CryptoJs.js") + ''
// code = fs.readFileSync("./test/test.js") + ''
// code = fs.readFileSync("./test/test_out.js") + ''


var ast = parse(code);
var opcode = [];
const test = {
    Program(path) {
        // opcode = generate(path);
        for (let i = 0; i < path.node.body.length; i++) {
            opcode = opcode.concat(generate(path.get('body')[i]));
        }
        // console.log(opcode);
    }
}

var a = +new Date();
ast = transform_js(ast);
traverse(ast, test);
opcode = backfill_opcode(opcode, mode.backfill_CONSTANT, OPCODE.PUSH_CONSTANT);
// 字节码保存下来
fs.writeFileSync("./opcode.txt", JSON.stringify(opcode));
// 经过ast处理过后的js
fs.writeFileSync("./test/test_out.js", generator(ast).code);
console.log("翻译耗时 -> ", +new Date() - a);

// 是否对解释器进行混淆
if (vmp_turn) {
    new_vmp_code();
} else {
    var vmp_code = fs.readFileSync("./new_vm_enter.js") + '';
    vmp_code = vmp_code.replace('fs.readFileSync("./opcode.txt") + \'\'', JSON.stringify(opcode));
    fs.writeFileSync("./out/vmp_out.js", vmp_code);
}


// console.log(obj);

// 打印对象名称对应的数字
// for (var i in identifier_binding_track) {
//     console.log(identifier_binding_track[i].reNameId, " => ", identifier_binding_track[i].oldName);
// }


/* 以下都是废弃的 */

/* 给if for 循环加一层外套 */
const add_coat = {
    'ForStatement|IfStatement'(path) {
        var coat = type.expressionStatement(type.callExpression(
            type.functionExpression(null, [], type.blockStatement([path.node])), []
        ));
        path.replaceWith(coat);
        path.skip();
    }
}
/* 填充函数调用时没有参数 */
const fill_call_params = {
    CallExpression(path_) {
        if (path_.node.arguments.length === 0) {
            var ran = ["d", "m", "h", "y", "zc", "cz"];
            var a = ran[rnd(0, ran.length - 1)];
            var b = ran[rnd(0, ran.length - 1)];
            while (a === b) {
                b = ran[rnd(0, ran.length - 1)];
            }
            path_.node.arguments.push(type.identifier(a));
            path_.node.arguments.push(type.identifier(b));
        } else if (path_.get("callee").isIdentifier() && path_.node.callee.name === "vm_push" && path_.node.arguments.length == 1) {

            path_.skip();
        }
    },
}
/* 函数重命名 巨慢,这个rename */
const rename_function = {
    FunctionDeclaration(path) {
        if (!(path.node.id.name === "vm_enter")) return;
        var block = path.node.body.body;
        var func_name, new_func_name;
        var scope_ = path.scope;
        for (var i = 0; i < block.length; i++) {
            if (type.isFunctionDeclaration(block[i])) {
                func_name = block[i].id.name;
                if (func_name.indexOf("vm") !== -1) {
                    new_func_name = scope_.generateUidIdentifier("_" + Math.random().toString(36).substr(9)).name;
                    scope_.rename(func_name, new_func_name);
                }
            }
        }
    }
}

// traverse(ast, rename_function);

