/*
逗号表达式混淆
 */

const type = require("@babel/types");
const commaExpressionConfuseModule = {
    FunctionExpression(path) {
        let blockStatement = path.node.body;
        let blockStatementLength = blockStatement.body.length;
        if (blockStatementLength < 2) return;
        //  把所有声明的变量提取到参数列表中
        path.traverse({
            VariableDeclaration(p) {
                declarations = p.node.declarations;
                let statements = [];
                declarations.map(function (v) {
                    path.node.params.push(v.id);
                    v.init && statements.push(type.assignmentExpression('=', v.id, v.init))
                });
                p.replaceInline(statements);
            }
        });
        //    处理赋值语句,返回语句和函数调用语句
        let firstSta = blockStatement.body[0], i = 1;
        while (i < blockStatementLength) {
            let tempSta = blockStatement.body[i++];
            type.isExpressionStatement(tempSta) ?
                secondSta = tempSta.expression : secondSta = tempSta;
            //    处理返回语句
            if (type.isReturnStatement(secondSta)) {
                firstSta = type.returnStatement(
                    type.toSequenceExpression([firstSta, secondSta.argument]));
            } else if (type.isAssignmentExpression(secondSta)) {
                if (type.isCallExpression(secondSta.right)) {
                    let callee = secondSta.right.callee;
                    callee.object = type.toSequenceExpression([firstSta, callee.object]);
                    firstSta = secondSta;
                } else {
                    secondSta.right = type.toSequenceExpression([firstSta, secondSta.right]);
                    firstSta = secondSta;
                }
            } else {
                firstSta = type.toSequenceExpression([firstSta, secondSta]);
            }

        }
        path.get("body").replaceWith(type.blockStatement([firstSta]));
    }
}
exports.commaExpressionConfuseModule = commaExpressionConfuseModule;