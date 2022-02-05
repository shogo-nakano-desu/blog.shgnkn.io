---
title: "Cookieを理解する"
path: "about-cookie"
date: "2022-02-05"
update: ""
hero_image: "./.jpg"
hero_image_alt: ""
hero_image_credit_text: ""
hero_image_credit_link: ""
tags: [web,cookie]
---

今まで「Cookieってセッション管理に使うやつでしょ」とか「広告でトラッキングするのに使うあれね」ぐらいのレベルでしかCookieを理解していなかったので、一度まとめてみました。

## はじめに

今回の投稿は主に以下の情報を参考にして、自分なりにまとめて書いています。

[HTTP の概要 - HTTP | MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/Overview#http_is_stateless_but_not_sessionless)

[HTTP Cookie の使用 - HTTP | MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies)

[HTTP ヘッダー - HTTP | MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers)

[Set-Cookie - HTTP | MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Set-Cookie)

[HTTPSを使ってもCookieの改変は防げないことを実験で試してみた](https://blog.tokumaru.org/2013/09/cookie-manipulation-is-possible-even-on-ssl.html)

## なぜCookieは存在しているのか

CookieはHTTP通信を行う際に活用されていますが、HTTPのステートレス性を補完するために活用されています。

HTTPはシンプルなプロトコルですが「状態」を保有することはしておらず、そのため連続したリクエスト間で状態を保有することができません。

具体例を出すと、Webサービスにログインして会員専用サイトを見たい場合や、オンラインショッピングサイトでショッピングカートに商品を追加して、そのあと購入したい場合など、ログインした人（ブラウザ）と会員専用サイトを見ている人（ブラウザ）が同じであること、また、ショッピングカートに商品を追加した人（ブラウザ）と購入画面に進んだ人（ブラウザ）が同じであることを判断することができないのです。

これだと、アプリケーションとして機能することができないので、状態を持つためにCookieが使われています。

## いつ使うのか

**[HTTP Cookie の使用](https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies)にわかりやすい具体例が上がっているので、ここではそのまま紹介します。**

> **セッション管理**
ログイン、ショッピングカート、ゲームのスコア、またはその他のサーバーが覚えておくべきもの
**パーソナライゼーション**
ユーザー設定、テーマ、その他の設定
**トラッキング**
ユーザーの行動の記録及び分析
>

また、以前はlocalStrageやsessionStorageなど、クライアント側で活用する記憶領域の代わりに活用されていたこともあるようなのですが、現在ではそういった使い方は推奨されていないようです。

## どう使うのか

HTTPヘッダーに追加して活用します。

### 活用の流れ

Cookieを使ってセッションを管理するのであれば、どこかのタイミングでCookieを発行して、活用して、最後にはどこかのタイミングでCookieを無効化する必要があります。

1. クライアント：サーバーにリクエストを送る
2. サーバー：レスポンスでSet-Cookieヘッダーを送信する
3. クライアント：ブラウザにSet-Cookieヘッダーから送られてきたCookieを保存する
4. クライアント：同一サーバーに対してリクエストを出す際には、ブラウザに保存しているCookieをCookieヘッダーに入れて送信する
5. クライアント：Cookieの有効期限や期間が切れたら、クライアントはCookieを削除する

それぞれの詳細を見ていきます。

### Set-Cookieヘッダー

レスポンスヘッダーで活用可能で、サーバーがクライアントにCookieを送信するために使用します。

その際には以下のような形式で、名前、値の組みを作成して送信します。

```jsx
Set-Cookie: <name>=<value>
```

一度のレスポンスに複数のSet-Cookieヘッダーを含めることが可能です。

```jsx
HTTP/2.0 200 OK
Content-Type: text/html
Set-Cookie: name=shogo
Set-Cookie: id=12345
Set-Cookie: location=tokyo
・
・
・
```

Set-Cookieヘッダーの使い方はサーバーサイドのプログラミング言語毎に異なっており、例えば[Node.js](https://nodejs.org/dist/latest-v8.x/docs/api/http.html#http_response_setheader_name_value)では以下のように設定することが可能です。

```jsx
// returns content-type = text/plain
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
  res.end('ok');
});
```

また、後ほど説明するCookieの期限を表すExpire属性やアクセスを制限するSecure属性、HTTPOnly属性など様々な属性を付与することが可能です。詳細は**[Set-Cookie](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Set-Cookie)**で確認できます。

### Cookieヘッダー

Set-Cookieヘッダーでサーバーから送信されてきたCookieを、Cookieヘッダーを用いてその後のリクエストで送信します。

複数のCookieをSet-Cookieヘッダーでサーバーから受け取った場合には、クライアントはその後のリクエストで受け取った全てのCookieをCookieヘッダーを利用してサーバーに送信するようになります。

Cookieヘッダーで複数クッキーをサーバーに送信する際には、Set-Cookieヘッダーとは異なり一行に全てのCookieを記載する点に注意です。

```jsx
GET /index.html HTTP/2.0
Host: shgnkn.io
Cookie: name=shogo; id=12345; location=tokyo
```

### 持続時間の定義

Cookieには持続時間を定義することが可能です。 `Expires=<date>` もしくは `Max-Age=<number>` で指定しなかった場合には、デフォルトでセッションクッキーの寿命が適用されます。

それぞれ順番に説明していきます。

**【セッションクッキーの寿命】**

持続時間を何も指定しなかった場合に、適用される期限です。セッションはクライアントが終了した時に終了し、Cookieはその時点で削除されます。ただし、多くのブラウザはセッション復元機能という機能を持っており、ブラウザを閉じた際にも全てのタブを保存しておき、次回ブラウザを起動した際に復元することができるようになっています。

そのため、セッションクッキーの寿命を持続時間として活用する場合、永遠に寿命が来ない可能性がある点に注意する必要があります。

サーバーから一度発行してしまったCookieが残り続けてしまうことには不都合があると思うので、個人的にはセッションクッキーの寿命をそのままCookieの持続時間として活用することはしない方がいいのではないかと考えています。

**【Expires=<date>】**

<date>で指定した時刻が過ぎるとクライアントで削除されます。<date>で指定した日付は、サーバーの日時ではなく、クライアントの日時で判断される点に注意です。

つまり、Set-Cookieヘッダーで設定される際に、日時の変換は行われておらず、サーバー側で設定した日時がそのままクライアントに渡って、クライアントはクライアントの日時で判断しています。

そのため、サーバー側で現在日時+1時間などで設定すると、方法によってはその時刻がすでにクライアントにとっては過去の時刻になっていて、Cookieを受け取った瞬間に削除することになってしまう可能性がある点に注意が必要です。

**【Max-Age=<number>】**

Cookieの期限までの秒数を設定します。０またはマイナスの場合、クッキーは即期限切れとなります。

また、 `Expires=date` と `Max-Age=<number>` が両方とも設定されていた場合には、 `Max-Age=<number>` が優先されます。

## セキュリティ観点

### Cookieへのアクセス制限

Cookieにログイン情報などを載せる場合には、セキュリティ上のリスクが存在するため適切にアクセス制限をかける必要があります。例えば、通信しているCookieを覗かれてしまったり、誰かに偽造されてしまったりするリスクが考えられます。こういったリスクを抑えるために、 `Set-Cookie` でCookieを送信する際にアクセスを制限するための２つの属性を付与することが可能です。

【Secure属性】

この属性を付与していると、SSLとHTTPSプロトコルを使用してリクエストが行われた場合のみ、クライアントからサーバーにCookieを送信することが可能になります。

今ではほとんどのサイトがHTTPS化されているので少しマシになりましたが、古いサイトなどだとユーザー認証画面だけHTTPS化されていて、他の画面はHTTPのままというサイトがまだあるかと思います。そういったサイトの場合、http://~ のページにアクセスする際にもCookieを送信してしまい、平文のままCookieの中身が見えるようになってしまうので、そういったことが起こらないようにするためには、http://〜のサイトにリクエストを出す際にはCookieを送信しないようにするSecure属性を付与しておくことが大事になります。（そもそも全ページHTTPS化しようぜというところですが。。）

ただし、Secure属性を付与していても、注意点はまだあります。

1. 中間者攻撃は防ぐことができない(可能性がある)
2. JavaScriptを介してCookieにアクセスすることができてしまう

１についてはこのまま説明し、２についてはSecure属性の後に説明するHTTPOnly属性にて説明します。

1. 中間者攻撃は防ぐことができない

Secure属性で防ぐでとができるのは、あくまでも「SSLとHTTPSプロトコルが使用されていないリクエストでCookieを送信しないようにすること」です。

最新のブラウザでは改善されていると祈りたいところですが、古いブラウザだと既にSecure属性付きのCookieがあってもHTTPのSecure属性なしCookieで上書き可能だったようです。（ちゃんと調べられていないのでどのバージョンまでこの問題があるかわからないのですが、化石のようなPCを使っている人たちがまだいることを考えると、、、）

手順としては、偽アクセスポイントを作成して80番ポートへの通信が偽プロキシサーバを透過するようにしておいて、偽プロキシサーバーで全てのレスポンスにSet-Cookieヘッダを付与するようにするか、XSSなどで偽のHTTPプロトコルを用いた偽サーバーにリダイレクトさせて、そこでSet-Cookieヘッダーを付与するなどの方法があります。

Secure属性を付与することで、「SSLとHTTPSプロトコルが使用されていないリクエストでCookieを送信しないようにする」ことはできても、複数の攻撃手法を組み合わせると「偽のCookieをセットする」という攻撃は可能になってしまいます。つまり、偽造したCookieに不正なスクリプトを埋め込まれてしまうリスクなどがあるわけです。

この辺りは流れは分かったつもりでも詳細は全然分かっていないので、いつか（いつか）時間をとって一般的な攻撃手法については手元でも実験してみたい気持ちがあります。

**【HTTPOnly属性】**

Secure属性の説明で、

1. JavaScriptを介してCookieにアクセスすることができてしまう。

というリスクはSecure属性を設定していても防ぐことができない。と記載していました。

HTTPOnly属性を付与していないCookieの場合、JavaScriptの `Document.cookie` APIにアクセスすることができてしまいます。つまり、XSSなどによって不正なJavaScriptがサイトに埋め込まれており、サイトのセッションを保持するCookieにHTTPOnly属性が設定されていなかった場合、JavaScriptを介してCookieの中身が読み取られてしまうリスクがあるわけです。

セッションを保持するCookieなどはJavaScriptからアクセスできる必要性がないので、XSS攻撃などのリスクを低減するためにHTTPOnly属性を付与しておくことが推奨されています。

### Cookieの送信先の定義

Domain属性とPath属性を用いることで、Cookieを送信する対象のURLを定義することが可能です。

【Domain属性】

Domain属性では、Cookieを受信することができるホストを指定します。

Domain属性を指定していない場合、同一オリジン（オリジンについては[こちら](https://developer.mozilla.org/ja/docs/Glossary/Origin)。ざっくりいくと、サブドメイン含むURLが同じ＆ポートが同じ時に同一オリジンとみなす。）だけがCookieを受信することを許されていて、異なるサブドメインではCookieを受信することができなくなっています。

逆に、Domain属性を指定するとサブドメインを含むドメインでCookieを受信することが可能になる＝制限が緩和されます。

例えば、 `Domain=shgnkn.io` を設定すると `blog.shgnkn.io`や `[about.shgnkn.io](http://about.shgnkn.io)` 、 `shop.shgnkn.io`などの異なるサブドメイン間でCookieを共有することが可能になります。

【Path属性】

Cookie完全に理解した。