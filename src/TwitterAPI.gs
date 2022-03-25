class TwitterAPI{
  constructor({API_KEY,API_SEACRET_KEY,BEARER_TOKEN}={}){
    if(!API_KEY||!API_SEACRET_KEY)throw new ReferenceError("API_KEYとAPI_SEACRET_KEYは必須です")
    this.apiKey=API_KEY
    this.apiSeacretKey=API_SEACRET_KEY
    if(BEARER_TOKEN)this.bearerToken=BEARER_TOKEN
    else{
      let options={
        method:"POST",
        headers:{
          "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8",
          "Authorization":"Basic "+Utilities.base64Encode(API_KEY+":"+API_SEACRET_KEY)
        },
        payload:{
          grant_type:"client_credentials"
        }
      }
      this.bearerToken=JSON.parse(UrlFetchApp.fetch("https://api.twitter.com/oauth2/token",options)).access_token
    }

    this.Client=Client
  }
  static getCallBackURL(){
    return `https://script.google.com/macros/d/${ScriptApp.getScriptId()}/usercallback`
  }
 
}

function doGet(e){
  HtmlService.createHtmlOutput(JSON.stringify(e))
}

const {API_KEY,API_SEACRET_KEY,BEARER_TOKEN,CLIENT_ID,CLIENT_SEACRET}=ScriptProperties.getProperties()
function main(){
  twitterAPI=new TwitterAPI({
    API_KEY,
    API_SEACRET_KEY,
    BEARER_TOKEN
  })
  const client=new twitterAPI.Client({
    CLIENT_ID,
    CLIENT_SEACRET,
    serviceName:"twitter"
  })

  Logger.log(client.authorize({
    scopes:["tweet.read"]
  }))
  Logger.log(PropertiesService.getUserProperties().getProperty("_twitter"))
  Logger.log(client._state)
  
  Logger.log(new twitterAPI.Client({
    CLIENT_ID,
    CLIENT_SEACRET,
    serviceName:"twitter"
  })._state)
}


function dev(){
  Logger.log()
}

function authCallBack(e){
  const twitterAPI=new TwitterAPI({
    API_KEY,
    API_SEACRET_KEY,
    BEARER_TOKEN
  })
  const client=new twitterAPI.Client({
    CLIENT_ID,
    CLIENT_SEACRET,
    serviceName:e.parameter.serviceName
  })  
  if(client.isAuthorized(e)){
    return HtmlService.createHtmlOutput("認証が成功しました")
  }else{
    return HtmlService.createHtmlOutput("認証が失敗しました")
  }
}






