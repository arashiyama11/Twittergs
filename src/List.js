class List{
  constructor(d,client){
    if(typeof d==="string")this.id=d
    else Object.assign(this,d)
    this.__proto__.client=client
  }
  validate(){
    if(!this.client)throw new Error("clientがありません")
    if(!this.id)throw new Error("idがありません")
  }
  /**
   * リストがフォローしているユーザーを返します
   * https://developer.twitter.com/en/docs/twitter-api/lists/list-follows/api-reference/get-users-id-followed_lists
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getFollowed(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","list.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/lists/${this.id}/followers`,{
      queryParameters
    })
    return Util.shapeData(response,v=>new User(v,this.client))
  }
  /**
   * リストのメンバーを取得します。
   * https://developer.twitter.com/en/docs/twitter-api/lists/list-members/api-reference/get-lists-id-members
   * @param {Object} queryParameters 
   * @returns {User[]}
   */
  getMembers(queryParameters){
    this.validate()
    this.client.validate(["1.0a","2.0"],["tweet.read","users.read","list.read"])
    let response=this.client.fetch(`https://api.twitter.com/2/lists/${this.id}/members`,{
      queryParameters
    })
    return Util.shapeData(response,new User(v,this.client))
  }
}