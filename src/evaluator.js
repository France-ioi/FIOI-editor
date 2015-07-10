$.widget("fioi.evaluator", {
  submit: function(fileContents, fileSyntax, noSave) {
    var self = this;
    callAjax(
      translate('submit'),
      function() {
        $("#sSourceContents").val(fileContents);
        if (fileSyntax) {
           $("#sExtension").val(fileSyntax);
        }
        $("#bNoSave").val(noSave ? 1 : 0);

        $.ajax({
          type:'POST',
          url: $("#submitForm").attr('action') + '&sToken=' + sToken + '&sPlatform=' + sPlatform,
          data: $("#submitForm").serialize(),
          dataType: 'json',
          async: false,
          success: function(data, textStatus, XMLHttpRequest) {
            self.element.html(data.content);

            var offset = self.element.offset();
            $("body").scrollTop(offset.top - 100);

            // Evaluation notification (task/scripts/client.js)
            if ($('.evaluation-correction').length > 0) {
              notifyTaskSubmissionStatus(true, data.platformToken);
            } else {
              notifyTaskSubmissionStatus(false, data.platformToken);
            }
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            alertAJAXError(XMLHttpRequest, textStatus, errorThrown)
            alert(translate("XHRerror") + translate("invalidAnswer"));  
          },
          complete: function() {
            $.unblockUI();
            //planAutoSave();
            this.saveRunning = false;
          }
        });               
      },
      function(errorTxt){
        alert(translate("XHRerror") + errorTxt);
      },
      null,
      null,
      false
    );
  }
});
