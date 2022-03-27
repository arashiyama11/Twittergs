class Client{
  constructor({CLIENT_ID,CLIENT_SEACRET,serviceName,id,BEARER_TOKEN}={}){
    if(!serviceName)throw new ReferenceError("serviceNameは必須です")
    const props=PropertiesService.getUserProperties()
    this._state=props.getProperty("_"+serviceName+"_state")
    this._code=props.getProperty("_"+serviceName+"_code")
    this._refreshToken=props.getProperty("_"+serviceName+"_refresh_token")
    this.accessToken=props.getProperty("_"+serviceName+"_access_token")
    this.clientId=CLIENT_ID||props.getProperty("CLIENT_ID")
    this.clientSeacret=CLIENT_SEACRET||props.getProperty("CLIENT_SEACRET")
    this.appOnlyToken=BEARER_TOKEN
    if(!this.clientId)throw new ReferenceError("CLIENT_IDは必須です")
    if(!this.clientSeacret)throw new ReferenceError("CLIENT_SEACRETは必須です")
    this.serviceName=serviceName
    this.BASIC=Utilities.base64Encode(this.clientId+":"+this.clientSeacret)
    this.SCOPES=[
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
      "Bookmark.write"
    ]
    this.defaultScopes=[
      "tweet.read",
      "tweet.write",
      "users.read",
      "follows.read",
      "follows.write",
      "offline.access",
      "like.read",
      "like.write",
      "mute.read",
      "mute.write",
      "block.read",
      "block.write",
    ]
    this.user=new User(id,this)
  }

  getAppOnlyAccessToken(){
    const options={
      method:"POST",
      headers:{
        "Authorization":"Basic "+this.BASIC,
         "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"
        },
      payload:{
        grant_type:"client_credentials"
      }
    }
    return UrlFetchApp.fetch("https://api.twitter.com/oauth2/token",options)
  }
  setId(id){
    this.user=new User(id,this)
    return this
  }
  toString(){
    return "Client"
  }
  authorize({scopes}={}){
    if(scopes&&!scopes.includes("offline.access"))throw new ReferenceError("offline.accessは必須です")
    let state=ScriptApp.newStateToken()
      .withMethod("authCallBack")
      .withTimeout(3600)
      .withArgument("serviceName",this.serviceName)
      .createToken();
    this._state=state
    this.scope=scopes
    PropertiesService.getUserProperties().setProperty("_"+this.serviceName+"_state",state)
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${Client.getCallBackURL()}&scope=${(scopes||this.defaultScopes).join("%20")}&state=${this._state}&code_challenge=challenge&code_challenge_method=plain`
  }

  isAuthorized(e){
    if(e.parameter.error)return false
    const {code,state}=e.parameter
    if(state===this._state){
      const props=PropertiesService.getUserProperties()
      props.setProperty("_"+this.serviceName+"_code",code)
      this._code=code
      try{
        const {refresh_token,access_token}=this._getRefreshToken()
        props.setProperty("_"+this.serviceName+"_refresh_token",refresh_token)
        props.setProperty("_"+this.serviceName+"_access_token",access_token)
        return true
      }catch(err){
        throw err
      }
    }else{
      return false
    }
  }

  _getRefreshToken(){
    const options={
      method:"POST",
      headers:{
        "Content-Type":"application/x-www-form-urlencoded",
        "Authorization":"Basic "+Utilities.base64Encode(this.clientId+":"+this.clientSeacret)
      },
    }
    return JSON.parse(UrlFetchApp.fetch(`https://api.twitter.com/2/oauth2/token?grant_type=authorization_code&code=${this._code}&code_verifier=challenge&redirect_uri=${Client.getCallBackURL()}`,options))
  }
  
  tokenRefresh(){
    const options={
      method:"POST",
      headers:{
        "Content-Type":"application/x-www-form-urlencoded",
        "Authorization":"Basic "+Utilities.base64Encode(this.clientId+":"+this.clientSeacret)
      },
    }
    const response=JSON.parse(UrlFetchApp.fetch(`https://api.twitter.com/2/oauth2/token?grant_type=refresh_token&refresh_token=${this._refreshToken}`,options))
    Logger.log(response)
    this._refreshToken=response.refresh_token
    this.accessToken=response.access_token
    PropertiesService.getUserProperties().setProperties({
      ["_"+this.serviceName+"_refresh_token"]:this._refreshToken,
      ["_"+this.serviceName+"_access_token"]:this.accessToken
    })
  }

  fetch(url,options){
    if(!options)options={}
    if(!options.headers)options.headers={"Authorization":"Bearer "+this.accessToken}
    if(!options.headers.Authorization)options.headers.Authorization="Bearer "+this.accessToken
    if(!options.contentType)options.contentType="application/json"
    if((!options.method||options.method==="GET"||options.method==="get")&&options.queryParameters){
      let uriOption=[]
      for(const key in options.queryParameters){
        let value=options.queryParameters[key]
        if(Array.isArray(value))value=value.join("&")
        uriOption.push(`${key}=${value}`)
      }
      url+="?"+uriOption.join("&")
      delete options.queryParameters
    }
    return JSON.parse(UrlFetchApp.fetch(url,options))
  }

  getTweets(queryParameters){
    const option={
      method:"GET",
      queryParameters
    }
    let response=this.fetch("https://api.twitter.com/2/tweets/search/recent",option)
    response.data=response.data.map(v=>new Tweet(v,this))
    return response
  }

  getTweetById(id,queryParameters){
    let response=this.fetch(`https://api.twitter.com/2/tweets/${id}`,{
      queryParameters
    })
    response.data=new Tweet(response.data,this)
    return response
  }

  postTweet(payload){
    const option={
      method:"POST",
      payload:JSON.stringify(payload)
    }
    let response=this.fetch("https://api.twitter.com/2/tweets",option)
    return new Tweet(response.data,this)
  }

  getUserByUsername(username){
    return new User(this.fetch(`https://api.twitter.com/2/users/by/username/${username}`).data,this)
  }

  static getCallBackURL(){
    return `https://script.google.com/macros/d/${ScriptApp.getScriptId()}/usercallback`
  }

  static refreshAll({CLIENT_ID,CLIENT_SEACRET,serviceNames}={}){
    serviceNames.forEach((serviceName)=>{
      new Client({CLIENT_ID,CLIENT_SEACRET,serviceName}).tokenRefresh()
    })
  }
}




















