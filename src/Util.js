const TWITTER_API_DATA={
  scopes:["tweet.read","tweet.write","tweet.moderate.write","users.read","follows.read","follows.write","offline.access","space.read","mute.read","mute.write","like.read","like.write","list.read","list.write","block.read","block.write","bookmark.read","bookmark.write"
  ],
  queryParameters:{
    tweet:{
      expansions:["attachments.poll_ids","attachments.media_keys","author_id","entities.mentions.username","geo.place_id", "in_reply_to_user_id","referenced_tweets.id","referenced_tweets.id.author_id"],
      "media.fields":["duration_ms","height","media_key", "preview_image_url","type","url","width","public_metrics","non_public_metrics","organic_metrics","promoted_metrics","alt_text"],
      "place.fields":["contained_within","country","country_code","full_name","geo","id","name","place_type"],
      "poll.fields":["duration_minutes","end_datetime","id","options","voting_status"],
      "tweet.fields":["attachments", "author_id", "context_annotations", "conversation_id", "created_at", "entities", "geo", "id", "in_reply_to_user_id", "lang","non_public_metrics", "public_metrics", "organic_metrics", "promoted_metrics", "possibly_sensitive", "referenced_tweets", "reply_settings", "source", "text", "withheld"],
      "user.fields":["created_at", "description", "entities", "id", "location", "name", "pinned_tweet_id", "profile_image_url", "protected", "public_metrics", "url", "username", "verified", "withheld"]
    },
    user:{
      expansions:["pinned_tweet_id"],
      "tweet.fields":["attachments", "author_id", "context_annotations", "conversation_id", "created_at", "entities", "geo", "id", "in_reply_to_user_id", "lang", "non_public_metrics", "public_metrics", "organic_metrics", "promoted_metrics", "possibly_sensitive", "referenced_tweets", "reply_settings", "source", "text", "withheld"],
      "user.fields":["created_at", "description", "entities", "id", "location", "name", "pinned_tweet_id", "profile_image_url", "protected", "public_metrics", "url", "username", "verified", "withheld"]
    }   
  }
}

const Util={
  /**
   * @param {string} str 
   * @returns {string}
   */
  parcentEncode(str){
    return encodeURIComponent(str).replace(/[!'()*]/g,c=>`%${s.charCodeAt(0).toString()}`)
  },
  /**
   * @param {number} size 
   * @returns {string}
   */
  makeNonce(size=32){
    const chars="ABCDEFGHIDKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvxyz1234567890"
    return Array(size).fill(0).map(()=>chars[Math.floor(Math.random()*chars.length)]).join("")
  },
  /**
   * 
   * @returns {string}
   */
  getCallBackURL(){
    return `https://script.google.com/macros/d/${ScriptApp.getScriptId()}/usercallback`
  },
  /**
   * 
   * @param {Object} obj 
   * @returns {string}
   */
  buildParam(obj){
    return Object.entries(obj).map(([k,v])=>Util.parcentEncode(k)+"="+Util.parcentEncode(v)).join("&")
  },
  /**
   * 
   * @param {string} str 
   * @returns {Object}
   */
  parseParam(str){
    if(str.includes("?"))str=str.split("?")[1]
    return Object.fromEntries(str.split("&").map(v=>v.split("=").map(decodeURIComponent)))
  },
  /**
   * @returns {Object}
   */
  mergeMeta(response){
    let data=response.data||{}
    let sub=Object.fromEntries(Object.entries(response).filter(([k,v])=>k!=="data"))
    data.subData=sub
    return data
  },
  /**
   * @returns {Array}
   */
  shapeData(response,mkinstanceFn,mainData="data"){
    const data=response[mainData].map(mkinstanceFn)||[]
    const sub=Object.fromEntries(Object.entries(response).filter(([k])=>k!==mainData))
    data.subData=sub
    return data
  }
}

class Property{
  constructor(property,client){
    this.property=property
    this.key=`Twittergs_${client.oauthVersion}_${client.name}`
    this.data=JSON.parse(property.getProperty(this.key)||"{}")
  }

  getProperties(){
    return this.data
  }

  setProperties(obj){
    Object.assign(this.data,obj)
    this.property.setProperty(this.key,JSON.stringify(obj))
  }

  getProperty(key){
    return this.data[key]
  }

  setProperty(key,value){
    this.data[key]=value
    this.property.setProperty(this.key,JSON.stringify(this.data))
  }

  deleteProperty(key){
    let props=this.data
    let keys=Object.keys(props).filter(k=>k!==key)
    let obj={}
    for(let k of keys)obj[k]=props[k]
    this.property.setProperty(this.key,JSON.stringify(obj))
  }

  resetProperty(){
    this.property.setProperty(this.key,"{}")
  }
}