# User
Twitterのアカウントを表すクラスです。
# コンストラクター
## 構文 
```js
const user=new User(d,client)
```
### 引数
- #### d \<Object||string\>
    ユーザークラスを作成する元になるオブジェクトまたはユーザーのIDです。
    オブジェクトが指定された場合はそのプロパティにidが含まれていなければなりません。
    IDがなければインスタンスメゾットは使用できないので注意してください。

- #### client \<Client\>
    そのツイートに対して操作を行うClientです
## 例
```js
const user=new User("1234567890",client) 
```
```js
const user=new User({
  id:"1234567890",
  useranme:"hogehoge"
},client) 
```

# インスタンスメゾット
## update(queryParameters):Tweet
そのユーザーの情報をアップデートします
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
### 引数 
- #### queryParameters \<Object\>
    [Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id)を参照してください。
### 返り値
thisを返します。

### 例
```js
user.update({
  expansions:["pinned_tweet_id"],
  "tweet.fields":["author_id"]
})
```


## getLikingTweets(queryParameters):Array<Tweet\>
そのユーザーがいいねしているツイートを取得します
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-users-id-liked_tweets

### 引数
- ### queryParameters \<Object\>
  [Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-users-id-liked_tweets)を参照してください。
### 返り値 <Array<Tweet\>\>

## getTimeLine(queryParameters):Array<Tweet\>
そのユーザーのタイムラインを取得します
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets


### 引数
- #### queryParameters \<Object\>
    クエリーパラメータです
    [Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets)を参照してください。
### 返り値 <Array<TWeet\>\>

## getMentioned(queryParameters):<Array<Tweet\>\>
そのユーザーにメンションがされているツイートを取得します
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-mentions

### 引数
- #### queryParameters \<Object\>
    [Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-mentions)
### 返り値
Tweetクラスの配列です。
metaプロパティでmeta情報にアクセスできます。

## follow():Object
そのユーザーをフォローします
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/post-users-source_user_id-following

### 引数
引数はありません。
### 返り値 <Object\>
成功した場合は以下のObjectが返されます。
```json
{
  "data": {
    "following":true,
    "pending_follow":false
  }
}
```


## unfollow():Object
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/delete-users-source_id-following

### 引数
引数はありません。
### 返り値 <Object\>
成功した場合は以下のObjectが返されます。
```json
{
  "data":{
    "following":false
  }
}
```
## getFollowingUsers(queryParameters):Array<User\>
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-following

### 引数
- #### queryParamters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-following)を参照してください。
### 返り値 <Array<Tweet\>\>


## getAllFollowingUsers(queryParamters):Array<User\>
全てのフォローしているユーザーを取得します。
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-following


### 引数
- #### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-following)を参照してください。
### 返り値 <Array<User\>\>

## getFollowers(queryParameters):Array<User\>
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers

### 引数
- #### queryParameters <Object\>
[公式ドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers)を参照してください。
### 返り値　Array<User\>

## getAllFollowers(queryParameters):Array<User>
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers

### 引数
- #### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers)を参照してください。

### 返り値 <Array<User\>\>