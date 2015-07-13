<?php

if (!$_GET['sToken'] || !$_GET['sPlatform']) {
   echo json_encode(array('bSuccess' => false, 'sError' => 'missing sToken or sPlatform'));
}

require_once "shared/TokenParser.php";
require_once "shared/connect.php";

/*
 * Requires tables tm_platforms and tm_source_codes
 */

function getTokenParams($sToken, $sPlatform) {
   global $db;
   $stmt = $db->prepare('select id, pc_key from tm_platforms where uri = :uri');
   $platform_uri = $_GET['sPlatform'];
   $stmt->execute(array('uri' => $platform_uri));
   $platform = $stmt->fetch();
   if (!$platform) {
      echo json_encode(array('bSuccess' => false, 'sError' => 'cannot find platform '.$platform_uri));
      exit;
   }
   $pc_key = $platform['pc_key'];
   $tokenParser = new TokenParser($pc_key);
   try {
      $params = $tokenParser->decodeToken($_GET['sToken']);
   } catch (Exception $e) {
      echo json_encode(array('bSuccess' => false, 'sError' => $e->getMessage()));
      exit;
   }
   if (!isset($params['idUser']) || !isset($params['idTask'])) {
      echo json_encode(array('bSuccess' => false, 'sError' => 'missing idUser or idTask in token'));
      exit;
   }
   $params['idPlatform'] = $platform['id'];
   return $params;
}

function getSources($params) {
   global $db;
   $stmt = $db->prepare('select sDate, sParams, sSource, sName, bEditable from tm_source_codes where idTask = :idTask and idUser = :idUser and idPlatform = :idPlatform;');
   $stmt->execute(array('idTask' => $params['idTask'], 'idUser' => $params['idUser'], 'idPlatform' => $params['idPlatform']));
   $sources = $stmt->fetchAll();
   return $sources;
}

function getTests($params) {
   global $db;
   $stmt = $db->prepare('select sGroupType, iRank, sName, sInput, sOutput from tm_tasks_tests where idTask = :idTask and ((idUser = :idUser and idPlatform = :idPlatform and sGroupType = \'User\') or sGroupType = \'Example\');');
   $stmt->execute(array('idTask' => $params['idTask'], 'idUser' => $params['idUser'], 'idPlatform' => $params['idPlatform']));
   $tests = $stmt->fetchAll();
   return $tests;
}

function saveSources($params) {
   global $db;
   $db->exec('delete from tm_source_codes where idUser = '.$db->quote($params['idUser']).' and idTask = '.$db->quote($params['idTask']).' and idPlatform = '.$db->quote($params['idPlatform']));
   $query = 'insert into tm_source_codes (idUser, idTask, idPlatform, sName, sSource, sParams) values';
   $rows = array();
   foreach($_POST['sources'] as $sName => $sourceCode) {
      $rows[] = '('.$db->quote($params['idUser']).', '.$db->quote($params['idTask']).', '.$db->quote($params['idPlatform']).', '.$db->quote($sName).', '.$db->quote($sourceCode['sSource']).', '.$db->quote($sourceCode['sParams']).')';
   }
   $query .= implode(', ', $rows);
   $db->exec($query);
}

function saveTests($params) {
   global $db;
   $db->exec('delete from tm_tasks_tests where sGroupType = \'User\' and idUser = '.$db->quote($params['idUser']).' and idTask = '.$db->quote($params['idTask']).' and idPlatform = '.$db->quote($params['idPlatform']));
   $query = 'insert into tm_tasks_tests (idUser, idTask, idPlatform, sName, sGroupType, sInput, sOutput) values';
   $rows = array();
   foreach($_POST['tests'] as $sName => $test) {
      $rows[] = '('.$db->quote($params['idUser']).', '.$db->quote($params['idTask']).', '.$db->quote($params['idPlatform']).', '.$db->quote($sName).', \'User\', '.$db->quote($test['sInput']).', '.$db->quote($test['sOutput']).')';
   }
   $query .= implode(', ', $rows);
   $db->exec($query);
}

$params = getTokenParams($_GET['sToken'], $_GET['sPlatform']);

if ($_GET['sAction'] == 'get') {
   $sources = getSources($params);
   $tests = getTests($params);
   echo json_encode(array('bSuccess' => true, 'sError' => false, 'aData' => array('aSources' => $sources, 'aTests' => $tests)));
   exit;
}

if ($_GET['sAction'] == 'save') {
   saveSources($params);
   saveTests($params);
   echo json_encode(array('bSuccess' => true, 'sError' => false));
   exit;
}

