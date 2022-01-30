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
      value: `/blog${value}`,
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
      path: node.fields.slug,
      component: path.resolve(`./src/pages/{mdx.slug}.tsx`),
      context: { id: node.id },
    });
  });
};
```
まずは今回の肝になる `gatsby-node.js`についてです。
`gatsby-node.js`内に書いたコードはビルドが走る際に１度だけ実行されます。
今回の例だと、onCreateNodeで`.md`ファイルをFile nodesとしてdata layerに追加して、それらを、createPagesで`./src/pages/{mdx.slug}.tsx`に渡しています。

マークダウンファイルをそのままHTMLファイルに変換するだけであれば、`"gatsby-plugin-mdx"`プラグインを使えば話は簡単なのですが、シンタックスハイライトを効かせるためには1語ずつそれぞれに対して適切なCSSを効かせる必要があります。そのためには、

1.  マークダウンをtokenに変換
2.  それぞれのtokenに対して適切なクラスを設定
3.  HTMLに変換

という一連の処理を行って初めてシンタックスハイライトを効かせることができます。この役割をPrismJSが担っているわけです。

試しに、私のブログでdevtoolsを開いてコードブロック内のCSSを確認してみていただくと確認できますが、コード内の単語が１つづつ`<span>`タグで切られて、
```html
<span class="token comment">// ./gatsby-node.js</span>
<span class="token keyword">import</span>
<span class="token punctuation">{</span>
```
のような形になっているかと思います。

`gatsby-remark-prismjs`プラグインのソースコードまで潜って確認できていないので、どの時点でtokenizeがなされているのか定かではないのですが、おそらく、createPageでページを生成した際に`gatsby-remark-prismjs`プラグインが走るようになっているのではないかなー。と想像しています。そのため、createPageをしないで、`{mdx.slug}.tsx`内で直接`MdxProvider`と`MdxRenderer`を使ってマークダウンファイルからHTMLファイルへの変換を行った場合にはtokenizeがなされず、シンタックスハイライトのCSSを効かせることができませんでした。



＊slugも時どうで生成するようにしたので、今frontmatterにfilepath書いて取ってきているところを自動生成されたslugを活用するように変えたい。。