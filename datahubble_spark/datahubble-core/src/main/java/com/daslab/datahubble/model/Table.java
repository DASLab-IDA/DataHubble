package com.daslab.datahubble.model;

/**
 * @author zyz
 * @version 2019-04-23
 */
public class Table {
    private String schema;
    private String table;

    public Table() {
    }

    public Table(String schema, String table) {
        this.schema = schema;
        this.table = table;
    }

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public String toSQL() {
        return String.format("%s.%s", schema, table);
    }
}
