package com.daslab.datahubble.model4swagger;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * @author: JingleZhao
 * @date: 2021/6/17 8:10 下午
 * @version: 1.0
 */
@ApiModel
public class columnrec {
    @ApiModelProperty(value = "数据库名", required = true, example = "bigbench_100g")
    private String dbname;
    @ApiModelProperty(value = "表名", required = true, example = "websales_home_myshop_10000")
    private String tablename;
    @ApiModelProperty(value = "列名", required = true, example = "price")
    private String columnname;

    public columnrec(){}
    public columnrec(String dbname, String tablename, String columnname) {
        this.dbname = dbname;
        this.tablename = tablename;
        this.columnname = columnname;
    }

    public String getDbname() {
        return dbname;
    }
    public String getTablename() {
        return tablename;
    }
    public String getColumnname() {
        return columnname;
    }
    public void setColumnname(String columnname) {
        this.columnname = columnname;
    }
    public void setTablename(String tablename) {
        this.tablename = tablename;
    }
    public void setDbname(String dbname) {
        this.dbname = dbname;
    }

    @Override
    public String toString() {
        return "columnrec{" +
                "dbname='" + dbname + '\'' +
                ", tablename='" + tablename + '\'' +
                ", columnname='" + columnname + '\'' +
                '}';
    }
}
