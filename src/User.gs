class User{
  constructor(u,client){
    if(typeof u==="string")this.id=u
    else{
      for(const key in u){
        this[key]=u[key]
      }
    }
    this.__proto__.client=client
  }
  
  fetch(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}`,{
      queryParameters
    })
    for(const key in response.data)this[key]=response.data[key]
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





