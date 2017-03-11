require(['jquery', 'jsonEdit'], function($) {
  var edit;

  var defaultData = [{
    "title": "_subtitle_",
    "doclist": [{
      "title": "_doctitle_",
      "doc": "/agg/doc?agg=_aggid_&doc=_docid_"
    }]
  }];

  function bindEvents() {
    $('#form').on('submit', function(evt) {
      evt.preventDefault();

      var data = getData();

      validate(data, {
        success: function(result) {

          $.post('/agg/aj_edit_agg', result, function(res) {
            if (res.code == "0") {
              window.location.href = '/agg/doc?agg=' + result.id;
            } else {
              alert(res.message)
            }
          }, "JSON")
        },
        failed: function(result, errmsg) {
          alert(errmsg)
        }
      })
    });
  }

  function setDefault() {
    var curDefaultData = CONSTANT.list || defaultData;

    var $aggList = $('#list');

    $aggList.html(JSON.stringify(curDefaultData));

    edit = $aggList.jsonEdit({
      debug: true,
      height: 'auto',
      buttonSelector: '#submit',
      errorAlert: true
    });

    // 如果编辑区聚焦，自动把list字段中的_aggid_替换为当前ID
    edit.$edit.on('focus', function() {
      var id = $('#id').val();
      var listText = edit.getValue().replace('_aggid_', id);

      edit.setValue(listText);
    });
  }

  function getData() {
    var formData = $('#form').serializeArray(),
      result = {};

    for (var i = 0; i < formData.length; i++) {
      result[formData[i].name] = formData[i].value;
    }

    result.list = JSON.parse(edit.getValue());

    $.extend(result, CONSTANT.data);

    return result;
  }

  function validate(data, field, callbacks) {
    if (arguments && arguments.length && arguments.length == 2) {
      callbacks = field;
      field = null;
    }

    field = field || ['id', 'title', 'team', 'list'];

    callbacks = callbacks || {};
    callbacks.success = callbacks.success || function() {};
    callbacks.failed = callbacks.failed || function() {};

    var validateFun,
      validateResult,
      validateFuns = {
        id: function(value) {
          var err = { code: 0, value: value };

          if (!(value && value != '' && /^[a-zA-Z\d\_\-]+$/.test(value))) {
            err.code = 1;
            err.msg = '请输入id,且为字符串类型，且只能是英文，数字，下划线，中划线'
          }
          return err;
        },
        title: function(value) {
          var err = { code: 0, value: value };
          if (!(value && value != '')) {
            err.code = 1;
            err.msg = '请输入标题'
          }
          return err;
        },
        team: function(value) {
          var err = { code: 0, value: value };
          if (!(value && value != '')) {
            err.code = 1;
            err.msg = '请选择分类'
          }
          return err;
        },
        list: function(value) {
          var err = { code: 0, value: value };
          //var a =value[0].doclist.length;

          if (typeof value != 'object' || value.length < 1 || !value[0].title || !value[0].doclist || value[0].doclist.length < 1) {
            err.code = 1;
            err.msg = '请输入list,且至少有一篇文档配置';
            return err;
          }

          for (var i = 0; i < value.length; i++) {

            for (var a = 0; a < value[i].doclist.length; a++) {

              var docItem = value[i].doclist[a];

              // 
              if (!docItem.doc) {
                err.code = 1;
                err.msg = docItem.title + '文档链接不能为空！';
                return err;
              }

              // 
              if (docItem.doc.indexOf('http') == 0) {
                continue;
              }

              // 
              var docQuery = getQuery(docItem.doc);
              if (!/^[a-zA-Z\d\_\-\.]+$/.test(docQuery)) {
                err.code = 1;
                err.msg = docItem.title + '文档的链接只能是英文/数字/下划线/中划线/点';
                return err;
              }

            }

          }

          err.value = JSON.stringify(value);

          return err;

          function getQuery(url) {
            var docItemArr = url.split('?');
            var docItemQueryArr = docItemArr[1] && docItemArr[1].split('&') || [];
            for (var i = 0; i < docItemQueryArr.length; i++) {
              if (docItemQueryArr[i].indexOf('doc') == 0) {
                var docItemQueryArrSplit = docItemQueryArr[i].split('=');

                return docItemQueryArrSplit[1];
              }
            }
          }
        }

      }

    for (var i = 0; i < field.length; i++) {
      validateFun = validateFuns[field[i]];
      validateResult = validateFun(data[field[i]]);
      if (validateResult.code != 0) {
        callbacks.failed(data, validateResult.msg)
        return;
      } else {
        data[field[i]] = validateResult.value;
      }
    }

    callbacks.success(data);
  }

  function init() {
    bindEvents();
    setDefault();
  }
  init();
});
