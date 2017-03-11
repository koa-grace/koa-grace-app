'use strict';

// model名称，即表名
exports.model = 'Doc';

// 表结构
exports.schema = [{
  id: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String },
  from: { type: String },
  time: { type: Date, 'default': Date.now },
  updateTime: { type: Date, 'default': Date.now },
  updateUser: { type: String },
  author: { type: String, required: true },
  content: { type: String, required: true },
  htmlContent: { type: String, required: true },
  introContent: { type: String, required: true },
  category: { type: String },
  agg: { type: String, required: true },
  tag: { type: Array }
}, {
  autoIndex: true,
  versionKey: false
}];

// 静态方法:http://mongoosejs.com/docs/guide.html#statics
exports.statics = {};
// http://mongoosejs.com/docs/guide.html#methods
exports.methods = {
  search: function*(keyword) {
    let reg = new RegExp(keyword);
    return this.model('Doc').find({ content: reg });
  },
  list: function*() {
    return this.model('Doc').find();
  },
  recentList: function*() {
    return this.model('Doc').find().sort({ updateTime: -1 }).limit(10);
  },
  edit: function*(is_new) {
    let id = this.id;

    function getData(data) {
      let result = {};
      for (let item in data) {
        if (data.hasOwnProperty(item) && ['_id', 'time'].indexOf(item) < 0) {
          result[item] = data[item];
        }
      }
      return result;
    }

    if (is_new == 1) {
      return this.save();
    } else {
      return this.model('Doc').update({ agg: this.agg, id: id }, getData(this._doc));
    }
  },
  deleteDoc: function*(id, agg) {
    let Doc = yield this.model('Doc').findOne({ id: id, agg: agg });

    if (Doc) {
      yield this.model('Doc').remove({ id: id, agg: agg });
    }

    return Doc;
  },
  getDoc: function*(agg, doc) {
    return this.model('Doc').findOne({ id: doc, agg: agg });
  },
  count: function*(pageNum, pageSize, query) {
    pageNum = pageNum * 1 || 1;
    pageSize = pageSize || 10;
    query = query || {};
    let result = {};

    // 数据量
    result.totalNum = yield this.model('Doc').count(query);
    // 当前多少页
    result.pageNum = pageNum;
    // 一共多少页
    result.totalPage = Math.ceil(result.totalNum / pageSize);
    // 是否有上一页
    result.hasPrePage = (pageNum - 1 > 0);
    // 是否有下一页
    result.hasNexPage = (pageNum + 1 <= result.totalPage);

    return result;
  },
  page: function*(pageNum, pageSize, query) {
    pageNum = pageNum || 1;
    pageSize = pageSize || 10;
    query = query || {};

    return this.model('Doc').find(query).sort({ '_id': -1 }).skip((pageNum - 1) * pageSize).limit(pageSize);
  }
}
