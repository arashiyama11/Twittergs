class Tweet{
  constructor(twt,client){
    if(typeof twt==="string")this.id=twt
    else{
      for(const key in twt){
         this[key]=twt[key]
      }
      if(twt.author_id)this.user=new User(twt.author_id,client)
    }
    this.client=client
  }

  fetch(queryParameters){
    let result=this.client.fetch("https://api.twitter.com/2/tweets/"+this.id,{
      queryParameters
    })
    for(const key in result.data){
      this[key]=result.data[key]
    }
    return this
  }

  reply(payload){
    payload={
      ...payload,
      reply:{
        in_reply_to_tweet_id:this.id
      }
    }
    return this.client.postTweet(payload)
  }

  delete(){
    return this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}`,{
      method:"DELETE",
    })
  }
  getLiked(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/liking_users`,{queryParameters})
    if(response.data)response.data=response.data.map(v=>new User(v,this.client))
    return response
  }

  getRetweeted(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/retweeted_by`,{queryParameters})
    if(response.data)response.data=response.data.map(v=>new User(v,this.client))
    return response
  }

  getQuoteTweets(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/quote_tweets`,{queryParameters})
    if(response.data)response.data=response.data.map(v=>new Tweet(v,this.client))
    return response
  }
  like(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/likes`,{
      method:"POST",
      payload:JSON.stringify({
        tweet_id:this.id
      })
    })
  }

  deleteLike(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/likes/${this.id}`,{method:"DELETE"})
  }
  retweet(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/retweets`,{
      method:"POST",
      payload:JSON.stringify({
        tweet_id:this.id
      })
    })
  }

  deleteRetweet(){
    return this.client.fetch(`https://api.twitter.com/2/users/${this.client.user.id}/retweets/${this.id}`,{method:"DELETE"})
  }

}






