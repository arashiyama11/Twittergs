class Tweet{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    if(this.author_id)this.author=new User(this.author_id,client)
    this.__proto__.client=client
  }
  /**
   * ツイートの情報をアップデートします
   * @param {Object} queryParameters 
   * @returns {Tweet}
   */
  update(queryParameters){
    let result=this.client.fetch("https://api.twitter.com/2/tweets/"+this.id,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    Object.assign(this,result)
    return this
  }
  /**
   * ツイートにリプライします
   * @param {Object} payload 
   * @returns {ClientTweet}
   */
  reply(payload){
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
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getLiked(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/liking_users`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }
  /**
   * リツイートしたユーザーを取得します
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getRetweeted(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/retweeted_by`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({meta:response.meta,data:response.data.map(v=>new User(v,this.client))})
  }
  /**
   * 引用リツイートを取得します
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getQuoteTweets(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/quote_tweets`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return Util.margeMeta({meta:response.meta,data:response.data.map(v=>new Tweet(v,this.client))})
  }
  /**
   * ツイートにいいねします
   * @returns {Object}
   */
  like(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/likes`,{
      method:"POST",
      payload:JSON.stringify({
        tweet_id:this.id
      })
    })
  }
  /**
   * いいねを取り消します
   * @returns {Object}
   */
  deleteLike(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/likes/${this.id}`,{method:"DELETE"})
  }

  /**
   * ツイートをリツイートします
   * @returns {Object}
   */
  retweet(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/retweets`,{
      method:"POST",
      payload:JSON.stringify({
        tweet_id:this.id
      })
    })
  }
  /**
   * リツイートを取り消します
   * @returns {Object}
   */
  deleteRetweet(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/retweets/${this.id}`,{method:"DELETE"})
  }

}


class ClientTweet extends Tweet{
  /**
   * ツイートを削除します
   * @returns {Object}
   */
  delete(){
    return this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}`,{
      method:"DELETE",
    })
  }
}