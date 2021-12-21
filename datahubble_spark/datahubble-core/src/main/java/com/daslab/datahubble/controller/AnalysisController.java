/*
 * Author :yyz 2019.11.9 13:58
 *
 * Prometheus临时监控接口
 */

package com.daslab.datahubble.controller;

import com.daslab.SparkExecutor;
import com.daslab.datahubble.http.Http;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api")
@ApiIgnore()
public class AnalysisController {

    @Value("${smartinteraction.database}")
    private String DATABASE;
    @Value("${smartinteraction.ip}")
    private String IP;
    @Value("${smartinteraction.script.dir}")
    private String SCRIPT_DIR;
    @Value("${smartinteraction.py3env.path}")
    private String PY3ENV_PATH;

    //prometheus metrics
    public static long analysisPathTime = 0;
    public static long analysisResTime = 0;
    public static long analysisPathTime_1 = 0;
    public static long analysisResTime_1 = 0;
    public static int analysisPathCount = 0;
    public static int analysisResCount = 0;
    public static int analysisPathCode;
    public static int analysisResCode;
    //一次流程(五个过程)完成次数
    public static int smProcessCount = 0;

    @CrossOrigin(origins = "*")
    @PostMapping("/data/AnalysisPath")
    public ResponseEntity<?> GetAnalysisPath(@RequestBody String sql) {
        //start time
        long start = System.currentTimeMillis();
        System.out.printf("POST /data/AnalysisPath =========== ");

        //end time
        long end = System.currentTimeMillis();
        analysisPathTime = (end - start)/1000;
        analysisPathTime_1 = (end - start)/1000;
        analysisPathCount++;
        analysisPathCode = HttpStatus.OK.value();
        return new ResponseEntity<>(sql, HttpStatus.OK);

    }

    private SparkExecutor spark = new SparkExecutor();

    private JSONObject fixjson(JSONObject rawjson) throws ParseException {
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

    private JSONArray executesql(String sql, boolean fromcube) throws ParseException {
        if (fromcube) {
            String[] sqlarray = sql.split(" ");
            sql = "";
            for (Integer i = 0; i < sqlarray.length; i++) {
                if (i > 0 && (sqlarray[i - 1].equals("from") || sqlarray[i - 1].equals("FROM"))) {
                    sql += sqlarray[i] + "_10 ";
                } else {
                    sql += sqlarray[i] + " ";
                }
            }
            System.out.printf("POST /hive/executesql =========== sql=%s%n", sql);

            JSONObject sendmess = new JSONObject();
            sendmess.put("sql", sql);
            sendmess.put("project", "bigbench");
            JSONObject jsonObject = new JSONObject();
            JSONArray result = new JSONArray();
            try {
                String rs1 = Http.sendPost("http://" + IP + ":7070/kylin/api/query", sendmess.toString());
                System.out.println(rs1);
                jsonObject = fixjson(JSONObject.fromObject(rs1));
                result = jsonObject.getJSONArray("data");
            } catch (Exception e) {
                e.printStackTrace();
            }
            return result;
        }
        else {
            String[] sqlarray = sql.split(" ");
            sql = "";
            for (Integer i = 0; i < sqlarray.length; i++) {
                if (i > 0 && (sqlarray[i - 1].equals("from") || sqlarray[i - 1].equals("FROM"))) {
                    sql += DATABASE+"."+sqlarray[i] + " ";
                } else {
                    sql += sqlarray[i] + " ";
                }
            }
            return spark.executeSQL1(sql);
        }
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/AnalysisResult")
    public ResponseEntity<?> AnalysisResult(@RequestBody JSONObject json) {
        //start and end time
        long start = System.currentTimeMillis();
        long end = 0;
        // flag to judge success or not
        boolean flag = false;
        JSONObject returnData = new JSONObject();

        String task = json.getString("task");
        String model = json.getString("model");
        if (task.equals("regression")) {
            String sql = json.getString("sql");
            String end_date = json.getString("end_date") + " 00:00:00";
            boolean gender = json.getBoolean("gender");
            boolean fromcube = json.getBoolean("fromcube");
            if (fromcube) {
                String[] sqlarray = sql.split(" ");
                sql = "";
                for (Integer i = 0; i < sqlarray.length; i++) {
                    if (i > 0 && (sqlarray[i - 1].equals("from") || sqlarray[i - 1].equals("FROM"))) {
                        sql += sqlarray[i] + "_10 ";
                    } else {
                        sql += sqlarray[i] + " ";
                    }
                }
                System.out.printf("POST /AnalysisResult =========== sql=%s%n", sql);
                JSONObject sendmess = new JSONObject();
                sendmess.put("sql", sql);
                sendmess.put("project", "bigbench");
                String rs1 = Http.sendPost("http://" + IP + ":7070/kylin/api/query", sendmess.toString());
                try {
                    System.out.println(rs1);
                    returnData = JSONObject.fromObject(rs1);
                    returnData = fixjson(returnData);
                    System.out.println(returnData);
                    flag = true;
                } catch (Exception e) {
                    e.printStackTrace();
                    flag = false;
                }
            } else {
                try {
                    String[] sqlarray = sql.split(" ");
                    sql = "";
                    for (Integer i = 0; i < sqlarray.length; i++) {
                        if (i > 0 && (sqlarray[i - 1].equals("from") || sqlarray[i - 1].equals("FROM"))) {
                            sql += DATABASE + "." + sqlarray[i] + " ";
                        } else {
                            sql += sqlarray[i] + " ";
                        }
                    }
                    System.out.printf("POST /hive/AnalysisResult =========== sql=%s%n", sql);
                    JSONArray result = spark.executeSQL1(sql);

                    JSONArray predicted_result = new JSONArray();
                    JSONObject result_reformat = new JSONObject();
                    JSONArray predicted_result_format = new JSONArray();
                    if(gender){
                        String[] args = new String[6];
                        args[0] = PY3ENV_PATH;
                        args[1] = SCRIPT_DIR + "MLTask/mltask.py";
                        args[2] = task;
                        args[3] = model;
                        args[4] = end_date;
                        args[5] = "1";
                        String python = args[0]+" "+args[1]+" " + args[2]+" "+args[3]+" '" + args[4]+"' "+args[5]+" ";
                        System.out.printf("POST /hive/AnalysisResult =========== MLTask=%s\n", python);
                        Process proc = Runtime.getRuntime().exec(args);
                        BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream(), "UTF-8"));
                        String line = null;
                        while ((line = in.readLine()) != null) {
                            System.out.printf("/hive/AnalysisResult==MLTask ============ %s\n", line);
                            if (line.equals("{}"))
                                break;
                            // {male:{"2020-03-22 00:00:00":99}}
                            JSONObject temp = JSONObject.fromObject(line);
                            predicted_result.add(temp);
                        }
                        in.close();
                        proc.waitFor();
                        System.out.print("POST /hive/AnalysisResult =========== MLTask finished\n");
                        // reformat predicted result: {"1":"2020-03-22 00:00:00", "2":男, "3":99}
                        for (int i = 0; i < predicted_result.size(); i++) {
                            JSONObject temp = predicted_result.getJSONObject(i);
                            for (Iterator<String> iterator = temp.keys(); iterator.hasNext(); ) {
                                String gender_key = iterator.next();
                                System.out.printf("/hive/AnalysisResult==regression gender_key ============ %s\n", gender_key);
                                JSONObject temp1 = temp.getJSONObject(gender_key);
                                for(Iterator<String> iterator1 = temp1.keys(); iterator1.hasNext();){
                                    String date_key = iterator1.next();
                                    System.out.printf("/hive/AnalysisResult==regression  date_key ============ %s\n", date_key);
                                    result_reformat.put("1", date_key);
                                    result_reformat.put("2", gender_key.equals("male")?"男":"女");
                                    result_reformat.put("3", temp1.getInt(date_key));
                                    predicted_result_format.add(result_reformat);
                                }
                            }
                        }

                        //            returnData.put("fds",null);
                        System.out.printf("/hive/AnalysisResult==predicted ============ %s\n", predicted_result_format);
                        returnData.put("data", result);
                        returnData.put("predicted", predicted_result_format);
                        flag = true;
                    }else {
                        // 执行MLTask python代码: python mltask.py 'regression' 'xgboost' end_date 0
                        String[] args = new String[6];
                        args[0] = PY3ENV_PATH;
                        args[1] = SCRIPT_DIR + "MLTask/mltask.py";
                        args[2] = task;
                        args[3] = model; //model,等课题三接口实现好后更改
                        args[4] = end_date;
                        args[5] = "0";
                        String python = args[0]+" "+args[1]+" " + args[2]+" "+args[3]+" '" + args[4]+"' "+args[5]+" ";
                        System.out.printf("POST /hive/AnalysisResult =========== MLTask=%s\n", python);
                        Process proc = Runtime.getRuntime().exec(args);
                        BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream(), "UTF-8"));
                        String line = null;
                        while ((line = in.readLine()) != null) {
                            System.out.printf("/hive/AnalysisResult==MLTask ============ %s\n", line);
                            if (line.equals("{}"))
                                break;
                            // "2020-03-22 00:00:00":99
                            JSONObject temp = JSONObject.fromObject(line);
                            predicted_result.add(temp);
                        }
                        in.close();
                        proc.waitFor();
                        System.out.print("POST /hive/AnalysisResult =========== MLTask finished\n");
                        // reformat predicted result: {"1":"2020-03-22 00:00:00", "2":99}
                        for (int i = 0; i < predicted_result.size(); i++) {
                            JSONObject temp = predicted_result.getJSONObject(i);
                            for (Iterator<String> iterator = temp.keys(); iterator.hasNext(); ) {
                                String key = iterator.next();
                                System.out.printf("/hive/AnalysisResult==regression data_key ============ %s\n", key);
                                result_reformat.put("1", key);
                                result_reformat.put("2", temp.getInt(key));
                                predicted_result_format.add(result_reformat);
                            }
                        }

                        //            returnData.put("fds",null);
                        System.out.printf("/hive/AnalysisResult==predicted ============ %s\n", predicted_result_format);
                        returnData.put("data", result);
                        returnData.put("predicted", predicted_result_format);
                        flag = true;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    flag = false;
                }
            }
        }else if(task.equals("clustering")){
            try {
                // 执行MLTask python代码: python mltask.py clustering kmeans
                JSONArray predicted_result = new JSONArray();
                String[] args = new String[4];
                args[0] = PY3ENV_PATH;
                args[1] = SCRIPT_DIR + "MLTask/mltask.py";
                args[2] = task;
                args[3] = model; //model,等课题三接口实现好后更改
                String python = args[0]+" "+args[1]+" " + args[2]+" "+args[3];
                System.out.printf("POST /hive/AnalysisResult =========== MLTask=%s\n", python);
                Process proc = Runtime.getRuntime().exec(args);
                BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream(), "UTF-8"));
                String line = null;
                while ((line = in.readLine()) != null) {
                    System.out.printf("/hive/AnalysisResult==MLTask ============ %s\n", line);
                    if (line.equals("{}"))
                        break;
                    // "0":245
                    JSONObject temp = JSONObject.fromObject(line);
                    predicted_result.add(temp);
                }
                in.close();
                proc.waitFor();
                System.out.print("POST /hive/AnalysisResult =========== MLTask finished\n");
                // reformat predicted result: {"1":"0", "2":245}
                JSONObject result_reformat = new JSONObject();
                JSONArray predicted_result_format = new JSONArray();
                for (int i = 0; i < predicted_result.size(); i++) {
                    JSONObject temp = predicted_result.getJSONObject(i);
                    for (Iterator<String> iterator = temp.keys(); iterator.hasNext(); ) {
                        String key = iterator.next();
                        System.out.printf("/hive/AnalysisResult==clustering class_key ============ %s\n", key);
                        result_reformat.put("1", key);
                        result_reformat.put("2", temp.getInt(key));
                        predicted_result_format.add(result_reformat);
                    }
                }
                System.out.printf("/hive/AnalysisResult==predicted ============ %s\n", predicted_result_format);
                returnData.put("predicted", predicted_result_format);
                flag = true;
            }catch (Exception e){
                e.printStackTrace();
                flag = false;
            }
        }else if (task.equals("outlierdetection")){
            String sql = json.getString("sql");
            try {
                String[] sqlarray = sql.split(" ");
                sql = "";
                for (Integer i = 0; i < sqlarray.length; i++) {
                    if (i > 0 && (sqlarray[i - 1].equals("from") || sqlarray[i - 1].equals("FROM"))) {
                        sql += DATABASE + "." + sqlarray[i] + " ";
                    } else {
                        sql += sqlarray[i] + " ";
                    }
                }
                System.out.printf("POST /hive/AnalysisResult =========== sql=%s%n", sql);
                JSONArray result = spark.executeSQL1(sql);

                // 执行MLTask python代码: python mltask.py outlierdetection isolation forest
                ArrayList<Integer> predict_result = new ArrayList<>();
                String[] args = new String[4];
                args[0] = PY3ENV_PATH;
                args[1] = SCRIPT_DIR + "MLTask/mltask.py";
                args[2] = task;
                args[3] = "outlierdetection"; //model,等课题三接口实现好后更改
                String python = args[0]+" "+args[1]+" " + args[2]+" "+args[3];
                System.out.printf("POST /hive/AnalysisResult =========== MLTask=%s\n", python);
                Process proc = Runtime.getRuntime().exec(args);
                BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream(), "UTF-8"));
                String line = null;
                while ((line = in.readLine()) != null) {
                    System.out.printf("/hive/AnalysisResult==MLTask ============ %s\n", line);
                    if (line.equals("[]"))
                        break;
                    // [1, 1,1, -1, 1 , 1, 1, 1, 1, -1, 1, 1, 1]
                    String[] results = line.substring(1, line.length()-1).split(", ");
                    for (String s : results) {
                        predict_result.add(Integer.valueOf(s));
                    }
                }
                in.close();
                proc.waitFor();
                System.out.print("POST /hive/AnalysisResult =========== MLTask finished\n");

                System.out.printf("/hive/AnalysisResult==predicted ============ %s\n", predict_result);
                returnData.put("data", result);
                returnData.put("predicted", predict_result);
                flag = true;
            }catch (Exception e){
                e.printStackTrace();
                flag = false;
            }
        }

        end = System.currentTimeMillis();
        analysisResTime = (end - start) / 1000;
        analysisResTime_1 = (end - start) / 1000;
        analysisResCount++;
        analysisResCode = HttpStatus.NO_CONTENT.value();
        smProcessCount++;
        if(flag){
            return new ResponseEntity<JSONObject>(returnData, HttpStatus.OK);
        }else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

//
}
