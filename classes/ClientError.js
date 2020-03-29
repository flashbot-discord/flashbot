class ClientError extends Error {
  constructor(msg) {
    super(msg)
    //this.from = from
    
    // TODO Error report system
  }
}

module.exports = ClientError
