/**
 * 都别想看代码
 */
var {parse} = require("@babel/parser");
traverse = require("@babel/traverse").default;
generator = require("@babel/generator").default;
type = require("@babel/types");
fs = require("fs");
var vm_code = fs.readFileSync("./vm_enter.js") + '';
var ast = parse(vm_code);
/* 判断这个节点是否是 字符串类型或者数字类型的 */
const isNodeLiteral = function (a) {
    if (type.isStringLiteral(a) || type.isNumericLiteral(a)) {
        return true;
    }
    return false;
}
/* 清空注释 */
const deleteCommentLine = {
    'BreakStatement|CallExpression|SwitchCase|SwitchStatement|ForInStatement|ExpressionStatement|CatchClause|TryStatement|AssignmentExpression|MemberExpression|Identifier|TryStatement|IfStatement|ObjectProperty|BlockStatement|ObjectExpression|VariableDeclaration'(path) {
        type.removeComments(path.node);
    }
}
/* object 对象值回填,其实主要是为了OPCODE填下 */
const decodeObject = {
    VariableDeclarator(path) {
        let {node, scope} = path;
        const {id, init} = node;
        if (!type.isObjectExpression(init)) return;

        let properties = init.properties;
        if (properties.length == 0 || !properties.every(property => isNodeLiteral(property.value)))
            return;
        // console.log(id.name)
        let binding = scope.getBinding(id.name);
        // console.log(binding)
        let {constant, referencePaths} = binding;
        if (!constant) return;

        let newMap = new Map();
        for (const property of properties) {
            let {key, value} = property;
            if (type.isIdentifier(key)) {
                newMap.set(key.name, value);
            } else if (type.isStringLiteral(key)) {
                newMap.set(key.value, value);
            }
        }

        let canBeRemoved = true;
        for (const referPath of referencePaths) {
            let {parentPath} = referPath;
            if (!parentPath.isMemberExpression()) {
                canBeRemoved = false;
                return;
            }

            let AncestorPath = parentPath.parentPath;

            if (AncestorPath.isAssignmentExpression({"left": parentPath.node})) {
                canBeRemoved = false;
                return;
            }
            if (AncestorPath.isUpdateExpression() && ['++', '--'].includes(AncestorPath.node.operator)) {
                canBeRemoved = false;
                return;
            }
            let curKey;
            if (type.isIdentifier(parentPath.node.property) && !parentPath.node.computed) {
                curKey = parentPath.node.property.name;
            } else if (type.isStringLiteral(parentPath.node.property)) {
                curKey = parentPath.node.property.value;
            } else {
                canBeRemoved = false;
                break;
            }
            // debugger;
            if (!newMap.has(curKey)) {
                canBeRemoved = false;
                break;
            }
            parentPath.replaceWith(newMap.get(curKey));
        }
        canBeRemoved && path.remove();
        newMap.clear();
        // path.remove();
        path.stop();
    },
}
/* 把switch 转if else */
const switchToIf = {
    SwitchStatement(path) {
        var discriminant = path.node.discriminant;
        var binaryExpression;
        var switch_case_test;
        var ifStatement;
        var consequent;
        var if_track = [];
        path.traverse({
            BreakStatement(p) {
                var pParent = p.findParent((p_) => {
                    return p_.isForStatement() || p_.isForInStatement() || p_.isWhileStatement() || p_.isSwitchStatement()
                });
                if (!!pParent && pParent === path) {
                    if (path.parentPath.type === "BlockStatement" && path.parentPath.parentPath.type === "ForStatement") {
                        p.replaceWith(type.continueStatement());
                    } else {
                        p.remove();
                    }
                }
            }
        })
        binaryExpression = type.binaryExpression("===", discriminant, path.node.cases[0].test);
        if_track.push(type.ifStatement(binaryExpression, type.blockStatement(path.node.cases[0].consequent)))
        for (var i = 1; i < path.node.cases.length; i++) {
            consequent = path.node.cases[i].consequent;
            // consequent = consequent.filter(item => !type.isBreakStatement(item));
            if (!path.node.cases[i].test) {
                /* 应该叫block */
                ifStatement = type.blockStatement(consequent);
                if_track[if_track.length - 1].alternate = ifStatement;
            } else {
                switch_case_test = path.node.cases[i].test;
                binaryExpression = type.binaryExpression("===", discriminant, switch_case_test);
                ifStatement = type.ifStatement(binaryExpression, type.blockStatement(consequent));
                if_track[if_track.length - 1].alternate = ifStatement;
                if_track.push(ifStatement);
            }
        }
        path.replaceWith(if_track[0]);
    }
}
/* 删除console log*/
const deleteConsole = {
    CallExpression(path) {
        if (path.get("callee").type === "MemberExpression" && path.get("callee").get("object").type === "Identifier" && path.node.callee.object.name === "console") {
            path.remove();
        }
    }
}
/* if else 转三元 或者 && || 这样的 有点问题 先放着*/
// const ifToConditional = {
//     IfStatement(path) {
//         var has_key;
//         path.get("consequent").traverse({
//             'VariableDeclaration|ReturnStatement|BreakStatement'(p) {
//                 has_key = true;
//                 p.stop();
//             }
//         });
//         if (!has_key && path.get("consequent").type === "BlockStatement") {
//             /* 三元表达式不能有var return 节点 */
//             /* 这里把字节码调用转成三元看看 */
//             var condition = type.conditionalExpression(path.node.test, type.sequenceExpression(path.node.consequent.body), path.node.alternate);
//             path.replaceWith(condition);
//         }
//     }
// }

// const aaa = {
//     FunctionDeclaration(path) {
//         var body = path.node.body.body;
//         var ret = type.identifier("ret");
//         var var_ret = type.variableDeclaration("var", [type.variableDeclarator(ret)]);
//         path.traverse({
//             ReturnStatement(p) {
//                 p.replaceWith(type.expressionStatement(type.assignmentExpression("=", ret, p.node.argument)));
//             }
//         });
//         var return_node = type.returnStatement(ret);
//         body.unshift(var_ret);
//         body.push(return_node);
//     }
// }
traverse(ast, decodeObject);
traverse(ast, deleteCommentLine);
traverse(ast, switchToIf);
traverse(ast, deleteConsole);
// traverse(ast, ifToConditional);
// traverse(ast, aaa);
// console.log(generator(ast).code);
fs.writeFileSync("./vmp.js", generator(ast).code);
