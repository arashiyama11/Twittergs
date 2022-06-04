class List{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    this.__proto__.client=client
  }
  /**
   * 
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getFollowed(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/lists/${this.id}/followers`,{
      queryParameters
    })
    Logger.log(response)
    return Util.margeMeta(response).map(v=>new User(v,this.client))
  }
  /**
   * 
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getMembers(queryParameters){
    let response=this.client.fetch(`https://api.twitter.com/2/lists/${this.id}/members`,{
      queryParameters
    })
    return Util.margeMeta(response).map(v=>new User(v,this.client))
  }
}