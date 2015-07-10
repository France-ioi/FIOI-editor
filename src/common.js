// TODO(julienm): Move/delete this code.

var saveRunning;
var timeOutCall;

function translate(word) {
  return word;
}

function getFocusEditor() {
  $("#frame_sourcesTextArea").contents().find("textarea").focus();   
}

function getLanguageForServer(sLangProg) {
  var ext2Lang = {'text/x-csrc':'C','text/x-c++src':'C++','text/x-ocaml':'OCaml','text/x-pascal':'Pascal','text/x-java':'Java','text/x-javascool':'Javascool','text/x-python':'Python','':'','':''};
  return ext2Lang[sLangProg];
}

function getLanguageFromServer(sLangProg) {
  var ext2Lang = {'C':'text/x-csrc','C++':'text/x-c++src','OCaml':'text/x-ocaml','Pascal':'text/x-pascal','Java':'text/x-java','JavaScool':'text/x-javascool','Python':'text/x-python','':'','':''};
  return ext2Lang[sLangProg];
}	

function callAjax(message, callBackOk, callBackFailed, testToEvaluate, sourceToEvaluate, bUnblock) {
  if (message) {
    $.blockUI({ 
      message: '<h1>' + message + '</h1>' 
    });
  }
  setTimeout(function() {
    saveAjax(message, callBackOk, callBackFailed, testToEvaluate, sourceToEvaluate, bUnblock);
  }, 350);
}

function saveAjax(message, callBackOk, callBackFailed, testToEvaluate, sourceToEvaluate, bUnblock) {
  // Auto save detected, let's try later
  if (saveRunning) {
    clearTimeout(timeOutCall);
    timeOutCall = setTimeout(function() {
      saveAjax(message, callBackOk, callBackFailed, testToEvaluate, sourceToEvaluate, bUnblock);
    }, 1000);
  }
  clearTimeout(timeOutCall);

  saveRunning = true;
	   
  // Acumulate data
  var params = {};

  var sources = $('#sourcesEditor').editor('getAllDocuments');
  params['sources'] = {};
  $.each(sources, function(key, value) {
    params['sources'][key] = {
      'sSource' : value.text,
      'sLangProg' : getLanguageForServer(value.syntax)
     };
  });

  var tests = $('#testsEditor').editor('getAllDocuments');
  params['tests'] = {};
  $.each(tests, function(key, value) {
    params['tests'][key] = {
      'sName' : value.title,
      'sInput' : value.text1,
      'sOutput' : value.text2,
      'bSave' : (Object.keys(params['tests']).length >= userData.nbDefaultTests)
     };
  });

  if (testToEvaluate == 'lycee') {
    params['tests']['__lycee__'] = {
      'sName' : 'test',
      'sInput' : $('[name=UniqueTest]').val(),
      'sOutput' : '',
      'bSave' : false
    };
    testToEvaluate = Object.keys(params['tests']).length;
  }

  if (testToEvaluate != undefined) {
    params['sTestToEvaluate'] = testToEvaluate;
    params['sSourceToEvaluate'] = sourceToEvaluate;
  }
		
  params['bBasicEditorMode'] = $("#bIsBasic").val();
  params['idUser'] = idUser;

  var jsonStr = YAHOO.lang.JSON.stringify(params);
  var data = {json: jsonStr};

  setToNotModified();

  $.ajax({
    type:'POST',
    url: "editorAjax.php?sAction=save&sToken=" + sToken + "&sPlatform=" + sPlatform,
    data: data,
    dataType: "json",
    async: (message == ''),
    success: function(result, textStatus, XMLHttpRequest) {
      if (!result) {
        return callBackFailed(translate("invalidAnswer"));
      } else if (result.success) {
        // Mark all files as not modified
        //setToNotModified();
        callBackOk(result.html);
      } else {
        callBackFailed(result.error);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      //setToModified();
      alertAJAXError(XMLHttpRequest, textStatus, errorThrown)
      callBackFailed(translate("invalidAnswer"));  
    },
    complete: function() {
      if (bUnblock == undefined || bUnblock == true) {
        $.unblockUI();
      }
      //planAutoSave();
      saveRunning = false;
    }
  });
}

function getUserData() {
  var userData;
  $.ajax({
    type: 'POST',
    url: 'editorAjax.php?sAction=get&sToken=' + sToken + '&sPlatform=' + sPlatform,
    dataType: "json",
    async: false,
    success: function(result, textStatus, XMLHttpRequest) {
      if (!result || !result.bSuccess) {
        return;
      }
      userData = result.aData;
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.error(textStatus);
      console.error(errorThrown);
    }
  });
  return userData;
}
