/*
改变属性访问方式
console.log => console["log"]
 */
let type = require("@babel/types");
const changeAccessModule = {
    MemberExpression(path){
        if (type.isIdentifier(path.node.property)){
            let name = path.node.property.name;
            path.node.property = type.stringLiteral(name);
        }
        path.node.computed = true;
    }
}

exports.changeAccessModule = changeAccessModule;