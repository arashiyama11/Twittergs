const TWITTER_API_DATA={
  scopes:[
    "tweet.read",
    "tweet.write",
    "tweet.moderate.write",
    "users.read",
    "follows.read",
    "follows.write",
    "offline.access",
    "space.read",
    "mute.read",
    "mute.write",
    "like.read",
    "like.write",
    "list.read",
    "list.write",
    "block.read",
    "block.write",
    "bookmark.read",
    "bookmark.write"
  ],
  queryParameters:{
    tweet:{
      expansions:[]
    },
    user:{}
  }
}

const Util={
  parcentEncode(){},
  makeNonce(){},
  getCallBackUrl(){},
  buildParam(){},
  parseParam(){}
}

class WithMetaArray extends Array{
  constructor({meta,data}={}){
    super(...data,null)
    this.pop()
    this.meta=meta
  }
}

class Property{
  constructor(property,client){
    this.property=property
    this.key=`Twittergs_${client.oauthVersion}_${client.serviceName}`
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




