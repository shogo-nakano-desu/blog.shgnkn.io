---
title: "GitHub ActionsからGoogle Cloud Functionsにデプロイ"
summary: "GitHub ActionsからGoogle Cloud Functionsへの自動ビルド＆デプロイフローを構築しました。権限まわりが自分で運営しているさくらVPSよりも少し面倒でしたが思っていたよりすんなりいきました。"
path: "github-actions-deploy-google-cloud-functions"
date: "2022-03-24"
update: ""
hero_image: "./alex-machado-80sv993lUKI-unsplash.jpg"
hero_image_alt: "cloud in the blue sky"
hero_image_credit_text: "Alex Machado"
hero_image_credit_link: "https://unsplash.com/photos/80sv993lUKI?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink"
tags: [infra,ci/cd,github-actions,google-cloud-functions]
---

仕事でGoogle Cloud Functions(以下GCF)を使っており、今まではコマンドラインから手動デプロイしていたのですが、流石に漏れが怖いし時間もかかるということで、GitHub Actionsの導入のために調査したメモです。

## .github/workflow/deployment.yamlの作成

まずはyamlファイルの全体像です。

``` bash
name: Deployment to GCF

on:
  push:
    branches:
      - main

jobs:
  job_id:
    runs-on: ubuntu-latest
    permissions:
      contents: 'read'
      id-token: 'write'
    steps:
      - uses: 'actions/checkout@v3'
      - name: Node.js setup
        uses: 'actions/setup-node@v2'
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
      - id: 'auth'
        uses: 'google-github-actions/auth@v0'
        with:
          workload_identity_provider: "${{secrets.GCP_WORKLOAD_IDENTITY_PROVIDER}}"
          service_account: "${{secrets.GCP_SERVICE_ACCOUNT}}"
      - id: 'deploy'
        uses: 'google-github-actions/deploy-cloud-functions@v0'
        with:
          name: "your-functions-name"
          region: "asia-northeast1"
          runtime: "nodejs16"
          memory_mb: 512 #MB
          entry_point: "main"
          timeout: 300 #second
          # event_trigger_typeはデフォルトでhttpなので、それ以外の場合指定する必要あり
          # デフォルトでは認証を通っていない第三者のアクセスは拒否する設定になっている
```

前半部分は以前 [GitHub ActionsでCI/CDパイプライン構築](https://blog.shgnkn.io/github-actions-ci-cd/)で記事を書いたのと同様なので、説明はそちらに譲ります。今回は主に後半部分、具体的には `name:auth` 以降の説明をしていけたらと思います。

## 全体

### google-github-actionsを利用する

今回、GitHub Actionsを用いてCloud Functionsにデプロイしていくに際して、Googleが提供している２つのアクションを利用します。
それぞれ、認証とデプロイに活用していくので、分けて説明していきます。

[https://github.com/google-github-actions/deploy-cloud-functions](https://github.com/google-github-actions/deploy-cloud-functions)

[https://github.com/google-github-actions/auth](https://github.com/google-github-actions/auth)

### APIの有効化

まずは、[Cloud Functions API](https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com)を有効にする必要があります。

APIを有効にしたら、あとは認証とデプロイの２部構成です。

## 認証

認証には大きくWorkload Identity連携を使った認証とJSON service account keyを使った認証の２パターンがあります。

今回はセキュリティ的にも推奨されているWorkload Identityを利用した認証を利用します。

[GitHub - google-github-actions/auth: GitHub Action for authenticating to Google Cloud with GitHub Actions OIDC tokens and Workload Identity Federation.](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation)

[ドキュメント](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation)の手順に従って、コマンドラインから設定を行っていきます。

まずは環境変数にプロジェクトIDを登録しておきます。

```bash
$ export PROJECT_ID="your_project_id"
```

次にサービスアカウントの作成。
```bash
gcloud iam service-accounts create "my-service-account" \
  --project "${PROJECT_ID}"
```

作成したサービスアカウントに対してCloud Functionsをデプロイする権限を付与。

```json
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
> --role="roles/cloudfunctions.developer" \
> --member="serviceAccount:service-account-name@project-name.iam.gserviceaccount.com"
```

次に、Workload Identity Poolの作成

```bash
$ gcloud iam workload-identity-pools create "pool-name" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="This is test Pool"
```

次に、Workload Identity PoolのIDを取得します

```bash
$ gcloud iam workload-identity-pools describe "pool-name" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --format="value(name)"

projects/123456789012/locations/global/workloadIdentityPools/pool-name
```

環境変数に取得したIDを登録

```bash
export WORKLOAD_IDENTITY_POOL_ID="projects/123456789012/locations/global/workloadIdentityPools/pool-name"
```

Providerを作成

```bash
gcloud iam workload-identity-pools providers create-oidc "pool-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="pool-name" \
  --display-name="Pool Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

GitHub repositoryを環境変数に登録する

```bash
export REPO="username/name"
```
Workload identity Providerとサービスアカウントとの紐付けを行い、認証を通ることができるようにします。

```bash
gcloud iam service-accounts add-iam-policy-binding "my-service-account@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO}"
```

これだけだと、Permission 'iam.serviceaccounts.actAs' denied on service account ~~という感じでロールが足りないので付与します。

```bash
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --role="roles/iam.serviceAccountUser" \
  --member="serviceAccount:service-account-name@project-name.iam.gserviceaccount.com"
```

serviceAccountUserも足りていなかったので付与します。

```bash
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --role="roles/iam.serviceAccountUser" \
  --member="serviceAccount:service-account-name@project-name.iam.gserviceaccount.com"
```

最後に、Workload Identity Providerのresource nameを取得して完了です。

```bash
gcloud iam workload-identity-pools providers describe "my-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="my-pool" \
  --format="value(name)"

projects/123456789012/locations/global/workloadIdentityPools/my-pool/providers/my-provider
```

recourse nameと最初に作成したサービスアカウントのメールアドレスを用いて、認証を通すことができます。

この際、Environment secretsに先ほど取得したWorkload identity providerの resource nameとサービスアカウントのメールアドレスを登録しておく必要があります。

https://github.com/username/repository_name/settings/secrets/actions から設定できます。

```yaml
# .github/workflow/deployment.yaml抜粋
- id: 'auth'
  uses: 'google-github-actions/auth@v0'
  with:
    workload_identity_provider: "${{secrets.GCP_WORKLOAD_IDENTITY_PROVIDER}}"
    service_account: "${{secrets.GCP_SERVICE_ACCOUNT}}"
```


## デプロイ

認証ができたら次はデプロイです。こっちはシンプルで、コマンドラインからgcloudを用いてデプロイしたことがある人ならとっつき易いかと思います。

```yaml
- id: 'deploy'
  uses: 'google-github-actions/deploy-cloud-functions@v0'
  with:
    name: "your-functions-name"
    region: "asia-northeast1"
    runtime: "nodejs16"
    memory_mb: 512 #MB
    entry_point: "main"
    timeout: 300 #second
    # event_trigger_typeはデフォルトでhttpなので、それ以外の場合指定する必要あり
    # デフォルトでは認証を通っていない第三者のアクセスは拒否する設定になっている
```

with以下で、GCFにデプロイする際の設定を記述しています。これ以外にも追加可能なオプションはたくさんあるので、気になる方は[こちら](https://github.com/google-github-actions/deploy-cloud-functions#inputs)を参照してください。

今回私が活用した設定だけそれぞれ説明しておきます。
コマンドラインからデプロイする際には文字列を`""`で囲う必要がないのですが、yamlファイルを作成するときには `""`で囲わないと型が合わずエラーになるので注意です。

【name】

GCFのエンドポイントにも使われる名称です。

登録した名称が以下のようにエンドポイントの末に入ります。

```yaml
https://asia-northeast1-project-name.cloudfunctions.net/function-name
```

【region】

デプロイするリージョンを選択します。

【runtime】

ランタイムを設定します。

【memory_mb】

メモリを設定します。gcloudコマンドでコマンドラインからデプロイを行う場合、`-memory=512MB` というような書き方をしていると思うのですが、GitHub Actionsでは `memory_mb=512` と書き方が少し異なるので注意が必要です。

【entry-point】

エントリーポイントを指定します。エンドポイントにリクエストが来たときに実行する関数です。

また、 `package.json` にてエントリーポイントがあるファイルを指定してやる必要があります。そのため、TypeScriptなど、デプロイ前にビルドが必要な言語で開発している場合にはビルドファイルを `package.json`で指定したファイルと合わせる必要があります。

```json
"name": "function-name",
"version": "1.0.0",
"main": "dist/index.js",
"license": "MIT",
"types": "commonjs",
```

【timeout】

timeoutもgcloudコマンドでのデプロイとは少し異なるので注意です。

gcloudコマンドでは `timeout=300s`　だったところが、GitHub Actionsでは `timeout: 300`　と単位が不要になっています。
