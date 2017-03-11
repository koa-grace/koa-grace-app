'use strict';

// model名称，即表名
exports.model = 'File';

// 表结构
exports.schema = [{
  // id: { type: String, unique: true, required: true },
  filename: { type: String },
  linkname: { type: String, unique: true, required: true },
  user: { type: String },
  createTime: { type: Date, 'default': Date.now },
  info: { type: String }
}, {
  autoIndex: true,
  versionKey: false
}];

// 静态方法:http://mongoosejs.com/docs/guide.html#statics
exports.statics = {};

// http://mongoosejs.com/docs/guide.html#methods
exports.methods = {
  all: function*() {
    return this.model('File').find();
  },
  add: function*() {

  }
};
