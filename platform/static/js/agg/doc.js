require(['jquery', 'simplemde', 'highlight', 'webuploader'],
  function($, SimpleMDE, hljs, WebUploader) {
    var simplemde;
    var constant = window.CONSTANT;

    // 是否为编辑状态
    var isEditing = false;

    var init = function() {
      setDefault();
      bindEvents();
    }

    init();

    function setDefault() {
      constant.data.is_new == 1 && renderEditor();
    }

    function bindEvents() {
      $('#form').on('submit', function(evt) {
        evt.preventDefault();

        var data = getData();

        validate(data, {
          success: function(result) {
            $.post('/agg/aj_edit_doc', result, function(res) {
              if (res.code == "0") {
                $('#submitBtn').text('提交成功，正在跳转...');

                isEditing = false;

                setTimeout(function() {
                  window.location.reload();
                }, 1000)
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

      $('#leftBarActive').on('click', function(evt){
        $('.left-bar').toggleClass('left-bar-active')
      })

      $('#docOperaEdit').on('click', function(evt) {
        evt.preventDefault();

        isEditing = true;

        $('#docForm').removeClass('hidden');
        $('#docContent').addClass('hidden');
        $('#docTitle').addClass('hidden');
        $('#docOpera').addClass('edit');

        !simplemde && renderEditor()
      });

      $('#docOperaPlay').on('click', function(evt) {
        // evt.preventDefault();
      });

      $('#formCancel').on('click', function(evt) {
        evt.preventDefault();

        isEditing = false;

        $('#docForm').addClass('hidden');
        $('#docContent').removeClass('hidden');
        $('#docTitle').removeClass('hidden');
        $('#docOpera').removeClass('edit');
      });

      window.onbeforeunload = function(e) {
        // 如果是编辑状态，才做离开提示
        if( isEditing ) {
          return '确认离开此页吗';
        }
      }
    }

    function renderEditor() {
      isEditing = true;
      
      simplemde = window.simplemde = new SimpleMDE({
        element: document.getElementById("editor"),
        autoDownloadFontAwesome: false,
        renderingConfig: {
          codeSyntaxHighlighting: true
        },
        /*      autosave: {
                enabled: true,
                delay: 5000,
                unique_id: constant.agg + '/' + constant.doc
              },*/
        autofocus: true
      });
      simplemde.codemirror.on('update', function() {
        if (simplemde.isFullscreenActive()) {
          $(".btn.btn-primary").addClass("fullScreen");
        } else {
          $(".btn.btn-primary").removeClass("fullScreen");
        }
      });

      renderUpload();
    }

    function renderUpload() {
      var toolbar = simplemde.gui.toolbar;
      var uploadButton = $('<a id="uploader" title="Upload files" tabindex="-1" class="uploader"></a>');
      $(toolbar).find('.fa-picture-o').after(uploadButton);

      var uploader = WebUploader.create({
        auto: true,

        // swf文件路径
        swf: '/platform/static/css/swf/Uploader.swf',

        // 文件接收服务端。
        server: '/file/aj_upload',

        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#uploader',

        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false
      });
      uploader.on('uploadSuccess', function(file, data) {

        if (data.code == 0) {
          var files = data.data.files,
            content = '';

          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileName = (file.type.indexOf('image/') == 0 ? '!' : '') + '[' + file.name + ']';
            var fileUrl = '(/file/download?file=' + encodeURIComponent(file.filename) + ')';
            content += (fileName + fileUrl);
          }

          simplemde.codemirror.replaceSelection(content);
        } else {
          alert('上传失败：' + data.message);
        }
      });

      $('.webuploader-pick').addClass('fa fa-cloud-upload');
    }

    function getData() {
      var formData = $('#form').serializeArray(),
        result = {};

      for (var i = 0; i < formData.length; i++) {
        result[formData[i].name] = formData[i].value;
      }

      result.content = simplemde.value();

      result.htmlContent = simplemde.markdown(result.content);

      result.introContent = getIntroContent(result.htmlContent);

      $.extend(result, CONSTANT.data);

      return result;
    }

    function validate(data, field, callbacks) {
      if (arguments && arguments.length && arguments.length == 2) {
        callbacks = field;
        field = null;
      }

      field = field || ['id', 'title', 'content'];

      callbacks = callbacks || {};
      callbacks.success = callbacks.success || function() {};
      callbacks.failed = callbacks.failed || function() {};

      var validateFun,
        validateResult,
        validateFuns = {
          id: function(value) {
            var err = { code: 0, value: value };

            if (!(value && value != '' && /^[a-zA-Z\d\_\-\.]+$/.test(value))) {
              err.code = 1;
              err.msg = '请输入id,且为字符串类型，且只能是英文，数字，下划线，中划线，点'
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
          content: function(value) {
            var err = { code: 0, value: value };
            if (!(value && value != '')) {
              err.code = 1;
              err.msg = '请输入文档内容'
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
    /**
     * 获取HTML文档简介
     * @param   {String} html 文档html源码
     * @return  {String} 文档简介
     */
    function getIntroContent(html) {
      var htmlContent = $(html),
        result = '';
      for (var i = 0; i < 10; i++) {
        if (!htmlContent[i]) {
          break;
        }
        if (!htmlContent[i].outerHTML) {
          continue;
        }

        result += htmlContent[i].outerHTML;
      }
      return result
    }
  })
