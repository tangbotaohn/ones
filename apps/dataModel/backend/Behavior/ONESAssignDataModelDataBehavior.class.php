<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/18/14
 * Time: 12:25
 *
 * 用于对某一条数据增加数据模型字段数据
 *
 * eg: orderRows => array(
 *  id: 1, goods: Sth.
 * )
 * => orderRows => array(
    id: 1, goods: Sth, standard: A, color: yellow
 * )
 */

class ONESAssignDataModelDataBehavior extends Behavior {

    /*
     * @param $rows 数据行数组
     * @param $modelIds default: false 数据模型字段ID数组
     * @param $single 是否单条数据
     * **/
    public function run(&$params) {
        list($rows, $modelIds, $single) = $params;

        if($single) {
            $rows = array($rows);
        }

        $dataModel = D("DataModelDataView");
        $rowData = $dataModel->assignModelData($rows, $modelIds);

        if($single) {
            $rowData = $rowData[0];
        }

        $params = array($rowData, null);
    }

} 