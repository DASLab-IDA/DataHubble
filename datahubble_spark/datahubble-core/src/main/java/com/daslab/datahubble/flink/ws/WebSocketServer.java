//package com.daslab.smartinteract.flink.ws;/**
// * @program: flink-test
// * @author: zpc
// * @create: 2019-11-09 16:35
// * @Author: zpc
// * @Description:
// * @Create: 2019-11-09 16:35
// **/
//
///**
// * @Author: zpc
// * @Description:
// * @Create: 2019-11-09 16:35
// **/
//
//
//import com.zpc.flinktest.FlinkExcutor;
//import org.springframework.stereotype.Component;
//
//import javax.websocket.*;
//import javax.websocket.server.ServerEndpoint;
//import java.io.IOException;
//import java.util.Iterator;
//import java.util.concurrent.CopyOnWriteArraySet;
//
//@ServerEndpoint(value = "/websocket")
//@Component
//public class WebSocketServer {
//    //静态变量，用来记录当前在线连接数。应该把它设计成线程安全的。
//    private static int onlineCount = 0;
//    //concurrent包的线程安全Set，用来存放每个客户端对应的MyWebSocket对象。
//    private static CopyOnWriteArraySet<WebSocketServer> webSocketSet = new CopyOnWriteArraySet<WebSocketServer>();
//
//    //与某个客户端的连接会话，需要通过它来给客户端发送数据
//    private Session session;
//
//
//    private FlinkExcutor flinkExcutor = new FlinkExcutor();
//
//    /**
//     * 连接建立成功调用的方法*/
//    @OnOpen
//    public void onOpen(Session session) {
//        this.session = session;
//        webSocketSet.add(this);     //加入set中
//        addOnlineCount();           //在线数加1
//        System.out.println("有新连接加入！当前链接为" + getOnlineCount());
//        try {
//            sendMessage("连接成功");
////            while (this.session!=null) {
//
//            try {
//                sendDataStreamMessage(flinkExcutor.showComments());
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
//
////            }
//        } catch (IOException e) {
//            System.out.println("websocket IO异常");
//        }
//    }
//    //	//连接打开时执行
//    //	@OnOpen
//    //	public void onOpen(@PathParam("user") String user, Session session) {
//    //		currentUser = user;
//    //		System.out.println("Connected ... " + session.getId());
//    //	}
//
//    /**
//     * 连接关闭调用的方法
//     */
//    @OnClose
//    public void onClose() {
//        webSocketSet.remove(this);  //从set中删除
//        subOnlineCount();           //在线数减1
//        System.out.println("有一连接关闭！当前在线websocket连接为" + getOnlineCount());
//    }
//
//    /**
//     * 收到客户端消息后调用的方法
//     *
//     * @param message 客户端发送过来的消息*/
//    @OnMessage
//    public void onMessage(String message, Session session) {
//        System.out.println("来自客户端的消息:" + message);
//
//        //群发消息
//        for (WebSocketServer item : webSocketSet) {
//            try {
//                item.sendMessage(message);
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        }
//    }
//
//    /**
//     *
//     * @param session
//     * @param error
//     */
//    @OnError
//    public void onError(Session session, Throwable error) {
//        System.out.println("发生错误");
//        error.printStackTrace();
//    }
//
//
//    public void sendMessage(String message) throws IOException {
//        this.session.getBasicRemote().sendText(message);
//    }
//
//    public void sendDataStreamMessage(Iterator<String> stringIterator) throws IOException {
//        int count = 0;
//        while (stringIterator.hasNext()) {
//            if (count % 1000 == 0 && count != 0) {
//                try {
//                    Thread.sleep(10000);
//                } catch (InterruptedException e) {
//                    e.printStackTrace();
//                }
//            }
//            this.session.getBasicRemote().sendText(stringIterator.next());
////            System.out.println(count++);
//            try {
//                Thread.sleep(3000);
//            } catch (InterruptedException e) {
//                e.printStackTrace();
//            }
//        }
//
//    }
//
//
//    /**
//     * 群发自定义消息
//     * */
//    public static void sendInfo(String message) throws IOException {
//        System.out.println(message);
//        for (WebSocketServer item : webSocketSet) {
//            try {
//                item.sendMessage(message);
//            } catch (IOException e) {
//                continue;
//            }
//        }
//    }
//
//    public static synchronized int getOnlineCount() {
//        return onlineCount;
//    }
//
//    public static synchronized void addOnlineCount() {
//        WebSocketServer.onlineCount++;
//    }
//
//    public static synchronized void subOnlineCount() {
//        WebSocketServer.onlineCount--;
//    }
//}
