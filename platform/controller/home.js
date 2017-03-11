'use strict';

exports.index = function*() {
  yield this.bindDefault();

  let team = this.query.team;
  let curTeam = team || (this.userInfo && this.userInfo.team);

  let AggModel = this.mongo('Agg');
  let DocModel = this.mongo('Doc');

  let mongoResult = yield this.mongoMap([{
    model: AggModel,
    fun: AggModel.all,
    arg: [curTeam]
  }, {
    model: AggModel,
    fun: AggModel.recentList
  }, {
    model: DocModel,
    fun: DocModel.recentList
  }]);


  let aggList = mongoResult[0];
  let recentAggList = mongoResult[1];
  let recentDocList = mongoResult[2];


  function getItem(arr) {
    let result = {};
    arr.forEach((item) => {
      item.type = item.type || '__default__';

      if (!result[item.type]) {
        result[item.type] = [];
      }
      result[item.type].push(item);
    });

    return result;
  }

  yield this.render('home', {
    userInfo: this.userInfo,
    siteInfo: this.siteInfo,
    curTeam: curTeam,
    aggList: aggList,
    _aggList: getItem(aggList),
    recentAggList: recentAggList,
    recentDocList: recentDocList
  })
};
