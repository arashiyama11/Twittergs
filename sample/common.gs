//oauth1.0a 2.0共通の物です。
function authCallBack(e){
  if(e.parameter?.error==="access_denied")return HtmlService.createHtmlOutput("認証をキャンセルしました")

  let version=""
  if(e.parameter.oauth_verifier)version="1.0a"
  else version="2.0"

  const client=new Client({
    serviceName:e.parameter.serviceName,
    oauthVersion:version,
    CLIENT_ID: CLIENT_ID,
    CLIENT_SECRET: CLIENT_SEACRET,
    API_KEY:API_KEY,
    API_SECRET:API_SEACRET
  })

  if(client.isAuthorized(e)){
    return HtmlService.createHtmlOutput("成功")
  }else{
    return HtmlService.createHtmlOutput("失敗")
  }
}