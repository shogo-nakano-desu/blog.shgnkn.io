---
title: "Type<Challenge[]>~easy?~"
summary: "脱にわかTypeScripterするために、型力を上げたい。"
path: "challenge-type-challenges"
date: "2022-06-05"
update: ""
hero_image: "./vardan-papikyan-DnXqvmS0eXM-unsplash.jpg"
hero_image_alt: "puzzle"
hero_image_credit_text: "Vardan Papikyan"
hero_image_credit_link: "https://unsplash.com/photos/DnXqvmS0eXM"
tags: [typescript, type]
---

https://github.com/type-challenges/type-challenges

type-challengesに真面目に取り組もう取り組もうと思いつつ、放置してしまっていました。

ただ、３ヶ月の目標に「type-challengesのeasyは自力で解けるようになる。」という目標を入れてしまっていたので、真面目に取り組んでいきます。

2022年6月現在、easyは全部で13問用意されているので、それらを順番に解いて、解説していきます。

## 00004-Pick

TypeScript組み込み機能の `Pick<T,K>` を実装していきます。

最終的には、以下のようなコードになります。

```tsx
type MyPick<T, K extends keyof T> = { [key in K] : T[key] };
```

[Playground_00004_pick](https://www.typescriptlang.org/play?#code/PQKgUABBAsELQQAoEsDGBrS8491gRgJ4QCCAdgC4AWA9mcQGICuEAFAAICGlAZkwJQQAxAFNOAZ2JCmZZHWH4myADYU4yMlixCdEAIpMR4inM1QsASQC2AB2UirIyhGoiIilWo0QABigwAPAAqADQQANIAfD4QAOZOIgBOaBAA7sjUNEwUEEziGrEQGQB0WlAAwnTGiUyoFOIQnC6ENm5EEDZo6AUuVG7iIjk0PB2JNK2JJka+4TE8Y1a+QT5lEAw0iRAiAB6ctvarPkf1WBoUSTycqG5BNAAmNBAA3lhQJhT2AFwQ1QWvEHcjKhkjYTHRvr8yLF-qgaPtBiI7t98DQaPZuFgAL6rCgtG73GiIRIiABuyBEqQgAF4IABZQj+dDBAlhADk73srIgAB8IKzYfDzndWZFVrCyMYXATvrcHkTSeTKTSXlBVS4Ml8+eV0WQIGM4ayQv8oAK7AikRBLsoBkaoNioEcVuYoJEIAA1RUQeQAcQyAAkmPhvlQKBQbOJPsBgPVUFRigArcTFDaxYDQMAgYBgbOgCAAfQLhaLhYgAE0sptKoCIH6km5iw2CxBM9nca06QyusEwuEtttzmQ7g10CJCMMIEFXcqIABtEfEbzhAC6EBlc9HK8xAG5s2Bc42GxOjDlyhJpgfi82s8hbBscm23E8IABRACOTE4yjCz+2rTqEExS0Fj5dgHzgWNP3sKEjGAbIVHEVlWzxCBUDPBoaRnLAfz-CgAjfD9lDw38RDqREAEYwnpRlmQeNkOREEVIkiW0X2Iuo8PfT8iJwxEACZKM7QJZRoOiNQYnk+VNewhUY5isCjCBQPEOAdhwlTEjGRIsCorthNEj5xN5fk4TNGSJNZDQSU-ZBhTkpdszOC4rnxB5niweiIQoZIoSwQFxGBZBQVMTzvOhE0TOkxFkVRHUwGxMBHMSS5rlYni7jIty3jEkK-nixLkrcbCSKFXjMvVAycp88LBSi9wYrETR4pzEB8wvEtmEmPpNgAZXOcNWravMrz3cAXQgbqqE4YkIDHJhNnENE4KqYNQ3DSNo38uNE2TRJU2gYBuHEVIkiwV0PQpH5FrBCUVrDCMoxjLakxTNNgAW5QlolU66Q2Nxykm5QoPiCMIBDO71sehNnt2jMszAIA)

完全に初めてこれを解いたときには、「本当にeasy１問目。。？」となりました。

一つづつ分解します。

### keyof (keyof演算子)

[The `keyof` type operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) には、「オブジェクトをとり、keyとして含まれるstringもしくはnumber型のユニオン型を生成します」と書かれています。

説明そのままで、以下のようにkeyからユニオン型を生成することができます。これによって、わざわざオブジェクトとは別にユニオン型を定義する必要がなくなるので、オブジェクトに変更を加えた際にユニオン型を手動で変更する必要がなくなり、保守性が向上します。

```tsx
type Person = {name: string, age: number, 100:number}
type PersonKeys = keyof Person // "name"|"age"|100
```

これを今回の回答に適用すると、例えば `T` が `Person`型だった場合、以下状態と解釈できます。

```tsx
type MyPick<T, K extends "name"|"age"|100> = { [key in K] : T[key] };
```

### extends (Genericsにおける型引数の制約)

Genericsで `extends` を活用すると、 `A extends B` と記載した場合に、型 `A` を型 `B` 及び型 `B` から継承して作成された型に制限して活用することができるようになります。

また、interfaceに対しても `extends`を活用することが可能で、これはclassにおける `implements` を行ったのと同じような挙動をします。

いずれにしても、 `A` の型を絞り込むために活用します。ドキュメントの例がわかりやすいのでそのまま転記しておきます。

```tsx
// Error
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
// Property 'length' does not exist on type 'T'.
  return arg;
}

// No error
interface Lengthwise {
  length: number;
}

function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length); // Now we know it has a .length property, so no more error
  return arg;
}

//https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints
```

これを元に、今回の回答にコメントを足します。

```tsx
// KはオブジェクトTが持つキー値である"name", "age", 100のいづれかである。
type MyPick<T, K extends "name"|"age"|100> = { [key in K] : T[key] };
```

### in (Mapped type)

Mapped typeはユニオン型と組み合わせて活用されます。オブジェクトのキーをユニオン型で定義した値に制限することが可能です。

```tsx
type MyFamily = "Taro" | "Jiro" | "Saburo";
type MyFamilyAge = { [k in MyFamily]: number };
const family: MyFamilyAge = { Taro: 20, Jiro: 18, Saburo: 15 };

//Error
//Property 'Saburo' is missing in type '{ Taro: number; Jiro: number; }' but required in type 'MyFamilyAge'.ts(2741)
const familyError: MyFamilyAge = { Taro: 20, Jiro: 18};
```

この機能を型定義の中で活用することで、仮想的に以下のように分解されます。（このコードはこのままではエラーになります。）

つまり、ユニオン型の要素(=Tが持つキーに含まれる値)をそれぞれキーとして持ち、かつそれぞれに対応する型を持つinterface型になります。

```tsx
// KはオブジェクトTが持つキー値である"name", "age", 100のいづれかである。
type MyPick<T, K extends "name"|"age"|100> = {
    name : T["name"],
    age: T["age"],
    100: T[100]
};
```

### まとめ

```tsx
type MyPick<T, K extends keyof T> = { [key in K] : T[key] };

const obj1 = { name: "Taro", age: 20, address: "tokyo" };
const obj2: MyPick<typeof obj1, "name"> = { name: "Jiro" }; //OK
const obj3: MyPick<typeof obj1, "name"> = { name: "Jiro", age: 18 };//Error
const obj4: MyPick<typeof obj1, "name" | "age"> = { name: "Jiro" };//Error
const obj5: MyPick<typeof obj1, "school"> = { shool: "Hoge High School" };//Error
```

obj3： `age` キーはGenericsの第二引数に含まれないのでエラーになります。

obj4： `age`キーがGenericsの第二引数のユニオン型に含まれているにも関わらず、右辺で `age` キーをもつプロパティが定義されていないのでエラーになります。

obj5： `school` キーがGenericsの第二引数に定義されていますが、 `school` は `typeof obj1` に含まれないキーなので、extendsで弾かれてエラーになります。

## 00007-readonly

TypeScript組み込みの `Readonly<T>` を実装していきます。

最終的なコードは以下です。

```tsx
type MyReadonly<T> = {readonly [key in keyof T]: T[key]};
```

[Playground_00007_readonly](https://www.typescriptlang.org/play?#code/PQKgUABBDsELQQEoFMCGATA9gOwDYE9J44TSiAjfCAQWwBcALHKgMQFcIAKAAVXoDM2ASggBiNAGcqo8mwCWuOnDnYxAJzRY80zOQBWyAMZKA1snwSiRUTYgBFNsgl05OK1ACSAWwAOuZF7I9BCMyBCyCkoqEAAGKBg4BAA8ACoAfDEQAOZByGpyhhAA7nKMmGx0EGwSKlkQpQB07hAAwjjOamzGEhCoIfg+YSWMvbi4ED5qmINqLk4QmPwQKRASyJV0mBAaCdoANBCBfLUhDGGT03lzPYunYYbtdJ3GyOj9gxCGfNiYleRhOwkNSy2FeTSgRBYmDUEGQAA9UL5-M0Yqi6JYoCo6Hl+KhDGEUpgsBAAN5EKAuOj+ABcqyetXJEHQTkM+R8LhwtI6DKgAF9mg9sM4QkTMLSALL4eJaZKErBpCAAXlJjMpNIgACIABLmDV7RnMiSsuTs1zYWka-iYXSoNQaoj8iEU0UNNVhZXa5BjTAaiDAYAQACiaimalpX2wP0qgOBqj6OxlVAuMzohGdWAahuNppwSs15FtUJ9foDwdD4e+v22kljvWruwIEymKbTsVRzQVADU5MgigtVABxUpatjkWkMOh0HwSan+9GGBgNPQSBrQrLAaBgEDAMC70AQAD6R+PJ+PEAAmuUYW1mRAdRpD6enweINvd6mPpLpYl8KkFcqSQTH8IAAbTMKhonA24UgAXVpFIwPMGD+T3EBH2fE9licSoWlQNYegw09Xx3ORfGhDYBjCEkgwARzYVBcAOQM4UGYwIF5CB+CmLwIAAcm4D9kDgBcGP8bAcgkYAKgUCRePfSjPjw+ZlRAohmNYugkkDOiGKSL9NB-VJRQARjSA5v20IysFMtIzLAGDdyxHE8QJEyVQpUp1W5cSiCzNkOXNOl8h8qAHiRdZXlpchrX8PgiECOhUFpMkoCgVAKiYMMgp5diwBQ1D0MIl92FmM4YQAZWxadCsI4iwFAIgFXKhhbTCfAr1WTBcGk9px0nadZ2AedF2XVc1HXaBgD4CQijyRqIG7XtOu6gKZwgCcpxnOcjRGlc1w3YAJC6nqhXm8VoTCFoWrGIIJL6zbBuGpc9vGrcdzAIA)

### readonly (readonly property)

オブジェクトのプロパティに対して、 `readonly` 修飾子をつけることによって、対象を読み取り専用にすることができます。

```tsx
const myObj = {readonly name:"Taro", age:20}
console.log(myObj.name) //OK
myObj.name = "Jiro" //Error
```

その他の要素は00004-Pickと同じなので割愛します。

## 00011-tuple-to-object

tuple型で定義した変数を、そのままオブジェクトに変換する場合の型です。

```tsx
type TupleToObject<T extends readonly (keyof any)[]> = { [t in T[number]]: t };
```

[Playground_00011_tuple_to_object](https://www.typescriptlang.org/play?#code/PQKgUABBCM0QtBAKgVwA4BsCmEAuB7CAeQCMArLAY10gXnodpIE8IBnASwDt98uIAFAAFOPPgEoIAYiwBDNq1q0pKiAEUUWNrg58lUAOIcAbjln9ZAJ0uzmAGjw2ubAGb5LAWwjcCEcxHxyKlw8ZjQzLgATPAALHABrLGZgY1kMTQgPFG1vflw4iABzEywLa1sAOn0IADF3CCwAD1kPTCxqgAMu3DZaSj4c3HRsCABeCABtAHJcLQxZKYcpj3xIrAwIAGZFiGXV9YgADR29tY2ATSmAXT82CH7nGihaXDCcSy0UDBDx1DakfCkCjUAA8r3C+BceGGWAAfBBgMAGo1wtQsNEAN54OayABcu1mbHmJxWZy2U3xpwO2yWpIOx0pdI2x1p+wuFN2TIglwAvrQuh1qvCAGocLAAdwC-CMuAAEigSPiYrhcGg2LjET1KDEKmQ2BV3IVgLAwCBgGALaAIAB9W12+127n4FCWCAAYX2EFlWA+Nod-utEDNlqR4Jwf2wAKBwRBSGRsyidw+skifAwrHMzAmV3h4wxE0SrG4EELkOQV1xSAmXBQHhIPqufMR9wGIR+kwARGwO3YOzEOzd5C3HmBmw8cniI1go0FQWGy7hcxAMequz2Yri+x2+WAw8gYTPgbhY-HSpEk3JU1x04JS1DM+Js0usRMQsWqzW6w2K3gIDyANyWiAfoBvayBaCEbryFoIGgbaQbmhwrTuG2bzLhAACiACOKBpA4GEosEf4QC4lj4F4UxCGG8Damk2BcIUWjACgOgYGwUwWuObYwmMkwzDiJJsuSrJkiynJCZcg53FxFp7pQ0F3OMEy0ARqLHthuEYLGB6ArOx7zlCQxtLCDhYoS8yUuZCz-uJZLbIyQnbDZVLMhyLlHFMzlcpcDlkpcf6wiZYBXCGEBUWw8BNGpkXWO4u5oT6ZGur8OnRqCEwTNADgAExXKZPI5haQGwXBtQuvkPoQAAyrMaolaBCGjuAUDwlVMRWDgzDOq6bD4OkOgDEqKpqhqwBajqeoGpYRqwMA5hsOKPq0CKYqSr1-W6M4Q2quqmpsNqur6oaxrQMA60sZtvQtRAACy7g4G67UYPRjHqhAyo7aN42HVNhSmuaYBAA)

playgroundに用意されている以下の条件も通すためには、上の実装がいいかなーと思っているのですが、厳密にやろうとするともう少しいい解答もないかなー。と思っています。

```tsx
// @ts-expect-error
type error = TupleToObject<[[1, 2], {}]>
```

### keyof any

`keyof any` は `any` のキー値、つまり `string | number | symbol`と同じです。

最初これを見たときには、「 `boolean` は入らないのか？」と思ったのですが、 `boolean` は含まれません。

```tsx
type Bool = {boolean: number} //OK

const ok = {true:1, false:2}//OK
const err = {true:1, false:2, true:3}//Error
```

上のコードのように複数回同じ値をキーに取った場合にはエラーになります。しかしこの挙動は `string` や `number` でも同じだろ。と思っているのですが、試しに解答を以下のコードに変えてみるとエラーになります。

```tsx
//Error
type TupleToObject<T extends readonly (string|number|symbol|boolean)[]> = { [t in T[number]]: t };
```

```tsx
//error message
//Type 'T[number]' is not assignable to type 'string | number | symbol'.
//  Type 'string | number | boolean | symbol' is not assignable to type 'string | number | symbol'.
//    Type 'boolean' is not assignable to type 'string | number | symbol'.(2322)
```

これはMapped types自体の制約で、 `{[K in U]: T}`としたときに、制約型である `U`は string, number, symbolの部分型である必要があります。

また、この例のようにTがKに依存しないケースは `Record` 型として定義されており、以下のように活用できます。keysに代入できるのは、string, number, symbol及びそれらのリテラル型で、オブジェクトのプロパティであるTには任意の型が代入可能です。

```tsx
// Record<Keys,T>
type Area = Record<"North"|"Middle",string>;
const area:Area = {
	North: "nothing",
	Middle: "stores"
}
```

## 00014-first-of-array

配列の最初の要素を型として返す型です。

```tsx
type First<T extends any[]> = T extends [infer A, ...infer R] ? A : never
```

[Playground_00014_first_of_array](https://www.typescriptlang.org/play?#code/PQKgUABBCMAsEFoIDECWAnAzgFwgewDMIBBddAQwE9JEE76aAjSkgO2wAs9WXkBXCAAoAAuXYE+ASggBiAKblMLGeTJUaNGVogBFPnJypuGqAEkAtgAcANnPNz2EchADmDuelQBjCAAM0WNgAPAAqAHy+EJzkuNjkANYGTqwkaiy+IZFiACYQ6HLYfOismBCo2ADkpQQYOBBytvbsVVGUlnIAdCYoeOj1AB7kVrbdvmPYmDTYbXJOZNAQALwQANoV5BUANBAVjFs7XhUAulMzc+gATEurAMzbF9vQJ1Cn7RAcCtkLywE4QaroaBhCDAYADdpebByXLYPAQRizdYVV6zD7kbJXH61YIAi7A0HguSQ6FROEIiA3GhjXzdYEANVQcgA7vgUgBxcoACT4jAAXO9sNhLJheaCJl4OB0AFaYDq9FzAOBgEDAMBq0AQAD62p1up1EAAmngihAAMJ4bKzTkeWZ6u3aiAqtXTN6-YIhAZQ1jZUpiSgrI7A5YeuT9L0+1aoVgEDwkbYdBNRmN9ABKRwgAH4SBB+aw5AA3DxqsAa+12iAhAy4U2KJJlvWO1WoKy9WJnADeEAAogBHPjkazbLv9CG4AC+EAI6Dw5h2whdcgQEoHtlYbkwwD42FQ1kwyLAC4gXlrpWWKxow9HQV7-esQTdQRWdwgDxgge2NzCYU2F5HROCN4Dve2KPoI0iLMC0AXM+nbkPyOCeGuEBju+QjgZB0Ffj+UCXv+159kBD4Bt+EB5oW6BYb+V6AXeRF8N6cg1Hm2SofRlpMdClEnAeZweNOWDXOeUAEvOmAIKGo7iWQvQ0A+FSsHg2CkBQlAVN+NAiRM4l-pCUn8bJIGdgADPy6xpAAMqgiQVMh6nceqIBavW+r8OgnCxgAylCwpOc5mqNiW4BQMCHkcKosyUMafSYHg1hbkYJT8hwgrCqKwDipKMpyugCpwMAYiYEyRbBRADLMhAMVxdu3AigKQoimKmAStKsryoqsDAJV8U1TQwIALK9LMpphdYq7rklKUNelTWZa1OXKqqYBAA)

### infer(Type inference in conditional types)

inferを理解するためには、conditional typesを理解しておく必要があります。

#### conditional types

conditional typesは見た目の通り、三項演算子を型定義において利用するものです。

```tsx
T extends U ? A : B
```

`T extends U` がtrueだった場合に、型がAに決まり、falseだった場合にBに決まります。

三項演算子とほぼ同じなので直感的にも理解しやすいかと思います。

#### infer

本題のinferです。inferは日本語にすると「推論」になりますが、その名の通り推論した型を活用するための技術です。conditional typesと合わせて活用します。

説明だけだと分かりにくいのでまず[公式ドキュメント](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)に出ている例を見て、その後説明していきます。

```tsx
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
```

Genericsでは、引数で渡した型を使い回す形になりますが(今回のTypeのように)、inferでは動的に型の値を変形させて活用することが可能です。今回の場合、 `Type` がなんらかの要素を持った配列だった場合、その要素の型を返します。

```tsx
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
const myArr1 = [1,2,3]
const myArr2 = [1,2,"3"]
type MyArr1 = Flatten<typeof myArr1> // number
type MyArr2 = Flatten<typeof myArr2> // number | string
```

このように、inferを活用することでインデックスによるアクセスなどで要素の型に直接アクセスすることなく、推論によって型の値を得ることができるようになります。

ここまで見るとわかるように、最初の回答はinferを使わずに以下のように書き換えることも可能です。

```tsx
type First<T extends any[]> = T extends [T[0], ...T[number]] ? T[0]　:　never
```

また、ややこしいことはせずこれでもOKです。

```tsx
type First<T extends any[]> = T extends [] ? never : T[0]
```

## 00018-tuple-length

```tsx
type Length<T extends readonly unknown[]> = T['length']
```

[Playground_00018_tuple_length](https://www.typescriptlang.org/play?ssl=26&ssc=52&pln=26&pc=1#code/PQKgUABBCMAcEFoIBkCmA7A5gFwBYQHsAzCAFQFcAHAG1UkQUafoCMBPCAZwEt0CD0EABQABHnwEBKCAGJUAQ04cZ2KrXr0ZWiAEVyqTtm4CNUAGIEAThEzcAbhgjyIqmqgA0ENgXIR0qVAATCABjSwVsVCcbDFRLbhCIAAM0LDwkz0oEgGsXXCjaNPxiPKjXdSh6C2tUAA95AFs3U2SkpOxOemw2SjKDamcAXggAbQBySM4Bsc8xhoJA1GoIAGYZiDmFpYgADXXNxeWATTGAXS6eqM5KeRDUHYhh8bMAQWQAYQB5ADkIAE59q8Pj8IAAJACiLwAaidZgARABKLwA4j99gBlUgvBHo0EASQACvtQQBVACyL1+6IJL3e4LMyDxyNBpDOLW6vRc-XkqRw+GGvLwAB5JgMAHxQYDACB1XohSLBAAsF0511u90F-JQGD5QrVdx2EqlMtqcoVEAArPQ2kkWhKodxUAB3QiCZHcbCg8gsABcEFw2GwlE4PqlHRCuAAdAArTiRqyYYBwMAgYBgdOgCAAfRzubzuYgRx81neWzBcSi+arOYgqfTHKimqFpBNkXQgU4EHC8kCAmoHHk6DYI1OEuGpHGhT5bIzIGz1fzZAM2Ag70UBnnC4Lde4TSsK4bEAA3hBwQBHcjyaiecGm1DyiAAXwgREsBAaGxEDYQEavU4MwDkEY1CcGM6YhAIhhclMQyjBM3L7PMhyrIhWzLHssxIdsJynE4nYQeghhgARUH6vcjxwUCXy-ACsxUSCELQrCGyIiiaKzJi2K4oSxLkpSEDUrS9KMsyrK4YooSQdg9aXKE66dk89C3maQrnpe1BCk2DYlKK8hip4ipivpSl3vKqkXlemk6sK2kkGRhqeBaRnuPQxpfpwCCyve2CeZYb6WPQTZOS5krSu5nmmT5cT+YF1m4EKYz5NQ1AEBATpWNQgRjMZ5zpmAmZbnmEBmOQlh4HEAmRMGm6FbWaagPQErorg8jhF4xZcAQ1BAcYhF+gGQYhmGnARjGcYJkmsDAIOnBOnEjUQA6zqdd1RiQf1gbBqGwDhlGsbxpYiZwMAnBdT1kELWSVhRO8LXJTqBgbYN227WNB2YCmaZgEAA)

### Indexed access types

これまですでに、 `T[number]` や `T[key]` など、[indexed access types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) には触れてきているので、今更感もありますが、インデックスによるアクセスで特定のプロパティの型にアクセスすることが可能です。今回は、タプル(というオブジェクト)が持つ `length` プロパティにアクセスしてその型を得ています。

## 00043-exclude

```tsx
type MyExclude<T, U> = T extends U ? never : T
```

[Playground_00043_exclude](https://www.typescriptlang.org/play?#code/PQKgUABBAsDMEFoIFEAeBjANgVwCYFNJEETSiAjATwgC0ALfRgOwHMIAKAAQC8HmWAlBADE+AIYBnasPLYAlpgAuCOUyJFhmiAEVs+CYrkB7NVCIBJALYAHTPkv4miiIoYRZC5apQYcBADwAKgA0EACqAHxEET5YePgQAGYATkaWEIEudEYSCYqU1vpZYs5iyQmSEnIsTGLkdi5G4epQMQBqcvgA7hAmEADicooAEtjkAFwQdIqK1hLjwMCKEuh0AHQAVhJrRskswHBgIMBgp6AQAPpX1zfXEACaRtjJEADCRgQQw-jll7f-Fwgx1O+UKEAAspQ0HEAiFwjEALwZCD4VCKRy4CThCAAfggTHwADcfhBJoFTmBzgD-hl9M5XpIitTbkCTnIbLtnKCEgBvFAAR2wYkwoTQhXQzgAvklUukAOScbkIVbCuysfTAbCGTASOUggoJdCMrFIgDaRDF+Al-mQguF-kh0L8+H8crEcogAB8IHLyB7vXL0HLQm65RFRb54q73V6fX7Y4Hgz73RFU8ELahxYobXbMA6oZGAqGE-GA0GQzGA37w7FndH-XGG4mK03q2mM1mc0K847Cy6DMlVGxvUxsJZyCTvex2EIETFCUY5LgBKEAGLYJgS4xMGtOqMDoex0fjyccGcQOcQBdLlcQdebwwmVPhsAAXQplJAf2ZVzvz1cJIAMronM34-qyn7RBAgF0GUCSUE8LwSEYOCPkw8xTDMcwLEsKzrFsOx7AcsDAGI6FdD8UEdN0EDIah24YdMszzIsyyrJs2y7PscDAHRWoMVB4K7AkrywZgaosPokxMdhrF4RxhEsEcJxgEAA)

### Distributed conditional types

[Distributed conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)とは、Genericsにユニオン型が与えられた際に、conditional typesの条件がユニオン型のそれぞれに対して適用される機能です。

今回はこの機能を用いて、 `T` に渡したユニオン型のそれぞれの要素に対して、順番に `T` が `U` を拡張可能か確認し、拡張可能であれば `never` 、拡張できなければ `T` を返すことで `U` に含まれた型を `T` から除いていきます。

## 00183-awaited

```tsx
type MyAwaited<T extends Promise<unknown>> = T extends Promise<infer A>
	? A extends Promise<unknown>
		? MyAwaited<A>
		: A
	: never
```

[Playground_00183_awaited](https://www.typescriptlang.org/play?ssl=18&ssc=115&pln=18&pc=1#code/PQKgUABBCMAcCcEC0ECCB3AhgSwC4FMATSZJM8kgIwE8IBZTAY23wCsIBlbAawHsAnTBAAUAAQC2TFqwDOPAZgCUEAMT5MM2ioAO-XuOwz8qygFdsAG1xJsAOxIkVTiAEVT+Gbmy97UEgEkAMwh0YwALTAA3YyFcam1jdDDsRjCIQxDBbQTCCDiEiAseYwAFPQMjADoIAAledBDjRkxbCABzfFwIWPjE5NT0mXTbOUJjXDDErJy83oB+CAAxAQh8AA9McW0LY2xg0IgI6IgAAzL9Q3wAHgBRDa2dgBVegD4Tw-q83nbOiDvN7b4Z4JOYOKAvCCPZJDACO7k83laGW0AgIuUC5TykwgAG0BNg2nZMBZuvwvIwdgBdYRhXC4bQyABcwGAY0ilVwvGAkkYcj4gmAmEIkRajCISHyHkY-Gw2ms63w-GYRhkSDhHi8PiQ0CQABYAKzcXXKGi4iRSNh8hTU2n0pkswkTUyUSqMfTci2yeSCRRgiAQgBqLAaPggAHE8DVnYzDnSGczgLgZKlKrJKgI2sA4PAwCBgGAC6AIAB9Utl8tliAATV4pn4EAAwrwxrVFcYKx3SxA8wXJfRqBgcGiro9VmsCLZCENzhVri1qC8IQBeSFjidTiAzy5XOyBRVoCELYSoNf4SfT8rb3f7gBCh4gN4gMdQyhjtnw0X4BbARc7HchGqNhoHgln+5bdvm2BbKiswFAA3n8cLEgANH8awJIwXQAL4QBi+gQAA5KIkpIKkxI7LYHQyMApheBYMgEb2vQQAAGhAK5bkYVyeDKlEvGAfZVuxm6XlxCGBCwFiEG+pjiJQ+5YfxfYAFrCZx1zqdxuC8W0EAAD4QLYsnyfwi5MQUzQqsJOIkHcGG4LcSEWFcdADlgeBEFcLEvKhPF2G0i7IbZ6H4JhjmmMSLluUOnlVj5EDiZJ0mGcZCmBcF9nhZFrmDh5hBXMp8V+ZR+kpXJirpZShbABAxGqus9lIIqehfn2zUrCuOXucORnlaZ34-iAoFgV2ix1hM+4cAQDLDSNEGDSQEIcBE-DGNQtb1jIvAWLRiJMrGdoJkmKZphmWYIIKIyhF+4IQEG+ANFtO2aiMMa2vGLLHWEqYyOm-CZtmwBPbtPgyIt9ACMYDYRBYFFUW9cb2omybfad-25vmYBAA)

### 再帰

関数だけでなく、型でも再帰を活用することが可能です。

最初、私の回答は以下のように、あくまでもテストケースをクリアするためのコードになってしまっていたのですが、回答例に載せたように再帰を使うとより深くネストされたPromiseがあっても適切に型を取り出すことが可能です。

```tsx
type MyAwaited<T extends Promise<any>> = T extends Promise<infer A>
	? A extends Promise<infer B>
		? B
		: A
	: never
```

そのほかの要素は、先に説明したinferやconditional typesなので説明は割愛します。

## 00268-if

```tsx
type If<C extends boolean, T, F> = C extends true ? T : F
```

[Playground_00268_if](https://www.typescriptlang.org/play?#code/PQKgUABBBMBsAcEC0ECSAzSyk91gRgJ4QAKAhgG4CmANhAOI0CuAzgBYDWA9hRABQABAA5l2TAC4cAlBADEVUcVkSAljRZYss7RACKTKi3EquAO01RUAWyE0qVqqfEQyEVeogADDJ4gB3NhUAYzYXIKCqIXEWCCCzABMVYzMvAGFPABoXCHEAJwk2YlyqcSZc0xzCISovABVMl1N47PQydSKSsorxKprPADFPADo03xUYqgAPaqDxKmbxLgh8GqoktipcrzyDXy4tz1b1Kl8AtT76xuaB3yCyCpXG4h7qoYsIfv2IKbIbOwAud6eYHRLAvGoAQQgAF40OgADw7KhZADkZBRqPwKIAfFBgMBvtMqLN5jklo80Siwb0IAAhGFw+FHFjIiCUzE4iD4wkzOYLck1FFYrDAzzvXEANRUVD8EBS9CSAAkmPh-hA2OJxEIWP98dEQkMAFYsIb7ADmwDg8DAIGAYHtoAgAH0Xa63a6IABNLhlCCpLjxGqKzY1d1hl0QW328GM1KEuZNGL4LhcOz3LK1LL9XGwuNTBPxGJIiAAfggtQgav69rAjvDYfLhmcqVEhmd9bdkbtKhs+2cMYA3hAAKIARyYbSyw6JswgAF8IOhclwrGyBOCkCE2nZTGbDMB3CwqWAY3cWTFYQBtLDT3nwscTmjwjCI-Ks9lsrHY1Ho7Hfm8zuI97jm0z4Isy77olk0DfjAf4ZGAAC6DoEuuLBIFMvIYbky65CeNKbLhDIvqYTA0DQP4Yp+OI1rWIDth2Eb9GU4gbFsADKczagxjFdnRWC4uxbBkMUECED6WwsKmqhmDq6qatqurAPqbBGia5qWggwD3CwfibAJEBSjKEBScwySmHJGpajqeosAaxqmrkFpWsApkyRZBkALL7DUqTCeRjh7pZCk2cpdmqQ55o2naYBAA)

今回活用している技術としては、これまでに説明してきたconditional typesとgenericsにおける型引数の制約だけなので、説明は割愛します。

## 00533-concat

```tsx
type Concat<T extends unknown[], U extends unknown[]> = [...T,...U]
```

[Playground_00533_concat](https://www.typescriptlang.org/play?#code/PQKgUABBCsDMsQLQQMIHsB2BjAhgF0iUWJMICMBPCAQQwBMAnAUyoGkGcBnNAN04GsqACgACZZrAAM-DgDYAnFk4BKCAGImXKmpwMOFQoTXGIARQCuTTngCWmQ1ACSAWwAOAGybOmGPBDwAFkwQAFI4PDgAylgMNq5+AAbUejgUAHRYmLh4CRAAZubYtpgQNhj+Qf4UrsGcFNZeaTRVNf44-FYVwXgA7mgQugDm5t6+nE0AKpVo5niusxCcATPudBBkwTgQGEw9AylUgfil2O7mdJ1l83icJxDueAwQaAwXDA4QAGIvEEwAHjg3J4PglQTdCHhqsEAEpWcwPCAAXlQWXwAB4ANoARgAugAaCAYgBMOIAfBBgMBfn8alg8Ew1nh+htCViCSTCKCEh9yQA1Gy7Z7lADiNjwAAlzGQAFwQAJ4OacaWUm5YAJpABW4xeg2AcFgYBAwDAJtAEAA+pardarRAAJozJ7oC4QcVMZgWm1e80QI0myGtdDYdETan0+i3Qr8DBoHoYDH4iAAVTDPjokYw0dj8bJSMJaQLEzxBbSSZxJrAZu9XogEysfhQXE61ZtvuNNjcLz8AeCAG8IABRACO5hw7gJA5pTDpEAAvvkGGhnBAAOQiHuINVjzwYQZWYCzGzuTgr-1QiC4TidZEYwiT2l4NHD0fuNFB7KYxMJ0kE78-u9TnST4jmOb6oo+Ca-riP6smS-5QPe06Ps+oHvui2Lsl+sAEgALGSUHsgS2EQHhpLwYOgHISBr5oRBK5YiuhGrrAK5fnkY5XgSZBoGgng4BgBIrjhrEwRi9GMRARKCSxBLsceTBcTxfECauwlwXiYDlhWVYtranzmAwgTuhAkT0q4ty6bafqgIQ5KRAEujBBQjqLLxh6YEqcoKuZyrAKq6pamkOp6vAwD8ZwPTurZED8oK3BnMUGCefKiq+f5mragwur6sA8XuUl0UALIvMEKAOe4O57sl3lKiqnBqhlQVZYaxpgEAA)

### variadic tuple types

しれっとすでに登場しているのですが、TypeScriptにおいては配列やオブジェクトの値などを展開するときに活用するスプレッド構文を型として活用することが可能です。これは[variadic tuple types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)という機能です。公式ドキュメントの中でも、concatの例が出されていました。

あとは、genericsにおける型引数の制約を活用して引数として受け取る型を配列に制限すればOKです。

## 00898-includes

```tsx
type Includes<T extends readonly unknown[], U> = T extends [infer F, ...infer R]
  ? (<V>() => (V extends F ? 1 : 0)) extends (<V>() => (V extends U ? 1 : 0))
		? true
		: Includes<R, U>
  : false
```

[Playground_00898_includes](https://www.typescriptlang.org/play?ssl=12&ssc=8&pln=11&pc=3#code/PQKgUABBAcCc0QLQQJIDsDGAbArgEwFMBnSJRci0gIwE8I0cssIAKAAQGsa0CAzHDgEoIAYgIBDInRHiATrPE1SpEaogBFHMQAuASwD2aZVBQBbAA5YCpgmm0RtACwIQAUuIBu4gMoZZu83sAAwBBeUUAOl1MXEIiIIh+TD1DCGiHZwcacxcpIm1rCIgQrJyHcQ5iDJdtAHd9CDkAcxwbOyIigBVM-Rxtcz6IIkderDwIKhdxCf19K3E0CCDtWS0E-Vkl3nEsIgIgiOMIADENiAIAD3ELKyOg++0SKG1sl10iAAVdJjkAWVsIABeVAxfDEAA8AG0AOQAaTkRGhABoINCAKJEXR4d66ZGogDq1xwODx0O8C20C3E0IAuijoQARAzQgB8EGAwHOFxyGAK420DUmWx2eyCpHuYqgpDZADVdARahBUgBxXTaAASOCoAC4II5tP0iNqOY8MI4IgArDobJrAODQMAgYBgF2gCAAfU9Xu9XogAE1epsAML6QgQdUEWQuH0xz0QJ1gF5ldDYMFEcGdLkFNB4IgQKPiPCGLB0HBoDhofS1NCQukQACqbOBmcu2dzEEh0V4kZOKIi-a7PYASjTSAB+VjgmUsljCQFslgyrO2dvHCATgCMEF1AAZBMJWyu8ywpzO5wul4ec3n6+uIFvd-uIGAAJAvicrLTPt+6lOxCFDiijakLq2y7AQrogB6sY+hAnQ6BAQaSFUMGwQmugWBs9hJi4ADeEBogAjjgOwomi3IELyEAAL6JLI+imKibA4YgZo7FYaBNMQwB9N8iIujhEAYMhebApCpDkTy2jgkRJFYOCf5plCcIIqSGJYjipKEqYxKkuSdhUrS9LwrIiIsiin4ECy5kSRRvIycROwKaCcTKSZiL0up2KYlpRIkvS+mUmg1J1oyzLmYkIpWTZUCSZR0myU5imuZCG4ogATCiADMKIAKwogAbCiADsdbFRFlnWUitlSQ5cnOamKVpRAmUQDlED5RARUQKVKIACwRWBexVTV8V1UlLkQqlGXZXW6UVas0XVbFdkJY58nJVNzWtVldYbgtWgjSttWJRtk3ppCuHUXW+HiLq0IhNCNGDVFR0Eat41nY1U1ULM8xoDNbV5YVJV1kNVkouDb1xfZp0Nf+F2WYD7Wdd1vUzHMEhoC94HQx9cObRd4PI8DXWg5Dr0WYteMnet8NKZdjT3Y9NE3fmEhFmgJZM6iLPUTjw0xe9tP1YTUL4QWnPc3dvNPddKK3czcsC0to2w3TYupXtEAAD4tSrNNjQT51QluevpXtBtCzDa2iybkIMEwdZloQvDRAQeBW8twtGxr9su3w7t4HWjtYF7YCji6YBuqh3onDgshOD23gFOYeax76CagNKEDeI4cguDQgZDHMvGGEaeoGmnxrAKa5pWhENp2vAwALEQtSRjncoKiXuApGgFf6oaNd15a1qyLa9rAEQpf908EBsr8GwuEG+dMLYXGD1XRomkQZpj43E+Os6YBAA)

一気に難しくなった感があります。自力では解けず、TypeChallengesのソリューションからこの解答を見つけてきて、中身は、テストケースで使われている `Equal` 型 とやっていることが同じということはわかったのですが、関数型の部分がなぜワークしているのかの理解にかなり手こずりました。。。

要は、再帰的に配列の要素と、Uが一致するかをチェックして一致したらtrue、一致しなかったら配列の次の要素で確認。ということをしているのですが、 `<V>` には何も引数を渡していないのに何が確認されているんだ。。という疑問がなかなか解消できませんでした。

```tsx
(<V>() => (V extends F ? 1 : 0)) extends (<V>() => (V extends U ? 1 : 0))
```

この部分では、実は `V` に何か引数を取って確認しているわけではなく、あくまでも `F` と `U` が等しいということを確認するために、関数型を作成しています。そのため、 以下のように右辺の `V` を `K` などに変えてもワークします。

```tsx
(<V>() => (V extends F ? 1 : 0)) extends (<K>() => (K extends U ? 1 : 0))
```

これならば、さらに短縮して以下のように書き換えても良いのでは？と思ってしまいます。

```tsx
F extends U
```

しかしこれだと、以下のケースで `boolean` typeが入ってきた場合に `boolean extends false` が成り立ってしまいダメです。

```tsx
Expect<Equal<Includes<[boolean, 2, 3, 5, 6, 7], false>, false>>
```

そこで、 `F` と `U` の同一性をより厳密に比較するために回りくどい比較方法を取っているのでした。

（これ自分で思いつくことができる気がしない。。。。）

## 03057-push

```tsx
type Push<T extends unknown[], U> = [...T, U]
```

[Playground_03057_push](https://www.typescriptlang.org/play?ssl=22&ssc=46&pln=22&pc=1#code/PQKgUABBDMAMCsB2CBaCAFArgZwBaVRSOIICMBPCAKwEsBDAOwHM9GIAKAAVsZd0YC2AUwAudAJQQAxELrZKUugCcldcgQJStEAIqYh2ETQD2DDVACSAgA4AbIcIYiII3EIhMhDIUpoBjCAA3H2wTBghjADMIAAM4gEEVNQA6axxcOJjzCAAxYyUIIQAPOht7bMyRcmsDP19rEQIqmogAJQNMW2cAXgx0gB4AbQBGABoIACYAXXGAcmhZgD4IYGAIEfGJuYWpgkzs5YA1GiEAdwjwgHEaEQAJTFIALghcERFrbEfVkWw-XGSqNhkvkmMA4EgwCBgGAYaAIAB9RFI5FIiAATWMmAKAGFjAATdy3HzuFGkxEQKEw5ruLB4foAFUKRREXjx2AgmAYAGsGMZTgxBjMIABVZa9QbJSX08bC3awkAIskoiD0gzObFyAyKpWoyk0Gz5ZzUiAAbwgAFEAI6YOi2cbmoo1PzOAC+EEiSmMAggs041JQf1t9mYBmAmCMtmwsyp1Xcfk17PFBAdTpE-StNts-VpuCGQuGi3GIymi0LycdQmd6ettuzAw2kyF8yWRbGk22sxLZagKcraYztZzQ1mw1mmw7QtIxmM9kYhfWI7H7Z9C3GU5nsgYXdGYDl8u1OvhuSxrh8EAAyiyPgedRToaACMtz-wlO5yJiCtgZ+Gwp8Xm8Pi+YAfj+AEgRBMEEEQYBGGwU4fEfCBjjOCAv1sH9TD-V53k+b5fn+QFgSUUFwWgtCMIYbBEIAWXydxsX4Wxg08LCANw4D8LAoimEhaEwCAA)

なぜか急に易化。genericsにおける型引数の制約とvariadic tuple typesの組み合わせです。

## 03060-unshift

```tsx
type Unshift<T extends unknown[], U> = [U, ...T]
```

[Playground_03060_unshift](https://www.typescriptlang.org/play?ssl=22&ssc=49&pln=22&pc=1#code/PQKgUABBDMAMBssIFoIFUB2BnAFgSwDMAXSFZci0gIwE8IArPAQwwHNcWIAKAAUZfY4WAWwCmRJgEoIAYlFMsdGUwBOKpjVKkZOiAEUArqKxE8AewxaoASWEAHADaixGIhCI5R7mna8A3URUscwwIMwIIAANogEE1DQA6A2x8YmjIqwgAMTMVCFEADyZ7J0z0oh9jAGMVPDsSKArfCAAlYwMHNwBedBTCIgAeAG0ARgAaCAAmAF0J2AA+CGBgCCHYCfGpsenSdMzFgDU8UQB3MNCAcTwiAAkDKgAuCBwiIjssB+WiLCqcBPosAlcqxgHBEGAQMAwNDQBAAPoIxFIxEQACaZgMeQAwmYACZeG6BLzIkkIiCQ6FNLyYXD9AYAFXyBSIogwuKwEGSAGsMGYThghrN0IsekM0BMEpL6TsYSB4aTkRB6cY3FiFMZ5QqURS8PZcm4qRAAN4QACiAEcDEwHBNTQVfFU3ABfCAEFRmYQQADkPCpyF+1qcbGMwAMpgcWC9lMqECq6o5otIdodgwtVocAxpqUGgo28wmo2m83zSftokdAzT1szfWIw02Mzm+dW6wgDYgRZLUGT5dTlurWbpQy9Iy9E0mEy90C9QqoZjMThYzaGc4X8gwk9H48n087YzAMtlmq1cOymI8gQgAGUWe9j1ryVDQKRFlehCovDQMXksAuwyEPmeV53k+YBvl+f5AWBUEEFgYAWCwE5AhfCAjlOCBfwcf8LEAl43g+L4fj+AEgRUEEwTgzDsOwFCAFlci8LEhAcINWGMJ48JAwiIJI4EIShMAgA)

Pushの逆で先頭に追加するだけです。

## 03312-parameters

```tsx
type MyParameters<T extends (...args: any[]) => any> =
	T extends (...args:infer U) => unknown
		? U
		: []
```

[Playground_03312_parameters](https://www.typescriptlang.org/play?#code/PQKgUABBDM0IwCYIFoIAUCGAnDBbApgC75YDOkKyV1FARgJ4S4CWAJgPZbMBe+LEACgACLDl14sAlBADE+DKUYzmAOwBmJWYQCuABwA2+WbW3N9hZKooUZtiAEVt+UoWbsV1qAElcBvvhVCCEIACyMTMwtVdGw8IhJSAB4AFQA+CABzAJJmAGMIAHdmUPZtIO1SVQyIYoA6Twh0gDVmfAKIdwgAcWKACW1aAC4IEMJCXVJB4GBCUlyQ2oArUlrODOBYRDAQYDA90AgAfWOT05OIAE1SrAgAYXZWI16SIzO344gdsEJ6XSMAWXomBwBGIZBSEHwAA9iCpWKRBLUkdgMpMIBgVPQANoAXWkAF50hj6Ol8RBkpCYQF4YIKEjaii0aoNDcAKpgAnpbQqADWKnYBQ8UAA-BB2VBhriANx7fYgI7vM7k5xBW4KZwKxXnL7MXycII-P4QADeEAAogBHbQYfQAGnNUL+uSCAF8IGosOxcBAAORCQ34ZDzG2GFRZUjAMpmUg+va5dwud3sdgQMkCFFwYYuLhh+0ohDDFTaXC0EiSYYAN3YbFT6WNLrA8ZUido2FTggzw1oycMGLzWAyBZN6OGPoAgj6IC7yxAqzXCSaG02WxhuO2BDO56xa4u9gGILl1QiyViKGbHfhnYlLdb9IlAcC4mCkgH2Gok+xUvasdmqvaiyWJA4qkX5nheV43ja95ArEoIJIkr7vq2WBfhAWLduwvYqPapoYKOE5TsBoFQOeTqENeVpQQ+sHxOCiEQK23CobiIG2mAOKymABxaqcEAAGLaFgoSaAAysQEyajxny7KAFDpCJITYEY9DXBApCYVGCbDKM4yTNMszzEsKxrBs8AIMAGKkAUJByRALRtGpGmuFpIxjBMUwzHMCzLKsA6mYgwDqfomnNrZ-ycEYtyKfoobhtpbl6Z5hk+Ws2y7GAQA)

使う機能はこれまでと同じです。

個人的には、関数型を書くのにあまり慣れておらず、引数の型を推論する際に `(...args:infer U)` と書く必要があることに気づくのが少し難しかったです。