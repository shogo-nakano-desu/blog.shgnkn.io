---
title: "PrismJSでSyntax Highlight"
path: "syntax-highlight-with-prismjs"
date: "2022-01-30"
update: ""
hero_image: "./christopher-robin-ebbinghaus-pgSkeh0yl8o-unsplash.jpg"
hero_image_alt: "code editor"
hero_image_credit_text: "Christopher Robin Ebbinghaus"
hero_image_credit_link: "https://unsplash.com/photos/pgSkeh0yl8o"
tags: [prismjs, frontend]
---

最初にブログを作成した際にも、[gatsby-remark-prismjs](https://www.gatsbyjs.com/plugins/gatsby-remark-prismjs/)を参考にPrismJSを入れようとしたのですがうまくいかず、この時点で、tokenizeができていないんだなー。ということだけは分かっていたのですが、どうしたら良いのかわからずとりあえずリリースを優先させるために最低限で凌いでいました。
しかし、やはりエディタのようなSyntax Highlightが効いていないとコードが読みにくいよね。ということで、PrismJSを入れ直しました。

## gatsby-node.js
```javascript
// ./gatsby-node.js
import { createFilePath } from "gatsby-source-filesystem";
import path from "path";

export const onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === "Mdx") {
    const value = createFilePath({ node, getNode });

    createNodeField({
      name: "slug",
      node,
      value: `${value}`,
    });
  }
};

export const createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      allMdx {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('ERROR: Loading "createPages" query');
  }

  const posts = result.data.allMdx.edges;

  posts.forEach(({ node }) => {
    createPage({
      path: node.fields.slug.replace("/blog/", ""),
      component: path.resolve(`./src/templates/post.tsx`),
      context: { id: node.id },
    });
  });
};
```
まずは今回の肝になる `gatsby-node.js`についてです。
`gatsby-node.js`内に書いたコードはビルドが走る際に１度だけ実行されます。
今回の例だと、onCreateNodeで`.md`ファイルをFile nodesとしてdata layerに追加して、それらを、createPagesで`./src/pages/{mdx.slug}.tsx`に渡しています。

マークダウンファイルをそのままHTMLファイルに変換するだけであれば、`"gatsby-plugin-mdx"`プラグインを使えば`gatsby-node.js`ファイルを作成しないでも、`./src/pages/`配下に`{mdx.slug}.tsx`のようなファイルを作成して動的にページを生成すればいいだなので話は簡単です。

しかし、シンタックスハイライトを効かせるためにはコード内の単語や記号１つずつそれぞれに対して適切なCSSを効かせる必要があります。

試しに、私のブログでdevtoolsを開いてコードブロック内のCSSを確認してみていただくと確認できますが、コード内の単語が１つづつ`<span>`タグで切られて、
```html
<span class="token comment">// ./gatsby-node.js</span>
<span class="token keyword">import</span>
<span class="token punctuation">{</span>
```
のような形になっているかと思います。

実現する流れとしては、以下の順番で処理していく必要があるのですが、この役割をPrismJSが担っているわけです。

1.  マークダウンをtokenに変換
2.  それぞれのtokenに対して適切なクラスを設定
3.  HTMLに変換

`gatsby-remark-prismjs`プラグインのソースコードまで潜って確認できていないので、どの時点でtokenizeがなされているのか定かではないのですが、おそらく、createPageでページを生成した際に`gatsby-remark-prismjs`プラグインが走るようになっているのではないかなー。と想像しています。

そのため、createPageをしないで、`{mdx.slug}.tsx`内で直接`MdxProvider`と`MdxRenderer`を使ってマークダウンファイルからHTMLファイルへの変換を行った場合にはtokenizeがなされず、シンタックスハイライトのCSSを効かせることができませんでした。

という事情があり、今回は`./gatsby-node.js`ファイルで動的にGatsby Node APIを使いつつ動的にページを生成して、そのタイミングでPrismJSを動かすことでtokenizeも行うことができるようにしています。（それぞれのタイミングはしっかり理解できていないので、どこかでちゃんと調査したいところです。）

## ./src/templates/post.tsxの作成
createPageでせっかくページを生成するようにしたので、`./src/pages/{mdx.slug}.tsx`はやめて、`./src/templates`ディレクトリ配下に生成したデータをラップするためのコンポーネントを作成していきます。

フォルダ構成は[Gatsby Project Structure](https://www.gatsbyjs.com/docs/reference/gatsby-project-structure/)を参考にしました。

ファイルの中身とやっていることは何も変えておらず、`gatsby-node.js`ファイルで生成したidを`./templates/post.tsx`ファイルに渡して動的にクエリを生成しているだけです。

`./src/pages/{mdx.slug}.tsx`ファイルでは、GraphQLクエリの中で自動的にidが付与されており活用することができていましたが、`./templates/`配下では自動的にidが使える状態にあるわけではないようで、contextで渡してやる必要がありました。

## gatsby-config.js
```javascript
{
  resolve: "gatsby-plugin-mdx",
  options: {
    gatsbyRemarkPlugins: [
      {
        resolve: `gatsby-remark-prismjs`,
      },
    ],
    extensions: [`.md`, `.mdx`],
  },
},
```
[gatsby-remark-prismjs](https://www.gatsbyjs.com/plugins/gatsby-remark-prismjs/)を参考に、上記のような設定を`gatsby-config.js`に入れます。
これは最低限の設定なので、任意でオプションは追加していけばいいと思います。

## cssの設定
ここまできたら、あとは`./gatsby-browser.js`でprismjsのcssテンプレートを読み込めばOKです。
[prism-themes](https://github.com/PrismJS/prism/tree/master/themes)がたくさんあるので、この中から好きなものを選んで、以下のようにインポートすればシンタックスハイライトが効くようになっているはずです。
```javascript
//./gatsby-browser.js
import "prismjs/themes/prism-solarizedlight.css"
```

私はシンタックスハイライトの色を少し変えたかったので、`./src/styles/prism-vsc-dark.css`ファイルを作成して、一部cssを書き換えて活用することにしました。

<br/>
シンタックスハイライトも効くようになって、やっとブログっぽくなってきました。
次回は目次を追加していきたいと思います。
