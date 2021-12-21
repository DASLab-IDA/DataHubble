package com.daslab.datahubble.http;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;

public class Http {
    public static String sendPost(String url_str, String content) {
        String result = new String();
        try {
            System.out.println("POSTing to " + url_str);
            URL url= new URL(url_str);
            URLConnection con = url.openConnection();
            HttpURLConnection http = (HttpURLConnection) con;
            http.setRequestMethod("POST");
            http.setDoOutput(true);
            http.setDoInput(true);
            http.setRequestProperty("Content-Type", "application/json;");
            http.setRequestProperty("content-length", "101");
            http.setRequestProperty("Authorization", "Basic QURNSU46S1lMSU4=");
            http.connect();

            try (DataOutputStream os = new DataOutputStream(http.getOutputStream())) {
                os.write(content.getBytes("UTF-8"));
                BufferedReader in = new BufferedReader(new InputStreamReader(http.getInputStream()));
                String line = "";
                while ((line = in.readLine()) != null) {
                    result += line;
                }
            }
            http.disconnect();
            System.out.println("create information posted\n");

        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("POST Failed: " + url_str);
        }
        return result;
    }
//        String result = "";
//        BufferedReader bufferedReader = null;
//        PrintWriter out = null;
//        try {
//            //1、2、读取并将url转变为URL类对象
//            URL realUrl = new URL(url);
//
//            //3、打开和URL之间的连接
//            URLConnection connection = realUrl.openConnection();
//            //4、设置通用的请求属性
//            connection.setRequestProperty("accept", "*/*");
//            connection.setRequestProperty("Content-Type", "application/json;");
//            connection.setRequestProperty("Authorization", "Basic QURNSU46S1lMSU4=");
//
//            // 发送POST请求必须设置如下两行
//            connection.setDoInput(true);
//            connection.setDoOutput(true);
//
//            //5、建立实际的连接
//            //connection.connect();
//            //获取URLConnection对象对应的输出流
//            out = new PrintWriter(connection.getOutputStream());
//            //发送请求参数
//            out.print(param);
//            //flush输出流的缓冲
//            out.flush();
//            //
//
//            //6、定义BufferedReader输入流来读取URL的响应内容
//            bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream(),"UTF-8"));
//            String line;
//            while(null != (line = bufferedReader.readLine())) {
//                result += line;
//            }
//        }catch (Exception e) {
//            // TODO: handle exception
//            System.out.println("Time Out"  + e);
//            e.printStackTrace();
//        }finally {        //使用finally块来关闭输出流、输入流
//            try {
//                if(null != out) {
//                    out.close();
//                }
//                if(null != bufferedReader) {
//                    bufferedReader.close();
//                }
//            }catch (Exception e2) {
//                // TODO: handle exception
//                e2.printStackTrace();
//            }
//        }
//        return result;
//    }
}
