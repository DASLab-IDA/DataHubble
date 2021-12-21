package com.daslab.datahubble.model4swagger;

import java.util.ArrayList;

public class rangeData {

    private String tableName;
    private String columnName;
    private int type;
    private ArrayList<Integer> data;

    public int getType() {
        return type;
    }

    public String getColumnName() {
        return columnName;
    }

    public String getTableName() {
        return tableName;
    }

    public ArrayList<Integer> getData() {
        return data;
    }
}
