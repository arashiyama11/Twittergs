function setEnv(){
  PropertiesService.getUserProperties().setProperties({
    CLIENT_ID:"<CLIENT_ID>",
    CLIENT_SECRET:"<CLIENT_SECRET>",
    API_KEY:"<API_KEY>",
    API_SECRET:"<API_SECRET>",
    BEARER_TOKEN:"<BEARER_TOKEN>"
  })
}

function authorize(){
  const client=new Client({
    name:"@auto",
    oauthVersion:"1.0a"
  })
  Logger.log(client.authorize())
}

function getCallBackURL(){
  Logger.log(Util.getCallBackURL())
}

function authCallBack(e){
  const result=Client.fromCallBackEvent({e:e}).isAuthorized(e)
  if(result){
    return HtmlService.createHtmlOutput("成功")
  }else{
    return HtmlService.createHtmlOutput("失敗")
  }
}