require(['jquery'], function($) {
  var CONSTANT = window.CONSTANT || {};

  function bindEvents() {
    $('#form').on('submit', function(evt){
      evt.preventDefault();

      var data = getData();

      validate(data, {
        success: function(result) {
          $.get('/user/aj_update_password', result, function(res) {
            if (res.code == "0") {
              alert('修改密码成功，请牢记！');
              window.location.href = '/';
            } else {
              alert(res.message)
            }
          }, "JSON")
        },
        failed: function(result, errmsg) {
          alert(errmsg)
        }
      })
    })
  }

  function setDefault() {
  }

  function getData() {
    var formData = $('#form').serializeArray(),
      result = {};

    for (var i = 0; i < formData.length; i++) {
      result[formData[i].name] = formData[i].value;
    }

    $.extend(result, CONSTANT.data);

    return result;
  }

  function validate(data, field, callbacks) {
    if (arguments && arguments.length && arguments.length == 2) {
      callbacks = field;
      field = null;
    }

    field = field || ['oldpwd', 'newpwd', 'repwd'];

    callbacks = callbacks || {};
    callbacks.success = callbacks.success || function() {};
    callbacks.failed = callbacks.failed || function() {};

    var validateFun,
      validateResult,
      validateFuns = {
        oldpwd: function(value) {
          var err = { code: 0, value: value };

          if (!(value && value != '')) {
            err.code = 1;
            err.msg = '请输入您的旧密码！';
          }

          return err;
        },
        newpwd: function(value) {
          var err = { code: 0, value: value };
          if (!(value && value != '')) {
            err.code = 1;
            err.msg = '请输入新密码！';
          }
          return err;
        },
        repwd: function(value) {
          var err = { code: 0, value: value };
          if (!(value && value != '')) {
            err.code = 1;
            err.msg = '请输入确认密码！';
          }else if(data.newpwd != value){
            err.code = 1;
            err.msg = '您输入的确认密码和新密码不一致！';
          }
          return err;
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
