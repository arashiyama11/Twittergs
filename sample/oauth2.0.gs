const {API_KEY,API_SEACRET,BEARER_TOKEN,CLIENT_ID,CLIENT_SEACRET}=ScriptProperties.getProperties()


const appOnlyClient=new AppOnlyClient(BEARER_TOKEN)

function getUserId(){
  Logger.log(appOnlyClient.getUserByUsername("prefrontal9").data.id)
}

const v2_client = new Client({
  serviceName: "prefrontal",
  id: "1502849807156932608",
  oauthVersion: "2.0",
  CLIENT_ID: CLIENT_ID,
  CLIENT_SECRET: CLIENT_SEACRET
})


function v2_authorize(){
  Logger.log(v2_client.authorize())
}


function v2_tweet(){
  Logger.log(v2_client.postTweet({text:"hello world"}))
}

function v2_searchTweet(){
  Logger.log(v2_client.getTweets({query:"japan"}))
}

function v2_like(){
  Logger.log(v2_client.getTweetById("1509339652456652808").data.like())
}


//OAuth2.0はTwitterAPIv2.0しか叩けません
function v2_hitMyself(){
  //v2のほとんどのエンドポイントのcontentTypeはapplication/jsonです。
  Logger.log(v2_client.fetch(`https://api.twitter.com/2/users/${client.user.id}/following`,{
    method:"POST",
    payload:JSON.stringify({
      target_user_id:"1406096161249890306"
    }),
    contentType:"application/json"
  }))
  //optionのmethodが空欄だとmethodはGETになります。
  //なので、この場合methodは省略可能です。
  Logger.log(v2_client.fetch(`https://api.twitter.com/2/users/${client.user.id}/followers`,{
    method:"GET"
  }))
}



function refreshToken(){
  Client.refreshAll({serviceNames:["prefrontal"]})
}

















