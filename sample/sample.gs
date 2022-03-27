const {API_KEY,API_SEACRET_KEY,BEARER_TOKEN,CLIENT_ID,CLIENT_SEACRET}=ScriptProperties.getProperties()
function main(){
  const client=new Client({
    serviceName:"json",
    id:"1446364436147568641"
  })
  Logger.log(client.user.getFollowing().data[0].getFollowing())
  //Logger.log(BEARER_TOKEN)
  //let twt=client.getTweetById("1507981135116075013").data
  //let twt=client.postTweet({text:"reply test very thanks"})
  //let rp=twt.reply({text:"this is a reply depth=1"})
  //Logger.log(rp)
  //rp.reply({text:"this depth is 2"})
  //Logger.log(user.getLiking().data.map(v=>v.text))
  /*
  return Logger.log(client.user.getLiking().data.forEach(v=>{
    Logger.log(v.retweet())
    Utilities.sleep(1000)
  }))*/
  //return Logger.log(client.fetch("https://api.twitter.com/2/tweets/1507835086825463808/liking_users"))
  //return Logger.log(client.fetch("https://api.twitter.com/2/tweets/1507922481654292484/liking_users"))
  //return Logger.log(new Tweet("1507654076615753728",client).getQuoteTweets().data[0].like())
  //Logger.log(client.user.fetch({"user.fields":["created_at"]}))
  //Logger.log(client.tokenRefresh())
  //return Logger.log(client.authorize({scopes:["tweet.read","tweet.write","users.read","offline.access","like.read","like.write"]}))
  //return Logger.log(client.authorize())
  //let {data}=client.getTweets({query:"ウマ娘",max_results:10,expansions:["author_id"]});
  
  //Logger.log(data[0].fetch({expansions:["author_id"]}))
  //Logger.log(client.postTweet({text:"今シーズンこそはレート上げようかと思ったけど既に出遅れらしい"}))
}

function dev(){
  
}

function authCallBack(e){
  if(e.parameter?.error==="access_denied")return HtmlService.createHtmlOutput("認証をキャンセルしました")
  const client=new Client({
    serviceName:e.parameter.serviceName
  })
  if(client.isAuthorized(e)){
    return HtmlService.createHtmlOutput("成功<br>"+JSON.stringify(e,null,"  ").replace(/\n/g,"<br>"))
  }else{
    return HtmlService.createHtmlOutput("失敗<br>"+JSON.stringify(e,null,"  ").replace(/\n/g,"<br>"))
  }
}

function refreshToken(){
  Client.refreshAll({serviceNames:["mejiroship","json"]})
}


function doPost(e){
  const ss=SpreadsheetApp.openById("1pJVXK6UAAmMbLsf6HMsuse_34dtRvhGeudT9fQoO_98").getSheetByName("シート1")
  ss.getRange(ss.getLastRow()+1,1).setValue(JSON.stringify(e))
}



















