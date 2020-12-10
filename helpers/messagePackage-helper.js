class MessagePackageHelper {
  messageContainer = [];
  maxMessageContainer;
  constructor(maxMessageContainer = 10000){
    this.maxMessageContainer = maxMessageContainer;
  }
  add(msg){
    this.messageContainer.push(msg);
    if(this.messageContainer.length === this.maxMessageContainer){
      const messages = this.messageContainer;
      this.messageContainer = [];
      return messages;
    }
    return false;
  }
}

module.exports = {MessagePackageHelper};