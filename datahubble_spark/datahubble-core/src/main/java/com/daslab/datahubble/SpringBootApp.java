/* 
 * Author ::. Sivateja Kandula | www.java4s.com 
 *
 */

package com.daslab.datahubble;
import com.daslab.datahubble.prometheus.MyExporter;
import com.daslab.datahubble.prometheus.PrometheusMetricsInterceptor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

// 启动类引入注解
import io.prometheus.client.spring.boot.EnablePrometheusEndpoint;
import io.prometheus.client.spring.boot.EnableSpringBootMetricsCollector;
// DefaultExporter会在metrics endpoint中统计当前应用JVM的相关信息
//import io.prometheus.client.hotspot.DefaultExports;


@SpringBootApplication
@EnablePrometheusEndpoint
@EnableSpringBootMetricsCollector
public class SpringBootApp extends WebMvcConfigurerAdapter implements CommandLineRunner{
	public static void main(String[] args) {
		 SpringApplication.run(SpringBootApp.class, args);
	}

	@Override
	public void run(String... strings) throws Exception {
		//DefaultExports.initialize();
        MyExporter myExporter = new MyExporter();
        myExporter.register();
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(new PrometheusMetricsInterceptor()).addPathPatterns("/**");
	}
}