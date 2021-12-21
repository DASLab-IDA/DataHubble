package com.daslab.datahubble.service.impl;

import com.daslab.SparkExecutor;
import com.daslab.datahubble.http.Http;
import com.daslab.datahubble.kylin.KylinExecutor;
import com.daslab.datahubble.service.KylinService;
import com.daslab.datahubble.util.Util;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.wltea.analyzer.core.IKSegmenter;
import org.wltea.analyzer.core.Lexeme;

import java.io.StringReader;
import java.sql.Types;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static java.lang.Math.sqrt;

/**
 * @author :qym
 * @date: 2021/03/14
 * @description:
 */

@Service
public class KylinServiceImpl implements KylinService {

    private SparkExecutor spark = new SparkExecutor();
    private KylinExecutor kylin = new KylinExecutor();
    @Autowired
    private Util util;

    // 全局变量, 如ip, DATABASE等
    @Value("${smartinteraction.ip}")
    private String IP;
    @Value("${smartinteraction.database}")
    private String DATABASE;

    @Override
    public JSONArray executesql(String sql, boolean fromcube) {
        sql = util.buildSql(sql);
        if (fromcube) {
            System.out.printf("POST /hive/executesql =========== sql=%s%n", sql);

            JSONObject sendmess = new JSONObject();
            sendmess.put("sql", sql);
            sendmess.put("project", "bigbench");
            JSONObject jsonObject = new JSONObject();
            JSONArray result = new JSONArray();
            try {
                String rs1 = Http.sendPost("http://"+ IP +":7070/kylin/api/query", sendmess.toString());
                System.out.println(rs1);
                jsonObject = util.fixjson(JSONObject.fromObject(rs1));
                result = jsonObject.getJSONArray("data");
            } catch (Exception e) {
                e.printStackTrace();
            }
            return result;
        }
        else {
            return spark.executeSQL1(sql);
        }
    }

    @Override
    public JSONArray executesqlForSum(String sql, Date startDate, String scale) {
        JSONArray sumArr = new JSONArray();

        sql = util.buildSql(sql);
        //resultset is like: 2020 100 12314
        JSONArray rs = spark.executeSQL(sql);

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(startDate);

        switch (scale){
            case "day":
                SimpleDateFormat sdfDay = new SimpleDateFormat("yyyy-MM-dd");
                for(int i = 0;i < rs.size();i++){
                    JSONObject row = rs.getJSONObject(i);
                    JSONObject oneRow = new JSONObject();
                    JSONArray jsonArr = new JSONArray();

                    int day = row.getInt("1");
                    if(day == calendar.get(Calendar.DAY_OF_MONTH)){
                        jsonArr.add(row.getDouble("2")); //quantity
                        jsonArr.add(row.getDouble("3")); //price*quantity
                    }else {
                        jsonArr.add(0.0);
                        jsonArr.add(0.0);
                    }
                    oneRow.put(sdfDay.format(calendar.getTime()), jsonArr);
                    calendar.add(Calendar.DAY_OF_MONTH, 1);
                    sumArr.add(oneRow);
                }
                break;
            case "hour":
                SimpleDateFormat sdfHour = new SimpleDateFormat("yyyy-MM-dd HH");
                for(int i = 0;i < rs.size();i++){
                    JSONObject row = rs.getJSONObject(i);
                    JSONObject oneRow = new JSONObject();
                    JSONArray jsonArr = new JSONArray();

                    int hour = row.getInt("1");
                    if(hour == calendar.get(Calendar.HOUR_OF_DAY)){
                        jsonArr.add(row.getDouble("2")); //quantity
                        jsonArr.add(row.getDouble("3")); //price*quantity
                    }else {
                        jsonArr.add(0.0);
                        jsonArr.add(0.0);
                    }
                    oneRow.put(sdfHour.format(calendar.getTime()), jsonArr);

                    calendar.add(Calendar.HOUR_OF_DAY, 1);
                    sumArr.add(oneRow);
                }
                break;
            case "week":
                SimpleDateFormat sdfWeek = new SimpleDateFormat("yyyy-MM-dd");
                for(int i = 0;i < rs.size();i++){
                    JSONObject row = rs.getJSONObject(i);
                    JSONObject oneRow = new JSONObject();
                    JSONArray jsonArr = new JSONArray();

                    int weekofyear = row.getInt("1");
                    if(weekofyear == calendar.get(Calendar.WEEK_OF_YEAR)){
                        jsonArr.add(row.getDouble("2")); //quantity
                        jsonArr.add(row.getDouble("3")); //price*quantity
                    }else {
                        jsonArr.add(0.0);
                        jsonArr.add(0.0);
                    }
                    oneRow.put(sdfWeek.format(calendar.getTime()), jsonArr);

                    calendar.add(Calendar.WEEK_OF_YEAR, 1);
                    sumArr.add(oneRow);
                }
                break;
            case "month":
                SimpleDateFormat sdfMonth = new SimpleDateFormat("yyyy-MM");
                for(int i = 0;i < rs.size();i++){
                    JSONObject row = rs.getJSONObject(i);
                    JSONObject oneRow = new JSONObject();
                    JSONArray jsonArr = new JSONArray();

                    int month = row.getInt("1");
                    if((month - 1) == calendar.get(Calendar.MONTH)){
                        jsonArr.add(row.getDouble("2")); //quantity
                        jsonArr.add(row.getDouble("3")); //price*quantity
                    }else {
                        jsonArr.add(0.0);
                        jsonArr.add(0.0);
                    }
                    oneRow.put(sdfMonth.format(calendar.getTime()), jsonArr);

                    calendar.add(Calendar.MONTH, 1);
                    sumArr.add(oneRow);
                }
                break;
            case "year":
                SimpleDateFormat sdfYear = new SimpleDateFormat("yyyy");
                for(int i = 0;i < rs.size();i++){
                    JSONObject row = rs.getJSONObject(i);
                    JSONObject oneRow = new JSONObject();
                    JSONArray jsonArr = new JSONArray();

                    int year = row.getInt("1");
                    if(year == calendar.get(Calendar.YEAR)){
                        jsonArr.add(row.getDouble("2")); //quantity
                        jsonArr.add(row.getDouble("3")); //price*quantity
                    }else {
                        jsonArr.add(0.0);
                        jsonArr.add(0.0);
                    }
                    oneRow.put(sdfYear.format(calendar.getTime()), jsonArr);

                    calendar.add(Calendar.YEAR, 1);
                    sumArr.add(oneRow);
                }
                break;
            default:
                System.out.println("SparkServiceImpl.executesqlForSum ============= wrong scale type! only interval or exact accepted!");
                break;
        }
        return sumArr;
    }

    @Override
    public JSONObject executesqlForRanges(String sql, String[] filter, ArrayList<String> recommendColumns, String tablename) {
        JSONObject returnData = new JSONObject();
        JSONArray recommendData = new JSONArray();
        JSONArray otherRange = new JSONArray();

        sql = util.buildSql(sql);
        // LinkedHashMap<String, LinkedHashSet<String>> ranges = spark.executeSQLForRanges(sql);
        LinkedHashMap<String, LinkedHashSet<String>> ranges = kylin.executeSQLForRanges(sql);
        // ArrayList<String> types = spark.executeSQLForTypes(sql);
        ArrayList<String> types = kylin.executeSQLForTypes(sql);

        Iterator<String> keyIterator = ranges.keySet().iterator();
        Iterator<String> typesIterator = types.iterator();
        while (keyIterator.hasNext()) {
            JSONObject tmp = new JSONObject();
            String column = keyIterator.next();
            String columnType = typesIterator.next();

            int type = util.MyKylinTypeParser(columnType);
            // System.out.println("SparkServiceImpl.executesqlForRanges ============= column: " + column);
            //  System.out.println("SparkServiceImpl.executesqlForRanges ============= type: " + type);
            System.out.println("KylinServiceImpl.executesqlForRanges ============= column: " + column);
            System.out.println("KylinServiceImpl.executesqlForRanges ============= type: " + type);

            LinkedHashSet<String> range = ranges.get(column);
            boolean isRecommended = false;

            tmp.put("columnname", column);
            tmp.put("tablename", tablename);
            tmp.put("type", type);

            Iterator<String> iterator = range.iterator();
            Object min, max;
            switch (type) {
                case Types.BIGINT:
                case Types.INTEGER:
                    // (min, max) e.g. (1, 99)
                    min = iterator.next();
                    max = iterator.next();
                    // System.out.printf("SparkServiceImpl.executesqlForRanges ============= INTEGER (min, max): (%s, %s)%n", min.toString(), max.toString());
                    System.out.printf("KylinServiceImpl.executesqlForRanges ============= INTEGER (min, max): (%s, %s)%n", min.toString(), max.toString());

                    min = Integer.parseInt((String) min);
                    max = Integer.parseInt((String) max);
                    int[] _rangeInt = {(int) min, (int) max};

                    tmp.put("range", _rangeInt);
                    break;
                case Types.DOUBLE:
                case Types.REAL:
                case Types.FLOAT:
                    // (min, max) e.g. (769.0, 5978.0)
                    min = iterator.next();
                    max = iterator.next();
                    // System.out.printf("SparkServiceImpl.executesqlForRanges ============= DOUBLE (min, max): (%s, %s)%n", min.toString(), max.toString());
                    System.out.printf("KylinServiceImpl.executesqlForRanges ============= DOUBLE (min, max): (%s, %s)%n", min.toString(), max.toString());

                    min = Double.parseDouble((String) min);
                    max = Double.parseDouble((String) max);
                    double[] _rangeDouble = {(double) min, (double) max};

                    tmp.put("range", _rangeDouble);
                    break;
                case Types.TIMESTAMP:
                    // SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.S");
                    // (min, max) e.g. (2019-02-15, 2019-11-12)
                    min = iterator.next();
                    max = iterator.next();
                    // System.out.printf("SparkServiceImpl.executesqlForRanges ============= TIMESTAMP (min, max): (%s, %s)%n", min.toString(), max.toString());
                    System.out.printf("KylinServiceImpl.executesqlForRanges ============= TIMESTAMP (min, max): (%s, %s)%n", min.toString(), max.toString());

                    String[] _rangeDate = {((String) min), ((String) max)};

                    tmp.put("range", _rangeDate);
                    break;
                default:
                    TreeSet<String> sortedRange = new TreeSet<>(range);
                    tmp.put("range", sortedRange);
                    break;
            }
            // column为推荐列, 计算推荐范围

            column = column.replace("1","");
            column = column.toLowerCase();

            if (recommendColumns.contains(column)) {
                System.out.println("=========RecommendColumn contain the column:" + column);
                isRecommended = true;
                int idx = recommendColumns.indexOf(column);
                String[] filt = filter[idx].split(", |,");

                Object minn, maxx;
                System.out.println("=========Type:" + type);
                switch (type) {
                    case Types.BIGINT:
                    case Types.INTEGER:
                        minn = Integer.parseInt(filt[0].substring(0, (filt[0].indexOf('.') == -1 ? filt[0].length() : filt[0].indexOf('.'))));
                        maxx = Integer.parseInt(filt[1].substring(0, (filt[1].indexOf('.') == -1 ? filt[1].length() : filt[1].indexOf('.'))));
                        int[] recommInt = {(int) minn, (int) maxx};

                        tmp.put("data", recommInt);
                        break;
                    case Types.DOUBLE:
                    case Types.REAL:
                    case Types.FLOAT:
                        minn = Double.parseDouble(filt[0].substring(0, (filt[0].indexOf('.') == -1 ? filt[0].length() : filt[0].indexOf('.'))));
                        maxx = Double.parseDouble(filt[1].substring(0, (filt[1].indexOf('.') == -1 ? filt[1].length() : filt[1].indexOf('.'))));
                        double[] recommDouble = {(double) minn, (double) maxx};

                        tmp.put("data", recommDouble);
                        break;
                    case Types.TIMESTAMP:
                        // SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.S");
                        minn = filt[0].substring(1, (filt[0].indexOf('.') == -1 ? filt[0].length() - 1 : filt[0].indexOf('.'))) + " 00:00:00.0";
                        maxx = filt[1].substring(1, (filt[1].indexOf('.') == -1 ? filt[1].length() - 1 : filt[1].indexOf('.'))) + " 00:00:00.0";
                        // System.out.printf("SparkServiceImpl.executesqlForRanges ============= TIMESTAMP recommenddata (%s, %s)%n", minn, maxx);
                        System.out.printf("KylinServiceImpl.executesqlForRanges ============= TIMESTAMP recommenddata (%s, %s)%n", minn, maxx);
                        String[] recommDate = {((String) minn), ((String) maxx)};

                        tmp.put("data", recommDate);
                        break;
                    default:
                        TreeSet<String> sortedRange = new TreeSet<>(range);
                        Iterator<String> itr = sortedRange.iterator();
                        ArrayList<String> recommend = new ArrayList<>();
                        int cnt = 0;
                        while (itr.hasNext()) {
                            cnt++;
                            if (cnt <= 9) {
                                recommend.add(itr.next());
                            } else {
                                break;
                            }
                        }
                        // 超过9个categorical类型的数据则剩下的以Others代替
                        if (cnt >= 10) {
                            recommend.add("Others");
                        }
                        tmp.put("data", recommend);
                        break;
                }
            }

            if (isRecommended)
                recommendData.add(tmp);
            else
                otherRange.add(tmp);
        }
        System.out.println("==============RecommendData:" + recommendData.toString());
        System.out.println("==============OtherRange:" + otherRange.toString());

//        JSONArray allRange = new JSONArray();
//        allRange.addAll(recommendData);
//        allRange.addAll(otherRange);
//        recommendData.clear();
//        otherRange.clear();
//        for(int i = 0; i< allRange.size(); i++){
//            JSONObject range = allRange.getJSONObject(i);
//            if (recommendColumns.contains(range.getString("columnname"))){
//                if(!range.containsKey("data")){
//                    range.put("data", range.get("range"));
//                }
//                recommendData.add(range);
//            }else {
//                otherRange.add(range);
//            }
//        }
        for(int i = 0; i < recommendData.size();i++){
            JSONObject range = recommendData.getJSONObject(i);
            String colName_ = range.getString("columnname");
            colName_ = colName_.replace("1","");
            range.put("columnname", colName_.toLowerCase());
            if(!range.containsKey("data")){
                range.put("data", range.get("range"));
            }
        }

        for(int i = 0;i<otherRange.size();i++){
            JSONObject range = otherRange.getJSONObject(i);
            String colName_ = range.getString("columnname");
            colName_ = colName_.replace("1","");
            range.put("columnname", colName_.toLowerCase());
        }

        System.out.println("==============RecommendData:" + recommendData.toString());
        System.out.println("==============OtherRange:" + otherRange.toString());

        returnData.put("recommend", recommendData);
        returnData.put("otherrange", otherRange);

        return returnData;
    }

    //增加指定databaseName参数
    @Override
    public JSONObject executesqlForRanges(String dbname, String sql, String[] filter, ArrayList<String> recommendColumns, String tablename) {
        JSONObject returnData = new JSONObject();
        JSONArray recommendData = new JSONArray();
        JSONArray otherRange = new JSONArray();

        sql = util.buildSql(dbname,sql);
        System.out.println("KylinServiceImpl.executesqlForRanges ============= sql after buildSql: " + sql);//变形后的sql是什么样呢？
        //SELECT DISTINCT ITEMNAME FROM flights_5m.flights之中的ITEMNAME来自哪里呢？

        // LinkedHashMap<String, LinkedHashSet<String>> ranges = spark.executeSQLForRanges(sql);
        LinkedHashMap<String, LinkedHashSet<String>> ranges = kylin.executeSQLForRanges(sql);
        // ArrayList<String> types = spark.executeSQLForTypes(sql);
        ArrayList<String> types = kylin.executeSQLForTypes(sql);

        Iterator<String> keyIterator = ranges.keySet().iterator();
        Iterator<String> typesIterator = types.iterator();
        while (keyIterator.hasNext()) {
            JSONObject tmp = new JSONObject();
            String column = keyIterator.next();
            String columnType = typesIterator.next();

            int type = util.MyKylinTypeParser(columnType);
            // System.out.println("SparkServiceImpl.executesqlForRanges ============= column: " + column);
            //  System.out.println("SparkServiceImpl.executesqlForRanges ============= type: " + type);
            System.out.println("KylinServiceImpl.executesqlForRanges ============= column: " + column);
            System.out.println("KylinServiceImpl.executesqlForRanges ============= type: " + type);

            LinkedHashSet<String> range = ranges.get(column);
            boolean isRecommended = false;

            tmp.put("columnname", column);
            tmp.put("tablename", tablename);
            tmp.put("type", type);

            Iterator<String> iterator = range.iterator();
            Object min, max;
            switch (type) {
                case Types.BIGINT:
                case Types.INTEGER:
                    // (min, max) e.g. (1, 99)
                    min = iterator.next();
                    max = iterator.next();
                    // System.out.printf("SparkServiceImpl.executesqlForRanges ============= INTEGER (min, max): (%s, %s)%n", min.toString(), max.toString());
                    System.out.printf("KylinServiceImpl.executesqlForRanges ============= INTEGER (min, max): (%s, %s)%n", min.toString(), max.toString());

                    min = Integer.parseInt((String) min);
                    max = Integer.parseInt((String) max);
                    int[] _rangeInt = {(int) min, (int) max};

                    tmp.put("range", _rangeInt);
                    break;
                case Types.DOUBLE:
                case Types.REAL:
                case Types.FLOAT:
                    // (min, max) e.g. (769.0, 5978.0)
                    min = iterator.next();
                    max = iterator.next();
                    // System.out.printf("SparkServiceImpl.executesqlForRanges ============= DOUBLE (min, max): (%s, %s)%n", min.toString(), max.toString());
                    System.out.printf("KylinServiceImpl.executesqlForRanges ============= DOUBLE (min, max): (%s, %s)%n", min.toString(), max.toString());

                    min = Double.parseDouble((String) min);
                    max = Double.parseDouble((String) max);
                    double[] _rangeDouble = {(double) min, (double) max};

                    tmp.put("range", _rangeDouble);
                    break;
                case Types.TIMESTAMP:
                    // SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.S");
                    // (min, max) e.g. (2019-02-15, 2019-11-12)
                    min = iterator.next();
                    max = iterator.next();
                    // System.out.printf("SparkServiceImpl.executesqlForRanges ============= TIMESTAMP (min, max): (%s, %s)%n", min.toString(), max.toString());
                    System.out.printf("KylinServiceImpl.executesqlForRanges ============= TIMESTAMP (min, max): (%s, %s)%n", min.toString(), max.toString());

                    String[] _rangeDate = {((String) min), ((String) max)};

                    tmp.put("range", _rangeDate);
                    break;
                default:
                    TreeSet<String> sortedRange = new TreeSet<>(range);
                    tmp.put("range", sortedRange);
                    break;
            }
            // column为推荐列, 计算推荐范围

            column = column.replace("1","");
            column = column.toLowerCase();

            if (recommendColumns.contains(column)) {
                System.out.println("=========RecommendColumn contain the column:" + column);
                isRecommended = true;
                int idx = recommendColumns.indexOf(column);
                String[] filt = filter[idx].split(", |,");

                Object minn, maxx;
                System.out.println("=========Type:" + type);
                switch (type) {
                    case Types.BIGINT:
                    case Types.INTEGER:
                        minn = Integer.parseInt(filt[0].substring(0, (filt[0].indexOf('.') == -1 ? filt[0].length() : filt[0].indexOf('.'))));
                        maxx = Integer.parseInt(filt[1].substring(0, (filt[1].indexOf('.') == -1 ? filt[1].length() : filt[1].indexOf('.'))));
                        int[] recommInt = {(int) minn, (int) maxx};

                        tmp.put("data", recommInt);
                        break;
                    case Types.DOUBLE:
                    case Types.REAL:
                    case Types.FLOAT:
                        minn = Double.parseDouble(filt[0].substring(0, (filt[0].indexOf('.') == -1 ? filt[0].length() : filt[0].indexOf('.'))));
                        maxx = Double.parseDouble(filt[1].substring(0, (filt[1].indexOf('.') == -1 ? filt[1].length() : filt[1].indexOf('.'))));
                        double[] recommDouble = {(double) minn, (double) maxx};

                        tmp.put("data", recommDouble);
                        break;
                    case Types.TIMESTAMP:
                        // SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.S");
                        minn = filt[0].substring(1, (filt[0].indexOf('.') == -1 ? filt[0].length() - 1 : filt[0].indexOf('.'))) + " 00:00:00.0";
                        maxx = filt[1].substring(1, (filt[1].indexOf('.') == -1 ? filt[1].length() - 1 : filt[1].indexOf('.'))) + " 00:00:00.0";
                        // System.out.printf("SparkServiceImpl.executesqlForRanges ============= TIMESTAMP recommenddata (%s, %s)%n", minn, maxx);
                        System.out.printf("KylinServiceImpl.executesqlForRanges ============= TIMESTAMP recommenddata (%s, %s)%n", minn, maxx);
                        String[] recommDate = {((String) minn), ((String) maxx)};

                        tmp.put("data", recommDate);
                        break;
                    default:
                        TreeSet<String> sortedRange = new TreeSet<>(range);
                        Iterator<String> itr = sortedRange.iterator();
                        ArrayList<String> recommend = new ArrayList<>();
                        int cnt = 0;
                        while (itr.hasNext()) {
                            cnt++;
                            if (cnt <= 9) {
                                recommend.add(itr.next());
                            } else {
                                break;
                            }
                        }
                        // 超过9个categorical类型的数据则剩下的以Others代替
                        if (cnt >= 10) {
                            recommend.add("Others");
                        }
                        tmp.put("data", recommend);
                        break;
                }
            }

            if (isRecommended)
                recommendData.add(tmp);
            else
                otherRange.add(tmp);
        }
        System.out.println("==============RecommendData:" + recommendData.toString());
        System.out.println("==============OtherRange:" + otherRange.toString());

//        JSONArray allRange = new JSONArray();
//        allRange.addAll(recommendData);
//        allRange.addAll(otherRange);
//        recommendData.clear();
//        otherRange.clear();
//        for(int i = 0; i< allRange.size(); i++){
//            JSONObject range = allRange.getJSONObject(i);
//            if (recommendColumns.contains(range.getString("columnname"))){
//                if(!range.containsKey("data")){
//                    range.put("data", range.get("range"));
//                }
//                recommendData.add(range);
//            }else {
//                otherRange.add(range);
//            }
//        }
        for(int i = 0; i < recommendData.size();i++){
            JSONObject range = recommendData.getJSONObject(i);
            String colName_ = range.getString("columnname");
            colName_ = colName_.replace("1","");
            range.put("columnname", colName_.toLowerCase());
            if(!range.containsKey("data")){
                range.put("data", range.get("range"));
            }
        }

        for(int i = 0;i<otherRange.size();i++){
            JSONObject range = otherRange.getJSONObject(i);
            String colName_ = range.getString("columnname");
            colName_ = colName_.replace("1","");
            range.put("columnname", colName_.toLowerCase());
        }

        System.out.println("==============RecommendData:" + recommendData.toString());
        System.out.println("==============OtherRange:" + otherRange.toString());

        returnData.put("recommend", recommendData);
        returnData.put("otherrange", otherRange);

        return returnData;
    }


    @Override
    public JSONArray executesqlForDistributions(String sql) {
        JSONArray distArray = new JSONArray();

        long start = System.currentTimeMillis();

        sql = util.buildSql(sql);
        // LinkedHashMap<String, TreeMap<String, Integer>> distributions = spark.executeSQLForDistributions(sql);
        LinkedHashMap<String, TreeMap<String, Integer>> distributions = kylin.executeSQLForDistributions(sql);
        // ArrayList<String> types = spark.executeSQLForTypes(sql);
        ArrayList<String> types = kylin.executeSQLForTypes(sql);
        // System.out.println("SparkServiceImpl.executesqlForDistributions =========== Retrieve distributions which is not binned: " + (System.currentTimeMillis() - start) + "ms");
        System.out.println("KylinServiceImpl.executesqlForDistributions =========== Retrieve distributions which is not binned: " + (System.currentTimeMillis() - start) + "ms");

        // 对聚合后过多的group进行处理, 连续变量分箱, itemdesc字段wordcount
        Iterator<String> keyIterator = distributions.keySet().iterator();
        Iterator<String> typeItr = types.iterator();
        while (keyIterator.hasNext()){
            start = System.currentTimeMillis();
            String columnKey = keyIterator.next();
            TreeMap<String, Integer> distribution = distributions.get(columnKey);
            int type = util.MyKylinTypeParser(typeItr.next());
            // System.out.printf("SparkServiceImpl.executesqlForDistributions ============= (column, type) : (%s, %s)%n", columnKey, type);
            System.out.printf("KylinServiceImpl.executesqlForDistributions ============= (column, type) : (%s, %s)%n", columnKey, type);

            TreeMap<String, Integer> newDistribution = new TreeMap<>();
            Iterator<String> groupItr = distribution.keySet().iterator();
            switch (type){
                case Types.INTEGER:
                case Types.BIGINT:
                    int min = Integer.parseInt(distribution.firstKey());
                    int max = Integer.parseInt(distribution.lastKey());
                    if (max - min >= 40) {
                        int buckets= (int) Math.floor(sqrt(max-min+1));
                        for (;buckets<=max-min+1;buckets++) {
                            if ((max-min+1)%buckets==0)
                                break;
                        }
                        String group = "";
                        if (buckets==max-min+1){
                            for(int i = 0; i < buckets; i++){
                                String newGroup = String.valueOf(min + i * (max - min+1) / buckets);
                                if(!group.isEmpty())
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                while (groupItr.hasNext() && (Integer.parseInt(group = groupItr.next()) <= min-1 + (i + 1) * (max - min+1) / buckets)){
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                }
                            }
                        }else {
                            for(int i = 0; i < buckets; i++){
                                String newGroup = (min + i * (max - min + 1) / buckets) + "-" + (min - 1 + (i + 1) * (max - min + 1) / buckets);
                                if(!group.isEmpty())
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                while (groupItr.hasNext() && (Integer.parseInt(group = groupItr.next()) <= min-1 + (i + 1) * (max - min+1) / buckets)){
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                }
                            }
                        }
                    }
                    break;
                case Types.FLOAT:
                case Types.DOUBLE:
                    double mind = Double.parseDouble(distribution.firstKey());
                    double maxd = Double.parseDouble(distribution.lastKey());
                    if (maxd - mind >= 50){
                        String group = "";
                        for(int i = 0; i < 50; i++){
                            String newGroup = (mind + i * (maxd - mind) / 50) + "-" + (mind + (i + 1) * (maxd - mind) / 50);
                            if(!group.isEmpty())
                                newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                            while (groupItr.hasNext() && (Integer.parseInt(group = groupItr.next()) <= mind-1 + (i + 1) * (maxd - mind+1) / 50)){
                                newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                            }
                        }
                    }
                    break;
                case Types.TIMESTAMP:
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    try {
                        Date maxDate = sdf.parse(distribution.firstKey());
                        Date minDate = sdf.parse(distribution.lastKey());
                        int gap = (int) ((maxDate.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000));
                        if (gap >= 50){
                            String group = "";
                            for(int i = 0;i < 50; i++){
                                Calendar c = Calendar.getInstance();
                                Calendar c1 = Calendar.getInstance();
                                c.setTime(minDate);
                                c1.setTime(minDate);
                                c.add(Calendar.DAY_OF_MONTH, i * gap / 50);
                                c1.add(Calendar.DAY_OF_MONTH, (i + 1) * gap / 50);
                                String d = sdf.format(c);
                                String d1 = sdf.format(c1);


                                String newGroup = d + "-" + d1;
                                if(!group.isEmpty())
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                while (groupItr.hasNext() && (sdf.parse(group = groupItr.next()).before(sdf.parse(d1)))){
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                }
                            }
                        }
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                    break;
                default:
                    if(columnKey.equals("itemdesc")){
                        // System.out.println("SparkServiceImpl.executesqlForDistributions =========== word count processing...");
                        System.out.println("KylinServiceImpl.executesqlForDistributions =========== word count processing...");

                        int step = 0;
                        TreeMap<String, Integer> segResult = new TreeMap<>();
                        while (groupItr.hasNext()){
                            String group = groupItr.next();

                            StringBuilder text = new StringBuilder();
                            ArrayList<String> itemdescArray = new ArrayList<String>(JSONObject.fromObject(group).values());
                            for (String word : itemdescArray) {
                                text.append(word);
                            }

                            StringReader re = new StringReader(text.toString());
                            IKSegmenter ik = new IKSegmenter(re,true);
                            Lexeme lex = null;
                            try {
                                while ((lex=ik.next())!=null) {
                                    ++step;
                                    if(lex.getLength() > 1)
                                        segResult.put(lex.getLexemeText(), segResult.getOrDefault(lex.getLexemeText(), 0) + 1);
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }

                        // System.out.println("SparkServiceImpl.executesqlForDistributions =========== word count processing total step: " + step);
                        // System.out.println("SparkServiceImpl.executesqlForDistributions =========== word count processing size: " + segResult.size());
                        System.out.println("KylinServiceImpl.executesqlForDistributions =========== word count processing total step: " + step);
                        System.out.println("KylinServiceImpl.executesqlForDistributions =========== word count processing size: " + segResult.size());

                        ArrayList<Map.Entry<String, Integer>> entries = new ArrayList<>(segResult.entrySet());
                        entries.sort((o1, o2) -> o2.getValue().compareTo(o1.getValue()));

                        int cnt = 0;
                        for (Map.Entry<String, Integer> entry: entries){
                            if(cnt >= 30)
                                break;
                            newDistribution.put(entry.getKey(), entry.getValue());
                            cnt++;
                            // System.out.printf("SparkServiceImpl.executesqlForDistributions =========== word count: %s %d\n", entry.getKey(), entry.getValue());
                            System.out.printf("KylinServiceImpl.executesqlForDistributions =========== word count: %s %d\n", entry.getKey(), entry.getValue());
                        }
                    }else {
                        int cnt = 0;
                        while (groupItr.hasNext()){
                            cnt++;
                            if(cnt <= 9){
                                String group = groupItr.next();
                                System.out.println(group + ":" +distribution.get(group).toString());
                                newDistribution.put(group, distribution.get(group));
                            }else {
                                break;
                            }
                        }
                        while (groupItr.hasNext()){
                            String group = groupItr.next();
                            System.out.println(group + ":" +distribution.get(group).toString());
                            newDistribution.put("Others", newDistribution.getOrDefault("Others", 0) + distribution.get(group));
                        }
                    }
            }
            // 若执行分箱操作了
            if(newDistribution.size() > 0)
                distribution = newDistribution;

            JSONArray dist = new JSONArray();
            for (Map.Entry<String, Integer> entry: distribution.entrySet()) {
                JSONObject distObj = new JSONObject();
                distObj.put(entry.getKey(), entry.getValue());
                dist.add(distObj);
            }

            JSONObject colTypeDist = new JSONObject();
            colTypeDist.put("columnname", columnKey);
            colTypeDist.put("type", type);
            colTypeDist.put("data", dist);
            System.out.println("KylinServiceImpl.executesqlForDistributions ========== colTypeDist:" + colTypeDist.toString());

            distArray.add(colTypeDist);
            // System.out.println("SparkServiceImpl.executesqlForDistributions =========== Format the JSON object for column " + columnKey + ":" + (System.currentTimeMillis() - start) + "ms");
            System.out.println("KylinServiceImpl.executesqlForDistributions =========== Format the JSON object for column " + columnKey + ":" + (System.currentTimeMillis() - start) + "ms");
        }

        return distArray;
    }

    @Override
    public JSONArray executesqlForDistribution(String sql, String colname) {
        JSONArray distArray = new JSONArray();

        long start = System.currentTimeMillis();

        sql = util.buildSql(sql);
        // LinkedHashMap<String, TreeMap<String, Integer>> distributions = spark.executeSQLForDistributions(sql);
        LinkedHashMap<String, TreeMap<String, Integer>> distributions = kylin.executeSQLForDistribution(sql, colname);
        // ArrayList<String> types = spark.executeSQLForTypes(sql);
        ArrayList<String> types = kylin.executeSQLForType(sql, colname);
        // System.out.println("SparkServiceImpl.executesqlForDistributions =========== Retrieve distributions which is not binned: " + (System.currentTimeMillis() - start) + "ms");
        System.out.println("KylinServiceImpl.executesqlForDistribution =========== Retrieve distributions which is not binned: " + (System.currentTimeMillis() - start) + "ms");

        // 对聚合后过多的group进行处理, 连续变量分箱, itemdesc字段wordcount
        Iterator<String> keyIterator = distributions.keySet().iterator();
        Iterator<String> typeItr = types.iterator();
        while (keyIterator.hasNext()){
            start = System.currentTimeMillis();
            String columnKey = keyIterator.next();
            TreeMap<String, Integer> distribution = distributions.get(columnKey);
            int type = util.MyKylinTypeParser(typeItr.next());
            // System.out.printf("SparkServiceImpl.executesqlForDistributions ============= (column, type) : (%s, %s)%n", columnKey, type);
            System.out.printf("KylinServiceImpl.executesqlForDistribution ============= (column, type) : (%s, %s)%n", columnKey, type);

            TreeMap<String, Integer> newDistribution = new TreeMap<>();
            Iterator<String> groupItr = distribution.keySet().iterator();
            switch (type){
                case Types.INTEGER:
                case Types.BIGINT:
                    int min = Integer.parseInt(distribution.firstKey());
                    int max = Integer.parseInt(distribution.lastKey());
                    if (max - min >= 40) {
                        int buckets= (int) Math.floor(sqrt(max-min+1));
                        for (;buckets<=max-min+1;buckets++) {
                            if ((max-min+1)%buckets==0)
                                break;
                        }
                        String group = "";
                        if (buckets==max-min+1){
                            for(int i = 0; i < buckets; i++){
                                String newGroup = String.valueOf(min + i * (max - min+1) / buckets);
                                if(!group.isEmpty())
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                while (groupItr.hasNext() && (Integer.parseInt(group = groupItr.next()) <= min-1 + (i + 1) * (max - min+1) / buckets)){
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                }
                            }
                        }else {
                            for(int i = 0; i < buckets; i++){
                                String newGroup = (min + i * (max - min + 1) / buckets) + "-" + (min - 1 + (i + 1) * (max - min + 1) / buckets);
                                if(!group.isEmpty())
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                while (groupItr.hasNext() && (Integer.parseInt(group = groupItr.next()) <= min-1 + (i + 1) * (max - min+1) / buckets)){
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                }
                            }
                        }
                    }
                    break;
                case Types.FLOAT:
                case Types.DOUBLE:
                    double mind = Double.parseDouble(distribution.firstKey());
                    double maxd = Double.parseDouble(distribution.lastKey());
                    if (maxd - mind >= 50){
                        String group = "";
                        for(int i = 0; i < 50; i++){
                            String newGroup = (mind + i * (maxd - mind) / 50) + "-" + (mind + (i + 1) * (maxd - mind) / 50);
                            if(!group.isEmpty())
                                newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                            while (groupItr.hasNext() && (Integer.parseInt(group = groupItr.next()) <= mind-1 + (i + 1) * (maxd - mind+1) / 50)){
                                newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                            }
                        }
                    }
                    break;
                case Types.TIMESTAMP:
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    try {
                        Date maxDate = sdf.parse(distribution.firstKey());
                        Date minDate = sdf.parse(distribution.lastKey());
                        int gap = (int) ((maxDate.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000));
                        if (gap >= 50){
                            String group = "";
                            for(int i = 0;i < 50; i++){
                                Calendar c = Calendar.getInstance();
                                Calendar c1 = Calendar.getInstance();
                                c.setTime(minDate);
                                c1.setTime(minDate);
                                c.add(Calendar.DAY_OF_MONTH, i * gap / 50);
                                c1.add(Calendar.DAY_OF_MONTH, (i + 1) * gap / 50);
                                String d = sdf.format(c);
                                String d1 = sdf.format(c1);


                                String newGroup = d + "-" + d1;
                                if(!group.isEmpty())
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                while (groupItr.hasNext() && (sdf.parse(group = groupItr.next()).before(sdf.parse(d1)))){
                                    newDistribution.put(newGroup, newDistribution.getOrDefault(newGroup, 0) + distribution.get(group));
                                }
                            }
                        }
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                    break;
                default:
                    if(columnKey.equals("itemdesc")){
                        // System.out.println("SparkServiceImpl.executesqlForDistributions =========== word count processing...");
                        System.out.println("KylinServiceImpl.executesqlForDistribution =========== word count processing...");

                        int step = 0;
                        TreeMap<String, Integer> segResult = new TreeMap<>();
                        while (groupItr.hasNext()){
                            String group = groupItr.next();

                            StringBuilder text = new StringBuilder();
                            ArrayList<String> itemdescArray = new ArrayList<String>(JSONObject.fromObject(group).values());
                            for (String word : itemdescArray) {
                                text.append(word);
                            }

                            StringReader re = new StringReader(text.toString());
                            IKSegmenter ik = new IKSegmenter(re,true);
                            Lexeme lex = null;
                            try {
                                while ((lex=ik.next())!=null) {
                                    ++step;
                                    if(lex.getLength() > 1)
                                        segResult.put(lex.getLexemeText(), segResult.getOrDefault(lex.getLexemeText(), 0) + 1);
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }

                        // System.out.println("SparkServiceImpl.executesqlForDistributions =========== word count processing total step: " + step);
                        // System.out.println("SparkServiceImpl.executesqlForDistributions =========== word count processing size: " + segResult.size());
                        System.out.println("KylinServiceImpl.executesqlForDistribution =========== word count processing total step: " + step);
                        System.out.println("KylinServiceImpl.executesqlForDistribution =========== word count processing size: " + segResult.size());

                        ArrayList<Map.Entry<String, Integer>> entries = new ArrayList<>(segResult.entrySet());
                        entries.sort((o1, o2) -> o2.getValue().compareTo(o1.getValue()));

                        int cnt = 0;
                        for (Map.Entry<String, Integer> entry: entries){
                            if(cnt >= 30)
                                break;
                            newDistribution.put(entry.getKey(), entry.getValue());
                            cnt++;
                            // System.out.printf("SparkServiceImpl.executesqlForDistributions =========== word count: %s %d\n", entry.getKey(), entry.getValue());
                            System.out.printf("KylinServiceImpl.executesqlForDistribution =========== word count: %s %d\n", entry.getKey(), entry.getValue());
                        }
                    }else {
                        int cnt = 0;
                        while (groupItr.hasNext()){
                            cnt++;
                            if(cnt <= 9){
                                String group = groupItr.next();
                                System.out.println(group + ":" +distribution.get(group).toString());
                                newDistribution.put(group, distribution.get(group));
                            }else {
                                break;
                            }
                        }
                        while (groupItr.hasNext()){
                            String group = groupItr.next();
                            System.out.println(group + ":" +distribution.get(group).toString());
                            newDistribution.put("Others", newDistribution.getOrDefault("Others", 0) + distribution.get(group));
                        }
                    }
            }
            // 若执行分箱操作了
            if(newDistribution.size() > 0)
                distribution = newDistribution;

            JSONArray dist = new JSONArray();
            for (Map.Entry<String, Integer> entry: distribution.entrySet()) {
                JSONObject distObj = new JSONObject();
                distObj.put(entry.getKey(), entry.getValue());
                dist.add(distObj);
            }

            JSONObject colTypeDist = new JSONObject();
            colTypeDist.put("columnname", columnKey);
            colTypeDist.put("type", type);
            colTypeDist.put("data", dist);
            System.out.println("KylinServiceImpl.executesqlForDistribution ========== colTypeDist:" + colTypeDist.toString());

            distArray.add(colTypeDist);
            // System.out.println("SparkServiceImpl.executesqlForDistributions =========== Format the JSON object for column " + columnKey + ":" + (System.currentTimeMillis() - start) + "ms");
            System.out.println("KylinServiceImpl.executesqlForDistribution =========== Format the JSON object for column " + columnKey + ":" + (System.currentTimeMillis() - start) + "ms");
        }

        return distArray;
    }

    @Override
    public JSONObject getSqlResult(String rawSql, String dbname) throws Exception{
        // JSONArray tableData = new JSONArray();
        // long start = System.currentTimeMillis();
        String sql = rawSql;
        if(!dbname.equals("tpch1")){
            sql = util.buildSql(dbname, rawSql);
        }


        // System.out.println("KylinServiceImpl.getSqlResult =========== total time cost: " + totalTime + "ms");
        // System.out.println("KylinServiceImpl.getSqlResult =========== sql result: " + result.get("tableData").toString());
        return kylin.getSqlResult(sql);
    }
}
