# WGo.js 実装ガイド - 碁盤インターフェース構築の完全解説

## 目次

1. [WGo.js概要](#1-wgojs概要)
2. [基本的な碁盤表示](#2-基本的な碁盤表示)
3. [SGF棋譜の読み込みと表示](#3-sgf棋譜の読み込みと表示)
4. [標準マーカーの使用方法](#4-標準マーカーの使用方法)
5. [投票数・数値の表示実装](#5-投票数数値の表示実装)
6. [投票数による色分け実装](#6-投票数による色分け実装)
7. [カスタム描画ハンドラの実装](#7-カスタム描画ハンドラの実装)
8. [WGo.jsの内部構造と高度なカスタマイズ](#8-wgojsの内部構造と高度なカスタマイズ)
9. [碁盤の座標表示](#9-碁盤の座標表示)
10. [実践的な実装例](#10-実践的な実装例)
11. [まとめ](#11-まとめ)

---

## 1. WGo.js概要

WGo.jsは、Web上で囲碁の盤面を表示・操作するためのJavaScriptライブラリです。主に以下の機能を提供します：

- 碁盤の描画・レンダリング
- SGF棋譜の読み込み・表示
- インタラクティブな石の配置
- 各種マーカーの表示
- カスタム描画機能

公式ドキュメント: [wgo.waltheri.net](https://wgo.waltheri.net)

---

## 2. 基本的な碁盤表示

### 2.1 WGo.Boardオブジェクトによる盤上描画

WGo.jsでは碁盤上の各交点に対してオブジェクト（石やマーカー）を配置し、カスタムの描画を行うことができます。これを利用すれば、あらかじめ用意した投票結果データ（各座標の票数）に基づいて、盤上にその票数をテキストとして重ねて表示可能です。

### 2.2 基本的な盤面の初期化

```javascript
// WGo.Boardオブジェクトの初期化（19路盤、幅600pxの例）
var board = new WGo.Board(document.getElementById("board"), { 
    width: 600    // 盤面の幅を指定
});
```

### 2.3 石の配置

```javascript
// 黒石を(3,3)に配置
board.addObject({ x: 3, y: 3, c: WGo.B });

// 白石を(4,4)に配置
board.addObject({ x: 4, y: 4, c: WGo.W });
```

---

## 3. SGF棋譜の読み込みと表示

### 3.1 SGFを読み込んだ碁盤表示

WGo.jsにはSGF棋譜を簡単に表示するためのプレイヤー機能があります。例えば、SGFファイルから碁盤を表示するには、**WGo.BasicPlayer**を使って以下のように初期化できます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）：

```javascript
var player = new WGo.BasicPlayer(element, {
    sgfFile: "game.sgf"    // SGFファイルまたはSGF文字列を指定
});
```

上記のようにSGFファイル（またはSGF文字列）を指定することで、碁盤上に対局の再現が行われます。

### 3.2 BasicPlayerの構成要素

WGo.BasicPlayerはデフォルトで以下のUIコンポーネントを持ち、レイアウトも簡単にカスタマイズ可能です（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）：

- **情報表示（InfoBox）**: 対局情報の表示
- **コメント表示（CommentBox）**: 棋譜のコメント表示
- **操作ボタン（Control）**: 前後の手順操作

今回は着手点ごとの独自インタラクションを実装するため、碁盤描画とインタラクション部分を中心にWGoの機能を活用します。

### 3.3 BasicPlayerからの碁盤操作

```javascript
// BasicPlayer経由で盤を操作
player.board.addObject({ x: 3, y: 3, type: "LB", text: "A" });
```

BasicPlayer経由で盤を操作している場合は、`player.board.addObject()`を使って上記と同じようにオブジェクトを追加できます（[参考: github.com](https://github.com)）。

例えば対局進行ごとに自動で更新したい場合は、BasicPlayerにupdateイベントリスナーを追加し、その中で現在の手番の候補手に対してラベルを配置することもできます（[参考: github.com](https://github.com)）。

---

## 4. 標準マーカーの使用方法

### 4.1 標準マーカーの種類

WGo.jsには標準でいくつかのマーカー描画ハンドラが用意されており、例えば：

- **"LB"**: ラベル（任意の文字列を表示するマーカー）（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）
- **"TR"**: 三角形マーカー（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）
- **"SQ"**: 四角形マーカー（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）
- **"CR"**: 丸印マーカー（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）

これらは`WGo.Board.drawHandlers`として定義されています（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

### 4.2 ラベルマーカー（LB）の使用例

WGo.jsにはデフォルトでいくつかのマーカー描画ハンドラが用意されており、**"LB"**をタイプに指定するとラベル（文字列）が描画されます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

ラベルマーカー"LB"を使うと、指定した交点にテキスト（文字列）を表示できます。例えば、黒石の上に「A」というラベルを重ねて配置するには以下のようにします（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）:

```javascript
// 基本的なラベル表示
board.addObject({ x: 3, y: 3, type: "LB", text: "A" });

// 石の上にラベルを重ねる
board.addObject([
    {x: 3, y: 3, c: WGo.B},               // 黒石を配置
    {x: 3, y: 3, type: "LB", text: "A"}   // 同じ座標にラベル "A" を重ねる
]);
```

上記のように配列で2つのオブジェクト（石とラベル）を渡すことで、石の上にラベルが重ねて描画されます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

このように、`type: "LB"`と`text`プロパティを指定することで番号や文字付きのマークを配置できます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

### 4.3 その他のマーカー

```javascript
// 三角形マーカー
board.addObject({ x: 4, y: 4, type: "TR" });

// 四角形マーカー
board.addObject({ x: 5, y: 5, type: "SQ" });

// 丸印マーカー
board.addObject({ x: 6, y: 6, type: "CR" });
```

---

## 5. 投票数・数値の表示実装

### 5.1 ラベルマーカー ("LB") を使用した票数の表示

このラベル機能を使って各交点の票数を表示します。ポイントは石の上にテキストを重ねることですが、WGo.jsでは一つの交点に複数のオブジェクトを追加できるため、同じ座標に「石」と「テキストラベル」を順に追加すれば実現できます。

この仕組みを応用し、票数を表示したい交点それぞれに対して「石＋票数ラベル」のオブジェクトを追加していけばよいわけです。ラベルのテキストには票数に相当する数字（文字列）を指定します。例えば`text: "12"`のように指定すれば、その交点の石上に「12」という数字が表示されます。

### 5.2 投票数の常時表示

投票結果の数値を盤上に常時表示するには、ラベルマーカー（LB）を使用します。

```javascript
// 投票結果データの例
var votes = [
    { x: 3,  y: 4,  votes: 12 },   // 例: (D,16)の交点に12票
    { x: 10, y: 10, votes: 5  },   // 例: (K,9) の交点に5票
    { x: 15, y: 16, votes: 8  }    // 例: (P,4) の交点に8票
];

// 各投票データに対して石とラベルを配置
votes.forEach(v => {
    board.addObject({ x: v.x, y: v.y, c: WGo.B });                        // 黒石を配置
    board.addObject({ x: v.x, y: v.y, type: "LB", text: String(v.votes) }); // 票数ラベルを配置
});
```

### 5.3 常時表示の特徴

常時表示についても問題ありません。`board.addObject()`で追加されたオブジェクトは、ユーザーのクリック等に依存せず盤上に表示されます。明示的に削除しない限り（`board.removeObject()`や`board.removeAllObjects()`を呼ばない限り）、そのまま盤上に残り続けるため、投票結果を常時可視化できます。

また、投票データは配列などにまとめておき、初期化時にループで順次追加すれば自動的に全て表示されます。

- `board.addObject()`で追加されたオブジェクトは、明示的に削除するまで盤上に表示されます
- ユーザーの操作に依存せず、自動的に表示され続けます
- 複数のオブジェクトを同じ座標に重ねて配置できます

> **注:** `board.addObject()`メソッドはオブジェクト配列も受け取れるため、本来は複数のオブジェクトをまとめて一度に追加することも可能です（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。実装上は簡潔さのため、各交点ごとに石とラベルをペアで追加する方法でも構いません。

### 5.4 コード実装例

以下に、投票結果データを用いて盤上に票数を表示する具体的なコード例を示します。各交点に黒石を置き、その上に票数を表すラベルを重ねる実装になっています。

```html
<!-- WGo.jsのスクリプトを読み込み -->
<script src="wgo/wgo.js"></script>

<!-- 碁盤を表示する要素 -->
<div id="board"></div>

<script>
  // 1. WGo.Boardオブジェクトの初期化（19路盤、幅600pxの例）
  var board = new WGo.Board(document.getElementById("board"), { width: 600 });
  
  // 2. 投票結果データの用意（例として x,y 座標と票数votesの配列）
  var votes = [
    { x: 3,  y: 4,  votes: 12 },   // 例: (D,16)の交点に12票
    { x: 10, y: 10, votes: 5  },   // 例: (K,9) の交点に5票
    // ... 他のデータ
  ];
  
  // 3. 各データに対して石とラベルを盤上に追加
  votes.forEach(v => {
    board.addObject({ x: v.x, y: v.y, c: WGo.B });                   // 黒石を配置 (必要に応じ白なら WGo.W)
    board.addObject({ x: v.x, y: v.y, type: "LB", text: String(v.votes) });  // 石と同座標に票数ラベルを配置
  });
</script>
```

上記コードでは、まず盤を生成した後、`votes`配列に定義した各座標について`board.addObject()`を2回呼び出しています。

1. **1回目**: 石オブジェクト（`c: WGo.B`は黒石）を配置
2. **2回目**: ラベルオブジェクト（`type: "LB"`）を配置して票数テキストを描画

これにより、該当の交点に黒石が置かれ、その上に票数が数字として表示されます。結果として、配列に含まれる全ての交点について投票数が盤上に常時表示されます。

---

## 6. 投票数による色分け実装

### 6.1 色分け実装方法

色分けについては、投票数に応じて背景色を変える必要があります。デフォルトの"LB"マーカーでは背景色は固定（石の有無や色に応じて自動調整）となります。

投票数による色分けを行うには、次のいずれかの方法が考えられます：

### 6.2 方法1: マーカーの重ね合わせ

WGo.jsの既存マーカーと組み合わせて背景を表現する方法です。

例えば、丸印マーカー"CR"や塗りつぶし四角マーカー"SL"（選択点）を併用し、それらの色を投票数に応じて変化させ、その上に"LB"ラベルを重ねる手があります。

**注意**: 残念ながら既存マーカーの色を直接指定する簡単なプロパティはありません（`c: WGo.B`や`WGo.W`で黒白切り替え程度）ので、この方法を取る場合はカスタム描画ハンドラを用いる必要があります。

### 6.3 方法2: カスタム描画ハンドラの利用（推奨）

WGo.jsは独自の描画処理（カスタムマーカー）を定義する仕組みを提供しています（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

`WGo.Board.DrawHandler`インターフェースに則ったオブジェクトを用意し、`board.addObject`で`type`にそのオブジェクトを指定すると、自前の描画コードでマーカーを描くことができます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

### 6.4 公式チュートリアルの例

WGo公式チュートリアルでは飛行機のアイコンを描くカスタムマーカーの例が紹介されています（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

この例では、Canvasの描画コンテキストを使い、指定座標に線を描画するハンドラを定義し、それを`plane`オブジェクトとして`board.addObject({x, y, type: plane})`で配置しています（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

### 6.5 最適解: 投票数に応じた色付き番号マーカー

投票数に応じた色付き番号マーカーは、**カスタム描画ハンドラで実装するのが柔軟で確実**です。

具体的には、以下のような手順になります：

#### 実装手順

1. **色決定関数の用意**
   - 投票数から背景色を決定する関数を用意します
   - 例：値が少なければ緑系、多ければ赤系に補色していくなど

2. **カスタムDrawHandlerオブジェクトの作成**
   `draw`関数内で以下を実装：
   - `board.getX(x)`, `board.getY(y)`で交点のキャンバス座標を取得
   - `CanvasRenderingContext2D`のAPI（`fillStyle`, `beginPath`, `arc` 等）で円や四角を描いて指定色で塗りつぶす
   - さらにその中央にテキストを描画する（`fillText`を使用し、`textAlign="center"`, `textBaseline="middle"`を指定すると交点中心に描きやすいです）
   - テキスト色は背景色に応じて黒または白など見やすい色を選択

3. **マーカー配置**
   - 上記ハンドラを使用して`board.addObject`でマーカー配置
   - 例：`{x:3, y:3, type: voteMarker, text: "12"}`のように、必要なら`text`も`args`経由で渡せます

このカスタムマーカー`voteMarker`を使えば、投票数に応じた色付き番号を盤上の任意の点に表示できます。

WGo.jsのAPIは柔軟で、カスタムオブジェクトでも`text`など任意のパラメータを`args`に含めて扱えます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

### 6.6 参考事例

💡 **参考**: Waltheri氏の「パターン検索」サイト（Go Pattern Search）では、類似の手法でプロ棋譜データベース中の着手頻度を盤上に円の大きさや色で可視化しています。

WGo.jsの作者自身がこうした拡張例を示していることからも、**カスタム描画で着手点を色分け表示するのはWGo.jsの想定する使い方**と言えます。

---

## 7. カスタム描画ハンドラの実装

### 7.1 カスタム描画ハンドラの必要性

標準マーカーでは対応できない以下のような要件では、カスタム描画ハンドラが必要です：

- 投票数に応じた色分け表示
- 特殊な形状のマーカー
- 複雑な描画処理

### 7.2 カスタム描画ハンドラの基本構造

```javascript
// カスタム描画ハンドラの例
var customMarker = {
    // 描画処理を定義
    draw: function(args, board) {
        var x = board.getX(args.x);  // 交点のキャンバス座標を取得
        var y = board.getY(args.y);
        var ctx = board.getContext();
        
        // カスタム描画処理を実装
        ctx.fillStyle = getColorByVotes(args.votes);  // 投票数に応じた色決定
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // テキストを描画
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(args.text, x, y);
    }
};
```

### 7.3 投票数による色分け実装

```javascript
// 投票数から色を決定する関数
function getColorByVotes(votes) {
    if (votes >= 10) return "#ff4444";      // 高票数は赤
    if (votes >= 5) return "#ffaa44";       // 中票数は橙
    return "#44aa44";                       // 低票数は緑
}

// 色付き投票数マーカーの実装
var voteMarker = {
    draw: function(args, board) {
        var x = board.getX(args.x);
        var y = board.getY(args.y);
        var ctx = board.getContext();
        
        // 背景円の描画
        ctx.fillStyle = getColorByVotes(args.votes);
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 投票数テキストの描画
        ctx.fillStyle = "white";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(args.votes, x, y);
    }
};

// カスタムマーカーの使用
board.addObject({ x: 3, y: 3, type: voteMarker, votes: 12 });
```

---

## 8. WGo.jsの内部構造と高度なカスタマイズ

### 8.1 補足: カスタム描画ハンドラやレイヤーの活用について

今回の要件は組み込みのラベル機能で十分満たせますが、WGo.jsにはより柔軟なカスタマイズ手段も用意されています。

例えば描画ハンドラ (DrawHandler) を自作して`board.addCustomObject()`で追加すれば、任意の描画を任意のレイヤーに行うことも可能です（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

### 8.2 WGo.jsの内部構造

実際、WGo.jsの内部では石やマーカーはそれぞれレイヤー分けされたCanvas上に描画されており（碁盤の線や影、石、マーカーなど）、「LB」ラベルマーカーも石の上に描画されるようになっています。

### 8.3 高度なカスタマイズ

高度なカスタマイズが必要な場合には、公式チュートリアルのように新たな描画ハンドラを定義して登録することで、独自のマーカー（例えば票数に応じて色を変える円や背景など）の描画も可能です（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

しかし、**単に数値を表示する目的であれば、上述のように既存の"LB"マーカーを使う方法が最も簡便です**。実装も短く済み、WGo.jsの内部APIで完結するため既存コード（例: Claude Code生成のプログラム）にも統合しやすいでしょう。

---

## 9. 碁盤の座標表示

### 9.1 WGo.jsでの座標表示について

WGo.jsの標準ライブラリでは、囲碁の盤面に座標（横方向のA～Tの英字※I抜き、縦方向の1～19の数字）を表示する機能はデフォルトでは有効になっていません。しかし、WGo.Boardクラスのカスタム描画機能を使うことで、碁盤の上下左右に座標ラベルを表示できます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

### 9.2 カスタム描画ハンドラで座標を描画する

WGo.jsでは単一の交点に紐付かない描画（盤周りの座標など）を行う場合、`board.addObject`ではなく`board.addCustomObject`メソッドを使用します（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

まずカスタム描画ハンドラ（WGo.Board.DrawHandler）を作成し、盤面のグリッド層に座標文字を描画するよう実装します（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

```javascript
// 1. 座標表示用のカスタム描画ハンドラを定義 (グリッド層に描画)
var coordinates = {
  grid: {
    draw: function(args, board) {
      // テキスト描画のスタイル設定
      this.fillStyle = "rgba(0,0,0,0.7)";    // 透明黒で文字描画
      this.textBaseline = "middle";
      this.textAlign = "center";
      this.font = board.stoneRadius + "px " + (board.font || "");
      
      // 盤外に文字を配置するための座標計算
      var xLeft   = board.getX(board.size - 0.25),  // 右端より少し右のX座標
          xRight  = board.getX(-0.75),             // 左端より少し左のX座標
          yTop    = board.getY(-0.75),             // 上端より少し上のY座標
          yBottom = board.getY(board.size - 0.25); // 下端より少し下のY座標
      
      // 全ての交点に対応する座標ラベルを描画
      for (var i = 0; i < board.size; i++) {
        // 横方向の文字(A～T)を決定（'I'を飛ばす）
        var charCode = "A".charCodeAt(0) + i;
        if (charCode >= "I".charCodeAt(0)) charCode++;             // 'I'の文字コードをスキップ
        var letter = String.fromCharCode(charCode);
        
        // 縦座標（数字）ラベルを左端と右端に描画
        var y = board.getY(i);
        this.fillText(board.size - i, xLeft,  y);                  // 左側：19,18,...1
        this.fillText(board.size - i, xRight, y);                  // 右側：19,18,...1
        
        // 横座標（英字）ラベルを上端と下端に描画
        var x = board.getX(i);
        this.fillText(letter, x, yTop);                            // 上側：A,...T（I抜き）
        this.fillText(letter, x, yBottom);                         // 下側：A,...T（I抜き）
      }
    }
  }
};
```

### 9.3 座標ラベルの描画ロジック

上記のカスタムハンドラでは、盤のサイズ（`board.size`、通常19路）に応じてループを回し、各交点に対応する座標文字を計算・描画しています。

#### 英字座標の計算
- 文字コードを利用してAから順に取得
- Iの文字に達したらコードを+1することでスキップ（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）

#### 数字座標の計算
- `board.size - i`とすることで上辺から数えて19, 18, ...1の順になるよう計算（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）

#### 描画位置の指定
- `board.getX()`および`board.getY()`を使用
- 盤外に少し余裕を持たせた座標（例えば-0.75や`board.size - 0.25`といった相対座標）を指定
- 文字が盤枠の外側に配置されるようにしています（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）

### 9.4 ボードへの適用とマージンの調整

カスタム描画ハンドラを定義したら、次にそのハンドラをボードに登録します。

```javascript
// 2. カスタム座標オブジェクトをボードに追加
board.addCustomObject(coordinates);
```

これで座標ラベルの描画処理がボードに組み込まれます。しかしそのままでは、盤のキャンバス領域外に描画される文字が切れて見えなくなる可能性があります。

### 9.5 表示余白（マージン）の設定

盤表示の余白（マージン）を広げる設定を行います。WGo.Boardでは`section`という設定オプションで盤の表示範囲（上下左右何列/行分のマージンを取るか）を指定できます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

デフォルトは全て0ですが、負の値を指定すると盤を超えて余白を増やすことが可能です（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

```javascript
var board = new WGo.Board(document.getElementById("board"), {
  width: 600,
  section: { top: -0.5, bottom: -0.5, left: -0.5, right: -0.5 }  // 3. 座標表示のため余白拡大
});
```

上記のように`section`プロパティを指定することで、盤面の上下左右にそれぞれ半マス分（0.5）の余白が追加され、ラベルがキャンバス内に収まって表示されます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

### 9.6 完全な座標表示実装例

```html
<!DOCTYPE html>
<html>
<head>
    <title>WGo.js 座標表示サンプル</title>
    <script src="wgo/wgo.js"></script>
</head>
<body>
    <div id="board"></div>
    
    <script>
        // 座標表示用のカスタム描画ハンドラ
        var coordinates = {
          grid: {
            draw: function(args, board) {
              this.fillStyle = "rgba(0,0,0,0.7)";
              this.textBaseline = "middle";
              this.textAlign = "center";
              this.font = board.stoneRadius + "px " + (board.font || "");
              
              var xLeft   = board.getX(board.size - 0.25),
                  xRight  = board.getX(-0.75),
                  yTop    = board.getY(-0.75),
                  yBottom = board.getY(board.size - 0.25);
              
              for (var i = 0; i < board.size; i++) {
                var charCode = "A".charCodeAt(0) + i;
                if (charCode >= "I".charCodeAt(0)) charCode++;
                var letter = String.fromCharCode(charCode);
                
                var y = board.getY(i);
                this.fillText(board.size - i, xLeft,  y);
                this.fillText(board.size - i, xRight, y);
                
                var x = board.getX(i);
                this.fillText(letter, x, yTop);
                this.fillText(letter, x, yBottom);
              }
            }
          }
        };
        
        // ボードの初期化（座標表示用の余白設定込み）
        var board = new WGo.Board(document.getElementById("board"), {
            width: 600,
            section: { top: -0.5, bottom: -0.5, left: -0.5, right: -0.5 }
        });
        
        // 座標表示ハンドラを追加
        board.addCustomObject(coordinates);
    </script>
</body>
</html>
```

### 9.7 バージョン間の互換性について（v1 vs v2）

WGo.jsのボード描画APIは、v1からv2への移行でも大きな変更がなく、上記のカスタム描画ハンドラ＋`addCustomObject`による座標表示の手法は両バージョンで共通して利用できます（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）。

実際、WGo.js v2（Waltheri版）のドキュメントにも`board.addCustomObject(handler, args)`メソッドが用意されており（[参考: wgo.waltheri.net](https://wgo.waltheri.net)）、v1と同様に動作します。

したがって、ここで紹介した実装はWGo.jsのバージョンを問わず高い互換性を持ち、標準的なWGo.Boardの使い方として推奨されます。

### 9.8 補足事項

- WGo.jsの上位レイヤーであるWGo.js Playerを利用している場合、座標表示に関するオプションが用意されている可能性があります
- 純粋に盤面だけを扱う場合は上述のとおり直接Canvas上に描画する実装になります
- 上記コード例をもとに実装すれば、碁盤の上下左右すべてに希望通りの座標ラベル（A〜Tおよび1〜19）を表示できます

---

## 10. 実践的な実装例

### 10.1 完全な投票数表示システム

```html
<!DOCTYPE html>
<html>
<head>
    <title>WGo.js 投票数表示システム</title>
    <script src="wgo/wgo.js"></script>
</head>
<body>
    <div id="board"></div>
    
    <script>
        // 1. 盤面の初期化
        var board = new WGo.Board(document.getElementById("board"), { 
            width: 600 
        });
        
        // 2. 投票数から色を決定
        function getColorByVotes(votes) {
            if (votes >= 15) return "#d32f2f";
            if (votes >= 10) return "#f57c00";
            if (votes >= 5) return "#fbc02d";
            return "#388e3c";
        }
        
        // 3. カスタム投票マーカーの定義
        var voteMarker = {
            draw: function(args, board) {
                var x = board.getX(args.x);
                var y = board.getY(args.y);
                var ctx = board.getContext();
                
                // 背景円
                ctx.fillStyle = getColorByVotes(args.votes);
                ctx.beginPath();
                ctx.arc(x, y, 18, 0, Math.PI * 2);
                ctx.fill();
                
                // 枠線
                ctx.strokeStyle = "#333";
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // テキスト
                ctx.fillStyle = "white";
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(args.votes, x, y);
            }
        };
        
        // 4. 投票データの表示
        var voteData = [
            { x: 3, y: 4, votes: 18 },
            { x: 10, y: 10, votes: 12 },
            { x: 15, y: 16, votes: 6 },
            { x: 5, y: 5, votes: 3 }
        ];
        
        voteData.forEach(vote => {
            board.addObject({ 
                x: vote.x, 
                y: vote.y, 
                type: voteMarker, 
                votes: vote.votes 
            });
        });
    </script>
</body>
</html>
```

### 10.2 SGF棋譜と投票数の組み合わせ

```javascript
// SGFプレイヤーと投票数表示の組み合わせ
var player = new WGo.BasicPlayer(document.getElementById("player"), {
    sgfFile: "game.sgf"
});

// 現在の盤面に投票数を表示
function displayVotes(voteData) {
    voteData.forEach(vote => {
        player.board.addObject({ 
            x: vote.x, 
            y: vote.y, 
            type: voteMarker, 
            votes: vote.votes 
        });
    });
}

// 投票数データの適用
var currentVotes = [
    { x: 3, y: 4, votes: 15 },
    { x: 10, y: 10, votes: 8 }
];

displayVotes(currentVotes);
```

---

## 11. まとめ

### 11.1 WGo.jsの描画APIによる投票結果の可視化

総じて、**WGo.jsの描画APIを用いれば、ユーザーの操作に依存しない形で盤上に常に投票結果（票数）を可視化できる実装が可能です**。

### 11.2 主要なポイント

1. **基本表示**: `WGo.Board`を使用した基本的な盤面表示
2. **SGF読み込み**: `WGo.BasicPlayer`による棋譜の表示・操作
3. **標準マーカー**: 組み込みマーカー（LB、TR、SQ、CR）の活用
4. **投票数表示**: ラベルマーカーによる数値の常時表示
5. **カスタム描画**: 独自の描画ハンドラによる高度なカスタマイズ
6. **座標表示**: カスタム描画ハンドラによる盤面座標の表示

具体的な実装では：

1. **`board.addObject()`** を使用してラベルマーカー"LB"で票数を表示
2. **同じ座標に石とラベルを重ねて配置**することで視認性を確保
3. **常時表示**が可能（明示的に削除するまで表示され続ける）
4. **投票データを配列で管理**し、ループで一括表示が可能

### 11.3 実装のベストプラクティス

- **シンプルな数値表示**: 標準の"LB"マーカーを使用
- **色分けや特殊表示**: カスタム描画ハンドラを実装
- **複数要素の重ね合わせ**: 同じ座標に複数のオブジェクトを配置
- **データ管理**: 投票データは配列で管理し、ループで一括処理
- **座標表示**: `addCustomObject`とマージン設定で盤面外の情報を表示

この方法により、囲碁アンケートサイト「いごもん」での投票結果の可視化を効率的に実装できます。

### 11.4 参考リンク

- [WGo.js公式ドキュメント](https://wgo.waltheri.net)
- [WGo.jsチュートリアル](https://wgo.waltheri.net/tutorial)
- [Waltheri氏のパターン検索サイト](https://ps.waltheri.net) - 類似実装の参考例

---

このガイドを参考に、WGo.jsを活用した囲碁関連のWebアプリケーションを効率的に開発することができます。投票数表示システムをはじめとする様々な機能を、適切な手法で実装してください。
