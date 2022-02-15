---
title: "GitHub ActionsでCI/CDパイプライン構築"
summary: "GitHub Actionsで自動ビルド＆デプロイフローを構築しました。セキュリティを意識してブログサーバーを立てていたので、デプロイが少しややこしく、シェルスクリプトでゴニョゴニョしています。"
path: "github-actions-ci-cd"
date: "2022-01-27"
update: ""
hero_image: "./martin-adams-a_PDPUPuNZ8-unsplash.jpg"
hero_image_alt: "stream network"
hero_image_credit_text: "Martin Adams"
hero_image_credit_link: "https://unsplash.com/photos/a_PDPUPuNZ8"
tags: [linux,infra,shell,ci/cd,github-actions]
---

前回のブログで、さくらVPSにGatsbyで生成したサイトをデプロイすることはできるようになりました。
しかし、rsyncコマンドでローカルからデプロイするというなんとも言えない状態でださかったので、今回はタイトルの通りGitHub Actionsを使って自動デプロイの仕組みを構築しました。
やったことは至って普通なのですが、セキュリティに拘った結果rsyncコマンドの中身とサーバーの設定で少し時間を溶かしてしまいました。

また、今回シェルスクリプトを書いてみて、勉強してみたいと思うきっかけになってよかったです。

ちょっと前にシェル芸はやめよう。みたいなツイートがバズっていましたが、時代の流れに逆行し一流シェル芸人になりたい気持ちが高まってきています。

## 今回やったこと
ビルド⇨デプロイまでの作業を以下のように変えました。

### 設定前
1. ビルドする
2. プッシュする
3. マージする
4. rsyncでデプロイする

### 設定後
1. プッシュする
2. マージする

工程が半分になりました。気持ちがいいですね。

タイトルにはカッコつけて「CI/CDパイプライン構築」と書いていますが、今回導入した仕組みではビルド＆デプロイの自動化しかしておらず、まだテストは導入できていません。次デザインをガラッと変えたくなった時にでも、Storybookを入れようかなと思っています。

## 詳細
ここからは、備忘録も兼ねて詳細を記載していきます。

### ビルドファイルをコミットするかしないか問題
私は今までビルドファイルをコミットしない派だったのですが、ビルドファイルをコミットする派もあるようでした。

なぜここで悩んだのかというと、GitHub Actionsではビルドも自動化することができるのですが、GitHub Actionsに登録するワークフローが増える＆ビルド結果が異なってバグが起きたりしたら面倒だなーと思い、ならば手元でビルドしたファイルをGitHubにもプッシュして、それをそのままデプロイするようにすればいいじゃないか。と思ったのが始まりです。

ただ、結果的にこの戦略を取ることはやめてGitHub Actions上でビルド＆デプロイを行うことにしました。

理由は、「push前にビルドすることを忘れそうだから」の１点だけです。

最初は `package.json`のスクリプトに以下コマンドを登録しておいて、プッシュする際には `git push origin hoge`ではなく`yarn push origin hoge`にする方法を考えたのですが、他のリポジトリでは`git push~~`しているのでどう考えても間違えてしまいそうということで却下しました。
```json
"scripts": {
    ・
		・
		・
    "push": "gatsby build && git push origin"
  },
```

スクリプトを呼び出す際は、ハイフン２つを入れて、そのあとスペースを開けるとスクリプトに続く引数を渡すことができます。

これで、ビルドしてからプッシュすることができるようになるのですが絶対間違える自信があります。

```shell
yarn push -- branch-name
```

一方、1人で開発している場合にはビルドファイルをコミットすることには以下のメリットもあるなと思ったので、今後の選択肢からはまだ消えていません。デバックを早くしたい時とかにはローカルでビルドした方が早いのでいいかもしれません。
- 開発しているのは自分1人だし今後も1人なので、最新とリリース用が離れてコンフリクトなどは起こりにくい。
- GitHub Actionsで依存関係をインストールして、ビルドしてという作業が不要になるので設定が楽。
- ローカルだと依存関係のインストールが都度都度は不要でビルドが早い。基本的にはCI/CD回している間放置でいいのであまり問題にならないはずだが、デバッグする際には早くて楽。


### workflow.yamlを作る
ここからが今回の本題です。

GitHub Actionsを用いて自動実行される作業を定義するためには、rootディレクトリ配下に `.github/workflow/hoge.yaml` ファイルを作りそこに設定を定義していく必要があります。

今回はデプロイの自動化なので `deployment.yaml` ファイルを作成しました。

最終的なファイルは以下で、シェルスクリプトだけ別で１つ書きました。

```yaml
# .github/workflow/deployment.yaml
name: Deployment to sakura-vps

on:
  push:
    branches:
      - main
env:
  secret_key : ${{secrets.SECRET_KEY}}
  server_port : ${{secrets.SERVER_PORT}}
  server_ip : ${{secrets.SERVER_IP}}
  user_name : ${{secrets.USER_NAME}}
  server_destination : ${{secrets.SERVER_DESTINATION}}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Node.js setup
        uses: actions/setup-node@v2
        with:
          node-version: 16.x
      - name: Get yarn cache directory path
        id: yarn-cache-dir-path
        run: echo "::set-output name=dir::$(yarn cache dir)"
      - uses: actions/cache@v2
        id: yarn-cache # use this to check for `cache-hit` (`steps.yarn-cache.outputs.cache-hit != 'true'`)
        with:
          path: ${{ steps.yarn-cache-dir-path.outputs.dir }}
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-yarn-
      - run: yarn install
      - run: yarn build
      - name: change permissions
        run: chmod +x ./sync.sh
      - name: deploy
        run: ./sync.sh
```

```shell
#./sync.sh

#!/bin/sh
set -eu

KEYPATH="$HOME/.ssh"
if [ ! -d "$KEYPATH" ]; then
  mkdir -p "$KEYPATH"
fi
echo "$secret_key" > "$KEYPATH/key"
chmod 400 "$KEYPATH/key"
sh -c "rsync -vv -azr --delete -e 'ssh -i $KEYPATH/key -o StrictHostKeyChecking=no -p $server_port' ./public/ $user_name@$server_ip:$server_destination"
rm -rf $HOME/.ssh
```

### workflow起動条件
条件は色々と設定できます。

今回は１で設定しましたが、２やその他より細かくブランチを指定した条件も作り込むことが可能です。

記法は[こちら](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)に紹介されています。


1. mainブランチにプッシュされたら（マージもプッシュとして扱われます）
2. 直接mainブランチにプッシュされた場合には走らないようにして、他のブランチからmainブランチにマージされた時だけなど

```yaml
# 1. 今回の設定
on:
  push:
    branches:
      - main

# 2. マージされた時だけ走らせる（mainブランチに直接プッシュはダメ）
on:
  pull_request:
    branches:
      - main
    types: [closed]

jobs:
  job:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
```

### 環境変数
```yaml
env:
  secret_key : ${{secrets.SECRET_KEY}}
  server_port : ${{secrets.SERVER_PORT}}
  server_ip : ${{secrets.SERVER_IP}}
  user_name : ${{secrets.USER_NAME}}
  server_destination : ${{secrets.SERVER_DESTINATION}}
```
yamlファイルの中では環境変数を設定して、使用することが可能です。

環境変数は`.env`ファイルではなく、https://github.com/username/repository_name/settings/secrets/actions から設定できます。


### Node.jsセットアップ
```yaml
- uses: actions/checkout@v2
- name: Node.js setup
  uses: actions/setup-node@v2
  with:
    node-version: 16.x
```
Node.jsはバージョン16系を活用しています。

最初に書いてある、 `actions/checkout@v2`はリポジトリのコンテンツにアクセス可能にするためのライブラリです。

### キャッシュの活用
```yaml
- name: Get yarn cache directory path
        id: yarn-cache-dir-path
        run: echo "::set-output name=dir::$(yarn cache dir)"
- uses: actions/cache@v2
  id: yarn-cache # use this to check for `cache-hit` (`steps.yarn-cache.outputs.cache-hit != 'true'`)
  with:
    path: ${{ steps.yarn-cache-dir-path.outputs.dir }}
    key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
    restore-keys: |
      ${{ runner.os }}-yarn-
```
[actions/cache](https://github.com/actions/cache/blob/main/examples.md#node---yarn)から詳細は確認できますが、依存とビルド結果をキャッシュしてワークフローの実行を高速化するための設定をしています。

キャッシュした時としていない時とでどのぐらい速度に差が出るのかはテストしていないので不明ですが、気になるところです。

### ビルド＆デプロイ
```yaml
- run: yarn install
- run: yarn build
- name: change permission
  run: chmod +x ./sync.sh
- name: deploy
  run: ./sync.sh
```

これが今回の肝です。

大枠の流れは
1. パッケージをインストールしてビルド、その後 `./sync.sh`ファイルを実行。
2. スクリプト内で環境変数を使って鍵を作成して、rsyncでデプロイ。
3. 最後に鍵を削除して終了。

という流れになっています。

ビルドまではスルーして、その先から見ていきましょう。

#### `./sync.sh`ファイルの実行権限を付与
```yaml
- name: change permission
  run: chmod +x ./sync.sh
```
ワークフロー内でファイルに定義したコードを実行するためには、実行権限を付与する必要があります。そのため、chmodコマンドで `./sync.sh`に対する実行権限を付与しています。

#### 鍵を使ってrsyncでデプロイ
```yaml
- name: deploy
  run: ./sync.sh
```
ここでは、`./sync.sh`に書いた以下のシェルスクリプトを実行しています。

```shell
#!/bin/sh
set -eu

KEYPATH="$HOME/.ssh"
if [ ! -d "$KEYPATH" ]; then
  mkdir -p "$KEYPATH"
fi
echo "$secret_key" > "$KEYPATH/key"
chmod 400 "$KEYPATH/key"
sh -c "rsync -azr --delete -e 'ssh -i $KEYPATH/key -o StrictHostKeyChecking=no -p $server_port' ./public/ $user_name@$server_ip:$server_destination"
rm -rf $HOME/.ssh
```
シェルスクリプトは今まで真面目に調べたり活用したりしてこなかったので、今回は入門としていい経験になりました。

[マーケットプレイス](https://github.com/marketplace?type=&verification=&query=rsync+)で探すと、rsyncに関わるサードパーティー製ライブラリもあったのですが、記述量があるわけではない＆ちょうどいい練習になりそうということで、今回は自作しました。

まず、`#!/bin/sh`とShebangを書きます。
[#!/bin/sh は ただのコメントじゃないよ！ Shebangだよ！](https://qiita.com/mohira/items/566ca75d704072bcb26f)で紹介してくださっていますが、ただのコメントではないということを初めて知りました。

次に、`set -eu`でシェルの設定を変えます。今回は`e`でコマンドが１つでもエラーになったら直ちにシェルを終了して。`u`で設定していない環境変数があったらエラーになるようにしています。

```shell
#./sync.sh
KEYPATH="$HOME/.ssh"
if [ ! -d "$KEYPATH" ]; then
  mkdir -p "$KEYPATH"
fi
```
GitHubデフォルトの環境変数である`$HOME`を使って`KEYPATH`ディレクトリが存在していなかったらディレクトリを作成するようにしています。

そして、作成したディレクトリに鍵を格納します。

```shell
#./sync.sh
echo "$secret_key" > "$KEYPATH/key"
chmod 400 "$KEYPATH/key"
```
`$secret_key`は環境変数で前回[さくらVPS × CentOS Stream 9 × Nginxでホスト](https://sakura-vps-centos-nginx)で設定したrsyncコマンド用の鍵の中身を設定しておきます。

鍵の中身は以下のようになっているかと思いますが、最初の行と最後の行も含めて全部設定しておく必要があります。
```
-----BEGIN OPENSSH PRIVATE KEY-----
・
・
・
-----END OPENSSH PRIVATE KEY-----
```
まずは、`echo "$secret_key" > "$KEYPATH/key"`で設定した鍵を`"$KEYPATH/key"`として書き出して、
作成した鍵ファイルに対して`chmod 400 "$KEYPATH/key"`で読み込み権限を付与しています。

```shell
#./sync.sh
sh -c "rsync -azr --delete -e 'ssh -i $KEYPATH/key -o StrictHostKeyChecking=no -p $server_port' ./public/ $user_name@$server_ip:$server_destination"
```
[前回](https://sakura-vps-centos-nginx)設定したコマンドに近いのですが、環境変数と`--delete`オプションを追加して、デプロイで存在しないファイルがリモートにあった際に削除するようにしています。

また、`StrictHostKeyChecking=no`を設定しておかないとワークフローからデプロイすることができません。
このオプションをnoにしていると、鍵情報が漏れた際に別のPCなどからssh接続ができるようになってしまうのでできればしたくないのですが、前回のブログでも書いた通り、rootではrsyncコマンド以外実行できないようにしているので、今回はワークフローを構築するために許容しています。

もしroot権限で実行可能なコマンドを制御していない場合には、`StrictHostKeyChecking=no`にしない方が良さそうです。
詳細は [sshのホスト鍵を無視する方法](https://kaworu.jpn.org/security/ssh%E3%81%AE%E3%83%9B%E3%82%B9%E3%83%88%E9%8D%B5%E3%82%92%E7%84%A1%E8%A6%96%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95)を読ませていただきました。

```shell
#./sync.sh
rm -rf $HOME/.ssh
```
最後にデプロイが終わったら、念の為鍵を削除しておきます。

さてこれで、設定は終わりな気がしますが、このままワークフローを実行するとエラーになってしまいます。

```shell
protocol version mismatch~~
```
というような内容を含むエラーメッセージが出るはずです。
ここで気づきます。前回は自分のローカルからrsyncした結果とprotocolを合わせるために登録していたので、今回も合わせてやる必要があります。

```shell
#./sync.sh
sh -c "rsync -vv -azr --delete -e 'ssh -i $KEYPATH/key -o StrictHostKeyChecking=no -p $server_port' ./public/ $user_name@$server_ip:$server_destination"
```
`-vv`オプションをrsyncに追加して処理中の経過ファイル名を表示するようにしておきます。その状態でワークフローを実行すると以下のようなエラーメッセージが追加されているはずです。

```shell
rsync --server -vvlogDtprze.iLsfxC --delete . **
```

これから、`vv`オプションを取り除いて、remoteの`/root/.ssh/authorized_keys`先頭のcommandに追加します。
```shell
#remote
sudo vi /root/.ssh/authorized_keys
・
・
・
command="rsync --server -logDtprze.iLsfxC --delete 絶対パス/public/" ssh-rsa ******
・
・
・
```
これで問題なく実行できるはずです。
余計なファイル名が表示されないよう、再度`-vv`オプションを削除して完了です。
```shell
#./sync.sh
sh -c "rsync -azr --delete -e 'ssh -i $KEYPATH/key -o StrictHostKeyChecking=no -p $server_port' ./public/ $user_name@$server_ip:$server_destination"
```

### その他
試しに`runs-on: ubuntu-latest`で設定していたところを、`runs-on: macos-latest`にしてみたところ、処理にめちゃくちゃ時間がかかり終わりませんでした。
どのプロセスが遅いのか、どこかに問題があったのかなど、今回は調査できていないのですが気になるところです。機会があれば調べてみたいと思います。

<br/>
シェル芸人に俺はなる。