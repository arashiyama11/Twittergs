# ClientUser
[Tweet](./Tweet.md)を継承しています。
# 取得方法
client.postTweetやtweet.replyなどでツイートを投稿すると取得できます。  
なので自身のツイートでも通常の`Tweet`オブジェクトのことがあります。  
その場合は以下のようにしてClientTweetに変換するか`Function.prototype.call`を使用してください。
```js
const tweets=client.user.getTimeLine()//:Array<Tweet>
tweets.forEach(twt=>{
  if(twt.author_id===client.user.id){
    Logger.log(new ClientTweet(twt,client).delete())
  }
})
```
```js
const tweets=client.user.getTimeLine()
tweets.forEach(twt=>{
  if(twt.author_id===client.user.id){
    ClientTweet.prototype.delete.call(twt)
  }
})
```

# インスタンスメゾット
[Tweet](./Tweet.md)のインスタンスメゾットの他に1つインスタンスメゾットを持っています。

## delete():Object
ツイートを削除します
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/delete-tweets-id
### 引数
引数はありません。
### 返り値 <Object\>
成功すると以下のオブジェクトが返されます。
```js
{
  "data": {
    "deleted": true
  }
}
```