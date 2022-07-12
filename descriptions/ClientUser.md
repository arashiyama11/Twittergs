# ClientUser
[User](./User.md)を継承しています。
# 取得方法
取得方法は以下の一つだけです。
```js
client.user
```
また、clientのoauthVersionが2.0の場合は明示的にidを指定しないとclient.userはundefinedになります

# インスタンスメゾット
[User](./User.md)のインスタンスメゾットの他に以下のインスタンスメゾットを持っています
## getBlockingUsers(queryParameters):Array<User\>
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/blocks/api-reference/get-users-blocking

### 引数
- #### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/blocks/api-reference/get-users-blocking)を参照してください。
です

### 返り値 Array<User\>

## getMutingUsers(queryParameters):Array<User\>
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/users/mutes/api-reference/get-users-muting

### 引数
- #### getMutingUsers <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/users/mutes/api-reference/get-users-muting)を参照してください。
です
### 返り値 Array<User\>

## getBookMarkTweets(queryParameters):Object
### Twitterドキュメント
https://developer.twitter.com/en/docs/twitter-api/tweets/bookmarks/api-reference/get-users-id-bookmarks
### 引数
- #### queryParameters <Object\>
[Twitterドキュメント](https://developer.twitter.com/en/docs/twitter-api/tweets/bookmarks/api-reference/get-users-id-bookmarks)を参照してください。
です