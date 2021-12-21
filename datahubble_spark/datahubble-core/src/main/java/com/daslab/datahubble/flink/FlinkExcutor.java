//package com.daslab.smartinteract.flink;
//
//
//import org.apache.flink.streaming.api.datastream.DataStream;
//import org.apache.flink.streaming.api.datastream.DataStreamSource;
//import org.apache.flink.streaming.api.datastream.DataStreamUtils;
//import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
//import org.springframework.stereotype.Component;
//
//import java.util.Iterator;
//
//import static com.zpc.flinktest.flinkenv.COMMENTS_PATH;
//
///**
// * @Author: zpc
// * @Description:
// * @Create: 2019-11-01 11:01
// **/
//
//@Component
//public class FlinkExcutor {
//
//    public FlinkExcutor() {
//        //init Flink Enviroment
////        System.out.println("init flink  excutor");
//    }
//
//    public Iterator<String> showComments() throws Exception {
//
////        StreamExecutionEnvironment fsEnv = StreamExecutionEnvironment.createRemoteEnvironment("10.176.24.40",8081);
//        StreamExecutionEnvironment fsEnv = StreamExecutionEnvironment.createLocalEnvironment();
//        System.out.println("=======Flink read file=======");
//        DataStreamSource<String> textStream = fsEnv.readTextFile(COMMENTS_PATH);
//        DataStream<String> result = textStream.map(s -> "\"" + s.split(",\"")[1]);
//        //result.timeWindowAll(Time.seconds(5));
////        result.countWindowAll(10);
//        //4.打印输出sink
////             result.print();
//        Iterator<String> myOutput = DataStreamUtils.collect(result);
////        while (myOutput.hasNext()) {
////            System.out.println(myOutput.next());
////        }
//         return myOutput;
////        System.out.println("flink excute");
////
////        while (myOutput.hasNext()) {
////            System.out.println(myOutput.next());
////        }
////        fsEnv.execute();
//
////        Table table = fsTableEnv.fromDataStream(dataStream);
////        table.printSchema();
//
//        //        dataStream.map((MapFunction<String, String>) line -> {
////            System.out.println(line + "<MAP>");
////            return line + "<MAP>";
////        });
////        DataStream<Tuple2<String, Integer>> counts =
////                // split up the lines in pairs (2-tuples) containing: (word,1)
////                dataStream.flatMap((FlatMapFunction<String, Tuple2<String, Integer>>) (value, out) -> {
////                    String[] tokens = value.toLowerCase().split("\\W+");
////
////                    // emit the pairs
////                    for (String token : tokens) {
////                        if (token.length() > 0) {
////                            out.collect(new Tuple2<>(token, 1));
////                        }
////                    }
////                })
////                        // group by the tuple field "0" and sum up tuple field "1"
////                        .keyBy(0).sum(1);
//
//
//    }
//
//}
