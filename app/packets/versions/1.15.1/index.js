const path = require("path");

const callbacksPath = path.join(__dirname, "callbacks");

function getCallbacks(obj, type) {
  require("fs")
    .readdirSync(path.join(callbacksPath, type))
    .forEach(function(file) {
      if(file !== "index.js")
      obj[file.substr(0, file.length - 3)] = require("./callbacks/" + type + "/" + file);
    });
}

const none = {};
const logn = {};
const stat = {};
const play = {};

getCallbacks(none, "none");
getCallbacks(logn, "login");
getCallbacks(stat, "status");
getCallbacks(play, "play");

module.exports = {
  types: [],
  outboundPackets: require("./outboundPackets"),
  inboundPackets: require("./inboundPackets"),
  callbacks: { none, stat, logn, play }
}