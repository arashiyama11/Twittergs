const {API_KEY,API_SEACRET,BEARER_TOKEN,CLIENT_ID,CLIENT_SEACRET}=ScriptProperties.getProperties()

function authorize(){
  const client=new Client({
    serviceName:"prefrontal",
    id:"1446364436147568641",
    oauthVersion:"2.0"
  })
  Logger.log(client.authorize())
}

function dev(){
  const client=new Client({
    serviceName:"prefrontal9",
    id:"1502849807156932608",
    oauthVersion:"1.0a",
    API_KEY,
    API_SEACRET,
  })
}

function authCallBack(e){
  if(e.parameter?.error==="access_denied")return HtmlService.createHtmlOutput("認証をキャンセルしました")

  let version=""
  if(e.parameter.oauth_verifier)version="1.0a"
  else version="2.0"

  const client=new Client({
    serviceName:e.parameter.serviceName,
    oauthVersion:version
  })
  if(client.isAuthorized(e)){
    return HtmlService.createHtmlOutput("成功<br>"+JSON.stringify(e,null,"  ").replace(/\n/g,"<br>"))
  }else{
    return HtmlService.createHtmlOutput("失敗<br>"+JSON.stringify(e,null,"  ").replace(/\n/g,"<br>"))
  }
}

function refreshToken(){
  Client.refreshAll({serviceNames:["prefrontal"]})
}

















