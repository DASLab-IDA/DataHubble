package com.daslab.datahubble.verdict;

import com.daslab.SparkExecutor;
import com.daslab.datahubble.model.Table;
import org.verdictdb.VerdictContext;
import org.verdictdb.VerdictSingleResult;
import org.verdictdb.exception.VerdictDBException;

/**
 * @author zyz
 * @version 2019-04-23
 */
public class VerdictExecutor {
    private static VerdictExecutor verdictExecutor;
    private VerdictContext verdictContext;

    private VerdictExecutor() {
        try {
            SparkExecutor sparkExecutor = new SparkExecutor();
            verdictContext = VerdictContext.fromSparkSession(sparkExecutor.getSparkSession());
        } catch (VerdictDBException e) {
            e.printStackTrace();
        }
    }

    public static VerdictExecutor getInstance() {
        if (verdictExecutor == null){
            synchronized(VerdictExecutor.class){
                if (verdictExecutor == null)
                    verdictExecutor = new VerdictExecutor();
            }
        }
        return verdictExecutor;
    }

    public void createSample(Table originTable, Table sampleTable, double ratio) {
        try {
            // CREATE SCRAMBLE zyz.websales_home_10 FROM bigbench.websales_home RATIO 0.1
            verdictContext.sql(String.format("CREATE SCRAMBLE %s FROM %s RATIO %f", sampleTable.toSQL(), originTable.toSQL(), ratio));
        } catch (VerdictDBException e) {
            e.printStackTrace();
        }
    }

    public VerdictSingleResult sql(String sql) {
        try {
            return verdictContext.sql(sql);
        } catch (VerdictDBException e) {
            e.printStackTrace();
        }
        return null;
    }
}
