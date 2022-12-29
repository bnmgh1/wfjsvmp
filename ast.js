var {parse} = require("@babel/parser");
traverse = require("@babel/traverse").default;
generator = require("@babel/generator").default;
type = require("@babel/types");
fs = require("fs");

// var code = fs.readFileSync("./test1.js") + ''
// var ast = parse(code);
// var symbols= [];
// const get_symbol = {
//     SwitchCase(path){
//         if (!path.node.test) return;
//         var symbol = path.node.test.value;
//         symbols.push(symbol);
//
//     }
// }
// traverse(ast,get_symbol);
// console.log(symbols)

// var a = [ '!', '+', '-', '~', 'typeof', 'void' ]

// var a = [
//     '*', '/', '%',
//     '+', '-', '<<',
//     '>>', '>>>', '>',
//     '<', '>=', '<=',
//     '==', '===', '!==',
//     '!=', '&', '^',
//     '|',
//     '=', '*=', '/=',
//     '%=', '&=', '+=',
//     '-=', '<<=', '>>=',
//     '^=', '|=', 'in',
//     'instanceof'
// ]

// var c = 1031;
// var b = {}
// for (i in a){
//     b[a[i]] = ++c;
// }
// console.log(b)


b = {
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
    'instanceof': 1031
}
// b = {
//   '!': 1032,
//   '+': 1033,
//   '-': 1034,
//   '~': 1035,
//   'typeof': 1036,
//   'void': 1037
// }


// switch (a) {
//     case b["*"]:
//         d = vm_stack[--vm_esp];
//         y = vm_stack[--vm_esp];
//         vm_push(y * d);
// }
var cases = [];

var d = type.expressionStatement(type.assignmentExpression("=", type.identifier("d"),
    type.memberExpression(type.identifier("vm_stack"), type.updateExpression(
        "--", type.identifier("vm_esp"), true
    ), true)));
var h = type.expressionStatement(type.assignmentExpression("=", type.identifier("h"),
    type.memberExpression(type.identifier("vm_stack"), type.updateExpression(
        "--", type.identifier("vm_esp"), true
    ), true)));

for (var i in b) {
    var consequent = [d, h];
    var push_node = type.expressionStatement(type.callExpression(type.identifier("vm_push"), [
        type.identifier("y")
    ]))
    var assign_node;


    if (i.indexOf("=") !== -1) {
        assign_node = type.expressionStatement(type.assignmentExpression("=", type.identifier("y"), type.assignmentExpression(i, type.identifier("h"), type.identifier("d"))));
    } else {
        assign_node = type.expressionStatement(type.assignmentExpression("=", type.identifier("y"), type.binaryExpression(i, type.identifier("h"), type.identifier("d"))));

    }
    consequent.push(assign_node);
    consequent.push(push_node);
    consequent.push(type.breakStatement());
    var switchCase = type.switchCase(type.memberExpression(type.identifier("OPCODE"), type.stringLiteral(i), true),
        consequent
    );
    cases.push(switchCase);

}
var switch_node = type.SwitchStatement(type.identifier("a"),
    cases)

console.log(generator(switch_node).code)