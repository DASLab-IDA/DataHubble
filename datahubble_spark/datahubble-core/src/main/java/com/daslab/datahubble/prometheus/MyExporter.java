/*
    自定义Exporter
    用于直接访问Controller中接口执行时间,得到执行时间指标
*/
package com.daslab.datahubble.prometheus;

import com.daslab.datahubble.controller.Controller;
import com.daslab.datahubble.controller.AnalysisController;
import io.prometheus.client.Collector;
import io.prometheus.client.GaugeMetricFamily;
import io.prometheus.client.SummaryMetricFamily;

import java.util.*;

public class MyExporter extends Collector {

    private long lastExeTime = 0;//最后一次完成流程到执行时效
    private long executeTime = 0;//完成n次流程执行时间
    private long interactionTime = 0;//执行到现在总共交互时间之和

    @Override
    public List<MetricFamilySamples> collect() {

        List<MetricFamilySamples> mfs = new ArrayList<>();

        // 创建metrics指标
        GaugeMetricFamily rangeRequest=
                new GaugeMetricFamily("range_request_latency_seconds","last_http_latency", Arrays.asList("path","method","code"));
        GaugeMetricFamily visRecRequest=
                new GaugeMetricFamily("vis_rec_request_latency_seconds","last_http_latency", Arrays.asList("path","method","code"));
        GaugeMetricFamily methodRecRequest=
                new GaugeMetricFamily("method_rec_request_latency_seconds","last_http_latency", Arrays.asList("path","method","code"));
        GaugeMetricFamily analysisPathRequest=
                new GaugeMetricFamily("analysis_path_request_latency_seconds","last_http_latency", Arrays.asList("path","method","code"));
        GaugeMetricFamily analysisResRequest=
                new GaugeMetricFamily("analysis_res_request_latency_seconds","last_http_latency", Arrays.asList("path","method","code"));
        // 执行时效,交互时间
        GaugeMetricFamily smExecuteTime=
                new GaugeMetricFamily("smart_interaction_execution_time","sm_process_summary", Collections.singletonList("label"));
        SummaryMetricFamily smInteractionTime=
                new SummaryMetricFamily("smart_interaction_interaction_time","last_http_latency", Collections.singletonList("label"));

        // 设置指标的label以及value
        rangeRequest.addMetric(Arrays.asList("/api/data/range","POST", String.valueOf(Controller.rangeCode)), Controller.rangeTime);
        visRecRequest.addMetric(Arrays.asList("/api/data/deepeye","POST",String.valueOf(Controller.visRecCode)),Controller.visRecTime);
        methodRecRequest.addMetric(Arrays.asList("/api/data/methodrec","POST",String.valueOf(Controller.methodRecCode)),Controller.methodRecTime);
        analysisPathRequest.addMetric(Arrays.asList("/api/data/AnalysisPath","POST",String.valueOf(AnalysisController.analysisPathCode)),
                AnalysisController.analysisPathTime);
        analysisResRequest.addMetric(Arrays.asList("/api/AnalysisResult","POST",String.valueOf(AnalysisController.analysisResCode))
                , AnalysisController.analysisResTime);

        // 执行时效,交互时间
        executeTime = Controller.rangeTime_1+Controller.visRecTime_1+Controller.methodRecTime_1
                + AnalysisController.analysisResTime_1+ AnalysisController.analysisPathTime_1;
            //完成过流程,才能计算实行时效
        if(AnalysisController.smProcessCount != 0)
            lastExeTime = executeTime / AnalysisController.smProcessCount;
        smExecuteTime.addMetric(Collections.singletonList("执行时效"), lastExeTime);

        interactionTime += Controller.rangeTime+Controller.visRecTime+Controller.methodRecTime
                + AnalysisController.analysisResTime+ AnalysisController.analysisPathTime;
        int count = Controller.rangeCount+Controller.visRecCount+Controller.methodRecCount
                + AnalysisController.analysisPathCount+ AnalysisController.analysisResCount;
        smInteractionTime.addMetric(Collections.singletonList("交互时间"),count, interactionTime);

        //清零时间
        reSet();

        mfs.add(rangeRequest);
        mfs.add(visRecRequest);
        mfs.add(methodRecRequest);
        mfs.add(analysisPathRequest);
        mfs.add(analysisResRequest);
        mfs.add(smInteractionTime);
        mfs.add(smExecuteTime);
        return mfs;
    }

    private void reSet(){
        // time
        Controller.rangeTime = 0;
        Controller.visRecTime = 0;
        Controller.methodRecTime = 0;
        AnalysisController.analysisResTime = 0;
        AnalysisController.analysisPathTime = 0;

        // 完成过流程才清零流程中过程的时间
        if(AnalysisController.smProcessCount !=0 ){
            AnalysisController.smProcessCount = 0;
            Controller.rangeTime_1 = 0;
            Controller.visRecTime_1 = 0;
            Controller.methodRecTime_1 = 0;
            AnalysisController.analysisResTime_1 = 0;
            AnalysisController.analysisPathTime_1 = 0;
            executeTime = 0;
        }
    }
}
