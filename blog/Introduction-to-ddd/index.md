---
title: "読書記録：ドメイン駆動設計入門"
summary: "ドメイン駆動設計入門:成瀬允宣(著)を読んだ読書記録です。これからDDDへの理解を深めていく前段階として、大事だと思ったポイントをまとめてみました。"
path: "introduction-to-ddd"
date: "2022/03/13"
update: ""
hero_image: "./sen-rgP93cPsVEc-unsplash.jpg"
hero_image_alt: "lego"
hero_image_credit_text: "Sen"
hero_image_credit_link: "https://unsplash.com/photos/rgP93cPsVEc"
tags: [reading,ddd]
---

ドメイン駆動設計入門を読み直したので、忘れないうちにメモを残します。

このメモは実装に関するルールの詳細を記したものではなく、あくまでもドメイン駆動設計(以下DDD)に関する知見をこれから深めていくにあたって、現時点で私が中心となると考えているコンセプトをまとめたものである。という点をご了承いただければと思います。

また、DDDを極めていくためにはモデリングと実装を繰り返して勘どころを掴んでいく訓練が必要になりそうということも本書を通して学ぶことができたので、アプリケーションを作りながら自分が考えた設計についてまとめていく記事も今後書けたらと思っています。

## TL;DR

---

変更に強く、明示的なコードを書いていくための手法の一つがDDDであり、ドメインに関する処理に集中できるようにすることが大事である。そのための具体的な方針としては以下２つが重要である。

- ドメインのルール、永続化に関する手続き、ユースケースを実現するための処理等を分離し、責務を明確に保つ。
- 実態が抽象に対して依存するように依存関係を保つことで、依存関係の把握を容易にして変更に強くする。

## ドメイン駆動設計入門を読んだきっかけ

---

適当に動くものは作ることができるようになっていましたが、それと同時に一定長い時間をかけて拡張性を持ったアプリケーションを作りあげる難しさが身に沁みるようになっておりました。

そんな中、保守性の高いアプリケーションを作っていくためにどうしたらいいかを相談した際にお勧め頂いた本の一つが本書だったため、今回改めて読み直すことにしました。

1回目読んだ際には自分の経験が乏しく、アプリケーションの保守運用で困ったことがそこまでなかったのであまり実感を持って読むことができなかったのですが、課題感を強く持った状態で読み直したことで、自分がアンチパターンを地で行くような実装（コメントと実装が乖離して辛い、変更時に様々な箇所を変更する必要がある、実態に依存したコードを書いているetc）を大量にしてしまっていたことを思い知らされ、DDDをより本格的に学ぶ意欲が湧いてきました。

## 処理を分離し責務を明確に保つ

---

TL;DRに記載した一つ目の要素、「ドメインのルール、永続化に関する手続き、ユースケースを実現するための処理等を分離し、責務を明確に保つ。」をもう少し詳しくみていきましょう。

コードを書いていくと、ついついメソッドやクラス名とは直接関係ない処理を該当箇所に書いてしまうことがあると思います。コードベースが小さい＆開発者が少ないうちは大きな問題にならないかもしれませんが、コードの規模が大きくなり、開発者が増えていくに従ってこういった名前と実態にずれがあるコードは混乱を生むことになり、払う必要があるコストがどんどん膨れ上がっていくことになります。

例えば、以下のようなコードは明確で、誰が見ても「名前に使えるのはアルファベットのみで、空欄 or 10文字(注釈1)より大きいとダメなのだな」「ユーザーIDは空だとだめなのか」と分かるかと思います。

### 良いコード例

```jsx
class Name {
  #name: string;
  constructor(name: string) {
    if (name.match(/[^a-z]/gi) !== null || name.length === 0 || name.length > 10) {
      throw new Error('Name must be alphabetical only, not blank, and must not exceed 10 characters.');
    }
    this.#name = name;
  }
}

class UserId {
  private readonly userId: string;
  constructor(userId: string) {
    if (userId === null || userId === undefined) {
      throw new Error('shoud be');
    }
    this.#userId = userId;
  }
}

class User{
	private readonly userId: UserId;
  #firstName: Name;
  #lastName: Name;

  constructor(userId: UserId, firstName: Name, lastName: Name) {
    this.#firstName = firstName;
    this.#lastName = lastName;
  }
}
```

### 悪いコード例

しかし、以下のようなコードはどうでしょう？

```jsx
class User{
	private readonly userId: string;
  #firstName: string;
  #lastName: string;

  constructor(userId, firstName: string, lastName: string) {
		if (userId === null ||
				userId === undefined ||
				firstName.match(/[^a-z]/gi) !== null ||
				firstName.length === 0 ||
				firstName.length > 10 ||
				lastName.match(/[^a-z]/gi) !== null ||
				lastName.length === 0 ||
				lastName.length > 10 ||) {
					throw new Error('Name must be alphabetical only, not blank, and must not exceed 10 characters.')
				}
    this.#firstName = firstName;
    this.#lastName = lastName;
  }
}
```

### よくない理由

#### 同じ処理が複数箇所に散らばる

UserIdとNameを使っているのがUserクラスだけだったら、まだなんとかなるかもしれません。しかし、他のクラス内でもこれらを使おうとすると、その度に毎回バリデーションを書く必要があります。

また、バリデーションの条件に変更があった際にはコード内の全てのバリデーションを変更する必要が生じ、抜け漏れや間違えて変更してしまう危険性がプロジェクトが大きくなるにつれてどんどん大きくなっていってしまいます。（私自身、過去に置換で全部置き換えようとして、不必要な箇所まで置き換えてしまいデバックが大変なことになった記憶があります。。。）

#### コンストラクタが肥大化する

今はまだUserクラス内部で持っているプロパティが `userId` `firstName`  `lastName` だけなので、コンストラクタの中身がそこまで肥大化していませんが、他にも年齢やプロフィールなど、様々なプロパティをUserクラスが持つようになるとその分だけコンストラクタが肥大化していきます。

### まとめ

こういった状況を避けるためにも、値オブジェクトやエンティティとしてドメインオブジェクトを切り分けて行こうぜ。というわけです。

ここではドメインオブジェクトの例を取り上げましたが、他にも例えばユーザーの重複確認が必要な場合には、Userクラス自身定義するのではなくドメインサービスとして切り出してみたり、データベースと接続して作成したユーザーを永続化する必要があるのであれば、リポジトリとしてデータベースとの接続部分を切り出したりといった具合で、処理内容と関連に応じて適切な粒度で、適切な実装方法に落とし込んで１つ１つの責務を明確に保つことで、保守性を上げていくことが大切になってくるのです。

## 実態が抽象に依存するように依存関係を保つ

---

処理を分離し責務を明確に保つことに関しては、DDDに限らず説明されていることも多く、割とすっと理解しやすかったです。
しかし、実態が抽象に依存するように依存関係を保つことに関しては1回目本書を読んだ時点では理解することができず、今回2回目読んでみてやっと理解することができ、変化に耐えうるプログラムを書く上で非常に重要なポイントであるということがわかりました。

スパゲッティコードとはよく言われるものですが、複雑に依存関係が絡まり合った状態がまさにスパゲッティコードをスパゲッティコードたらしめている要因の大きな１つです。

依存関係が複雑に絡まり合ったコードではどこか１箇所を修正しようとしただけで、思いも寄らない別のどこかに影響を及ぼし、まるでバタフライフェクトの映画のような崩壊を味わう恐怖感があります。（特に使い捨てと思って書いたコードが思いの外長生きしてしまうとこうなりがちだったり。。。）

こういった状況を避けるために、実態が抽象(インターフェース)に依存するように依存関係を保ちましょう。というのが主張の１つでした。

では、実態が抽象に依存するように、依存関係を保つことができると何が嬉しいのか、順番に説明していきます。

### ドメインのルールが低レベルの実装に振り回されなくなる

ドメイン駆動設計とはその名の通り、ドメインを中心に添えて設計していくことで重要なビジネスロジックに集中して変化に強いソフトウェアを構築していくための手法です。そのためには、最重要に据えたビジネスロジックがそれ以外の実装によって振り回されてはなりません。

例えば、サービスのスケーリングに当たってRDBMSからNoSQLにDBを置き換えた場合を想像してみましょう。

### 良い例

```jsx
public class UserApplicationService{
	private readonly
}
```

### 悪い例

```jsx
// 変更前（RDBMS使用時）
class UserApplicationService {
  private readonly userRepository: IUserRepository;
  constructor() {
    this.userRepository = new RDBUserRepository();
  }
}

// 変更後（NoSQL使用時）
class UserApplicationService {
  private readonly userRepository: IUserRepository;
  constructor() {
    // this.userRepository = new RDBUserRepository();
		this.userRepository = new NoSQLUserRepository();
  }
}
```

### よくない理由

#### 変更箇所が膨大になる。

この例ではUserに関するアプリケーションサービスだけ変更をしたので、特に問題ないように見えていますが、コードにはUser以外にもクラスがあるはずで、それらに関連するアプリケーションサービス内で使っているリポジトリを全て置き換えていく必要があります。

「処理を分離し責務を明確に保つ」で説明した部分につながるところがありますが、こうなると変更箇所が膨大になり、変更漏れの可能性が一気に高まってしまいます。

## 注釈

### 注釈1

ユーザー名のバリデーションって文字数設定するとしたら何文字が適切なんだろう。とふと思って調べてみたところ、ギネスブックに載っている世界最長の名前が「Captain Fantastic Faster Than Superman Spiderman Batman Wolverine Hulk And The Flash Combined」でスペース込み93文字でした（超どうでもいい）。今回は説明を省くためにかなり短いバリデーションにしています。

19歳の少年が世界で最もファンタスティックで長い名前に改名 - GIGAZINE
[https://gigazine.net/news/20081105_the_most_fantastic_long_name_boy/](https://gigazine.net/news/20081105_the_most_fantastic_long_name_boy/)