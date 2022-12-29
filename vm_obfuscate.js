/**
 * 都别想看代码,正式场景用这个混淆
 */
var {parse} = require("@babel/parser");
traverse = require("@babel/traverse").default;
generator = require("@babel/generator").default;
type = require("@babel/types");
fs = require("fs");

// var vm_code = fs.readFileSync("./vmp.js") + '';

function obfuscate(vm_code) {
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
            for (var i = 0; i < path.node.cases.length; i++) {
                consequent = path.node.cases[i].consequent;
                if (type.isBreakStatement(consequent[consequent.length - 1])) {
                    consequent.pop();
                }
            }
            path.traverse({
                BreakStatement(p) {
                    var pParent = p.findParent((p_) => {
                        return p_.isForStatement() || p_.isForInStatement() || p_.isWhileStatement() || p_.isSwitchStatement()
                    });
                    if (!!pParent && pParent === path) {
                        if (path.parentPath.type === "BlockStatement" && path.parentPath.parentPath.type === "ForStatement") {
                            p.replaceWith(type.continueStatement());
                        } else {
                            // p.remove();
                        }
                    }
                }
            });
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
    /* 为后续转if else 做准备 */
    const breakToContinue = {
        SwitchStatement(path) {
            path.traverse({
                BreakStatement(p) {
                    var pParent = p.findParent((p_) => {
                        return p_.isForStatement() || p_.isForInStatement() || p_.isWhileStatement() || p_.isSwitchStatement()
                    });
                    if (!!pParent && pParent === path) {
                        if (path.parentPath.type === "BlockStatement" && path.parentPath.parentPath.type === "ForStatement") {
                            p.replaceWith(type.continueStatement());
                        } else {
                            // p.remove();
                        }
                    }
                }
            });
        }
    }

    const parsetoSy = {
        SwitchStatement(path) {
            function diedaidata(shuenxun) {
                if (shuenxun.length == 2) {
                    var s = shuenxun[0][1].pop()
                    if (s && (s.type !== "BreakStatement" && s.type !== "ContinueStatement")) {
                        shuenxun[0][1].push(s)
                    }
                    s = shuenxun[1][1].pop()
                    if (s && (s.type !== "BreakStatement" && s.type !== "ContinueStatement")) {
                        shuenxun[1][1].push(s)
                    }
                    var jiego = type.ifStatement(type.binaryExpression("<", type.identifier(tiaojian), type.numericLiteral(shuenxun[0][0] + 1)),
                        type.blockStatement(shuenxun[0][1]), type.blockStatement(shuenxun[1][1])
                    );
                    return jiego;
                } else if (shuenxun.length == 1) {
                    var s = shuenxun[0][1].pop()
                    if (s && (s.type !== "BreakStatement" && s.type !== "ContinueStatement")) {
                        shuenxun[0][1].push(s)
                    }
                    return type.blockStatement(shuenxun[0][1])
                }
                var zj = Math.ceil(shuenxun.length / 2)
                var jiego = type.ifStatement(type.binaryExpression("<", type.identifier(tiaojian), type.numericLiteral(shuenxun[zj][0])),
                    diedaidata(shuenxun.slice(0, zj)), diedaidata(shuenxun.slice(zj))
                );
                return jiego

            }

            if (path.node.discriminant.name !== "g") {
                return
            }
            var tiaojian = path.node.discriminant.name;
            var shuenxun = [];
            var shunull = null
            var cz = [];
            while (1) {
                let max = -1;
                let value = null
                var fd = []
                for (let i = 0; i < path.node.cases.length; i++) {
                    if (path.node.cases[i].test == null) {
                        if (cz.indexOf(null) == -1 && shunull == null) {
                            cz.push(null)
                            shunull = path.node.cases[i].consequent
                        }
                        continue
                    }

                    if (fd.indexOf(path.node.cases[i].test.value) != -1) {
                        debugger
                    }
                    fd.push(path.node.cases[i].test.value)


                    if (path.node.cases[i].test.value > max && cz.indexOf(path.node.cases[i].test.value) == -1) {
                        max = path.node.cases[i].test.value
                        value = path.node.cases[i].consequent;
                    }
                }

                shuenxun.splice(0, 0, [max, value])
                cz.push(max)
                if (cz.length >= path.node.cases.length) {
                    break
                }
            }

            // log(cz)
            var rety;
            if (shunull == null) {
                rety = diedaidata(shuenxun, tiaojian)

            } else {
                var s = shunull.pop()
                if (s.type !== "BreakStatement") {
                    shunull.push(s)
                }
                rety = type.ifStatement(parse(`${JSON.stringify(cz)}.indexOf(${tiaojian}) == -1`).program.body[0].expression,
                    type.blockStatement(shunull), diedaidata(shuenxun, tiaojian)
                );
            }

            path.replaceInline(rety)
            path.skip()

        }
    }

    /* 逗号表达式*/
    const expToComma = {
        'BlockStatement'(path) {
            var body = path.node.body;
            var is_all_exp = true;
            var expressions = [];
            if (body.length > 1) {
                body.map(item => {
                    if (!type.isExpressionStatement(item)) {
                        is_all_exp = false;
                    } else expressions.push(item.expression);
                });
                if (is_all_exp) {
                    path.node.body = [type.expressionStatement(type.sequenceExpression(expressions))];
                }
            }

        }
    }

    const {changeAccessModule} = require('./ob_module/changeAccess');

    /* 这几个之前写的全都有bug */
    // const {deadCodeModule} = require('./ob_module/deadCode');
    // const {junkCodeModule} = require('./ob_module/junkCode');
    // const {controlFlowModule} = require('./ob_module/controlFlow');

    const {UglifyJS} = require('./uglify_es.js');

    traverse(ast, deleteCommentLine);
    traverse(ast, breakToContinue);
    traverse(ast, deleteConsole);

    traverse(ast, changeAccessModule);
    traverse(ast, parsetoSy);
    traverse(ast, switchToIf);
    traverse(ast, expToComma);

    var r = UglifyJS.minify(generator(ast).code, {
        compress: {
            drop_debugger: false,
            hoist_vars: false,
            join_vars: false,
            sequences: false,
            inline: false,
            loops: false,
            reduce_funcs: false,
            reduce_vars: false,
            collapse_vars: false,
            comparisons: false,
            computed_props: false,
            conditionals: true,
            evaluate: true,
            expression: false,
        },
        output: {
            bracketize: true,
            beautify: true,
        },
    });
    // r = UglifyJS.minify(r.code, {
    //     compress: {
    //         drop_debugger: false,
    //         hoist_vars: false,
    //         join_vars: false,
    //         sequences: false,
    //         inline: false,
    //         loops: false,
    //         reduce_funcs: false,
    //         reduce_vars: false,
    //         collapse_vars: false,
    //         comparisons: false,
    //         computed_props: false,
    //         conditionals: true,
    //         evaluate: true,
    //         expression: false,
    //     },
    //     output: {
    //         bracketize: true,
    //         beautify: true,
    //     },
    // });
    return r.code;
    // fs.writeFileSync("./vmp_out.js", r.code);
}

exports.obfuscate = obfuscate;
const {UglifyJS} = require('./uglify_es.js');
var r = UglifyJS.minify(fs.readFileSync("./vmp_out.js") + '', {
        compress: {
            drop_debugger: false,
            hoist_vars: false,
            join_vars: false,
            sequences: false,
            inline: false,
            loops: false,
            reduce_funcs: false,
            reduce_vars: false,
            collapse_vars: false,
            comparisons: false,
            computed_props: false,
            conditionals: true,
            evaluate: true,
            expression: false,
        },
        output: {
            bracketize: true,
            beautify: true,
        },
    });
fs.writeFileSync("./vmp.js", r.code);