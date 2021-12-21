package com.daslab.datahubble.util;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.sql.Types;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

/**
 * @author :xty
 * @date: 2020/11/14
 * @description:
 */
@Component
public class Util {

    @Value("${smartinteraction.database}")
    private String DATABASE;



    public String znencolmap(String zncolname) {
        String encolname = "discount";
        if (zncolname.contains("销售") || zncolname.contains("量")) {
            encolname = "quantity";
        }
        else if (zncolname.contains("支付") || zncolname.contains("金额")) {
            encolname = "price";
        }
        else if (zncolname.contains("天") || zncolname.contains("日") || zncolname.contains("月")) {
            encolname = "solddate";
        }
        return encolname;
    }

    public JSONObject fixjson(JSONObject rawjson) throws ParseException {
        JSONArray data = new JSONArray();
        JSONObject result = new JSONObject();
        JSONArray jsonArray = rawjson.getJSONArray("columnMetas");
        Integer len = jsonArray.size();
        JSONObject schema = new JSONObject();
        ArrayList<String> coltypes = new ArrayList<>();
        for (Integer i=0;i<len;i++) {
            String name = jsonArray.getJSONObject(i).getString("name");
            String columnType = jsonArray.getJSONObject(i).getString("columnTypeName");
            String str1 = "";
            String str2 = "";
            for (Integer j=0;j<name.length();j++) { str1+=(char)(name.charAt(j)+32); }
            name = str1;
            str2+=columnType.charAt(0);
            for (Integer j=1;j<columnType.length();j++) { str2+=(char)(columnType.charAt(j)+32);}
            columnType = str2+"Type";
            if (columnType.equals("BigintType"))
                columnType = "LongType";

            schema.put(name, columnType);
            coltypes.add(columnType);
        }
        data.add(schema);
        jsonArray = rawjson.getJSONArray("results");
        for (Integer i=0;i<jsonArray.size();i++) {
            JSONObject row = new JSONObject();
            JSONArray raw = jsonArray.getJSONArray(i);
            boolean isnull = false;
            for (Integer j=1;j<=raw.size();j++) {
                String col = raw.getString(j-1);
                if (col.equals("null") || isnull) {
                    isnull = true;
                    continue;
                }
                if ((coltypes.get(j-1).equals("IntegerType") || coltypes.get(j-1).equals("LongType"))) {
                    Integer col_int = Integer.parseInt(col);
                    row.put(j.toString(),col_int);
                }
                else if ((coltypes.get(j-1).equals("DoubleType") || coltypes.get(j-1).equals("FloatType") || coltypes.get(j-1).equals("RealType"))) {
                    Double col_double = Double.valueOf(col);
                    row.put(j.toString(),col_double);
                }
                else if (coltypes.get(j-1).equals("TimestampType")) {
                    DateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    Date date = new Date();
                    date = sdf.parse(col);
                    Timestamp col_time = new Timestamp(date.getTime());
                    row.put(j.toString(), col_time);
                }
                else {
                    row.put(j.toString(),col);
                }
            }
            if (!isnull) data.add(row);
        }
        result.put("data",data);
        return result;
    }

    public Date dateadd(Date date, String type) {
        Calendar calendar = new GregorianCalendar();
        calendar.setTime(date);
        if (type.equals("day")) {
            calendar.add(calendar.DATE, 1);
        }
        else if (type.equals("week")) {
            calendar.add(calendar.DATE, 6);
        }
        else if (type.equals("hour")) {
            calendar.add(calendar.HOUR, 1);
        }
        else if (type.equals("month")) {
            calendar.add(calendar.MONTH, 1);
        }
        else if (type.equals("year")) {
            calendar.add(calendar.YEAR, 1);
        }
        else {
            System.out.println("dateadd ========== wrong date add type! "+ type);
        }
        date = calendar.getTime();
        return date;
    }

    // 针对SparkSerivce的类型
    public  Integer MyTypeParser(String type) {
        if (type.equals("IntegerType"))
            return Types.INTEGER;
        else if (type.equals("DecimalType"))
            return Types.DECIMAL;
        else if (type.equals("LongType"))
            return Types.BIGINT;
        else if (type.equals("FloatType"))
            return Types.FLOAT;
        else if (type.equals("DoubleType"))
            return Types.DOUBLE;
        else if (type.equals("RealType"))
            return Types.REAL;
        else if (type.equals("TimestampType"))
            return Types.TIMESTAMP;
        else
            return Types.VARCHAR;
    }

    // 针对SparkSerivce的类型
    public  Integer MyKylinTypeParser(String type) {
        if (type.equals("INTEGER"))
            return Types.INTEGER;
        else if (type.equals("DECIMAL"))
            return Types.DECIMAL;
        else if (type.equals("LONG"))
            return Types.BIGINT;
        else if (type.equals("FLOAT"))
            return Types.FLOAT;
        else if (type.equals("DOUBLE"))
            return Types.DOUBLE;
        else if (type.equals("TIMESTAMP") || type.equals("TIMESTAMP(0)"))
            return Types.TIMESTAMP;
        else
            return Types.VARCHAR;
        //else if (type.equals("RealType"))
        //    return Types.REAL;

    }

    public String buildSql(String rawSql){
        String[] sqlarray = rawSql.split(" ");
        String sql = "";
        for (int i = 0; i < sqlarray.length; i++) {
            if (i > 0 && (sqlarray[i - 1].equals("from") || sqlarray[i - 1].equals("FROM"))) {
                sql += DATABASE+"."+sqlarray[i] + " ";
            } else {
                sql += sqlarray[i] + " ";
            }
        }
        return sql;
    }

    public String buildSql(String dbname, String rawSql){
        String[] sqlarray = rawSql.split(" ");
        String sql = "";
        for (int i = 0; i < sqlarray.length; i++) {
            if (i > 0 && (sqlarray[i - 1].equals("from") || sqlarray[i - 1].equals("FROM"))) {
                sql += dbname+"."+sqlarray[i] + " ";
            } else {
                sql += sqlarray[i] + " ";
            }
        }
        return sql;
    }

    public String parseSqlMapping(String rawSql){
        SqlMapping sqlMapping = new SqlMapping(rawSql);
        System.out.println("Util ========= parseSqlMapping - rawSql:"+rawSql);
        for(int i=0; i<SqlMapping.sms.length; i++) {
            System.out.println("SqlMapping.sms[i]:"+SqlMapping.sms[i].getRawSql());
            if(sqlMapping.compare(SqlMapping.sms[i])) {
                sqlMapping.setNewSql(SqlMapping.sms[i].getNewSql());
                break;
            }
        }

        return sqlMapping.getNewSql();
    }

}
