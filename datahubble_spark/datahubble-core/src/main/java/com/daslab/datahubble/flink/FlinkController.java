//package com.daslab.smartinteract.flink;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.util.ArrayList;
//import java.util.Iterator;
//
///**
// * @author zyz
// * @version 2019-04-24
// */
//@RestController
//
//public class FlinkController {
//    @Autowired
//    FlinkExcutor flinkExcutor;
//    @CrossOrigin(origins = "*")
//    @GetMapping("/streaming")
//    public ResponseEntity<?> getComments() {
//        System.out.println("get flink api");
//        ArrayList<String> res = new ArrayList<>();
//        try {
//            Iterator<String> stringIterator = flinkExcutor.showComments();
//            while (stringIterator.hasNext()) {
//                res.add(stringIterator.next());
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//        return new ResponseEntity<>(res, HttpStatus.OK);
//    }
//}
