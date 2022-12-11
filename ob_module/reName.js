/*
将所有Identifier的name 重新混淆成一个乱七八糟的名字
a = b; => _0xadas = _0xda313;
 */
// const reNameModule = {
//     Identifier(path){
//         let _scope = path.scope;
//         _scope.rename(path.node.name,
//             _scope.generateUidIdentifier('_0x' + Math.random().toString(36).substr(7)).name)
//     }
// }

/*
小肩膀里的标识符混淆
 */
const reNameModule = {
    'Program|FunctionExpression|FunctionDeclaration'(path){
        let OwnBindingObj = {},globalBindingObj = {}, i = 0;
        path.traverse({
            Identifier(p){
                let name = p.node.name;
                let binding = p.scope.getOwnBinding(name);
                binding ? (OwnBindingObj[name] = binding) : (globalBindingObj[name] = 1)
            }
        });
        for (let oldName in OwnBindingObj){
            let scope_ = OwnBindingObj[oldName].scope;
            do {
                // var newName = _scope.generateUidIdentifier('_0x' + Math.random().toString(36).substr(7));
                var newName = '_0x2ba6op' + i++ ;
            } while (globalBindingObj[newName]);
            scope_.rename(oldName,newName);
        }
    }
}
exports.reNameModule = reNameModule;
/*
类似同盾的00oo0o 这种的
 */