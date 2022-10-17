---
title: "Prismaを数ヶ月使ってみた感想"
summary: "仕事でPrismaを数ヶ月利用してきたので、その感想をまとめました。"
path: "impression-of-prisma"
date: "2022-08-30"
update: ""
hero_image: "./andrey-novik-_9-r_kfpz9A-unsplash.jpg"
hero_image_alt: "prisma"
hero_image_credit_text: "Andrey Novik"
hero_image_credit_link: "https://unsplash.com/photos/_9-r_kfpz9A"
tags: [web, orm, db, prisma]
---

現在仕事で、ORM として Prisma を用いて開発を行なっています。型安全に DB との通信を取り回せる観点ではとても助かっている一方で、ハマりどころや「生 SQL を書きてえ！」という衝動に駆られることもあったりするので、今見えている難しいポイント、ちょっとしたトラップをまとめられたらと思います。

## Relation・制約の設計が難しい

### RDBMS を素の状態で利用する場合

ORM を何も用いずに RDBMS を用いる場合、DB 設計をする際に ER 図などを作成してテーブル間のリレーションを考えながらモデリングを行なっていけば OK です。それぞれのテーブルを結合してクエリしたい場合には、ER 図を見ながらテーブル同士を JOIN してクエリを作成していけば OK です。最も王道な方法であるため、慣れている方も多いかと思います。

### Prisma を介して RDBMS を利用する場合

しかし、Prisma を介して RDBMS を利用する場合には、テーブル間を繋ぐためには Relation をテーブル間に作成する必要があります。Relation を持たせたテーブル同士でしか Prisma のクエリを用いて JOIN することができないためです。Relation を持っていないテーブル同士を結合したい場合には、raw_sql の機能を使って String でクエリを書くこともできるのですが、こうすると型安全であるという Prisma の恩恵を受けることができずせっかく Prisma を導入した意義が半減してしまいます。

この Relation の設計が慣れないと少し難しく、Relation で親子関係を作成した際に required のフィールドを key として指定した場合には親がない状態で子を作成できないことが強制されるなど、RDBMS を素の状態で利用する場合には自分で制御可能な部分が勝手に指定されてしまったりします。もちろん、ランタイムエラーを最小限に抑えるための工夫ではあるのですが、良くも悪くも制約がついた状態で開発を進めることになります。ただ JOIN したいだけなのに、そのためだけに Relation を作成する必要がある ⇒DB のマイグレーションも必要で面倒臭い。。。という状況に何回も直面しました。また、アプリケーション開発の初期段階などで頻繁にスキーマが変更になる場合には、Prisma が提供する制約をかいくぐるために migration ファイルを手で書き換えるハックが必要になったりと、どうしても余計な手間＆リスクを取る必要が発生してしまったりしました。

## Relation の子にあたる要素（配列）を条件に用いてフィルタリングできない

## 複合キーで重複があった場合に処理をスキップするようにはできない

## UPSERT がない（あるけど UPSERT ではない）

PostgreSQL や MySQL では UPSERT コマンドはないものの、 `ON CONFLICT` や`ON DUPLICATE KEY`などで UPSERT に相当する操作を行うことができます。また、ORM の場合 UPSERT コマンドを持っていることも多いでしょう。

Prisma も御多分に洩れず UPSERT が用意されており、[ドキュメント](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#upsert)にも「既存のレコードを更新もしくは新規にレコードを作成します」とまさに UPSERT の説明があります。

> `upsert` updates an existing or creates a new database record.

しかし、Prisma の内部的には RDBMS における UPSERT に相当するクエリを発行しているわけではなさそうで、レースコンディションが発生してしまいます。（参考 Issue: [https://github.com/prisma/prisma/issues/3242](https://github.com/prisma/prisma/issues/3242)）

例として以下の schema 定義と upsert のコードを考えてみます。

```jsx
// schema.prisma
model user{
	id      Int    @id @default(autoincrement())
	user_id String @unique
	name    String
}
```

```tsx
const client = new PrismaClient();

async function upsertUser(userId: string, name: string): Promise<void> {
  try {
    await client.user.upsert({
      where: {
        user_id: userId,
      },
      create: {
        user_id: userId,
        name: name,
      },
      udpate: {
        name: name,
      },
    });
  } catch (err) {
    console.error(err);
  }
}

await Promise.all([
  upsertUser("user-1", "foga"),
  upsertUser("user-2", "hoge"),
  upsertUser("user-2", "hoge"),
  upsertUser("user-1", "foga"),
]);
```

これを複数回実行すると、エラーになることがあるはずです。

```tsx
{"message":"ERROR: \"prisma error occurred, prisma error code: P2002\"","severity":"ERROR","stack":"Error: \nInvalid `prisma.user.upsert()` invocation:\n\n\n  Unique constraint failed on the field: `user_id`\n    at Object.request (/Users/my_dir/node_modules/@prisma/client/runtime/index.js:39809:15)\n    at DatasourceClient._request (/Users/my_dir/node_modules/@prisma/client/runtime/index.js:40637:18)\n    at UserDatasource.upsertUser (/Users/my_dir/webpack:/hogehoge)","timestamp":"2022-08-25T00:20:52.201Z"}
{"message":"ERROR: \"prisma error occurred, prisma error code: P2002\"","severity":"ERROR","stack":"Error: \nInvalid `prisma.user.upsert()` invocation:\n\n\n  Unique constraint failed on the field: `user_id`\n    at Object.request (/Users/my_dir/node_modules/@prisma/client/runtime/index.js:39809:15)\n    at DatasourceClient._request (/Users/my_dir/node_modules/@prisma/client/runtime/index.js:40637:18)\n    at UserDatasource.upsertUser (/Users/my_dir/webpack:/hogehoge)","timestamp":"2022-08-25T00:20:52.219Z"}
```

2 年前に issue が開かれていますが、まだ解決していないのでしばらく開発には時間がかかりそうです。他の issue では、マイルストーン 2.19 に乗っていたことがあるとの記載もあったので、何らかの事情で先送りにされているのでしょうか。

とにかくまだ Prisma 自体では解決していない問題なので、実装側で吸収する必要があります。今のところエラーハンドリングを行い、エラーをキャッチした場合には再実行する以外方法がなさそうです。

```tsx
async function upsertUser(
  userId: string,
  name: string,
  retryCounter = 3
): Promise<void> {
  try {
    await client.user.upsert({
      where: {
        user_id: userId,
      },
      create: {
        user_id: userId,
        name: name,
      },
      udpate: {
        name: name,
      },
    });
  } catch (err) {
    if (retryCounter > 0) {
      retryCounter--;
      upsertUser(userId, name, retryCounter);
    }
    console.error(err);
  }
}
```

## Enum を追加して、その Enum を default value として利用したい場合、２回に分けて migration を行う必要がある。

これは migration を複数回に分けて実行すれば解決する問題なので、そこまで困るものではないですが、数回 migration をリトライしてしまったので残しておきます。(参考 Issue: [https://github.com/prisma/prisma/issues/8424](https://github.com/prisma/prisma/issues/8424))

以下のように、新しく追加した enum の値を default value として設定しようとすると、新しい enum の値は使う前にコミットされている必要がある。ということでエラーになります。

```tsx
// Before
enum place {
  INDOOR
}
model activity {
...
  place place @default(INDOOR)
...
}

// After
enum place {
  INDOOR
	OUTDOOR
}
model activity {
...
  place place @default(OUTDOOR)
...
}
```

```tsx
Error: P3018

A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20220825080309_add_new_place

Database error code: 55P04

Database error:
ERROR: unsafe use of new value "OUTDOOR" of enum type "place"
HINT: New enum values must be committed before they can be used.

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState("55P04"), message: "unsafe use of new value \"OUTDOOR\" of enum type \"place\"", detail: None, hint: Some("New enum values must be committed before they can be used."), position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("enum.c"), line: Some(103), routine: Some("check_safe_enum_use") }
```

解決するためには、まずは enum だけを追加した状態で migration を一度行い、次に前の工程で追加した enum を default value として設定した状態で migration を行えば OK です。

```tsx
// Before
enum place {
  INDOOR
}
model activity {
...
  place place @default(INDOOR)
...
}

// After(１回目のmigrationを行う)
enum place {
  INDOOR
	OUTDOOR
}
model activity {
...
  place place @default(INDOOR)
...
}

// After(２回目のmigrationを行う)
enum place {
  INDOOR
	OUTDOOR
}
model activity {
...
  place place @default(OUTDOOR)
...
}
```

特に手間ではないのですが、migration ファイルが２つ作られることになるので、あまりにも繰り返すと migration ファイルが大量に生成されてカオスになってきます。

## PrismaClient のインスタンスを引き回す必要がある。

Prisma を利用する際には、 `const client = new PrismaClient()`のように PrismaClient をインスタンス化してやる必要があります。ただ、クエリを発行する度に至る所でインスタンス化を行なっていると、警告が出るようになってしまいます。（参考 Issue: [https://github.com/prisma/prisma/discussions/4399](https://github.com/prisma/prisma/discussions/4399)）

```tsx
warn(prisma-client) Already 10 Prisma Clients are actively running.
```

警告が出ているだけならまだ問題にはなっていませんが、このままだと複数の PrismaClient が各自で DB との connection pool を張っている状態になってしまうので、度が過ぎると DB がメモリ不足となって落ちてしまいます。この問題を回避するために、まずは Issue 内でも書かれているように一度 PrismaClient のインスタンス化をおこなったら、アプリケーションの各所でそれを引き回してやるようにする必要があります。

```tsx
export class Client extends PrismaClient {
  private static _instance: PrismaClient;

  private constructor() {
    super();
  }

  static getInstance() {
    if (!Client._instance) {
      QueryService._instance = new QueryService();
    }
    return QueryService._instance;
  }
}
```

今まで `const client = new PrismaClient()` していた箇所では、 `const client = Client.getInstance()` としてやるようにすれば、毎回新たにインスタンス化を行うことなく、一つのインスタンスを引き回すことができるようになります。

ちなみに、コネクションプールの管理については、アプリケーションや使っているマシンのスペックによっても最適な値が変わってくるので、[https://www.prisma.io/docs/guides/performance-and-optimization/connection-management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management) を参考にして頂くと良いかと思います。

## 配列の要素に対しての部分一致はできない

以下のようなスキーマ、レコードがあった場合、例えば `AAA`という文字列で検索をかけて、 `AAA-1000`

`AAA-2000` だけをヒットさせたかったのですが、それは Prisma ではできません。

```tsx
// schema.prisma
model product {
	parts    String[]
}

// product.parts sample record
parts: ['AAA-1000', 'AAA-2000', 'ABC-1000', 'DEF-1000']
```

実現したい場合、戻り値に対して、filter 関数をかけてクエリ外でフィルターするしか今のところ方法はなさそうです。
