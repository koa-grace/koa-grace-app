'use strict';
exports['403'] = function* () {
  let message = this.params.message || '您没有权限！';
  this.body = message;
}
exports['403'].__regular__ = '/:message'


exports['404'] = function* () {
  this.body = '该页面不存在！';
}

exports['test'] = function* () {
  this.body = test;
}