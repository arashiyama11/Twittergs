class User{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    Object.defineProperty(this,"client",{
      get(){
        return client
      }
    })
    if(typeof this.id==="number"&&this.id_str)this.id=this.id_str
    this.dm=new DMManager(this)
  }

  validate(){
    if(!this.client)throw new Error("clientがありません")
    if(!this.id)throw new Error("idがありません")
  }
  /**
   * ユーザーをアップデートします
   * https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
   * @param {Object} queryParameters 
   * @returns {User}
   */
  update(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}`,{queryParameters})
    Object.assign(this,Util.mergeMeta(response))
    return this
  }
  /**
   * ユーザーがいいねしたツイートを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/get-users-id-liked_tweets
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getLikingTweets(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","like.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/liked_tweets`,{queryParameters})
    return Util.shapeData(response,v=>new Tweet(v,this.client))
  }

  /**
   * ユーザーのタイムラインを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getTimeLine(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/tweets`,{queryParameters})
    return Util.shapeData(response,v=>new Tweet(v,this.client))
  }

  /**
   * メンション付きのツイートを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-mentions
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  getMentioned(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/mentions`,{queryParameters})
    return Util.shapeData(response,v=>new Tweet(v,this.client))
  }

  /**
   * ユーザーをフォローします
   * https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/post-users-source_user_id-following
   * @returns {Object}
   */
  follow(){
    this.validate()
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
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","follows.write"])
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/following/${this.id}`,{method:"DELETE"})
  }

  /**
   * ユーザーがフォローしているユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-following
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getFollowingUsers(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","follows.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/following`,{queryParameters})
    return Util.shapeData(response,v=>new User(v,this.client))
  }
  /**
   * 全てのフォローを取得します。
   * @param {Object} queryParameters 
   * @returns 
   */
  getAllFollowingUsers(queryParameters={}){
    this.validate()
    const result=[]
    let pagination_token
    queryParameters.max_results=1000
    do{
      const res=this.getFollowingUsers({...queryParameters,pagination_token})
      pagination_token=res.subData.next_token
      result.push(res)
    }while(pagination_token)
    return result.flat()
  }

  /**
   * ユーザーをフォローしているユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getFollowers(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","follows.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/followers`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return Util.margeMeta({data:response.data.map(v=>new User(v,this.client)),meta:response.meta})
  }

  /**
   * 全てのフォロワーを取得します。
   * https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers
   * 
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getAllFollowingUsers(queryParameters={}){
    this.validate()
    const result=[]
    let pagination_token
    queryParameters.max_results=1000
    do{
      const res=this.getFollowingUsers({...queryParameters,pagination_token})
      pagination_token=res.subData.next_token
      result.push(res)
    }while(pagination_token)
    return result.flat()
  }
   /**
   * ユーザーをブロックします
   * @returns {Object}
   */
  block(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/blocking`,{
      method:"POST",
      contentType:"application/json",
      payload:JSON.stringify({
        target_user_id:this.id
      })
    })
  }
  
  /**
   * ユーザーをミュートします
   * @returns {Object}
   */
  mute(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/muting`,{
      method:"POST",
      contentType:"application/json",
      payload:JSON.stringify({
        target_user_id:this.id
      })
    })
  }
}

class ClientUser extends User{
  /**
   * ブロックしているユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/blocks/api-reference/get-users-blocking
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getBlockingUsers(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","block.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/blocking`,{queryParameters})
    return Util.shapeData(response,v=>new User(v,this.client))
  }

  /**
   * ミュートしているユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/mutes/api-reference/get-users-muting
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getMutingUsers(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","mute.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/muting`,{queryParameters})
    return Util.shapeData(response,v=>new User(v,this.client))
  }

  /**
   * ブックマークしたツイートを全て取得します。
   * https://developer.twitter.com/en/docs/twitter-api/tweets/bookmarks/api-reference/get-users-id-bookmarks
   * @param {Object} queryParameters 
   * @returns 
   */
  getBookMarkTweets(queryParameters){
    this.validate()
    this.client.validate(["2.0"],["tweet.read","users.read","bookmark.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/bookmarks`,{queryParameters})
    return Util.shapeData(response,v=>new Tweet(v,this.client))
  }
}


class DMManager{
  /**
   * @param {User} user
   */
  constructor(user){
    this.user=user
    this.client=user.client
  }
  
  send(messageData){
    user.client.validate(["1.0a"])
    const response=this.client.fetch("https://api.twitter.com/1.1/direct_messages/events/new.json",{
      method:"POST",
      contentType:"application/json",
      payload:JSON.stringify({
        event:{
          type:"message_create",
          message_create:{
            target:{
              recipient_id:this.user.id
            },
            message_data:messageData
          }
        }
      })
    })
    return response
  }

  getMessages(queryParameters){
    user.client.validate(["1.0a"])
    let response=this.client.fetch("https://api.twitter.com/1.1/direct_messages/events/list.json",{
      method:"GET",
      queryParameters
    })
    response.events=response.events.filter(({message_create:{sender_id,target:{recipient_id}}})=>sender_id===this.client.user.id&&recipient_id===this.user.id)
    return Util.shapeData(response,v=>new DirectMessage(v,this.client),"events")
  }
}



class DirectMessage{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    this.__proto__.client=client
    if(this.message_create?.target?.recipient_id){
      this.target=new User(this.message_create.target,client)
    }
    if(this.message_create?.sender_id){
      this.sender=new User(this.message_create.sender_id,client)
    }
  }
}








