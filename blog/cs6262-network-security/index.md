---
title: "CS6262 Network Security"
summary: "CS6262 Network Securityを受けました"
path: "cs6262-network-security"
date: "2024-08-10"
update: "2024-08-10"
hero_image: "./netsec.jpg"
hero_image_alt: "Network Security"
hero_image_credit_text: "DALL・E"
hero_image_credit_link: ""
tags: [gatech, omscs, network-security]
---

2024-05~2024-07はGeorgia Tech OMSCSでNetwork Securityを受講しました。

このコースは、予めCS 6035: Introduction to Information Securityを受講しておくことが推奨されていますが、自分は取りたい授業の関係上Introduction to Information Securityは取らずにNetwork Securityのコースだけ受講しました。

## やったこと

ビデオや論文、記事を読んで学ぶ以外に、以下の課題に取り組みました。

- サーバーの脆弱性を見つけて攻撃する
- Webアプリケーションの脆弱性を見つけて攻撃する
- Windows, Androidマルウェアの解析を行う
- ネットワークトラフィックを解析して怪しいトラフィックを見つける
- 機械学習ベースのanomaly detection systemを潜り抜けるpayloadを作る

## 感想

[OMS Reviews](https://www.omscentral.com/courses/network-security/reviews)だとこのコースはあまり良い評価がついていないですが、一部を除いて面白いコースだったと思います。

XSSやCSRFなどの一般的な脆弱性について、書籍で読んで知ってはいたのですが実際にこれらの脆弱性を狙った攻撃をしてみる経験は今までありませんでした。課題だとsandbox上でそういった経験をすることができたので、手触り感を持って学習することができました。

また、Wiresharkを使ってネットワークトラフィックの解析を行い怪しい通信を探したり、機械学習を用いたIDSを掻い潜るためにパケットの中身を弄ったりする課題も普段の業務で経験したことがない類の作業だったので面白かったです。

一方、取り組んだ課題の中には配布されたVMイメージを利用して行うものがあり、そのVMを用いて行う操作が不安定なものなどもありました。そうした課題はひたすらVMの動作をデバックしているような状態になることもあり、不毛に感じることもありました。

私はM1 MacBook Proを利用しているのですが、このコースでも、前期受講したCS6200 Graduate Introduction to Operating Systems同様にLinux machineが必要になることが度々ありました。新しいPCを買うことをケチってGCPにVMを立てて、Remote Desktopを利用することでなんとか課題をこなすことはできました。しかし一番ひどいときはVM on VM on VMの環境で作業をする必要があり、もっさりした環境にフラストレーションが溜まることもありました。どうせ他のコースでもLinux machineが必要になることはあると思うのでやっぱり買うか迷い中です。