---
title: "Gatsbyでブログ初め"
path: "start-blog-with-gatsby"
date: "2022-01-23"
update: ""
hero_image: "./andy-holmes-rCbdp8VCYhQ-unsplash.jpg"
hero_image_alt: "universe"
hero_image_credit_text: "Andy Holmes"
hero_image_credit_link: "https://unsplash.com/photos/rCbdp8VCYhQ"
tags: [Gatsby]
---

## ブログを始めてみました
2022年の目標の１つに、「ブログを始めて毎月投稿する」という目標があったので、早速ブログを始めました。
本当は、まだまだ改善したい部分が多い状態なのですが、このままでは１本も記事を書けないまま1月が終わってしまうので、最低限のところで妥協して公開することにしました。
これから
- prism導入でシンタックスハイライトを効かせる
- さくらVPSでのホスト
- 自前検索エンジン実装(今年の目標)
- i18n対応

などなど、順次実装して記事にしていけたらと思っています。

今回は初回なので、ブログを始めた理由＆Gatsbyを使ってみて面白かった箇所、覚えておきたい箇所など中心にご紹介できたらと思います。

さて、はてぶ, qiita, zenn, note, mediumなど無料で便利なサービスがたくさんある中で、わざわざお金がかかる方法でブログを運営しようと思った理由は以下３つです。

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

## Gatsbyでブログを構築
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
しかし、今回は真心込めてMaterial-UIなどのUI Componentは使わずに手作りのCSSを書き、configファイルも１から書いてブログを構築することにしました。
チュートリアルの日本語訳や、ブログを１から構築する方法などは他の方もブログなどで沢山紹介してくださっているので、今回は自分が気になった箇所を中心に紹介できればと考えています。

### Linkタグとaタグの使い分け
Gatsbyが提供するコンポーネントに`<Link>`があります。用途はHTMLの `<a>`タグと同じなのですが、Linkコンポーネントを活用すると、preloadingという機能が効いて、マウスをホバーしたorスクロールでリンクがビューに現れたタイミングでリクエストが送られるので、ユーザーが実際にリンクをクリックした際に高速でロードすることができる優れものです。ただし、ホストしているサイトと同一サイト内でしかLinkタグは使えないので、外部サイトのリンクをおきたい場合には通常通りaタグを使うことになります。

>The Gatsby Link component provides a performance feature called preloading. This means that the resources for the linked page are requested when the link scrolls into view or when the mouse hovers on it. That way, when the user actually clicks on the link, the new page can load super quickly.
Use the Link component for linking between pages within your site. For external links to pages not created by your Gatsby site, use the regular HTML `<a>` tag.

https://www.gatsbyjs.com/docs/tutorial/part-2/#use-the-link-component


### CSS Modules
チュートリアルによると、特にスタイリングに活用する手法に縛りはないようですが、デフォルトでセットアップ不要で活用することができるCSS Modulesを採用しました。
その他の選定理由としては、
- `content-title`のようなクラス名を扱いたい場合に、cssファイル内では `content-title`とケバブケースで記述しつつ、js/tsファイル内では`contentTitle`とキャメルケースで書くこともできるので、記法を統一できて良い
- ほぼ静的なコンテンツなので、状態によってスタイリングを変えたいということはほぼないため、CSS in JSである必要性があまりない
>Gatsby isn’t strict about what styling approach you use. You can pick whatever system you’re most comfortable with.

https://www.gatsbyjs.com/docs/tutorial/part-2/#style-components-with-css-modules

### GraphQLとdata layer
GraphQLは今回初めて触りました。チュートリアルで紹介されているレベルのことであればすぐ扱えるようになりますが、まだまだ理解は浅いのでこれから深めていきたいところです。
(ここで紹介されている図)[https://www.gatsbyjs.com/docs/tutorial/part-4/#meet-gatsbys-graphql-data-layer]がイメージつきやすいですが、GraphQLでは基本的に data layerに入っているデータに対して、クエリを発行してデータを取得することができる仕組みになっています。GatsbyはデフォルトでGraphQLをサポートしているので、最初から data layerに入っているデータは何もせずそのまま取得してくることができますが、例えば外部APIからデータを取得したい場合や任意のフォルダ内においたmarkdownファイルを取得したい場合などには、それらのファイルをdata layerに追加してやる必要があります。一度data layerに追加さえしてしまえば、基本的には同じ構文でGraphQLのクエリを発行することができるので便利です。
今回はmarkdownファイルをdata layerに追加したかったため、 `gatsby-source-filesystem`プラグインを活用しました。パッケージをインストールしたのちに、`gatsby-config.js`ファイルに以下設定を追加します。これでdata layerに対して、ルートディレクトリ直下においたblogディレクトリの中身が追加されました。
```javascript
module.exports = {
  ...,
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: `blog`,
        path: `${__dirname}/blog`,
      }
    },
  ],
};
```
<br/>
コンポーネント内でGraphQLを活用する際には、pageフォルダ配下においたpage componentとそれ以外のblock component（pageフォルダ配下以外においたコンポーネント）とで書き方が異なっており、page component内においては、コンポーネントの外で以下のようにgraphqlタグをつけたクエリをエクスポートして、コンポーネントに`props`として渡して活用します。

```js
// page query sample
export const query = graphql`
  query BlogPost($id: String) {
    mdx(id: { eq: $id }) {
      body
      frontmatter {
        title
        date
        hero_image_alt
        hero_image_credit_link
        hero_image_credit_text
        hero_image {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
`;
```

一方、block componentからdata layerにアクセスするためには、`useStaticQuery`を活用します。。`useStaticQuery`は、コンポーネント内部で定義してfetchしたデータをそのままコンポーネント内部で活用することができます。注意点として、`useStaticQuery`は１つのコンポーネントで1回しか呼び出すことができないので、複数種類のデータを取得したい場合には一気に全てのデータを取得する必要があります。
<br/>

また、`GraphQL` においては、クエリに名前をつけることが可能で、上の例だとBlogPostがクエリ名に当たります。クエリ名はつけてもつけなくてもOKなのですが、デバックの際にはクエリ名があった方がどのクエリで問題が発生しているのかわかって便利ということです。ただ、１点注意する必要がある点としては、クエリ名には重複があってはいけないので、注意が必要です。
<br/>

GraphQLの面白い仕組みだなと思ったことの一つに、`query variable`という仕組みがあります。上にあげたサンプルだと、`$id: String`の部分がそうで、page component内でしか活用することができない仕組みですが、動的にデータを取得したい場合には強力な仕組みです。
特に、[File System Route API](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/)を活用する際に便利で、今回ブログを作成するにあたってもこの機能を活用しました。File System Route APIは名前そのままですが、ブログ投稿のように動的に決定するページを作成したいときに活用するAPIです。`src/pages`配下に `{nodeType.field}.tsx`のファイル名で動的にpathを変えてコンテンツを作成していくことが可能です。
今回私のケースでは、`{mdx.slug}.tsx`ファイルで各ブログポストのページを作成する際に活用しています。
File System Route APIを活用する際のポイントとして、ファイル名を生成する際に指定した項目（今回だとmdx.slug）のidが自動的にpropsとしてコンポーネントに渡され、それをそのままGraphQLのクエリ内で活用することができる点が挙げられます。この機能のおかげで、サンプルのクエリにおいて、idを特に何も渡さなくても自動でmdx.slugのidがクエリに渡され、データを抽出してくることが可能になっています。
確認で、ローカルサーバーを立ち上げた状態で`http://localhost:8000/___graphql`を開いてみます。`http://localhost:8000/___graphql`はGraphQLのクエリサンドボックスとして活用することができる環境で、ローカルサーバーを立ち上げると自動で活用可能になります。
画面上で、以下のクエリを書いて実行ボタンを押すと
```sql
query MyQuery {
  allMdx {
    nodes {
      slug
    }
  }
}
```
以下のような結果が表示されるかと思います。
これは、allMdx nodeの slug fieldを抽出したクエリなので、`gatsby-config.js`ファイル内で設定した`` path: `${__dirname}/blog`, ``直下のファイルorフォルダ名が抽出されています。
```sql
{
  "data": {
    "allMdx": {
      "nodes": [
        {
          "slug": "my-first-post/"
        },
        {
          "slug": "another-post/"
        },
        {
          "slug": "card-check-post/"
        },
        {
          "slug": "second-post/"
        },
        {
          "slug": "start-blog-with-gatsby/"
        }
      ]
    }
  },
  "extensions": {}
}
```

つまり、`{mdx.slug}.tsx`で使用している`mdx.slug`の部分はこれら１つ１つのフォルダ名に対応しており、それらに対してidが自動で振られる。そしてそのidを動的にクエリを生成する際に活用する。というのがポイントでした。

検証として、`{mdx.slug}.tsx`内で、`console.log(props)`と入れてみると、ブラウザのデベロッパーツールで、以下のようなオブジェクトを確認できるかと思います。
```javascript
Object {
  ...
  pageContext:
  id: "696420da-1d54-5203-afc5-521c6df57e5d"
  slug: "start-blog-with-gatsby/"
  __params: {slug: 'start-blog-with-gatsby'}
  [[Prototype]]: Object
}
```

この、pageContextに入っている情報が、File System Route APIを活用した際に自動で付与される情報で、query variableとして活用可能なデータです。今回の場合だとid以外にslugもquery variableとして活用可能ということですね。

### .mdで記事を書きたい
今回Gatsbyでブログを作成していますが、今後ブログサイト自体を作り直すことがあると思います。その際に、パッケージやフレームワーク固有の記法を使ってしまうと移行作業が大変なので、.md形式で記事は書いていくことにしました。

そこで問題になるのが、.mdファイルをmdxでHTMLに変換した際のスタイル。デフォルトのままだと、行間やフォントがかっこよくありません。
本当は、`gatsby-remark-prismjs`プラグインを入れてシンタックスハイライトも効かせたい、しかし、どうやらtokenizeが失敗しているようで、[ドキュメント](https://www.gatsbyjs.com/plugins/gatsby-remark-prismjs/)通りに設定してもシンタックスハイライトが効きません。本当は設定し切ってからブログサイトをデプロイしたかったのですが、期限が迫ってきているのでここは一旦パスします。
取りいぞぎ、ヘッダーやコードブロック、インラインコード、クオートなど最低限だけCSSを追記してスタイリングして次に進むことにしました。
`gatsby-remark-prismjs`の導入は今後の改善でやっていきたいと思います。

## これからやること
本ブログはまだまだ改善ポイントが山盛りです。
最低限、以下項目はシャシャッと実装して、
- faviconの設定
- prismjsを設定してシンタックスハイライトを効かせる
- 目次の追加
- CI/CD環境の整備
- リファクタリング

検索機能などをもう少しゆったり追加していけたらいいかなと思っています。

ちなみに、本ブログはさくらVPSでホストしているので、次回はそのことについて書けたらと思います。
OSはさくらVPSで選択できるものだと最新のCentOS Stream 9で構築したのですが、rootユーザーのパスワードログインがデフォルトでできなくなっていること、よく紹介されているツールで非対応のものがまだあることなど、他のバージョンのCentOSとは異なる部分がいくつかあったので少し手こずりました。