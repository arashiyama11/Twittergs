# Twittergs
GoogleAppsScriptで使えるTwitterAPIのラッパーライブラリです。

# 特徴
- オブジェクト指向
- OAuth1.0a、2.0両方対応

# 注意点
- 基本的にTwitterAPIv1.1,v2.0両方にあるものはv2.0を叩いています。
- APIの全てを網羅している訳ではありません。よく使うものを優先的に実装しています。
# サンプル
```js
const client=new Client({
  name:"demo",
  oauthVersion:"1.0a"
})
//ツイートする
client.postTweet({text:"demo"})

//検索してリツイートする
client.serchTweets({q:"demo"})[0].retweet()

//ユーザーを取得してそのフォロワーをフォローする
client.getUserByUsername("sample").getFollowers()[0].follow()
```

# インストール方法
ライブラリとしてインストールをすると入力補完が上手く働かないので、[dist/twittergs.js](./dist/twittergs.js)をGoogleAppsScriptにコピペしてください。  

### 注意
ライブラリのオブジェクト、クラスは全てトップレベルに宣言されることになります。  
以下のリストと同名の宣言がされる場合不具合が発生することがあります。  
- CLIENT
- AppOnlyClient
- Tweet
- ClientTweet
- User
- ClientUser
- Property
- Util
- TWITTER_API_DATA  


# 説明
まず、最初に以下のように環境変数を設定することを強くオススメします
```js
function setEnv(){
  PropertiesService.getUserProperties().setProperties({
    CLIENT_ID:"<CLIENT_ID>",
    CLIENT_SECRET:"<CLIENT_SECRET>",
    API_KEY:"<API_KEY>",
    API_SECRET:"<API_SECRET>",
    BEARER_TOKEN:"<BEARER_TOKEN>"
  })
}
```
こうすることで、Clientインスタンス作成時に毎回キーを記述しなくてもよくなります。

## 認証
[Twitter Developer Potal](https://developer.twitter.com/en/portal/dashboard)で、利用したいAppのリダイレクトURLを以下のように設定します
```
https://script.google.com/macros/d/スクリプトID/usercallback
```

このURLは以下のように取得することが出来ます。
```
Util.getCallBackURL()
//=>https://script.google.com/macros/d/スクリプトID/usercallback
```

その後、スクリプトに以下のように記述します

```js
function authCallBack(e){
  const result=Client.fromCallBackEvent({e:e}).isAuthorized(e)
  if(result){
    return HtmlService.createHtmlOutput("成功")
  }else{
    return HtmlService.createHtmlOutput("失敗")
  }
}
```

もしもあなたが何らかの事情で環境変数を設定できない場合は以下のように記述してください。
```js
function authCallBack(e){
  const result=Client.fromCallBackEvent({
    e:e,
    API_KEY:"<API_KEY>",
    API_SECRET:"<API_SECRET>",
    CLIENT_ID:"<CLIENT_ID>",
    CLIENT_SECRET:"<CLIENT_SECRET>"
  }).isAuthorized(e)
  if(result){
    return HtmlService.createHtmlOutput("成功")
  }else{
    return HtmlService.createHtmlOutput("失敗")
  }
} 
```

その後、認証URLを発行します。
```js
function authorize(){
  const client=new Client({
    name:"sample",
    oauthVersion:"1.0a"
  })
  Logger.log(client.authorize())
}

```
また、認証する際に`name`に`@auto`と指定すると認証されたTwitterアカウントのユーザー名をnameとして認証後呼び出すことができます。
(@hogehogeというアカウントが認証されたらその認証情報はhogehogeと紐づけられる)
```js
function authorize(){
  const client=new Client({
    name:"@auto",
    oauthVersion:"1.0a"
  })
  Logger.log(client.authorize())
}
```
出力されたURLで認証して認証完了です。  
その後は引数のオブジェクトに同じ`name`を指定すれば同じ認証情報を得られます。

```js
const client=new Client({
  name:"sample",
  oauthVersion:"1.0a"
})
const tweet=client.getTweetById("12345")
Logger.log(tweet)
//=>{id="12345",text="...",subData={...}}

const tweets=client.user.getTimeLine({max_results:10})
Logger.log(tweets)
//=>[{id="...",text="..."}...]
Logger.log(tweets.subData)
//=>{includes={users=...}}
```

TwitterAPIv2のレスポンスは大体以下のようになりますが、
```json
{
  "data":[],
  "includes":{}
}
```
本ライブラリでは上のサンプルのように`data`が前に出されてその他のプロパティは`data.subData`に収納されます。  
また、data中のオブジェクトは適切に`Tweet`や`User`クラスに変換されますが、subData中のオブジェクトはそういった変換がされないので注意してください。  
### 注意
data.filterと言ったArrayのインスタンスメゾットを使用した後はdata.subDataはundefinedになります。
```js
const tweets=client.user.getTimeLine().filter(twt=>twt.text.length>10)
Logger.log(tweets.subData)
//=>undefined
```
subDataを使用する場合は必ず上記のような操作をする前にdata.subDataを参照してください。



# 更に詳しい説明
以下を参照してください。
- [Client.md](./descriptions/Client.md)
- [AppOnlyClient.md](./descriptions/AppOnlyClient.md)
- [Tweet.md](./descriptions/Tweet.md)
- [User.md](./descriptions/User.md)