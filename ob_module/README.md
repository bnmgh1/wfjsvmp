#  JavaScript混淆

## 使用须知
1.逗号混淆和控制流不要一起使用,逗号混淆有点问题.而且逗号混淆之后,在使用控制流就变成只有一行了,没什么用...

2.对方法调用进行花指令,需要先调用changeAccess改变对象访问方式. console.log => console["log"]

3.都是bug...后续重写吧
## 作用域玩的好,变量重复的使用更具迷惑性

## 一些想法
情况一

var a = document.getElementById('a');
a.innerHTML = 'hello world';

(function(a, b, c, d, e, f){
    a[d] = a[b][c](d);
    a[d][e]=f;
})(this, 'document', 'getElementById', 'a', 'innerHTML', 'hello world');


! function(n) {
    ! function(n, t, r, u, i, o, c) {
        n[r] = n[i][u](r), n[r][o] = c
    }(this, void 0,
        n(0),
        n(1, 2, 3, 4, 5, 2, 6, 2, 7, 3, 8, 9, 10, 11),
        n(11, 12, 13, 14, 6, 2, 7, 3),
        n(15, 7, 7, 2, 16, 17, 18, 19, 20),
        n(21, 2, 5, 5, 12, 22, 23, 12, 16, 5, 11)
    )
}(function(n) {
    return function() {
        for (var t = arguments, r = "", u = 0, i = t.length; i > u; u++)
            r += n[t[u]];
        return r
    }
}([
    "a", "g", "e", "t", "E",
    "l", "m", "n", "B", "y",
    "I", "d", "o", "c", "u",
    "i", "r", "H", "T", "M",
    "L", "h", " ", "w"
]));

情况二

