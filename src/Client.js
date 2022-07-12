class Client{
  constructor({property=PropertiesService.getUserProperties(),CLIENT_ID=property.getProperty("CLIENT_ID"),CLIENT_SECRET=property.getProperty("CLIENT_SECRET"),API_KEY=property.getProperty("API_KEY"),API_SECRET=property.getProperty("API_SECRET"),name,oauthVersion,ACCESS_TOKEN,ACCESS_TOKEN_SECRET,restTime=1000}={}){
    if(!oauthVersion)throw new Error("oauthVersionは必須です")
    if(!name)throw new Error("nameは必須です")
    this.name=name
    if(oauthVersion==="2.0"){
      this.oauthVersion="2.0"
    }else if(oauthVersion==="1.0a"){
      this.oauthVersion="1.0a"
    }else{
      throw new TypeError(`oauthVersionは"2.0"と"1.0a"のみ有効です`)
    }
    this.property=new Property(property,this)
    if(this.oauthVersion==="2.0"){
      if(!CLIENT_ID)throw new Error("oauthVersion2.0ではCLIENT_IDは必須です")
      if(!CLIENT_SECRET)throw new Error("oauthVersion2.0ではCLIENT_SECRETは必須です")
      this._refreshToken=this.property.getProperty("refresh_token")
      this.accessToken=this.property.getProperty("access_token")||ACCESS_TOKEN
      this.clientId=CLIENT_ID
      this.clientSecret=CLIENT_SECRET
      this.BASIC=Utilities.base64Encode(Util.parcentEncode(this.clientId)+":"+Util.parcentEncode(this.clientSecret))
      this.scope = this.property.getProperty("scope")
    }else{
      if(!API_KEY)throw new Error("oauthVersion1.0aではAPI_KEYは必須です")
      if(!API_SECRET)throw new Error("oauthVersion1.0aではAPI_SECRETは必須です")
      this.apiKey=API_KEY
      this.apiSecret=API_SECRET
      this.oauthToken=ACCESS_TOKEN||this.property.getProperty("oauth_token")
      this.oauthTokenSecret=ACCESS_TOKEN_SECRET||this.property.getProperty("oauth_token_secret")
    }
    this.restTime=restTime
    const userId=this.property.getProperty("user_id")
    if(this.hasAuthorized()&&!userId){
      this.user=this.getMyUser()
      this.property.setProperty("user_id",this.user.id)
    }
    else this.user=new ClientUser(userId,this)
  }
  /**
   * clientにそのスコープやバージョンが含まれているか検証します
   * @param {string[]} oauthVersion
   * @param {string[]} scope 
   */
  validate(oauthVersion,scope){
    if(!this.hasAuthorized())throw new Error("認証されていません")
    if(!oauthVersion.includes(this.oauthVersion))throw new Error(`${oauthVersion.join()}のみで使用可能です`)
    if(this.oauthVersion==="2.0"&&scope.length)scope.forEach(s=>{
      if(!this.scope?.includes(s))throw new Error(`${scope.filter(s=>!this.scope.includes(s))}スコープが不足しています`)
    })
  }

  /**
   * 認証URLを発行します
   * @param {string[]} scopes 2.0の場合はスコープを指定します  
   * @returns {string} 認証URLです
   */
  authorize(scopes=TWITTER_API_DATA.scopes){
    if(this.oauthVersion==="2.0"){
      const code_verifier=Util.makeNonce(32)
      const challenge=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,code_verifier,Utilities.Charset.US_ASCII)).replace(/=/g,"")
      const state=ScriptApp.newStateToken()
        .withMethod("authCallBack")
        .withArgument("name",this.name)
        .withArgument("code_verifier",code_verifier)
        .createToken()
      this.property.setProperties({
        scope:scopes,
        code_verifier,
      })
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${Util.parcentEncode(Util.getCallBackURL())}&scope=${scopes.join("+")}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`
    }else{
      const state=ScriptApp.newStateToken()
        .withTimeout(3600)
        .withArgument("name",this.name)
        .withMethod("authCallBack")
        .createToken()
      this.oauthTokenSecret=null
      this.oauthToken=null
      const {oauth_token,oauth_token_secret}=this.fetch("https://api.twitter.com/oauth/request_token",{
        method:"POST",
        contentType:"application/x-www-form-urlencoded",
        payload:{
          oauth_callback:Util.getCallBackURL()+"?state="+state
        }
      })
      this.property.setProperty("oauth_token_secret",oauth_token_secret)
      return `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`
    }
  }

  _makeSignature({method,url,oauthParams}={}){
    let params=[]
    if(url.includes("?")){
      params=url.split("?")[1].split("&").map(v=>v.split("=")).map(([k,v])=>[k,decodeURIComponent(v)])
      url=url.split("?")[0]
    }

    params.push(...Object.entries(oauthParams))
    params.sort(([a],[b])=>(a>b)*2-1)

    const paramsResult=params.map(([key,value])=>`${Util.parcentEncode(key)}=${Util.parcentEncode(value)}`).join("&")
    const base=`${method}&${Util.parcentEncode(url)}&${Util.parcentEncode(paramsResult)}`
    const signing=`${Util.parcentEncode(this.apiSecret)}&${Util.parcentEncode(this.oauthTokenSecret||"")}`

    return Utilities.base64Encode(Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1,base,signing))
  }

  
  /**
   * 認証コールバックイベントの引数からclientを作成します
   * @returns {Client}
   */
  static fromCallBackEvent({e,property=PropertiesService.getUserProperties(),CLIENT_ID=property.getProperty("CLIENT_ID"),CLIENT_SECRET=property.getProperty("CLIENT_SECRET"),API_KEY=property.getProperty("API_KEY"),API_SECRET=property.getProperty("API_SECRET")}={}){
    return new Client({
      name:e.parameter.name,
      oauthVersion:e.parameter.code?"2.0":"1.0a",
      API_KEY,
      API_SECRET,
      CLIENT_ID,
      CLIENT_SECRET
    })
  }
  /**
   * doGetイベントの引数から正常に認証がされているかを判別します
   * @param {Object} e doGetイベントの引数です 
   * @returns {boolean}
   */
  isAuthorized(e){
    if(e.parameter.error)return false
    if(this.oauthVersion==="2.0"){
      const { code ,code_verifier} = e.parameter
      const { refresh_token, access_token,scope} = JSON.parse(UrlFetchApp.fetch("https://api.twitter.com/2/oauth2/token",{
        method:"POST",
        headers:{
          "Authorization":"Basic "+this.BASIC
        },
        payload:{
          grant_type:"authorization_code",
          code,
          code_verifier,
          redirect_uri:Util.getCallBackURL()
        }
      }))
      this.property.setProperties({
        refresh_token,
        access_token,
        scope:scope.split(" ")
      })
      return true
    }
    let {oauth_verifier,oauth_token}=e.parameter
    let response=Util.parseParam(UrlFetchApp.fetch("https://api.twitter.com/oauth/access_token",{
      method:"POST",
      payload:{
        oauth_consumer_key:this.apiKey,
        oauth_token,
        oauth_verifier
      }
    }).getContentText())
    const {oauth_token_secret,user_id,screen_name}=response
    if(this.name==="@auto"){
      this.name=screen_name
      this.property=new Property(this.property.property,this)
    }
    oauth_token=response.oauth_token
    this.property.setProperties({
      oauth_token,
      oauth_token_secret,
      user_id
    })
    return true
  }
  /**
   * 2.0専用です。
   * トークンをリフレッシュします
   */
  refresh(){
    this.validate(["2.0"],["offline.access"])
    const options={
      method:"POST",
      headers:{
        "Authorization":"Basic "+this.BASIC
      },
      contentType:"application/x-www-form-urlencoded",
      payload:{
        grant_type:"refresh_token",
        refresh_token:this._refreshToken
      }
    }
    const response=JSON.parse(UrlFetchApp.fetch(`https://api.twitter.com/2/oauth2/token`,options))
    this._refreshToken=response.refresh_token
    this.accessToken=response.access_token
    this.property.setProperties({
      refresh_token:this._refreshToken,
      access_token:this.accessToken
    })
  }
  /**
   * 与えられたnamesに紐づけられているアカウントをリフレッシュします
   */
  static refreshAll({CLIENT_ID,CLIENT_SECRET,names}={}){
    names.forEach((name)=>{
      new Client({CLIENT_ID,CLIENT_SECRET,name}).refresh()
    })
  }
  /**
   * 適切な認証情報を載せてfetchします
   * @param {string} url 
   * @param {Object} options 
   * @returns {Object}
   */
  fetch(url,options){
    if(!url)throw new Error("urlがありません")
    if(this.oauthVersion==="2.0"){
      options.method=options.method?.toUpperCase()||"GET"
      if (!options) options = {}
      if (!options.headers)options.headers = { "Authorization": "Bearer " + this.accessToken }
      if (!options.headers.Authorization) options.headers.Authorization = "Bearer " + this.accessToken
      if (options.method==="POST"&&!options.contentType) throw new Error("contentTypeは必須です")
      if ((options.method === "GET") && options.queryParameters) {
        let uriOption=Util.buildParam(options.queryParameters)
        if(uriOption)url += "?" + uriOption
        delete options.queryParameters
      }
      Utilities.sleep(typeof this.restTime==="function"?Number(this.restTime()):Number(this.restTime))
      return JSON.parse(UrlFetchApp.fetch(url, options))
    }else{
      if(!options)options={}
      options.method=options.method?.toUpperCase()||"GET"
      if(!options.oauthParameters)options.oauthParameters={}
      if(this.oauthToken)options.oauthParameters.oauth_token=this.oauthToken
      if(options.method==="POST"&&!options.contentType)throw new Error("contentTypeは必須です")
      if ((options.method === "GET" || options.method === "get") && options.queryParameters) {
        let uriOption = Util.buildParam(options.queryParameters)
        if(uriOption)url += "?" + uriOption
        delete options.queryParameters
      }
      const oauthOptions={
        ...options.oauthParameters,
        oauth_consumer_key:this.apiKey,
        oauth_nonce:Util.makeNonce(),
        oauth_signature_method:"HMAC-SHA1",
        oauth_timestamp:Math.floor(Date.now()/1000)+"",
        oauth_version:"1.0"
      }
      if(options.contentType==="application/x-www-form-urlencoded"&&options.payload){
        url+=(url.includes("?")?"&":"?")+Util.buildParam(options.payload)
        oauthOptions.oauth_signature=this._makeSignature({method:options.method,url,oauthParams:oauthOptions})
        options.payload=url.split("?")[1]
        url=url.split("?")[0]
      }else{
        oauthOptions.oauth_signature=this._makeSignature({method:options.method,url,oauthParams:oauthOptions})
      }
      const authorizationString="OAuth "+Object.keys(oauthOptions).sort().map(key=>
        `${Util.parcentEncode(key)}="${Util.parcentEncode(oauthOptions[key])}"`
      ).join(", ")
      if(!options.headers)options.headers={}
      options.headers.Authorization=authorizationString
      delete options.oauthParameters
      if(options.contentType==="multipart/form-data")
        delete options.contentType
      Utilities.sleep(typeof this.restTime==="function"?Number(this.restTime()):Number(this.restTime))
      let response=UrlFetchApp.fetch(url,options)
      switch(response.getHeaders()["Content-Type"].split(";")[0]){
        case "application/json":return JSON.parse(response);break
        case "text/html":return Util.parseParam(response.getContentText());break
        default:return response
      }
    }
  }
  /**
   * 過去に認証がされたを返します
   * @returns {boolean}
   */
  hasAuthorized(){
    if(this.oauthVersion==="2.0")return !!this.accessToken
    return !!this.oauthToken
  }
  /**
   * ツイートを検索します。
   * https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
   * https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  searchTweets(queryParameters){
    if(this.oauthVersion==="2.0"){
      this.validate(["2.0"],["tweet.read","users.read"])
      let response = this.fetch("https://api.twitter.com/2/tweets/search/recent", {
        queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
      })
      return Util.shapeData(response,v=>new Tweet(v,this))
    }
    const response=this.fetch("https://api.twitter.com/1.1/search/tweets.json",{queryParameters})
    return Util.shapeData(response,v=>new Tweet(v,this),"statuses")
  }
  /**
   * idで指定したツイートを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference
   * @param {string} id 
   * @param {Object} queryParameters 
   * @returns {Tweet}
   */
  getTweetById(id,queryParameters){
    this.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.fetch(`https://api.twitter.com/2/tweets/${id}`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return new Tweet(Util.mergeMeta(response),this)
  }
  /**
   * urlで指定したツイートを取得します
   * @param {string} url 
   * @param {Object} queryParameters 
   * @returns {Tweet}
   */
  getTweetByURL(url,queryParameters){
    return this.getTweetById(url.split("?")[0].split("/")[5],queryParameters)
  }
  /**
   * ツイートを投稿します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
   * @param {Object} payload 
   * @returns {ClientTweet}
   */
  postTweet(payload){
    this.validate(["1.0a","2.0"],["tweet.read","tweet.write","users.read"])
    const option = {
      contentType:"application/json",
      method: "POST",
      payload: JSON.stringify(payload)
    }
    let response = this.fetch("https://api.twitter.com/2/tweets", option)
    return new ClientTweet(response.data, this)
  }
  
  
  /**
   * idからリストを取得します
   * https://developer.twitter.com/en/docs/twitter-api/lists/list-tweets/api-reference/get-lists-id-tweets
   * @param {string} id 
   * @param {Object} queryParameters 
   * @returns {List}
   */
  getListById(id,queryParameters){
    this.validate(["1.0a","2.0"],["tweet.read","users.read","list.read"])
    let response=this.fetch(`https://api.twitter.com/2/lists/${id}`,{
      queryParameters
    })
    return new List(response.data,this)
  }
  /**
   * ユーザーを検索します
   * https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-users-search
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  searchUsers(queryParameters){
    this.validate(["1.0a"])
    let response=this.fetch("https://api.twitter.com/1.1/users/search.json",{queryParameters})
    return response.map(v=>new User(v,this))
  }

  /**
   * ユーザーネームからユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
   * @param {string} username 
   * @param {Object} queryParameters 
   * @returns {User}
   */
  getUserByUsername(username,queryParameters){
    this.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.fetch(`https://api.twitter.com/2/users/by/username/${username}`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return new User(Util.mergeMeta(response),this)
  }

  /**
   * 自分自身のユーザーを取得します。
   * https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-me
   * @param {Object} queryParameters
   * @returns {ClientUser}
   */
  getMyUser(queryParameters){
    this.validate(["1.0a","2.0"],["tweet.read","users.read"])
    let response=this.fetch(`https://api.twitter.com/2/users/me`,{queryParameters})
    return new ClientUser(Util.mergeMeta(response),this)
  }

  /**
   * 5MB未満のメディアをアップロードします
   * https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload
   * @param {Blob} blob 
   * @returns {Object}
   */
  uploadMedia(blob){
    this.validate(["1.0a"])
    
    const data = Utilities.newBlob(
      blob.getBytes(),
      blob.getContentType(),
      blob.getName()
    )
    
    return this.fetch("https://upload.twitter.com/1.1/media/upload.json",{
      method:"post",
      contentType:"multipart/form-data",
      payload:{
        media:data,
      },
      muteHttpExceptions:true
    })
  }
  /**
   * 5MB以上のメディアをアップロードします
   * https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload-init
   * @param {Blob} blob 
   * @returns {Object}
   */
  uploadBigMedia(blob){
    this.validate(["1.0a"])
    const url="https://upload.twitter.com/1.1/media/upload.json"
    const name=blob.getName()
    const mimeType=blob.getContentType()
    const {media_id_string}=this.fetch(url,{
      method:"POST",
      contentType:"application/x-www-form-urlencoded",
      payload:{
        command:"INIT",
        total_bytes:blob?.getBytes().length+"",
        media_type:mimeType,
      }
    })

    let mediaData=blob.getBytes()
    let segmentSize=5*1000*1000
    for(let i=0;i<Math.ceil(mediaData.length/segmentSize);i++){
      const blob = Utilities.newBlob(
        mediaData.slice(i*segmentSize,(i+1)*segmentSize),
        mimeType,
        name
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

    return this.fetch(url,{
      method:"POST",
      contentType:"application/x-www-form-urlencoded",
      payload:{
        command:"FINALIZE",
        media_id:media_id_string
      }
    })
  }
  /**
   * 認証済みユーザーを取得します
   * @param {Propeties} property 
   * @returns {string[][]} 0番目は1.0aの認証済みユーザー、1番目は2.0の認証済みユーザーです
   */
  static getAuthorizedUsers(property=PropertiesService.getUserProperties()){
    let data=property.getKeys().filter(v=>v.startsWith("Twittergs_")).map(v=>v.split("_")).map(([_,version,...n])=>({version,n:n.join("_")}))
    return [
      data.filter(v=>v.version==="1.0a").map(v=>v.n).filter(name=>new Client({name,oauthVersion:"1.0a"}).hasAuthorized()),
      data.filter(v=>v.verison==="2.0").map(v=>v.n).filter(name=>new Client({name,oauthVersion:"1.0a"}).hasAuthorized())
    ]
  }
}



class AppOnlyClient{
  constructor(BEARER_TOKEN=PropertiesService.getUserProperties().getProperty("BEARER_TOKEN")){
    if(!BEARER_TOKEN)throw new Error("BEARER_TOKENは必須です")
    this.bearerToken=BEARER_TOKEN
  }
  /**
   * 認証情報を載せてfetchします
   * @param {string} url 
   * @param {Object} options 
   * @returns {Object}
   */
  fetch(url,options){
    options=options||{}
    options.headers=options.headers||{"Authorization":"Bearer "+this.bearerToken}
    if(options.queryParameters){
      url+=(url.includes("?")?"":"?")+Util.buildParam(options.queryParameters)
      delete options.queryParameters
    }
    return JSON.parse(UrlFetchApp.fetch(url,options))
  }
  /**
   * @param {Client} client 
   * @returns {AppOnlyClient}
   */
  setClient(client){
    this.client=client
    return this
  }
  /**
   * ツイートを検索します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
   * @param {Object} queryParameters 
   * @returns {Tweet[]}
   */
  searchTweets(queryParameters){
    let response=this.fetch("https://api.twitter.com/2/tweets/search/recent",{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return Util.shapeData(response,v=>new Tweet(v,this.client))
  }
  /**
   * IDでツイートを取得します
   * https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets-id
   * @param {string} id 
   * @param {Object} queryParameters 
   * @returns {Tweet}
   */
  getTweetById(id,queryParameters){
    let response=this.fetch(`https://api.twitter.com/2/tweets/${id}`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.tweet
    })
    return new Tweet(Util.mergeMeta(response),this.client)
  }

  /**
   * ユーザーネームからユーザーを取得します
   * https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
   * @param {string} username 
   * @param {Object} queryParameters
   * @returns {Tweet}
   */
  getUserByUsername(username,queryParameters){
    let response=this.fetch(`https://api.twitter.com/2/users/by/username/${username}`,{
      queryParameters:queryParameters||TWITTER_API_DATA.defaultQueryParameters.user
    })
    return new Tweet(Util.mergeMeta(response),this.client)
  }
  /**
   * Bearerトークンを取得します
   * @param {string} API_KEY
   * @param {strnig} API_SECRET 
   * @returns 
   */
  static getBearerToken(API_KEY=PropertiesService.getUserProperties().getProperty("API_KEY"),API_SECRET=PropertiesService.getUserProperties().getProperty("API_SECRET")){
    return JSON.parse(UrlFetchApp.fetch("https://api.twitter.com/oauth2/token",{    
      method: "POST",
      headers: {
        "Authorization": "Basic " + Utilities.base64Encode(API_KEY+":"+API_SECRET)
      },
      contentType:"application/x-www-form-urlencoded;charset=UTF-8",
      payload: {
        grant_type: "client_credentials"
      }
    })).access_token
  }
}