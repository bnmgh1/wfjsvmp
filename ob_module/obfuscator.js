/*
ob 混淆
1.将字符串进行混淆,弄成一个方法或者类似数组这样的

2.将数字进行混淆,弄成一个方法或者类似数组这样的

3.基于运行顺序解混淆的,但是仅限于没有分支歧义的代码且一定会执行到的代码

4.运行到函数里,执行 scope 作用域里的ob混淆数组顺序还原,出去后继续打乱
 */

const t = require("@babel/types");
var str = [];
var init_func = [];
const obfuscatorModule = {
    'FunctionDeclaration|FunctionExpression'(path) {
        var start = str.length;
        var end;
        path.traverse({
            StringLiteral(path_) {
                if (path_.getFunctionParent() === path) {
                    let string = (path_.node.value + '');
                    let b64_str;
                    if (string.length === 1) {
                        b64_str = string.charCodeAt() + '';
                    } else if (string.length > 1) {
                        b64_str = []
                        for (var i in string) {
                            b64_str.push(string[i].charCodeAt() + '');
                        }
                        b64_str = b64_str.join(",");
                    }
                    // console.log(string ,b64_str, path_ + '');
                    // console.log(String.fromCharCode.apply(undefined, b64_str))
                    b64_str = btoa(b64_str);
                    end = str.push(b64_str) - 1;
                    // 方法return arr[int]
                    var arr = t.callExpression(t.identifier("ccc"), [t.numericLiteral(end)]);
                    path_.replaceInline(t.expressionStatement(t.callExpression(t.identifier("qqq"), [t.callExpression(t.identifier("atob"), [arr])])));
                }
            }
        });
        console.log("end => ", end);

        path.node.body.body.unshift(t.expressionStatement(t.callExpression(t.identifier("reduce"), [t.numericLiteral(start), t.numericLiteral(end)])));
        var return_block = path.node.body.body.pop();
        var confuse_node = t.expressionStatement(t.callExpression(t.identifier("confuse"), [t.numericLiteral(start), t.numericLiteral(end)]));
        init_func.push(confuse_node);
        path.node.body.body.push(confuse_node);
        path.node.body.body.push(return_block);
    }
}

/*
数组打乱以及还原
 */
var str = "abcdefg123456789".split("");
var key = "8635".split("");//生成随机4位数字

function refuse(str, key) {
    var temp;
    /*利用秘钥乱序*/
    for (var j = 0; j < 2; j++)   //对于key的前两位
        for (var i = 0; (i + eval(key[j])) <= str.length; i++) {
            if (i % 2 != 0)//奇数位与其后面第key[j]位交换
            {
                temp = str[i + eval(key[j])];
                str[i + eval(key[j])] = str[i];
                str[i] = temp;

            }
        }
    console.log(str.join(""));
    for (var j = 2; j < 4; j++)    //对于key的后两位
        for (var i = 0; (i + eval(key[j])) <= str.length; i++) {
            if (i % 2 == 0)//偶数位与其后面第key[j]位交换
            {
                temp = str[i + eval(key[j])];
                str[i + eval(key[j])] = str[i];
                str[i] = temp;
            }
        }
    console.log(str.join(""));
}

function reduce(str, key) {
    var temp;
    /*利用秘钥复原*/
    for (var j = 3; j >= 2; j--)    //对于key的后两位
        for (var i = str.length; (i - eval(key[j])) >= 0; i--) {
            if (i % 2 != 0)//奇数位与其前面第key[j]位交换
            {
                temp = str[i - eval(key[j])];
                str[i - eval(key[j])] = str[i];
                str[i] = temp;
            }
        }
    console.log(str.join(""));

    for (var j = 1; j >= 0; j--)   //对于key的前两位
        for (var i = str.length; (i - eval(key[j])) >= 0; i--) {
            if (i % 2 != 0)//奇数位与其前面第key[j]位交换
            {
                temp = str[i - eval(key[j])];
                str[i - eval(key[j])] = str[i];
                str[i] = temp;
            }
        }
    console.log(str.join(""));
}

exports.obfuscatorModule = obfuscatorModule;
exports.refuse = refuse;
exports.reduce = reduce;
