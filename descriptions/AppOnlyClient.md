# AppOnlyClient
# コンストラクター
## 構文
```js
const app=new AppOnlyClient(BEARER_TOKEN)
```
## 引数
### BEARER_TOKEN <string\>
ベアラートークンです。  
デフォルトは`PropertiesService.getUserProperties().getProperty("BEARER_TOKEN")`です。

## fetch(url,options):Object
### 構文
```js
app.fetch(string,{
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
### 引数
認証情報を乗せてfetchします
- #### url <string\>
    fetchするURLです。
- #### method <string\>
    fetchする際のメソッドです。  
    デフォルトは`GET`です。  
- #### headers <Object\>
    fetchする際のheaderです。
- #### contentType <string\>
    fetchする際のcontentTypeです。  
- #### queryParameters <Object\>
    urlのクエリーパラメータとして追加されるオブジェクトです。
- #### その他 
    useIntranet:boolean,  
  validateHttpsCertificates:boolean,  
  followRedirects:boolean,  
  muteHttpExceptions:boolean,  
  escaping:boolean  
  これらはそのままUrlFetchApp.fetchの第二引数のオブジェクトに渡すので[GASのリファレンス](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app?hl=en#fetchurl,-params)を参照してください。

- ### 戻り値 <Object\>
レスポンスのオブジェクトです。

## setClient(client) :AppOnlyClient
appのインスタンスメゾットの返り値の`Tweet`や`User`を操作する`Client`を設定します。
### 構文
```js
app.setClient(Client)
```
### 引数
#### client <Client\>
### 戻り値 <AppOnlyClient\>
thisを返します。

## searchTweets(queryParameters):Array<Tweet\>
ツイートを検索します。
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
### 引数
- #### queryParameters <Object\>
   [Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent)を参照してください。

### 戻り値 <Array<Tweet\>\>

## getTweetById(id,queryParameters):Tweet
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets-id
### 引数
- #### id <string\>
取得したいツイートのidです。
- #### queryParameters <Object\>
   [Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets-id)を参照してください。

### 戻り値 <Tweet>

## getUserByUsername:User
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
### 引数
- #### username <string\>
取得したいユーザーのユーザーネームです
- #### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username)を参照してください。

### 戻り値 <User>

## static getBearerToken(API_KEY,API_SECRET):string
ベアラートークンを取得します。
### Twitterドキュメント
https://developer.twitter.com/en/docs/authentication/api-reference/token
### 引数 
#### API_KEY <string\>
デフォルトは`PropertiesService.getUserProperties().getProperty("API_KEY")`です
#### API_SECRET <string\>
デフォルトは`PropertiesService.getUserProperties().getProperty("API_SECRET")`です
### 戻り値 <string\>
ベアラートークンです。