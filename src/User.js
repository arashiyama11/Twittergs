class User{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    this.__proto__.client=client
  }
  /**
   * ユーザーをアップデートします
   * @param {Object} queryParameters 
   * @returns {User}
   */
  update(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    Object.assign(this,response)
    return this
  }
  /**
   * ユーザーがいいねしたツイートを取得します
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getLiking(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/liked_tweets`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return Util.margeMeta({data:response.data.map(v=>new Tweet(v,this.client)),meta:response.meta})
  }

  /**
   * ユーザーのタイムラインを取得します
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getTimeLine(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/tweets`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return Util.margeMeta({meta:response.meta,data:response.data.map(v=>new Tweet(v,this.client))})
  }

  /**
   * メンション付きのツイートを取得します
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getMentioned(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/mentions`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return Util.margeMeta({data:response.data.map(v=>new Tweet(v,this.client)),meta:response.meta})
  }

  /**
   * ユーザーをフォローします
   * @returns {Object}
   */
  follow(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/following`,{
      method:"POST",
      payload:JSON.stringify({
        target_user_id:this.id
      })
    })
  }

  /**
   * フォローを解除します
   * @returns {Object}
   */
  unfollow(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/following/${this.id}`,{method:"DELETE"})
  }

  /**
   * ユーザーがフォローしているユーザーを取得します
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getFollowing(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/following`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }

  /**
   * ユーザーをフォローしているユーザーを取得します
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getFollowers(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/followers`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }
}

class ClientUser extends User{
  /**
   * ブロックしているユーザーを取得します
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getBlocking(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/blocking`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }

  /**
   * ユーザーがミュートしているユーザーを取得します
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getMuting(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/muting`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }
}