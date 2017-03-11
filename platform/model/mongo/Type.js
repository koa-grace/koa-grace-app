'use strict';

// model名称，即表名
exports.model = 'Type';

// 表结构
exports.schema = [{
    id: {type: String,unique: true,required: true},
    name: {type: String,required: true},
}, {
    autoIndex: true,
    versionKey: false
}];

exports.statics = {};

exports.methods = {
    list: function*() {
        return this.model('Type').find();
    }
};