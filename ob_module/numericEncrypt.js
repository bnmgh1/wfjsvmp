/*
数值常量加密
1.把数字转换成 1+2 1^2 随机的
2.像乘除的,有余数,可以用Math.floor ceil 来取整.
3.最后转成16进制
 */
const type = require("@babel/types");
let operator = "+|-|/|^".split("|")
let numericEncryptModule = {
    NumericLiteral(path) {
        let value = path.node.value;
        let key = parseInt(Math.random() * (999999 - 100000) + 100000, 10);
        let op = operator.shift();
        operator.push(op);
        let cipherNum;
        switch (op) {
            case "+":
                cipherNum = value - key;
                break;
            case "-":
                cipherNum = key + value;
                break;
            case "/":
                cipherNum = key * value;
                break;
            case "^":
                cipherNum = value ^ key;
                break;

        }
        path.replaceWith(type.binaryExpression(op, type.numericLiteral(cipherNum), type.numericLiteral(key)));
        path.skip();
    }
}
const intToHexModule = {
    NumericLiteral(path) {
        let value = path.node.value;
        let hex = value.toString(16);
        let hexValue;
        if (hex.indexOf("-") === -1) {
            hexValue = "0x" + hex
        } else hexValue = "-0x" + hex.replace("-", "");
        try {
            path.replaceWithSourceString(hexValue);
        }catch (e){debugger}

        path.skip();
    }
}

exports.numericEncryptModule = numericEncryptModule;
exports.intToHexModule = intToHexModule;
