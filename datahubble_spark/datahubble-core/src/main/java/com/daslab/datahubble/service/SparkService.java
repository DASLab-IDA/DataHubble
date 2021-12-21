package com.daslab.datahubble.service;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;

@Service
public interface SparkService {
    JSONArray executesql(String sql, boolean fromcube);
    JSONArray executesqlForSum(String sql, Date start, String scale);
    JSONObject executesqlForRanges(String sql, String[] filter, ArrayList<String> recommendColumns, String tablename);
    JSONArray executesqlForDistributions(String sql);
    JSONObject getSqlResult(String sql);
}
