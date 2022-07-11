//画像を投稿
function tweetWithMedias(){
  const client=new Client({
    name:"sample",
    oauthVersion:"1.0a"
  })
  const driveMediaIds=["12dfa","fadsf"]
  const mediaBlobs=driveMediaIds.map(id=>DriveApp.getFileById(id).getBlob())
  const mediaIds=mediaBlobs.map(blob=>client.uploadMedia(blob).media_id_string)
  client.postTweet({
    media:{
      media_ids:mediaIds
    }
  })
}

function tweetWithMediasAndText(){
  const client=new Client({
    name:"sample",
    oauthVersion:"1.0a"
  })
  const driveMediaIds=["12dfa","fadsf"]
  const mediaBlobs=driveMediaIds.map(id=>DriveApp.getFileById(id).getBlob())
  const mediaIds=mediaBlobs.map(blob=>client.uploadMedia(blob).media_id_string)
  client.postTweet({
    text:"some text",
    media:{
      media_ids:mediaIds
    }
  })
}

//長いツイートを分割してツリーにして投稿
function treeTweet(){
  const client=new Client({
    name:"sample",
    oauthVersion:"1.0a"
  })
  const text="tree tweet\n".repeat(30)
  const tweetTextSize=100
  let i=0
  let tweet
  do{
    const tweetText=text.substring(i*tweetTextSize,(i+1)*tweetTextSize)
    if(tweet===undefined){
      tweet=client.postTweet({text:tweetText})
    }else{
      tweet=tweet.reply({text:tweetText})
    }
    i++
  }while(text[(i+1)*tweetTextSize]!==undefined)
}