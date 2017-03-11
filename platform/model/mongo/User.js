'use strict';

// model名称，即表名
exports.model = 'User';

// 表结构
exports.schema = [{
  id: {type: String,unique: true,required: true},
  name: {type: String,required: true},
  phone: {type: String},
  isAuthor: {type: Boolean,'default': false},
  isAdmin: {type: Boolean,'default': false},
  nickname: {type: String},
  avatar: {type: String},
  github: {type: String},
  team: {type: String,required: true},
  email: {type: String},
  blog: {type: String}
}, {
  autoIndex: true,
  versionKey: false
}];

// 静态方法:http://mongoosejs.com/docs/guide.html#statics
exports.statics = {}

// http://mongoosejs.com/docs/guide.html#methods
exports.methods = {
  deleteUser : function* (id) {
    let user = yield this.model('User').findOne({id:id});

    if(user){
      yield this.model('User').remove({id:id});
    }

    return user;
  },
  edit: function*(is_new) {
    let id = this.id;

    if (is_new) {
      return this.save();
    }else{
      return this.model('User').update({id: id}, getData(this._doc));
    }

    function getData(data) {
      let result = {};
      for (let item in data) {
        if (data.hasOwnProperty(item) && item !== '_id') {
          result[item] = data[item];
        }
      }
      return result;
    }
    
  },
  getUserById: function*(id) {
    return this.model('User').findOne({
      id: id
    });
  },
  getAuthor: function*() {
    return this.model('User').find({
      isAuthor: true
    });
  },
  list: function*() {
    return this.model('User').find();
  }
}