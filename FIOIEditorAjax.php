<?php

/*
 * Very simple implementation of EditorAjax class. Inherit from it and implement
 * decodeToken. Requires tables tm_platforms and tm_source_codes.
 *
 * Also requires getPlatformTokenParams($sToken, $sPlatform, $db) in the global scope.
 */

class FIOIEditorAjax {

   public static function getSources($params, $db) {
      $stmt = $db->prepare('select sDate, sParams, sSource, sName, bEditable, bActive from tm_source_codes where idTask = :idTask and idUser = :idUser and idPlatform = :idPlatform and bSubmission = \'0\' order by sName asc;');
      $stmt->execute(array('idTask' => $params['idTaskLocal'], 'idUser' => $params['idUser'], 'idPlatform' => $params['idPlatform']));
      $sources = $stmt->fetchAll();
      return $sources;
   }

   public static function getTests($params, $db) {
      $stmt = $db->prepare('select sGroupType, iRank, sName, sInput, sOutput from tm_tasks_tests where idTask = :idTask and ((idUser = :idUser and idPlatform = :idPlatform and sGroupType = \'User\') or sGroupType = \'Example\')  order by sName asc;');
      $stmt->execute(array('idTask' => $params['idTaskLocal'], 'idUser' => $params['idUser'], 'idPlatform' => $params['idPlatform']));
      $tests = $stmt->fetchAll();
      return $tests;
   }

   public static function boolToSql($bool) {
      if ($bool == 'true') {
         return '1';
      } else {
         return '0';
      }
   }

   public static function saveSources($params, $db) {
      $db->exec('delete from tm_source_codes where idUser = '.$db->quote($params['idUser']).' and idTask = '.$db->quote($params['idTaskLocal']).' and idPlatform = '.$db->quote($params['idPlatform']).' and bSubmission = \'0\';');
      if (!count($_POST['sources']))
         return;
      $query = 'insert into tm_source_codes (idUser, idTask, idPlatform, sName, sSource, sParams, bActive) values';
      $rows = array();
      foreach($_POST['sources'] as $sName => $sourceCode) {
         $rows[] = '('.$db->quote($params['idUser']).', '.$db->quote($params['idTaskLocal']).', '.$db->quote($params['idPlatform']).', '.$db->quote($sName).', '.$db->quote($sourceCode['sSource']).', '.$db->quote($sourceCode['sParams']).', '.self::boolToSql($sourceCode['bActive']).')';
      }
      $query .= implode(', ', $rows);
      error_log($query);
      $db->exec($query);
   }

   public static function saveTests($params, $db) {
      $db->exec('delete from tm_tasks_tests where sGroupType = \'User\' and idUser = '.$db->quote($params['idUser']).' and idTask = '.$db->quote($params['idTaskLocal']).' and idPlatform = '.$db->quote($params['idPlatform']));
      if (!isset($_POST['tests']) || !count($_POST['tests']))
         return;
      $query = 'insert into tm_tasks_tests (idUser, idTask, idPlatform, sName, sGroupType, sInput, sOutput) values';
      $rows = array();
      foreach($_POST['tests'] as $sName => $test) {
         $rows[] = '('.$db->quote($params['idUser']).', '.$db->quote($params['idTaskLocal']).', '.$db->quote($params['idPlatform']).', '.$db->quote($sName).', \'User\', '.$db->quote($test['sInput']).', '.$db->quote($test['sOutput']).')';
      }
      $query .= implode(', ', $rows);
      var_dump($query);
      $db->exec($query);
   }

   public static function answerAjax($db) {
      if (!$_GET['sToken'] || !$_GET['sPlatform']) {
         echo json_encode(array('bSuccess' => false, 'sError' => 'missing sToken or sPlatform'));
         exit;
      }
      $params = getPlatformTokenParams($_GET['sToken'], $_GET['sPlatform'], $db);
      if ($_GET['sAction'] == 'get') {
         $sources = static::getSources($params, $db);
         $tests = static::getTests($params, $db);
         echo json_encode(array('bSuccess' => true, 'sError' => false, 'aData' => array('aSources' => $sources, 'aTests' => $tests)));
         exit;
      }
      if ($_GET['sAction'] == 'save') {
         static::saveSources($params, $db);
         static::saveTests($params, $db);
         echo json_encode(array('bSuccess' => true, 'sError' => false));
         exit;
      }
   }
}
