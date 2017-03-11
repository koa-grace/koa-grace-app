'use strict';

exports.upload = function*() {
  yield this.bindDefault();

  yield this.render('file/upload')
}

exports.aj_upload = function*() {
  // yield this.bindDefault();

  let files = yield this.upload();
  let res = {};

  if (!files || files.length < 1) {
    res.code = 1;
    res.message = '上传文件失败！';
    return this.body = res; 
  }

  res.code = 0;
  res.message = '';
  res.data = {
    files: files
  }

  return this.body = res;
}
exports.aj_upload.__method__ = 'post';

exports.download = function*() {
  yield this.bindDefault();

  let file = this.query.file;

  yield this.download(file);
}
