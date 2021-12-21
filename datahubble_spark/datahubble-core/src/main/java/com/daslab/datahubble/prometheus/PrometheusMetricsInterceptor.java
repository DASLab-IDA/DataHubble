/*
 * Author :xty 2019.11.7 20:22
 *
 * prometheus拦截器
 * 可以拦截一个HTTP请求的不同阶段
 */

package com.daslab.datahubble.prometheus;

import io.prometheus.client.Summary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.prometheus.client.Counter;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class PrometheusMetricsInterceptor extends HandlerInterceptorAdapter {

    // 所有请求
    private static final Counter requestCount = Counter.build().name("smart_interaction_http_requests_total")
            .labelNames("path","method","code").help("Total request.").register();

    // 筛选范围range
    private static final Summary rangeRequest = Summary.build().name("range_http_requests_latency_seconds_summary")
            .labelNames("path","method","code").help("RangeSelection Request latency in seconds.").register();
    private Summary.Timer rangeTimer;

    // 可视化推荐visRec
    private static final Summary visRecRequest = Summary.build().name("vis_rec_http_requests_latency_seconds_summary")
            .labelNames("path","method","code").help("VisRecommendation Request latency in seconds.").register();
    private Summary.Timer visRecTimer;

    // 方法推荐methodRec
    private static final Summary methodRecRequest = Summary.build().name("method_rec_http_requests_latency_seconds_summary")
            .labelNames("path","method","code").help("MethodRecommendation Request latency in seconds.").register();
    private Summary.Timer methodRecTimer;

    // 分析路径analysisPath
    private static final Summary analysisPathRequest = Summary.build().name("analysis_path_http_requests_latency_seconds_summary")
            .labelNames("path","method","code").help("AnalysisPath Request latency in seconds.").register();
    private Summary.Timer analysisPathTimer;

    // 分析结果analysisResult
    private static final Summary analysisResRequest = Summary.build().name("analysis_res_http_requests_latency_seconds_summary")
            .labelNames("path","method","code").help("AnalysisRes Request latency in seconds.").register();
    private Summary.Timer analysisResTimer;

    // 带用户思考时间的流程
    private static final Summary smExeTimeWithUserThought = Summary.build().name("smart_interaction_execution_time_with_user_thought_summary")
            .labelNames("label").help("execute time with user thought").register();
    private Summary.Timer smExeTimeWithUserThoughtTimer;

    @Override
    public boolean preHandle(javax.servlet.http.HttpServletRequest request, javax.servlet.http.HttpServletResponse response, Object handler) throws Exception {
        Logger logger = LoggerFactory.getLogger(PrometheusMetricsInterceptor.class);
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        int status = response.getStatus();
        //logger.info("================================================");
        //logger.info("Prometheus request: " + requestURI);

        //range
        if(requestURI.equalsIgnoreCase("/api/data/range")){
            rangeTimer = rangeRequest.labels(requestURI, method, String.valueOf(status)).startTimer();
            smExeTimeWithUserThoughtTimer = smExeTimeWithUserThought.labels("smart_interaction_execution_time").startTimer();
        }
        //visRec
        else if(requestURI.equalsIgnoreCase("/api/data/deepeye")) {
            visRecTimer = visRecRequest.labels(requestURI, method, String.valueOf(status)).startTimer();
        }
        //methodRec
        else if(requestURI.equalsIgnoreCase("/api/data/methodrec")){
            methodRecTimer = methodRecRequest.labels(requestURI, method, String.valueOf(status)).startTimer();
        }
        //analysisPath
        else if(requestURI.equalsIgnoreCase("/api/data/AnalysisPath")){
            analysisPathTimer = analysisPathRequest.labels(requestURI, method, String.valueOf(status)).startTimer();
        }
        else if(requestURI.equalsIgnoreCase("/api/AnalysisResult")){
            analysisResTimer = analysisResRequest.labels(requestURI, method, String.valueOf(status)).startTimer();
        }

        return super.preHandle(request, response, handler);
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        int status = response.getStatus();
        requestCount.labels(requestURI, method, String.valueOf(status)).inc();
        if(requestURI.equalsIgnoreCase("/api/data/range")){
            rangeTimer.observeDuration();
        }
        else if(requestURI.equalsIgnoreCase("/api/data/deepeye")){
            visRecTimer.observeDuration();
        }
        else if (requestURI.equalsIgnoreCase("/api/data/methodrec")){
            methodRecTimer.observeDuration();
        }
        else if (requestURI.equalsIgnoreCase("/api/data/AnalysisPath")){
            analysisPathTimer.observeDuration();
        }
        else if(requestURI.equalsIgnoreCase("/api/AnalysisResult")){
            analysisResTimer.observeDuration();
            smExeTimeWithUserThoughtTimer.observeDuration();
        }
        super.afterCompletion(request, response, handler, ex);
    }



}
