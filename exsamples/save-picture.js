function savePicture(){
  const tweetId="123456"
  const driveFolder=DriveApp.getFolderById("sample")
  const client=new Client({
    name:"sample",
    oauthVersion:"1.0a"
  })

  const tweet=client.getTweetById(tweetId,{expansions:["attachments.media_keys"],"media.fields":["url"]})
  const medias=tweet.subData?.includes?.media
  if(medias===undefined)throw new Error("画像がありません")
  medias.forEach(({url})=>{
    if(!url)return
    const blob=UrlFetchApp.fetch(url+":orig").getBlob()
    const file=driveFolder.createFile(blob)
    Logger.log(file.getUrl())
  })
}

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