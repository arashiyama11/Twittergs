function auth(){
  const client=new Client({
    serviceName:"prefrontal",
    id:"1446364436147568641",
    oauthVersion:"1.0a",
    API_KEY:API_KEY,
    API_SEACRET:API_SEACRET
  })
  Logger.log(client.authorize())
}


function test(){
  Logger.log(UrlFetchApp.fetch("youtube.com").getHeaders())
}