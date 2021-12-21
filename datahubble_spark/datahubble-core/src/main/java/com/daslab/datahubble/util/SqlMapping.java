package com.daslab.datahubble.util;

/**
 * @author qym
 * @date 2021/07/08
 **/
public class SqlMapping {

    private String rawSql;
    private String newSql;
    public static String[] originQueries = new String[22];
    public static String[] kylinQueries = new String[22];
    static String originQuery1 = "selectl_returnflag,l_linestatus,sum(l_quantity)assum_qty,sum(l_extendedprice)assum_base_price,sum(l_extendedprice*(1-l_discount))assum_disc_price,sum(l_extendedprice*(1-l_discount)*(1+l_tax))assum_charge,avg(l_quantity)asavg_qty,avg(l_extendedprice)asavg_price,avg(l_discount)asavg_disc,count(*)ascount_orderfromlineitemwherel_shipdate<='1998-09-16'groupbyl_returnflag,l_linestatusorderbyl_returnflag,l_linestatus;";
    static String originQuery2 = "dropviewq2_min_ps_supplycost;createviewq2_min_ps_supplycostasselectp_partkeyasmin_p_partkey,min(ps_supplycost)asmin_ps_supplycostfrompart,partsupp,supplier,nation,regionwherep_partkey=ps_partkeyands_suppkey=ps_suppkeyands_nationkey=n_nationkeyandn_regionkey=r_regionkeyandr_name='EUROPE'groupbyp_partkey;selects_acctbal,s_name,n_name,p_partkey,p_mfgr,s_address,s_phone,s_commentfrompart,supplier,partsupp,nation,region,q2_min_ps_supplycostwherep_partkey=ps_partkeyands_suppkey=ps_suppkeyandp_size=37andp_typelike'%COPPER'ands_nationkey=n_nationkeyandn_regionkey=r_regionkeyandr_name='EUROPE'andps_supplycost=min_ps_supplycostandp_partkey=min_p_partkeyorderbys_acctbaldesc,n_name,s_name,p_partkeylimit100;";
    static String originQuery3 = "selectl_orderkey,sum(l_extendedprice*(1-l_discount))asrevenue,o_orderdate,o_shippriorityfromcustomer,orders,lineitemwherec_mktsegment='BUILDING'andc_custkey=o_custkeyandl_orderkey=o_orderkeyando_orderdate<'1995-03-22'andl_shipdate>'1995-03-22'groupbyl_orderkey,o_orderdate,o_shippriorityorderbyrevenuedesc,o_orderdatelimit10;";
    static String originQuery4 = "selecto_orderpriority,count(*)asorder_countfromordersasowhereo_orderdate>='1996-05-01'ando_orderdate<'1996-08-01'andexists(select*fromlineitemwherel_orderkey=o.o_orderkeyandl_commitdate<l_receiptdate)groupbyo_orderpriorityorderbyo_orderpriority;";
    static String originQuery5 = "selectn_name,sum(l_extendedprice*(1-l_discount))asrevenuefromcustomer,orders,lineitem,supplier,nation,regionwherec_custkey=o_custkeyandl_orderkey=o_orderkeyandl_suppkey=s_suppkeyandc_nationkey=s_nationkeyands_nationkey=n_nationkeyandn_regionkey=r_regionkeyandr_name='AFRICA'ando_orderdate>='1993-01-01'ando_orderdate<'1994-01-01'groupbyn_nameorderbyrevenuedesc;";
    static String originQuery6 = "selectsum(l_extendedprice*l_discount)asrevenuefromlineitemwherel_shipdate>='1993-01-01'andl_shipdate<'1994-01-01'andl_discountbetween0.06-0.01and0.06+0.01andl_quantity<25;";
    static String originQuery7 = "selectsupp_nation,cust_nation,l_year,sum(volume)asrevenuefrom(selectn1.n_nameassupp_nation,n2.n_nameascust_nation,year(l_shipdate)asl_year,l_extendedprice*(1-l_discount)asvolumefromsupplier,lineitem,orders,customer,nationn1,nationn2wheres_suppkey=l_suppkeyando_orderkey=l_orderkeyandc_custkey=o_custkeyands_nationkey=n1.n_nationkeyandc_nationkey=n2.n_nationkeyand((n1.n_name='KENYA'andn2.n_name='PERU')or(n1.n_name='PERU'andn2.n_name='KENYA'))andl_shipdatebetween'1995-01-01'and'1996-12-31')asshippinggroupbysupp_nation,cust_nation,l_yearorderbysupp_nation,cust_nation,l_year;";
    static String originQuery8 = "selecto_year,sum(casewhennation='PERU'thenvolumeelse0end)/sum(volume)asmkt_sharefrom(selectyear(o_orderdate)aso_year,l_extendedprice*(1-l_discount)asvolume,n2.n_nameasnationfrompart,supplier,lineitem,orders,customer,nationn1,nationn2,regionwherep_partkey=l_partkeyands_suppkey=l_suppkeyandl_orderkey=o_orderkeyando_custkey=c_custkeyandc_nationkey=n1.n_nationkeyandn1.n_regionkey=r_regionkeyandr_name='AMERICA'ands_nationkey=n2.n_nationkeyando_orderdatebetween'1995-01-01'and'1996-12-31'andp_type='ECONOMYBURNISHEDNICKEL')asall_nationsgroupbyo_yearorderbyo_year;";
    static String originQuery9 = "selectnation,o_year,sum(amount)assum_profitfrom(selectn_nameasnation,year(o_orderdate)aso_year,l_extendedprice*(1-l_discount)-ps_supplycost*l_quantityasamountfrompart,supplier,lineitem,partsupp,orders,nationwheres_suppkey=l_suppkeyandps_suppkey=l_suppkeyandps_partkey=l_partkeyandp_partkey=l_partkeyando_orderkey=l_orderkeyands_nationkey=n_nationkeyandp_namelike'%plum%')asprofitgroupbynation,o_yearorderbynation,o_yeardesc;";
    static String originQuery10 = "selectc_custkey,c_name,sum(l_extendedprice*(1-l_discount))asrevenue,c_acctbal,n_name,c_address,c_phone,c_commentfromcustomer,orders,lineitem,nationwherec_custkey=o_custkeyandl_orderkey=o_orderkeyando_orderdate>='1993-07-01'ando_orderdate<'1993-10-01'andl_returnflag='R'andc_nationkey=n_nationkeygroupbyc_custkey,c_name,c_acctbal,c_phone,n_name,c_address,c_commentorderbyrevenuedesclimit20;";
    static String originQuery11 = "dropviewq11_part_tmp_cached;dropviewq11_sum_tmp_cached;createviewq11_part_tmp_cachedasselectps_partkey,sum(ps_supplycost*ps_availqty)aspart_valuefrompartsupp,supplier,nationwhereps_suppkey=s_suppkeyands_nationkey=n_nationkeyandn_name='GERMANY'groupbyps_partkey;createviewq11_sum_tmp_cachedasselectsum(part_value)astotal_valuefromq11_part_tmp_cached;selectps_partkey,part_valueasvaluefrom(selectps_partkey,part_value,total_valuefromq11_part_tmp_cachedjoinq11_sum_tmp_cached)awherepart_value>total_value*0.0001orderbyvaluedesc;";
    static String originQuery12 = "selectl_shipmode,sum(casewheno_orderpriority='1-URGENT'oro_orderpriority='2-HIGH'then1else0end)ashigh_line_count,sum(casewheno_orderpriority<>'1-URGENT'ando_orderpriority<>'2-HIGH'then1else0end)aslow_line_countfromorders,lineitemwhereo_orderkey=l_orderkeyandl_shipmodein('REGAIR','MAIL')andl_commitdate<l_receiptdateandl_shipdate<l_commitdateandl_receiptdate>='1995-01-01'andl_receiptdate<'1996-01-01'groupbyl_shipmodeorderbyl_shipmode;";
    static String originQuery13 = "selectc_count,count(*)ascustdistfrom(selectc_custkey,count(o_orderkey)asc_countfromcustomerleftouterjoinordersonc_custkey=o_custkeyando_commentnotlike'%unusual%accounts%'groupbyc_custkey)c_ordersgroupbyc_countorderbycustdistdesc,c_countdesc;";
    static String originQuery14 = "select100.00*sum(casewhenp_typelike'PROMO%'thenl_extendedprice*(1-l_discount)else0end)/sum(l_extendedprice*(1-l_discount))aspromo_revenuefromlineitem,partwherel_partkey=p_partkeyandl_shipdate>='1995-08-01'andl_shipdate<'1995-09-01';";
    static String originQuery15 = "dropviewrevenue_cached;dropviewmax_revenue_cached;createviewrevenue_cachedasselectl_suppkeyassupplier_no,sum(l_extendedprice*(1-l_discount))astotal_revenuefromlineitemwherel_shipdate>='1996-01-01'andl_shipdate<'1996-04-01'groupbyl_suppkey;createviewmax_revenue_cachedasselectmax(total_revenue)asmax_revenuefromrevenue_cached;selects_suppkey,s_name,s_address,s_phone,total_revenuefromsupplier,revenue_cached,max_revenue_cachedwheres_suppkey=supplier_noandtotal_revenue=max_revenueorderbys_suppkey;\n";
    static String originQuery16 = "selectp_brand,p_type,p_size,count(distinctps_suppkey)assupplier_cntfrompartsupp,partwherep_partkey=ps_partkeyandp_brand<>'Brand#34'andp_typenotlike'ECONOMYBRUSHED%'andp_sizein(22,14,27,49,21,33,35,28)andpartsupp.ps_suppkeynotin(selects_suppkeyfromsupplierwheres_commentlike'%Customer%Complaints%')groupbyp_brand,p_type,p_sizeorderbysupplier_cntdesc,p_brand,p_type,p_size;";
    static String originQuery17 = "withq17_partas(selectp_partkeyfrompartwherep_brand='Brand#23'andp_container='MEDBOX'),q17_avgas(selectl_partkeyast_partkey,0.2*avg(l_quantity)ast_avg_quantityfromlineitemwherel_partkeyIN(selectp_partkeyfromq17_part)groupbyl_partkey),q17_priceas(selectl_quantity,l_partkey,l_extendedpricefromlineitemwherel_partkeyIN(selectp_partkeyfromq17_part))selectcast(sum(l_extendedprice)/7.0asdecimal(32,2))asavg_yearlyfromq17_avg,q17_pricewheret_partkey=l_partkeyandl_quantity<t_avg_quantity;";
    static String originQuery18 = "dropviewq18_tmp_cached;droptableq18_large_volume_customer_cached;createviewq18_tmp_cachedasselectl_orderkey,sum(l_quantity)ast_sum_quantityfromlineitemwherel_orderkeyisnotnullgroupbyl_orderkey;createtableq18_large_volume_customer_cachedasselectc_name,c_custkey,o_orderkey,o_orderdate,o_totalprice,sum(l_quantity)fromcustomer,orders,q18_tmp_cachedt,lineitemlwherec_custkey=o_custkeyando_orderkey=t.l_orderkeyando_orderkeyisnotnullandt.t_sum_quantity>300ando_orderkey=l.l_orderkeyandl.l_orderkeyisnotnullgroupbyc_name,c_custkey,o_orderkey,o_orderdate,o_totalpriceorderbyo_totalpricedesc,o_orderdatelimit100;";
    static String originQuery19 = "selectsum(l_extendedprice*(1-l_discount))asrevenuefromlineitem,partwhere(p_partkey=l_partkeyandp_brand='Brand#32'andp_containerin('SMCASE','SMBOX','SMPACK','SMPKG')andl_quantity>=7andl_quantity<=7+10andp_sizebetween1and5andl_shipmodein('AIR','AIRREG')andl_shipinstruct='DELIVERINPERSON')or(p_partkey=l_partkeyandp_brand='Brand#35'andp_containerin('MEDBAG','MEDBOX','MEDPKG','MEDPACK')andl_quantity>=15andl_quantity<=15+10andp_sizebetween1and10andl_shipmodein('AIR','AIRREG')andl_shipinstruct='DELIVERINPERSON')or(p_partkey=l_partkeyandp_brand='Brand#24'andp_containerin('LGCASE','LGBOX','LGPACK','LGPKG')andl_quantity>=26andl_quantity<=26+10andp_sizebetween1and15andl_shipmodein('AIR','AIRREG')andl_shipinstruct='DELIVERINPERSON');";
    static String originQuery20 = "withtmp1as(selectp_partkeyfrompartwherep_namelike'forest%'),tmp2as(selects_name,s_address,s_suppkeyfromsupplier,nationwheres_nationkey=n_nationkeyandn_name='CANADA'),tmp3as(selectl_partkey,0.5*sum(l_quantity)assum_quantity,l_suppkeyfromlineitem,tmp2wherel_shipdate>='1994-01-01'andl_shipdate<='1995-01-01'andl_suppkey=s_suppkeygroupbyl_partkey,l_suppkey),tmp4as(selectps_partkey,ps_suppkey,ps_availqtyfrompartsuppwhereps_partkeyIN(selectp_partkeyfromtmp1)),tmp5as(selectps_suppkeyfromtmp4,tmp3whereps_partkey=l_partkeyandps_suppkey=l_suppkeyandps_availqty>sum_quantity)selects_name,s_addressfromsupplierwheres_suppkeyIN(selectps_suppkeyfromtmp5)orderbys_name;";
    static String originQuery21 = "createtemporarytablel3storedasorcasselectl_orderkey,count(distinctl_suppkey)ascntSuppfromlineitemwherel_receiptdate>l_commitdateandl_orderkeyisnotnullgroupbyl_orderkeyhavingcntSupp=1;withlocationas(selectsupplier.*fromsupplier,nationwheres_nationkey=n_nationkeyandn_name='SAUDIARABIA')selects_name,count(*)asnumwaitfrom(selectli.l_suppkey,li.l_orderkeyfromlineitemlijoinordersoonli.l_orderkey=o.o_orderkeyando.o_orderstatus='F'join(selectl_orderkey,count(distinctl_suppkey)ascntSuppfromlineitemgroupbyl_orderkey)l2onli.l_orderkey=l2.l_orderkeyandli.l_receiptdate>li.l_commitdateandl2.cntSupp>1)l1joinl3onl1.l_orderkey=l3.l_orderkeyjoinlocationsonl1.l_suppkey=s.s_suppkeygroupbys_nameorderbynumwaitdesc,s_namelimit100;";
    static String originQuery22 = "dropviewq22_customer_tmp_cached;dropviewq22_customer_tmp1_cached;dropviewq22_orders_tmp_cached;createviewifnotexistsq22_customer_tmp_cachedasselectc_acctbal,c_custkey,substr(c_phone,1,2)ascntrycodefromcustomerwheresubstr(c_phone,1,2)='13'orsubstr(c_phone,1,2)='31'orsubstr(c_phone,1,2)='23'orsubstr(c_phone,1,2)='29'orsubstr(c_phone,1,2)='30'orsubstr(c_phone,1,2)='18'orsubstr(c_phone,1,2)='17';createviewifnotexistsq22_customer_tmp1_cachedasselectavg(c_acctbal)asavg_acctbalfromq22_customer_tmp_cachedwherec_acctbal>0.00;createviewifnotexistsq22_orders_tmp_cachedasselecto_custkeyfromordersgroupbyo_custkey;selectcntrycode,count(1)asnumcust,sum(c_acctbal)astotacctbalfrom(selectcntrycode,c_acctbal,avg_acctbalfromq22_customer_tmp1_cachedct1join(selectcntrycode,c_acctbalfromq22_orders_tmp_cachedotrightouterjoinq22_customer_tmp_cachedctonct.c_custkey=ot.o_custkeywhereo_custkeyisnull)ct2)awherec_acctbal>avg_acctbalgroupbycntrycodeorderbycntrycode;";


    static String kylinQuery1 = "select\n" +
            "    l_returnflag,\n" +
            "    l_linestatus,\n" +
            "    sum(l_quantity) as sum_qty,\n" +
            "    sum(l_extendedprice) as sum_base_price,\n" +
            "    sum(l_saleprice) as sum_disc_price,\n" +
            "    sum(l_saleprice) + sum(l_taxprice) as sum_charge,\n" +
            "    avg(l_quantity) as avg_qty,\n" +
            "    avg(l_extendedprice) as avg_price,\n" +
            "    avg(l_discount) as avg_disc,\n" +
            "    count(*) as count_order\n" +
            "from\n" +
            "    tpch1.v_lineitem\n" +
            "where\n" +
            "    l_shipdate <= '1998-09-16'\n" +
            "group by\n" +
            "    l_returnflag,\n" +
            "    l_linestatus\n" +
            "order by\n" +
            "    l_returnflag,\n" +
            "    l_linestatus;";
    static String kylinQuery2 = "with q2_min_ps_supplycost as (\n" +
            "\tselect\n" +
            "\t\tp_partkey as min_p_partkey,\n" +
            "\t\tmin(ps_supplycost) as min_ps_supplycost\n" +
            "\tfrom\n" +
            "\t\ttpch1.v_partsupp\n" +
            "\t\tinner join tpch1.part on p_partkey = ps_partkey\n" +
            "\t\tinner join tpch1.supplier on s_suppkey = ps_suppkey\n" +
            "\t\tinner join tpch1.nation on s_nationkey = n_nationkey\n" +
            "\t\tinner join tpch1.region on n_regionkey = r_regionkey\n" +
            "\twhere\n" +
            "\t\tr_name = 'EUROPE'\n" +
            "\tgroup by\n" +
            "\t\tp_partkey\n" +
            ")\n" +
            "select\n" +
            "\ts_acctbal,\n" +
            "\ts_name,\n" +
            "\tn_name,\n" +
            "\tp_partkey,\n" +
            "\tp_mfgr,\n" +
            "\ts_address,\n" +
            "\ts_phone,\n" +
            "\ts_comment\n" +
            "from\n" +
            "\ttpch1.v_partsupp\n" +
            "\tinner join tpch1.part on p_partkey = ps_partkey\n" +
            "\tinner join tpch1.supplier on s_suppkey = ps_suppkey\n" +
            "\tinner join tpch1.nation on s_nationkey = n_nationkey\n" +
            "\tinner join tpch1.region on n_regionkey = r_regionkey\n" +
            "\tinner join q2_min_ps_supplycost on ps_supplycost = min_ps_supplycost and p_partkey = min_p_partkey\n" +
            "where\n" +
            "\tp_size = 37\n" +
            "\tand p_type like '%COPPER'\n" +
            "\tand r_name = 'EUROPE'\t\n" +
            "order by\n" +
            "\ts_acctbal desc,\n" +
            "\tn_name,\n" +
            "\ts_name,\n" +
            "\tp_partkey\n" +
            "limit 100;";
    static String kylinQuery3 = "select\n" +
            "    l_orderkey,\n" +
            "    sum(l_saleprice) as revenue,\n" +
            "    o_orderdate,\n" +
            "    o_shippriority\n" +
            "from\n" +
            "    tpch1.v_lineitem\n" +
            "    inner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "    inner join tpch1.customer on c_custkey = o_custkey\n" +
            "where\n" +
            "    c_mktsegment = 'BUILDING'\n" +
            "    and o_orderdate < '1995-03-22'\n" +
            "    and l_shipdate > '1995-03-22'\n" +
            "group by\n" +
            "    l_orderkey,\n" +
            "    o_orderdate,\n" +
            "    o_shippriority\n" +
            "order by\n" +
            "    revenue desc,\n" +
            "    o_orderdate\n" +
            "limit 10;";
    static String kylinQuery4 = "select\n" +
            "    o_orderpriority,\n" +
            "    count(*) as order_count\n" +
            "from\n" +
            "    (\n" +
            "        select\n" +
            "            l_orderkey,\n" +
            "            o_orderpriority\n" +
            "        from\n" +
            "            tpch1.v_lineitem\n" +
            "            inner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "        where\n" +
            "            o_orderdate >= '1996-05-01'\n" +
            "            and o_orderdate < '1996-08-01'\n" +
            "            and l_receiptdelayed = 1\n" +
            "        group by\n" +
            "            l_orderkey,\n" +
            "            o_orderpriority\n" +
            "    ) t\n" +
            "group by\n" +
            "    t.o_orderpriority\n" +
            "order by\n" +
            "    t.o_orderpriority;";
    static String kylinQuery5 = "select\n" +
            "    sn.n_name,\n" +
            "    sum(l_saleprice) as revenue\n" +
            "from\n" +
            "    tpch1.v_lineitem\n" +
            "    inner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "    inner join tpch1.customer on o_custkey = c_custkey\n" +
            "    inner join tpch1.nation cn on c_nationkey = cn.n_nationkey\n" +
            "    inner join tpch1.supplier on l_suppkey = s_suppkey\n" +
            "    inner join tpch1.nation sn on s_nationkey = sn.n_nationkey\n" +
            "    inner join tpch1.region on sn.n_regionkey = r_regionkey\n" +
            "where\n" +
            "    r_name = 'AFRICA'\n" +
            "    and cn.n_name = sn.n_name\n" +
            "    and o_orderdate >= '1993-01-01'\n" +
            "    and o_orderdate < '1994-01-01'\n" +
            "group by\n" +
            "    sn.n_name\n" +
            "order by\n" +
            "    revenue desc;";
    static String kylinQuery6 = "select\n" +
            "    sum(l_extendedprice) - sum(l_saleprice) as revenue\n" +
            "from\n" +
            "    tpch1.v_lineitem\n" +
            "where\n" +
            "    l_shipdate >= '1993-01-01'\n" +
            "    and l_shipdate < '1994-01-01'\n" +
            "    and l_discount between 0.06 - 0.01 and 0.06 + 0.01\n" +
            "    and l_quantity < 25;";
    static String kylinQuery7 = "select\n" +
            "\tsupp_nation,\n" +
            "\tcust_nation,\n" +
            "\tl_year,\n" +
            "\tsum(volume) as revenue\n" +
            "from\n" +
            "\t(\n" +
            "\t\tselect\n" +
            "\t\t\tn1.n_name as supp_nation,\n" +
            "\t\t\tn2.n_name as cust_nation,\n" +
            "\t\t\tl_shipyear as l_year,\n" +
            "\t\t\tl_saleprice as volume\n" +
            "\t\tfrom\n" +
            "\t\t\ttpch1.v_lineitem \n" +
            "\t\t\tinner join tpch1.supplier on s_suppkey = l_suppkey\n" +
            "\t\t\tinner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "\t\t\tinner join tpch1.customer on o_custkey = c_custkey\n" +
            "\t\t\tinner join tpch1.nation n1 on s_nationkey = n1.n_nationkey\n" +
            "\t\t\tinner join tpch1.nation n2 on c_nationkey = n2.n_nationkey\n" +
            "\t\twhere\n" +
            "\t\t\t(\n" +
            "\t\t\t\t(n1.n_name = 'KENYA' and n2.n_name = 'PERU')\n" +
            "\t\t\t\tor (n1.n_name = 'PERU' and n2.n_name = 'KENYA')\n" +
            "\t\t\t)\n" +
            "\t\t\tand l_shipdate between '1995-01-01' and '1996-12-31'\n" +
            "\t) as shipping\n" +
            "group by\n" +
            "\tsupp_nation,\n" +
            "\tcust_nation,\n" +
            "\tl_year\n" +
            "order by\n" +
            "\tsupp_nation,\n" +
            "\tcust_nation,\n" +
            "\tl_year;";
    static String kylinQuery8 = "with all_nations as (\n" +
            "    select\n" +
            "\t\t\to_orderyear as o_year,\n" +
            "\t\t\tl_saleprice as volume,\n" +
            "\t\t\tn2.n_name as nation\n" +
            "\t\tfrom\n" +
            "\t\t    tpch1.v_lineitem\n" +
            "\t\t    inner join tpch1.part on l_partkey = p_partkey\n" +
            "\t\t    inner join tpch1.supplier on l_suppkey = s_suppkey\n" +
            "\t\t\tinner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "\t\t\tinner join tpch1.customer on o_custkey = c_custkey\n" +
            "\t\t    inner join tpch1.nation n1 on c_nationkey = n1.n_nationkey\n" +
            "\t\t    inner join tpch1.nation n2 on s_nationkey = n2.n_nationkey\n" +
            "\t\t    inner join tpch1.region on n1.n_regionkey = r_regionkey\n" +
            "\t\twhere\n" +
            "\t\t\tr_name = 'AMERICA'\n" +
            "\t\t\tand o_orderdate between '1995-01-01' and '1996-12-31'\n" +
            "\t\t\tand p_type = 'ECONOMY BURNISHED NICKEL'\n" +
            "),\n" +
            "peru as (\n" +
            "    select o_year, sum(volume) as peru_volume from all_nations where nation = 'PERU' group by o_year\n" +
            "),\n" +
            "all_data as (\n" +
            "    select o_year, sum(volume) as all_volume from all_nations group by o_year\n" +
            ")\n" +
            "select peru.o_year, peru_volume / all_volume as mkt_share from peru inner join all_data on peru.o_year = all_data.o_year;";
    static String kylinQuery9 = "select\n" +
            "\tnation,\n" +
            "\to_year,\n" +
            "\tsum(volume) - sum(cost) as sum_profit\n" +
            "from\n" +
            "\t(\n" +
            "\t\tselect\n" +
            "\t\t\tn_name as nation,\n" +
            "\t\t\to_orderyear as o_year,\n" +
            "\t\t\tl_saleprice as volume,\n" +
            "\t\t\tl_supplycost as cost\n" +
            "\t\tfrom\n" +
            "\t\t\ttpch1.v_lineitem\n" +
            "\t\t\tinner join tpch1.part on l_partkey = p_partkey\n" +
            "\t\t\tinner join tpch1.supplier on l_suppkey = s_suppkey\n" +
            "\t\t\tinner join tpch1.v_partsupp on l_suppkey = ps_suppkey and l_partkey = ps_partkey\n" +
            "\t\t\tinner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "\t\t\tinner join tpch1.nation on s_nationkey = n_nationkey\n" +
            "\t\twhere\n" +
            "\t\t\tp_name like '%plum%'\n" +
            "\t) as profit\n" +
            "group by\n" +
            "\tnation,\n" +
            "\to_year\n" +
            "order by\n" +
            "\tnation,\n" +
            "\to_year desc;";
    static String kylinQuery10 = "select\n" +
            "\tc_custkey,\n" +
            "\tc_name,\n" +
            "\tsum(l_saleprice) as revenue,\n" +
            "\tc_acctbal,\n" +
            "\tn_name,\n" +
            "\tc_address,\n" +
            "\tc_phone,\n" +
            "\tc_comment\n" +
            "from\n" +
            "    tpch1.v_lineitem\n" +
            "    inner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "\tinner join tpch1.customer on c_custkey = o_custkey\n" +
            "    inner join tpch1.nation on c_nationkey = n_nationkey\n" +
            "where\n" +
            "\to_orderdate >= '1993-07-01'\n" +
            "\tand o_orderdate < '1993-10-01'\n" +
            "\tand l_returnflag = 'R'\n" +
            "group by\n" +
            "\tc_custkey,\n" +
            "\tc_name,\n" +
            "\tc_acctbal,\n" +
            "\tc_phone,\n" +
            "\tn_name,\n" +
            "\tc_address,\n" +
            "\tc_comment\n" +
            "order by\n" +
            "\trevenue desc\n" +
            "limit 20;";
    static String kylinQuery11 = "with q11_part_tmp_cached as (\n" +
            "\tselect\n" +
            "\t\tps_partkey,\n" +
            "\t\tsum(ps_partvalue) as part_value\n" +
            "\tfrom\n" +
            "\t\ttpch1.v_partsupp\n" +
            "\t\tinner join tpch1.supplier on ps_suppkey = s_suppkey\n" +
            "\t\tinner join tpch1.nation on s_nationkey = n_nationkey\n" +
            "\twhere\n" +
            "\t\tn_name = 'GERMANY'\n" +
            "\tgroup by ps_partkey\n" +
            "),\n" +
            "q11_sum_tmp_cached as (\n" +
            "\tselect\n" +
            "\t\tsum(part_value) as total_value\n" +
            "\tfrom\n" +
            "\t\tq11_part_tmp_cached\n" +
            ")\n" +
            "\n" +
            "select\n" +
            "\tps_partkey, \n" +
            "\tpart_value\n" +
            "from (\n" +
            "\tselect\n" +
            "\t\tps_partkey,\n" +
            "\t\tpart_value,\n" +
            "\t\ttotal_value\n" +
            "\tfrom\n" +
            "\t\tq11_part_tmp_cached, q11_sum_tmp_cached\n" +
            ") a\n" +
            "where\n" +
            "\tpart_value > total_value * 0.0001\n" +
            "order by\n" +
            "\tpart_value desc;";
    static String kylinQuery12 = "with in_scope_data as(\n" +
            "\tselect\n" +
            "\t\tl_shipmode,\n" +
            "\t\to_orderpriority\n" +
            "\tfrom\n" +
            "\t\ttpch1.v_lineitem inner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "\twhere\n" +
            "\t\tl_shipmode in ('REG AIR', 'MAIL')\n" +
            "\t\tand l_receiptdelayed = 1\n" +
            "\t\tand l_shipdelayed = 0\n" +
            "\t\tand l_receiptdate >= '1995-01-01'\n" +
            "\t\tand l_receiptdate < '1996-01-01'\n" +
            "), all_l_shipmode as(\n" +
            "\tselect\n" +
            "\t\tdistinct l_shipmode\n" +
            "\tfrom\n" +
            "\t\tin_scope_data\n" +
            "), high_line as(\n" +
            "\tselect\n" +
            "\t\tl_shipmode,\n" +
            "\t\tcount(*) as high_line_count\n" +
            "\tfrom\n" +
            "\t\tin_scope_data\n" +
            "\twhere\n" +
            "\t\to_orderpriority = '1-URGENT' or o_orderpriority = '2-HIGH'\n" +
            "\tgroup by l_shipmode\n" +
            "), low_line as(\n" +
            "\tselect\n" +
            "\t\tl_shipmode,\n" +
            "\t\tcount(*) as low_line_count\n" +
            "\tfrom\n" +
            "\t\tin_scope_data\n" +
            "\twhere\n" +
            "\t\to_orderpriority <> '1-URGENT' and o_orderpriority <> '2-HIGH'\n" +
            "\tgroup by l_shipmode\n" +
            ")\n" +
            "select\n" +
            "\tal.l_shipmode, hl.high_line_count, ll.low_line_count\n" +
            "from\n" +
            "\tall_l_shipmode al\n" +
            "\tleft join high_line hl on al.l_shipmode = hl.l_shipmode\n" +
            "\tleft join low_line ll on al.l_shipmode = ll.l_shipmode\n" +
            "order by\n" +
            "\tal.l_shipmode;";
    static String kylinQuery13 = "select\n" +
            "\tc_count,\n" +
            "\tcount(*) as custdist\n" +
            "from\n" +
            "\t(\n" +
            "\t\tselect\n" +
            "\t\t\tc_custkey,\n" +
            "\t\t\tcount(distinct o_orderkey) as c_count\n" +
            "\t\tfrom\n" +
            "\t\t\ttpch1.customer left outer join tpch1.v_orders on\n" +
            "\t\t\t\tc_custkey = o_custkey\n" +
            "\t\twhere o_comment not like '%unusual%accounts%'\n" +
            "\t\tgroup by\n" +
            "\t\t\tc_custkey\n" +
            "\t) c_orders\n" +
            "group by\n" +
            "\tc_count\n" +
            "order by\n" +
            "\tcustdist desc,\n" +
            "\tc_count desc;";
    static String kylinQuery14 = "with total as (\n" +
            "    select\n" +
            "\t    sum(l_saleprice) as total_saleprice\n" +
            "    from\n" +
            "\t    tpch1.v_lineitem \n" +
            "\t    inner join tpch1.part on l_partkey = p_partkey\n" +
            "    where\n" +
            "        l_shipdate >= '1995-08-01'\n" +
            "\t    and l_shipdate < '1995-09-01'\n" +
            "),\n" +
            "promo as (\n" +
            "    select\n" +
            "\t    sum(l_saleprice) as promo_saleprice\n" +
            "    from\n" +
            "\t    tpch1.v_lineitem \n" +
            "\t    inner join tpch1.part on l_partkey = p_partkey\n" +
            "    where\n" +
            "        l_shipdate >= '1995-08-01'\n" +
            "\t    and l_shipdate < '1995-09-01'\n" +
            "\t    and p_type like 'PROMO%'\n" +
            ")\n" +
            "\n" +
            "select 100.00 * promo_saleprice / total_saleprice from promo,total;";
    static String kylinQuery15 = "with revenue_cached as\n" +
            "(\n" +
            "    select\n" +
            "        s_suppkey,\n" +
            "        s_name,\n" +
            "        s_address,\n" +
            "        s_phone,\n" +
            "        sum(l_saleprice) as total_revenue\n" +
            "    from\n" +
            "        tpch1.v_lineitem\n" +
            "        inner join tpch1.supplier on s_suppkey=l_suppkey\n" +
            "    where\n" +
            "        l_shipdate >= '1996-01-01'\n" +
            "        and l_shipdate < '1996-04-01'\n" +
            "    group by s_suppkey,s_name,s_address,s_phone\n" +
            "),\n" +
            "max_revenue_cached as\n" +
            "(\n" +
            "    select\n" +
            "        max(total_revenue) as max_revenue\n" +
            "    from\n" +
            "        revenue_cached\n" +
            ")\n" +
            "\n" +
            "select\n" +
            "    s_suppkey,\n" +
            "    s_name,\n" +
            "    s_address,\n" +
            "    s_phone,\n" +
            "    total_revenue\n" +
            "from\n" +
            "    revenue_cached\n" +
            "    inner join max_revenue_cached on total_revenue = max_revenue\n" +
            "order by s_suppkey;\n";
    static String kylinQuery16 = "select\n" +
            "\tp_brand,\n" +
            "\tp_type,\n" +
            "\tp_size,\n" +
            "\tcount(distinct ps_suppkey) as supplier_cnt\n" +
            "from\n" +
            "\ttpch1.v_partsupp\n" +
            "\tinner join tpch1.part on p_partkey = ps_partkey\n" +
            "\tinner join (\n" +
            "\t\tselect\n" +
            "\t\t\ts_suppkey\n" +
            "\t\tfrom\n" +
            "\t\t\ttpch1.supplier\n" +
            "\t\twhere\n" +
            "\t\t\ts_comment not like '%Customer%Complaints%'\n" +
            "\t) on ps_suppkey = s_suppkey\n" +
            "where\n" +
            "    p_brand <> 'Brand#34'\n" +
            "\tand p_type not like 'ECONOMY BRUSHED%'\n" +
            "\tand p_size in (22, 14, 27, 49, 21, 33, 35, 28)\n" +
            "group by\n" +
            "    p_brand,\n" +
            "\tp_type,\n" +
            "\tp_size\n" +
            "order by\n" +
            "\tsupplier_cnt desc,\n" +
            "\tp_brand,\n" +
            "\tp_type,\n" +
            "\tp_size;";
    static String kylinQuery17 = "with q17_avg as (\n" +
            "    select\n" +
            "        l_partkey,\n" +
            "        0.2 * avg(l_quantity) as t_avg_quantity\n" +
            "    from\n" +
            "        tpch1.v_lineitem\n" +
            "        inner join tpch1.part on l_partkey = p_partkey\n" +
            "    where\n" +
            "        p_brand = 'Brand#23'\n" +
            "        and p_container = 'MED BOX'\n" +
            "    group by\n" +
            "        l_partkey\n" +
            ")\n" +
            "\n" +
            "select cast(sum(l_extendedprice) / 7.0 as decimal(32,2)) as avg_yearly\n" +
            "from\n" +
            "    tpch1.v_lineitem\n" +
            "    inner join tpch1.part on l_partkey = p_partkey\n" +
            "    inner join q17_avg on q17_avg.l_partkey = v_lineitem.l_partkey\n" +
            "where \n" +
            "    p_brand = 'Brand#23'\n" +
            "    and p_container = 'MED BOX'\n" +
            "    and l_quantity < t_avg_quantity;";
    static String kylinQuery18 = "select\n" +
            "    c_name,\n" +
            "    c_custkey,\n" +
            "    o_orderkey,\n" +
            "    o_orderdate,\n" +
            "    o_totalprice,\n" +
            "    sum(l_quantity)\n" +
            "from\n" +
            "    tpch1.v_lineitem\n" +
            "    inner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "    inner join tpch1.customer on o_custkey = c_custkey\n" +
            "where\n" +
            "    o_orderkey is not null\n" +
            "group by\n" +
            "    c_name,\n" +
            "    c_custkey,\n" +
            "    o_orderkey,\n" +
            "    o_orderdate,\n" +
            "    o_totalprice\n" +
            "having\n" +
            "    sum(l_quantity) > 300\n" +
            "order by\n" +
            "    o_totalprice desc,\n" +
            "    o_orderdate \n" +
            "limit 100;";
    static String kylinQuery19 = "select\n" +
            "    sum(l_saleprice) as revenue\n" +
            "from\n" +
            "    tpch1.v_lineitem\n" +
            "    inner join tpch1.part on l_partkey = p_partkey\n" +
            "where\n" +
            "    (\n" +
            "        p_brand = 'Brand#32'\n" +
            "        and p_container in ('SM CASE', 'SM BOX', 'SM PACK', 'SM PKG')\n" +
            "        and l_quantity >= 7 and l_quantity <= 7 + 10\n" +
            "        and p_size between 1 and 5\n" +
            "        and l_shipmode in ('AIR', 'AIR REG')\n" +
            "        and l_shipinstruct = 'DELIVER IN PERSON'\n" +
            "    )\n" +
            "    or\n" +
            "    (\n" +
            "        p_brand = 'Brand#35'\n" +
            "        and p_container in ('MED BAG', 'MED BOX', 'MED PKG', 'MED PACK')\n" +
            "        and l_quantity >= 15 and l_quantity <= 15 + 10\n" +
            "        and p_size between 1 and 10\n" +
            "        and l_shipmode in ('AIR', 'AIR REG')\n" +
            "        and l_shipinstruct = 'DELIVER IN PERSON'\n" +
            "    )\n" +
            "    or\n" +
            "    (\n" +
            "        p_brand = 'Brand#24'\n" +
            "        and p_container in ('LG CASE', 'LG BOX', 'LG PACK', 'LG PKG')\n" +
            "        and l_quantity >= 26 and l_quantity <= 26 + 10\n" +
            "        and p_size between 1 and 15\n" +
            "        and l_shipmode in ('AIR', 'AIR REG')\n" +
            "        and l_shipinstruct = 'DELIVER IN PERSON'\n" +
            "    );";
    static String kylinQuery20 = "with tmp3 as (\n" +
            "    select l_partkey, 0.5 * sum(l_quantity) as sum_quantity, l_suppkey\n" +
            "    from tpch1.v_lineitem\n" +
            "    inner join tpch1.supplier on l_suppkey = s_suppkey\n" +
            "    inner join tpch1.nation on s_nationkey = n_nationkey\n" +
            "    inner join tpch1.part on l_partkey = p_partkey\n" +
            "    where l_shipdate >= '1994-01-01' and l_shipdate <= '1995-01-01'\n" +
            "    and n_name = 'CANADA'\n" +
            "    and p_name like 'forest%'\n" +
            "    group by l_partkey, l_suppkey\n" +
            ")\n" +
            "\n" +
            "select\n" +
            "    s_name,\n" +
            "    s_address\n" +
            "from\n" +
            "    tpch1.v_partsupp\n" +
            "    inner join tpch1.supplier on ps_suppkey = s_suppkey\n" +
            "    inner join tmp3 on ps_partkey = l_partkey and ps_suppkey = l_suppkey\n" +
            "where\n" +
            "    ps_availqty > sum_quantity\n" +
            "group by\n" +
            "    s_name, s_address\n" +
            "order by\n" +
            "    s_name;";
    static String kylinQuery21 = "select s_name, count(*) as numwait\n" +
            "from\n" +
            "(\n" +
            "    select\n" +
            "        l1.l_suppkey,\n" +
            "        s_name,\n" +
            "        l1.l_orderkey\n" +
            "    from\n" +
            "        tpch1.v_lineitem l1\n" +
            "        inner join tpch1.v_orders on l1.l_orderkey = o_orderkey\n" +
            "        inner join tpch1.supplier on l1.l_suppkey = s_suppkey\n" +
            "        inner join tpch1.nation on s_nationkey = n_nationkey\n" +
            "        inner join (\n" +
            "            select\n" +
            "                l_orderkey,\n" +
            "                count (distinct l_suppkey)\n" +
            "            from\n" +
            "                tpch1.v_lineitem inner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "            where\n" +
            "                o_orderstatus = 'F'\n" +
            "            group by\n" +
            "                l_orderkey\n" +
            "            having\n" +
            "                count (distinct l_suppkey) > 1\n" +
            "        ) l2 on l1.l_orderkey = l2.l_orderkey\n" +
            "        inner join (\n" +
            "            select\n" +
            "                l_orderkey,\n" +
            "                count (distinct l_suppkey)\n" +
            "            from\n" +
            "                tpch1.v_lineitem inner join tpch1.v_orders on l_orderkey = o_orderkey\n" +
            "            where\n" +
            "                o_orderstatus = 'F'\n" +
            "                and l_receiptdelayed = 1\n" +
            "            group by\n" +
            "                l_orderkey\n" +
            "            having\n" +
            "                count (distinct l_suppkey) = 1\n" +
            "        ) l3 on l1.l_orderkey = l3.l_orderkey\n" +
            "    where\n" +
            "        o_orderstatus = 'F'\n" +
            "        and l_receiptdelayed = 1\n" +
            "        and n_name = 'SAUDI ARABIA'\n" +
            "    group by\n" +
            "        l1.l_suppkey,\n" +
            "        s_name,\n" +
            "        l1.l_orderkey\n" +
            ")\n" +
            "group by\n" +
            "    s_name\n" +
            "order by\n" +
            "    numwait desc,\n" +
            "    s_name\n" +
            "limit 100;";
    static String kylinQuery22 = "with avg_tmp as (\n" +
            "    select\n" +
            "        avg(c_acctbal) as avg_acctbal\n" +
            "    from\n" +
            "        tpch1.customer\n" +
            "    where\n" +
            "        c_acctbal > 0.00 and substring(c_phone, 1, 2) in ('13','31','23','29','30','18','17')\n" +
            "),\n" +
            "cus_tmp as (\n" +
            "    select c_custkey as noordercus\n" +
            "    from\n" +
            "        tpch1.customer left join tpch1.v_orders on c_custkey = o_custkey\n" +
            "    where o_orderkey is null\n" +
            "    group by c_custkey\n" +
            ")\n" +
            "\n" +
            "select\n" +
            "    cntrycode,\n" +
            "    count(1) as numcust,\n" +
            "    sum(c_acctbal) as totacctbal\n" +
            "from (\n" +
            "    select\n" +
            "        substring(c_phone, 1, 2) as cntrycode,\n" +
            "        c_acctbal\n" +
            "    from \n" +
            "        tpch1.customer inner join cus_tmp on c_custkey = noordercus, avg_tmp\n" +
            "    where \n" +
            "        substring(c_phone, 1, 2) in ('13','31','23','29','30','18','17')\n" +
            "        and c_acctbal > avg_acctbal\n" +
            ") t\n" +
            "group by\n" +
            "    cntrycode\n" +
            "order by\n" +
            "    cntrycode;";
    static SqlMapping sm1 =  new SqlMapping(originQuery1, kylinQuery1);
    static SqlMapping sm2 =  new SqlMapping(originQuery2, kylinQuery2);
    static SqlMapping sm3 =  new SqlMapping(originQuery3, kylinQuery3);
    static SqlMapping sm4 =  new SqlMapping(originQuery4, kylinQuery4);
    static SqlMapping sm5 =  new SqlMapping(originQuery5, kylinQuery5);
    static SqlMapping sm6 =  new SqlMapping(originQuery6, kylinQuery6);
    static SqlMapping sm7 =  new SqlMapping(originQuery7, kylinQuery7);
    static SqlMapping sm8 =  new SqlMapping(originQuery8, kylinQuery8);
    static SqlMapping sm9 =  new SqlMapping(originQuery9, kylinQuery9);
    static SqlMapping sm10 =  new SqlMapping(originQuery10, kylinQuery10);
    static SqlMapping sm11 =  new SqlMapping(originQuery11, kylinQuery11);
    static SqlMapping sm12 =  new SqlMapping(originQuery12, kylinQuery12);
    static SqlMapping sm13 =  new SqlMapping(originQuery13, kylinQuery13);
    static SqlMapping sm14 =  new SqlMapping(originQuery14, kylinQuery14);
    static SqlMapping sm15 =  new SqlMapping(originQuery15, kylinQuery15);
    static SqlMapping sm16 =  new SqlMapping(originQuery16, kylinQuery16);
    static SqlMapping sm17 =  new SqlMapping(originQuery17, kylinQuery17);
    static SqlMapping sm18 =  new SqlMapping(originQuery18, kylinQuery18);
    static SqlMapping sm19 =  new SqlMapping(originQuery19, kylinQuery19);
    static SqlMapping sm20 =  new SqlMapping(originQuery20, kylinQuery20);
    static SqlMapping sm21 =  new SqlMapping(originQuery21, kylinQuery21);
    static SqlMapping sm22 =  new SqlMapping(originQuery22, kylinQuery22);
    static SqlMapping[] sms = {sm1,sm2,sm3,sm4,sm5,sm6,sm7,sm8,sm9,sm10,sm11,sm12,sm13,sm14,sm15,sm16,sm17,sm18,sm19,sm20,sm21,sm22};


    public SqlMapping(){

    }

    public SqlMapping(String rawSql){
        this.rawSql = rawSql;
    }

    public SqlMapping(String rawSql, String newSql){
        this.rawSql = rawSql;
        this.newSql = newSql;
    }

    public void setRawSql(String sql){
        rawSql = sql;
    }

    public String getRawSql(){
        return rawSql;
    }

    public void setNewSql(String sql) {
        newSql = sql;
    }

    public String getNewSql() {
        return newSql;
    }

    public boolean compare(SqlMapping sqlMapping){
        String sql1 = rawSql.replaceAll("\r|\t|\n", "");
        sql1 = sql1.replaceAll(" ", "");
        System.out.println("SqlMapping========== sql1:"+sql1);
        if(sql1.length()!=sqlMapping.getRawSql().length()){
            return false;
        }else{
            if(sql1.equals(sqlMapping.getRawSql())){
                return true;
            }
            else
                return false;
        }
    }

}
