# User
Twitterのアカウントを表すクラスです。

# 構文
```js
const user=new User(d,client)
```
## 引数
- ### d \<Object||string\>
    ユーザークラスを作成する元になるオブジェクトまたはツイートのIDです。
    オブジェクトが指定された場合はそのプロパティにidが含まれていなければなりません。

- ### client \<Client\>
    そのツイートに対して操作を行うClientです

# インスタンスメゾット
## update(queryParameters)
そのユーザーの情報をアップデートします
### エンドポイント
https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
### 引数 
- #### queryParameters \<Object\>
    クエリーパラメータです。
有効な値は[TWITTER_API_DATA.queryParameters.user](../src/Util.js)にあります。
### 返値
アップデートされたそのUserオブジェクトです

### 例
```js
user.update({
  expansions:["pinned_tweet_id"],
  "tweet.fields":["author_id"]
})
```


## getLiking(queryParameters)
そのユーザーがいいねしているツイートを取得します
### エンドポイント
https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-users-id-liked_tweets

### 引数
- ### queryParameters \<Object\>
  クエリーパラメータです
有効な値は[TWITTER_API_DATA.queryParameters.tweet](../src/Util.js)にあります。
### 返値
Tweetクラスの配列です。
metaプロパティでmeta情報にアクセスできます。

### 例
```js
const twts=user.getLiking()
Logger.log(twts)
Logger.log(twts.meta)

```

## getTimeLine(queryParameters)
そのユーザーのタイムラインを取得します
### エンドポイント
https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets


### 引数
- #### queryParameters \<Object\>
    クエリーパラメータです
有効な値は[TWITTER_API_DATA.queryParameters.tweet](../src/Util.js)にあります。
### 返値
Tweetクラスの配列です。
metaプロパティでmeta情報にアクセスできます。

### 例
```js
const twts=user.getTimeLine()
Logger.log(twts)
Logger.log(twts.meta)
```


## getMentioned(queryParameters)
そのユーザーにメンションがされているツイートを取得します
### エンドポイント
https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-mentions

### 引数
- #### queryParameters \<Object\>
    クエリーパラメータです
    有効な値は[TWITTER_API_DATA.queryParameters.tweet](../src/Util.js)にあります。
### 返値
Tweetクラスの配列です。
metaプロパティでmeta情報にアクセスできます。

### 例
```js
const twts=user.getTimeLine()
Logger.log(twts)
Logger.log(twts.meta)
```

## follow()
そのユーザーをフォローします
### エンドポイント
https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/post-users-source_user_id-following


### 引数
引数はありません。
### 返値
Objectです。成功した場合は以下のObjectが返されます。
```js
{
  data: {
    following:true,
    pending_follow:false
  }
}
```

### 例
```js
Logger.log(user.follow())
```

