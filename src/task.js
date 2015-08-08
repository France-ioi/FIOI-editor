var maxNbSources = 20;
var maxNbTests = 30;

var userData;
var dirty;

function save() {
  callAjax(
    translate('Save'),
    function() {
      dirty = false;
    },
    function(errorTxt) { 
      console.error(translate("saveError") + errorTxt);
    }
  );
}

function submit() {
  $("buttonSubmit").qtip("hide");

  var file = $('#sourcesEditor').editor('getCurrentDocument');
  if (file) {
    //platform.askSubmission(file.text, getLanguageForServer(file.syntax), null);
    platform.validate('done');
  } else {
    alert(translate("noSourceSelected"));
  }
  return false;
}

function testAll() {
  var tests = $('#testsEditor').editor('getAllDocuments');
  if (Object.keys(tests).length == 0) {
    alert(translate("noTest"));
    return;
  }

  var file = $('#sourcesEditor').editor('getCurrentDocument');
  if (file) {
    $('#tests_results').tester('test', file.id, 'all');
  } else {
    alert(translate("noSourceSelected"));
  }
}

function test() {
  var file = $('#sourcesEditor').editor('getCurrentDocument');
  var testFile = $('#testsEditor').editor('getCurrentDocument');

  if (file && testFile) {
    var testId = parseInt(testFile.id.replace(/[^0-9]/g, ''));
    $('#tests_results').tester('test', file.id, testId);
  } else if (!file) {
    alert(translate("noSourceSelected"));
  } else if (!testFile) {
    alert(translate("noTestSelected"));
  }
}

function testLycee() {
  var file = $('#sourcesEditor').editor('getCurrentDocument');
  if (file) {
    $('#tests_results').tester('test', file.id, 'lycee');
  } else {
    alert(translate("noSourceSelected"));
  }
}

function initButtons() {
  $("#buttonSave").click(save);
  $("#buttonSubmit").click(submit);
  $("#buttonTestAll").click(testAll);
  $("#buttonTest").click(test);
  $("#buttonTestOne").click(testLycee);

  $("#sourcesEditor #newDoc").click(newSource);
  $("#testsEditor #newDoc, #buttonAddTest").click(newTest);
}

function newSource() {
  var filesList = $('#sourcesEditor').editor('getAllDocuments');

  var newId;
  for (newId = 1; filesList["Code" + newId]; newId++);

  if (newId > maxNbSources) {
    alert(translate("maxNbSources").replace("%d", maxNbSources));
    return;
  }

  $('#sourcesEditor').editor("open",
      "Code" + newId,
      "Code" + newId,
      "",
      getLanguageFromServer($("#selectLanguageSelection").val())
  );
}

function newTest() {
  var filesList = $('#testsEditor').editor('getAllDocuments');

  var newId;
  for (newId = 1; filesList["Test" + newId]; newId++);

  if (newId > maxNbTests) {
    alert(translate("maxNbTests").replace("%d", maxNbTests));
    return;
  }

  $('#testsEditor').editor('openPair',
      "Test" + newId,
      "Test" + newId,
      "in", "",
      "out", ""
  );
}

function selectFirstForComboLanguage() {
  var selectedLang = $("#selectLanguageSelection").val();
  if (!selectedLang) {
    selectedLang = '';
  }
  var sources = $('#sourcesEditor').editor('getAllDocuments');
  for (key in sources) {
    if (selectedLang == getLanguageForServer(sources[key].syntax)) {
      $('#sourcesEditor').editor('show', key);
      return;
    }
  }
  newSource();
}

function updateComboLanguage() { 
  var file = $('#sourcesEditor').editor('getCurrentDocument');
  $("#selectLanguageSelection").val(getLanguageForServer(file.syntax));
}

function handleChange(change) {
  dirty = true;
}

function setToNotModified() {
  dirty = false;
}

function goMode() {
  ($('#bIsBasic').val() == 1) ? goBasicMode() : goExpertMode();
}

function goBasicMode() {
  $("#buttonAddTestDiv").show();
  $("#sourcesEditor #docsTabList").hide();
  $("#sourcesEditor .CodeMirror").addClass('basic');
  $("#testsEditor #newDoc").hide();
  $("#buttonAddTestDiv").show();
}

function goExpertMode() {
  $("#buttonAddTestDiv").hide();    
  $("#sourcesEditor #docsTabList").show();
  $("#sourcesEditor .CodeMirror").removeClass('basic');
  $("#testsEditor #newDoc").show();
  $("#buttonAddTestDiv").hide();
} 

function startEditor() {
  $(window).bind('beforeunload', function() {
    if (dirty) {
      return translate("unsavedChanges");
    }
  });

  userData = getUserData();
  var sourcesEditor = $('#sourcesEditor').editor();
  sourcesEditor.editor('option', 'changeCallback', handleChange);
  sourcesEditor.editor('option', 'saveCallback', save);
  sourcesEditor.editor('option', 'switchCallback', updateComboLanguage);
  var testsEditor = $('#testsEditor').editor();

//  $('#tests_results').tester();
//  $('#eval_results').evaluator();
  
  $("#uploadForm").hide();    
  $("#linkEditorOnline, #submitArea").show();
  $("#selectLanguageSelection").change(function() {
    sourcesEditor.editor('setSyntax', getLanguageFromServer($(this).val()));
  });
  $("#bIsBasic").val(userData.bIsBasic ? 1 : 0);
  $("#bIsBasic").change(goMode);
  goMode();
  if (bLycees) {
    goBasicMode();
    $("#buttonSave").hide();
  }
  if (!bUserTests) {
    $("#testsArea").hide();
  }
  initButtons();
  var idActive = null;
  for(var i= 0; i < userData.aSources.length; i++) {
    var source = userData.aSources[i];
    var params = source.sParams ? JSON.parse(source.sParams) : {};
    sourcesEditor.editor("open", source.sName, source.sName,
        source.sSource, getLanguageFromServer(params.sLangProg));
    if (source.bActive == '1') {
      idActive = source.sName;
    }
  }
  if (idActive) {
    // TODO: doesn't work...
    sourcesEditor.editor("show", idActive);
  }
  selectFirstForComboLanguage();
  for(i= 0; i < userData.aTests.length; i++) {
    var test = userData.aTests[i];
    testsEditor.editor("openPair", test.sName, test.sName,
        "in", test.sInput, "out", test.sOutput);
  }
}
