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

さくらVPSへの申し込みをした際のめも

### 選択したOS

2022/01/11からCentOS Stream 9がインストール可能になっていたので、最新のOSがいいだろうということでこれを選択。

CentOS Stream9の[公式ページ](https://centos.org/stream9/)によると、2027年ごろまでのサポートを想定しているということで、あと５年間は安心してそのまま使えそうです。

- [ ]  Open SSL ver3.00(最新)とTLS1.2より古いバージョンのサポートを終了して、1.2 or 1.3のみサポートすることになったから、セキュリティ的にいいはず。という話を調べて書きたい。

また、Open SSL の最新版バージョン

### 選択したリージョン

石狩を選択。一番安かったからというのが正直な理由。別の理由としては、石狩が一番寒いから環境的に優しそうかと思った。

### メモリ

１Gを選択。年間プランを使っていても差額を払えばアップグレード可能ということだったので、まずは１Gで十分と判断。最初の頃は１Gでも多い気がしたので、ケチるか迷ったが512MBでもあまり金額が変わらなかったので１Gで契約。SSDはデフォルトの50GBのまま。

書いていて思ったが、これらは全部「構成」としてまとめて記事にした方が良さそう。

### いきなり、SSH接続ができない。

- サーバーは起動した。だがしかし、rootユーザーでSSH接続ができない。
- ちょっとググって、[この記事](https://kaworu.jpn.org/linux/ssh%E3%81%AEPermission_denied%E3%82%92%E8%A7%A3%E6%B1%BA%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95)とか読んだ感じだと、「あー公開鍵が設定できてないのか。登録も設定もしてないわそもそも」と思い鍵を作り出す。
- 待てよと。その前に、そもそもパスワードでログインできないことがおかしい。デフォルトはパスワードログインのはず。ということで、まだ何もしていないしOSさインストールをすることに。この際に、パケットフィルタリングでwebを選択して、TCP 80/443をあけた。
- これに従って設定を進める

[](https://manual.sakura.ad.jp/vps/support/security/firstsecurity.html?highlight=teraterm)

- それでもログインできない。そこで原因解明。centOS stream 9ではデフォルトでrootでのパスワードログインが無効になっているとのこと。

[CentOS Stream 9 LAMPサーバインストールメモ【Apache2.4＋MySQL8.0＋PHP8.0】](https://blog.apar.jp/linux/15791/#toc5)

- さくらがstream 9の設定方法を出してくれていた。rootでのパスワード認証はデフォルトで不可になっているので、最初は標準ユーザとして設定されているcentosでログインする。

```jsx
% ssh centos@port_number
```

[](https://manual.sakura.ad.jp/vps/os-packages/centos-stream-9.html?highlight=%E5%85%AC%E9%96%8B%E9%8D%B5)

- vngコンソールをいじる必要があるのだが、キーマップが日本語になっていて@が打てないので、英字に変更した。
- vngコンソールでは以下のコマンドでrootログインができる。この方法がわからなくて普通にググった。

```jsx
login: root
Password: password
```

あとは記事の方法に従って、centosユーザから任意のユーザー名にユーザーを作り替えて、最後にrootユーザーのパスワードを削除したら完了。

次に公開鍵認証の設定を行う。これをやっておくことで、毎回パスワードの入力をしないでログインできるようになる。

まずは、 `.ssh` フォルダがホームディレクトリにあるか確認して、 `cd .ssh` で入る。そこで公開鍵を `ssh-keyge` で作成する。作成したら、リモートのホームディレクトリに 公開鍵である `id_rsa.pub`　を移動させたいので、 `scp id_rsa.pub username@ipadress:~/` で移動させる。あとは、さくらが教えてくれているように

```jsx
$ cd                                    # 確実にホームディレクトリに移動
$ mkdir .ssh                            # ディレクトリ作成
$ chmod 700 .ssh/                       # 自分以外のアクセスを禁止
$ mv id_rsa.pub .ssh/authorized_keys    # 公開鍵リスト作成
$ chmod 600 .ssh/authorized_keys        # 自分以外の読み書きを禁止
```

### portの変更

デフォルトは22番ポートが活用されてるが、well known portすぎてユーザーネーム片っ端からアタックされて危険。そこで、port番号を `sudo vi /etc/ssh/sshd_config` でいじって変更していく。

```jsx
#Port 22
```

という設定があるのでこの22を任意のポート番号に変えればOK。設定全般に当てはまるのだが、#はコメントアウトだから削除しないといけない。シンタックスハイライトが効かないから気づかなかった。

今回は51195に変更している

### firewalldのアクティベート

firewalldの設定をしたが、動いていなかったので、activateする

```jsx
systemctl status firewalld
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

### Nginx VS Apache

HTMLをホストするサーバーをどっちにしようか悩んで比較してみた。正直始める前の自分はどっちがいいのか一切わかっていなかったし、今も最適かと言われると自信がない。

- Nginxの方がシェアとしては伸びてきており、Apacheを追い抜こうとしている。
- ディレクトリレベルでの設定ができないため、逆にいうと毎回rootまでたどって設定ファイルを探すコストがかからず、パフォーマンスがいいみたい。
- スタンドアロンサーバーとして活用して、キャッシュサーバーを置かなくてもNginxではキャッシュが効くみたい（仕組みがわからん＆Apacheもあるけど、バグが多い＆Nginxの方がパフォーマンスがいいらしい）
- ApacheとNginxはそもそも設計が異なっており、Nginxの方が早そう。Apacheは全ての要求（なんの？）に対してプロセスを立ち上げるから無駄が多いぽい。
- Apacheの方が立ち上げが簡単みたい。何がどう簡単かはわからない。Nginxの方が早いぽい。理屈は分かったが、元データに当たれているわけではないので、もし気になったら追加でちゃんと調査してみたい。

**参照記事**

[NginxとApacheの比較 〜 ウェブサーバー直接対決 〜](https://kinsta.com/jp/blog/nginx-vs-apache/)

[ApacheとNginxについて比較 - Qiita](https://qiita.com/kamihork/items/49e2a363da7d840a4149)

### Nginxのインストール

- RPMパッケージを扱うコマンドは `yum` ではなく `dnf` に変わっているので注意。
- CentOS標準のリポジトリでは提供されていないパッケージをインストールする際には、EPELリポジトリを作成する必要がある。EPEL以外のサードパーティー製リポジトリを使ってもいいのだが、EPELはエンタープライズ向けで信頼性がある模様。ただ、RedHat社の公式サポートがあるわけではないので、要注意。デファクト見たくなっているのかな？

[CentOSなどで使う、EPELってなんだ？ - Qiita](https://qiita.com/charon/items/f5732694515d174851b3)

- まずはEPELを導入してNginxを入れる用意

```jsx
sudo dnf config-manager --set-enabled crb
sudo dnf install https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
sudo dnf install https://dl.fedoraproject.org/pub/epel/epel-next-release-latest-9.noarch.rpm
```

- `sudo dnf update` で全部最新にしてみた。
- `dnf` で何かをインストールする際にもyumのレポになるのが面白い。
- `vi `だとだめなので、sudoeditで書き込みした。
- 結局、情報が多すぎて正解が分からないので公式を見てやった

[nginx: Linux packages](https://nginx.org/en/linux_packages.html#RHEL-CentOS)

- mainlineではなく、stableを使用することに。ただ、公式通りにやってもインストールできない。サポートしているversionをよく見てみると、centos7 / 8ということで、stream9は入っていない。ならばと、公式は全部無視してdnfデフォルト設定でインストールすることに。
- デフォルトのnginxは古すぎるということだが、動かなければ始まらないということでとりあえずいけるものをインストールすることに。この際に、nginxの公式で展開されている `/etc/yum.repos.d/nginx.repo` の設定は消す必要がある。

[How To Install Nginx on CentOS 9 Stream](https://idroot.us/install-nginx-centos-9-stream/)

- 色々な人の記事を読むと、デフォルトのnginxが古すぎる。という指摘がよく入っていたが、centos stream 9ではデフォルトでインストールすると ver1.20.1が入る。

```jsx
$ nginx -v
nginx version: nginx/1.20.1
```

ということで、stableだから別に古いわけではない。改善されたのかな。よしとして、次に進む。

```jsx
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

これで立ち上がっている。この状態で、自分のIPアドレスをURLで叩いたら、nginxサーバーのデフォルト画面が見えるはず。  `[http://your_ip_address](http://your_ip_address)` だがしかし、ぐるぐるしていて進まない。firewallを設定していたことを思い出す。

http と httpsのポートを開ける必要があるので開ける

```jsx
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --reload
```

これで再度 `[http://your_ip_address](http://your_ip_address)` でトライするとnginxデフォルトの画面が見えた！ただ、 `[https://your_ip_address](https://your_ip_address)` だとまだだめ。

configファイルは以下の階層にある

```jsx
Nginx configuration directory: /etc/nginx
Nginx root directory: /usr/share/nginx/html
Master/Global configuration file: /etc/nginx/nginx.conf
```

- あと少し、次はconfigファイルを作成していく。まずは公式を一通り読んでみることにする

[Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html#conf_structure)

雰囲気は掴んだ。ただ、これだとJSファイルはホストすることができない。gatsbyはSSGだから全部HTMLに変換して出力しているのだろうか？デプロイ方法がわかっていない。一旦そのまま進む。

### ファイルをアップロードしてみる

### DNSの設定をする

ネームサーバの設定をさくらで行う。これを参考にそのまま対応した

[ネームサーバ利用申請 - さくらのサポート情報](https://help.sakura.ad.jp/206207381/?_gl=1*1d7h9g4*_gcl_aw*R0NMLjE2NDA5NjMxNzMuQ2p3S0NBaUE4YnFPQmhBTkVpd0Etc0lsTjdfMkdTUlQzUjdybXZESXFUMDRqNmsxRmhJQ0hBMGlYYm42N2pvdVp3bkxRN19zdEczbFlob0NNQzBRQXZEX0J3RQ..&_ga=2.44704547.602954785.1642691223-1592514320.1642759501&_gac=1.185706331.1640963174.CjwKCAiA8bqOBhANEiwA-sIlN7_2GSRT3R7rmvDIqT04j6k1FhICHA0iXbn67jouZwnLQ7_stG3lYhoCMC0QAvD_BwE)

これで、これまでは  `[http://your_ip_address](http://your_ip_address)` としていたところから、  `[http://your_domain_name](http://your_domain_name)` でアクセスできるようになりました。自分の場合は `http://shgnkn.io`　です。次は、SSL証明書を入手して、httpsでの通信ができるように設定していきます。

### SSL証明書の導入

**Let’s Encryptを使う。**

SSL証明書の有効期限が3ヶ月なので、３ヶ月ごとに忘れずに更新する必要があるのが面倒くさい。バッチ処理で回したいところ。⇨自動更新できるみたい！

[ネコでもわかる！さくらのVPS講座 ～第六回「無料SSL証明書 Let's Encryptを導入しよう」 | さくらのナレッジ](https://knowledge.sakura.ad.jp/10534/)

SSLではなく現在はTLSが使われてるのでは？と思ったがどうやら習慣でそう呼ばれているみたい

[ネコでもわかる！さくらのVPS講座 ～第六回「無料SSL証明書 Let's Encryptを導入しよう」 | さくらのナレッジ](https://knowledge.sakura.ad.jp/10534/)

[Let's EncryptのSSL証明書で、安全なウェブサイトを公開 | さくらのナレッジ](https://knowledge.sakura.ad.jp/5573/)

certbot-auto：Let’s Encryptが提供しているツールであり、Let’s Encryptと通信するためのクライアント。

これでcertbot-autoをインストール。Apachだけ自動有効化オプション対応しているのか。。。

```jsx
sudo curl https://dl.eff.org/certbot-auto -o /usr/bin/certbot-auto
```

⇨ふと気になって、certbot-auto自体について調べてみようとしたところ、まさかの現在は非推奨とのこと。。。

[](https://manual.sakura.ad.jp/vps/startupscript/certbot-caution.html)

かつ、centos stream 9ではsnapdが使用できない。さらに  `epel-release` の中にも certbotは入っていない。しかし、色々調べていくと、certbot自体は `pip` でインストールする方法がある模様。

[Centos Stream9: Let's Encrypt](https://hirop.mydns.jp/jitaku/2022/01/centos-stream9-lets-encrypt.html)

apacheはnginxに読み替えて実行していく。

`sudo certbot --nginx` で諸々yesしたり、メアド、ドメインを登録したりしていく。と。

```jsx
Could not automatically find a matching server block for shgnkn.io. Set the `server_name` directive to use the Nginx installer.
```

エラー。nginx.confファイルにドメイン名を設定する必要があるみたい。

```jsx
sudo vi /etc/nginx/nginx.conf
```

```jsx
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

リトライしていく。

```jsx
$ sudo vi /etc/nginx/nginx.conf
Saving debug log to /var/log/letsencrypt/letsencrypt.log

Which names would you like to activate HTTPS for?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: shgnkn.io
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate numbers separated by commas and/or spaces, or leave input
blank to select all options shown (Enter 'c' to cancel): 1
Certificate not yet due for renewal

You have an existing certificate that has exactly the same domains or certificate name you requested and isn't close to expiry.
(ref: /etc/letsencrypt/renewal/shgnkn.io.conf)

What would you like to do?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: Attempt to reinstall this existing certificate
2: Renew & replace the certificate (may be subject to CA rate limits)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel): 1
Deploying certificate
Successfully deployed certificate for shgnkn.io to /etc/nginx/nginx.conf
Congratulations! You have successfully enabled HTTPS on https://shgnkn.io

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

以下コマンドで、証明書や秘密鍵などのファイルが確認できていたら成功。

```jsx
sudo ls -l /etc/letsencrypt/live/your_domain
```

 `[https://your_domain](https://your_domain)` でhttps通信ができていることが確認できるはず！

`/etc/nginx/conf.d/ssl.conf` に対して、以下のサイトに従って、NginxのSSL対応設定までやってしまったが、要らなかったかも。

⇨やっぱり不要だった。 `/etc/nginx/nginx.conf`　にcertbotが追記してくれていた。なので削除

F12でdevtoolsを立ち上げて、securityをみると証明書を確認することができる。やったー。

[Let's EncryptのSSL証明書で、安全なウェブサイトを公開 | さくらのナレッジ](https://knowledge.sakura.ad.jp/5573/)

```jsx
server {
        listen  443 ssl;
        server_name     secure.zem.jp;
        ssl_certificate         /etc/letsencrypt/live/secure.zem.jp/cert.pem;
        ssl_certificate_key     /etc/letsencrypt/live/secure.zem.jp/privkey.pem;
        root                    /usr/share/nginx/html;
        access_log  /var/log/nginx/ssl-access.log  main;
}
```

実はまだ完了していない。httpで通信が来た際に、httpsに強制的にリダイレクトするように設定しておく。と思いきや、全部certbotが自動で設定してくれていた。あとは証明書の自動更新設定が必要になりそう。

以下の記事を参考にすると、certbotにはタイマーユニットというものができたらしい。今まではcronを活用する方法が紹介されてきていたが、certbotがやってくれているものなのであれば、そのまま使いたいと思う。

[CentOS7にnginxとcertbotを導入してHTTPS環境をさくっと作るの巻](https://blog.trippyboy.com/2020/centos/centos7%E3%81%ABnginx%E3%81%A8certbot%E3%82%92%E5%B0%8E%E5%85%A5%E3%81%97%E3%81%A6https%E7%92%B0%E5%A2%83%E3%82%92%E3%81%95%E3%81%8F%E3%81%A3%E3%81%A8%E4%BD%9C%E3%82%8B%E3%81%AE%E5%B7%BB/#toc5)

タイマーを仕掛けていくが、その前にバックアップを取る。と思いきや、そんな設定ファイルは存在しなかった。今のcronコマンドが問題なく実行されるか、4/22に期限が切れるので、そのタイミングで見守る。

念の為以下のコマンドで、期限の30日以内なら更新可能。

```jsx
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