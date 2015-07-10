$.widget("fioi.tester", {
  test: function(fileId, testId) {
    var divRes = $("#tests_results");
    var self = this;
    callAjax(
      translate("testing"),
      function(result) {
        self.element.html(result);
      },
      function(errorTxt) {
        alert(translate("XHRerror") + errorTxt);
        self.element.html(translate("evalError"));
      },
      testId,
      fileId
    );
  }
});
