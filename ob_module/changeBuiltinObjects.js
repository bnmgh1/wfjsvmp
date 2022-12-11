/*
标准内置对象的处理
Date => window["Date"]
需要把window单独拎出去,用一个变量接收,在作用域里调用.
 */

const type = require("@babel/types");
let builtinObjects = "Date|location|Object|document|navigator|clientInformation|localStorage|sessionStorage|Function|parseInt|Math|Array|RegExp".split("|");
const changeBuiltinObjectsModule = {
    Identifier(path) {
        let name = path.node.name;
        if (builtinObjects.indexOf(name) !== -1) {
            path.replaceWith(type.memberExpression(type.identifier("window"), type.stringLiteral(name), true));
        }
    }
}
const hideWindowModule = {
    Identifier(path) {
        let name = path.node.name;
        if (name === "window") {
            let BlockStatement = path.findParent(
                function (p) {
                    return p.isBlockStatement();
                }
            );
            if (!BlockStatement) {
                BlockStatement = path.findParent(
                    function (p) {
                        return p.isProgram();
                    }
                );
            } else {
                // 这里判断写简单了,判断出while循环才行
                while (type.isWhileStatement(BlockStatement.parentPath)) {
                    BlockStatement = BlockStatement.parentPath.findParent(
                        function (p) {
                            return p.isBlockStatement();
                        }
                    );
                }
            }
            let newWindowIdentifier = BlockStatement.scope.generateUidIdentifier("_0x").name;
            let variableDeclaration = type.variableDeclaration("var", [type.variableDeclarator(type.identifier(newWindowIdentifier)),
                type.variableDeclarator(type.identifier(newWindowIdentifier), type.stringLiteral(""))]);
            let expressionSta = type.expressionStatement(type.assignmentExpression("=", type.identifier(newWindowIdentifier), type.identifier("window")));
            // 这里把生成的方法,往函数作用域内最上方丢.
            // (方法可以生成的更恶心些) 嵌套2层,对数字进行计算操作,更具迷惑性
            BlockStatement.node.body.unshift(expressionSta);
            BlockStatement.node.body.unshift(variableDeclaration);
            path.replaceWith(type.memberExpression(type.identifier("window"), type.stringLiteral(name), true));
            path.skip();
        }
    }
}

exports.changeBuiltinObjectsModule = changeBuiltinObjectsModule;
exports.hideWindowModule = hideWindowModule;