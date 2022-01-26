---
title: "GitHub ActionsでCI/CDパイプライン構築"
path: "github-actions-ci-cd"
date: "2022-01-27"
update: ""
hero_image: "./martin-adams-a_PDPUPuNZ8-unsplash.jpg"
hero_image_alt: "stream network"
hero_image_credit_text: "Martin Adams"
hero_image_credit_link: "https://unsplash.com/photos/a_PDPUPuNZ8"
tags: [linux,infra,shell,ci/cd,github-actions]
---

さくらVPSにGatsbyで生成したサイトをデプロイすることはできるようになりました。
シェルスクリプトを勉強するきっかけになってよかったです。
ちょっと前にシェル芸はやめよう。みたいなツイートがバズっていましたが、時代の流れに逆行しシェル芸人になりたい気持ちが高まってきています。

## やりたいこと

### 現状

なんともダサい手順を取っています。

1. ビルドする
2. プッシュする
3. マージする
4. ローカルファイルをrsyncでデプロイする

### 理想

半分にします。

1. ビルド＆プッシュする
2. マージ＆デプロイする

これでかっこよくなります。（テストはいまないので、気が向いたらStorybookを入れましょうか。。。）

### ビルドファイルをコミットする

今まではビルドしたファイルは.gitignoreに追加して、gitで管理しないようにしていましたが、GitHubにビルドしてプッシュしたらそのままデプロイできるように、.gitignoreから外してgitで管理するようにしました。

ビルドファイルをコミットするかしないかには議論がありそうですが、今回は以下理由からコミットすることにしました。

- 個人のブログサイトなのでそこまでコードベースが大きくなるわけではない。
- 開発しているのは自分1人だし今後も1人なので、最新とリリース用が離れてコンフリクトなどは起こりにくい。
- GitHub Actionsで依存関係をインストールして、ビルドしてという作業が不要になるので設定が楽そう。

### 【中止】ビルド＆pushのスクリプトを作る

中止理由：いつも通り `git push origin hoge` しそうだから。絶対 `yarn push` にするの忘れる。

プッシュする前にはビルドする。プッシュする前にはビルドする。プッシュする前にはビルドする。何回念仏を唱えても忘れそうです。pushする前にビルドするスクリプトをpackage.jsonに追加します。

```jsx
"scripts": {
    ・
		・
		・
    "push": "gatsby build && git push origin"
  },
```

呼び出す際には以下のコマンドで呼び出します。（これですら間違えて `git push oririn branch-name`しそう。。。）

```jsx
yarn push -- branch-name
```

スクリプトを呼び出す際に、ハイフン２つを入れて、そのあとスペースを開けるとスクリプトに続く引数を渡すことができます。これで、ビルドしてからプッシュすることができるようになりました。

### workflow.yamlを作る

GitHub Actionsを用いて自動実行される作業を定義するためには、rootディレクトリ配下に `.github/workflow/hoge.yaml` ファイルを作りそこに定義していく必要があります。

今回はデプロイの自動化なので `deployment.yaml` ファイルを作成し、定義していきます。

最終的には以下の設定ファイルができました。

```jsx
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

### .shファイルを作る

```jsx
#!/bin/sh
set -eu

KEYPATH="$HOME/.ssh"
if [ ! -d "$KEYPATH" ]; then
  mkdir -p "$KEYPATH"
fi
echo "$secret_key" > "$KEYPATH/key"
chmod 600 "$KEYPATH/key"
sh -c "rsync -vv -azr --delete -e 'ssh -i $KEYPATH/key -o StrictHostKeyChecking=no -p $server_port' ./public/ $user_name@$server_ip:$server_destination"
rm -rf $HOME/.ssh
```

スクリプトが走る条件は色々と設定できます。

1. mainブランチにプッシュされたら（マージもプッシュとして扱われます）
2. 直接mainブランチにプッシュされた場合には走らないようにして、他のブランチからmainブランチにマージされた時だけなど

```jsx
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

より詳細な条件分けも可能で、[こちら](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)に記法が紹介されています。

[actions](https://github.com/actions)もたくさんあるので、使いたいものを調べつつ使うのが良い、

### ハマりポイント：鍵

rsyncを走らせるスクリプトで秘密鍵を使うと思うのですが、環境変数として保存した

- オプションでstrictryhost~~noを入れないとダメだった。詳細は調べてから書く。微妙な気もするが。。。

鍵を作成して、rsyncした際に一発目はエラーになったはず。

このコマンドを実行するとエラーになって

```
#local
sudo rsync -vv -az -e "sudo ssh -i 絶対パス/.ssh/rsync -p your_port_number" 絶対パス/public/ root@your_port_number:/usr/share/nginx/html/sub_domain/

```

実行結果として`rsync --server -vvulogDtprz . 絶対パス/public/`という記述が以前は見えていました。そこで、これをremoteの鍵情報に追加していたと思います。

```
#remote
sudo vi /root/.ssh/authorized_keys
・
・
・
command="rsync --server -ulogDtprz 絶対パス/public/" ssh-rsa ******
・
・
・
```

しかし今回、github actions経由でデプロイしようとすると再度エラーが出て

 `command="rsync --server -logDtprze.iLsfxC --delete . **"` となっていました。メッセージはやはり`protocol version mismatch~~` という感じ。

ここで気づきます。前回は自分のローカルからrsyncした結果とprotocolを合わせるために登録していたので、今回も合わせてやる必要があります。（`-logDtprze.iLsfxC`がなんなのかはちゃんと調べたい。サーバーの種類？）

### シェルスクリプトの解説＆ワークフローの詳細解説も入れる


### その他
試しに`runs-on: ubuntu-latest`で設定していたところを、`runs-on: macos-latest`にしてみたところ、死ぬほど遅くて終わらなかった。どのプロセスが遅いのか、どこかに問題があったのかなど調べていないけどなんでかは少し気になる。