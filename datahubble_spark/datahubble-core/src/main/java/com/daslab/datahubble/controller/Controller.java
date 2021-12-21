package com.daslab.datahubble.controller;

import com.daslab.SparkExecutor;
import com.daslab.datahubble.history.repository.HistoryRepository;
import com.daslab.datahubble.hive.HiveConfig;
import com.daslab.datahubble.http.Http;
import com.daslab.datahubble.service.SparkService;
import com.daslab.datahubble.service.KylinService;
import com.daslab.datahubble.sourceindex.model.SourceIndex;
import com.daslab.datahubble.sourceindex.repository.SourceIndexRepository;
import com.daslab.datahubble.user.model.User;
import com.daslab.datahubble.user.repository.UserRepository;
import com.daslab.datahubble.util.Util;
import com.daslab.datahubble.wordcount.WordCount;
import iforest.IForest;
import io.swagger.annotations.*;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.validation.Valid;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.*;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.*;

//import com.daslab.smartinteract.spark.SparkConfig;

@RestController
@RequestMapping("/api")
@Api("DataHubble API")
public class Controller {
    private Connection conn = HiveConfig.getConnnection();
    private SparkExecutor spark = new SparkExecutor();
    private boolean is_getsum_calculated = false; //  wheather the initial range of getsumbydate is already calculated
    private JSONObject caldata_shop1 = new JSONObject();
    private JSONObject caldata_myshop = new JSONObject();
    private String saved_date1 = new String();
    private String saved_date2 = new String();
    private Double target_setted = 3000000.0;
    private boolean activeroute_is_loaded = false;
    private Double now = 2.246768304E9;
    private ArrayList<ArrayList<ArrayList<String>>> active_routes = new ArrayList<>();

    // prometheus metrics
    public static long rangeTime = 0;
    public static long visRecTime = 0;
    public static long methodRecTime = 0;
    public static long rangeTime_1 = 0;
    public static long visRecTime_1 = 0;
    public static long methodRecTime_1 = 0;
    public static int rangeCount = 0;
    public static int visRecCount = 0;
    public static int methodRecCount = 0;
    public static int rangeCode;
    public static int visRecCode;
    public static int methodRecCode;

    PreparedStatement ps = null;
    @Autowired
    UserRepository userRepository;
    @Autowired
    SourceIndexRepository sourceIndexRepository;
    @Autowired
    HistoryRepository historyRepository;
    @Autowired
    private SparkService sparkService;
    @Autowired
    private KylinService kylinService;
    @Autowired
    private Util util;
    // 全局变量, 如ip, DATBASE等
    @Value("${smartinteraction.ip}")
    private String IP;
    @Value("${smartinteraction.database}")
    private String DATABASE;
    @Value("${smartinteraction.table}")
    private String TABLE;
    @Value("${smartinteraction.script.dir}")
    private String SCRIPT_DIR;

    /**
     * 单词树结点的定义
     */
    class CharTreeNode {
        int cnt = 0;
        CharTreeNode[] children = new CharTreeNode[26];
    }

    /**
     * private function
     */
    private Integer getRowcount(JSONArray filters) {
        Integer result = 0;
        JSONArray arr = new JSONArray();
        arr = JSONArray.fromObject(filters);
//        for (int i=0;i<filters.size();i++) {
//            if (!filters.getJSONObject(i).getJSONArray("data").isEmpty())
//                arr.add(filters.getJSONObject(i));
//        }

        JSONArray distArr = new JSONArray();
        String columnname = "";
        if (!arr.isEmpty()) {
            long start = System.currentTimeMillis();

            String sql = "SELECT * FROM " + arr.getJSONObject(0).getString("tablename");
            String[] sWhere = new String[arr.size()];
            for (int i = 0; i < arr.size(); i++) {
                JSONObject filter = arr.getJSONObject(i);
                System.out.printf("getRowcount =========== filter%d:%s%n", i, filter);
                //                type = filter.getInt("type");
                columnname = filter.getString("columnname");
                if (filter.getInt("type") == Types.BIGINT || filter.getInt("type") == Types.INTEGER ||
                        filter.getInt("type") == Types.DECIMAL || filter.getInt("type") == Types.DOUBLE) {
                    sWhere[i] = filter.getString("columnname") + ">=" + filter.getJSONArray("data").get(0) +
                            " AND " + filter.getString("columnname") + "<=" + filter.getJSONArray("data").get(1);
                } else {
                    JSONArray items = filter.getJSONArray("data");
                    sWhere[i] = "";
                    if (!items.isEmpty() && filter.getInt("type") == Types.TIMESTAMP) {
                        System.out.println(items.size() - 2);
                        sWhere[i] = filter.getString("columnname") +
                                " BETWEEN '" + filter.getJSONArray("data").get(0) +
                                "' AND '" + filter.getJSONArray("data").get(1) + "'";
                    } else if (filter.getInt("type") == Types.VARCHAR) {
                        if (columnname.contains("itemdesc")) {
                            System.out.printf("getRowcount =========== itemdesc size:%d%n", items.size());
                            for (int j = 0; j < items.size(); j++) {
                                sWhere[i] += columnname + " NOT LIKE " + "'%" + items.get(j) + "%'";
                                if (j != items.size() - 1) sWhere[i] += " OR ";
                            }
                        } else {
                            for (int j = 0; j < items.size(); j++) {
                                sWhere[i] += columnname + "='" + items.get(j) + "'";
                                if (j != items.size() - 1) sWhere[i] += " OR ";
                            }
                        }
                    }
                }
                System.out.printf("getRowcount =========== WHERE clause%d=%s%n", i, sWhere[i]);
            }
            sql += " WHERE ";
//            StringUtils.join(, "AND");
            int begin=0, end=filters.size()-1;
            while (sWhere[begin].isEmpty()) begin++;
            while (sWhere[end].isEmpty()) end--;
            while (begin<=end) {
                sql+="("+sWhere[begin]+")";
                if (begin<end) sql+= " AND ";
                else break;
                begin++;
                while (sWhere[begin].isEmpty()) begin++;
            }
            System.out.printf("getRowcount =========== sql=%s%n", sql);
            System.out.println("getRowcount =========== SQL generation:" + (System.currentTimeMillis() - start) + "ms");
            try {
                // JSONArray rs = sparkService.executesql(sql, false);
                JSONArray rs = kylinService.executesql(sql, false);
                result = rs.size()-1;
            } catch (Exception e) { e.printStackTrace(); }
        }
        return result;
    }

    private JSONArray GetAllDataDistributions(JSONArray jsonArray) {
        JSONArray arr = JSONArray.fromObject(jsonArray);
        System.out.println("GetAllDataDistributions =========== jsonArray: " + arr.toString());
        JSONArray distArr = new JSONArray();
        String tablename = arr.getJSONObject(0).getString("tablename");

        if (!arr.isEmpty()) {
            long start = System.currentTimeMillis();

            // 拼装sql
            String[] filterArray = new String[arr.size()];
            for (int i = 0; i < arr.size(); i++) {
                JSONObject filter = arr.getJSONObject(i);
                String columnname = filter.getString("columnname");
                System.out.printf("GetAllDataDistributions =========== filter%d: %s%n", i, filter);

                JSONArray range = filter.getJSONArray("data");
                switch (filter.getInt("type")){
                    case Types.BIGINT:
                    case Types.INTEGER:
                    case Types.DOUBLE:
                    case Types.DECIMAL:
                        filterArray[i] = filter.getString("columnname") + ">=" + range.get(0) +
                                " AND " + filter.getString("columnname") + "<=" + range.get(1);
                        break;
                    case Types.TIMESTAMP:
                        if (!range.isEmpty()){
                            filterArray[i] = filter.getString("columnname") + ">='" + range.get(0) +
                                    "' AND " + filter.getString("columnname") + "<='" + range.get(1) + "'";
                        }else {
                            filterArray[i] = "";
                        }
                        break;
                    case Types.VARCHAR:
                        filterArray[i] = "";
                        if (columnname.contains("itemdesc")){
                            System.out.printf("GetAllDataDistributions =========== itemdesc size: %d%n", range.size());
                            for (int j = 0; j < range.size(); j++) {
                                filterArray[i] += columnname + " NOT LIKE " + "'%" + range.get(j) + "%'";
                                if (j != range.size() - 1) filterArray[i] += " OR ";
                            }
                        }
                        break;
                    default:
                        filterArray[i] = "";
                        break;
                }
                System.out.printf("GetAllDataDistributions =========== WHERE clause%d = %s%n", i, filterArray[i]);
            }

            String filters = "";
            int begin=0, end=filterArray.length-1;
            System.out.printf("GetAllDataDistributions =========== filterArray begin end:%s,%s ", begin, end);
            while (filterArray[begin].isEmpty()) begin++;
            while (filterArray[end].isEmpty()) end--;
            while (begin<=end) {
                filters+="("+filterArray[begin]+")";
                if (begin<end) filters+= " AND ";
                else break;
                begin++;
                while (filterArray[begin].isEmpty()) begin++;
            }
            // String sql = String.format("SELECT * FROM %1$s WHERE %2$s", tablename, filters);
            String sql = String.format("FROM %1$s WHERE %2$s", tablename, filters);

            sql = sql.replaceAll(" 00:00:00.0", "");
            sql = sql.replaceAll("price", "price1");
            sql = sql.replaceAll("quantity", "quantity1");
            sql = sql.replaceAll("discount", "discount1");
            sql = sql.replaceAll("age", "age1");

            System.out.printf("GetAllDataDistributions =========== sql = %s%n", sql);
            System.out.println("GetAllDataDistributions =========== SQL generation: " + (System.currentTimeMillis() - start) + "ms");

            //distArr = sparkService.executesqlForDistributions(sql);
            distArr = kylinService.executesqlForDistributions(sql);
        }
        return distArr;
    }

    /**
     * return data distributions one by one
     * @param jsonObject
     * @return
     */
    private JSONArray GetDataDistribution(JSONObject jsonObject) {
        String colname = jsonObject.getString("columnname");
        System.out.println("GetDataDistribution ========== jsonObject: " + jsonObject.toString());
        JSONArray arr = JSONArray.fromObject(jsonObject.getString("jsonData"));
        System.out.println("GetDataDistribution =========== jsonArray: " + arr.toString());
        JSONArray distArr = new JSONArray();
        String tablename = arr.getJSONObject(0).getString("tablename");


        if (!arr.isEmpty()) {
            long start = System.currentTimeMillis();

            // 拼装sql
            String[] filterArray = new String[arr.size()];
            for (int i = 0; i < arr.size(); i++) {
                JSONObject filter = arr.getJSONObject(i);
                String columnname = filter.getString("columnname");
                System.out.printf("GetDataDistribution =========== filter%d: %s%n", i, filter);

                JSONArray range = filter.getJSONArray("data");
                switch (filter.getInt("type")){
                    case Types.BIGINT:
                    case Types.INTEGER:
                    case Types.DOUBLE:
                    case Types.DECIMAL:
                        filterArray[i] = filter.getString("columnname") + ">=" + range.get(0) +
                                " AND " + filter.getString("columnname") + "<=" + range.get(1);
                        break;
                    case Types.TIMESTAMP:
                        if (!range.isEmpty()){
                            filterArray[i] = filter.getString("columnname") + ">='" + range.get(0) +
                                    "' AND " + filter.getString("columnname") + "<='" + range.get(1) + "'";
                        }else {
                            filterArray[i] = "";
                        }
                        break;
                    case Types.VARCHAR:
                        filterArray[i] = "";
                        if (columnname.contains("itemdesc")){
                            System.out.printf("GetDataDistribution =========== itemdesc size: %d%n", range.size());
                            for (int j = 0; j < range.size(); j++) {
                                filterArray[i] += columnname + " NOT LIKE " + "'%" + range.get(j) + "%'";
                                if (j != range.size() - 1) filterArray[i] += " OR ";
                            }
                        }
                        break;
                    default:
                        filterArray[i] = "";
                        break;
                }
                System.out.printf("GetDataDistribution =========== WHERE clause%d = %s%n", i, filterArray[i]);
            }

            String filters = "";
            int begin=0, end=filterArray.length-1;
            System.out.printf("GetDataDistribution =========== filterArray begin end:%s,%s ", begin, end);
            while (filterArray[begin].isEmpty()) begin++;
            while (filterArray[end].isEmpty()) end--;
            while (begin<=end) {
                filters+="("+filterArray[begin]+")";
                if (begin<end) filters+= " AND ";
                else break;
                begin++;
                while (filterArray[begin].isEmpty()) begin++;
            }
            // String sql = String.format("SELECT * FROM %1$s WHERE %2$s", tablename, filters);
            String sql = String.format("FROM %1$s WHERE %2$s", tablename, filters);

            sql = sql.replaceAll(" 00:00:00.0", "");
            sql = sql.replaceAll("price", "price1");
            sql = sql.replaceAll("quantity", "quantity1");
            sql = sql.replaceAll("discount", "discount1");
            sql = sql.replaceAll("age", "age1");

            colname = colname.replaceAll("price", "price1");
            colname = colname.replaceAll("quantity", "quantity1");
            colname = colname.replaceAll("discount", "discount1");
            colname = colname.replaceAll("age", "age1");

            System.out.printf("GetDataDistribution =========== sql = %s%n", sql);
            System.out.println("GetDataDistribution =========== SQL generation: " + (System.currentTimeMillis() - start) + "ms");

            //distArr = sparkService.executesqlForDistributions(sql);
            distArr = kylinService.executesqlForDistribution(sql, colname);
        }
        return distArr;
    }

    private CharTreeNode geneCharTree(String text) {
        CharTreeNode root = new CharTreeNode();
        CharTreeNode p = root;
        char c = ' ';
        for (int i = 0; i < text.length(); ++i) {
            c = text.charAt(i);
            if (c >= 'A' && c <= 'Z')
                c = (char) (c + 'a' - 'A');
            if (c >= 'a' && c <= 'z') {
                if (p.children[c - 'a'] == null)
                    p.children[c - 'a'] = new CharTreeNode();
                p = p.children[c - 'a'];
            } else {
                p.cnt++;
                p = root;
            }
        }
        if (c >= 'a' && c <= 'z')
            p.cnt++;
        return root;
    }

    /**
     * 使用深度优先搜索遍历单词树并将对应单词放入结果集中
     */
    private void getWordCountFromCharTree(List result, CharTreeNode p, char[] buffer, int length) {
        for (int i = 0; i < 26; ++i) {
            if (p.children[i] != null) {
                buffer[length] = (char) (i + 'a');
                if (p.children[i].cnt > 0) {
                    WordCount wc = new WordCount();
                    wc.setCount(p.children[i].cnt);
                    wc.setWord(String.valueOf(buffer, 0, length + 1));
                    result.add(wc);
                }
                getWordCountFromCharTree(result, p.children[i], buffer, length + 1);
            }
        }
    }

    private void getWordCountFromCharTree(List result, CharTreeNode p) {
        getWordCountFromCharTree(result, p, new char[10000], 0);
    }

    private void loadActiveRoutes() {
        activeroute_is_loaded = true;
        active_routes.clear();
        ArrayList<String> activelist = new ArrayList<>();
        ArrayList<ArrayList<String>> activeroute = new ArrayList<>();
        activelist.add("支付金额"); activelist.add("销售量"); activelist.add("实时概况");
        activeroute.add(activelist);
        active_routes.add(activeroute); // activeroute1

        activelist = new ArrayList<>();
        activeroute = new ArrayList<>();
        activelist.add("支付金额"); activelist.add("销售量");
        activeroute.add(activelist);
        activelist = new ArrayList<>();
        activelist.add("行业排行");
        activeroute.add(activelist);
        active_routes.add(activeroute); // activeroute2

        activelist = new ArrayList<>();
        activeroute = new ArrayList<>();
        activelist.add("支付金额"); activelist.add("销售量");
        activeroute.add(activelist);
        activelist = new ArrayList<>();
        activelist.add("行业排行");
        activeroute.add(activelist);
        activelist = new ArrayList<>();
        activelist.add("评论"); activelist.add("退款率"); activelist.add("介入退款率"); activelist.add("投诉率"); activelist.add("介入率");
        activelist.add("访客数"); activelist.add("咨询人数"); activelist.add("日均客服在线数"); activelist.add("咨询率"); activelist.add("纠纷退款率");
        activeroute.add(activelist);
        active_routes.add(activeroute); // activeroute3
    }
    /***********************************************************************************
     *** Mysql metadata APIs ***
     ***********************************************************************************/
    @CrossOrigin(origins = "*")
    @GetMapping("/user/list")
    @ApiIgnore()
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/user/add")
    @ApiIgnore()
    public User createUser(@Valid @RequestBody User user) {
        return userRepository.save(user);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/user/login")
    @ApiIgnore()
    public ResponseEntity<?> UserLogin(@Valid @RequestBody User user) {
        System.out.printf("POST /user/login =========== username= %s, password=%s%n", user.getUsername(), user.getPassword());
        User userExists = userRepository.findByUsername(user.getUsername());
        if (userExists != null && (userExists.getPassword()).equals(user.getPassword()) == true) {
            System.out.println("POST /user/login =========== user profile verified!");
            return new ResponseEntity<>(userExists, HttpStatus.OK);
        } else {
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/index/list")
    @ApiIgnore()
    public ResponseEntity<?> getAllDataSources() {
        System.out.printf("GET /index/list =========== successfully%n");
        return new ResponseEntity<>(sourceIndexRepository.findAllByOrderByIscommonDescUpdatedAtDesc(), HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/index/table")
    @ApiIgnore()
    public ResponseEntity<?> getOneDataSource(@Valid @RequestBody SourceIndex sourceIndex) {
        System.out.printf("POST /index/table =========== tablename=%s%n", sourceIndex.getTablename());
        // Sort the dataset list ordered by "iscommon" property first and then, updated time.
        return new ResponseEntity<>(sourceIndexRepository.findByTablename(sourceIndex.getTablename()), HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/index/update")
    @ApiIgnore()
    public ResponseEntity<?> updateIsCommonProperty(@Valid @RequestBody SourceIndex sourceIndex) {
        System.out.printf("POST /index/update =========== tablename=%s%n", sourceIndex.getTablename());
        SourceIndex si = sourceIndexRepository.findByTablename(sourceIndex.getTablename());
        si.setIscommon(sourceIndex.isIscommon());
        sourceIndexRepository.save(si);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/index/recommend")
    @ApiIgnore()
    public ResponseEntity<?> DataSourcesRecommend(@RequestBody String jsonData) throws IOException {
        System.out.printf("POST /index/recommend =========== parameter=%s%n", jsonData);
        JSONObject obj = JSONObject.fromObject(jsonData);
        String label = obj.get("label").toString();
        System.out.printf("POST /index/recommend =========== successfully retrieved the user label: %s%n", label);

        JSONObject returnData = new JSONObject();
        returnData.put("status", "success");

        List<SourceIndex> list = sourceIndexRepository.findAllByLabel(label);
        returnData.put("count", list.size());
        System.out.printf("POST /index/recommend =========== recommend %d datasets for this user...%n", list.size());
        ObjectMapper mapper = new ObjectMapper();
        returnData.put("data", mapper.writeValueAsString(list));
        return new ResponseEntity<JSONObject>(returnData, HttpStatus.OK);
    }

    /**
     * 历史操作记录的存储与读取
     */
    @CrossOrigin(origins = "*")
    @PostMapping("/data/saveOperation")
    @ApiOperation("/根据数据表名和条目数获取指定数目的最近日志")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "tableName",value = "表名",required = true,dataType = "String",paramType = "form"),
            @ApiImplicitParam(name = "userId",value = "用户编号",required = true,dataType = "int",paramType = "form"),
            @ApiImplicitParam(name = "step",value = "步骤数",required = true,dataType = "int",paramType = "form"),
            @ApiImplicitParam(name = "chartId",value = "操作的表的编号",required = true,dataType = "int",paramType = "form"),
            @ApiImplicitParam(name = "xColumn",value = "表的x轴名称",required = true,dataType = "String",paramType = "form"),
            @ApiImplicitParam(name = "yColumn",value = "表的y轴名称",required = true,dataType = "String",paramType = "form"),
            @ApiImplicitParam(name = "previous",value = "前一步日志编号",required = true,dataType = "int",paramType = "form")
    })
    public ResponseEntity<?> SaveHistory1(String tableName, int userId, int step, int chartId, String xColumn, String yColumn, int previous) throws SQLException {
        JSONObject params = new JSONObject();
        params.put("tablename",tableName);
        params.put("userid",userId);
        params.put("step", step);
        JSONArray record = new JSONArray();
        JSONObject chartidObj = new JSONObject();
        chartidObj.put("chartId",chartId);
        JSONObject xColumnObj = new JSONObject();
        xColumnObj.put("xcolumn",xColumn);
        JSONObject yColumnObj = new JSONObject();
        yColumnObj.put("ycolumn",yColumn);
        record.add(chartidObj);
        record.add(xColumnObj);
        record.add(yColumnObj);
        params.put("record",record);
        params.put("previous",previous);
        return SaveHistory(params);
    }


    @CrossOrigin(origins = "*")
    @PostMapping("/hive/savehistory")
    @ApiIgnore()
    @ApiOperation("/保存当前操作的日志")
    @ApiImplicitParam(name = "jsonData", value = "请求参数说明：" +
            "<br>{" +
            "\"userid\":\"用户编号\"," +
            "<br>\"tablename\":\"表名\"," +
            "<br>\"step\":\"步骤数\"," +
            "<br>\"record\":[" +
            "<br>\"charID\":\"表编号\"," +
            "<br>\"xcolumn\":\"x轴名称\"," +
            "<br>\"ycolumn\":\"y轴名称\"" +
            "]" +
            "<br>\"previous\":\"前一步日志编号\"" +
            "}" +
            "<br>请求参数示例：" +
            "<br>{" +
            "\"userid\":1," +
            "<br>\"tablename\":\"websales_home_myshop_10000\"," +
            "<br>\"step\":\"2\"," +
            "<br>\"record\":[" +
            "<br>\"charID\":0," +
            "<br>\"xcolumn\":\"solddate\"," +
            "<br>\"ycolumn\":\"SUM(quantity)\"" +
            "]" +
            "<br>\"previous\":37" +
            "}" +
            "<br>返回参数示例：<br>38",
            required = true, paramType = "body", dataType = "String")
    public ResponseEntity<Integer> SaveHistory(@RequestBody JSONObject filters) throws SQLException {
        JSONObject obj = JSONObject.fromObject(filters);
        String tablename = obj.getString("tablename");
        Integer userid = obj.getInt("userid");
        Integer step = obj.getInt("step");
        JSONArray jorecord = obj.getJSONArray("record");
        String record = jorecord.toString().replace("\"", "\\\"");
        Integer previous = obj.getInt("previous");
        Integer dataset_id = null;
        System.out.println("POST /hive/savehistory ============ step="+step.toString());
        System.out.println("POST /hive/savehistory ============ record="+jorecord.toString());

        Integer rowcount = 0;
        Connection conn = null;
        Statement stmt = null;
        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
        String user = "root";
        String pass = "root";
        String sql = "";
        if (step==1) {
            rowcount = getRowcount(jorecord);
        }
        else if (previous!=-1) {
            Connection conn1 = DriverManager.getConnection(url, user, pass);
            Statement stmt1 = conn1.createStatement();
            sql = "SELECT row_count FROM history WHERE log_id="+previous.toString();
            ResultSet rs1 = stmt1.executeQuery(sql);
            rs1.next();
            rowcount = rs1.getInt("row_count");
        }
        else {
            rowcount = -1;
        }

        try {
            Class.forName("com.mysql.jdbc.Driver");
//                System.out.println();
            conn = DriverManager.getConnection(url, user, pass);
            stmt = conn.createStatement();
            sql = "SELECT dataset_id FROM sourceindex WHERE tablename=\"" + tablename + "\"";
//                sql = "SELECT dataset_id from sourceindex where tablename="+tablename;
            ResultSet rs = stmt.executeQuery(sql);
            rs.next();
            dataset_id = rs.getInt("dataset_id");
//            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//            Date curDate = new Date(System.currentTimeMillis());//获取当前时间
//            String create_time = formatter.format(curDate);

            sql = "INSERT INTO `history`(`user_id`, `dataset_id`, `step`, `record`, `previous`,`create_time`, `row_count`)" +
                    "VALUES(" + userid + "," + dataset_id + "," + step + ",\"" + record + "\"," + previous + "," + "NOW()" + "," + rowcount + ")";
            System.out.println("sql=" + sql);
            stmt.execute(sql);
            //获取当前操作节点的id，返回给前端
            sql = "SELECT log_id FROM history WHERE log_id=(SELECT MAX(log_id) FROM history)";
            rs = stmt.executeQuery(sql);
            rs.next();
            Integer log_id = rs.getInt("log_id");
            return new ResponseEntity<Integer>(log_id, HttpStatus.OK);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/getpreviousid")
    @ApiIgnore()
    public ResponseEntity<?> GetPreviousID(@RequestBody JSONObject jsid) {
        Integer id = jsid.getInt("id");
        Integer previousid = -1;
        Connection conn = null;
        Statement stmt = null;
        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
        String user = "root";
        String pass = "root";
        String sql = "";
        try {
            Class.forName("com.mysql.jdbc.Driver");
//            System.out.println();
            conn = DriverManager.getConnection(url, user, pass);
            stmt = conn.createStatement();
            sql = "SELECT previous FROM history WHERE log_id = " + id.toString();
            ResultSet rs = stmt.executeQuery(sql);
            rs.next();
            previousid = rs.getInt("previous");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ResponseEntity<Integer>(previousid, HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/getRecentOperation")
    @ApiOperation("/根据数据表名和条目数获取指定数目的最近日志")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "recent",value = "日志数目",required = true,dataType = "int",paramType = "form"),
            @ApiImplicitParam(name = "tableName",value = "表名",required = true,dataType = "String",paramType = "form")
    })
    public ResponseEntity<?> GetRecentHistory1(int recent, String tableName) {
        JSONObject params = new JSONObject();
        params.put("recent",recent);
        params.put("tablename",tableName);
        return GetRecentHistory(params);
    }




    @CrossOrigin(origins = "*")
    @PostMapping("/hive/getrecenthistory")
    @ApiIgnore
    @ApiOperation("/根据数据表名和条目数获取指定数目的最近日志")
    @ApiImplicitParam(name = "jsonData", value = "请求参数说明：<br>{\"recent\":\"查询日志数目\",<br>\"tablename\":\"表名\"}"
            + "<br>请求参数示例：<br>{\"recent\":1,<br>\"tablename\":\"websales_home_myshop_10000\"}"
            + "<br>返回参数示例：<br>[{"
            + "\"log_id\": 36,"
            + "<br>\"user_id\":1"
            + "<br>\"tablename\":\"websales_home_myshop_10000\","
            + "<br>\"step\":2,"
            + "<br>\"record\":["
            + "<br>{\"chartId\":0},"
            + "<br>{\"xcolumn\":\"solddate\"},"
            + "<br>{\"ycolumn\":\"SUM(quantity)\"}],"
            + "<br>\"previoud\":35,"
            + "<br>\"time\":\"2021-05-25 10:15:06\""
            + "}]",
            required = true, paramType = "body", dataType = "String")
    public ResponseEntity<?> GetRecentHistory(@RequestBody JSONObject jsonObject) {
        Integer recent_history_num = jsonObject.getInt("recent");
        String tablename1 = jsonObject.getString("tablename");
        //Connection conn = null;
        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
//        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
        String user = "root";
        String pass = "root";
        String sql = "";
        JSONArray historyjson = new JSONArray();
        try {
            Class.forName("com.mysql.jdbc.Driver");
//            System.out.println();
            Connection conn = DriverManager.getConnection(url, user, pass);
            Statement stmt = conn.createStatement();
            sql = "SELECT dataset_id From sourceindex WHERE tablename=\"" + tablename1 + "\"";
            System.out.println("/hive/getrecenthistory ========== sql=" + sql);
            ResultSet rs1 = stmt.executeQuery(sql);
            Integer datasetid = -1;


            if (rs1.next()) {
                datasetid = rs1.getInt(1);
            } else {
                System.out.println("/hive/getrecenthistory ============ history not exist!");
                return new ResponseEntity<JSONArray>(historyjson, HttpStatus.OK);
            }

            for (Integer i = 1; i <= recent_history_num; ++i) {
                sql = "SELECT * \n" +
                        "FROM (\n" +
                        "        SELECT h1.*, (\n" +
                        "                SELECT\n" +
                        "                    count(*)\n" +
                        "                FROM\n" +
                        "                    history h2\n" +
                        "                WHERE\n" +
                        "                    h1.log_id <= h2.log_id\n" +
                        "                    AND h1.dataset_id=" + datasetid.toString() + "\n" +
                        "                    AND h2.dataset_id=" + datasetid.toString() + "\n" +
                        "            ) AS rownum\n" +
                        "        FROM\n" +
                        "            history h1\n" +
                        "    ) h3\n" +
                        "WHERE\n" +
                        "    rownum = " + i.toString();
                ResultSet rs = stmt.executeQuery(sql);
//                System.out.println("num = "+recent_history_num.toString());
//                Integer sum = 0;
                rs.next();
//                ++sum;
//                System.out.println(rs.getObject(8));
                Integer log_id = rs.getInt(1);
                Integer user_id = rs.getInt(2);
                Integer dataset_id = rs.getInt(3);
                Integer step = rs.getInt(4);
                String str_record = rs.getString(5);
                JSONArray record = JSONArray.fromObject(str_record);
                Integer previous = rs.getInt(6);
//                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String time = rs.getString(7);
//                System.out.println(log_id.toString());
//                System.out.println(user_id.toString());
//                System.out.println(dataset_id.toString());
//                System.out.println(step.toString());
//                System.out.println(str_record+' '+record.toString()+' '+previous.toString());

                sql = "SELECT tablename FROM sourceindex WHERE dataset_id=" + dataset_id;
                rs = stmt.executeQuery(sql);
                rs.next();
                String tablename = rs.getString("tablename");
                JSONObject jobj = new JSONObject();
                jobj.put("log_id", log_id);
                jobj.put("user_id", user_id);
                jobj.put("tablename", tablename);
                jobj.put("step", step);
                jobj.put("record", record);
                jobj.put("previous", previous);
                jobj.put("time", time);
                historyjson.add(jobj);
//                System.out.println(jobj.toString());
            }
            System.out.println("GetRecentHistory =========== " + historyjson.toString());

//            System.out.println("step = "+sum.toString());
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ResponseEntity<JSONArray>(historyjson, HttpStatus.OK);
    }
//    public ResponseEntity<?> GetRecentHistory(@RequestBody JSONObject json) {
//        Integer userid = json.getInt("user_id");
//
//        Integer previousid = -1;
//        Connection conn = null;
//        Statement stmt = null;
//        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
//        String user = "root";
//        String pass = "root";
//        String sql = "";
//        JSONObject result = new JSONObject();
//        JSONObject jobj = new JSONObject();
//        try {
//            Class.forName("com.mysql.jdbc.Driver");
////            System.out.println();
//            conn = DriverManager.getConnection(url, user, pass);
//            stmt = conn.createStatement();
//            sql = "SELECT * FROM history WHERE user_id = " + userid.toString() + " ORDER BY log_id DESC LIMIT 3";
//            System.out.println("POST /data/getrecenthistory =========== sql="+sql);
////            Integer sum=0;
//            ResultSet rs = stmt.executeQuery(sql);
//            rs.next();
//            Integer dataset_id = rs.getInt(3);
//            String sql1 = "SELECT tablename FROM sourceindex WHERE dataset_id=" + dataset_id;
//            ResultSet rs1 = stmt.executeQuery(sql1);
//            rs1.next();
//            String tablename = rs1.getString("tablename");
//            result.put("name",tablename);
//            result.put("deal",2);
//            rs = stmt.executeQuery(sql);
////            while (rs.next()) sum++;
////            System.out.println("sum="+sum);
//            boolean ispreroot = false;
//            ArrayList<String> names = new ArrayList<>();
//            while (rs.next() && !ispreroot) {
////                rs.next();
//                Integer log_id = rs.getInt(1);
//                Integer user_id = rs.getInt(2);
//                dataset_id = rs.getInt(3);
//                Integer step = rs.getInt(4);
//                String str_record = rs.getString(5);
//                JSONArray record = JSONArray.fromObject(str_record);
//                Integer previous = rs.getInt(6);
//                Timestamp time = rs.getTimestamp(7);
//                String name = "";
//                if (step==1) {
//                    for (int i=0;i<record.size();i++) {
//                        if (!record.getJSONObject(i).getJSONArray("data").isEmpty())
//                            name=name+record.getJSONObject(i).getString("columnname")+":"+record.getJSONObject(i).getJSONArray("data").toString()+" ";
//                    }
//                }
//                else if (step==2) {
//                    name = name+"xcolumn,ycolumn:"+record.getJSONObject(1).getString("xcolumn")+","+record.getJSONObject(2).getString("ycolumn");
//                }
//                else { name = name + record.toString(); }
//                names.add(name);
//
//                if (previous == -1) ispreroot = true;
//            }
//            System.out.println(names.size());
//            JSONArray jsonArray = new JSONArray();
//            for (int i=0;i<names.size();i++) {
//                JSONObject jsonObject = new JSONObject();
//                jsonObject.put("name",names.get(i));
//                jsonObject.put("deal",2);
//                if (i!=0) {
//                    jsonObject.put("children",jsonArray);
//                }
//                jsonArray = new JSONArray();
//                jsonArray.add(jsonObject);
//            }
//            result.put("children", jsonArray);
//            System.out.println(result.toString());
//            return new ResponseEntity<JSONObject>(result, HttpStatus.OK);
//        }catch (Exception e) {
//            e.printStackTrace();
//        }
//        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
//    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/gethistorybyid")
    @ApiIgnore()
    public ResponseEntity<?> GetHistoryByID(@RequestBody JSONObject jsid) {
        Integer id = jsid.getInt("id");

        Integer previousid = -1;
        Connection conn = null;
        Statement stmt = null;
        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
        String user = "root";
        String pass = "root";
        String sql = "";
        JSONObject jobj = new JSONObject();
        try {
            Class.forName("com.mysql.jdbc.Driver");
//            System.out.println();
            conn = DriverManager.getConnection(url, user, pass);
            stmt = conn.createStatement();
            sql = "SELECT * FROM history WHERE log_id = " + id.toString();
            ResultSet rs = stmt.executeQuery(sql);
            rs.next();
            Integer log_id = rs.getInt(1);
            Integer user_id = rs.getInt(2);
            Integer dataset_id = rs.getInt(3);
            Integer step = rs.getInt(4);
            String str_record = rs.getString(5);
            JSONArray record = JSONArray.fromObject(str_record);
            Integer previous = rs.getInt(6);
            Timestamp time = rs.getTimestamp(7);
//                System.out.println(log_id.toString());
//                System.out.println(user_id.toString());
//                System.out.println(dataset_id.toString());
//                System.out.println(step.toString());
//                System.out.println(str_record+' '+record.toString()+' '+previous.toString());

            sql = "SELECT tablename FROM sourceindex WHERE dataset_id=" + dataset_id;
            rs = stmt.executeQuery(sql);
            rs.next();
            String tablename = rs.getString("tablename");

            jobj.put("log_id", log_id);
            jobj.put("user_id", user_id);
            jobj.put("tablename", tablename);
            jobj.put("step", step);
            jobj.put("record", record);
            jobj.put("previous", previous);
            jobj.put("time", time);
//            historyjson.add(jobj);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return new ResponseEntity<JSONObject>(jobj, HttpStatus.OK);
    }

    /***********************************************************************************
     *** Hive data APIs ***
     ***********************************************************************************/

    /**
     * * Still use Hivesql as 'numRows' property can be directly retrieved from mysql metastore
     */
    @CrossOrigin(origins = "*")
    @PostMapping("/hive/rowcount")
    @ApiIgnore()
    public ResponseEntity<?> GetRowCount(@RequestBody String jsonData) throws ClassNotFoundException {
        System.out.printf("POST /hive/rowcount =========== parameter=%s%n", jsonData);
        JSONObject obj = JSONObject.fromObject(jsonData);
        String sql = "SELECT COUNT(*) AS rowcount FROM " + obj.getString("tablename");

        System.out.printf("POST /hive/rowcount =========== sql=%s%n", sql);
        try {
//            PreparedStatement ps = conn.prepareStatement(sql);
//            long start = System.currentTimeMillis();
//            System.out.println("POST /hive/rowcount =========== execution time for sql: " + (System.currentTimeMillis() - start) + "ms");
            JSONArray rs = sparkService.executesql(sql, false);
            Integer total = rs.getJSONObject(1).getInt("1");
//            start = System.currentTimeMillis();
//            System.out.println("POST /hive/rowcount =========== execution time for traverse: " + (System.currentTimeMillis() - start) + "ms");
//            rs.close();
            JSONObject returnData = new JSONObject();
            returnData.put("total", total);
            return new ResponseEntity<JSONObject>(returnData, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @CrossOrigin(origins = "*")
    @PostMapping("/data/getsumbydate")
    @ApiIgnore()
    public ResponseEntity<?> GetSumByDate(@RequestBody String jsonData) throws SQLException {
        JSONObject jsonObject = JSONObject.fromObject(jsonData);
        String tablename = jsonObject.getString("tablename");
        String date1 = jsonObject.getString("date1");
        String date2 = jsonObject.getString("date2");
        String date2_plus_oneday = date2;
        String scale = jsonObject.getString("scale");
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

        String sql = "";
        JSONArray result = new JSONArray();
        JSONObject returnData = new JSONObject();
        try {
            if(sdf.parse(date1).after(sdf.parse(date2)))
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            date2_plus_oneday=sdf.format(util.dateadd(sdf.parse(date2),"day"));
        } catch (ParseException e) { e.printStackTrace(); }

        try {
            Date now = new Date();
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.SECOND, -1000*24*3600);
            String right = sdf.format(now);
            String left = sdf.format(calendar.getTime()); // left为当前日期之前1000天的日期, 与前端匹配

            if (is_getsum_calculated && date1.equals(left) && date2.equals(right) && date1.equals(saved_date1) && date2.equals(saved_date2)) {
                if (tablename.equals(TABLE) && !caldata_shop1.isEmpty()) {
                    System.out.println("POST /data/getsumbydate ============= use cache");
                    returnData.put("data", caldata_myshop.getJSONArray(scale));
                    return new ResponseEntity<JSONObject>(caldata_shop1, HttpStatus.OK);
                }
                else if (tablename.equals(TABLE) && !caldata_myshop.isEmpty()) {
                    System.out.println("POST /data/getsumbydate ============= use cache");
                    returnData.put("data", caldata_myshop.getJSONArray(scale));
                    return new ResponseEntity<JSONObject>(caldata_myshop, HttpStatus.OK);
                }
            }
            else if (is_getsum_calculated && date1.equals(left) && date2.equals(right)) {
                is_getsum_calculated = false;
                caldata_shop1 = new JSONObject();
                caldata_myshop = new JSONObject();
            }

            // 根据scale拼装sql
            String time_func = "";
            switch (scale){
                case "day":
                    time_func = "day(solddate)";
                    break;
                case "hour":
                    time_func = "hour(solddate)";
                    break;
                case "week":
                    time_func = "weekofyear(solddate)";
                    break;
                case "month":
                    time_func = "month(solddate)";
                    break;
                case "year":
                    time_func = "year(solddate)";
                    break;
                default:
                    System.out.println("POST /data/getsumbydate ============= wrong scale type! only interval or exact accepted!");
                    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            sql = String.format("SELECT  %1$s, sum(price), sum(price*quantity) FROM %2$s WHERE solddate BETWEEN '%3$s' AND '%4$s' GROUP BY %1$s ORDER BY %1$s ASC"
                    , time_func, tablename, date1, date2_plus_oneday);
            System.out.println("POST /data/getsumbydate ============= sql = "+sql);

            result = sparkService.executesqlForSum(sql, sdf.parse(date1), scale);

            if(result.size() == 0)
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            else {
                returnData.put("data", result);
                // cache
                is_getsum_calculated = true;
                saved_date1 = date1;
                saved_date2 = date2;
                caldata_myshop.put(scale, result);
            }

            System.out.println("POST /data/getsumbydate ============= result=" + result.toString());
            return new ResponseEntity<JSONObject>(returnData, HttpStatus.OK);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @CrossOrigin(origins = "*")
    @PostMapping("/hive/executesql")
    @ApiIgnore()
    public ResponseEntity<?> ExecuteSQL(@RequestBody JSONObject json) {
        String sql = json.getString("sql");
        boolean fromcube = json.getBoolean("fromcube");
        if (fromcube) {
            String[] sqlarray = sql.split(" ");
            sql = "";
            for (Integer i=0;i<sqlarray.length;i++) {
                if (i>0 && (sqlarray[i-1].equals("from") || sqlarray[i-1].equals("FROM"))) {
                    sql+=sqlarray[i]+"_10 ";
                }
                else {
                    sql+=sqlarray[i]+" ";
                }
            }
            System.out.printf("POST /hive/executesql =========== sql=%s%n", sql);
            JSONObject sendmess = new JSONObject();
            sendmess.put("sql", sql);
            sendmess.put("project", "bigbench");
            String rs1 = Http.sendPost("http://" + IP +":7070/kylin/api/query", sendmess.toString());
            try {
                System.out.println(rs1);
                JSONObject jsonObject = JSONObject.fromObject(rs1);
                jsonObject = util.fixjson(jsonObject);
                System.out.println(jsonObject);
                return new ResponseEntity<JSONObject>(jsonObject, HttpStatus.OK);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
        else {
            try {
                String[] sqlarray = sql.split(" ");
                sql = "";
                for (Integer i=0;i<sqlarray.length;i++) {
                    if (i>0 && (sqlarray[i-1].equals("from") || sqlarray[i-1].equals("FROM"))) {
                        sql+=DATABASE+"."+sqlarray[i]+" ";
                    }
                    else {
                        sql+=sqlarray[i]+" ";
                    }
                }
                System.out.printf("POST /hive/executesql =========== sql=%s%n", sql);
                JSONArray result = spark.executeSQL1(sql);
                JSONObject returnData = new JSONObject();
    //            returnData.put("fds",null);
                returnData.put("data", result);
                return new ResponseEntity<JSONObject>(returnData, HttpStatus.OK);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        }
//
    }
//
    @CrossOrigin(origins = "*")
    @PostMapping("/hive/gettableschema")
    @ApiIgnore()
    public ResponseEntity<?> GetTableSchema(@RequestBody String tablename) throws SQLException {
        System.out.printf("POST /hive/gettableschema =========== tablename=%s%n", tablename);
        try {
            String sql = "DESC "+DATABASE+"."+tablename;
            ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            JSONObject returnData = new JSONObject();
//            int size = 0;
//          ArrayList<ArrayList<String>> collection = new ArrayList<ArrayList<String>>();
//            List<JSONObject> rows = new ArrayList<JSONObject>();
            int columns = rs.getMetaData().getColumnCount();

//            start = System.currentTimeMillis();
            while (rs.next()) {
//                ArrayList<String> arr = new ArrayList<String>();
//                JSONObject row = new JSONObject();
//                System.out.println(returnData.toString());
//                if (!rs. && rs.getString(1).charAt(0)!='#')
                returnData.put(rs.getString(1), rs.getString(2));
//                rows.add(row);
                //collection.add(arr);
            }
            Iterator<String> keys = returnData.keys();
            Set<String> removekeys = new HashSet<>();
            while (keys.hasNext()) {
                String key = keys.next();
                if (key.charAt(0)=='#') {
                    removekeys.add(key);
                }
            }
            Iterator<String> it = removekeys.iterator();
            while (it.hasNext()) {
                String key = it.next();
                returnData.remove(key);
            }
//            returnData.put("rowcount", size);
//            returnData.put("data", rows);
//            System.out.println("POST /hive/getdata =========== execution time for traverse: " + (System.currentTimeMillis() - start) + "ms");
            System.out.println("POST /hive/gettableschema =========== schema="+returnData.toString());
            return new ResponseEntity<JSONObject>(returnData, HttpStatus.OK);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
//
    @CrossOrigin(origins = "*")
    @PostMapping("/hive/getdata")
    @ApiIgnore()
    public ResponseEntity<?> GetTableData(@RequestBody String jsonData) throws ClassNotFoundException, SQLException {
        System.out.printf("POST /hive/getdata =========== parameter=%s%n", jsonData);
        JSONObject obj = JSONObject.fromObject(jsonData);
        int page = obj.getInt("page");
        String sql = "SELECT " + obj.getString("tablename") + ".* FROM " + obj.getString("tablename");

        JSONArray filters = obj.getJSONArray("filters");
        if (!filters.isEmpty()) {
            String[] sWhere = new String[filters.size()];
            for (int i = 0; i < filters.size(); i++) {
                sWhere[i]="";
                JSONObject obj1 = (JSONObject) filters.get(i);

                if (obj1.getInt("type") == Types.BIGINT || obj1.getInt("type") == Types.INTEGER
                        || obj1.getInt("type")==Types.FLOAT || obj1.getInt("type")==Types.DOUBLE
                        ) {
//                    数值型数据区间
                    sWhere[i] += obj1.getString("columnname") + ">=" + obj1.getJSONArray("data").get(0) +
                            " AND " + obj1.getString("columnname") + "<=" + obj1.getJSONArray("data").get(1);
                } else if (obj1.getInt("type")==Types.TIMESTAMP) {
//                    时间区间
                    sWhere[i] += obj1.getString("columnname") + " BETWEEN \'" + obj1.getJSONArray("data").get(0) +
                            "\' AND \'" + obj1.getJSONArray("data").get(1) + "\'";
                } else if (obj1.getInt("type") == Types.VARCHAR) {
//                    字符串型数据
                    JSONArray arr = obj1.getJSONArray("data");
                    //sWhere[i] = "";
//                    sWhere[i] += "(";
                    for (int j = 0; j < arr.size(); j++) {
                        sWhere[i] += obj1.getString("columnname") + " LIKE '%" + arr.get(j) + "%'";
                        if (j != arr.size() - 1) sWhere[i] += " OR ";
                    }
//                    sWhere[i] += ")";
                }
                System.out.printf("POST /hive/getdata =========== WHERE clause%d=%s%n", i, sWhere[i]);
            }

            sql += " WHERE ";
            for (int i = 0; i < filters.size(); i++) {
//                System.out.println(sWhere[i]);
                sql += "("+sWhere[i]+")";
                if (i != filters.size() - 1) sql += " AND ";
            }
        }
        sql += " LIMIT " + page * 20;
        System.out.printf("POST /hive/getdata =========== sql=%s, page=%d%n", sql, page);
        try {
            long start = System.currentTimeMillis();
//            PreparedStatement ps = HiveConfig.prepare(conn, sql);
            JSONArray rs = sparkService.executesql(sql, false);
            System.out.println("POST /hive/getdata =========== execution time for sql: " + (System.currentTimeMillis() - start) + "ms");

            JSONObject returnData = new JSONObject();
            // Cusor to the position of current page.
            Integer begin = 1;
            if (page > 1) {
                int num = (page - 1) * 20;
                while ((num--) > 0) {
                    begin++;
                }
            }
            int size = 0;
            ArrayList<ArrayList<String>> collection = new ArrayList<ArrayList<String>>();
            List<JSONObject> rows = new ArrayList<JSONObject>();
            int columns = rs.getJSONObject(0).size();
            ArrayList<String> columnnames = new ArrayList<String>();
            Iterator<String> itr = rs.getJSONObject(0).keys();
            Integer x = 0;
            while (x<rs.getJSONObject(0).size() && itr.hasNext()) {
//                columnTypes.add(rs.getMetaData().getColumnType(i));
                String column = itr.next();
                columnnames.add(column);
                x++;
            }

            start = System.currentTimeMillis();
            for (int j=begin; j<begin+20 && j<rs.size(); j++) {
                size++;
                ArrayList<String> arr = new ArrayList<String>();
                JSONObject row = new JSONObject();
                for (Integer i = 1; i <= columns; i++) {
                    //arr.add(rs.getString(i));
                    if (columnnames.get(i-1).contains("date")) {
                        Timestamp time = new Timestamp(rs.getJSONObject(j).getJSONObject(i.toString()).getLong("time"));
                        DateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                        row.put(columnnames.get(i-1), sdf.format(time));
                    }
                    else {
                        row.put(columnnames.get(i - 1), rs.getJSONObject(j).get(i.toString()).toString());
                    }
                }
                rows.add(row);
                //collection.add(arr);
            }

            returnData.put("data", rows);
            System.out.println("POST /hive/getdata =========== execution time for traverse: " + (System.currentTimeMillis() - start) + "ms");

            return new ResponseEntity<JSONObject>(returnData, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/onlinedist")
    @ApiIgnore()
    public ResponseEntity<?> GetOnlineDistribution(@RequestBody String jsonData) {
        return new ResponseEntity<JSONArray>(GetAllDataDistributions(JSONArray.fromObject(jsonData)), HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/onlinedist1")
    @ApiIgnore()
    public ResponseEntity<?> GetOnlineDistributionOneByOne(@RequestBody String jsonData){
        return new ResponseEntity<JSONArray>(GetDataDistribution(JSONObject.fromObject(jsonData)), HttpStatus.OK);
    }


    @CrossOrigin(origins = "*")
    @PostMapping("/data/getSqlResult")
    @ApiIgnore()
    public ResponseEntity<?> GetSqlResult(@RequestBody String jsonData){
        // return new ResponseEntity<JSONArray>()
        // 解析json
        JSONObject obj = JSONObject.fromObject(jsonData);
        System.out.printf("POST /data/getSqlResult =========== sql =%s%n", obj.getString("sql"));
        String dbname = obj.getString("dbname");
        dbname = dbname.replace('\u00A0',' ').trim();
        System.out.println("POST /data/getSqlResult =========== dbname:" + dbname);
        String sql = obj.getString("sql");
        sql = sql.replace('\u00A0', ' ').trim();
        System.out.println("POST /data/getSqlResult ========== sql formatted = " + sql);

        if(dbname.compareTo("tpch1")==0){
            // sql mapping: raw sql -> kylin sql
            System.out.println("POST /data/getSqlResult ========== sql mapping - origin: " + sql);
            sql = util.parseSqlMapping(sql);
            System.out.println("POST /data/getSqlResult ========== sql mapping - new: " + sql);
        }

        JSONObject result = new JSONObject();
        try{
            result = kylinService.getSqlResult(sql, dbname);
        }catch (Exception e){
            System.out.println("Controller GetSqlResult ========== Exception");
            e.printStackTrace();
            result= sparkService.getSqlResult(sql);
        }
        return new ResponseEntity<JSONObject>(result, HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/range")
    @ApiIgnore()
    @ApiOperation("/根据数据库名、表名、列名获取推荐列、推荐范围、具体数据")
    @ApiImplicitParam(name = "jsonData", value = "请求参数说明：<br>{\"dbname\":\"数据库名\",<br>\"tablename\":\"表名\",<br>\"columnname\":\"列名\"}"
            + "<br>请求参数示例：<br>{\"dbname\":\"bigbench_100g\",<br>\"tablename\":\"websales_home_myshop_10000\",<br>\"columnname\":\"price\"}"
            + "<br>返回参数示例：<br>{\"recommend\":"
            + "<br>[{\"columnname\": \"quantity\","
            + "<br>\"tablename\": \"websales_home_myshop_10000\","
            + "<br>\"type\": 4,"
            + "<br>\"range\": [1,99]},"
            + "<br>\"data\": [12,22]},"
            + "<br>{\"columnname\": \"solddate\","
            + "<br>\"tablename\": \"websales_home_myshop_10000\","
            + "<br>\"type\": 93,"
            + "<br>\"range\": [\"2017-01-01\",\"2021-12-31\"]},"
            + "<br>\"data\": [\"2019-11-30 00:00:00.0\",\"2021-12-31 00:00:00.0\"]}}",
            required = true, paramType = "body", dataType = "String")
    public ResponseEntity<?> RecommendColumnsAndGetRange(@RequestBody String jsonData) {
        //start time
        long start = System.currentTimeMillis();
        System.out.printf("POST /data/range =========== parameter=%s%n", jsonData);

        JSONObject obj = JSONObject.fromObject(jsonData);
        System.out.printf("POST /data/range =========== tablename=%s%n", obj.getString("tablename"));
        /*
        *********************************************************************
            The algorithm for column recommendation
        *********************************************************************
        */
        ArrayList<String> columns = new ArrayList<String>();
        ArrayList<String> reccolumns = new ArrayList<String>();
//        String filter = null;
        String lastline = null;

//        String dbname = obj.getString("dbname");
        String dbname = DATABASE;
        if(obj.containsKey("dbname"))
            dbname = obj.getString("dbname");
        String tablename = obj.getString("tablename");
//        String columnname = obj.getString("columnname");
        String columnname = "discount";
        if(obj.containsKey("columnname"))
            columnname = obj.getString("columnname");

        System.out.printf("POST /data/range =========== dbname=%s%n", dbname);
        System.out.printf("POST /data/range =========== tablename=%s%n", tablename);
        System.out.printf("POST /data/range =========== columnname=%s%n", columnname);

        try {   // Get recommended range from python
//            String intcol = "discount";
//            if (obj.containsKey("columnname"))
//                intcol = util.znencolmap(obj.getString("columnname"));

            String[] args = new String[]{"python", SCRIPT_DIR + "single-row-chart/__init__.py", dbname, tablename, columnname};
//            String[] args = new String[]{"python", SCRIPT_DIR + "single-row-chart/__init__.py", DATABASE, obj.getString("tablename"), intcol};
//            String[] args = new String[]{"python", "/Users/frankqian/Frank/Study/Master/智能推荐/Smart_interaction_Project/smartinteract/single-row-chart/__init__.py"};
            Process proc = Runtime.getRuntime().exec(args);
            System.out.println("__init__.py succeeded");

            BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream()));
            String line = null;
            Integer rec_num = 0;
            line = in.readLine();
            System.out.println("Recommend==========line:" + line);
            while (line != null) {

                System.out.printf("Recommend ====== %s%n", line);
                if (rec_num < 2)
                    reccolumns.add(line.substring(line.indexOf(')') + 2, line.indexOf(' ', line.indexOf(')') + 2)));
                ++rec_num;
                lastline = line;
                line = in.readLine();
            }
            System.out.println("Recommend ======== lastline:" + lastline);
            columns.add(lastline.substring(lastline.indexOf('\'') + 1, lastline.indexOf('\'', lastline.indexOf('\'') + 1)));
            columns.add(lastline.substring(lastline.indexOf('\'', lastline.indexOf(','))+1, lastline.indexOf('\'', lastline.indexOf('\'', lastline.indexOf(','))+1)));

            if (columns.isEmpty()) {
                System.out.println("Recommend =========== No recommend result!");
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
//            filter = lastline;
            else {
                System.out.println("Recommend 1 ====== " + columns.get(0));
                System.out.println("Recommend 2 ====== " + columns.get(1));
                System.out.println("Recommend filter ====== " + lastline);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        /*
         *********************************************************************
         */
//        columns.add("price");
//        columns.add("solddate");
//        lastline = "[['price', [0.0, 54.582]], ['solddate', ['2005-11-12', '2005-12-13']]]";

        // get range data from mysql
        try {
            Connection conn = null;
            Statement stmt = null;
            String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true"; //估计之后得修改为全局变量
            String user = "root";
            String pass = "root";
            String sql = "";
            Connection conn1 = DriverManager.getConnection(url, user, pass);
            Statement stmt1 = conn1.createStatement();
            String rangeSQL = "SELECT * FROM rangetable WHERE tablename=\"" + obj.getString("tablename") + "\" LIMIT 1";
            ResultSet rs = stmt1.executeQuery(rangeSQL);
            if (rs.next()) { // rangetable表中存着已运算过的表对应的range分箱数据，分为10个data块，每块string长10000，超过这个规模的数据不存表
                String data = "";
                for (int _=0; _<10; _++) {
                    data = data + rs.getString("data" + String.valueOf(_ + 1));
                }
                data = data.trim();
                System.out.println("\nrange already counted! \nreturndata: "+data+"\n");
                JSONObject returndata = JSONObject.fromObject(data);
                return new ResponseEntity<JSONObject>(returndata, HttpStatus.OK);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        int pos = -1;
        pos = lastline.indexOf(']', lastline.indexOf(']') + 1) + 1;
        String[] filter = {"", ""};
        filter[0] = lastline.substring(lastline.indexOf(',') + 3, pos - 2);
        filter[1] = lastline.substring(lastline.indexOf('[', pos + 3) + 1, lastline.length() - 3);
        if (filter[1].charAt(0)==' ') {
            filter[1] = filter[1].substring(1,filter[1].length());
        }
        System.out.println(filter[0]);
        System.out.println(filter[1]);

        String sql = String.format("SELECT * FROM %s", obj.getString("tablename"));
        System.out.printf("POST /data/range =========== sql=%s%n", sql);

        // JSONObject returnData = sparkService.executesqlForRanges(sql, filter, columns, obj.getString("tablename"));
//        JSONObject returnData = kylinService.executesqlForRanges(sql, filter, columns, obj.getString("tablename"));
        JSONObject returnData = kylinService.executesqlForRanges(dbname, sql, filter, columns, obj.getString("tablename"));

        System.out.println("POST /data/range =========== spark sql finished");

        //Calculate all the column distributions under the filtering condition.
        JSONArray distr = GetAllDataDistributions(returnData.getJSONArray("recommend"));
        returnData.put("distribution", distr);

        try {
            // insert range data into mysql if length < 10*10000
            if (returnData.toString().length() < 10*10000) {
                Connection conn = null;
                Statement stmt = null;
                String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
                String user = "root";
                String pass = "root";
                Connection conn1 = DriverManager.getConnection(url, user, pass);
                Statement stmt1 = conn1.createStatement();
                sql = "SELECT id FROM rangetable WHERE tablename=\""+obj.getString("tablename")+"\"";
                ResultSet rs1 = stmt1.executeQuery(sql);
                if (!rs1.next()) { // rangetable表中没存过tablename对应的表
                    String tmpdata = returnData.toString();
                    System.out.println("length = " + tmpdata.length());
                    String[] rtdata = new String[10];
                    for (int _ = 0; _ < 10; _++) rtdata[_] = " ";
                    for (int _ = 0; _ * 10000 < tmpdata.length() && _ < 10; _++) {
                        rtdata[_] = tmpdata.substring(_ * 10000, Math.min((_ + 1) * 10000, tmpdata.length())).replace("\"", "\\\"");
                    }
                    String part1 = "";
                    String part2 = "";
                    for (int _ = 0; _ < 10; _++) {
                        part1 = part1 + ", `data" + String.valueOf(_+1) + "`";
                        part2 = part2 + ", \"" + rtdata[_] + "\"";
                    }
                    sql = "INSERT INTO `rangetable`(`tablename`" + part1 + ")" +
                            "VALUES( \"" + obj.getString("tablename") + "\"" + part2 + ")";
                    System.out.println("sql=" + sql);
                    stmt1.execute(sql);
                }
            }

            //end time
            long end = System.currentTimeMillis();
            rangeTime = (end - start)/1000;
            rangeTime_1 = (end - start)/1000;
            System.out.println("POST /data/range ============ time cost: " + rangeTime);
            rangeCount++;
            rangeCode = HttpStatus.OK.value();
            return new ResponseEntity<JSONObject>(returnData, HttpStatus.OK);
        } catch (Exception e1) {
            e1.printStackTrace();
        }

        long end = System.currentTimeMillis();
        rangeTime = (end - start)/1000;
        rangeTime_1 = (end - start)/1000;
        rangeCount++;
        rangeCode = HttpStatus.NO_CONTENT.value();
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @CrossOrigin(origins = "*")
    @PostMapping("/data/recommendColumnRange")
    @ApiOperation("/根据数据库名、表名、列名获取推荐列、推荐范围及具体数据")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "databaseName",value = "数据库名",required = true,dataType = "String",paramType = "form"),
            @ApiImplicitParam(name = "tableName",value = "表名",required = true,dataType = "String",paramType = "form"),
            @ApiImplicitParam(name = "columnName",value = "列名",required = true,dataType = "String",paramType = "form")
    })
    public ResponseEntity<?> RecommendColumnsAndGetRange1(String databaseName, String tableName, String columnName) {
        String jsonData = "{\"dbname\":\"" + databaseName + "\",\"tablename\":\"" + tableName + "\",\"columnname\":\""+ columnName +"\"}";
        System.out.printf("POST /data/columnRange =========== jsonData=%s%n", jsonData);
        return RecommendColumnsAndGetRange(jsonData);
    }

    /*
    *********************************************************************
            列推荐
            * input: dbname, tablename, columnname
            * output: column, range
    *********************************************************************
    */
    @CrossOrigin(origins = "*")
    @PostMapping("/data/columnrec")
    @ApiIgnore()
    @ApiOperation("/根据数据库名、表名、列名获取推荐列及推荐范围")
    @ApiImplicitParam(name = "jsonData", value = "请求参数说明：<br>{\"dbname\":\"数据库名\",<br>\"tablename\":\"表名\",<br>\"columnname\":\"列名\"}"
            + "<br>请求参数示例：<br>{\"dbname\":\"bigbench_100g\",<br>\"tablename\":\"websales_home_myshop_10000\",<br>\"columnname\":\"price\"}"
            + "<br>返回参数示例：<br>{\"column_recommend\":"
            + "<br>[{\"columnname\": \"quantity\","
            + "<br>\"range\": [32.0,42.0]},"
            + "<br>{\"columnname\": \"solddate\","
            + "<br>\"range\": [\"2021-11-30\",\"2021-12-31\"]}]}",
            required = true, paramType = "body", dataType = "String")
    public ResponseEntity<?> GetColumnRecommend(@RequestBody String jsonData) {
        //start time
        long start = System.currentTimeMillis();
        System.out.printf("POST /data/columnrec =========== parameter=%s%n", jsonData);

        JSONObject obj = JSONObject.fromObject(jsonData);
        String dbname = obj.getString("dbname");
        String tablename = obj.getString("tablename");
        String columnname = obj.getString("columnname");
        System.out.printf("POST /data/columnrec =========== dbname=%s%n", dbname);
        System.out.printf("POST /data/columnrec =========== tablename=%s%n", tablename);
        System.out.printf("POST /data/columnrec =========== columnname=%s%n", columnname);
        /*
        *********************************************************************
            The algorithm for column recommendation
        *********************************************************************
        */

        JSONObject result = new JSONObject();
        JSONObject columnrec = new JSONObject();
        JSONArray resultArray = new JSONArray();
        String line = null;
        String lastline = null;
        try {   // Get recommended range from python
            String[] args = new String[]{"python2", SCRIPT_DIR + "single-row-chart/__init__.py", dbname, tablename, columnname};
            // execute
            Process proc = Runtime.getRuntime().exec(args);
            System.out.println("__init__.py succeeded");
            // get the output line
            BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream()));
            // parse
            while ((line = in.readLine()) != null) {
                System.out.printf("Recommend ====== %s%n", line);
                if (line.equals("{}")){
                    break;
                }
                lastline = line;
            }

            in.close();
            proc.waitFor();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        //        lastline = "[['price', [0.0, 54.582]], ['solddate', ['2005-11-12', '2005-12-13']]]";
        String[] cname = {"", ""};
        cname[0] = lastline.substring(lastline.indexOf('\'') + 1, lastline.indexOf('\'', lastline.indexOf('\'') + 1));
        cname[1] = lastline.substring(lastline.indexOf('\'', lastline.indexOf(','))+1, lastline.indexOf('\'', lastline.indexOf('\'', lastline.indexOf(','))+1));

        int pos = -1;
        pos = lastline.indexOf(']', lastline.indexOf(']') + 1) + 1;
        String[] filter = {"", ""};
        filter[0] = lastline.substring(lastline.indexOf(',') + 2, pos - 1);
        filter[1] = lastline.substring(lastline.indexOf('[', pos + 3) , lastline.length() - 2);
        if (filter[1].charAt(0)==' ') {
            filter[1] = filter[1].substring(1,filter[1].length());
        }
        System.out.printf("POST /data/columnrec =========== filter1=%s%n", filter[0]);
        System.out.printf("POST /data/columnrec =========== filter2=%s%n", filter[1]);

        for(int i = 0;i<2;i++){
            result.put("columnname", cname[i]);
            result.put("range", filter[i]);
            resultArray.add(result);
        }
        columnrec.put("column_recommend", resultArray);

        // endtime
        long end = System.currentTimeMillis();
        rangeTime = (end - start)/1000;
        rangeTime_1 = (end - start)/1000;
        rangeCount++;
        rangeCode = HttpStatus.NO_CONTENT.value();
        return new ResponseEntity<>(columnrec, HttpStatus.OK);
    }


    @CrossOrigin(origins = "*")
    @PostMapping("/data/recommendColumn")
    @ApiOperation("/根据数据库名、表名、列名获取推荐列及推荐范围")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "databaseName",value = "数据库名",required = true,dataType = "String",paramType = "form"),
            @ApiImplicitParam(name = "tableName",value = "表名",required = true,dataType = "String",paramType = "form"),
            @ApiImplicitParam(name = "columnName",value = "列名",required = true,dataType = "String",paramType = "form")
    })
    public ResponseEntity<?> GetColumnRecommend1(String databaseName, String tableName, String columnName) {
        String jsonData = "{\"dbname\":\"" + databaseName + "\",\"tablename\":\"" + tableName + "\",\"columnname\":\""+ columnName +"\"}";
        System.out.printf("POST /data/recommendColumn =========== jsonData=%s%n", jsonData);
        return GetColumnRecommend(jsonData);
    }


    /* 尝试使用@RequestBody将传参jsondata解析到实体类 */
//    @CrossOrigin(origins = "*")
//    @PostMapping("/data/columnrec")
//    @ApiOperation("/根据数据库名、表名、列名获取推荐列及推荐范围")
//    @ApiImplicitParam(name = "jsonData", value = "json格式", required = true, paramType = "body", dataType = "columnrec")
//     public ResponseEntity<List<columnrecReturn>> GetColumnRecommend(@RequestBody columnrec jsonData) {
//        //start time
//        long start = System.currentTimeMillis();
//        System.out.printf("POST /data/columnrec =========== parameter=%s%n", jsonData);
//
////        JSONObject obj = JSONObject.fromObject(jsonData);
//
////        String dbname = obj.getString("dbname");
////        String tablename = obj.getString("tablename");
////        String columnname = obj.getString("columnname");
//        String dbname = jsonData.getDbname();
//        String tablename = jsonData.getTablename();
//        String columnname = jsonData.getColumnname();
//
//        System.out.printf("POST /data/columnrec =========== dbname=%s%n", dbname);
//        System.out.printf("POST /data/columnrec =========== tablename=%s%n", tablename);
//        System.out.printf("POST /data/columnrec =========== columnname=%s%n", columnname);
//        /*
//        *********************************************************************
//            The algorithm for column recommendation
//        *********************************************************************
//        */
//
//        JSONObject result = new JSONObject();
//        JSONObject columnrec = new JSONObject();
//        JSONArray resultArray = new JSONArray();
//        String line = null;
//        String lastline = null;
//        try {   // Get recommended range from python
//            String[] args = new String[]{"python2", SCRIPT_DIR + "single-row-chart/__init__.py", dbname, tablename, columnname};
//            // execute
//            Process proc = Runtime.getRuntime().exec(args);
//            System.out.println("__init__.py succeeded");
//            // get the output line
//            BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream()));
//            // parse
//            while ((line = in.readLine()) != null) {
//                System.out.printf("Recommend ====== %s%n", line);
//                if (line.equals("{}")){
//                    break;
//                }
//                lastline = line;
//            }
//
//            in.close();
//            proc.waitFor();
//        } catch (IOException e) {
//            e.printStackTrace();
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
//
//        //        lastline = "[['price', [0.0, 54.582]], ['solddate', ['2005-11-12', '2005-12-13']]]";
//        String[] cname = {"", ""};
//        cname[0] = lastline.substring(lastline.indexOf('\'') + 1, lastline.indexOf('\'', lastline.indexOf('\'') + 1));
//        cname[1] = lastline.substring(lastline.indexOf('\'', lastline.indexOf(','))+1, lastline.indexOf('\'', lastline.indexOf('\'', lastline.indexOf(','))+1));
//
//        int pos = -1;
//        pos = lastline.indexOf(']', lastline.indexOf(']') + 1) + 1;
//        String[] filter = {"", ""};
//        filter[0] = lastline.substring(lastline.indexOf(',') + 2, pos - 1);
//        filter[1] = lastline.substring(lastline.indexOf('[', pos + 3) , lastline.length() - 2);
//        if (filter[1].charAt(0)==' ') {
//            filter[1] = filter[1].substring(1,filter[1].length());
//        }
//        System.out.printf("POST /data/columnrec =========== filter1=%s%n", filter[0]);
//        System.out.printf("POST /data/columnrec =========== filter2=%s%n", filter[1]);
//
////        columnrecReturn[] resultR = new columnrecReturn[2];
//        List<columnrecReturn> resultR = new ArrayList<>();
//
//        for(int i = 0;i<2;i++){
//            resultR.add(new columnrecReturn(cname[i],filter[i]));
////            resultR[i].setColumnname(cname[i]);
////            resultR[i].setRange(filter[i]);
//        }
//        for(int i = 0;i<2;i++){
////            System.out.printf("POST /data/columnrec =========== result=%s%n", resultR[i].toString());
//            System.out.printf("POST /data/columnrec =========== result=%s%n", resultR.get(i).toString());
//        }
//
////        for(int i = 0;i<2;i++){
////            result.put("columnname", cname[i]);
////            result.put("range", filter[i]);
////            resultArray.add(result);
////        }
////        columnrec.put("column_recommend", resultArray);
//
//        // endtime
//        long end = System.currentTimeMillis();
//        rangeTime = (end - start)/1000;
//        rangeTime_1 = (end - start)/1000;
//        rangeCount++;
//        rangeCode = HttpStatus.NO_CONTENT.value();
////        return new ResponseEntity<>(columnrec, HttpStatus.OK);
//        return new ResponseEntity(resultR, HttpStatus.OK);
//    }



    /***
     * @params <code>jsonData</code> format:
     ** {
     **    "tablename": "websales2005_season1",
     **     "columnSelected": ["", ""],
     **     "columnBanned": ["", ""]
     ** }
     * @return jsonArray format:
     ** {[
     **     {"xcolumn": "",
     *       "ycolumn": "",
     *       "classify": [],
     *       "cType": "",
     *       "xdata": [],
     *       "ydata": []},
     *      {},
     *      ...
     ** }]
     */
    @CrossOrigin(origins = "*")
    @PostMapping("/rec/vis")
    @ApiIgnore()
    public ResponseEntity<?> getVisualizationRecommendations(@RequestBody String jsonData) {
        System.out.printf("POST /data/deepeye =========== jsonData=%s%n", jsonData);
        System.out.println("Saving Data As History =========");
//          SaveFilterAsHistory(JSONArray.fromObject(jsonData));A
        JSONArray filter = JSONArray.fromObject(jsonData);
        JSONArray deepeye = new JSONArray();
        int size = filter.size();

        String tablename = filter.getJSONObject(0).getString("tablename");
        int columnNum = 4;
        String columnNames = "price category solddate quantity";
        String columnTypes = "double varchar date int";
        try {
            String args = String.format("python /deepeye1/partial_order_kylin.py %s %d %s %s", tablename, columnNum, columnNames, columnTypes);
            System.out.printf("args =========== %s%n", args);
            Process proc = Runtime.getRuntime().exec(args);
            BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream()));
            String line = null;
            int order = 0;
            while ((line = in.readLine()) != null && order < 4) {
                System.out.printf("======%s", line);
                JSONObject temp = JSONObject.fromObject(line);
                if (temp.getString("classify") == "scatter") {
                } else {
                    deepeye.add(temp);
                    order++;
                }
                System.out.println(deepeye);
            }
            in.close();
            proc.waitFor();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        JSONObject obj = new JSONObject();
        JSONObject result = new JSONObject();
        JSONArray resultArray = new JSONArray();
        for (int i = 0; i < deepeye.size(); i++) {
            obj = deepeye.getJSONObject(i);
            result.put("xcolumn", obj.getString("x_name"));
            result.put("ycolumn", obj.getString("y_name"));
            result.put("cType", obj.getString("chart"));
            result.put("classify", obj.get("classify"));
            result.put("xdata", obj.get("x_data"));
            result.put("ydata", obj.get("y_data"));
            resultArray.add(result);
        }
        return new ResponseEntity<JSONArray>(resultArray, HttpStatus.OK);
    }

    /*
    *********************************************************************
            可视化推荐
            * input: database, columnname, tablename, type, data
            * output: xcolumn, ycolumn, cType, classify, xdata, ydata
    *********************************************************************
    */
    @CrossOrigin(origins = "*")
    @ApiIgnore()
    @PostMapping("/data/deepeye")
    @ApiOperation("/可视化推荐")
    @ApiImplicitParam(name = "jsonData", value = "请求参数说明：<br>[{\"database\":\"数据库名\",<br>\"columnname\":\"列名\"}," +
            "<br>{\"tablename\":\"表名\",<br>\"columnname\":\"列名\",<br>\"type\":\"字段类型\",<br>\"data\":\"列的filter条件\"}]"
            + "<br>请求参数示例：<br>[{\"database\":\"bigbench_10t_sample\",<br>\"columnname\":\"销售量\"}," +
            "<br>{\"tablename\":\"websales_home_myshop_10000\",<br>\"columnname\":\"quantity\",<br>\"type\":\"4\",<br>\"data\":[12,29]}]"
            + "<br>返回参数示例：<br>[{\"xcolumn\":\"gender\","
            + "<br>\"ycolumn\": \"SUM(quantity)\","
            + "<br>\"cType\": \"pie\","
            + "<br>\"classify\": [],"
            + "<br>\"xdata\":[\"女\",\"未设置\",\"男\"],"
            + "<br>\"ydata\": [1408,1612,1444]}]", required = true, paramType = "body", dataType = "String")
    public ResponseEntity<?> GetDeepeyeRecommednation(@RequestBody String jsonData) {
        //start time
        long start = System.currentTimeMillis();
        System.out.printf("POST /data/deepeye =========== jsonData=%s%n", jsonData);
        System.out.println("Saving Data As History =========");
//          SaveFilterAsHistory(JSONArray.fromObject(jsonData));
        JSONArray filter = JSONArray.fromObject(jsonData);
        JSONArray deepeye = new JSONArray();
        JSONArray resultArray = new JSONArray();
        int size = filter.size();

        String column_selected = util.znencolmap(filter.getJSONObject(0).getString("columnname"));
        System.out.println("POST /data/deepeye =========== column_selected:"+column_selected);
        String database_name = DATABASE;
        if(filter.getJSONObject(0).containsKey("databasename")) {
            database_name = filter.getJSONObject(0).getString("databasename");
        }

        if(!database_name.equals(DATABASE)){
            column_selected =  filter.getJSONObject(0).getString("columnname");
            System.out.println("POST /data/deepeye =========== column_selected:"+column_selected);
        }
//
        String tablename = filter.getJSONObject(1).getString("tablename");
        tablename = database_name + "." + tablename;

        int columnNum = 0;
        String columnNames = "";
        String columnTypes = "";
//
//          String columnName[] = new String[size];
//          Integer columnType[] = new Integer[size];
//        String sql = "select * from " + tablename + " where 1=1 ";
        ArrayList<String> names = new ArrayList<>();
        ArrayList<String> types = new ArrayList<>();
        String sql = "";
        for (int i = 1; i < size; i++) {
            if (filter.getJSONObject(i).getInt("type") == 12) {
                JSONArray data = filter.getJSONObject(i).getJSONArray("data");
                if (data.size() > 0) {
                    if (! filter.getJSONObject(i).getString("columnname").equals("itemdesc")) {
                        sql += "and " + filter.getJSONObject(i).getString("columnname") + "= '" + data.get(0) + "'";
                    } else {
                        sql += "and " + filter.getJSONObject(i).getString("columnname") + " like '%" + data.get(0) + "%'";
                    }
                }
                columnTypes = "varchar";
            } else if (filter.getJSONObject(i).getInt("type") == 93) {
                sql += "and " + filter.getJSONObject(i).getString("columnname") + " between '" + filter.getJSONObject(i).getJSONArray("data").get(0) + "' and '" + filter.getJSONObject(i).getJSONArray("data").get(1) + "'";
                columnTypes = "date";
            } else {
                sql += "and " + filter.getJSONObject(i).getString("columnname");
                if (filter.getJSONObject(i).getInt("type") == 8 || filter.getJSONObject(i).getInt("type") == 4) {
                    sql += "1";
                    /*
                    if(database_name.equals(DATABASE)){
                        sql += "1";
                    }*/
                }
                sql += " between '" + filter.getJSONObject(i).getJSONArray("data").get(0) + "' and '" + filter.getJSONObject(i).getJSONArray("data").get(1) + "'";

                if (filter.getJSONObject(i).getInt("type") == 8) {
                    columnTypes = "double";
                } else {
                    columnTypes = "int";
                }
            }
            if ( ! (filter.getJSONObject(i).getString("columnname").equals("itemname")
                    || filter.getJSONObject(i).getString("columnname").equals("itemdesc")
                    || filter.getJSONObject(i).getString("columnname").equals("customer"))) {
                names.add(filter.getJSONObject(i).getString("columnname"));
                types.add(columnTypes);
                columnNum += 1;
            }
        }
//        sql = '"' + sql + '"';

        try {
            String[] args1 = new String[6 + 2 * columnNum];
            args1[0] = "python";
            args1[1] = "/datahubbleViz_kylin/partial_order_kylin_where.py";
            args1[2] = tablename;
            args1[3] = ""+columnNum;
            System.out.println(args1[0] + args1[1] + args1[2] + args1[3]);
            for (int i = 4; i < args1.length - 2 - columnNum; i++) {
                args1[i] = names.get(i - 4);
                args1[i + columnNum] = types.get(i - 4);
                System.out.println(args1[i] + " " + args1[i + columnNum]);
            }
            args1[args1.length - 2] = column_selected;
            args1[args1.length - 1] = sql;
            System.out.println(args1[args1.length - 2]);
            System.out.println(args1[args1.length - 1]);
//                    {"python", "/deepeye_kylin/partial_order_kylin_where.py",
//                                tablename, ""+columnNum,
//                                "price", "discount", "quantity", "category", "solddate", " country", "nationality",
//                                "double", "double", "int","varchar","date","varchar","varchar",
//                                sql};
            Process proc = Runtime.getRuntime().exec(args1);
            BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream(), "UTF-8"));
            String line = null;
            int order = 0;
            while ((line = in.readLine()) != null ) {
                if (line.equals("{}")) {
                    break;
                }
                JSONObject temp = JSONObject.fromObject(line);
                deepeye.add(temp);
                order++;
            }
            in.close();
            proc.waitFor();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        JSONObject obj = new JSONObject();
        JSONObject result = new JSONObject();
        for (int i = 0; i < deepeye.size(); i++) {
            obj = deepeye.getJSONObject(i);
            result.put("xcolumn", obj.getString("x_name"));
            result.put("ycolumn", obj.getString("y_name"));
            result.put("cType", obj.getString("chart"));
            result.put("classify", obj.get("classify"));
            result.put("xdata", obj.get("x_data"));
            result.put("ydata", obj.get("y_data"));
            resultArray.add(result);
        }

        long end = System.currentTimeMillis();
        visRecTime = (end - start)/1000;
        visRecTime_1 = (end - start)/1000;
        visRecCount++;
        visRecCode = HttpStatus.OK.value();
        return new ResponseEntity<JSONArray>(resultArray, HttpStatus.OK);
    }

//
//    @CrossOrigin(origins = "*")
//    @PostMapping("/data/recommendViz")
//    @ApiOperation("/可视化推荐")
//    @ApiImplicitParams({
//            @ApiImplicitParam(name = "databaseName",value = "数据库名",required = true,dataType = "String",paramType = "form"),
//            @ApiImplicitParam(name = "columnName",value = "列名",required = true,dataType = "String",paramType = "form"),
//            @ApiImplicitParam(name = "rangeData",value = "各列数据选取范围列表" +
//                    "<br>{tableName: 表名," +
//                    "<br>columnName: 列名," +
//                    "<br>type: 字段类型," +
//                    "<br>data: 对应列的选取范围}",required = true,dataType = "rangeDataObject",paramType = "form")
//    })
//    public ResponseEntity<?> RecommendViz(String databaseName, String columnName, @RequestBody rangeDataObject rangeData) {
//        String jsonData = "[{\"database\":\"" + databaseName + "\",\"columnname\":\"" + columnName + "\"},";
//        System.out.printf("POST /data/recommendViz =========== rangeDataSz=ize=%d%n", rangeData.getVizList().size());
//        for(int i=0; i<rangeData.getVizList().size(); i++)
//        {
//            String tableName1 = rangeData.getVizList().get(i).get("tablename").toString();
//            String columnName1 = rangeData.getVizList().get(i).get("columnname").toString();
//            String type1 = rangeData.getVizList().get(i).get("type").toString();
//            String data1 = rangeData.getVizList().get(i).get("data").toString();
//            jsonData += "{\"tablename\":\""+ tableName1 + "\",\"columnname\":\"" + columnName1 + "\",\"type\":\"" + type1 +"\",\"data\":" + data1 + "\"}";
//            if(i!=rangeData.getVizList().size()-1){
//                jsonData += ",";
//            }
//            System.out.printf("POST /data/recommendViz =========== jsonData=%s%n", jsonData);
//        }
////        jsonData += "{\"tablename\":\""+ rangeData.getVizList().get(rangeData.getVizList().size()-1).get("tablename") + "\",\"columnname\":\"" + rangeData.getVizList().get(rangeData.getVizList().size()-1).get("columnname") + "\",\"type\":\"" + rangeData.getVizList().get(rangeData.getVizList().size()-1).get("type")+"\",\"data\":" + rangeData.getVizList().get(rangeData.getVizList().size()-1).get("data") + "\"}]";
//        jsonData += "\"}]";
//        System.out.printf("POST /data/recommendViz =========== jsonData=%s%n", jsonData);
//        return GetDeepeyeRecommednation(jsonData);
//    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/recommendViz")
    @ApiOperation("/可视化推荐")
    //@ApiImplicitParams({
    //        @ApiImplicitParam(name = "databaseName",value = "数据库名",required = true,dataType = "String",paramType = "query"),
    //        @ApiImplicitParam(name = "columnName",value = "列名",required = true,dataType = "String",paramType = "query"),
    //        @ApiImplicitParam(name = "rangeData",value = "各列数据选取范围列表" +
    //                "<br>{tableName: 表名," +
    //                "<br>columnName: 列名," +
    //                "<br>type: 字段类型," +
    //                "<br>data: 对应列的选取范围}",required = true, allowMultiple = true, dataType = "rangeData",paramType = "query")
    //})
    public ResponseEntity<?> RecommendViz(@RequestParam(value="databaseName") @ApiParam(value = "数据库名") String databaseName,@RequestParam(value="columnName") @ApiParam(value = "列名") String columnName,@RequestParam(value="range") @ApiParam(value = "各列数据选取范围列表" +
                            "<br>{tableName: 表名," +
                            "<br>columnName: 列名," +
                            "<br>type: 字段类型," +
                            "<br>data: 对应列的选取范围}") List<String> range) {
        String jsonData = "[{\"database\":\"" + databaseName + "\",\"columnname\":\"" + columnName + "\"},";
        for(int i=0; i<range.size()-1; i++)
        {
            System.out.println("POST /data/recommendViz ========== range:"+range.get(i));
            JSONObject jo = JSONObject.fromObject(range.get(i));
            jsonData += "{\"tablename\":\""+ jo.get("tableName") + "\",\"columnname\":\"" + jo.get("columnName") + "\",\"type\":\"" + jo.get("type")+"\",\"data\":" + jo.get("data") + "},";
            //jsonData += "{\"tablename\":\""+ range.get(i).getTableName() + "\",\"columnname\":\"" + range.get(i).getColumnName() + "\",\"type\":\"" + range.get(i).getType()+"\",\"data\":" + range.get(i).getData().toString() + "},";

        }
        JSONObject jn = JSONObject.fromObject(range.get(range.size()-1));
        jsonData += "{\"tablename\":\""+ jn.get("tablename") + "\",\"columnname\":\"" +jn.get("columnname") + "\",\"type\":\"" + jn.get("type")+"\",\"data\":" + jn.get("data") + "}]";
        // jsonData += "{\"tablename\":\""+ range.get(range.size()-1).getTableName() + "\",\"columnname\":\"" + range.get(range.size()-1).getColumnName() + "\",\"type\":\"" + range.get(range.size()-1).getType()+"\",\"data\":" + range.get(range.size()-1).getData().toString() + "}]";
        System.out.printf("POST /data/recommendViz =========== jsonData=%s%n", jsonData);
        return GetDeepeyeRecommednation(jsonData);
    }


    @CrossOrigin(origins = "*")
    @PostMapping("/data/recommendAnalysisMethod")
    @ApiOperation("/根据数据库名和当前操作推荐分析方法")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "xColumn",value = "表的x轴名称",required = true,dataType = "String",paramType = "form"),
            @ApiImplicitParam(name = "yColumn",value = "表的y轴名称",required = true,dataType = "String",paramType = "form"),
            @ApiImplicitParam(name = "previousStepId",value = "前一步日志编号",required = true,dataType = "int",paramType = "form"),
            @ApiImplicitParam(name = "databaseName",value = "数据库名称",required = true,dataType = "String",paramType = "form")

    })
    public ResponseEntity<?> GetMethodRecommednation1(String xColumn, String yColumn, int previousStepId, String databaseName) throws SQLException {
        String params = "[{\"previousStepId\":"+ previousStepId +"},"
                + "{\"xcolumn\":\""+ xColumn +"\"},"
                + "{\"ycolumn\":\""+ yColumn +"\"},"
                + "{\"dbName\":\""+ databaseName +"\"}]";
        return GetMethodRecommednation(params);
    }


    @CrossOrigin(origins = "*")
    @PostMapping("/data/methodrec")
    @ApiIgnore
    @ApiOperation("/根据数据库名和当前操作推荐分析方法")
    @ApiImplicitParam(name = "jsonData", value = "请求参数说明："
            + "<br>[{\"previousStepId\":\"前一步日志编号\"},"
            + "<br>{\"xcolumn\":\"x轴名称\"},"
            + "<br>{\"ycolumn\":\"y轴名称\"},"
            + "<br>{\"dbName\":\"数据库名称\"}]"
            + "<br>请求参数示例："
            + "<br>[{\"previousStepId\":37},"
            + "<br>{\"xcolumn\":\"solddate\"},"
            + "<br>{\"ycolumn\":\"SUM(quantity)\"},"
            + "<br>{\"dbName\":\"bigbench_10t_sample\"}]"
            + "<br>返回参数示例：<br>[{"
            + "\"model\": \"xgboost\","
            + "<br>\"task\":["
            + "<br>\"预测\","
            + "<br>\"预测商品[销量]\","
            + "<br>\"预测客户购买情况\","
            + "<br>\"设计促销活动保证销量\","
            + "]"
            + "},"
            + "<br>{"
            + "\"model\": \"lsa\","
            + "<br>\"task\":["
            + "<br>\"诊断\","
            + "<br>\"诊断店铺经营状况\","
            + "<br>\"发现店铺隐藏问题\","
            + "<br>\"[quantity]异常值分析\""
            + "]"
            + "}]",
            required = true, paramType = "body", dataType = "String")
    public ResponseEntity<?> GetMethodRecommednation(@RequestBody String jsonData) {
        //start time
        long start = System.currentTimeMillis();
        System.out.printf("POST /data/methodrec =========== jsonData=%s%n", jsonData);
        JSONArray resultArray = new JSONArray();

        JSONArray obj = JSONArray.fromObject(jsonData);
        String stepID = String.valueOf(obj.getJSONObject(0).getInt("previousStepId"));
        String Xcolumn =obj.getJSONObject(1).getString("xcolumn");
        String Ycolumn =obj.getJSONObject(2).getString("ycolumn");
        String DatabaseName = new String();
        if(obj.size() >3){
            DatabaseName  = obj.getJSONObject(3).getString("dbName");
        }else{
            DatabaseName = DATABASE;
        }
        Ycolumn = Ycolumn.substring(4, Ycolumn.length()-1);
        System.out.printf("/data/methodrec =========== ycolumn=%s%n", Xcolumn);
        System.out.printf("/data/methodrec =========== ycolumn=%s%n", Ycolumn);

        //three tasks
        JSONObject od = new JSONObject();
        JSONObject regr = new JSONObject();
        JSONObject cluster = new JSONObject();

        try{
            String[] args = new String[]{"python", SCRIPT_DIR + "ModelAdvisor/advisor.py", DatabaseName};
            Process proc = Runtime.getRuntime().exec(args);
            BufferedReader in = new BufferedReader(new InputStreamReader(proc.getInputStream()));
            String method = null;
            while ((method = in.readLine()) != null) {
                System.out.printf("Recommend method ====== %s%n", method);
                switch (method){
                    case "kmeans":
                    case"dbscan":
                    case"mean shift":
                        if(!cluster.containsKey("model")){
                            cluster.put("model", method);
                            System.out.printf("Recommend method cluster model ====== %s%n", method);
                        }
                        break;
                    case "xgboost":
                    case"gbdt":
                    case"adaboost":
                    case"svr":
                    case"ridge regression":
                        if(!regr.containsKey("model")){
                            regr.put("model", method);
                            System.out.printf("Recommend method regression model ====== %s%n", method);
                        }
                        break;
                    case"isolation forest":
                    case "lsa":
                    case "pca":
                        if(!od.containsKey("model")){
                            od.put("model", method);
                            System.out.printf("Recommend method outlierdetection model ====== %s%n", method);
                        }
                        break;
                }
            }
        }catch (IOException e){

        }

        //text
        List<String> outlierdetection = new ArrayList<String>(){{add("诊断");}};
        List<String> regression = new ArrayList<String>(){{add("预测");}};
        List<String> clustering = new ArrayList<String>(){{add("聚类");}};
        outlierdetection.add("诊断店铺经营状况");
        outlierdetection.add("发现店铺隐藏问题");
        regression.add("预测商品[销量]");
        regression.add("预测客户购买情况");
        regression.add("设计促销活动保证销量");
        clustering.add("用户聚类");
        clustering.add("找准店铺经营定位");
        clustering.add("识别店铺流量来源");
        //根据Xcolumn, Ycolumn选择task
        switch (Xcolumn){
            //横坐标为solddate,做regression和outlierdetection
            case "solddate":
                outlierdetection.add("[" + Ycolumn + "]异常值分析");

                regr.put("task", regression);
                od.put("task", outlierdetection);

                resultArray.add(regr);
                resultArray.add(od);
                break;
                //横坐标为用户属性,做outlierdetection和clustering, 若Y为销量,则加上regression
            case "age":
            case "country":
            case "nationality":
            case "category":
            case "gender":
                if(Ycolumn.equals("quantity")){
                    regr.put("task", regression);
                    resultArray.add(regr);
                }
                outlierdetection.add("[" + Ycolumn + "]异常值分析");
                od.put("task", outlierdetection);

                cluster.put("task", clustering);

                resultArray.add(od);
                resultArray.add(cluster);
                break;
            default:
                outlierdetection.add("[" + Ycolumn + "]异常值分析");
                od.put("task", outlierdetection);

                resultArray.add(od);
                break;
        }
        //end time
        long end = System.currentTimeMillis();
        methodRecTime = (end - start)/1000;
        methodRecTime_1 = (end - start)/1000;
        methodRecCount++;
        methodRecCode = HttpStatus.OK.value();
        return new ResponseEntity<>(resultArray, HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/exceptiondetect")
    @ApiIgnore()
    public ResponseEntity<?> DetectExceptionSectionInSequece(@RequestBody String jsonData) {
        JSONArray jarray = JSONArray.fromObject(jsonData);
        JSONArray answer = new JSONArray();
//       System.out.printf("POST /data/distribution =========== tablename=%s%n", obj.getString("tablename"));
        System.out.printf("==================/data/exceptiondetect==============%n");
//          for (int i=0;i<jarray.size();++i) {
//            JSONObject obj = jarray.getJSONObject(i);
        JSONObject obj = jarray.getJSONObject(0);
        JSONObject data = obj.getJSONObject("data");
        /*
            *********************************************************************
            The algorithm for exception detection in sequence data
            *********************************************************************
            */
        IForest iForest = new IForest();
        double[][] samples = new double[data.size()][2];
        Integer maxsec = 0;
        for (; data.containsKey("sec" + Integer.toString(maxsec + 1)); ++maxsec) {
            JSONObject obj1 = data.getJSONObject("sec" + Integer.toString(maxsec + 1));
            Collection collection = obj1.values();
            samples[maxsec][0] = Double.valueOf(collection.iterator().next().toString());
            samples[maxsec][1] = samples[maxsec][0];
//            System.out.println(samples[maxsec] [0]);
        }
        try {
            int[] labels = iForest.train(samples, 100);
            int n = 0;
            for (int label : labels) {
                System.out.print(label + " ");
                if ((n + 1) % 10 == 0)
                    System.out.println();
                n++;
            }
            Integer sum_of_exception_point = labels.length;
            JSONObject jobj = new JSONObject();
            Integer[] p = new Integer[maxsec];
            for (Integer j = 0; j < maxsec; ++j) p[j] = 0;
            for (Integer j = 0; j < sum_of_exception_point; ++j) {
                if (labels[j] == 0) {
                    jobj.put("Exp" + Integer.toString(j + 1), "sec" + Integer.toString(j + 1));
                }
            }
            obj.put("Exception", jobj);
            answer.add(obj);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ResponseEntity<JSONArray>(answer, HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/datalineage")
    @ApiIgnore()
    public ResponseEntity<?> DataLineage(@Valid @RequestBody JSONObject json) {
        Integer userid = json.getInt("user_id");
        Integer curLogId = json.getInt("log_id");
        System.out.printf("==================/data/datalineage==============%n");

        Statement stmt1 = null;
        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
        String user = "root";
        String pass = "root";
        String sql = "";
        String sql1 = "";
        String sqlhis = "";
        JSONObject answer = new JSONObject();
        try {
            Class.forName("com.mysql.jdbc.Driver");
            Connection conn = DriverManager.getConnection(url, user, pass);
            Statement stmt = conn.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE);
            //sql = "SELECT  * FROM history where user_id=" + userid + " order by dataset_id ";
            sql = "SELECT  * FROM (select * from userdb.history order by log_id desc limit 10) as a\n" +
                    "where user_id= "+userid + " order by log_id; ";
            System.out.println("==================/data/datalineage==============sql1:"+sql);
            ResultSet rs = stmt.executeQuery(sql);
            rs.next();
            Integer dataset_id = rs.getInt("dataset_id");
//            Integer  stepnum = 0, nextstep, nextnextstep, previous;
//            String str_record;
            //JSON group by dataset
//            Integer dataset_id = -1;
            JSONArray array = new JSONArray();
            answer.put("name", "原始数据");
            answer.put("deal", 2);
//
//                    }
//                } else {
//                    if (dataset_id == -1) {
//                        dataset_id = curid;
//                    } else {
//                        sql1 = "SELECT tablename FROM sourceindex WHERE dataset_id=" + dataset_id;
//                        stmt1 = conn.createStatement();
//                        ResultSet tablers = stmt1.executeQuery(sql1);
//                        tablers.next();
//                        String tablename = tablers.getString("tablename");
//                        JSONObject jsonObject = new JSONObject();
//                        jsonObject.put("name", tablename);
//                        if (!tempanswer.isEmpty()) {
//                            jsonObject.put("children", tempanswer);
//                            array.add(jsonObject);
//                            tempanswer = new JSONArray();
//                        }
//                        dataset_id = curid;
//                    }
//                    historyRsultSet.previous();
//                }
//            }

//            //last dataset tempanswer to answer
//            if (!tempanswer.isEmpty()) {
//                sql1 = "SELECT tablename FROM sourceindex WHERE dataset_id=" + dataset_id;
//                stmt1 = conn.createStatement();
//                ResultSet tablers = stmt1.executeQuery(sql1);
//                tablers.next();
//                String tablename = tablers.getString("tablename");
//                JSONObject jsonObject = new JSONObject();
//                jsonObject.put("name", tablename);
//                if (!tempanswer.isEmpty()) {
//                    jsonObject.put("children", tempanswer);
//                    array.add(jsonObject);
//                    tempanswer = new JSONArray();
//                }
//            }
            sql = "SELECT tablename,row_count FROM sourceindex WHERE dataset_id=" + dataset_id;
            System.out.println("==================/data/datalineage==============sql2:"+sql);
            stmt1 = conn.createStatement();
            ResultSet tablers = stmt1.executeQuery(sql);
            tablers.next();
            //String tablename = tablers.getString("tablename");
            String tablename = "商家数据";
            Integer rowCount = tablers.getInt("row_count");
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("name", tablename);
            jsonObject.put("rowcount",rowCount);
            jsonObject.put("deal", 2);
            JSONArray tempArray = new JSONArray();
            rs.previous();
            while (rs.next()) {
                Integer log_id = rs.getInt("log_id");
                Integer user_id = rs.getInt("user_id");
                Integer step = rs.getInt("step");
                String str_record = rs.getString("record");
                JSONArray record = JSONArray.fromObject(str_record);
                Integer previous = rs.getInt("previous");
                while (previous!=-1){
                    rs.next();
                }
                Timestamp time = rs.getTimestamp("create_time");
                rowCount=rs.getInt("row_count");
                //System.out.println("logid:" + rs.getInt(1));
                JSONObject jo1 = new JSONObject();
                JSONArray ja1 = new JSONArray();
                JSONObject jo2 = new JSONObject();
                JSONArray ja2 = new JSONArray();
                JSONObject jo3 = new JSONObject();
                JSONArray ja3 = new JSONArray();
                String filter = "子数据集筛选:";

                if(step==1){
                    int f=0;
                    for (int i = 0; i < record.size(); i++) {
                        if (!record.getJSONObject(i).getString("data").equals("[]")) {
                            if (!record.getJSONObject(i).getString("columnname").contains("1")){
                                String colname = record.getJSONObject(i).getString("columnname");
                                filter += colname + ",";
                                f++;
                            }
                        }
                    }
                    filter+=" "+f+"列";
                    jo1.put("name", filter);
                    jo1.put("rowcount",rowCount);
                    if (log_id.equals(curLogId)){
                        jo1.put("deal", 2);
                    }
                }

                while (rs.next()) {
                    log_id = rs.getInt("log_id");
                    //System.out.println("logid:"+log_id);
                    step = rs.getInt("step");
                    str_record = rs.getString("record");
                    record = JSONArray.fromObject(str_record);
                    previous = rs.getInt("previous");
                    rowCount=rs.getInt("row_count");
                    if (previous == -1) {
                        rs.previous();
                        break;
                    } else if (step == 2) {
                        String str = "可视化选取:" + "X轴="+record.getJSONObject(1).get("xcolumn") + ",Y轴=" + record.getJSONObject(2).get("ycolumn");
                        jo2.put("name", str);
                        jo2.put("rowcount",rowCount);
                        if (log_id.equals(curLogId)){
                            jo1.put("deal", 2);
                            jo2.put("deal", 2);
                        }
                        if (jo2 != null) {
                            ja2.add(jo2);
                        } else {
                            System.out.println("jo2 NULL");
                        }
                    } else {
                        filter = rs.getString(5);
                        filter = filter.replace("\":\"", "->");
                        jo3.put("name", filter);
                        jo3.put("rowcount",rowCount);
                        if (log_id.equals(curLogId)){
                            jo1.put("deal", 2);
                            jo2.put("deal", 2);
                            jo3.put("deal", 2);
                        }
                        ja3.add(jo3);
                    }
                }
                if (ja2.size() >= 1) {
                    jo1.put("children", ja2);
                }
                if (jo1.size() >= 1) {
                    tempArray.add(jo1);
                } else {
                    System.out.println("Error jo1 NULL");
                }

            }
            jsonObject.put("children", tempArray);
            array.add(jsonObject);
            answer.put("children", array);
            System.out.println("/data/datalineage ========== answer:" + answer.toString());
//            //getrecnthistory
//            Connection connhis = DriverManager.getConnection(url, user, pass);
//            Statement stmthis = conn.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE);
//            JSONObject result = new JSONObject();
//            sqlhis = "SELECT * FROM history WHERE user_id = " + userid.toString() + " ORDER BY log_id DESC LIMIT 1";
//            ResultSet rs1 = stmthis.executeQuery(sqlhis);
//            boolean ispreroot = false;
//            ArrayList<String> names = new ArrayList<>();
//            Integer rowcount=-1;
//            while (!ispreroot) {
//                rs1.next();
//                dataset_id = rs1.getInt(3);
//                Integer step = rs1.getInt(4);
//                String str_record = rs1.getString(5);
//                JSONArray record = JSONArray.fromObject(str_record);
//                Integer previous = rs1.getInt(6);
//                rowcount = rs1.getInt(8);
//                sql = "SELECT tablename FROM sourceindex WHERE dataset_id=" + dataset_id;
//                ResultSet rs2 = stmt.executeQuery(sql);
//                rs2.next();
//                tablename = rs2.getString("tablename");
//                result.put("name", tablename);
//                String name = "";
//                if (step == 1) {
//                    for (int i = 0; i < record.size(); i++) {
//                        if (!record.getJSONObject(i).getJSONArray("data").isEmpty())
//                            name = name + record.getJSONObject(i).getString("columnname") + ":" + record.getJSONObject(i).getJSONArray("data").toString() + " ";
//                    }
//                } else if (step == 2) {
//                    name = name + "xcolumn,ycolumn:" + record.getJSONObject(1).getString("xcolumn") + "," + record.getJSONObject(2).getString("ycolumn");
//                } else {
//                    name = name + record.toString().replace("\":\"", "->");
//                }
//                names.add(name);
//
//                if (previous == -1) ispreroot = true;
//                else {
//                    sqlhis = "SELECT * FROM history WHERE user_id = " + userid.toString() + " AND log_id = "+ previous.toString();
//                    rs1 = stmthis.executeQuery(sqlhis);
//                }
//            }
//            //System.out.println(names.size());
//            JSONArray jsonArray = new JSONArray();
//            for (int i = 0; i < names.size(); i++) {
//                jsonObject = new JSONObject();
//                jsonObject.put("name", names.get(i));
//                jsonObject.put("deal", 2);
//                jsonObject.put("rowcount", rowcount);
//                if (i != 0) {
//                    jsonObject.put("children", jsonArray);
//                }
//                jsonArray = new JSONArray();
//                jsonArray.add(jsonObject);
//            }
//            result.put("children", jsonArray);
////
//            for (int i = 0; i < answer.getJSONArray("children").size(); i++) {
//                if (answer.getJSONArray("children").getJSONObject(i).get("name").equals(result.get("name"))) {
//                    answer.getJSONArray("children").getJSONObject(i).put("deal", 2);
//                    answer.getJSONArray("children").getJSONObject(i)
//                            .getJSONArray("children").add(jsonArray.getJSONObject(0));
//                }
//            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        System.out.println("/data/datalineage ========== answer:" + answer.toString());
        return new ResponseEntity<>(answer, HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/settarget")
    @ApiIgnore()
    public ResponseEntity<?> settarget(@RequestBody JSONObject jsonObject){
        Double target = jsonObject.getDouble("target");
        if (target<0) {
            target = target_setted;
        }
        else {
            target_setted = target;
        }
        JSONObject result = new JSONObject();
        result.put("now", now);
        result.put("target", target);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/data/getsavedtemplates")
    @ApiIgnore()
    public ResponseEntity<?> GetSavedTemplates(@RequestBody JSONObject jsonObject){
        Integer user_id = jsonObject.getInt("user_id");
        Connection conn = null;
        Statement stmt = null;
        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
        String user = "root";
        String pass = "root";
        String sql = "";
        JSONArray result = new JSONArray();
        try {
            Class.forName("com.mysql.jdbc.Driver");
//            System.out.println();
            conn = DriverManager.getConnection(url, user, pass);
            stmt = conn.createStatement();
            sql = "SELECT jid,createdAt,updatedAt FROM portal_job_meta WHERE uid = " + user_id.toString();
            ResultSet rs = stmt.executeQuery(sql);
            while (rs.next()) {
                JSONObject jsonObject1 = new JSONObject();
                jsonObject1.put("flow_id", rs.getString(1));
                jsonObject1.put("createtime", rs.getString(2));
                jsonObject1.put("updatetime", rs.getString(3));
                //System.out.println(jsonObject1.toString());
                result.add(jsonObject1);
            }
            return new ResponseEntity<JSONArray>(result, HttpStatus.OK);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/user/interest")
    @ApiIgnore()
    @ApiOperation("/用户感兴趣的方法")
    @ApiImplicitParam(name = "jsonData", value = "请求参数说明：" +
            "<br>{" +
            "\"username\":\"用户名\"," +
            "<br>\"useractive\":[" +
            "<br>{" +
            "\"context\":\"操作内容\"," +
            "<br>\"count\":\"数目\"" +
            "}]}" +
            "<br>请求参数示例：" +
            "<br>{" +
            "\"username\":\"user1\"," +
            "<br>\"useractive\":[" +
            "{" +
            "<br>\"context\":\"整体看板销量\"," +
            "<br>\"count\":1000" +
            "}" +
            "]" +
            "}"
            + "<br>返回参数示例：" +
            "<br>{" +
            "\"recent_interest\":\"销售量预测\"," +
            "<br>\"mpst_interest\":\"销售量预测\"" +
            "}",
            required = true, paramType = "body", dataType = "String")
    public ResponseEntity<?> Userinterest(@RequestBody JSONObject jsonObject){
        String user_name = jsonObject.getString("username");
        JSONArray user_actives = jsonObject.getJSONArray("useractive");
        JSONArray user_active = new JSONArray();
        Integer maxtime = -1;
        String most_interested_view = "";
        String recent_interested_view = "";
        for (int i=0; i<user_actives.size(); i++) {
            user_active.add(user_actives.getJSONObject(i).getString("context"));
            if (user_actives.getJSONObject(i).getInt("count") >= maxtime) {
                maxtime = user_actives.getJSONObject(i).getInt("count");
                most_interested_view = user_actives.getJSONObject(i).getString("context");
            }
            recent_interested_view = user_actives.getJSONObject(i).getString("context");
        }
        if (most_interested_view.contains("支付金额表格")) {
            most_interested_view = "分析销售情况";
        }
        else if (most_interested_view.contains("累计支付金额")) {
            most_interested_view = "分析销售情况";
        }
        else if (most_interested_view.contains("销售目标进度")) {
            most_interested_view = "店铺销售预测";
        }
        else if (most_interested_view.contains("整体看板销售量")) {
            most_interested_view = "销售量预测";
        }
        else if (most_interested_view.contains("整体看板支付金额")) {
            most_interested_view = "销售金额预测";
        }
        else if (most_interested_view.contains("支付金额")) {
            most_interested_view = "销售金额预测";
        }
        else if (most_interested_view.contains("销售量")) {
            most_interested_view = "销售量预测";
        }

        if (recent_interested_view.contains("支付金额表格")) {
            recent_interested_view = "分析销售情况";
        }
        else if (recent_interested_view.contains("累计支付金额")) {
            recent_interested_view = "分析销售情况";
        }
        else if (recent_interested_view.contains("销售目标进度")) {
            recent_interested_view = "店铺销售预测";
        }
        else if (recent_interested_view.contains("整体看板销售量")) {
            recent_interested_view = "销售量预测";
        }
        else if (recent_interested_view.contains("整体看板支付金额")) {
            recent_interested_view = "销售金额预测";
        }
        else if (recent_interested_view.contains("支付金额")) {
            recent_interested_view = "销售金额预测";
        }
        else if (recent_interested_view.contains("销售量")) {
            recent_interested_view = "销售量预测";
        }


//        if (most_interested_view.contains("表格") || most_interested_view.contains("栏") || most_interested_view.contains("看板") || most_interested_view.contains("来源")) {
//            most_interested_view = "分析" + most_interested_view;
//        }
//        else {
//            most_interested_view = most_interested_view + "预测";
//        }
//        if (recent_interested_view.contains("表格") || recent_interested_view.contains("栏") || recent_interested_view.contains("看板") || recent_interested_view.contains("来源")) {
//            recent_interested_view = "分析" + recent_interested_view;
//        }
//        else {
//            recent_interested_view = recent_interested_view + "预测";
//        }
//        if (!activeroute_is_loaded)
//            loadActiveRoutes();
//
//        Integer interest_type = 0;
//        String A = "";
//        String B = "";
//        for (int i=0; i < user_active.size(); i++) {
//            boolean flag = false;
//            for (int j=0; j < active_routes.size(); j++) {
//                //System.out.println("====== j:"+j);
//                for (int k=0; k < active_routes.get(j).get(j).size(); k++) {
//                    if ((user_active.getString(i).contains(active_routes.get(j).get(j).get(k)) || active_routes.get(j).get(j).contains(user_active.getString(i))) && interest_type == j) {
//                        interest_type = j + 1;
//                        if (interest_type == 1) A = user_active.getString(i);
//                        else if (interest_type == 3) B = user_active.getString(i);
//                        flag = true;
//                        break;
//                    }
//                    if (flag)
//                        break;
//                }
//            }
//            if (!flag && interest_type!=0)
//                break;
//            else if (!flag)
//                interest_type = 0;
//        }
//
//        String result = new String();
//        if (interest_type == 1) {
//            result = A+"预测";
//        }
//        else if (interest_type == 2) {
//            result = "订制销售策略";
//        }
//        else if (interest_type == 3) {
//            result = "分析" + B + "对" + A + "的影响";
//        }
//        else {
//            result = "正在生成您的分析意图";
//        }
        JSONObject retres = new JSONObject();
        retres.put("recent_interest", recent_interested_view);
        retres.put("most_interest", most_interested_view);
//        retres.put("active_interest", result);
        return new ResponseEntity<JSONObject>(retres, HttpStatus.OK);
//        Connection conn = null;
//        Statement stmt = null;
//        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
//        String user = "root";
//        String pass = "root";
//        String sql = "";
//        JSONArray result = new JSONArray();
//        try {
//            Class.forName("com.mysql.jdbc.Driver");
////            System.out.println();
//            conn = DriverManager.getConnection(url, user, pass);
//            stmt = conn.createStatement();
//            sql = "SELECT jid,createdAt,updatedAt FROM portal_job_meta WHERE uid = " + user_id.toString();
//            ResultSet rs = stmt.executeQuery(sql);
//            while (rs.next()) {
//                JSONObject jsonObject1 = new JSONObject();
//                jsonObject1.put("flow_id", rs.getString(1));
//                jsonObject1.put("createtime", rs.getString(2));
//                jsonObject1.put("updatetime", rs.getString(3));
//                //System.out.println(jsonObject1.toString());
//                result.add(jsonObject1);
//            }
//            return new ResponseEntity<JSONArray>(result, HttpStatus.OK);
//        } catch (ClassNotFoundException e) {
//            e.printStackTrace();
//        } catch (SQLException e) {
//            e.printStackTrace();
//        }
    }

    /***********************************************************************************
     *** data loading APIs ***
     ***********************************************************************************/

    /**
     * loading data api
     * @param jsonData
     * @return
     */
    /*
    *********************************************************************
            数据导入
            * input: database, tablename, columnNames, columnTypes
            * output: xcolumn, ycolumn, cType, classify, xdata, ydata
    *********************************************************************
    */
    @CrossOrigin(origins = "*")
    @PostMapping("/data/dataloading")
    @ApiIgnore()
    @ApiOperation("/根据用户输入的CSV文件创建表并导入数据")
    @ApiImplicitParam(name = "jsonData", value =  "请求参数说明：<br>{\"database\":\"数据库名\",<br>\"tablename\":\"表名\",<br>\"inpath\":\"数据文件路径\",<br>\"columnNames\":\"列名列表\",<br>\"columnTypes\":\"列类型列表\"}"
            + "<br>请求参数示例：<br>{\"database\":\"bigbench_10t_sample\","
            + "<br>\"tablename\":\"websales_home_myshop_10000\"," +
            "<br>\"inpath\":\"/root/websales_home_myshop.txt\"," +
            "<br>\"columnNames\":[\"itemname\",\"price\"]," +
            "<br>\"columnNames\":[\"string\",\"int\"]}"
            + "<br>返回参数示例：<br>{\"status\":\"1\"}", required = true, paramType = "body", dataType = "String")
    public ResponseEntity<?> DataLoadingApi(@RequestBody String jsonData) {
        //start time
        long start = System.currentTimeMillis();
        System.out.printf("POST /api/data/dataloading =========== jsonData=%s%n", jsonData);
        JSONObject args = JSONObject.fromObject(jsonData);
        JSONObject result = new JSONObject();
        String database = args.getString("database");
        String tablename = args.getString("tablename");
        String inpath = args.getString("inpath");
        JSONArray columnNames = args.getJSONArray("columnNames");
        JSONArray columnTypes = args.getJSONArray("columnTypes");
        ArrayList<String> colNames = new ArrayList<String>();
        if (columnNames != null) {
            int len = columnNames.size();
            for (int i=0;i<len;i++){
                colNames.add(columnNames.get(i).toString());
            }
        }
        ArrayList<String> colTypes = new ArrayList<String>();
        if (columnTypes != null) {
            int len = columnTypes.size();
            for (int i=0;i<len;i++){
                colTypes.add(columnTypes.get(i).toString());
            }
        }

        String url = "jdbc:mysql://localhost:3306/userdb?characterEncoding=utf8&useSSL=true";
        String user = "root";
        String pass = "root";
        String sql = "";
        Connection conn = null;
        Statement stmt = null;

        try{
            // hive -e "create database bigbench_100g;"
            String[] command1 = new String[]{"hive", "-e",  "\"create database " + database + ";\""};
            String col_name_type = "";
            assert columnNames.size()==columnTypes.size():"columnNames.size should be the same with columnTypes.size";
            int len  = columnNames.size();
            for(int i=0; i<len; i++){
                col_name_type = col_name_type + colNames.get(i) + " " + colTypes.get(i);
                if(i!=len-1){
                    col_name_type = col_name_type + ", ";
                }
            }
            // hive -e "create external table if not exists bigbench_100g.websales_home_myshop (itemname  string, price  double, price1 double, quantity int, quantity1 int, discount double, discount1 double, category string, solddate timestamp, customer string, age int, age1 int, gender string, province string, nationality string, itemdesc string) row format delimited fields terminated by '\t' stored as textfile;"
            String[] command2 = new String[]{"hive", "-e", "\"create external table if not exists " + database + "." + tablename + " (" + col_name_type + ");\""};
            // hive -e "load data local inpath 'websales_home_myshop.txt' into table bigbench_100g.websales_home_myshop;"
            String[] command3 = new String[]{"hive", "-e", "\"load data local inpath \'" + inpath + "\' into table " + database + "." + tablename + ";\""};
            Process proc = Runtime.getRuntime().exec(command1);
            int r1 = proc.waitFor();
            System.out.println("POST data/dataloading ========== command1:");
            for(int k=0; k<command1.length; k++){
                System.out.println(command1[k]);
            }
            BufferedReader reader1 = new BufferedReader(new InputStreamReader(proc.getInputStream()));
            String line1 ="";
            while ((line1 = reader1.readLine()) != null) {
                System.out.println(line1);
            }
            if(r1==0){
                proc = Runtime.getRuntime().exec(command2);
                int r2 = proc.waitFor();
                System.out.println("POST data/dataloading ========== col_name_type:" + col_name_type);
                System.out.println("POST data/dataloading ========== command2:");
                for(int k=0; k<command2.length; k++){
                    System.out.println(command2[k]);
                }
                BufferedReader reader2 = new BufferedReader(new InputStreamReader(proc.getInputStream()));
                String line2 ="";
                while ((line2 = reader2.readLine()) != null) {
                    System.out.println(line2);
                }
                if(r2==0){
                    proc = Runtime.getRuntime().exec(command3);
                    int r3 = proc.waitFor();
                    System.out.println("POST data/dataloading ========== command3:");
                    for(int k=0; k<command3.length; k++){
                        System.out.println(command3[k]);
                    }
                    BufferedReader reader3 = new BufferedReader(new InputStreamReader(proc.getInputStream()));
                    String line3 = "";
                    while ((line3 = reader3.readLine()) != null) {
                        System.out.println(line3);
                    }
                    if(r3==0) {
                        // compute row_count
                        String[] command4 = new String[]{"wc", "-l", inpath};
                        proc = Runtime.getRuntime().exec(command4);
                        int r4 = proc.waitFor();
                        BufferedReader reader4 = new BufferedReader(new InputStreamReader(proc.getInputStream()));
                        String line4 = "";
                        int row_count = 0;
                        while((line4 = reader4.readLine()) != null){
                            System.out.println("POST data/dataloading ========== line4:" + line4);
                            String[] tmp = line4.split(" ");
                            row_count = Integer.parseInt(tmp[0]);
                            System.out.println("POST data/dataloading ========== row_count:"+ row_count);
                        }

                        // insert into sourceindex table
                        Class.forName("com.mysql.jdbc.Driver");
//            System.out.println();
                        conn = DriverManager.getConnection(url, user, pass);
                        stmt = conn.createStatement();
                        sql = "INSERT INTO sourceindex (created_at, iscommon, name, tablename, updated_at, row_count) VALUES (Now(),1,\""+tablename+"\",\""+tablename+"\", Now(),"+row_count+")";
                        System.out.println("POST data/dataloading ========== sql:"+ sql);
                        stmt.executeUpdate(sql);
                        stmt.close();
                        conn.close();
                        result.put("status", 1);
                        return new ResponseEntity<JSONObject>(result, HttpStatus.OK);
                    }
                }
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        result.put("status", 0);
        return new ResponseEntity<JSONObject>(result, HttpStatus.OK);
    }


    @CrossOrigin(origins = "*")
    @PostMapping("/data/dataLoading")
    @ApiOperation("/根据用户输入的数据文件创建表并导入数据")
    //@ApiImplicitParams({
           // @ApiImplicitParam(name = "databaseName",value = "数据库名",required = true,dataType = "String",paramType = "form"),
            //@ApiImplicitParam(name = "tableName",value = "表名",required = true,dataType = "String",paramType = "form"),
            //@ApiImplicitParam(name = "inpath",value = "要导入的数据文件的绝对路径",required = true,dataType = "String",paramType = "form"),
            //@ApiImplicitParam(name = "columnNames",value = "数据表的列名列表",required = true, allowMultiple = true, dataType = "String",paramType = "query"),
            //@ApiImplicitParam(name = "columnTypes",value = "数据表的列类型列表",required = true, allowMultiple = true, dataType = "String",paramType = "query")
    //})
    public ResponseEntity<?> DataLoading1(@RequestParam(value="databaseName") @ApiParam(value = "数据库名") String databaseName, @RequestParam(value="tableName") @ApiParam(value = "表名") String tableName, @RequestParam(value="inpath") @ApiParam(value = "要导入的数据文件的绝对路径") String inpath, @RequestParam("columnNames") @ApiParam(value = "数据表的列名列表") List<String> columnNames, @RequestParam(value="columnTypes") @ApiParam(value = "数据表的列类型列表") List<String> columnTypes) {
        String jsonData = "{\"database\":\"" + databaseName + "\",\"tablename\":\"" + tableName + "\",\"inpath\":\""+inpath +"\",\"columnNames\":[";
        for(int i=0; i<columnNames.size()-1; i++){
            jsonData += columnNames.get(i).toString() + ",";
        }
        jsonData += columnNames.get(columnNames.size()-1) + "],\"columnTypes\":[";
        for(int j=0; j<columnTypes.size()-1; j++){
            jsonData += columnTypes.get(j).toString() + ",";
        }
        jsonData += columnTypes.get(columnTypes.size()-1) + "]}";

        System.out.printf("POST /data/dataLoading =========== jsonData=%s%n", jsonData);
        return DataLoadingApi(jsonData);
    }


}
