package com.daslab.datahubble.service;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;

/**
 * @author :qym
 * @date: 2021/03/14
 * @description:
 */

@Service
public interface KylinService {
    JSONArray executesql(String sql, boolean fromcube);
    JSONArray executesqlForSum(String sql, Date start, String scale);
    JSONObject executesqlForRanges(String sql, String[] filter, ArrayList<String> recommendColumns, String tablename);
    JSONObject executesqlForRanges(String dbname, String sql, String[] filter, ArrayList<String> recommendColumns, String tablename);
    JSONArray executesqlForDistributions(String sql);
    JSONArray executesqlForDistribution(String sql, String colname);
    JSONObject getSqlResult(String rawSql, String dbname)  throws Exception;

}
