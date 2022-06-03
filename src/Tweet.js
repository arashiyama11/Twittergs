class Tweet{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    if(this.author_id)this.author=new User(this.author_id,client)
    this.__proto__.client=client
  }
  /**
   * ツイートの情報をアップデートします
   * https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets-id
   * @param {Object} queryParameters 
   * @returns {Tweet}
   */
  update(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let result=this.client.fetch("https://api.twitter.com/2/tweets/"+this.id,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    Object.assign(this,result)
    return this
  }
  /**
   * ツイートにリプライします
   * https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
   * @param {Object} payload 
   * @returns {ClientTweet}
   */
  reply(payload){
    this.client.validate(["1.0a","2.0",["tweet.read,","tweet.write","users.read"]])
    payload={
      ...payload,
      reply:{
        in_reply_to_tweet_id:this.id
      }
    }
    return this.client.postTweet(payload)
  }

  /**
   * いいねしたユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-tweets-id-liking_users
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getLiked(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","like.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/liking_users`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }
  /**
   * リツイートしたユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/get-tweets-id-retweeted_by
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getRetweeted(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/retweeted_by`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({meta:response.meta,data:response.data.map(v=>new User(v,this.client))})
  }
  /**
   * 引用リツイートを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/quote-tweets/api-reference/get-tweets-id-quote_tweets
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getQuoteTweets(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/quote_tweets`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return Util.margeMeta({meta:response.meta,data:response.data.map(v=>new Tweet(v,this.client))})
  }
  /**
   * ツイートにいいねします
   * https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/post-users-id-likes
   * @returns {Object}
   */
  like(){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","like.write"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/likes`,{
      method:"POST",
      payload:JSON.stringify({
        tweet_id:this.id
      })
    })
  }
  /**
   * いいねを取り消します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/delete-users-id-likes-tweet_id
   * @returns {Object}
   */
  deleteLike(){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","like.write"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/likes/${this.id}`,{method:"DELETE"})
  }

  /**
   * ツイートをリツイートします
   * https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/post-users-id-retweets
   * @returns {Object}
   */
  retweet(){
    this.client.validate(["1.0a","2.0"],["tweet.read","tweet.write","users.read"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/retweets`,{
      method:"POST",
      payload:JSON.stringify({
        tweet_id:this.id
      })
    })
  }
  /**
   * リツイートを取り消します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/delete-users-id-retweets-tweet_id
   * @returns {Object}
   */
  deleteRetweet(){
    this.client.validate(["1.0a","2.0"],["tweet.read","tweet.write","users.read"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/retweets/${this.id}`,{method:"DELETE"})
  }
}


class ClientTweet extends Tweet{
  /**
   * ツイートを削除します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/delete-tweets-id
   * @returns {Object}
   */
  delete(){
    this.client.validate(["1.0a","2.0"],["tweet.read","tweet.write","users.read"])
    return this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}`,{
      method:"DELETE",
    })
  }
}