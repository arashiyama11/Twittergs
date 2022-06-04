class User{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    this.__proto__.client=client
  }
  /**
   * ユーザーをアップデートします
   * https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
   * @param {Object} queryParameters 
   * @returns {User}
   */
  update(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    Object.assign(this,response)
    return this
  }
  /**
   * ユーザーがいいねしたツイートを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-users-id-liked_tweets
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getLiking(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","like.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/liked_tweets`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return Util.margeMeta({data:response.data.map(v=>new Tweet(v,this.client)),meta:response.meta})
  }

  /**
   * ユーザーのタイムラインを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getTimeLine(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/tweets`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return Util.margeMeta({meta:response.meta,data:response.data.map(v=>new Tweet(v,this.client))})
  }

  /**
   * メンション付きのツイートを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-mentions
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getMentioned(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/mentions`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return Util.margeMeta({data:response.data.map(v=>new Tweet(v,this.client)),meta:response.meta})
  }

  /**
   * ユーザーをフォローします
   * https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/post-users-source_user_id-following
   * @returns {Object}
   */
  follow(){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","follows.write"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/following`,{
      method:"POST",
      payload:JSON.stringify({
        target_user_id:this.id
      }),
      contentType:"application/json"
    })
  }

  /**
   * フォローを解除します
   * https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/delete-users-source_id-following
   * @returns {Object}
   */
  unfollow(){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","follows.write"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/following/${this.id}`,{method:"DELETE"})
  }

  /**
   * ユーザーがフォローしているユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-following
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getFollowing(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","follows.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/following`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }

  /**
   * ユーザーをフォローしているユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getFollowers(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","follows.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/followers`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }
}

class ClientUser extends User{
  /**
   * ブロックしているユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/blocks/api-reference/get-users-blocking
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getBlocking(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","block.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/blocking`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }

  /**
   * ミュートしているユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/mutes/api-reference/get-users-muting
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getMuting(queryParameters){
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","mute.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/muting`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }
}