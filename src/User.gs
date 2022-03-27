class User{
  constructor(u,client){
    if(typeof u==="string")this.id=u
    else{
      for(const key in u){
        this[key]=u[key]
      }
    }
    this.client=client
  }
  
  fetch(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}`,{
      queryParameters
    })
    for(const key in response.data)this[key]=response.data[key]
    return this
  }

  getLiking(){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/liked_tweets`)
    response.data=response.data.map(v=>new Tweet(v,this.client))
    return response
  }
  getTimeLine(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/tweets`,{queryParameters})
    Logger.log(response)
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

  getFollowing(){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/following`)
    response.data=response.data.map(v=>new User(v,this.client))
    return response
  }

  
}

class ClientUser extends User{
  getBlocking(){
    let response=this.client.fetch(`https://api.twitter.com/2/users/${this.id}/blocking`)
    response.data=response.data.map(v=>new User(v,this.client))
    return response
  }
}





