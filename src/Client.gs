class Client{
  constructor({property=ScriptProperties,CLIENT_ID=property.getProperty("CLIENT_ID"),CLIENT_SECRET=property.getProperty("CLIENT_SECRET"),API_KEY=property.getProperty("API_KEY"),API_SECRET=property.getProperty("API_SECRET"),serviceName,id,oauthVersion="2.0",ACCESS_TOKEN,ACCESS_TOKEN_SECRET,restTime=1000}={}){
    if(!serviceName)throw new Error("serviceNameは必須です")
    this.serviceName=serviceName
    if(oauthVersion==="2.0"){
      this.oauthVersion="2.0"
    }else if(oauthVersion==="1.0a"){
      this.oauthVersion="1.0a"
    }else {
      throw new TypeError(`oauthVersionは"2.0"と"1.0a"のみ有効です`)
    }
    this.property=new UtilProp(property,this)
    if(this.property.getProperties()===null)this.property.resetProperty()
    if(this.oauthVersion==="2.0"){
      if(!CLIENT_ID)throw new Error("oauthVersion2.0ではCLIENT_IDは必須です")
      if(!CLIENT_SECRET)throw new Error("oauthVersion2.0ではCLIENT_SECRETは必須です")
      this._code=this.property.getProperty("code")
      this._refreshToken=this.property.getProperty("refresh_token")
      this.accessToken=this.property.getProperty("access_token")
      this.clientId=CLIENT_ID
      this.clientSecret=CLIENT_SECRET
      this.BASIC=Utilities.base64Encode(Client.fixedEncodeURIComponent(this.clientId)+":"+Client.fixedEncodeURIComponent(this.clientSecret))
      this.scope = {
        status:this.property.getProperty("scope"),
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
      if(!API_KEY)throw new Error("oauthVersion1.0aではAPI_KEYは必須です")
      if(!API_SECRET)throw new Error("oauthVersion1.0aではAPI_SECRETは必須です")
      this.apiKey=API_KEY
      this.apiSecret=API_SECRET
      this.oauthToken=ACCESS_TOKEN||this.property.getProperty("oauth_token")
      this.oauthTokenSecret=ACCESS_TOKEN_SECRET||this.property.getProperty("oauth_token_secret")
    }
    this.restTime=restTime
    if(id)this.user=new ClientUser(id,this)
  }
  setId(id){
    this.user=new ClientUser(id,this)
    return this
  }
 
  authorize({scopes}={}){
    if(this.oauthVersion==="2.0"){
      const state = ScriptApp.newStateToken()
        .withMethod("authCallBack")
        .withTimeout(3600)
        .withArgument("serviceName", this.serviceName)
        .createToken();
      this.property.setProperty("scope",scopes)
      this.property.setProperty("state",state)
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${Client.getCallBackURL()}&scope=${(scopes || this.scope.default).join("%20")}&state=${state}&code_challenge=challenge&code_challenge_method=plain`
    }else{
      const state=ScriptApp.newStateToken()
        .withMethod("authCallBack")
        .withTimeout(3600)
        .withArgument("serviceName", this.serviceName)
        .createToken();
      let url=`https://api.twitter.com/oauth/request_token?oauth_callback=${Client.fixedEncodeURIComponent(Client.getCallBackURL()+"?state="+state)}`
      this.oauthTokenSecret=null
      this.oauthToken=null
      const {oauth_token,oauth_token_secret}=this.fetch(url,{method:"POST",contentType:"application/x-www-form-urlencoded"})
      this.property.setProperty("oauth_token_secret",oauth_token_secret)
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
    if(this.oauthTokenSecret)
    signing=`${Client.fixedEncodeURIComponent(this.apiSecret)}&${Client.fixedEncodeURIComponent(this.oauthTokenSecret)}`
    else
    signing=`${Client.fixedEncodeURIComponent(this.apiSecret)}&` 
    return Utilities.base64Encode(Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1,base,signing))
  }
  static fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
  

  isAuthorized(e){
    if(e.parameter.error)return false
    if(this.oauthVersion==="2.0"){
      const { code } = e.parameter
      this.property.setProperty("code", code)
      this._code = code
      try {
        const { refresh_token, access_token } = this._getRefreshToken()
        this.property.setProperties({
          refresh_token: refresh_token,
          access_token: access_token
        })
        return true
      } catch (err) {
        throw err
      }
    }

    let {oauth_verifier,oauth_token}=e.parameter
    try{
      let result=(UrlFetchApp.fetch(`https://api.twitter.com/oauth/access_token?oauth_consumer_key=${this.apiKey}&oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`,{
        method:"POST"
      }))
      result=result.getContentText().split("&").map(v=>v.split("="))
      let obj={}
      for(const [key,value] of result)obj[key]=value
      const {oauth_token_secret,user_id}=obj
      oauth_token=obj.oauth_token
      this.property.setProperties({
        oauth_token,
        oauth_token_secret,
        user_id
      })
      return true
    }catch(e){
      throw e
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
    Logger.log(this.BASIC)
    Logger.log(this._refreshToken)
    const response=JSON.parse(UrlFetchApp.fetch(`https://api.twitter.com/2/oauth2/token?grant_type=refresh_token&refresh_token=${this._refreshToken}`,options))
    Logger.log(response)
    this._refreshToken=response.refresh_token
    this.accessToken=response.access_token
    this.property.setProperties({
      refresh_token:this._refreshToken,
      access_token:this.accessToken
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
      Utilities.sleep(this.restTime)
      return JSON.parse(UrlFetchApp.fetch(url, options))
    }else{
      if(!options)options={}
      options.method=options.method?.toUpperCase()||"GET"
      if(!options.oauthParameters)options.oauthParameters={}
      if(this.oauthToken)options.oauthParameters={oauth_token:this.oauthToken,...options.oauthParameters}
      if(!options.contentType){
        if(url.includes("1.1"))options.contentType="application/x-www-form-urlencoded"
        else options.contentType="application/json"
      }
      const oauthOptions={
        ...options.oauthParameters,
        oauth_consumer_key:this.apiKey,
        oauth_nonce:Client._makeNonce(),
        oauth_signature_method:"HMAC-SHA1",
        oauth_timestamp:Math.floor(Date.now()/1000),
        oauth_version:"1.0"
      }
      if(options.contentType==="application/x-www-form-urlencoded"&&options.payload){
        url+="?"+Object.keys(options.payload).map(v=>`${v}=${Client.fixedEncodeURIComponent(options.payload[v])}`).join("&")
        oauthOptions.oauth_signature=this._makeSignature({method:options.method,url,oauthParams:oauthOptions})
        delete options.payload
      }else{
        oauthOptions.oauth_signature=this._makeSignature({method:options.method,url,oauthParams:oauthOptions})
      }
      let authorizationString="OAuth "+Object.keys(oauthOptions).sort().map(key=>
        `${Client.fixedEncodeURIComponent(key)}="${Client.fixedEncodeURIComponent(oauthOptions[key])}"`
      ).join(", ")
      if(!options.headers)options.headers={}
      options.headers={...options.headers,"Authorization":authorizationString}
      delete options.oauthParameters
      if(options.contentType==="application/json"&&typeof options.parameter==="object")
        options.payload=JSON.stringify(options.payload)
      if(options.contentType==="multipart/form-data")
        delete options.contentType
      Utilities.sleep(this.restTime)
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
    if(this.oauthVersion==="2.0"){
      const option = {
        method: "POST",
        payload: JSON.stringify(payload)
      }
      let response = this.fetch("https://api.twitter.com/2/tweets", option)
      return new Tweet(response.data, this)
    }
    let response=this.fetch("https://api.twitter.com/2/tweets",{
      method:"POST",
      payload:JSON.stringify(payload)
    })
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

  static refreshAll({CLIENT_ID,CLIENT_SECRET,serviceNames}={}){
    serviceNames.forEach((serviceName)=>{
      new Client({CLIENT_ID,CLIENT_SECRET,serviceName}).tokenRefresh()
    })
  }

  uploadMedia(fileName){
    const file=DriveApp.getFilesByName(fileName).next()
    const blob = Utilities.newBlob(
      file.getBlob().getBytes(),
      file.getMimeType(),
      file.getName()
    );
    return this.fetch("https://upload.twitter.com/1.1/media/upload.json",{
      method:"post",
      contentType:"multipart/form-data",
      payload:{
        media:blob,
      },
      muteHttpExceptions:true
    })
  }


  uploadBigMedia(fileName){
    const file=DriveApp.getFilesByName(fileName).next()
    const url="https://upload.twitter.com/1.1/media/upload.json"

    const {media_id_string}=this.fetch(url,{
      method:"POST",
      payload:{
        command:"INIT",
        total_bytes:file.getSize(),
        media_type:file.getMimeType()
      }
    })

    Logger.log("INIT done")

    let mediaData=Utilities.base64Encode(file.getBlob().getBytes())
    let segmentSize=5*1000*1000
    for(let i=0;i<Math.ceil(file.getSize()/segmentSize);i++){
      const blob = Utilities.newBlob(
        Utilities.base64Decode(mediaData.substring(i*segmentSize,(i+1)*segmentSize)),
        file.getMimeType(),
        file.getName()
      );
      this.fetch(url,{
        method:"POST",
        contentType:"multipart/form-data",
        payload:{
          command:"APPEND",
          media_id:media_id_string,
          media:blob,
          segment_index:i+""
        }
      })
    }

    Logger.log("APPEND done")

    return this.fetch(url,{
      method:"POST",
      payload:{
        command:"FINALIZE",
        media_id:media_id_string
      }
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

    return JSON.parse(UrlFetchApp.fetch(url,options))
  }

  getUserByUsername(username,options){
    return this.fetch(`https://api.twitter.com/2/users/by/username/${username}`,options)
  }
  
}
















