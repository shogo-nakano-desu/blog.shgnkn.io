---
title: "card check post"
path: "card-check-post"
date: "2022-01-22"
hero_image: "./anders-drange-5glbTkJOWqI-unsplash.jpg"
hero_image_alt: "universe"
hero_image_credit_text: "Anders Drange"
hero_image_credit_link: "https://unsplash.com/photos/5glbTkJOWqI"
---

## This is card check post

カードの並び順が問題ないかを確認するためのポスト

## What I am going to write

- How to create this blog post
- How to deploy it to さくら VPS
- UOP
- なぜブログを今更書こうと思ったのか
- 自分の経歴、持っている資格、できることなど
- GCP の認証周りについて
- Slack API からスタンプ数の集計を行う。
- これからやりたいこと。
  - ブログで書きたい記事一覧
  - どうだろう
    - これで
  - 新規

1. こっちは数字リスト
  1. うまくいっているだろうか？
  2. ここはインデント７える
    1. 二つ目のインドでんと
1. マークダウン難しい

#### これは

```
const nodes = props.data.allMdx.nodes;
  if (nodes === undefined) {
    throw new Error(`nodes should be`)
  }
  const frontmatters = nodes.map((node: any) => node.frontmatter)
  if (frontmatters.some((e: any) => e === undefined)) { throw new Error(`should be`) }
  frontmatters;
```

こっちはインラインのサンプル `const test = "test desu"` コード
