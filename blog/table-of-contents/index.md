---
title: "目次を追加"
path: "table-of-contents"
date: "2022-02-04"
update: ""
hero_image: "./victoria-priessnitz-wsySj0Szfb8-unsplash.jpg"
hero_image_alt: "table"
hero_image_credit_text: "Victoria Priessnitz"
hero_image_credit_link: "https://unsplash.com/photos/wsySj0Szfb8"
tags: [gatsby, frontend]
---

QiitaやZennで好きなところは、超絶長い技術記事でも右側に固定で表示されている目次のおかげで飛びたい場所にすぐ飛べるところです。この機能がなかったら、Uhyoさんの[TypeScriptの型入門](https://qiita.com/uhyo/items/e2fdef2d3236b9bfe74a)などを辞書的に使いたいときなど結構しんどいですよね。

ということで、僕のブログもゆくゆくは超有益記事が配信されるようになるはずなので、今のうちに目次を追加しておきたいと思います。

## 構成
目次を作る際に活用できるプラグインにも色々と種類がありますが、今回は h2&h3タグにidを振って、 `[https://blog.shgnkn.io/post#h2content](https://blog.shgnkn.io/post#h2content)` のリンクを自動生成してくれる、 `[gatsby-remark-autolink-headers](https://www.gatsbyjs.com/plugins/gatsby-remark-autolink-headers/?=gatsby-remark-autolink)` プラグインを活用してリンクを生成し、各リンクをGraphQLで取得して目次を生成するようにしていきたいと思います。

目次を自動生成してくれる、 [`gatsby-remark-table-of-contents`](https://www.gatsbyjs.com/plugins/gatsby-remark-table-of-contents/) もいいなとは思ったのですが、markdownの中にコードブロックを書く際に ````toc` で書き始めてコードブロックを作ると目次になる。というのがブログの引っ越しをしたくなったときにポータビリティがないので嫌で、今回採用は見送りました。

## gatsby-remark-autolink-headersの導入

```jsx
yarn add gatsby-remark-autolink-headers
```

まずはプラグインを追加して、

```jsx
//./gatsby-config.js
plugins:[
		{
      resolve: "gatsby-plugin-mdx",
      options: {
        gatsbyRemarkPlugins: [
          `gatsby-remark-autolink-headers`,
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              prompt: {
                user: "root",
                host: "localhost",
                global: false,
              },
            },
          },
        ],
        extensions: [`.md`, `.mdx`],
      },
    },
・・・
]
```

`./gatsby-config.js` に設定を追加します。[公式](https://www.gatsbyjs.com/plugins/gatsby-remark-autolink-headers/?=gatsby-remark-autolink)では `gatsby-transformer-remark` に追加する方法で紹介されていますが、prismjsを追加したのと同様に、今回は `gatsby-plugin-mdx` に追加しています。 `gatsby-remark-prismjs` と併用する場合には、その前に `gatsby-remark-autolink-headers` を追加する必要がある。と記載があったので試してみましたが、現在はどっちの順番でも問題なく動作するようになっていました。（issueを見に行ったらすでに修正済でcloseされていました。）

> Note: if you are using `gatsby-remark-prismjs`, make sure that it’s listed after this plugin. Otherwise, you might face an issue described here: [https://github.com/gatsbyjs/gatsby/issues/5764](https://github.com/gatsbyjs/gatsby/issues/5764).
>

オプションでは、リンクを付与するタグの種類やiconなどを指定することも可能です。デフォルトではh2 / h3タグにリンクが設定されます。

## リンクの取得

これでh2タグに対してidが振られ、リンクも自動的に生成されました。次は目次に表示するために、同一ページ内にあるリンクを集めてくる必要があります。

`gatsby-remark-autolink-headers` で追加した目次は、 `tableOfContent` としてGraphQLから取得することが可能です。

```jsx
{
  "data": {
    "allMdx": {
      "edges": [
        {
          "node": {
            "tableOfContents": {
              "items": [
                {
                  "url": "#構成",
                  "title": "構成",
                  "items": [
                    {
                      "url": "#os",
                      "title": "OS"
                    },
                    {
                      "url": "#リージョン",
                      "title": "リージョン"
                    },
                    {
                      "url": "#メモリ",
                      "title": "メモリ"
                    },
                    {
                      "url": "#webサーバ",
                      "title": "Webサーバ"
                    }
                  ]
                },
```

こんな感じで、h2タグのitemsとしてh3タグのURLが入っています。

これらをコンポーネントに渡すことができるように、クエリに追加していきます。

```jsx
// src/templates/post.tsx
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
      tableOfContents {
          items
        }
      }
    }
  }
`;
```

まだ渡し先のコンポーネントが作成できていないので、作成していきます。

## toc.tsx(table-of-contents)の作成


## 余談
ちなみに、今回は目次の導入それ自体よりも、スタイリングそれ自体にかなりの時間を取られてしまいました。
Material UIなどのUIコンポーネントやTailwind CSSのようなCSSフレームワークなしで素のCSSを書いていくのはやはり難しい。。。早く「CSSわからない」までいきたいです。