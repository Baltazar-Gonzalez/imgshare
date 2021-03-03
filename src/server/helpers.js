const moment = require("moment")
const helper = {}

helper.timeago = timestamp =>{
   return moment(timestamp).startOf("minutes").fromNow()
}

module.exports = helper