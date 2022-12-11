/*
把函数里代码转为控制流
怎么把控制流的执行流程藏起来
 */
const controlFlowModule = {
    'FunctionExpression|FunctionDeclaration'(path) {
        let blockStatement = path.node.body;
        // console.log(generator(path.node.body).code)
        // console.log("blockStatement =>",blockStatement.body)
        let Statements = blockStatement.body.map(function (v, i) {
            return {index: i, value: v}
        });
        //打乱语句顺序
        let i = Statements.length;
        while (i) {
            let j = Math.floor(Math.random() * i--);
            // console.log("i,j =>", i, j);
            [Statements[j], Statements[i]] = [Statements[i], Statements[j]];//没懂
        }
        //构建分发器，创建switchCase 数组
        let dispenserArr = [];
        let cases = [];
        Statements.map(function (v, i) {
            dispenserArr[v.index] = i;
            let seq;
            type.isReturnStatement(v.value) ? seq = [v.value] : seq = [v.value, type.continueStatement()];
            let switchCases = type.switchCase(type.numericLiteral(i), seq);
            cases.push(switchCases);
        });
        let dispenserStr = dispenserArr.join("|");
        let array = path.scope.generateUidIdentifier('array');
        let index = path.scope.generateUidIdentifier('index');
        // console.log("array =>", array, "index =>", index);
        let callee = type.memberExpression(type.stringLiteral(dispenserStr), type.identifier("split"));
        let arrayInit = type.callExpression(callee, [type.stringLiteral("|")]);
        let varArray = type.variableDeclarator(array, arrayInit);
        let varIndex = type.variableDeclarator(index, type.numericLiteral(0));
        let dispenser = type.variableDeclaration('let', [varArray, varIndex]);
        //    生成switch中的  + _array[index++]
        let discriminant = type.unaryExpression("+", type.memberExpression(array, type.updateExpression("++", index), true));
        //    构建整个switch语句
        let switchSta = type.switchStatement(discriminant, cases);
        //    构建 !![]
        let unaExp = type.unaryExpression("!", type.arrayExpression());
        unaExp = type.unaryExpression("!", unaExp);
        //    生成整个while循环
        let whileSta = type.whileStatement(unaExp, type.blockStatement([switchSta, type.breakStatement()]));
        //    用分发器和while循环来构建blockStatement 替换原有的节点
        path.get('body').replaceWith(type.blockStatement([dispenser, whileSta]));
    }
}
exports.controlFlowModule = controlFlowModule;