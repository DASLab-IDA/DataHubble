package com.daslab.datahubble.kylin;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;

import java.sql.*;
import java.util.*;


/**
 * @author qym
 * @date 2021/03/14
 **/
public class KylinExecutor {

    private Connection conn;
    private Connection tpch_conn;
    private Driver driver;
    private Driver tpch_driver;
    private String user = "ADMIN";
    private String pwd = "KYLIN";
    @Value("${smartinteraction.ip}")
    private String IP;

    //后续得找到一个较好的方式，让用户指定kylin连接时指定的project
    private String url = "jdbc:kylin://10.176.24.40:7070/bigbench_10t";
    // private String url;
//    private String url = "jdbc:kylin://10.176.24.40:7070/bigbench_10t";
    // private String url = "jdbc:kylin://10.176.24.40:7070/Flights";
    private String tpch_url = "jdbc:kylin://10.176.24.40:7070/tpch";

    private JSONArray Schema;

    public KylinExecutor(){
        try{
            //conn = driver.connect("jdbc:kylin://10.176.24.40:7070/bigbench_10t", info);
            conn = kylin_connect();
            tpch_conn = kylin_connect_tpch();
            System.out.println("kylin tpch connected!");
            Schema = setSchema();

        }catch (Exception e)
        {
            System.out.println("KylinExecutor() initialization error:");
            e.printStackTrace();
        }
    }



    private Connection kylin_connect() throws Exception{
        driver = (Driver) Class.forName("org.apache.kylin.jdbc.Driver").newInstance();

        Properties info = new Properties();
        info.put("user", user);
        info.put("password", pwd);
        // url = "jdbc:kylin://"+ IP +":7070/bigbench_10t";
        System.out.println("KylinExecutor ======== kylin_connect user:" + user + " password:" + pwd + " url:" + url);

        return driver.connect(url, info);
    }

    private Connection kylin_connect_tpch() throws Exception{
        tpch_driver = (Driver) Class.forName("org.apache.kylin.jdbc.Driver").newInstance();

        Properties info = new Properties();
        info.put("user", user);
        info.put("password", pwd);
        // url = "jdbc:kylin://"+ IP +":7070/tpch";
        System.out.println("KylinExecutor ======== kylin_connect user:" + user + " password:" + pwd + " url:" + url);

        System.out.println("KylinExecutor kylin_connect_tpch success!");

        return tpch_driver.connect(tpch_url, info);
    }

    private void kylin_close() throws Exception{
        this.conn.close();
    }

    public void test(String sql) throws SQLException {
        Statement stmt = conn.createStatement();
        ResultSet resultSet = stmt.executeQuery(sql);
        System.out.println("");
    }
    public JSONArray getSchema(){
        return Schema;
    }

    private JSONArray setSchema() throws SQLException{
        JSONArray Schema = new JSONArray();
        //Statement stmt = conn.createStatement();
        DatabaseMetaData meta = conn.getMetaData();
        ResultSet tables = meta.getTables(null,null,"%",new String[]{"TABLE"});
        tables.next();
        String tableName = tables.getString("TABLE_NAME");
        System.out.println(tableName);
        ResultSet columns = meta.getColumns(null,"%",tableName,"%");
        System.out.println("=================Column Information of Schema=================");
        while(columns.next()){
            String colName = columns.getString("COLUMN_NAME");
            String typeName = columns.getString("TYPE_NAME");
            if(typeName.contains("VARCHAR"))
                typeName = "VARCHAR";
            //System.out.println(colName + ":" + typeName);
            JSONObject columnInfo = new JSONObject();
            columnInfo.put("COLUMN_NAME",colName);
            columnInfo.put("TYPE_NAME",typeName);
            Schema.add(columnInfo);//
        }
        //stmt.close();
        System.out.println("KylingExecutor.setSchema ========== schema:" + Schema.toString());
        return Schema;
    }

    public JSONArray executeSQL1(String sql) throws SQLException {
        long start = System.currentTimeMillis();
        JSONArray jsonArray = new JSONArray();
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery(sql);
        //列信息
        JSONObject colObject = new JSONObject();
        ResultSetMetaData metaData = rs.getMetaData();
        int colCount = metaData.getColumnCount();
        for(int i = 1; i<= colCount;i++){
            if(metaData.getColumnTypeName(i) == "DateType"){
                colObject.put(metaData.getColumnName(i),"TimestampType");
            }else{
                colObject.put(metaData.getColumnName(i),metaData.getColumnTypeName(i));
            }
        }
        jsonArray.add(colObject);
        while(rs.next()){
            JSONObject rowObject = new JSONObject();
            for(int i = 1;i<=colCount;i++){
                if(metaData.getColumnTypeName(i) == "DateType") {
                    rowObject.put(Integer.toString(i), new Timestamp(rs.getDate(i).getTime()));
                }else{
                    rowObject.put(Integer.toString(i), rs.getObject(i));
                }
            }
            jsonArray.add(rowObject);
        }

        rs.close();
        stmt.close();
        return jsonArray;
    }

    public JSONArray executeSQL(String sql) throws SQLException {
        long start = System.currentTimeMillis();
        JSONArray jsonArray = new JSONArray();
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery(sql);
        ResultSetMetaData metaData = rs.getMetaData();
        int colCount = metaData.getColumnCount();

        while(rs.next()){
            JSONObject rowObject = new JSONObject();
            for(int i = 1;i<=colCount;i++){
                rowObject.put(Integer.toString(i), rs.getObject(i));
            }
            jsonArray.add(rowObject);
        }

        rs.close();
        stmt.close();

        return jsonArray;
    }


    /*
    public JSONArray executeSQLForTypes(String sql) throws SQLException {
        long start = System.currentTimeMillis();
        JSONArray jsonArray = new JSONArray();
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery(sql);
        ResultSetMetaData metaData = rs.getMetaData();
        for(int i = 1;i<metaData.getColumnCount();i++){
            if(metaData.getColumnName(i).startsWith("verdictdb"))
                continue;
            if(metaData.getColumnTypeName(i) == "DateType"){
                jsonArray.add("TimestampType");
            }else{
                jsonArray.add(metaData.getColumnTypeName(i));
            }
        }

        rs.close();
        stmt.close();

        return jsonArray;
    }*/


    public LinkedHashMap<String, LinkedHashSet<String>> executeSQLForRanges(String sql){
        long start = System.currentTimeMillis();
        LinkedHashMap<String, LinkedHashSet<String>> ranges = new LinkedHashMap<String, LinkedHashSet<String>>();

        try{
            Statement stmt = conn.createStatement();
            // 重写sql
            String[] sqlSegment = sql.split("\\*");

            for(int i = 0;i<Schema.size();i++){

                String colName = Schema.getJSONObject(i).getString("COLUMN_NAME");
                //colName: ITEMNAME 有问题！！！！！！！！

                System.out.println("KylinServiceImpl.executesqlForRanges ============= colName: " + colName);
                if(colName.equals("PRICE") || colName.equals("QUANTITY") || colName.equals("DISCOUNT") ||colName.equals("AGE"))
                    continue;

                String newSQL = sqlSegment[0];
                System.out.println("KylinServiceImpl.executesqlForRanges ============= sqlSegment[0]: " + sqlSegment[0]);
                // sqlSegment[0]: SELECT
                switch (Schema.getJSONObject(i).getString("TYPE_NAME")){
                    case "INTEGER":
                    case "DOUBLE":
                    case "LONG":
                    case "DECIMAL":
                    case "REAL":
                    case "TIMESTAMP":
                    case "TIMESTAMP(0)":
                    case "DATE":
                        newSQL += "min(" + Schema.getJSONObject(i).getString("COLUMN_NAME")
                                + "),max("+Schema.getJSONObject(i).getString("COLUMN_NAME") +")";
                        break;
                    case "VARCHAR":
                        newSQL += "DISTINCT " + Schema.getJSONObject(i).getString("COLUMN_NAME");
                        break;
                    default:
                        System.out.println("KylinExecutor executeSQLForRanges =========== not support this type "
                                + Schema.getJSONObject(i).getString("TYPE_NAME"));
                        break;
                }
                newSQL += sqlSegment[1];
                System.out.println("KylinServiceImpl.executesqlForRanges ============= sqlSegment[1]: " + sqlSegment[1]);
                //sqlSegment[1]:  FROM flights_5m.flights
                System.out.println("KylinServiceImpl.executesqlForRanges ============= newSQL: " + newSQL);
                //newSQL: SELECT DISTINCT ITEMNAME FROM flights_5m.flights

                ResultSet rs = stmt.executeQuery(newSQL);

                LinkedHashSet<String> range = new LinkedHashSet<String>();
                int count = rs.getMetaData().getColumnCount();
                while(rs.next()){
                    for(int j = 1;j<=count;j++){
                        //System.out.println(rs.getObject(j).toString());
                        range.add(rs.getObject(j).toString());
                    }
                }
                ranges.put(Schema.getJSONObject(i).getString("COLUMN_NAME"),range);
            }

        }catch (SQLException e){
            e.printStackTrace();
        }

        //ResultSetMetaData metaData = rs.getMetaData();
        System.out.println("KylinExecutor executeSQLForRanges ========== time cost: " + (System.currentTimeMillis()-start)/1000 + "s");
        return ranges;
    }

    public LinkedHashMap<String, TreeMap<String, Integer>> executeSQLForDistributions(String sql){
        LinkedHashMap<String, TreeMap<String, Integer>> distributions = new LinkedHashMap<String, TreeMap<String, Integer>>();
        Long start = System.currentTimeMillis();

        try{
            //DatabaseMetaData meta = conn.getMetaData();
            //ResultSet columns = meta.getColumns(null,"%",tableName,"%"); // 替换getColumns
            System.out.println("KylinExecutor executeSQLForDistributions ========== column information:");
            for(int i = 0;i<Schema.size();i++){
                String colName = Schema.getJSONObject(i).getString("COLUMN_NAME");
                if(colName.startsWith("VERDICTDB"))
                    continue;
                if(colName.equals("PRICE") || colName.equals("QUANTITY") || colName.equals("DISCOUNT") ||colName.equals("AGE"))
                    continue;
                String typeName = Schema.getJSONObject(i).getString("TYPE_NAME");
                if(typeName.contains("VARCHAR"))
                    typeName = "VARCHAR";
                System.out.println(colName + ":" + typeName);
                TreeMap<String, Integer> distribution = new TreeMap<String, Integer>();
                if(typeName.equals("VARCHAR"))
                {
                    String Sql = "SELECT "+ colName + " , COUNT(" + colName + ") " + sql + " GROUP BY " + colName + " ORDER BY COUNT(" + colName + ")";
                    Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery(Sql);
                    System.out.println("KylinExecutor executesqlForDistributions sql = " + Sql);
                    while(rs.next()){
                        String value = rs.getString(1);
                        int cnt = rs.getInt(2); // 需要再判断一下kylin返回的类型
                        distribution.put(value, cnt);
                        //System.out.println("KylinExecutor executeSQLForDistributions =========== " + colName + " distribution: " + distribution);
                    }
                }else{
                    String Sql = "SELECT "+ colName + ", COUNT(" + colName + ") " + sql + " GROUP BY " + colName + " ORDER BY " + colName;
                    System.out.println("KylinExecutor executesqlForDistributions sql = " + Sql);
                    Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery(Sql);
                    while(rs.next()){
                        String value = "";
                        switch (typeName){
                            case "INTEGER":
                                value = Integer.toString(rs.getInt(1));
                                break;
                            case "DOUBLE":
                                value = Double.toString(rs.getDouble(1));
                                break;
                            case "LONG":
                                value = Long.toString(rs.getLong(1));
                                break;
                            case "DECIMAL":
                                value = rs.getBigDecimal(1).toString();
                                break;
                            case "FLOAT":
                                value = Float.toString(rs.getFloat(1));
                                break;
                            case "TIMESTAMP":
                                value = rs.getTimestamp(1).toString();
                                break;
                            case "DATE":
                                value = rs.getDate(1).toString();
                                break;
                            default:
                                value = "";
                        }
                        int cnt = rs.getInt(2); // 需要再判断一下kylin返回的类型
                        distribution.put(value, cnt);
                        //System.out.println(distribution.toString());
                    }
                }
                //System.out.println("KylinExecutor executeSQLForDistributions =========== " + colName + " distribution: " + distribution);
                if(colName.equals("PRICE1"))
                {
                    distributions.put("price",distribution);
                }else if(colName.equals("QUANTITY1")){
                    distributions.put("quantity",distribution);
                }else if(colName.equals("AGE1")){
                    distributions.put("age",distribution);
                }else if(colName.equals("DISCOUNT1")){
                    distributions.put("discount",distribution);
                }else{
                    distributions.put(colName.toLowerCase(), distribution);
                }
            }
        }catch (SQLException e){
            e.printStackTrace();
        }

        System.out.println("KylinExecutor executeSQLForDistributions =========== time cost: " + (System.currentTimeMillis()-start)/1000 + "s");
        System.out.println(distributions.toString());
        return distributions;
    }

    public LinkedHashMap<String, TreeMap<String, Integer>> executeSQLForDistribution(String sql, String colname){
        LinkedHashMap<String, TreeMap<String, Integer>> distributions = new LinkedHashMap<String, TreeMap<String, Integer>>();
        Long start = System.currentTimeMillis();

        try{
            //DatabaseMetaData meta = conn.getMetaData();
            //ResultSet columns = meta.getColumns(null,"%",tableName,"%"); // 替换getColumns
            System.out.println("KylinExecutor executeSQLForDistribution ========== column information:");
            for(int i = 0;i<Schema.size();i++){
                String colName = Schema.getJSONObject(i).getString("COLUMN_NAME");
                if(colName.startsWith("VERDICTDB"))
                    continue;
                if(colName.equals("PRICE") || colName.equals("QUANTITY") || colName.equals("DISCOUNT") ||colName.equals("AGE"))
                    continue;
                if(colName.equals(colname.toUpperCase())){
                    String typeName = Schema.getJSONObject(i).getString("TYPE_NAME");
                    if(typeName.contains("VARCHAR"))
                        typeName = "VARCHAR";
                    System.out.println(colName + ":" + typeName);
                    TreeMap<String, Integer> distribution = new TreeMap<String, Integer>();
                    if(typeName.equals("VARCHAR"))
                    {
                        String Sql = "SELECT "+ colName + " , COUNT(" + colName + ") " + sql + " GROUP BY " + colName + " ORDER BY COUNT(" + colName + ")";
                        Statement stmt = conn.createStatement();
                        ResultSet rs = stmt.executeQuery(Sql);
                        System.out.println("KylinExecutor executesqlForDistribution sql = " + Sql);
                        while(rs.next()){
                            String value = rs.getString(1);
                            int cnt = rs.getInt(2); // 需要再判断一下kylin返回的类型
                            distribution.put(value, cnt);
                            //System.out.println("KylinExecutor executeSQLForDistributions =========== " + colName + " distribution: " + distribution);
                        }
                    }else{
                        String Sql = "SELECT "+ colName + ", COUNT(" + colName + ") " + sql + " GROUP BY " + colName + " ORDER BY " + colName;
                        System.out.println("KylinExecutor executesqlForDistribution sql = " + Sql);
                        Statement stmt = conn.createStatement();
                        ResultSet rs = stmt.executeQuery(Sql);
                        while(rs.next()){
                            String value = "";
                            switch (typeName){
                                case "INTEGER":
                                    value = Integer.toString(rs.getInt(1));
                                    break;
                                case "DOUBLE":
                                    value = Double.toString(rs.getDouble(1));
                                    break;
                                case "LONG":
                                    value = Long.toString(rs.getLong(1));
                                    break;
                                case "DECIMAL":
                                    value = rs.getBigDecimal(1).toString();
                                    break;
                                case "FLOAT":
                                    value = Float.toString(rs.getFloat(1));
                                    break;
                                case "TIMESTAMP":
                                    value = rs.getTimestamp(1).toString();
                                    break;
                                case "DATE":
                                    value = rs.getDate(1).toString();
                                    break;
                                default:
                                    value = "";
                            }
                            int cnt = rs.getInt(2); // 需要再判断一下kylin返回的类型
                            distribution.put(value, cnt);
                            //System.out.println(distribution.toString());
                        }
                    }
                    //System.out.println("KylinExecutor executeSQLForDistributions =========== " + colName + " distribution: " + distribution);
                    if(colName.equals("PRICE1"))
                    {
                        distributions.put("price",distribution);
                    }else if(colName.equals("QUANTITY1")){
                        distributions.put("quantity",distribution);
                    }else if(colName.equals("AGE1")){
                        distributions.put("age",distribution);
                    }else if(colName.equals("DISCOUNT1")){
                        distributions.put("discount",distribution);
                    }else{
                        distributions.put(colName.toLowerCase(), distribution);
                    }
                }
            }
        }catch (SQLException e){
            e.printStackTrace();
        }

        System.out.println("KylinExecutor executeSQLForDistribution =========== time cost: " + (System.currentTimeMillis()-start)/1000 + "s");
        System.out.println(distributions.toString());
        return distributions;
    }

    public ArrayList<String> executeSQLForTypes(String sql){
        ArrayList<String> types = new ArrayList<String>();
        try{
            //DatabaseMetaData meta = conn.getMetaData();
            //ResultSet columns = meta.getColumns(null,"%",tableName,"%"); // 替换getColumns
            System.out.println("KylinExecutor executeSQLForTypes ========== column information:");
            for(int i = 0;i<Schema.size();i++) {
                String colName = Schema.getJSONObject(i).getString("COLUMN_NAME");
                if (colName.startsWith("VERDICTDB"))
                    continue;
                if(colName.equals("PRICE") || colName.equals("QUANTITY") || colName.equals("DISCOUNT") ||colName.equals("AGE"))
                    continue;
                String typeName = Schema.getJSONObject(i).getString("TYPE_NAME");
                if (typeName.equals("DATE")){
                    types.add("TIMESTAMP");
                }else {
                    types.add(typeName);
                }
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        System.out.println(types.toString());
        return types;
    }

    public ArrayList<String> executeSQLForType(String sql, String colname){
        ArrayList<String> types = new ArrayList<String>();
        try{
            //DatabaseMetaData meta = conn.getMetaData();
            //ResultSet columns = meta.getColumns(null,"%",tableName,"%"); // 替换getColumns
            System.out.println("KylinExecutor executeSQLForType ========== column information:");
            for(int i = 0;i<Schema.size();i++) {
                String colName = Schema.getJSONObject(i).getString("COLUMN_NAME");
                if (colName.startsWith("VERDICTDB"))
                    continue;
                if(colName.equals("PRICE") || colName.equals("QUANTITY") || colName.equals("DISCOUNT") ||colName.equals("AGE"))
                    continue;
                if (colName.equals(colname.toUpperCase())){
                    String typeName = Schema.getJSONObject(i).getString("TYPE_NAME");
                    if (typeName.equals("DATE")){
                        types.add("TIMESTAMP");
                    }else {
                        types.add(typeName);
                    }
                }
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        System.out.println(types.toString());
        return types;
    }

    public JSONObject getSqlResult(String sql) throws Exception {
        long start = System.currentTimeMillis();
        JSONObject result = new JSONObject();
        Statement stmt = tpch_conn.createStatement();
        ResultSet rs = stmt.executeQuery(sql);
        long end = System.currentTimeMillis();

        result.put("time", (end-start));

        ResultSetMetaData metaData = rs.getMetaData();
        int colCount = metaData.getColumnCount();

        JSONArray tableData = new JSONArray();
        JSONArray colNames = new JSONArray();
        for(int i=1; i<=colCount; i++){
            colNames.add(metaData.getColumnName(i));
        }
        tableData.add(colNames);

        while(rs.next()){
            JSONArray rowObject = new JSONArray();
            for(int i = 1;i<=colCount;i++){
                rowObject.add(rs.getObject(i).toString());
            }
            tableData.add(rowObject);
        }

        rs.close();
        stmt.close();

        result.put("tableData", tableData.toString());
        System.out.println("KylinExecutor.getSqlResult ========== time cost:" + (end-start));

        return result;
    }

    protected void finalize() throws Exception {
        kylin_close();
    }
}

