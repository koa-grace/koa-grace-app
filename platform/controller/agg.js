'use strict';

let userAuthor = require('./userAuthor');

exports.index = function*() {
  yield this.bindDefault();

  yield this.render('agg/index', {
    userInfo: this.userInfo,
    siteInfo: this.siteInfo
  });
};

exports.list = function*() {
  yield this.bindDefault();

  yield this.render('agg/edit', {
    userInfo: this.userInfo,
    siteInfo: this.siteInfo
  });
};

exports.edit = function*() {
  yield this.bindDefault();

  if (!userAuthor.checkAuth(this, this.userInfo, false, false)) {
    return
  }

  let AggModel = this.mongo('Agg');

  let id = this.query.id;

  let aggInfo = yield AggModel.getAggById(id);

  if (aggInfo) {
    var type = aggInfo.type;
  }

  yield this.render('agg/edit', {
    userInfo: this.userInfo,
    siteInfo: this.siteInfo,
    teamInfo: this.teamInfo,
    isNew: !aggInfo,
    docType: type || null,
    curType: (aggInfo ? '编辑' : '新建'),
    aggInfo: aggInfo || {}
  });
};

exports.aj_edit_agg = function*() {
  yield this.bindDefault();

  if (!userAuthor.checkAuth(this, this.userInfo, false, true)) {
    return
  }

  let data = this.request.body;

  let is_new = data.is_new;
  let result = {
    code: 0,
    message: ''
  };

  // 校验数据
  result.message = _validateAggData(data);
  if (result.message) {
    result.code = 2;
    return;
  }

  let agg = yield this.mongo('Agg').getAggById(data.id);

  if (is_new == 1 && agg) {
    result.code = '1';
    result.message = '该聚合页已经存在，请勿重复添加！';

    this.body = result;
    return;
  } else if (is_new == 0 && !agg) {
    is_new = 1;
  }

  let AggModel = this.mongo('Agg', {
    id: data.id,
    title: data.title,
    intro: data.intro,
    team: data.team,
    type: data.type,
    author: (is_new == 1 ? this.userInfo.id : agg.author),
    updateUser: this.userInfo.name,
    list: data.list
  });

  let res = yield AggModel.edit(is_new);

  this.body = result;
};
exports.aj_edit_agg.__method__ = 'post';

exports.slider = function*() {
  yield this.bindDefault();

  let agg = this.query.agg;
  let doc = this.query.doc;

  if (!agg || !doc) {
    return this.body = '缺少字段！'
  }

  let docInfo = yield this.mongo('Doc').getDoc(agg, doc);


  if (!docInfo || !docInfo.content) {
    return this.body = '文档不存在！'
  }

  let content = docInfo.content.split('\n');
  let sliderContent = [],
    sliderConfig = {},
    flag = true;

  content.forEach(function (item) {
    let matched = flag && item.match(/^\>\ ([0-9a-zA-Z_-]+)\ ?[\:：]\ ?([0-9a-zA-Z_-]+)/);
    if (matched) {
      sliderConfig[matched[1]] = matched[2];
    } else {
      flag = false;
      sliderContent.push(item);
    }
  });

  yield this.render('agg/slider', {
    docInfo: docInfo || {},
    sliderContent: sliderContent.join('\n'),
    sliderConfig: sliderConfig,
    userInfo: this.userInfo,
    doc: doc
  });
};

exports.doc = function*() {
  yield this.bindDefault();

  let AggModel = this.mongo('Agg');

  let agg = this.query.agg;
  let doc = this.query.doc;
  let aggInfo = yield AggModel.getAggById(agg);
  let type = aggInfo.type;

  if (!aggInfo || !aggInfo.id) {
    this.redirect('/agg/edit?id=' + decodeURIComponent(agg));
    return;
  }

  try {
    aggInfo.lists = JSON.parse(aggInfo.list);
  } catch (err) {
    this.body = '聚合页list字段不合法';
    return;
  }

  if (!doc) {
    let firstDocLink = aggInfo.lists[0].doclist[0].doc;
    this.redirect(firstDocLink);
    return;
  }

  let docInfo = yield this.mongo('Doc').getDoc(agg, doc);

  yield this.render('agg/doc', {
    userInfo: this.userInfo,
    siteInfo: this.siteInfo,
    teamInfo: this.teamInfo,
    aggInfo: aggInfo || {},
    docInfo: docInfo || {},
    doc: doc,
    isNew: !docInfo
  });
};

exports.aj_edit_doc = function*() {
  yield this.bindDefault();

  if (!userAuthor.checkAuth(this, this.userInfo, false, true)) {
    return
  }


  let data = this.request.body;
  let is_new = data.is_new;
  let result = {
    code: 0,
    message: ''
  };

  // 校验数据
  result.message = _validateDocData(data);
  if (result.message) {
    result.code = 2;
    return;
  }

  let doc = yield this.mongo('Doc').getDoc(data.agg, data.id);

  if (is_new == 1 && doc) {
    result.code = '1';
    result.message = '该文档已经存在，请勿重复添加！';

    this.body = result;
    return;
  } else if (is_new == 0 && !doc) {
    result.code = '3';
    result.message = '该文档已经被删除，无法编辑！';

    this.body = result;
    return;
  } else if (is_new == 0 && data.updateTime != doc.updateTime.getTime()) {
    result.code = '2';
    result.message = '文档已经被编辑过，请保存当前更新，刷新文档后重试！';

    this.body = result;
    return;
  }

  let DocModel = this.mongo('Doc', {
    id: data.id,
    title: data.title,
    image: data.image,
    from: data.from,
    author: (is_new == 1 ? this.userInfo.id : doc.author),
    updateUser: this.userInfo.name,
    content: data.content,
    updateTime: Date.now(),
    htmlContent: data.htmlContent,
    introContent: data.introContent,
    category: data.category,
    agg: data.agg,
    tag: data.tag
  });
  let res = yield DocModel.edit(is_new);

  result.message = '提交成功';
  this.body = result;
};
exports.aj_edit_doc.__method__ = 'post';

exports.search = function*() {
  yield this.bindDefault();
  let startTime = new Date();

  let keyword = this.query.keyword.trim();
  let DocModel = this.mongo('Doc');
  let keyArr = keyword.split(/\s+/g);
  let docAry = yield DocModel.search(keyword);


  yield  function*() {
    docAry.forEach(function (item) {
      let htmlContent = item.htmlContent.toString();
      let reg1 = new RegExp('>(.*(' + keyword + ').*)<');
      let reg2 = /(<\w+.*>)/;
      let reg3 = new RegExp(keyword);

      htmlContent.replace(reg1, function () {

        item.showContent = '<span>' + arguments[1].replace(reg2, '') + '</span>';
        item.showContent = item.showContent.toString().replace(reg3, function () {
          return '<span style="color: red">' + keyword + '</span>'
        })
      });
    })
  };
  let endTime = new Date();
  let spendTime = ((endTime - startTime) / 1000).toFixed(2);


  yield this.render('agg/search', {
    userInfo: this.userInfo,
    siteInfo: this.siteInfo,
    docList: docAry,
    total: docAry.length,
    keyword: keyword,
    spendTime: spendTime,
  });
};

exports.ppt = function*() {
  yield this.bindDefault();
  yield this.render('agg/ppt', {
    userInfo: this.userInfo
  });
}

/**
 * 校验请求参数是否合法
 * @param  {Object} data 请求参数
 * @return {String}      错误信息
 */
function _validateAggData(data) {
  let message;
  let params = [
    ['id', 'String', true, '聚合页id'],
    ['title', 'String', true, '聚合页标题'],
    ['intro', 'String', false, '聚合页介绍'],
    ['team', 'String', true, '聚合页所属分组'],
    ['list', 'String', true, '聚合页导航']
  ];

  for (let i = 0; i < params.length; i++) {
    let item = params[i];
    let key = item[0];

    if (item[2] && !data[key]) {
      message = '缺少参数：' + key + '，该参数为' + item[3];
      break;
    }
  }

  return message;
}

/**
 * 校验请求参数是否合法
 * @param  {Object} data 请求参数
 * @return {String}      错误信息
 */
function _validateDocData(data) {
  let message;
  let params = [
    ['id', 'String', true, '文档id'],
    ['title', 'String', true, '文档标题'],
    ['content', 'String', true, '文档markdown内容'],
    ['htmlContent', 'String', true, '文档html内容']
  ];

  for (let i = 0; i < params.length; i++) {
    let item = params[i];
    let key = item[0];

    if (item[2] && !data[key]) {
      message = '缺少参数：' + key + '，该参数为' + item[3];
      break;
    }
  }

  return message;
}
