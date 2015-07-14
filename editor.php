<?php

// example implementation of a script able to answer the editor

// not provided here, must provide global $db
require_once "connect.php";
require_once "FIOIEditorAjax.php";

FIOIEditorAjax::answerAjax($db);
