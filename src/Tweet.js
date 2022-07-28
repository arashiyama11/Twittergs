class Tweet{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    if(this.author_id)this.author=new User(this.author_id,client)
    this.__proto__.client=client
    if(typeof this.id==="number"&&this.id_str)this.id=this.id_str
  }

  validate(){
    if(!this.client)throw new Error("clientがありません")
    if(!this.id)throw new Error("idがありません")
  }
  /**
   * ツイートの情報をアップデートします
   * https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets-id
   * @param {Object} queryParameters 
   * @returns {Tweet}
   */
  update(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let result=this.client.fetch("https://api.twitter.com/2/tweets/"+this.id,{queryParameters})
    Object.assign(this,Util.mergeMeta(result))
    return this
  }
  /**
   * ツイートにリプライします
   * https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
   * @param {Object} payload 
   * @returns {ClientTweet}
   */
  reply(payload){
    this.validate()
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
  getLikedUsers(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","like.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/liking_users`,{queryParameters})
    return Util.shapeData(response,v=>new User(v,this.client))
  }

  /**
   * いいねしたユーザーを全て取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-tweets-id-liking_users
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getAllLikedUsers(queryParameters={}){
    queryParameters.max_results=100
    let pagination_token
    const result=[]
    do{
      const res=this.getLikedUsers({...queryParameters,pagination_token})
      pagination_token=res.subData.next_token
      result.push(res)
    }while(pagination_token)
    return result.flat()
  }
  /**
   * リツイートしたユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/get-tweets-id-retweeted_by
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getRetweetedUsers(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/retweeted_by`,{queryParameters})
    return Util.shapeData(response,v=>new User(v,this.client))
  }

   /**
   * リツイートしたユーザーを全て取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-tweets-id-liking_users
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getAllLikedUsers(queryParameters={}){
    queryParameters.max_results=100
    let pagination_token
    const result=[]
    do{
      const res=this.getRetweetedUsers({...queryParameters,pagination_token})
      pagination_token=res.subData.next_token
      result.push(res)
    }while(pagination_token)
    return result.flat()
  }

  /**
   * 引用リツイートを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/quote-tweets/api-reference/get-tweets-id-quote_tweets
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getQuoteTweets(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/quote_tweets`,{queryParameters})
    return Util.shapeData(response,v=>new Tweet(v,this.client))
  }
  /**
   * ツイートにいいねします
   * https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/post-users-id-likes
   * @returns {Object}
   */
  like(){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","like.write"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/likes`,{
      method:"POST",
      payload:JSON.stringify({
        tweet_id:this.id
      }),
      contentType:"application/json"
    })
  }
  /**
   * いいねを取り消します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/delete-users-id-likes-tweet_id
   * @returns {Object}
   */
  deleteLike(){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","like.write"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/likes/${this.id}`,{method:"DELETE"})
  }

  /**
   * ツイートをリツイートします
   * https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/post-users-id-retweets
   * @returns {Object}
   */
  retweet(){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","tweet.write","users.read"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/retweets`,{
      method:"POST",
      payload:JSON.stringify({
        tweet_id:this.id
      }),
      contentType:"application/json"
    })
  }
  /**
   * リツイートを取り消します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/delete-users-id-retweets-tweet_id
   * @returns {Object}
   */
  deleteRetweet(){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","tweet.write","users.read"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/retweets/${this.id}`,{method:"DELETE"})
  }
  /**
   * ブックマークします
   * https://developer.twitter.com/en/docs/twitter-api/tweets/bookmarks/api-reference/get-users-id-bookmarks
   * @returns {Object}
   */
  bookMark(){
    this.validate()
    this.client.validate(["2.0"],["tweet.read","users.read","bookmark.write"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/bookmarks`,{
      method:"POST",
      contentType:"application/json",
      payload:JSON.stringify({
        tweet_id:this.id
      })
    })
  }
  
  /**
   * ブックマークを解除します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/bookmarks/api-reference/delete-users-id-bookmarks-tweet_id
   * @returns {Object}
   */
  deleteBookMark(){
    this.validate()
    this.client.validate(["2.0"],["tweet.read","users.read","bookmark.write"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/bookmarks/${this.id}`,{
      method:"DELETE",
    })
  }
}


class ClientTweet extends Tweet{
  /**
   * ツイートを削除します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/delete-tweets-id
   * @returns {Object}
   */
  delete(){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","tweet.write","users.read"])
    return this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}`,{
      method:"DELETE",
    })
  }
}