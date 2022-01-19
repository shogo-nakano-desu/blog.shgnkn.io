---
title: "Gatsbyでブログ初め"
path: "start-blog-with-gatsby"
date: "2022-01-17"
update: ""
hero_image: "./andy-holmes-rCbdp8VCYhQ-unsplash.jpg"
hero_image_alt: "universe"
hero_image_credit_text: "Andy Holmes"
hero_image_credit_link: "https://unsplash.com/photos/rCbdp8VCYhQ"
---

## ブログを始めてみました
2022年の目標の１つに、「ブログを始めて毎月投稿する」という目標があったので、早速ブログを始めました。
はてぶ, qiita, zenn, note, mediumなど無料で便利なサービスがたくさんある中で、わざわざお金がかかる方法でブログを運営しようと思った理由は以下３つです。

1. かっこいい
2. アウトプットの機会を増やしたい
3. VPSでブログを運営してネットワークの知識を身につけたい

### 1. かっこいい
一番大事です。何か記事を書こうと思っても、気が進まないと筆が進みません。
自分の気分を乗せるにはかっこいいと思えることが大切です。

### 2. アウトプットの機会を増やしたい
かっこいいと似ているのですが、やはりアウトプットの機会を増やすためには何か原動力が必要です。先にあげたサービスは無料で使えるものばかりですが、無料であるが故にいつでも辞めることができてしまいます。
アウトプットするために詳細まで調べることで曖昧だった知識が明確になり、知らなかったことも知ることができることは百も承知です。しかし、自分は何かを作ることに比べ何かを書くことに対してはどうしても腰が重くなりがちなタイプです。
そこで、まずは一定初期投資をしてサンクコストを発生させることで行動するモチベーションを作り、いつの間にか習慣になるのを待つ作戦を取ることにしました。かっこよく書きましたがただの見切り発車です。
ということで、まずは新年早々高級な`.io`ドメインを取得して（3年プランで18,656円）、さくらVPS1G年間ぷらんを契約して（10,890円）、合計29,546円の納税を行いました。幸先いいスタートです。そのおかげで（？）、まだまだブログ自体の完成度を上げたい思いをグッと堪えて、記事の執筆をスタートさせることができています。

### 3. VPSでブログを運営してネットワークの知識を身につけたい
昨今はFirebaseやVercel, Herokuなど、超簡単にデプロイ可能＆個人で使う分には無料で使うことができるサービスがたくさんあります。また、業務ではAWSやGCPなどクラウドを活用することも多いでしょう。
気軽に使える反面、自分で面倒を見る必要がある部分は少ないので、内部で何が起こっているのかあまり気にせずに使えてしまうことも多いです。
そのため、エンジニアとしての基礎体力をつけたい＆読書や試験勉強などを通してかじってきたネットワークの知識を血肉としたい、でも自宅サーバーはPC買うところからだしちょっと敷居が高いということで、さくらVPSを契約してブログを運営してみることにしました。

## Gatsbyでブログを構築した方法
### Gatsbyにした理由
今回はブログを作成するということで、SPAはほぼ不要、SSGができる、できるだけ軽くて早いという条件でフレームワークを選びました。
そこで、一切使ったことがないけど気になっていたsvelteでブログを作ろう。と最初は考えたのですが、途中まで作ってからmarkdownファイルを含めたフォルダ構成と処理が気に入らず、Gatsbyに結局切り替えました。
- fsでpathを取ってくる方法
  - せっかくフレームワークを入れるならばフレームワークが提供している機能で処理したかった。
- `import.meta.glog`でファイルを取得する方法
  - `.svelte`ファイルと同一階層にmarkdownファイルを置く必要がある。
    - 自分のこだわりとして、markdownファイルは別フォルダにおいて管理したかった。
  - TypeScriptだとエラーが出てしまう（自分のTS力問題な気もしますが。。。）

また、VSCodeでの開発体験もまだイマイチで、とくに importのパスを１度間違えて、解決した後も１度エディタを落とさないとエラーが解消しない問題が多発していたことも切り替えた理由の一つです。

### 始め方
[チュートリアル](https://www.gatsbyjs.com/docs/tutorial/)をみて開発を始めました。
Gatsby公式からも、[gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog)が出ていますし、GitHub内で、「gatsby blog」と検索すると、19,792件も検索結果がヒットするので、こういったものを活用すればささっとそれっぽいブログを作成することができると思います。
しかし、今回は真心込めて手作りのCSSとconfigファイルを書いて、１からブログを構築することにしました。
チュートリアルの日本語訳や、ブログを１から構築する方法などは他の方もブログなどで沢山紹介してくださっているので、今回は自分が気になった箇所を中心に紹介できればと考えています。

### Linkタグとaタグの使い分け
Gatsbyが提供するコンポーネントに`<Link>`があります。用途はHTMLの `<a>`タグと同じなのですが、Linkコンポーネントを活用すると、preloadingという機能が効いて、マウスをホバーしたorスクロールでリンクがビューに現れたタイミングでリクエストが送られるので、ユーザーが実際にリンクをクリックした際に高速でロードすることができる優れものです。ただし、ホストしているサイトと同一サイト内でしかLinkタグは使えないので、外部サイトのリンクをおきたい場合には通常通りaタグを使うことになります。

>The Gatsby Link component provides a performance feature called preloading. This means that the resources for the linked page are requested when the link scrolls into view or when the mouse hovers on it. That way, when the user actually clicks on the link, the new page can load super quickly.
Use the Link component for linking between pages within your site. For external links to pages not created by your Gatsby site, use the regular HTML `<a>` tag.
https://www.gatsbyjs.com/docs/tutorial/part-2/#use-the-link-component


