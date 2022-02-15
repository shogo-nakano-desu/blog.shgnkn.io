---
title: "目次を追加"
summary: "ブログに目次を追加しました。目次自体はプラグインを組み合わせるとサクッとできますが、マークダウンコンテンツを持ち運び可能にしたかったので少しだけ面倒なことをしています。"
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
目次を作る際に活用できるプラグインにも色々と種類がありますが、今回は h2&h3タグにidを振って、 https://blog.shgnkn.io/post#h2content のリンクを自動生成してくれる、 [gatsby-remark-autolink-headers](https://www.gatsbyjs.com/plugins/gatsby-remark-autolink-headers/?=gatsby-remark-autolink) プラグインを活用してリンクを生成し、各リンクをGraphQLで取得して目次を生成するようにしていきたいと思います。

目次を自動生成してくれる、 [`gatsby-remark-table-of-contents`](https://www.gatsbyjs.com/plugins/gatsby-remark-table-of-contents/) もいいなとは思ったのですが、以下２点の理由から今回は採用を見送りました。
- markdownの中にコードブロックを書く際に ```toc で書き始めてコードブロックを作ると目次になる仕様のため、ブログの引っ越しをしたくなったときにポータビリティがない
- どうしても、ブログの右側に固定して表示できるようにしたかった。

## gatsby-remark-autolink-headers導入

```jsx
yarn add gatsby-remark-autolink-headers
```

まずはプラグインを追加

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

`./gatsby-config.js` にも設定を追加します。[公式](https://www.gatsbyjs.com/plugins/gatsby-remark-autolink-headers/?=gatsby-remark-autolink)では `gatsby-transformer-remark` に追加する方法で紹介されていますが、prismjsを追加したのと同様に、今回は `gatsby-plugin-mdx` に追加しています。 `gatsby-remark-prismjs` と併用する場合には、その前に `gatsby-remark-autolink-headers` を追加する必要がある。と記載があったので試してみましたが、現在はどっちの順番でも問題なく動作するようになっていました。（issueを見に行ったらすでに修正済でcloseされていました。）

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

## toc.tsxの作成
```jsx
// ./src/components/toc.tsx
import { Link } from 'gatsby';
import React from 'react';
import * as styles from "./toc.module.css"

interface Props { contents:any,path:string}
export const Toc: React.FC<Props> = ({ contents,path }) => {
  return (
    <table className={ styles.tableContainer}>

      <ul >
        {contents.map((e: any) => {
          return(
              e.items?.length > 0 ?
              (<div >
                <li key={e.title}>
                    <Link className={ styles.tocLink} to={`/${path}/${e.url}`}>{e.title}</Link>
                </li>
                <ul>
                  {e.items.map((item: any) => {
                    return (
                      <li className={ styles.h3Tag } key={item.title}>
                        <Link className={ styles.tocLink} to={`/${path}/${item.url}`}>{item.title}</Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ): <li key={e.title}>
                    <Link className={ styles.tocLink} to={`/${path}/${e.url}`}>{e.title}</Link>
                </li>
          )
        })}
      </ul>
  </table>
);}
```

### 困っていること
今回、解決に苦しんでいるのが contentsとして渡しているプロパティの`any`型です。
 `./src/templates/post.tsx`から`Layout`コンポーネントにGraphQLでクエリした`tableOfContents`を渡して、`Layout`コンポーネント内で`Toc`コンポーネントをにバケツリレーして活用しているのですが、`./src/templates/post.tsx`でコメントアウトしている通り、`const items = tableOfContents.items`でtableOfContentsが`never`になってしまい、エラーが発生してしまっています。しかし、GraphQLコンソールで見ても、実際に`console.log()`でtableOfContentsの中身を確認してみても、前のパートで記載していた通り問題なくクエリ結果が返ってきています。

```jsx
// ./src/templates/post.tsx
import * as React from 'react';
import { graphql, PageProps } from "gatsby";
import { GatsbyImage,getImage, ImageDataLike} from "gatsby-plugin-image";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider }  from "@mdx-js/react"
import Layout from "../components/layout";
import * as styles from "./post.module.css"

const BlogPost: React.FC<PageProps<GatsbyTypes.BlogPostQuery>> = (props) => {

  const { mdx } = props.data;
  const { body, frontmatter, tableOfContents } = mdx || {}
  if (frontmatter === undefined||body === undefined || tableOfContents === undefined) {
    throw new Error(`frontmatter should be`)
  }
  const { title, path,date, hero_image_alt, hero_image_credit_link, hero_image_credit_text,hero_image } = frontmatter
  if (title === undefined ||path===undefined ||date === undefined || hero_image_alt === undefined || hero_image_credit_link === undefined || hero_image_credit_text === undefined || hero_image=== undefined) {
    throw new Error(`should be`)
  }

  // なぜtableOfContentsがneverになってしまうのかわからない。。。
  // error at items => Property 'items' does not exist on type 'never'.
  const items = tableOfContents.items
  if (items == undefined) {
    throw new Error(`should be`)
  }

  const image = getImage({...hero_image.childImageSharp} as ImageDataLike)

  if (image === undefined) {
    throw new Error(`image should be got`)
  }
  return (

    <Layout pageTitle={title} items={ items} path={ path }>

      <div>
        <h1>{title}</h1>
        <p className={ styles.date}>{ date}</p>
        <div className={ styles.photoInfo}>
            <GatsbyImage className={ styles.image}image={image} alt={hero_image_alt} />
          <p className={ styles.credit}>
            Photo Credit:{" "}
            <a href={hero_image_credit_link} className={ styles.creditLink}>
              {hero_image_credit_text}
            </a>
          </p>
        </div>
        <div className={styles.contents}>
          <MDXProvider components={{
            p: props => <p {...props} style={{ lineHeight: "2rem" }} />,
            ul: props => <ul {...props} style={{ listStyleType: "disc", listStylePosition: "inside", paddingTop:"10px", paddingBottom:"10px"}} />,
            ol: props => <ol {...props} style={{ listStylePosition: "inside", paddingTop:"10px", paddingBottom:"10px" }} />,
            li: props => <li {...props} style={{ lineHeight: "2rem", paddingLeft: "1rem" }} />,
          }}>
            <MDXRenderer>{body}</MDXRenderer>
          </MDXProvider>
        </div>
      </div>
      </Layout>

      );

};

export const query = graphql`
  query BlogPost($id: String) {
    mdx(id: { eq: $id }) {
      tableOfContents
      body
      frontmatter {
        title
        path
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

export default BlogPost;
```

これの調査は後日時間をとって試みるとして、いったん進むことはできそうなことがわかったので、心を鬼にして前に進みます。
どなたかこそっとDMくださったらとても嬉しいです。
```javascript
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
```

### Layoutに入れる
あとは作成した`Toc`コンポーネントを`Layout`コンポーネントに入れ込んで、完成です。
構成は割とサクッと完成しましたが、cssで少し苦労＆工夫しました。

```jsx
// ./src/components/layout.tsx
import * as React from 'react';
import * as styles from "./layout.module.css";
import { Header } from "./header"
import { Footer } from "./footer"
import {Toc} from "./toc"
import SEO from "./seo"


type Props = {
  pageTitle: string,
  items?: any, //tableOfContents問題と一緒に消したい
  path?:string
}

const Layout: React.FC<Props> = ({ pageTitle, items, path, children }) => {
  console.log(path)
  return (
    <>
      <SEO title={pageTitle}></SEO>
      <div className={styles.container}>
          <Header></Header>

          {path
            ?<div className={styles.wrapper}>
                <main className={styles.mainPath}>
                    {children}
                </main>
                <aside className={styles.tocContainer}><Toc contents={items} path={path} /></aside>
              </div>
            :
              <main className={styles.main}>
                {children}
              </main>
          }
          </div>
          <Footer></Footer>


    </>
  );
};

export default Layout;

```

## スタイリングする
```css
/* ./src/components/toc.module.css */
.table-container {
  border-radius: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  padding-left: 2rem;
  box-shadow: 0.2rem 0.2rem 0.2rem 0.2rem rgba(90, 90, 90, 0.1);
  width: 250px;
  height: min-content;
}

.toc-link {
  text-decoration: none;
  color: rgb(138, 142, 146);
  transition: color 0.2s;
  font-size: 1rem;
}

.toc-link:hover {
  color: rgb(31, 32, 34);
}

.h3-tag {
  margin-left: 1.5rem;
}
```
特殊なことはしていませんが、ポイントだけ記載します。

```css
height: min-content
```
目次の中身に応じてtocの高さが調整されるように設定しています。

```css
box-shadow: 0.2rem 0.2rem 0.2rem 0.2rem rgba(90, 90, 90, 0.1);
```
目次に影をつけて立体的に見えるようにします。


```css
.toc-link {
  `transition: color 0.2s;`
}
.toc-link:hover {
  color: rgb(31, 32, 34);
}
```
これで、ホバーした際に色が変わるようにしています。

```css
text-decoration: none;
```
通常のリンクとは異なり、一度クリックした箇所の色が変わったり、アンダーバーが入っていたりすると邪魔なのでそれらの装飾を打ち消します。

```css
scroll-behavior:smooth;
```
これだけは、`gatsby-browser.js`で読み込んでいるグローバルCSSの`html`要素に対して設定しています。同一ページ内で遷移するリンクをクリックした際に、するするっとスムーズにスクロールしたかのように画面遷移します。

## 余談
ちなみに、今回は目次の導入それ自体よりも、スタイリング、特にマークダウンで記載したコンテンツの横のいい感じの位置に目次を設定することに時間を取られてしまいました。
Material UIなどのUIコンポーネントやTailwind CSSのようなCSSフレームワークなしで素のCSSを書いていくのはやはり難しい。。。早く「CSSわからない」までいきたいです。