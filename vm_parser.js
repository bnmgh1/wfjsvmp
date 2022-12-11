var {JSDOM} = require("jsdom");
var {window} = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
global["window"] = window;

var {parse} = require("@babel/parser");
traverse = require("@babel/traverse").default;
generator = require("@babel/generator").default;
type = require("@babel/types");
fs = require("fs");
var code = "";
var obj = [];
var OPCODE = {
    PASS: 11, // 这是个无用字节码,不作任何操作
    PUSH_NUM: 12,
    PUSH_STR: 13,
    PUSH_NULL: 14,

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

    RETURN: 88,
    IS_TRUE: 89,
    SKIP_BLOCK: 90,
    GOTO: 91, // 跳转到循环头位置
    BREAK: 92, // break, 正常的思路应该是break出一段代码的. 写不出来, 我长度获取不到.
    CONTINUE: 93, // continue

}
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
        return str.charCodeAt();
    });
}

function strToOpcode(str) {
    var opcode = [];
    opcode.push(OPCODE.PUSH_STR);
    var str_opcode = strToNumArr(str);
    opcode.push(str_opcode.length);
    opcode = opcode.concat(str_opcode);
    return opcode;
}
/* push update_stack 指令. */
function push_update_stack(opcode, node) {
    if ("VariableDeclarator|ConditionalExpression|WhileStatement" +
        "LogicalExpression|BinaryExpression|IfStatement" +
        "|UnaryExpression|CallExpression|ReturnStatement|AssignmentExpression".indexOf(node.parentPath.type) !== -1) {
        // opcode = opcode.concat(generate(node.get("left")));
        opcode.push(OPCODE.UPDATE_STACK);
    }
    return opcode;
}

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
            if (!node.node.init) {
                /*没有init push null*/
                opcode.push(OPCODE.PUSH_NULL);
            } else {
                opcode = opcode.concat(generate(node.get("init")));
            }
            opcode = backfill_opcode(opcode, mode.backfill_identifier, OPCODE.PUSH_VAR);
            opcode = opcode.concat(generate(node.get("id")));
            opcode = backfill_opcode(opcode, mode.backfill_identifier, OPCODE.MOV_VAR);
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
            for (var i = 0; i < len; i++) {
                opcode = opcode.concat(generate(node.get("properties")[i]));
            }
            opcode.push(OPCODE.NEW_OBJECT);
            opcode.push(len);
            break
        case "ObjectProperty":
            /* 要不就直接提取var b = {"a":"c"} 他的key, b["a"] = "c"; 酱紫容易写 他妈的 , 不写逻辑了 */
            var key_opcode = generate(node.get("key"));
            key_opcode = backfill_opcode(key_opcode, mode.backfill_identifier, OPCODE.PASS);
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
            if (node.node.operator === "delete") {
                opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_member_expression, OPCODE.PASS));
                opcode.push(OPCODE.DELETE)
            } else {
                opcode = opcode.concat(strToOpcode(node.node.operator));
                opcode = opcode.concat(generate(node.get("argument")));
                opcode.push(OPCODE.SINGLE_COMPUTE);
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
                opcode = opcode.concat(finalizer_opcode);
            }
            break

        /*比较麻烦的节点*/
        case "Identifier":
            /* 在window下的对象,或者是 MemberExpression.property 也就是 a[b] 这个b的key, 我们就需要把参数名称push到堆栈里 */
            /* 都不是的则直接命名带上id */
            var name = node.node.name;
            if (name === "arguments") {
                opcode = opcode.concat(strToOpcode(name));
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
            if (name in window && !biding) {
                opcode = opcode.concat(strToOpcode(name));
                /* push this 或者 vm_constant 交由上层回填 */
                opcode.push(mode.backfill_CONSTANT);
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
            var str_opcode = strToOpcode(node.node.operator);
            var right_opcode = generate(node.get("right"));
            var left_opcode = generate(node.get("left"));
            if (node.node.operator !== "=") {
                // console.log("AssignmentExpression 符号 => ", node.node.operator);
                opcode = opcode.concat(str_opcode);
                opcode = opcode.concat(left_opcode);
                opcode = opcode.concat(right_opcode);
                opcode.push(OPCODE.COMPUTE);
            } else {
                opcode = opcode.concat(right_opcode);
            }
            switch (node.get("left").type) {
                case "Identifier":
                    /* 要用常量池里的对象去接收值呢 */
                    opcode = opcode.concat(backfill_opcode(left_opcode, mode.backfill_identifier, OPCODE.MOV_VAR));
                    break
                case "MemberExpression":
                    opcode = opcode.concat(left_opcode);
                    /* 遍历MemberExpression 节点, 会获取到值, 把最后GET_OBJ指令替换成SET_OBJ即可*/
                    opcode[opcode.lastIndexOf(mode.backfill_member_expression)] = OPCODE.SET_OBJ;
                    /* 其余的都直接替换成 GET_OBJ,其实这里可以不写这个代码,运行到最后会自动补全get obj 指令 */
                    opcode = backfill_opcode(opcode, mode.backfill_member_expression, OPCODE.GET_OBJ);
                    break
                default:
                    debugger;
            }
            /* if ((a = 1)) 这种的 怪恶心的 , 怎么判断是否会用到这个值
            *  */
            // opcode = push_update_stack(opcode, node);
            opcode.push(OPCODE.UPDATE_STACK);

            break
        case "BinaryExpression":
            opcode = opcode.concat(strToOpcode(node.node.operator));
            var left_opcode = generate(node.get("left"));
            var right_opcode = generate(node.get("right"));
            opcode = opcode.concat(left_opcode);
            opcode = opcode.concat(right_opcode);
            opcode.push(OPCODE.COMPUTE);
            break
        case "UpdateExpression":
            var str_opcode = strToOpcode(node.node.operator);
            // var argument_opcode = generate(node.get("argument"));
            if (node.node.prefix) {
                /* ++a */
                opcode = opcode.concat(str_opcode);
                if (type.isIdentifier(node.node.argument)) {
                    /* 直接 push 参数名 */
                    opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_identifier, OPCODE.PASS));
                    opcode.push(OPCODE.UPDATE);

                } else if (type.isMemberExpression(node.node.argument)) {
                    opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_member_expression, OPCODE.PASS));
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
                opcode = opcode.concat(str_opcode);
                if (type.isIdentifier(node.node.argument)) {
                    /* 先把值push到堆栈里给他们用,然后++ */
                    opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_identifier, OPCODE.PASS));
                    opcode.push(OPCODE.UPDATE);
                } else if (type.isMemberExpression(node.node.argument)) {
                    opcode = opcode.concat(backfill_opcode(generate(node.get("argument")), mode.backfill_member_expression, OPCODE.PASS));
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
                property_opcode = backfill_opcode(property_opcode, mode.backfill_identifier, OPCODE.PASS);
                property_opcode = backfill_opcode(property_opcode, mode.backfill_CONSTANT, OPCODE.PASS);
            }
            opcode = opcode.concat(property_opcode);
            opcode = opcode.concat(object_opcode);
            /* push get 还是 set */
            opcode.push(mode.backfill_member_expression);
            // if (node.parentPath.type === "AssignmentExpression"){
            //     opcode.push(OPCODE.UPDATE_STACK);
            // }
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
                    /* 这里还需要把调用者push到堆栈里 */
                    opcode = opcode.concat(generate(node.get("callee").get("object")));
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
            break
        case "FunctionDeclaration":
            /* 第一步先把传参push到堆栈里组成数组 */
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
            paramopcode = backfill_opcode(paramopcode, mode.backfill_identifier, OPCODE.PASS);
            paramopcode = backfill_opcode(paramopcode, mode.backfill_CONSTANT, OPCODE.PASS);
            /* 把参数组成一个数组并push到堆栈里 */
            paramopcode.push(OPCODE.NEW_ARRAY);
            paramopcode.push(len);
            opcode = opcode.concat(paramopcode);
            /* 先将new function 字节码push到 opcode中去 */
            opcode.push(OPCODE.NEW_FUNC);
            var blockSta_opcode = generate(node.get("body"));
            opcode.push(blockSta_opcode.length);
            opcode = opcode.concat(blockSta_opcode);
            // debugger;
            if (type.isIdentifier(node.node.id)) {
                /* 加入到变量池里 */
                opcode = opcode.concat(backfill_opcode(generate(node.get("id")), mode.backfill_identifier, OPCODE.MOV_VAR));
            } else {
                debugger;
            }
            break
        case "FunctionExpression":
            /* 第一步先把传参push到堆栈里组成数组 */
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
            paramopcode = backfill_opcode(paramopcode, mode.backfill_identifier, OPCODE.PASS);
            paramopcode = backfill_opcode(paramopcode, mode.backfill_CONSTANT, OPCODE.PASS);
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
                    /* 加入到变量池里 */
                    opcode = opcode.concat(backfill_opcode(generate(node.get("id")), mode.backfill_identifier, OPCODE.MOV_VAR));
                    // 这里感觉要判断一下最好
                    opcode.push(OPCODE.UPDATE_STACK);
                } else {
                    debugger;
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
            /* for(var a in b) {} 直接用AST改写成For循环即可,不想写 */
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
        case "CatchClause":
            /* catch(e){}  */
            var param_opcode = generate(node.get("param"))
            var block_opcode = generate(node.get("body"));
            // opcode.push(OPCODE.CATCH);
            // opcode.push(param_opcode.length + block_opcode.length);
            /* push e参数 */
            opcode = opcode.concat(backfill_opcode(param_opcode, mode.backfill_identifier, OPCODE.MOV_VAR));
            opcode = opcode.concat(block_opcode);
            break
        case "SwitchStatement":
            /* 恶心节点之1, 确实如果break不去找到要跳过的索引,这个就很难做 */
            var SwitchCaseopcode;
            var str_opcode = strToOpcode("==");
            var discriminant_opcode = generate(node.get("discriminant"));
            var len = node.node.cases.length;
            for (var i = 0; i < len; i++) {
                opcode = opcode.concat(str_opcode);
                opcode = opcode.concat(discriminant_opcode);
                SwitchCaseopcode = generate(node.get("cases")[i]);
                if (len > (i + 1)) {
                    var index = SwitchCaseopcode.indexOf(mode.backfill_IS_TRUE);
                    SwitchCaseopcode[index] = SwitchCaseopcode.length + 2;
                    SwitchCaseopcode.push(OPCODE.SKIP_BLOCK);
                    /* compute is_true */

                    var test_opcode = generate(node.get("cases")[i + 1].get("test"));
                    if (!test_opcode) {
                        /* default */
                        test_opcode = discriminant_opcode;
                    }
                    SwitchCaseopcode.push(test_opcode.length + str_opcode.length + discriminant_opcode.length + 3);
                } else {
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
            opcode.push(OPCODE.COMPUTE);
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
            /* _0x100 < 10 && _0x100 == 1 符号真应该最后用 */
            var left_opcode = generate(node.get("left"));
            var right_opcode = generate(node.get("right"));
            opcode = opcode.concat(left_opcode);
            opcode.push(OPCODE.IS_TRUE);
            switch (node.node.operator) {
                case "&&":
                    /* var target = 1 && 2 */
                    if ("AssignmentExpression|ConditionalExpression|VariableDeclarator" +
                        "|ObjectProperty|UnaryExpression|BinaryExpression|IfStatement|" +
                        "ReturnStatement|CallExpression".indexOf(node.parentPath.type) !== -1) {
                        opcode.push(right_opcode.length + 2);
                        opcode = opcode.concat(right_opcode);
                        opcode.push(OPCODE.SKIP_BLOCK);
                        opcode.push(1);
                        opcode.push(OPCODE.UPDATE_STACK);
                    } else {
                        opcode.push(right_opcode.length);
                        opcode = opcode.concat(right_opcode);
                    }
                    break
                case "||":
                    if ("AssignmentExpression|ConditionalExpression|VariableDeclarator" +
                        "|ObjectProperty|UnaryExpression|BinaryExpression|" +
                        "IfStatement|ReturnStatement|CallExpression".indexOf(node.parentPath.type) !== -1) {
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
/* forIn 循环 转 for循环 */
const forIn_to_for = {
    ForInStatement(path) {
        var right_node = path.node.right;
        var block_node = path.node.body;
        var left_node = path.node.left;
        /* var zcj = Object.keys(b); 也是丢到for上面 这里zcj无法被重命名? 我无法理解 */
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
/* a.map(it => return 1;) => a.map(function(it){return 1}); 还需要判断return返回.
直接用库把es6 => es5. 直接不写,摆烂. 不写也不行.这个库有问题 */
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
*                  (b = se.aa = {'a':1,'c':'aaa','dd':{'ccc':'123'}}),b.dd.m = b.dd.ccc;               */
const sequencing = {
    AssignmentExpression(path) {
        if (path.get("left").isMemberExpression() && path.get("left").get("object").isMemberExpression()
        && path.get("left").get("object").get("object").isAssignmentExpression()){
            var assign = path.node.left.object.object;
            path.get("left").get("object").get("object").replaceWith(path.node.left.object.object.left);
            path.insertBefore(assign);
        }
    }
}
/* 工具类放在后面 */

/* 取区间随机数 */
function rnd(n, m) {
    var random = Math.floor(Math.random() * (m - n + 1) + n);
    return random;
}

// code = "var b = {\"a\":\"c\",1:1,b:\"3\"};var a = 10; a += b[1];"
// code = "var a = function(){ console.log(1);}; a();"
// code = "throw new Error('zcj');"
// code = "var e = \"e\"\n" +
//     "try {\n" +
//     "    var q = \"123\";\n" +
//     "    throw \"zcj\";\n" +
//     "} catch (e) {\n" +
//     "    console.log(e);\n" +
//     "    var s = \"456\";\n" +
//     "    try{\n" +
//     "        q = \"777\";\n" +
//     "        throw \"zcj\";\n" +
//     "    }catch(e){\n" +
//     "        q = \"888\"\n" +
//     "    }finally{\n" +
//     "        \n" +
//     "    }\n" +
//     "}finally{\n" +
//     "    console.log(e);\n" +
//     "    var m = \"1\";\n" +
//     "}\n" +
//     "console.log(s);\n" +
//     "console.log(q);\n" +
//     "console.log(m);"
// code = "var a = {'a':{}}; a.a.c = 1000; console.log(a.a.c);"
// code = "var c = 1;var a = b = 1; console.log(b);"
// code = "function e() {\n" +
//     "var r = [\"mJCZodK3nNfKsNPmwa\", \"r0vzq094vvC\", \"qZfbqLbOtwjdzW\", \"odC4mJuYzMD3te9m\", \"q1vbq09N\", \"rKzVta\", \"ruvzwu1cC1vczZfnswLzverbBW\", \"sdfRzvbrqq\", \"rfzVqG\", \"q2XRwu1syW\", \"rKvz\", \"BgvUz3rO\", \"q2TbveLrwuTcAgrt\", \"ChjVDg90ExbL\", \"ruzZvK53BZnduq\", \"mZeZmZu4mhHRCeLisq\", \"t0HJEuzQyYTlrey4t3HRk05trtjAu0fbsvn3nKWYsxbdEwDArfjWuKzeuvzfqvLuwgGWl0Hcy2zdrwndsMDJt0DbrK1dmKPeu2X4tKffzgXtA0u\", \"y29UC3rYDwn0B3i\", \"AxrLCMf0B3i\", \"rvzrq0HrvvDqD3rHqvrJqurcwq\", \"rLzbzK5rwve\", \"zgvMAw5LuhjVCgvYDhK\", \"rLzbwePN\", \"nwjpBunPrq\", \"q2Tfre94D2y\", \"q1vJzuPOme1gz2Xr\", \"r2WWuuLervHdEhGWqLe\", \"sgXbrKvcme5buJfJshPvEezbwwnxD1vbrNHZyG\", \"rgXbve9sC00\", \"mti2otuXm2TJELzKwG\", \"q2Tvze93wq\", \"q2Tfuu1sAW\", \"mZi4ota2mdH4zuv6rKS\", \"rvvfrKLNrKm\", \"mZKWmJG5mMDdDeXRza\", \"r2XVzu9sC2q\", \"qZfrzK5Omfy\", \"C3LTyM9S\", \"sdbbzK1rwvjbqMm\", \"r0vvqLbNCW\", \"rvvfrKLN\", \"Dw5KzwzPBMvK\", \"r2WWuuLetu0\", \"rfzVAuPNqvjbuJq\", \"sdfVrez4twjcDW\", \"mZeYmdaXnM9PvvPezq\", \"zNvUy3rPB24\"];\n" +
//     "return (e = function () {\n" +
//     "return r;\n" +
//     "})();\n" +
//     "}\n" +
//     "\n" +
//     "console.log(e(\"dadasd\"))"
// code = "var ji = {\"y\":90, \"ds\":78}\n" +
//     "for (var i in ji){\n" +
//     "console.log(i);\n" +
//     "}"
// code = "var ji = {\"y\":90, \"ds\":78}\n" +
//     "var i;\n" +
//     "for (i in ji){\n" +
//     " console.log(i);\n" +
//     "}\n"
// code = "var ji = {\"y\":90, \"ds\":78}\nvar m = 'y';console.log(ji[m])"
// code = fs.readFileSync("./md5.js") + ''
// code = "var a = 0;\n" +
//     "var b = 1;\n" +
//     "switch (a){\n" +
//     "    case 0:\n" +
//     "        console.log(\"0\");\n" +
//     "    case b:\n" +
//     "        console.log(\"1\")\n" +
//     "        break\n" +
//     "    case 2:\n" +
//     "        console.log(2);\n" +
//     "}"
// code = "var a = 1;console.log(a.toString());"
// code = "var a = 10;var b = {'c':100}; a += b.c;console.log(a);"
// code = "var a = 1; a ? console.log(1) : console.log(2);console.log('end');"
// code = "typeof module === \"object\" && typeof module.exports === \"object\""
// code = "for(var i = 0;;){\n" +
//     "   console.log(i);\n" +
//     "   i++;\n" +
//     "if (i == 7){continue;}\n" +
//     "else if(i == 9){try{console.log('zcj');break;}catch(e){}}\n" +
//     "}console.log('zcj')"
// code = "for(var i = 0; ;){\n" +
//     "   console.log(i);\n" +
//     "   i++;\n" +
//     "if (i == 7)    {try{console.log('zcj1');continue;}catch(e){console.log(e);}}\n" +
//     "else if(i == 9){try{console.log('zcj');break;}catch(e){console.log(e);break}}\n" +
//     "}console.log('zcj')"
// code = "typeof module === \"object\" && typeof module.exports === \"object\" && console.log(1) || console.log('a')"
// code = "function a(){try{var a; return (a = 100);}catch(e){}}console.log(a());"
// code = "var d;function a(){function b(a){console.log(a);d = a;} return b;} a()(1);console.log(d);"
// code = "function a(){console.log('a',arguments[0]);function b(){ " +
//     "console.log('b call => ',arguments[0]);}b(55555555555);console.log('a',arguments[0],arguments[1]);}a(4,5);"
// code = "function a(){var target = arguments[0] || {};console.log(target);if(target = 1){console.log(target)}}a({'a':'a'});"
// code = "var target = {'a':'b'};var a = function(){console.log('a')};a.fn = a.prototype;a.ex = a.fn.ex = function(){console.log('ex')};" +
//     "        if (typeof target !== \"object\" && !a.ex(target)) {\n" +
//     "            target = {};\n" +
//     "        }" +
//     "console.log(typeof target !== \"object\" && !a.ex(target));console.log(target);console.log(typeof target === \"boolean\");"
// code = "var a = {\n" +
//     "  'b': 1,\n" +
//     "  'a': Array.isArray || 1,\n" +
//     "  'c': '123'\n" +
//     "}\n" +
//     "console.log(a);"
// code = "var i = 0,length = 20;for(;i < length;i++){ console.log(i);if (i < 10) { continue; } else { break;}  }"
// code = "var i = 0,length = 20;for(;i < length;){ i++;console.log(i);if (i < 10) { continue; } else if ( i > 50 ) { break } }console.log('end')"
// code = "var i = 0,length = 20;for(;;){ i++;console.log(i);if (i < 10) { continue; } else if ( i > 50 ) { break }  } console.log('end')"
// code = "var i = 0,length = 20;for(;;i++){ console.log(i);if (i < 10) { continue; } else if ( i > 50 ) { break }  } console.log('end')"
// code = "console.log(typeof module === \"object\" && typeof module.exports === \"object\");"
// code = "for (var zcj = Object.keys({\n" +
//     "      \"submit\": true,\n" +
//     "      \"change\": true,\n" +
//     "      \"focusin\": true\n" +
//     "    }), zcj1 = 0; zcj1 < zcj.length; zcj1++) {\n" +
//     "      var i = zcj[zcj1];console.log(i);}"
// code = "function assert(func){func(123);}assert((function(a){console.log(a)}));"
// code = "function a(){return 1 ? 1 == 2 && 3 : 4;}console.log(a());"
// code = "var b = 0;function a(c){return 1 && c;}for(var i = 0;i < 100;i++){b += a(i);console.log(b);}"
// code = "var a = b = c = 1; a = {}; b = c = a.a = 100;console.log(a,b,c)"
// code = "var structure={},dataType='1';(structure[dataType] = structure[dataType] || []).push(5);console.log(structure)"
// code = "var jQuery = {fn:{}};\n" +
//     "var init = jQuery.fn.init = function (selector, context){ console.log(arguments[0])};console.log(init);"
// code = "var a = setTimeout(function(){console.log(123)});console.log('a',a);"
// code = "var wait = undefined,jQuery={readyWait:1};jQuery['a'] = 5;if (wait !== true && --jQuery.readyWait > 0) {\n" +
//     "                console.log('bug');\n" +
//     "            }console.log(jQuery);"
// code = "var a = 1;console.log(--a);"
// code = "var e;(e = function aaa(){console.log(aaa);})();"
// code = "var a = 0; console.log(a); var e = !0 ? (a = 10) : 5;console.log(e);console.log(a);"
// code = "var a = {'key':1};var deep;var q = {};" +
//     "if (a !== undefined) {\n" +
//     "        (q['key'] ? target : deep || (deep = {}))['key'] = a['key'];\n" +
//     "      }" +
//     "console.log(a);console.log(deep);"
// code = "var e = {};    \n" +
//     "(e.a = function () {\n" +
//     "console.log(this);\n" +
//     "})();"

code = "var b,se = {};if(true){(b = se.aa = {'a':1,'c':'aaa','dd':{'ccc':'123'}}).dd.m = b.dd.ccc;console.log(b);}"
code = "console.log(String.fromCharCode.apply(undefined,[99,99,99]));"
// code = fs.readFileSync("./jquery.js") + ''
// code = fs.readFileSync("./md5.js") + ''
// code = fs.readFileSync("./test_out.js") + ''
// code = fs.readFileSync("./test.js") + ''
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

// var a = +new Date();
traverse(ast, arr_func_to_func);
traverse(ast, change_obj_key);
for (var i = 0; i < 2; i++) {
    traverse(ast, num_to_express);
}
traverse(ast, remove_empty);
traverse(ast, change_pattern);
traverse(ast, add_block);
traverse(ast, sequencing);
traverse(ast, forIn_to_for);
traverse(ast, get_object);
traverse(ast, function_unshift);

ast = parse(generator(ast).code);
traverse(ast, test);
opcode = backfill_opcode(opcode, mode.backfill_CONSTANT, OPCODE.PUSH_CONSTANT);
fs.writeFileSync("./opcode.txt", JSON.stringify(opcode));

// console.log(opcode);
// console.log(+new Date() - a);
// console.log(generator(ast).code);
// var opcode_str = opcode.map((item) =>{ return String.fromCharCode(item+32)}).join('');
// fs.writeFileSync("./opcode.txt", opcode_str);

fs.writeFileSync("./test_out.js", generator(ast).code);
console.log(obj);

for (var i in identifier_binding_track) {
    console.log(identifier_binding_track[i].reNameId, " => ", identifier_binding_track[i].oldName);
}
