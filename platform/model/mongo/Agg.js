'use strict';

// model名称，即表名
exports.model = 'Agg';

// 表结构
exports.schema = [{
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  intro: { type: String },
  type: { type: String },
  team: { type: String, required: true },
  author: { type: String, required: true },
  createTime: { type: Date, 'default': Date.now },
  updateUser: { type: String },
  updateTime: { type: Date, 'default': Date.now },
  list: { type: String, required: true }
}, {
  autoIndex: true,
  versionKey: false
}];

// 静态方法:http://mongoosejs.com/docs/guide.html#statics
exports.statics = {};

// http://mongoosejs.com/docs/guide.html#methods
exports.methods = {
  all: function*(team) {
    let query = team && { team: team };
    return this.model('Agg').find(query);
  },
  getAggById: function*(id) {
    return this.model('Agg').findOne({ id: id });
  },
  recentList: function*(){
    return this.model('Agg').find().sort({updateTime:-1}).limit(10);
  },
  edit: function*(is_new) {
    let id = this.id;

    function getData(data) {
      let result = {};
      for (let item in data) {
        if (data.hasOwnProperty(item) && ['_id', 'createTime'].indexOf(item) < 0) {
          result[item] = data[item];
        }
      }
      return result;
    }

    if (is_new == 1) {
      return this.save();
    } else {
      return this.model('Agg').update({ id: id }, getData(this._doc));
    }
  }
}
