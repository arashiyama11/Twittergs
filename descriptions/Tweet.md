# Tweet
Twitterのツイートを表すクラスです
# コンストラクター
## 構文
```js
const tweet=new Tweet(d,client)
```
### 引数
- #### d \<Object||string\>
    ツイートクラスを作成する元になるオブジェクトまたはツイートのIDです。
    オブジェクトが指定された場合はそのプロパティにidが含まれていなければなりません。
    また、そのオブジェクトに`author_id`がある場合は`tweet.author`でそのUserオブジェクトにアクセスできます。
    IDがなければインスタンスメゾットは使用できないので注意してください。

- #### client \<Client\>
    そのツイートに対して操作を行うClientです

# プロパティ
## tweet.author
ツイートの著者の[User](./User.md)オブジェクトです。
# インスタンスメゾット
## update(queryParameters):Tweet
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets-id

### 引数
- #### queryParaemters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets-id)を参照してください。
### 返り値 <Tweet\>
アップデートされたthisを返します。

## reply(payload):ClientTweet
ツイートにリプライします。
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets

### 引数
- #### payload <Object\>
### 返り値 <ClientTweet\>
投稿したリプライです


## getLikedUsers(queryParameters):Array<User\>
ツイートにいいねしたユーザーを返します。
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-tweets-id-liking_users

### 引数
- #### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-tweets-id-liking_users)を参照してください。
### 返り値 <Array<User\>\>


## getRetweetedUsers(queryParameters):Array<User\>
ツイートをリツイートしたユーザーを返します。
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/get-tweets-id-retweeted_by

### 引数
- #### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/get-tweets-id-retweeted_by)を参照してください。
### 返り値 <Array<User\>\>



## getQuoteTweets(queryParameters):Array<Tweet\>
引用ツイートを取得します。
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/quote-tweets/api-reference/get-tweets-id-quote_tweets

### 引数
- #### queryParameters
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/quote-tweets/api-reference/get-tweets-id-quote_tweets)を参照してください。
### 返り値 <Array<Tweet\>\>


## like():Object
ツイートにいいねします
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/post-users-id-likes

### 引数
引数はありません。
### 返り値 <Object\>
成功すると以下のオブジェクトが返されます。
```js
{
  "data": {
    "liked": true
  }
}
```


## deleteLike():Object
いいねを取り消します
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/delete-users-id-likes-tweet_id

### 引数
引数はありません。
### 返り値<Object\>
成功すると以下のオブジェクトが返されます。
```json
{
  "data": {
    "liked": false
  }
}
```


## retweet():Object
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/post-users-id-retweets

### 引数
引数はありません。
### 返り値 <Object\>
成功すると以下のオブジェクトが返されます。
```json
{
  "data": {
    "retweeted": true
  }
}
```


## deleteRetweet():Object
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/delete-users-id-retweets-tweet_id

### 引数
引数はありません。
### 返り値
成功すると以下のオブジェクトが返されます。
```json
{
  "data": {
    "retweeted": false
  }
}
```

## bookMark():Object
ツイートにブックマークします
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/bookmarks/api-reference/get-users-id-bookmarks

### 引数
引数はありません。
### 返り値 <Object\>
成功すると以下のオブジェクトが返されます。
```json
{
  "data": {
    "bookmarked": true
  }
}
```

## deleteBookMark():Object
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/delete-tweets-id

### 引数
引数はありません。
### 返り値 <Object\>
成功すると以下のオブジェクトが返されます。
```json
{
  "data": {
    "bookmarked": false
  }
}
```