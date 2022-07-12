# Client

# コンストラクタ
## 構文
```js
const client=new Client({
  propety:Propeties,
  name:string,
  oauthVersion:string,
  restTime:number||Function,
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
    利用可能なのは`1.0a`と`2.0`の二つのみ利用できます。

- ### restTime <number||Function>
    fetchする際の`Utilities.sleep`する時間(ms)を指定します。
    Functionが与えられた場合はそれを実行して得られた時間だけ`Utilities.sleep`します。  
    デフォルト1000です。

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
  property:ScriptProperties,
  name:"sample",
  oauthVersion:"1.0a",
  restTime:()=>Math.random()*10000
})
```

```js
const client=new Client({
  name:"sample",
  oauthVersion:"2.0",
  CLIENT_ID:CLIENT_ID,
  CLIENT_SECRET:CLIENT_SECRET
})
```

```js
const client=new Client({
  name:"sample",
  oauthVersion:"1.0a",
  ACCESS_TOKEN:"1234-hogehoge",
  ACCESS_TOKEN_SECRET:"foobar"
})
```

# プロパティ
## clinet.user <ClientUser\>
認証したユーザーを表す[ClientUser](./ClientUser.md)オブジェクトです。  

# 静的メゾット
## static fromCallBackEvent(options):Client
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

### 返り値 <Client\>

## static getAuthorizedUsers(property):Array<Array<string\>\>
与えられた`property`に認証されているユーザーを返します
### 引数
- #### property <Properties>
    `ScriptProperties`,`PropertiesService.getScriptProperties()`等がこれに該当します。
    デフォルトは`PropertiesService.getUserProperties()`です。

### 返り値
以下のような配列が返されます
```json
[
  ["1.0a authorized users..."],
  ["2.0 authorized users..."]
]
```

## static refreshAll(options):void
### 構文  
```js
Client.refreshAll({
  CLIENT_ID:string,
  CLIENT_SECRET:string,
  names:Array<string>
})
```
### 引数  
- #### CLIENT_ID <string\>
    CLIENT_IDです。
    環境変数に設定してある場合は省略可能です。
- #### CLIENT_SECRET <string\>
    CLIENT_SECRETです。
    環境変数に設定してある場合は省略可能です。
- #### names <Array<string\>\>
    リフレッシュするclientのnameの配列です。
### 返り値
返り値はありません。
# インスタンスメゾット
## 認証関連
### validate(oauthVersion,scope):void
clinetが認証済みで、oauthVersionとscopeを持っているか検証します。持っていない場合はエラーが投げられます。
#### 構文
```js
client.validate(Array<string>,Array<string>)
```
#### 引数
- ##### oauthVersion <Array<string\>\>
    配列の要素は`"1.0a"`と`"2.0"`のみ有効です。   
    この引数に含まれているが、clinetに含まれていない場合はエラーが投げられます。 
- ##### scope <Array<string\>\>
    配列の要素はTWITTER_API_DATA.scopesにあるもののみ有効です。  
    この引数に含まれているが、clinetに含まれていない場合はエラーが投げられます。 

### authorize(scopes):string
clinetの認証URLを返します。  
もしclinet.nameが`@auto`の場合はTwitterのユーザーネームとして認証されます。  
#### 引数
- ##### scopes <Array<string\>\>
    認証する際に有効にする`scope`を指定します。  
clinet.oauthVersionが`1.0a`の場合は指定する必要はありません。  
デフォルトは`TWITTER_API_DATA.scopes`です。  

#### 返り値 <string\>
認証URLです。

### isAuthorized(e):boolean
コールバックのイベントから認証がされているか検証します。
#### 引数
- ##### e <Object\>
    コールバックのイベントの引数です。
#### 返り値 <boolean\>
認証が正常に完了したかどうかを返します

### refresh():void
clientをリフレッシュします。
2.0専用です。
#### 引数
引数はありません。
#### 返り値
返り値はありません。

### hasAuthorized():boolean
clientが認証されたかを返します
#### 引数
引数はありません。
#### 返り値 <boolean\>
clientが過去に認証されたかどうかを返します。

## Twitter操作関連
### fetch(url,options):Object
認証情報を乗せてHTTP通信します。  
optionsのほとんどはUrlFetchApp.fetchの第二引数と同じです。
### 構文
```js
client.fetch(string,{
  method:string,
  headers:Object,
  payload:Object,
  contentType:string,
  queryParameters:Object,
  oauthParameters:Object,
  useIntranet:boolean,
  validateHttpsCertificates:boolean,
  followRedirects:boolean,
  muteHttpExceptions:boolean,
  escaping:boolean
})
```
#### 引数
- ##### url <string\>
    fetchするURLです。
- ##### method <string\>
    fetchする際のメソッドです。  
    デフォルトは`GET`です。  
- ##### headers <Object\>
    fetchする際のheaderです。
- ##### contentType <string\>
    このパラメータは必須です。  
    fetchする際のcontentTypeです。  
    `multipart/form-data`で`POST`する際は`payload`をオブジェクトにして`contentType`に`multipart/form-data`とそのまま入力してください。
- ##### queryParameters <Object\>
    urlのクエリーパラメータとして追加されるオブジェクトです。
- ##### oauthParameters <Object\>
    OAuthの追加パラメータとして追加されるオブジェクトです。
- ##### その他 
　useIntranet:boolean,  
  validateHttpsCertificates:boolean,  
  followRedirects:boolean,  
  muteHttpExceptions:boolean,  
  escaping:boolean  
  これらはそのままUrlFetchApp.fetchの第二引数のオブジェクトに渡すので[GASのリファレンス](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app?hl=en#fetchurl,-params)を参照してください。

#### 返り値 <Object\>           
レスポンスのオブジェクトです。
### searchTweets(queryParameters):Array<Tweet\>
#### Twitterドキュメント
1.0a https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets  
2.0 https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
#### 引数 
- ##### queryParameters <Object\> 
    [1.0a](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets),[2.0](https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent)を参照してください。  
#### 返り値 Array<Tweet\>
  
### getTweetById(id,queryParameters):Tweet
ツイートIDからツイートを取得します。
もし、単純にTweetクラスのインスタンスメゾットが使用したいだけの場合はTweetコンストラクタの使用をご検討ください。

#### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference
#### 引数
- ##### id <string\>
    取得したいツイートのIDです。
- ##### queryParameters <Object\>
    [Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference)を参照してください。  
    です
#### 返り値 <Tweet\>

### getTweetByURL(url,queryParameters):Tweet
URLからツイートを取得します。
#### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference
#### 引数
- ##### url <string\>
    取得したいツイートのURLです。
- ##### queryPatamters <Object\>
    [Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference)を参照してください。
#### 返り値 <Tweet\>

### postTweet(payload):ClientTweet
ツイートを投稿します。
#### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
#### 引数
- ##### payload <Object\>
    [Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets)を参照してください。
#### 返り値 <ClientTweet\>
投稿したツイートです。

### getListById(id,queryParameters):List
IDからリストを取得します。
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/lists/list-tweets/api-reference/get-lists-id-tweets

#### 引数
- ##### id <string\>
取得したいリストのidです
- ##### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/lists/list-tweets/api-reference/get-lists-id-tweets)を参照してください。
#### 返り値　<List\>

### searchUsers(queryParameters):Array<User\>
#### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-users-search
#### 引数
- ##### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-users-search)を参照してください。

#### 返り値 <Array<User\>\>

### getUserByUsername(username,queryParameters):User
#### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
#### 引数
- ##### username <string\>
取得したいユーザーのユーザネームです。
- ##### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username)を参照してください。  
です

### getMyUser(queryParameters):ClientUser
認証したユーザーを取得します。  
#### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-me

#### 引数
- ##### queryParameters
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-me)を参照してください。


#### 返り値 <ClientUser\>

### uploadMedia(blob):Object
画像をアップロードします。5MB未満専用です。
#### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload
#### 引数
- ##### blob <Blob\>
アップロードする画像のBlobオブジェクトです。
#### 返り値 <Object\>
以下のようなオブジェクトが返されます。
```json
{
    "media_id":1234567890,
    "media_id_string":"1234567890",
    "size":54321,
    "expires_after_secs":86400,
    "image":{
        "image_type":"image/jpeg",
        "w":2280,
        "h":1080
    }
}
```

### uploadBigMedia(blob):Object
画像,動画をアップロードします。
#### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload-init  
https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload-append  
https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload-finalize  
#### 引数
- ##### blob <Blob\>
アップロードしたい画像のBlobオブジェクトです。
#### 返り値 <Object\>
以下のようなオブジェクトが返されます。
```json
{
    "media_id":1234567890,
    "media_id_string":"1234567890",
    "size":54321,
    "expires_after_secs":86400,
    "image":{
        "image_type":"image/jpeg",
        "w":2280,
        "h":1080
    }
}
```