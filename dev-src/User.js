class User{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    this.__proto__.client=client
  }
  
  update(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}`,{
      queryParameters
    })
    Object.assign(this,response)
    return this
  }

  getLiking(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/liked_tweets`,{
      queryParameters:queryParameters||Tweet.defaultQueryParameters
    })
    response.data=response.data.map(v=>new Tweet(v,this.client))
    return response
  }


  getTimeLine(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/tweets`,{
      queryParameters:queryParameters||Tweet.defaultQueryParameters
    })
    response.data=response.data.map(v=>new Tweet(v,this.client))
    return response
  }
  getMentioned(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/mentions`,{
      queryParameters:queryParameters||Tweet.defaultQueryParameters
    })
    response.data=response.data.map(v=>new Tweet(v,this.client))
    return response
  }

  follow(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/following`,{
      method:"POST",
      payload:JSON.stringify({
        target_user_id:this.id
      })
    })
  }

  unfollow(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/following/${this.id}`,{method:"DELETE"})
  }

  getFollowing(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/following`,{queryParameters})
    response.data=response.data.map(v=>new User(v,this.client))
    return response
  }

  getFollowers(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/followers`,{queryParameters})
    response.data=response.data.map(v=>new User(v,this.client))
    return response
  }
  
}

class ClientUser extends User{
  getBlocking(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/blocking`,{queryParameters})
    response.data=response.data.map(v=>new User(v,this.client))
    return response
  }

  getMuting(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/muting`,{queryParameters})
    response.data=response.data.mao(v=>new User(v,this.client))
    return response
  }
}





