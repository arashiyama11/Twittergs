# Client

## 構文
```js
const client=new Client({
  propety:Propeties,
  name:string,
  oauthVersion:string,
  restTime:string||Function,
  id:string,
  CLIENT_ID:string,
  CLIENT_SECRET:string,
  API_KEY:string,
  API_SECRET:string,
  ACCESS_TOKEN:string,
  ACCESS_TOKEN_SECRET:string
})
```
## 引数
- ### propety \<Propeties\>
    認証情報を保存するプロパティストアを選択肢します。  `ScriptProperties`,`PropertiesService.getScriptProperties()`等がこれに該当します。
    デフォルトは`PropertiesService.getUserProperties()`です。

- ### name \<string\>
    認証情報を`propety`に紐づけるために利用されます。

- ### oauthVersion \<string\>
    使用するOAuthのバージョンを選択肢します。
    利用可能なのは`1.0a`と`2.0`の二つのみです。

- ### restTime <number||Function>
    fetchする際の`Utilities.sleep`する時間(ms)を指定します。
    Functionが与えられた場合はそれを実行して得られた時間だけ`Utilities.sleep`します。  
    デフォルト1000です。

- ### id \<string\>
    TwitterのユーザーIDを表します。
    1.0aで認証されている場合はデフォルトでその認証されたユーザーのIDが指定されるので、その場合は指定する必要はありません。  
    2.0の場合は手動で明示的にidを指定してください。
    idが指定されない場合は`client.user`にアクセスすることができません。


- ### CLIENT_ID \<string\>
    OAuth2.0を用いて認証する場合は必須です。
    デフォルトは`propety.getPropety("CLIENT_ID")`です。

- ### CLIENT_SECRET \<string\>
    OAuth2.0を用いて認証する場合は必須です。
    デフォルトは`propety.getPropety("CLIENT_SECRET")`です。

- ### API_KEY \<string\>
    OAuth1.0aを用いて認証する場合は必須です。
    デフォルトは`propety.getPropety("API_KEY")`です。

- ### API_SECRET \<string\>
    OAuth1.0aを用いて認証する場合は必須です。
    デフォルトは`propety.getPropety("API_SECRET")`です。

- ### ACCESS_TOKEN \<string\>
    OAuth1.0a,2.0どちらでも利用可能です。
    1.0aの場合は`oauth_token`を表します。
    2.0の場合は`bearer_token`を表します。

- ### ACCESS_TOKEN_SECRET \<string\>
    OAuth1.0aの場合のみ利用可能です
    `oauth_token_secret`を表します。

## 例
```js
const client=new Client({
  name:"sample",
  oauthVersion:"1.0a",
  restTime:()=>Math.random()*10000
})
```

```js
const client=new Client({
  name:"sample",
  oauthVersion:"2.0",
  id:"1234567890",
  CLIENT_ID:CLIENT_ID,
  CLIENT_SECRET:CLIENT_SECRET
})
```
# 静的メゾット
## fromCallBackEvent(options)
認証のコールバックイベントの引数からClientを作成します。
### 構文
```js
Client.fromCallBackEvent({
  e:Object,
  property:Properties,
  CLIENT_ID:string,
  CLIENT_SECRET:string,
  API_KEY:string,
  API_SECRET:string
})
```
### 引数
- #### e \<Object\>
    コールバックイベントの引数を指定してください
- #### propety \<Propeties\>
    認証情報を保存するプロパティストアを選択肢します。  `ScriptProperties`,`PropertiesService.getScriptProperties()`等がこれに該当します。
    デフォルトは`PropertiesService.getUserProperties()`です。
- #### CLIENT_ID \<string\>
    OAuth2.0を用いて認証する場合は必須です。
    デフォルトは`propety.getPropety("CLIENT_ID")`です。

- #### CLIENT_SECRET \<string\>
    OAuth2.0を用いて認証する場合は必須です。
    デフォルトは`propety.getPropety("CLIENT_SECRET")`です。

- #### API_KEY \<string\>
    OAuth1.0aを用いて認証する場合は必須です。
    デフォルトは`propety.getPropety("API_KEY")`です。

- #### API_SECRET \<string\>
    OAuth1.0aを用いて認証する場合は必須です。
    デフォルトは`propety.getPropety("API_SECRET")`です。

### 返値
Clientです。

## getAuthorizedUsers(property)
与えられた`property`に認証されているユーザーを返します
### 引数
- #### property <Properties>
    `ScriptProperties`,`PropertiesService.getScriptProperties()`等がこれに該当します。
    デフォルトは`PropertiesService.getUserProperties()`です。

### 返値
以下のような配列が返されます
```
[
  ["1.0a authorized users..."],
  ["2.0 authorized users..."]
]
```

refreshAll()
# インスタンスメゾット