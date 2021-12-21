# -*- coding: UTF-8 -*-
import datetime


def timerStart():
    global start_time
    start_time= datetime.datetime.now()  # 放在程序开始处


# doing thing
def timerEnd():
    global end_time
    end_time = datetime.datetime.now()  # 放在程序结尾处
    interval = end_time - start_time
    print "TimeCost:\t", interval
# def printtime():
#      final_time = interval/60.0  #转换成分钟

