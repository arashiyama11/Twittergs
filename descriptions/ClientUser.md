# ClientUser
[User](./User.md)を継承しています。
# 取得方法例
取得方法は以下の一つだけです。
```js
client.user
```
また、clientのoauthVersionが2.0の場合は明示的にidを指定しないとclient.userはundefinedになります

# インスタンスメゾット
[User](./User.md)のインスタンスメゾットの他に以下2つのインスタンスメゾットを持っています
## getBloking(queryParameters)
