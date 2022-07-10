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

//定期実行することを想定して保存済みのツイートIDを保存するためにPropertiesService.getUserProperties()にアクセスします。
function saveRetweetPictures(){
  const driveFolder=DriveApp.getFolderById("f9fdww")
  const client=new Client({
    name:"sample",
    oauthVersion:"1.0a"
  })
  let tweets=client.user.getTimeLine({expansions:["referenced_tweets.id","attachments.media_keys","referenced_tweets.id.author_id"],"media.fields":["url"],max_results:20})
  const {subData:{includes:{media}}}=tweets
  tweets=tweets.filter(twt=>twt.referenced_tweets&&twt.referenced_tweets[0].type==="retweeted"&&twt.attachments)
  const savedPic=(PropertiesService.getUserProperties().getProperty("savedPic")||"").split(" ")
  tweets.reverse().filter(({referenced_tweets})=>!savedPic.includes(referenced_tweets[0].id)).forEach(({text,attachments:{media_keys},referenced_tweets})=>{
    const authorName=text.split(": ")[0].substring(4)
    savedPic.unshift(referenced_tweets[0].id)
    const picUrls=media_keys.map(key=>{
      return media.find(v=>v.media_key===key).url
    })
    picUrls.forEach((url,i)=>{
      if(!url)return
      //:origを付けることでオリジナルサイズの画像を取得できることがある
      const blob=UrlFetchApp.fetch(url+":orig").getBlob()
      //画像が単数:{著者}-{ツイートID}.{拡張子}
      //複数:{著者}-{ツイートID}-{番号}.{拡張子}
      //の名前で保存される
      const blobName=`${authorName}-${referenced_tweets[0].id}${picUrls.length===1?"":"-"+i.toString()}.${blob.getContentType().split("/")[1]}`
      blob.setName(blobName)
      driveFolder.createFile(blob).setDescription(`${text.split(": ")[1]}\n\nhttps://twitter.com/${authorName}/status/${referenced_tweets[0].id}`)
    })
  })
  PropertiesService.getUserProperties().setProperty("savedPic",savedPic.slice(0,30).join(" "))
}