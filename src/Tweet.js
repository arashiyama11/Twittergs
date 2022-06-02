class Tweet{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    if(this.author_id)this.author=new User(this.author_id,client)
    this.__proto__.client=client
  }

  update(queryParameters){
    let result=this.client.fetch("https://api.twitter.com/2/tweets/"+this.id,{
      queryParameters
    })
    Object.assign(this,result)
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
    let response=this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}/quote_tweets`,{queryParameters:queryParameters||Tweet.defaultQueryParameters})
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

  static get allQueryParameters(){
    return{
      expansions:Tweet.expansions,
      "media.fields":Tweet.mediaFields,
      "place.fields":Tweet.placeFields,
      "poll.fields":Tweet.pollFields,
      "tweet.fields":Tweet.tweetFields,
      "user.fields":Tweet.userFields
    }
  }

  static get defaultQueryParameters(){
    return {
      expansions:["author_id","in_reply_to_user_id","referenced_tweets.id"],
    }
  }

  static get expansions(){
    return ["attachments.poll_ids","attachments.media_keys","author_id","entities.mentions.username","geo.place_id", "in_reply_to_user_id","referenced_tweets.id","referenced_tweets.id.author_id"]
  }

  static get mediaFields(){
    return["duration_ms","height","media_key", "preview_image_url","type","url","width","public_metrics","non_public_metrics","organic_metrics","promoted_metrics","alt_text"]
  }

  static get placeFields(){
    return["contained_within","country","country_code", "full_name", "geo", "id", "name", "place_type"]
  }

  static get pollFields(){
    return["duration_minutes","end_datetime","id","options","voting_status"]
  }

  static get tweetFields(){
    return["attachments","author_id","context_annotations","conversation_id","created_at","entities","geo","id, in_reply_to_user_id", "lang","non_public_metrics","public_metrics","organic_metrics","promoted_metrics","possibly_sensitive","referenced_tweets","reply_settings","source","text", "withheld"]
  }

  static get userFields(){
    return["created_at","description","entities","id","location","name","pinned_tweet_id","profile_image_url","protected","public_metrics","url","username","verified","withheld"]
  }

}


class ClientTweet extends Tweet{
  delete(){
    return this.client.fetch(`https://api.twitter.com/2/tweets/${this.id}`,{
      method:"DELETE",
    })
  }
}