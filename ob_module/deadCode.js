/*
死代码
1.插入死代码,没什么用的代码
2.在ob混淆数组还原数组的函数调用附近开始插入死代码
3.function a(c,d){ return c+d; } => function a() {//在插入些垃圾代码,迷惑一下嘿嘿 a = function(c,d){ return c+d; }};a();这是一种垃圾代码的思路
在此基础之上,可以把某个作用域里的函数都添加在一个初始化函数里,重新赋值.然后旧函数就变成只有声明没有定义. function a(){} 是不是很像vmp,所有函数都到里面了
 */
const type = require("@babel/types");
const deadCodeModule = {
    FunctionDeclaration(path) {
        /*
        第三种情况
         */

        let func_name = path.node.id.name;
        let func_param = path.node.params;
        let func_blockSta = path.node.body;

        let new_blockSta = type.blockStatement([type.expressionStatement(type.assignmentExpression(
            "=",
            type.identifier(func_name),
            type.functionExpression(null,func_param, func_blockSta)
        ))]);
        let functionDeclaration = type.functionDeclaration(type.identifier(func_name), [],new_blockSta
        );
        path.replaceWith(functionDeclaration);
        path.insertAfter(type.expressionStatement(type.callExpression(type.identifier(func_name),[])));
        path.skip();
    }
}
exports.deadCodeModule = deadCodeModule;

