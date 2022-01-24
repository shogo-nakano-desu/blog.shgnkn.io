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

**参考**<br/>
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
ここまで設定しておいてなんですが、自分は`shgnkn.io`ではなくサブドメインを切って`blog.shgnkn.io`でホストしたかったのです。ということで、サブドメインを切っていきます。

まずは、さくらのドメインコントロールパネルでサブドメインを設定します。詳細は割愛しますが、[この方のブログ](https://mekori.hatenablog.com/entry/2013/04/20/231157)の前半が参考になります。管理画面が少し異なりますが、操作はほぼ一緒です。
設定から反映まで数分〜48時間程度かかるということなので気長に待ちます。

今回私は、大量のサブドメインを切る予定があるわけでもないので、変数を使って対応したりはしないでシンプルに設定していきます。
まずはconfファイルを設定します。このファイルを作成する前は、`/etc/nginx/conf.d/`配下は空のはずです。
```sh
#remote
sudo vi /etc/nginx/conf.d/sub_domain.conf
```
```sh
#/etc/nginx/conf.d/sub_domain.conf
server{
  server_name sub_domain.your_domain;

  location / {
    root /usr/share/nginx/html/sub_domain;
    index index.html;
  }
}
```

忘れずにNginxをリロードして設定を反映させます。

```sh
#remote
sudo nginx -s reload
```

これで、 `/usr/share/nginx/html/sub_domain` 配下の `index.html` が`http://sub_domain.your_domain`にアクセスした際に表示されるはずなので、適当なHTMLファイルを作成して確認します。

```sh
vi /usr/share/nginx/html/sub_domain/index.html
```
```
#/usr/share/nginx/html/sub_domain/index.html
Contents will be here
```

保存して、`http://sub_domain.your_domain`にアクセスしてみると、`Contents will be here`と表示できているはずです。

さて、次はサブドメインに対してもhttps通信ができるようにしていきます。
必要な作業はSSL証明書の再発行です。
サブドメインに対してhttp通信がなされた場合のリダイレクト設定も必要かと思っていたのですが、設定ファイルをみるとすでに設定できていたので不要でした。

「certbot サブドメイン」などで検索すると、いかなるサブドメインに対しても有効なワイルドカード証明書に関する記事が多数出てくるかと思います。しかし、ワイルドカード証明書だと更新作業を行う際に、DNSにTXTを登録する必要があったりして自動更新の設定が厳しそうです。（もしできる方法あったらぜひ教えてください！）
今回はサブドメインを１つしか切らない＆今後も大量に切る予定はないということで、ワイルドカード証明書は使わずに、１つのサブドメインだけ追加していきます。

```sh
#remote
sudo certbot --nginx -m your_email_address -d sub_domain.your_domain -d your_domain
```

これでサブドメインもhttps対応させることができました。
`https://sub_domain.your_domain`にアクセスできるようになっているはずです。
リダイレクトはすでに設定できているはずなので、サブドメインの `http://sub_domain.your_domain` にアクセスしても自動でhttpsにリダイレクされることが確認できるかと思います。

最後にコンテンツをアップロードしたらいよいよ完了です！

### Gatsbyで生成したファイルをデプロイする
今後はGitHub Actionsなどを活用して自動でデプロイできるようにしていきたいと思いますが、今回は初回なので手動rsyncで真心を込めてデプロイしていきたいと思います。
自動デプロイはまた後ほど、設定したら記事にしていきいたいと思います。

<br/>
まずはrsyncが入っていなかったので入れていきます。
```sh
#remote
sudo dnf install rsync
```
ローカルにも入っていなかったら入れます。


```sh
#local
rsync -auvz -e 'ssh -p your_port_number' public以下のフォルダ user_name@ip_address:/usr/share/nginx/html/sub_domain/
```

するとPermission denied (13)の大量のエラーが吐かれました。
rsyncの仕組みとして、ローカルでrsyncを呼ぶと、ファイルのシンク先リモートでもrsyncが起動して、お互いが通信してファイルが渡されるのですが、その際にリモートではsudoなどをしていないただのユーザーアカウントが動くので、書き込み権限がなくてエラーになっている模様です。
rootでログインはできない状態で保ちたいので、作成したuserでどうにかやりたい。

古いが、以下の記事などを読むと、 `--rsync-path`   オプションを指定して、sudo rsyncが呼び出されるようなスクリプトを作成しておいておけばいいとのこと。
ググると、「rootでログインするといいよ」「パスワードは不要にするといいよ」などの記事が見つかりますが、今後自動デプロイすること、rootログインを可能にして作業した後に不可に戻すのを忘れそうなことを考えると、なんとかもっとセキュアな方法を取りたいところでした。
そこで以下複数記事を参考にさせていただき、最終的に[rsync + cron + ssh （rsyncd を立てない編）](http://www2s.biglobe.ne.jp/~nuts/labo/inti/cron-rsync-ssh-nodaemon.html)を参考に「鍵を作り特定の操作に対してだけrootで操作可能な権限を渡して操作」という方法を取ることにしました。
**参考**
[セキュアな rsync - 理屈編 - JULY's diary](https://july-diary.hatenablog.com/entries/2011/11/27)
[セキュアな rsync - 実践編 - JULY's diary](https://july-diary.hatenablog.com/entry/20130327/p1)
[パスワードありsudoでrsyncするシェルスクリプト](https://qiita.com/hnakamur/items/d0d37a1051d8a398f5d1)
上記記事のコメント欄にある、以下の記事を参考に作業しました。
[rsync + cron + ssh （rsyncd を立てない編）](http://www2s.biglobe.ne.jp/~nuts/labo/inti/cron-rsync-ssh-nodaemon.html)

鍵を作成。-Nオプションでパスフレーズは空にしておく
```sh
#local
sudo ssh-keygen -N "" -f ~/.ssh/rsync
```
すぐ消すが、念の為権限を絞ってtmpフォルダを作成
```sh
#remote
mkdir -m 700 tmp
```
sshd_configを書き換え
```sh
#remote
sudo vi /etc/ssh/sshd_config
.
.
.
#PermitRootLogin no
PermitRootLogin forced-commands-only
.
.
.
```

ローカルの公開鍵をリモートに転送
```sh
#local
sudo scp -P your_port_number ~/.ssh/rsync.pub user_name@your_iP_address:~/tmp
```

私の場合は、rootに.sshフォルダが存在していなかったので作成。もしすでに作成されている場合には、最初の２つのコマンドは飛ばしてOK。最後に忘れずにsshdの再起動とtmpフォルダの削除を行います。
```sh
#remote
sudo sh -c 'mkdir /root/.ssh'
sudo sh -c 'touch /root/.ssh/authorized_keys'
sudo sh -c 'cat ~nuts/tmp/rsync.pub >> /root/.ssh/authorized_keys'
systemctl restart sshd
sudo rm -rf ~/tmp
```

ここまでで、実行コマンドを限定した接続ができるはずなのでテストします。
まずは、鍵ファイルにlsコマンドを入れてみます。
```sh
#remote
sudo vi /root/.ssh/authorized_keys
・
・
・
command="ls" ssh-rsa ******
・
・
・
```
ローカルから接続してみます。
```sh
#local
sudo ssh -i ~/.ssh/rsync -p your_port_number root@your_ip_address
```
lsが実行されて、すぐに接続が切れたら成功です。

先ほどlsコマンドを入れた箇所には実際に走らせるコマンドを入れる必要があるので、そのコマンドを取得します。
```sh
#local
sudo rsync -vv -az -e "sudo ssh -i 絶対パス/.ssh/rsync -p your_port_number" 絶対パス/public/ root@your_port_number:/usr/share/nginx/html/sub_domain/
```
すると、実行結果として`rsync --server -vvulogDtprz . 絶対パス/public/`という記述が見えるかと思います。ここから-vvオプションを取り除いたコマンドを登録していきます。

```sh
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

これで設定は完了したはずなので、ローカルからrsyncを呼び出してみます。
```sh
#local
sudo rsync -vv -az -e "sudo ssh -i 絶対パス/.ssh/rsync -p your_port_number" 絶対パス/public/ root@your_port_number:/usr/share/nginx/html/sub_domain/
```
実行結果を確認してみましょう。`https://sub_domain.domain`にアクセスすると、Gatsbyでビルドしたページが表示されているはずです。
リモートの`/usr/share/nginx/html/sub_domain/`配下も確認してみると、ビルドしたファイルが格納されているはずです。
```sh
#remote
sudo ls /usr/share/nginx/html/sub_domain/
```

### 最後に、不要なファイルを消していく
サブドメインではなく、メインドメインで色々始めてしまったので、いらないファイルが `/usr/share/nginx/html`に残ってしまっています。これらを気をつけながら `rm -rf`コマンドで削除していきます。全部削除できたら、`https://your_domain`をURLバーに打ち込んでも403 Forbiddenになるはずです。


### 最後に
これで自分も鯖管デビューです。独自ドメインがあるとテンションが上がりますね。
これを機に、アウトプットの習慣をつけていけたらと思います。