'use strict';

const url = require('url');
const querystring = require('querystring');

// 获取全局配置
const config = global.config;
// app_key
const app_key = 'fe-qufenqi';

exports.home = function*() {
  yield this.bindDefault();


  yield this.render('user/home', {
    userInfo: this.userInfo,
    siteInfo: this.siteInfo
  })
};

// 获取头像代理
exports.avatar = function*() {
  let query = this.query;
  try {
    let urlObj = url.parse(query.img);
    yield this.fetch('https://avatars.githubusercontent.com' + urlObj.path);
  } catch (err) {
    this.body = {
      code: '1',
      message: 'img path error',
      data: query
    }
  }
};


exports.login = function*() {
  yield this.bindDefault();

  // 如果已经登录就不用再登录，直接重定向到首页
  if (this.userInfo && this.userInfo.id) {
    this.redirect('/home');
    return;
  }

  let ssologinUrl = config.constant.domain.oauth + "/sso/login";
  let querydata = {
    tarurl : this.query.tarurl,
    app_key : app_key
  };

  this.redirect(ssologinUrl + '?' + querystring.stringify(querydata));
}

exports.logout = function*() {
  this.cookies.set('USER_TOKEN', '', {
    expires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  });
  this.redirect('/home');
}

exports.ssologin = function*() {
  let token = this.query.token;
  let callback = this.query.callback;

  // 发送校验token请求
  let checkTokenUrl = config.constant.domain.oauth + '/sso/checktoken';
  yield this.proxy({
    checkInfo: checkTokenUrl + '?token=' + token
  });

  // 校验token
  let checkInfo = this.backData.checkInfo;
  if (!checkInfo || checkInfo.code != 0) {
    return this.body = checkInfo;
  }

  // 查看数据库中对应的用户，没有则添加到数据库
  let UserModel = this.mongo('User', {
    id: checkInfo.data.account,
    name: checkInfo.data.name,
    email: checkInfo.data.email,
    phone: checkInfo.data.mobile,
    team: checkInfo.data.team || 'fe',
    isAuthor: checkInfo.data.isAuthor,
    isAdmin: checkInfo.data.isAdmin
  });
  // 查找数据库中用户信息
  this.userInfo = yield UserModel.getUserById(checkInfo.data.account);
  // 如果用户不存在则添加用户，否则更新本地数据
  this.userInfo = yield UserModel.edit(!this.userInfo);

  // 设置COOKIE，默认时效为30天
  let ttl = checkInfo.data.ttl * 1000 || 1000 * 60 * 60 * 24 * 30;
  let expiresTime = Date.now() + ttl;
  this.cookies.set('USER_TOKEN', token, {
    expires: new Date(expiresTime)
  });

  // 返回jsonp方案
  this.body =  callback + '("' + app_key + '")';
}

// 修改密码
exports.aj_update_password = function* () {

  yield this.bindDefault();

  let updatepwdUrl = config.constant.domain.oauth + '/api/updatepassword';
  let querydata = {
    user_id : this.userInfo.id,
    app_key : app_key,
    token : this.userInfo.token,
    newpwd : this.query.newpwd,
    oldpwd : this.query.oldpwd
  }

  yield this.proxy({
    updateInfo: updatepwdUrl + '?' + querystring.stringify(querydata)
  });

  let updateInfo = this.backData.updateInfo;
  if(updateInfo.code != 0){
    return this.body = {
      code : updateInfo.code,
      message : updateInfo.message
    }
  }

  this.body = {
    code : 0,
    message : 'update password success!'
  }
}