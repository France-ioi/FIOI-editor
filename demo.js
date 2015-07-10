var sToken = '';
var sPlatform = '';
var replace_tab_by_spaces = "3";
var editorLang = "fr";
var bLycees = false;
var bUserTests = false;
startEditor();


$("#linkUpload, #linkEditorOnline").click(function() {
   $("#editorArea, #testsArea, .editor-options,#submitArea").toggle();
   $("#uploadForm").toggle();
   return false; 
});
