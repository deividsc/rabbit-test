const fs = require('fs');

function writeFile(topic, msg){
  const fd = fs.openSync(`./files/${topic}.json`, 'a');
  return fs.writeSync(fd, Buffer.from(msg));
}
module.exports = {writeFile};