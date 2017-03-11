'use strict';

const crypto = require('crypto');
const key = "http://feclub.cn/"; //加密的秘钥

module.exports = function*() {
  let UserModel = this.mongo('User');
  let TeamModel = this.mongo('Team');
  let TypeModel = this.mongo('Type');

  this.siteInfo = {
    path: this.path,
    url: this.request.url,
    href: this.request.href,
    title: '文档平台-http://wiki.com',
    year: new Date().getFullYear()
  }

  let mongoResult = yield this.mongoMap([{
    model: UserModel,
    fun: UserModel.list
  }, {
    model: TeamModel,
    fun: TeamModel.list
  }, {
    model: TypeModel,
    fun: TypeModel.list
  }]);

  this.siteInfo.users = mongoResult[0];
  this.siteInfo.users_item = getItem(this.siteInfo.users);

  this.siteInfo.teams = mongoResult[1];
  this.siteInfo.teams_item = getItem(this.siteInfo.teams);

  this.siteInfo.types = mongoResult[2];
  this.siteInfo.types_item = getItem(this.siteInfo.types);

  let user_id = this.cookies.get('USER_ID');
  let user_info = {};

  if (!user_id) return;

  try {
    user_info = deciphUserId(user_id);
  } catch (err) {
    console.log(err)
  }

  this.userInfo = yield this.mongo('User', {}).getUserById(user_info.user_id);
}

function deciphUserId(user_id) {
  let decipher = crypto.createDecipher('aes-256-cbc', key);
  let dec = decipher.update(user_id, 'hex', 'utf8');
  dec += decipher.final('utf8'); //解密之后的值

  return JSON.parse(dec);
}

function getItem(arr) {
  var result = {};
  arr.forEach(function(item) {
    result[item.id] = item;
  });
  return result;
}

// 设置为非路由
module.exports.__controller__ = false;
