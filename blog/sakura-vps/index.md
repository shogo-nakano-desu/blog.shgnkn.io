---
title: "さくらVPSにホスト"
path: "sakura-vps"
date: "2022-01-24"
update: ""
hero_image: "./imgix-klWUhr-wPJ8-unsplash.jpg"
hero_image_alt: "server"
hero_image_credit_text: "imgix"
hero_image_credit_link: "https://unsplash.com/photos/klWUhr-wPJ8"
tags: [sakura,vps,linux,infra]
---

先日作成したブログをさくらVPSにホストしました。
OS入れてWebサーバ入れて、鍵を作って設定ファイル書いてと真心込めて作業したので、Netifyやfirebase、Vercelなどの進化しているホスティングサービスの凄さを肌身をもって実感することができました。

## 構成
### OS
2022/01/11からCentOS Stream 9がさくらVPSで選択可能になっていたので、最新のOSがいいだろうということでこれを選択しました。

CentOS Stream9の[公式ページ](https://centos.org/stream9/)によると、2027年ごろまでのサポートを想定しているということで、あと５年間は安心してそのまま使えそうです。
Open SSL ver3.00(最新)とTLS1.2より古いバージョンのサポートを終了して、TLS1.2 or 1.3のみサポートすることになっているということで、セキュリティ的にも安心そうです。
サーバーを弄るのは今回が初めてでしたが、CentOS Stream 9の記事はまだ少なく、他のバージョンと異なっているはまったポイントがいくつかあったのでその辺りも後ほど記載できたらと思います。

### リージョン
石狩を選択しました。一番安かったからというのが正直な理由です。石狩が一番寒いから環境的に優しそうな気もしています。（適当）

### メモリ
１Gを選択しました。
年間プランを使っていても差額を払えばアップグレード可能ということだったので、まずは１Gで十分と判断。最初の頃は１Gでも多い気がしたので、ケチるか迷いましたが512MBでもあまり金額が変わらなかったので１Gに落ち着いています。SSDはデフォルトの50GBのままです。

### Webサーバ
Nginxを採用。エンジンエックスと読むことを今回初めて知りました。
ApacheかNginxかどっちを入れるのが良いのか一切わからなかったので、軽く調べてみました。今も自分の用途に対して最適な選択になっているか？と言われると自信はないのですが、今回の用途では最低限問題はなさそうなのでよしとします。いつかしっかりと調査してみたいなーという気はしています。
色々と調べていく中で見えてきたポイントとしては、
- Nginxが後続。シェアとしては伸びてきており、Apacheを追い抜こうとしている。
- Nginxはディレクトリレベルでの設定ができないため、逆にいうと毎回rootまでたどって設定ファイルを探すコストがかからず、パフォーマンスがいい模様。Apacheはその逆。
- ApacheとNginxはそもそも設計が異なっており、Nginxの方がパフォーマンスが良さそう。Apacheは全ての要求（なんの？）に対してプロセスを立ち上げるから無駄が多いみたい。いつかちゃんと調査したい。

**参照記事**<br/>
[NginxとApacheの比較 〜 ウェブサーバー直接対決 〜](https://kinsta.com/jp/blog/nginx-vs-apache/)

[ApacheとNginxについて比較 - Qiita](https://qiita.com/kamihork/items/49e2a363da7d840a4149)

## 作業メモ
ローカルの操作とリモートの操作が混在していてややこしいので、基本的にコードブロックの上部に `#local` `#remote`などと記載するようにしています。
参考にしていただく際にはそれらの表記は無視してください。

### SSH接続ができない。
**【結論】**
CentOS Strema 9ではデフォルトでrootでのパスワードログインができなくなっている。以前のバージョンだとデフォルトは可能な設定になっているので、ネット上の記事は最初にrootでSSH接続して。。。と書いてあるものが多いです。気をつけましょう。
<br/>

鍵の設定をしていないからか？パケットフィルタリングの設定か？など疑い、鍵を設定してさくらVPSの管理画面からOSインストールの際にパケットフィルタリングの設定でTCP 80/443をあけたりして、それでも解決できなかったのでそもそもなぜパスワードでログインできない？と考えググったところ、
[CentOS Stream 9 LAMPサーバインストールメモ【Apache2.4＋MySQL8.0＋PHP8.0】](https://blog.apar.jp/linux/15791/#toc5)を見つけて気づきました。


**【手順】**
さくらが[CentOS Stream 9の設定方法](https://manual.sakura.ad.jp/vps/os-packages/centos-stream-9.html?highlight=%E5%85%AC%E9%96%8B%E9%8D%B5)を出してくれていました。rootでのパスワード認証はデフォルトで不可になっているので、最初は標準ユーザとして設定されているcentosでログインします。


```sh
#local
ssh centos@port_number
```

あとはちょっと古いのですが、[さくらのVPS講座](https://knowledge.sakura.ad.jp/7938/)を参考にしつつ、CentOS Stream 9固有の部分や不要な部分は飛ばしつつ作業をしていきます。
VNGコンソールから以下の容量でログインして
```sh
#remote
login: root
Password: password
```
centosユーザから任意のユーザー名にユーザーを作り替えて、最後にrootユーザーのパスワードを削除したら完了です。
ちなみに、rootユーザーでのパスワードログインがデフォルトで不可になっている理由としては、rootユーザーのパスワードログインが可能になっているとブルートフォース攻撃を受けてroot権限が乗っ取られてしまう可能性があるためです。
もちろん、自分で作成したユーザーでもパスワードログインを可能にしている場合その可能性は残るのですが、パスワードだけでなくユーザー名も当てる必要があるので攻撃の障壁は大きく上がるでしょう。

### 公開鍵認証設定
次に公開鍵認証の設定を行います。
パスワードログインだとまだパスワードを破られるリスクが残るので、念には念を入れておきます。

まずは、 ローカルで鍵を作成します。
```
#local
ssh-keygen -f "~/.ssh/your_key_name"
```
作成したら、リモートのホームディレクトリに 公開鍵である`your_key_name.pub`を移動させたいので、 `scp your_key_name.pub username@your_ip_address:~/` で移動させます。
そして、以下コマンドでリモートに公開鍵リストを作成し、権限を設定します。

```sh
#remote
pwd                                  # ディレクトリを確認して、ホームディレクトリ以外にいる場合にはホームディレクトリに移動
mkdir .ssh                            # ディレクトリ作成
chmod 700 .ssh/                       # 自分以外のアクセスを禁止
mv id_rsa.pub .ssh/authorized_keys    # 公開鍵リスト作成
chmod 600 .ssh/authorized_keys        # 自分以外の読み書きを禁止
```

### portの変更
デフォルトではSSH接続に22番ポートが活用されていますがwell known portということでユーザーネームを片っ端からアタックされて危険です。また、実際には鍵などでセキュリティを高めているのでリスクはそこまでない場合でも、アタックされているログがたくさん残るとログを見たときに邪魔です。
そこで、port番号を任意の番号に変更していきます。
この際に、すでに活用されている or これから活用しうるポートとぶつからないように設定します。
```
#remote
sudo vi /etc/ssh/sshd_config
```
すると、
```sh
#Port 22
```
とコメントアウトされている部分があるのでこの22を任意のポート番号に変えればOKです。
#はコメントアウトされている部分なので削除する必要があります。
私は普段IDEでシンタックスハイライトが効いた状態で開発しているので、一瞬#がコメントアウトということに気づかず設定失敗してしまいました。。

### firewalldのアクティベート
[CentOS Stream 9の設定方法](https://manual.sakura.ad.jp/vps/os-packages/centos-stream-9.html?highlight=%E5%85%AC%E9%96%8B%E9%8D%B5)の中で
firewalldの設定をしたかと思います。
しかし、設定しただけでは動いていないのでactivateしていきます。

```sh
#remote
systemctl status firewalld #firewalldの状態確認
○ firewalld.service - firewalld - dynamic firewall daemon
     Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; vendor preset: enabled)
     Active: inactive (dead)
       Docs: man:firewalld(1)

sudo systemctl start firewalld
systemctl status firewalld
● firewalld.service - firewalld - dynamic firewall daemon
     Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; vendor preset: enabled)
     Active: active (running) since Sat 2022-01-22 14:53:52 JST; 2s ago
       Docs: man:firewalld(1)
   Main PID: 1985 (firewalld)
      Tasks: 2 (limit: 5914)
     Memory: 26.4M
        CPU: 312ms
     CGroup: /system.slice/firewalld.service
             └─1985 /usr/bin/python3 -s /usr/sbin/firewalld --nofork --nopid
```
このような状態になったら起動成功です。
firewallについては[さくらのVPS講座第7回](https://knowledge.sakura.ad.jp/10583/)にて説明してくれていたので、初めて聞いたという方は読んでみるといいと思います。

### Nginxのインストール
CentOS Stream9はRPMパッケージを扱うコマンドは `yum` ではなく `dnf` です。
また、今回Nginxをインストールする際に、EPELリポジトリというものを作成する機会があったのですが、何のことかわからず調べたところ、CentOS標準のリポジトリでは提供されていないパッケージをインストールする際に活用するサードパーティー製リポジトリということでした。他にもサードパーティー製リポジトリは存在していますが、EPELはエンタープライズ向けで信頼性がある模様です。
ただ、デファクトぽくなっているが、RedHat社の公式サポートがあるわけではないので、その点は認識しておいた方が良さそうです。

**参考**
[CentOSなどで使う、EPELってなんだ？ - Qiita](https://qiita.com/charon/items/f5732694515d174851b3)

まずはEPELを導入してNginxを入れる用意をします。

```sh
#remote
sudo dnf config-manager --set-enabled crb
sudo dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
sudo dnf install https://dl.fedoraproject.org/pub/epel/epel-next-release-latest-9.noarch.rpm
```

念の為、`sudo dnf update` で全部最新にしておきます。（意味ないかも）
[nginx: Linux packages](https://nginx.org/en/linux_packages.html#RHEL-CentOS)を見てstableのインストールを進めていたのですが、なぜかインストールできません。サポートしているversionをよく見てみると、centos7 / 8ということで、stream9は入っていないです。
過去の先輩方の記事を見ていくと、dnfデフォルトのNginxはバージョンが古すぎる。という記載がよく見つかったので、dnfからではなく、直接インストールしようとしていたのですがならばと、公式は全部無視してdnfデフォルトのNginxをインストールすることにしました。
この際に、nginxの公式で展開されている `/etc/yum.repos.d/nginx.repo` の設定は消す必要があるので注意です。

dnfからそのままインストールする際には[How To Install Nginx on CentOS 9 Stream](https://idroot.us/install-nginx-centos-9-stream/)を参考にしました。

インストール後に念の為バージョンを確認してみると
```sh
#remote
nginx -v
nginx version: nginx/1.20.1
```
ということで、stableだから別に古いわけでもなかったです。めでたしめでたし。
インストールできたら、Nginxサーバを立ち上げていきます。
```sh
#remote
sudo systemctl start nginx #nginxサーバを立ち上げる
sudo systemctl enable nginx #nginxサーバが自動で起動するようにする
sudo systemctl status nginx #statusの確認
● nginx.service - The nginx HTTP and reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; vendor preset: di>
     Active: active (running) since Wed 2022-01-19 15:47:12 JST; 10min ago
   Main PID: 26081 (nginx)
      Tasks: 3 (limit: 5914)
     Memory: 2.8M
        CPU: 15ms
     CGroup: /system.slice/nginx.service
             ├─26081 "nginx: master process /usr/sbin/nginx"
             ├─26082 "nginx: worker process"
             └─26083 "nginx: worker process"
```

この状態になったらOKです。
自分のIPアドレスをURLで叩いたら、nginxサーバーのデフォルト画面が見えるはずです。  `http://your_ip_address`
しかし、faviconがぐるぐるしていて進まないです。
ここでfirewallを設定していたことを思い出します。
http と https（後ほど使えるようにする）のポートを開ける必要があるので開けます。
```sh
#remote
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --reload
```

これで再度 `http://your_ip_address` でトライするとnginxデフォルトの画面が開けました！`https://your_ip_address`と、httpsで接続しようとするとまだ開けません。
後ほどSSL証明書を取得してhttps通信にも対応できるようにしていきます。

### DNS設定
サーバーのipアドレスを直接URLバーに打ったら接続できるようになりました。今度は、ドメイン名とipアドレスをDNSの設定を行い紐づけていきます。
[ネームサーバ利用申請 - さくらのサポート情報](https://help.sakura.ad.jp/206207381/?_gl=1*1d7h9g4*_gcl_aw*R0NMLjE2NDA5NjMxNzMuQ2p3S0NBaUE4YnFPQmhBTkVpd0Etc0lsTjdfMkdTUlQzUjdybXZESXFUMDRqNmsxRmhJQ0hBMGlYYm42N2pvdVp3bkxRN19zdEczbFlob0NNQzBRQXZEX0J3RQ..&_ga=2.44704547.602954785.1642691223-1592514320.1642759501&_gac=1.185706331.1640963174.CjwKCAiA8bqOBhANEiwA-sIlN7_2GSRT3R7rmvDIqT04j6k1FhICHA0iXbn67jouZwnLQ7_stG3lYhoCMC0QAvD_BwE)を参考に進めていきました。

設定が完了すると、これまでは`http://your_ip_address` としていたところから、  `http://your_domain_name` でアクセスできるようになります。自分の場合は `http://shgnkn.io`です。
次は、SSL証明書を入手して、httpsでの通信ができるように設定していきます。

### SSL証明書の導入
Let’s Encryptを使いました。
[ネコでもわかる！さくらのVPS講座 ～第六回「無料SSL証明書 Let's Encryptを導入しよう」 | さくらのナレッジ](https://knowledge.sakura.ad.jp/10534/)や
[Let's EncryptのSSL証明書で、安全なウェブサイトを公開 | さくらのナレッジ](https://knowledge.sakura.ad.jp/5573/)などを読むと、古い記事なのでcertbot-autoを使うと記述がありますが、現在は非推奨となっているので使わないように注意です。
[certbot-auto更新](https://manual.sakura.ad.jp/vps/startupscript/certbot-caution.html)などには書いてありましたね。
<br/>
ここで問題発生です。
certbot-autoの代わりに、Let's Encryptと通信を行うクライアントとしてcertbotを使うのですが、certbotはdnfにも、epel-releaseにも入っていないので、snapdを活用して入れましょう。と[certbot-auto更新](https://manual.sakura.ad.jp/vps/startupscript/certbot-caution.html)などに書いてあります。
しかし、CentOS Stream 9ではsnapdが使用できません。

ググっていくと、`pip` でインストールする方法がある模様です。[Centos Stream9: Let's Encrypt](https://hirop.mydns.jp/jitaku/2022/01/centos-stream9-lets-encrypt.html)。早速記事にしてくださっていた方がいて助かりました。
ブログ内のapacheはnginxに読み替えて実行していきます。

```sh
#remote
sudo certbot --nginx
```
諸々yesしたり、メアド、ドメインを登録したりしていきます。

```jsx
Could not automatically find a matching server block for shgnkn.io. Set the `server_name` directive to use the Nginx installer.
```

エラー。nginx.confファイルにドメイン名を設定する必要があるとのことで設定していきます。

```sh
#remote
sudo vi /etc/nginx/nginx.conf
```

```sh
#/etc/nginx/nginx.conf
server {
        listen       80;
        listen       [::]:80;
        server_name  shgnkn.io;
        root         /usr/share/nginx/html;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        error_page 404 /404.html;
        location = /404.html {
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
        }
    }
```

設定ができたらリトライしていきます。
```sh
#remote
sudo certbot --nginx
Saving debug log to /var/log/letsencrypt/letsencrypt.log

Which names would you like to activate HTTPS for?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: your_domain
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate numbers separated by commas and/or spaces, or leave input
blank to select all options shown (Enter 'c' to cancel): 1
Certificate not yet due for renewal

You have an existing certificate that has exactly the same domains or certificate name you requested and isn't close to expiry.
(ref: /etc/letsencrypt/renewal/your_domain.conf)

What would you like to do?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: Attempt to reinstall this existing certificate
2: Renew & replace the certificate (may be subject to CA rate limits)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel): 1
Deploying certificate
Successfully deployed certificate for your_domain to /etc/nginx/nginx.conf
Congratulations! You have successfully enabled HTTPS on https://your_domain

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

以下コマンドで、証明書や秘密鍵などのファイルが確認できていたら成功です。

```sh
#remote
sudo ls -l /etc/letsencrypt/live/your_domain
```

`https://your_domain`をブラウザのアドレスバーに入力するとhttps通信ができていることが確認できます。
F12でdevtoolsを立ち上げて、securityをみると証明書を確認することができます。

certbotは優秀で、httpで通信が来た際に、httpsに強制的にリダイレクトするようする設定を自動でしてくれます。あとは証明書の自動更新設定が必要になりそう。

証明書の期限が３ヶ月と短いので、証明書の自動更新も設定しておきたいところです。
cronを活用する方法、certbotにあるタイマーユニットを活用する方法など、複数方法はありそうなので、お好きなもので設定したらOKです。
自分はcronで設定してしまいましたが、うまく設定できているか確認ができていないので、期限が近づいたら見守りたいと思います。

**参考**
[CentOS7にnginxとcertbotを導入してHTTPS環境をさくっと作るの巻](https://blog.trippyboy.com/2020/centos/centos7%E3%81%ABnginx%E3%81%A8certbot%E3%82%92%E5%B0%8E%E5%85%A5%E3%81%97%E3%81%A6https%E7%92%B0%E5%A2%83%E3%82%92%E3%81%95%E3%81%8F%E3%81%A3%E3%81%A8%E4%BD%9C%E3%82%8B%E3%81%AE%E5%B7%BB/#toc5)
[Ceontos Stream9: Let's Encrypt](https://hirop.mydns.jp/jitaku/2022/01/centos-stream9-lets-encrypt.html)

期限の30日以内であれば以下コマンドで手動更新も可能です。

```sh
#remote
sudo certbot renew
```

### サブドメインを設定する
今回/はshgnkn.ioではなく、blog.shgnkn.ioに設定したかったので、サブドメインを切っていく。

まずは、さくらのドメインコントロールパネルでサブドメインを設定。詳細は割愛。

 `/etc/nginx/conf.d` 配下に***.confファイルを作成する。その前に、以下コマンドで何が入っているか調べると、初期は空のはず。

```jsx
ls /etc/nginx/conf.d/
```

```jsx
/etc/nginx/conf.d/blog.conf
server {
    server_name sample.com;

    location / {
        root     /var/www/index;
    }
}

server {
    server_name sub.sample.com;

    location / {
        root     /var/www/sub;
    }
}
```

この状態でnginxをリスタートさせて設定を反映しようとするとエラーになって、サーバーが止まるはず。

```jsx
sudo systemctl restart nginx
```

```jsx
$ systemctl status nginx
× nginx.service - The nginx HTTP and reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; vendor preset: disabled)
     Active: failed (Result: exit-code) since Sun 2022-01-23 10:20:25 JST; 35s ago
    Process: 27025 ExecStartPre=/usr/bin/rm -f /run/nginx.pid (code=exited, status=0/SUCCESS)
    Process: 27026 ExecStartPre=/usr/sbin/nginx -t (code=exited, status=1/FAILURE)
        CPU: 7ms

Jan 23 10:20:25 ik1-437-50721.vs.sakura.ne.jp systemd[1]: Starting The nginx HTTP and reverse proxy server...
Jan 23 10:20:25 ik1-437-50721.vs.sakura.ne.jp nginx[27026]: nginx: [emerg] unknown directive "location/" in /etc/nginx/conf.d/blog.conf:4
Jan 23 10:20:25 ik1-437-50721.vs.sakura.ne.jp nginx[27026]: nginx: configuration file /etc/nginx/nginx.conf test failed
Jan 23 10:20:25 ik1-437-50721.vs.sakura.ne.jp systemd[1]: nginx.service: Control process exited, code=exited, status=1/FAILURE
Jan 23 10:20:25 ik1-437-50721.vs.sakura.ne.jp systemd[1]: nginx.service: Failed with result 'exit-code'.
Jan 23 10:20:25 ik1-437-50721.vs.sakura.ne.jp systemd[1]: Failed to start The nginx HTTP and reverse proxy server.
```

locationがunknownとなっているが、どうやらサブドメインの設定から反映まで数時間〜48時間かかるらしい。ということで様子見。本番ではないから、落ちていても問題なし。

ただここで、httpsへのリダイレクトどうするのだとか、コンテンツをアップするフォルダはどこにするのだとか気になりポイントが出てきます。

以下のあたりの記事を読んでいく

[Nginx の conf ファイルでサブドメインを変数に入れる - Qiita](https://qiita.com/KEINOS/items/45c1d1a130170e88b307)

ただ、色々考えていくと、どうせそんなにサブドメイン切りまくる予定もないのだが、後から変えることは厳しいから、今回ちゃんとキルことにする。設定が有効になっていないと調査もできないから、夜or明日サーバーを立ち上げるところからやる。

⇨サブドメインを立ち上げることができた。

```jsx
sudo vi /etc/nginx/conf.d/blog.conf
```

ここにconfファイルを記述していく。

中身はこんな感じ

```jsx
server{
  server_name blog.shgnkn.io;

  location / {
    root /usr/share/nginx/html/blog;
    index index.html;
  }
}
```

書いたら、nginxをリロードして設定を反映させる。

```jsx
sudo nginx -s reload
```

これで、 `/usr/share/nginx/html/blog` 配下の `index.html` がhttp://blog.shgnkn.ioにアクセスした際に表示されるはずなので、

```jsx
vi /usr/share/nginx/html/blog/index.html
```

で適当なHTMLファイルを作成してみる。

保存したら、http://blog.shgnkn.ioにアクセスしてみると、作成したファイルが表示できているはず。

さて、次はこのファイルに対してもhttps通信ができるようにしていく。

必要な作業はSSL証明書の再発行と、設定ファイルでリダイレクトを設定するところ。

これとかをみると、ワイルドカードを使ってcertbotで証明書を発行できるぽい。

[Let's Encryptによるワイルドカード証明書　～簡単なコマンドオプション解説を添えて～ - Qiita](https://qiita.com/F_clef/items/136d81223c030904523c)

参考に進めてみたが、もともとの設定はcertonlyオプションをつけないで、自動でnginxに設定してしまっていたので、今回も自動で設定した方がよかったかも。txtをDNSに登録してしまったけど、後でやり直す。

この記事とかもみてみると、マニュアルインストールにしてしまうと自動更新が効かなくなるぽい。なので、certbot renewで自動更新できるようにしておいた方が良さそう。

[Let's Encryptのワイルドカード証明書を導入する - Qiita](https://qiita.com/m_sdk/items/13668df6ef9e03c6bf64)

前と同じ方法方で、 以下コマンドでいこうとするとダメ。

```jsx
sudo certbot --nginx -m tsvx7433@gmail.com -d *.shgnkn.io -d shgnkn.io
```

やはりマニュアルでやって、TXT登録をする必要があるかも？続きは後ほど調査。

わかった。ワイルドカード証明書を取ろうとするとTXT登録が必要になるみたい。ならば、今回は何十個もサブドメインを切るわけではないので、自動で証明書を更新できることを優先して、 `[blog.shgnkn.io](http://blog.shgnkn.io)` だけ追加することにする。

```jsx
sudo certbot --nginx -m tsvx7433@gmail.com -d blog.shgnkn.io -d shgnkn.io
```

これでサブドメインもhttps対応させることができた。

リダイレクトはすでに設定してあるので、サブドメインの `[http://blog.shgnkn.io](http://blog.shgnkn.io)` にアクセスしても自動でhttpsにリダイレクトしてくれる。

あとはコンテンツをアップロードしたらいよいよ完了！

### Gatsbyファイルをアップロードする。

ここまでで、https通信などは可能になったが、まだコンテンツは何もない。書いた記事をアップしたい。どうする？

いまは一旦手でやるとして、rsyncでgithubactionsを活用して自動デプロイできるようにワークフローを組んでいるのやりたい。これは別記事にしよう。

[Gatsby.js製ブログをセルフホストしているサーバーにデプロイする | Yucchiy's Note](https://blog.yucchiy.com/2020/02/deployment-to-self-hosted-server-for-gatsbyjs/)

まずはrsyncが入っていなかったので入れる。

```jsx
$sudo dnf list rsync
$sudo dnf install rsync
```

‘ssh -p 22’の22には自身で設定しているポート番号を入れます。

```jsx
rsync -auvz -e 'ssh -p 22' /Users/shogonakanodesu/dev/js/blog-shgnkn-gatsby/public/ shogo@133.125.38.225:/usr/share/nginx/html/blog/
```

するとPermission denied (13)の大量のエラー。

ローカルでrsyncを実行すると、remoteのrsyncも動くのだが、そっちではsudoなどをしていないただのユーザーが動くため、書き込み権限がなくてエラーになっている。という仕組みのよう。

rootでログインはできない状態で保ちたいので、作成したuserでどうにかやりたい。

古いが、以下の記事などを読むと、 `--rsync-path`   オプションを指定して、sudo rsyncが呼び出されるようなスクリプトを作成しておいておけばいいとのこと。

[セキュアな rsync - 理屈編 - JULY's diary](https://july-diary.hatenablog.com/entries/2011/11/27)

[セキュアな rsync - 実践編 - JULY's diary](https://july-diary.hatenablog.com/entry/20130327/p1)

もっといい方法があったようなので、おすすめされてる方を見る

[rsync + cron + ssh （rsyncd を立てない編）](http://www2s.biglobe.ne.jp/~nuts/labo/inti/cron-rsync-ssh-nodaemon.html)

```jsx
local
sudo ssh-keygen -N "" -f ~/.ssh/rsync
```

```jsx
remote
mkdir -m 700 tmp
```

```jsx
local
sudo scp -P 51995 ~/.ssh/rsync.pub shogo@133.125.38.225:~/tmp
```

```jsx
remote
sudo sh -c 'mkdir /root/.ssh'
sudo sh -c 'touch /root/.ssh/authorized_keys'
sudo sh -c 'cat ~nuts/tmp/rsync.pub >> /root/.ssh/authorized_keys'
systemctl restart sshd
```

```jsx
local
sudo ssh -i ~/.ssh/rsync -p your_port_number root@your_ip_address
```

```jsx
local
sudo rsync -vv -az -e "sudo ssh -i /Users/shogonakanodesu/.ssh/rsync -p 51995" ~/dev/js/blog-shgnkn-gatsby/public/ root@133.125.38.225:/usr/share/nginx/html/blog/
```

できた！！！！！！！！！！

これで鯖管デビュー。後ほど、自動デプロイなど設定していきたい

### 最後に、不要なファイルを消していく

サブドメインではなく、メインドメインで色々始めてしまったので、いらないファイルが `/usr/share/nginx/html`　に残ってしまっている。これを消していく