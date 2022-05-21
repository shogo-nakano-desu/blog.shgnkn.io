---
title: "NestJSにおけるDI"
summary: "NestJSにおけるDI(Dependency Injection/依存性の注入)の仕組みを見ていきます。雰囲気DIを卒業してデバックを高速にしたい。"
path: "dependency-injection-in-nestjs"
date: "2022-05-21"
update: ""
hero_image: "./tobias-tullius-05kxiwYKINo-unsplash.jpg"
hero_image_alt: "dependence"
hero_image_credit_text: "Tobias Tullius"
hero_image_credit_link: "https://unsplash.com/photos/05kxiwYKINo"
tags: [infra,network,web]
---

NestJSを用いた開発で、最もよく遭遇するエラーの一つがDI(Dependency Injection)の失敗です。

```typescript
ERROR [ExceptionHandler] Nest can't resolve dependencies of the AnimalService (?). Please make sure that the argument Datasource at index [0] is available in the AnimalModule context.

Potential solutions:
- If Datasource is a provider, is it part of the current AnimalModule?
- If Datasource is exported from a separate @Module, is that module imported within AnimalModule?
  @Module({
    imports: [ /* the Module containing Datasource */ ]
  })
```

しかも都合が悪いことに、依存関係が複雑になってくるとこのエラーメッセージがほぼ役立たなくなり、ただDIが失敗している。という以上の情報を得ることができなくなります。

(Potential solutionsで解決した試しがほぼない。。。)

以前NestJSドキュメントのOverviewとFundamentalsあたりはがさっと目を通していたのですが、DIについての理解が皆無だったので改めてDIだけに注目することにしました。

## DI(Dependency Injection)とは？

詳細な説明は省きますが、名前の通りクラス間の依存関係を解決する仕組みのことです。DIそのものを理解するためには、以下の動画がわかりやすかったです。

[https://www.youtube.com/watch?v=vYFhHVMetPg](https://www.youtube.com/watch?v=vYFhHVMetPg)

[https://www.youtube.com/watch?v=0X1Ns2NRfks](https://www.youtube.com/watch?v=0X1Ns2NRfks)

## NestJSにおけるDI

NestJSでは、constructorに依存しているクラスを注入することで、DIを行うことができます。

アプリケーションを立上げる際には、基本的に全てのProviderをインスタンス化する必要があります。

```typescript
// animal.service.ts
@Injectable()
export class AnimalService {
  getNull(): null {
    return null;
  }
}

//app.service.ts
export class AppService{
	//ここでDIを行っている
	constructor(private readonly animalService:AnimalService){}
	getNull():null{
		return this.animalService.getNull()
	}
}
```

NestJSのDIの仕組みを用いずに、自分でインスタンス化することで外部のクラスを活用することももちろん可能です。

```typescript
// animal.service.ts
@Injectable()
export class AnimalService {
  getNull(): null {
    return null;
  }
}

//app.service.ts
export class AppService{
	getNull():null{
		//DIを行う代わりに自分でインスタンス化している。
		return new AnimalService().getNull()
	}
}
```

AnimalServiceクラスが他のどのクラスにも依存していない場合には、自分でインスタンス化を行っても特に苦労しません。しかし、AnimalServiceが更に別のクラスに依存していた場合はどうでしょうか？

以下はDIを活用した例です。

```typescript
//datasource.ts
@Injectable()
export class Datasource {
  getAll(): SpeciesDto[] {
    return animals;
  }
}

//animals.service.ts
@Injectable()
export class AnimalService {
  constructor(
    private readonly Datasource: Datasource,
  ) {}

  getAll(): SpeciesDto[] {
    return this.Datasource.getAll();
  }
}

//app.service.ts
@Injectable()
export class AppService {
  constructor(private readonly animalService: AnimalService) {}

  getAll(): SpeciesDto[] {
    return this.animalService.getAll();
  }
}
```

注目すべきは、 `app.service.ts` 内のconstructorです。 `animalService` をconstructorに登録するだけで、 `animalService` が依存している `Datasource` への依存関係も解決してくれます。

これをNestJSのDIの仕組みを使わずに行おうとするとどうなるでしょうか？

 `app.service.ts` 以外のコードはそのままだとすると、以下のようになります。

```typescript
//app.service.ts
import { Injectable } from '@nestjs/common';
import { AnimalService } from './animal/animal.service';
import { SpeciesDto } from './database';

@Injectable()
export class AppService {

  getAll(): SpeciesDto[] {
    return new AnimalService(new Datasource()).getAll();
  }
}
```

 `AnimalService` クラスをインスタンス化して、 `AnimalService` クラスが依存している `AnimalDatasource` クラスもインスタンス化してやる必要が生じました。

このように、 `Class A` ⇒ `Class B` ⇒ `Class C` のように、複数の依存関係が存在しているときにNestJSのDIの仕組みが威力を発揮します。３つのクラスの依存関係ならまだしも、これが10個のクラスで依存関係があった場合には、10個のクラスをインスタンス化してやる必要があります。

*本当は、NestJSのDIの仕組みではキャッシュを効率的に活用したりもしているので、ここで紹介した以上のメリットがあります。

また、このように自分で依存関係を解決しようとした場合、例えば `Datasource` クラスの実装を`HumanDatasource` クラスに変更した場合、全てのインスタンス化を行っている箇所に変更を加えて回る必要が生じます。しかし、NestJSのDIの仕組みを活用することによって密結合な状態を解消することができます。

ただ、今の実装のままだと、  `Datasource` クラスを注入している箇所を全て変更して回る必要が残ります。

これを解消するためには、 `AnimalService` 内での依存先を抽象クラスにして、実態には依存させないようにしてやる必要があります。

```typescript
// animal.service.ts
@Injectable()
export class AnimalService {
  constructor(
    @Inject(DB_REPOSITORY)
    private readonly dbRepository: DbRepository,
  ) {}

  getAll(): SpeciesDto[] {
    return this.dbRepository.getAll();
  }
  getNull(): null {
    return null;
  }
}

// db-repository.ts
export interface DbRepository {
  getAll(): SpeciesDto[];
}

// datasource.ts
@Injectable()
export class Datasource implements DbRepository {
  getAll(): SpeciesDto[] {
    return animals;
  }
}
```

ポイントは、 `DbRepository` をインターフェースとして定義して、 `DbRepository` の実態として `Datasource` を定義するようにすることです。こうすることで、仮に `Datasource` が `HumanDatasource` などに変わったとしても、変更が必要になるのは `AnimalService` 内で `@Inject` デコレータで依存を注入している `DB_REPOSITORY` トークンとの紐付けだけです。

 `@Inject` デコレータの中で、トークンを活用せず、直接 `Datasource` を注入していたらどうなるでしょう？

```typescript
// animal.service.ts
@Injectable()
export class AnimalService {
  constructor(
    @Inject(Datasource) //このときどうなる？
    private readonly dbRepository: DbRepository,
  ) {}

  getAll(): SpeciesDto[] {
    return this.dbRepository.getAll();
  }
  getNull(): null {
    return null;
  }
}

```

これだと、抽象（今回は `DbRepository` インターフェース）に依存させた意味がなくなってしまいます。なぜなら、`Datasource` クラスに変更があった場合には `@Inject(Datasource)`を行っている箇所全ての変更が必要になってしまいます。

それを回避するためにトークンを活用して依存を注入するようにするのです。トークンを活用するためには、module内で providersを登録する際に、クラスを直接登録する代わりにトークンと対応するクラスを紐づけてprovidersに登録してやる必要があります。

```typescript
// datasource.module.ts
@Module({
  providers: [{ provide: DB_REPOSITORY, useClass: Datasource }],
  exports: [{ provide: DB_REPOSITORY, useClass: Datasource }],
})
export class DatasourceModule {}

// constants.ts
const DB_REPOSITORY = 'DbRepository';
```

こうすることで、 `Datasource` クラスに変更があっても、対応が必要なのは `DatasourceModule` の中だけとなります。

これがNestJSのDIの嬉しいポイントです。

また、トークンを活用した場合、トークン名には任意の名前をつけることが可能なため、使っているフレームワークやライブラリ内での用語ではなく、特定のアーキテクチャに沿った名前などに変えることが可能な点も嬉しいポイントです。

さらに、今回はprovidersの登録で `useClass`だけを使いましたが、 `useValue`を用いることでまだ未実装のメソッドを定義することがきたりする点も便利です。

## DIが失敗するときに確認すべきポイント

最後に、DIが失敗するときに確認すべきポイントを列挙しておきます。

基本的には、これらのうちどれかが失敗している可能性が高いでしょう。

また、今回は constructor内に注入するクラスを **「注入したいクラス 」**、逆に、constructorを持つクラスを「**注入されるクラス」**と呼ぶことにします。例で挙げてきたコード内ならば、 `AnimalService`クラスが注入されるクラス、 `Datasource` クラスが注入したいクラスです。

- 同一module内のクラスを注入したい場合
    - 注入したいクラスを、注入される側のクラスが属するmoduleにproviderとして登録しているか？
- 他のmodule内のクラスを注入したい場合
    - 注入したいクラスを含んだmoduleを、注入される側のクラスが属するmoduleにimportしているか？
        - その場合、注入される側のクラスが属するmoduleでexportsにも注入したいクラスが登録されているか？
    - 注入したいクラスを注入される側のクラスが属するmoduleにproviderとして登録しているか？
        - この場合、注入したいクラスが属するmoduleでprovidersとexportsに登録されている必要はない。
            - ただ、これをやるとわざわざディレクトリを切っている意味がなくなるのであまりやらないほうがいい。
            - 全体に対してexportしたくはないが、ある特定のmodule内でのみ活用したい場合などに使うのが適切か？ただ、そうなった場合別moduleとして切り出した方がいい場合もある。

## コード

最終的なコードは以下のリポジトリに上がっています。

[https://github.com/shogo-nakano-desu/sandbox-nestjs-di/tree/main/src](https://github.com/shogo-nakano-desu/sandbox-nestjs-di/tree/main/src)