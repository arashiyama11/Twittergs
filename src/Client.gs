class Client{
  constructor({CLIENT_ID,CLIENT_SEACRET,serviceName}={}){
    let property=PropertiesService.getUserProperties().getProperty("_"+serviceName)
    if(property)this._state=property

    this.clientId=CLIENT_ID
    this.clientSeacret=CLIENT_SEACRET
    this.serviceName=serviceName
  }
  authorize({scopes}={}){
    let state=ScriptApp.newStateToken()
      .withMethod("authCallBack")
      .withTimeout(3600)
      .withArgument("serviceName",this.serviceName)
      .createToken();
    this._state=state
    PropertiesService.getUserProperties().setProperty("_"+this.serviceName,state)
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${TwitterAPI.getCallBackURL()}&scope=${scopes.join("%20")}&state=${this._state}&code_challenge=challenge&code_challenge_method=plain`
  }
  isAuthorized(e){
    const {code,state}=e.parameter
    if(state===this._state){
      this._code=code
      return true
    }else{
      return false
    }
  }
}