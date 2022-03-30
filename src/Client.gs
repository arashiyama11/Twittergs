class Client{
  constructor({property=ScriptProperties,CLIENT_ID=property.getProperty("CLIENT_ID"),CLIENT_SEACRET=property.getProperty("CLIENT_SEACRET"),BEARER_TOKEN=property.getProperty("BEARER_TOKEN"),API_KEY=property.getProperty("API_KEY"),API_SEACRET=property.getProperty("API_SEACRET"),serviceName,id,oauthVersion="2.0",ACCESS_TOKEN,ACCESS_TOKEN_SEACRET}={}){
    if(!serviceName)throw new ReferenceError("serviceNameは必須です")
    if(oauthVersion==="2.0"||oauthVersion==="2"||oauthVersion===2){
      this.oauthVersion="2.0"
    }else{
      this.oauthVersion="1.0a"
    }
    property=new UtilProp(property,client)
    if(this.oauthVersion==="2.0"){
      if(!CLIENT_ID)throw new ReferenceError("oauthVersion2.0ではCLIENT_IDは必須です")
      if(!CLIENT_SEACRET)throw new ReferenceError("oauthVersion2.0ではCLIENT_SEACRETは必須です")
      this._state=property.getProperty("_"+serviceName+"_state")

      this._code=property.getProperty("_"+serviceName+"_code")
      this._refreshToken=property.getProperty("_"+serviceName+"_refresh_token")
      this.accessToken=property.getProperty("_"+serviceName+"_access_token")
      this.clientId=CLIENT_ID
      this.clientSeacret=CLIENT_SEACRET
      this.BASIC=Utilities.base64Encode(this.clientId+":"+this.clientSeacret)
      this.scope = {
        all: [
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
        ],
        "default": [
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
      }
    }else{
      if(!API_KEY)throw new ReferenceError("oauthVersion1.0aではAPI_KEYは必須です")
      if(!API_SEACRET)throw new ReferenceError("oauthVersion1.0aではAPI_SEACRETは必須です")
      this.accessToken=ACCESS_TOKEN
      this.accessTokenSeacret=ACCESS_TOKEN_SEACRET
      this.apiKey=API_KEY
      this.apiSeacret=API_SEACRET
    }
    this.serviceName=serviceName
    this.user=new ClientUser(id,this)
  }
  setId(id){
    this.user=new ClientUser(id,this)
    return this
  }
 
  authorize({scopes}={}){
    if(this.oauthVersion==="2.0"){
      if (scopes && !scopes.includes("offline.access")) throw new ReferenceError("offline.accessは必須です")
      let state = ScriptApp.newStateToken()
        .withMethod("authCallBack")
        .withTimeout(3600)
        .withArgument("serviceName", this.serviceName)
        .createToken();
      this._state = state
      this.scope = scopes
      PropertiesService.getUserProperties().setProperty("_" + this.serviceName + "_state", state)
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${Client.getCallBackURL()}&scope=${(scopes || this.defaultScopes).join("%20")}&state=${this._state}&code_challenge=challenge&code_challenge_method=plain`
    }else{
      const state=ScriptApp.newStateToken()
        .withMethod("authCallBack")
        .withTimeout(3600)
        .withArgument("serviceName", this.serviceName)
        .createToken();
      let url=`https://api.twitter.com/oauth/request_token?oauth_callback=${Client.fixedEncodeURIComponent(Client.getCallBackURL()+"?state="+state)}`
      const {oauth_token,oauth_token_secret}=this.fetch(url,{method:"POST"})
      return `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`
    }
  }

  static _makeNonce(){
    let chars=["A","B","C","D","E","F","G","H","I","J","K","L","M",",N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0"]
    return Utilities.base64Encode(Array(32).fill(0).map(()=>chars[Math.floor(Math.random()*chars.length)]).join(""))
  }

  _makeSignature({method,url,oauthParams}={}){
    let result=""
    let encodedOauthParams={}
    for(let key in oauthParams)encodedOauthParams[Client.fixedEncodeURIComponent(key)]=Client.fixedEncodeURIComponent(oauthParams[key]
)
    let params=[]
    if(url.includes("?")){
      params=url.split("?")[1].split("&").map(v=>v.split("="))
      url=url.split("?")[0]
    }
    let oauthArr=params
    for(let key in encodedOauthParams){
      oauthArr.push([key,encodedOauthParams[key]])
    }
    
    oauthArr.sort((a,b)=>{
      if(a<b)return -1
      else if(a>b)return 1
      else return 0
    })

    result=Client.fixedEncodeURIComponent(oauthArr.map(v=>v.join("=")).join("&"))
    let base=`${method}&${Client.fixedEncodeURIComponent(url)}&${result}`
    let signing=""
    if(this.accessTokenSeacret)
    signing=`${Client.fixedEncodeURIComponent(this.apiSeacret)}&${Client.fixedEncodeURIComponent(this.accessTokenSeacret)}`
    else
    signing=`${Client.fixedEncodeURIComponent(this.apiSeacret)}&`    
    return Utilities.base64Encode(Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1,base,signing))
  }
  static fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
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
        "Authorization":"Basic "+this.BASIC
      },
    }
    return JSON.parse(UrlFetchApp.fetch(`https://api.twitter.com/2/oauth2/token?grant_type=authorization_code&code=${this._code}&code_verifier=challenge&redirect_uri=${Client.getCallBackURL()}`,options))
  }
  
  tokenRefresh(){
    const options={
      method:"POST",
      headers:{
        "Content-Type":"application/x-www-form-urlencoded",
        "Authorization":"Basic "+this.BASIC
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

  /**
   * 
   * options{
   *   payload
   *   queryParameters if(method==="GET")
   *   oauthParameters if(oauthVersion==="1.0a")
   * }
   */
  fetch(url,options){
    if(this.oauthVersion==="2.0"){
      if (!options) options = {}
      if (!options.headers)options.headers = { "Authorization": "Bearer " + this.accessToken }
      if (!options.headers.Authorization) options.headers.Authorization = "Bearer " + this.accessToken
      if (!options.contentType) options.contentType = "application/json"
      if ((!options.method || options.method === "GET" || options.method === "get") && options.queryParameters) {
        let uriOption = []
        for (const key in options.queryParameters) {
          let value = options.queryParameters[key]
          if (Array.isArray(value)) value = value.join(",")
          uriOption.push(`${key}=${value}`)
        }
        url += "?" + uriOption.join("&")
        delete options.queryParameters
      }
      return JSON.parse(UrlFetchApp.fetch(url, options))
    }else{
      if(!options)options={}
      options.method=options.method?.toUpperCase()||"GET"
      const oauthOptions={
        ...options.oauthParameters,
        oauth_consumer_key:this.apiKey,
        oauth_nonce:Client._makeNonce(),
        oauth_signature_method:"HMAC-SHA1",
        oauth_timestamp:Math.floor(Date.now()/1000),
        oauth_version:"1.0"
      }
      oauthOptions.oauth_signature=this._makeSignature({method:options.method,url,oauthParams:oauthOptions})
      let authorizationString="OAuth "+Object.keys(oauthOptions).sort().map(key=>{
        return `${Client.fixedEncodeURIComponent(key)}="${Client.fixedEncodeURIComponent(oauthOptions[key])}"`
      }).join(", ")
      if(!options.headers)options.headers={}
      options.headers={"Authorization":authorizationString}
      delete options.oauthParameters
      let result=UrlFetchApp.fetch(url,options)
      try{
        return JSON.parse(result)
      }catch(e){
        result=result.getContentText().split("&").map(v=>v.split("="))
        let obj={}
        for(const [key,value] of result)obj[key]=value
        return obj
      }
    }
  }

  getTweets(queryParameters){
    let response=this.fetch("https://api.twitter.com/2/tweets/search/recent",{
      queryParameters:queryParameters||Tweet.defaultQueryParameters
    })
    response.data=response.data.map(v=>new Tweet(v,this))
    return response
  }

  getTweetById(id,queryParameters){
    let response=this.fetch(`https://api.twitter.com/2/tweets/${id}`,{
      queryParameters:queryParameters||Tweet.defaultQueryParameters
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

  getUserByUsername(username,queryParameters){
    return new User(this.fetch(`https://api.twitter.com/2/users/by/username/${username}`,{
      queryParameters:queryParameters||Tweet.defaultQueryParameters
    }).data,this)
  }

  static getCallBackURL(){
    return `https://script.google.com/macros/d/${ScriptApp.getScriptId()}/usercallback`
  }

  static get github(){
    return "https://github.com/arashi-yama/TwitterAPI"
  }

  static refreshAll({CLIENT_ID,CLIENT_SEACRET,serviceNames}={}){
    serviceNames.forEach((serviceName)=>{
      new Client({CLIENT_ID,CLIENT_SEACRET,serviceName}).tokenRefresh()
    })
  }
}



class AppOnlyClient{
  constructor(BEARER_TOKEN){
    this.bearerToken=BEARER_TOKEN||PropertiesService.getUserProperties().getProperty("BEARER_TOKEN")||ScriptProperties.getProperty("BEARER_TOKEN")
  }
  fetch(url,options){
    options=options||{}
    options.headers=options.headers||{"Authorization":"Bearer "+this.bearerToken}
    if(options.queryParameters){
      let uriOption=[]
      for(const key in options.queryParameters){
        let value=options.queryParameters[key]
        if(Array.isArray(value))value=value.join(",")
        uriOption.push(`${key}=${value}`)
      }
      url+="?"+uriOption.join("&")
      delete options.queryParameters
    }
    Logger.log(url)
    return JSON.parse(UrlFetchApp.fetch(url,options))
  }

  getUserByUsername(username,options){
    return this.fetch(`https://api.twitter.com/2/users/by/username/${username}`,options)
  }
  
}
















