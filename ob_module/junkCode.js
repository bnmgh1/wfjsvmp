/*
花指令
1.将二项式计算,转成方法调用返回

2.将方法调用也转成花指令, String["fromCharCode"] => a(String,"fromCharCode") => function a(c, d) { return  c[d];}

3.可以把方法保存到一个object里,var xxx = { 'xsa' : function a(c, d){ return c[d]; }}

4.可以把花指令函数保存在方法的prototype上, function xxx() {}  xxx.prototype["a"] = function a(c, d){ return c[d]; }
 */

const type = require("@babel/types");
// const junkCodeModule = {
//     BinaryExpression(path) {
//         // 二项式计算
//         let operator = path.node.operator;
//         let left = path.node.left;
//         let right = path.node.right;
//         let a = type.identifier("a");
//         let b = type.identifier("b");
//         // let funcNameIdentifier = path.scope.generateUidIdentifier("_0x");
//         let funcNameIdentifier = "_a" + operator;
//         let func = type.functionDeclaration(
//             funcNameIdentifier,
//             [a, b],
//             type.blockStatement([type.returnStatement(
//                 type.binaryExpression(operator, a, b)
//             )])
//         );
//         let BlockStatement = path.findParent(
//             function (p) {
//                 return p.isBlockStatement();
//             }
//         );
//         // 这里判断写简单了,判断出while循环才行
//         while (type.isWhileStatement(BlockStatement.parentPath)) {
//             BlockStatement = BlockStatement.parentPath.findParent(
//                 function (p) {
//                     return p.isBlockStatement();
//                 }
//             );
//         }
//         // 这里把生成的方法,往函数作用域内最上方丢.
//         // (方法可以生成的更恶心些) 嵌套2层,对数字进行计算操作,更具迷惑性
//         BlockStatement.node.body.unshift(func);
//         path.replaceWith(type.callExpression(funcNameIdentifier, [left, right]));
//     },
//     MemberExpression(path) {
//         // 方法调用
//         if (type.isStringLiteral(path.node.property) && type.isIdentifier(path.node.object)) {
//             let obj_name = path.node.object.name;
//             let func_name = path.node.property.name;
//             let c = type.identifier("c");
//             let d = type.identifier("d");
//             let funcNameIdentifier = path.scope.generateUidIdentifier("_0x");
//             let func = type.functionDeclaration(
//                 funcNameIdentifier,
//                 [c, d],
//                 type.blockStatement([type.returnStatement(
//                     type.expressionStatement(type.memberExpression(c, d, true))
//                 )])
//             );
//             let BlockStatement = path.findParent(
//                 function (p) {
//                     return p.isBlockStatement();
//                 }
//             );
//             while (type.isWhileStatement(BlockStatement.parentPath)) {
//                 BlockStatement = BlockStatement.parentPath.findParent(
//                     function (p) {
//                         return p.isBlockStatement();
//                     }
//                 );
//             }
//             // 这里把生成的方法,往函数作用域内最上方丢.
//             // (方法可以生成的更恶心些) 嵌套2层
//             BlockStatement.node.body.unshift(func);
//             path.replaceWith(type.callExpression(funcNameIdentifier, [type.identifier(obj_name), type.stringLiteral(func_name)]));
//         }
//     }
// }

const junkCodeModule = {
    'FunctionDeclaration|FunctionExpression'(path) {
        // 保存path scope里的 二项式花指令函数
        let func_operator = {};
        // 保存path scope里的 方法调用花指令函数
        let globalFuncNameIdentifier = {};
        path.traverse({
                BinaryExpression(path_) {
                    if (path_.getFunctionParent() === path) {
                        // 二项式计算
                        let operator = path_.node.operator;
                        let left = path_.node.left;
                        let right = path_.node.right;
                        let a = type.identifier("a");
                        let b = type.identifier("b");
                        let func;
                        let funcNameIdentifier;
                        if (globalFuncNameIdentifier.hasOwnProperty(operator)) {
                            funcNameIdentifier = globalFuncNameIdentifier[operator];
                        } else {
                            let BlockStatement = path_.getFunctionParent().get("body");
                            funcNameIdentifier = BlockStatement.scope.generateUidIdentifier("_0x");
                            globalFuncNameIdentifier[operator] = funcNameIdentifier;
                            func = type.functionDeclaration(
                                funcNameIdentifier,
                                [a, b],
                                type.blockStatement([type.returnStatement(
                                    type.binaryExpression(operator, a, b)
                                )])
                            );
                            // 这里把生成的方法,往函数作用域内最上方丢.
                            // (方法可以生成的更恶心些) 嵌套2层,对数字进行计算操作,更具迷惑性
                            BlockStatement.node.body.unshift(func);

                        }

                        path_.replaceWith(type.callExpression(funcNameIdentifier, [left, right]));
                    }
                },
                AssignmentExpression(path_) {
                    if (path_.getFunctionParent() === path) {
                        // 二项式计算
                        let operator = path_.node.operator;
                        if (operator != "=") {
                            let left = path_.node.left;
                            let right = path_.node.right;
                            let a = type.identifier("a");
                            let b = type.identifier("b");
                            let func;
                            let funcNameIdentifier;
                            if (func_operator.hasOwnProperty(operator)) {
                                funcNameIdentifier = func_operator[operator];
                            } else {
                                let BlockStatement = path_.getFunctionParent().get("body");
                                funcNameIdentifier = BlockStatement.scope.generateUidIdentifier("_0x");
                                func_operator[operator] = funcNameIdentifier;
                                func = type.functionDeclaration(
                                    funcNameIdentifier,
                                    [a, b],
                                    type.blockStatement([type.returnStatement(
                                        type.assignmentExpression(operator, a, b)
                                    )])
                                );
                                // 这里把生成的方法,往函数作用域内最上方丢.
                                // (方法可以生成的更恶心些) 嵌套2层,对数字进行计算操作,更具迷惑性
                                BlockStatement.node.body.unshift(func);
                            }
                            path_.replaceWith(type.callExpression(funcNameIdentifier, [left, right]));
                        }
                    }
                },
                UnaryExpression(path_) {
                    if (path_.getFunctionParent() === path) {
                        // 二项式计算
                        let operator = path_.node.operator;
                        if (operator != "delete") {
                            let left = path_.node.argument;
                            // let right = path_.node.right;
                            let a = type.identifier("a");
                            let b = type.identifier("b");
                            let func;
                            let funcNameIdentifier;
                            if (globalFuncNameIdentifier.hasOwnProperty(operator)) {
                                funcNameIdentifier = globalFuncNameIdentifier[operator];
                            } else {
                                let BlockStatement = path_.getFunctionParent().get("body");
                                funcNameIdentifier = BlockStatement.scope.generateUidIdentifier("_0x");
                                globalFuncNameIdentifier[operator] = funcNameIdentifier;
                                func = type.functionDeclaration(
                                    funcNameIdentifier,
                                    [a, b],
                                    type.blockStatement([type.returnStatement(
                                        type.unaryExpression(operator, a)
                                    )])
                                );
                                // 这里把生成的方法,往函数作用域内最上方丢.
                                // (方法可以生成的更恶心些) 嵌套2层,对数字进行计算操作,更具迷惑性
                                BlockStatement.node.body.unshift(func);
                            }
                            var call_node = type.callExpression(funcNameIdentifier, [left]);
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
                            funcNameIdentifier = BlockStatement.scope.generateUidIdentifier("_0x");
                            globalFuncNameIdentifier["memberExpression"] = funcNameIdentifier;
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
                            BlockStatement.node.body.unshift(func);

                        } else funcNameIdentifier = globalFuncNameIdentifier["memberExpression"];
                        path_.replaceWith(type.callExpression(funcNameIdentifier, [type.identifier(obj_name), type.stringLiteral(func_name)]));
                    }
                }
            }
        );
        path.skip();
    }
}
exports.junkCodeModule = junkCodeModule;
