//package com.daslab.smartinteract.controller;
//
//import com.daslab.smartinteract.verdict.VerdictExecutor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.verdictdb.VerdictSingleResult;
//
///**
// * @author zyz
// * @version 2019-04-24
// */
//@RestController
//@RequestMapping("/api/verdict")
//public class VerdictController {
//    private VerdictExecutor verdictExecutor = VerdictExecutor.getInstance();
//
//
//    /**
//     * 使用方法命令如下：-d表示body，-H表示头信息（需要是json），-X表示选择消息类型，-v表示显示访问信息（用于排错）
//     * curl -d "CREATE SCRAMBLE bigbench_1t_sample.websales_home_1000 FROM bigbench_1t.websales_home_myshop_10000 RATIO 0.001" -X POST -H "Content-Type: application/json" -v http://localhost:8083/api/verdict/executesql
//     * 然后，在hive中，使用create as select语句复制这个表，达到合并小文件的目的。
//     */
//    @CrossOrigin(origins = "*")
//    @PostMapping("/executesql")
//    public ResponseEntity<?> ExecuteSQL(@RequestBody String sql) {
//        System.out.printf("sql is %s", sql);
//        VerdictSingleResult verdictSingleResult = verdictExecutor.sql(sql);
//        return new ResponseEntity<>(verdictSingleResult.toCsv(), HttpStatus.OK);
//    }
//}
