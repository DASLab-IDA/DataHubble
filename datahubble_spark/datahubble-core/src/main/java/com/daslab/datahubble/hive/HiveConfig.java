package com.daslab.datahubble.hive;

import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@Configuration
public class HiveConfig {
    private static Connection conn;

    public static String MASTER;

    static {
        try {
            Class.forName("org.apache.hive.jdbc.HiveDriver");
            MASTER = readIPConfiguration();
            conn = DriverManager.getConnection("jdbc:hive2://" + MASTER + ":10010/bigbench_10t_sample;auth=none");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            System.exit(1);
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static Connection getConnnection() {
        return conn;
    }

    public static String readIPConfiguration() throws Exception {
        File file = new File("ipconfiguration.txt");
        FileInputStream inputStream = new FileInputStream(file);
        int length = inputStream.available();
        byte bytes[] = new byte[length];
        inputStream.read(bytes);
        inputStream.close();
        String str = new String(bytes, StandardCharsets.UTF_8);
        if (str.charAt(str.length()-1)=='\n' || str.charAt(str.length()-1)=='\t') {
            str = str.substring(0, str.length()-1);
        }
        System.out.println("============ master ip : " + str);
        return str;
    }

    public static PreparedStatement prepare(Connection conn, String sql) {
        PreparedStatement ps = null;
        try {
            ps = conn.prepareStatement(sql);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return ps;
    }

}