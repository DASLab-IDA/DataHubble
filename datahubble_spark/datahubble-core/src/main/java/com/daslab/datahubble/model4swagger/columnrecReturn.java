package com.daslab.datahubble.model4swagger;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * @author: JingleZhao
 * @date: 2021/6/18 3:11 下午
 * @version: 1.0
 */
@ApiModel
public class columnrecReturn {
    @ApiModelProperty(value = "列名", example = "quantity")
    private String columnname;
    @ApiModelProperty(value = "推荐列的范围", example = "[32.0,42.0]")
    private String range;

    public columnrecReturn() {
    }

    public columnrecReturn(String columnname, String range) {
        this.columnname = columnname;
        this.range = range;
    }

    public String getColumnname() {
        return columnname;
    }

    public void setColumnname(String columnname) {
        this.columnname = columnname;
    }

    public String getRange() {
        return range;
    }

    public void setRange(String range) {
        this.range = range;
    }

    @Override
    public String toString() {
        return "columnrecReturn{" +
                "columnname='" + columnname + '\'' +
                ", range='" + range + '\'' +
                '}';
    }
}
