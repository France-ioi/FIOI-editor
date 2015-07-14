// TODO(julienm): Move/delete this code.

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

var sToken = getURLParameter('sToken');
var sPlatform = getURLParameter('sPlatform');
var replace_tab_by_spaces = "3";
var editorLang = "fr";
var bLycees = false;
var bUserTests = false;
var ajaxUrl = 'editor.php';

var saveRunning;
var timeOutCall;

function translate(word) {
  return word;
}

function getFocusEditor() {
  $("#frame_sourcesTextArea").contents().find("textarea").focus();   
}

function getLanguageForServer(sLangProg) {
  var ext2Lang = {'text/x-csrc':'C','text/x-c++src':'C++','text/x-ocaml':'OCaml','text/x-pascal':'Pascal','text/x-java':'Java','text/x-javascool':'Javascool','text/x-python':'Python', '':''};
  return ext2Lang[sLangProg ? sLangProg : ''];
}

function getLanguageFromServer(sLangProg) {
  var ext2Lang = {'C':'text/x-csrc','C++':'text/x-c++src','OCaml':'text/x-ocaml','Pascal':'text/x-pascal','Java':'text/x-java','JavaScool':'text/x-javascool','Python':'text/x-python', '':''};
  return ext2Lang[sLangProg ? sLangProg : ''];
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
      'sParams' : JSON.stringify({sLangProg: getLanguageForServer(value.syntax)})
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

  setToNotModified();

  $.ajax({
    type:'POST',
    url: ajaxUrl+"?sAction=save&sToken=" + sToken + "&sPlatform=" + sPlatform,
    data: params,
    dataType: "json",
    async: (message == ''),
    success: function(result, textStatus, XMLHttpRequest) {
      if (!result) {
        return callBackFailed(translate("invalidAnswer"));
      } else if (result.bSuccess) {
        // Mark all files as not modified
        //setToNotModified();
        callBackOk(result.html);
      } else {
        callBackFailed(result.sError);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      //setToModified();
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
    url: ajaxUrl+'?sAction=get&sToken=' + sToken + '&sPlatform=' + sPlatform,
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
