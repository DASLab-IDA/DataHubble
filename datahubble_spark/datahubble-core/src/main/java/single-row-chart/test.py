# -*-* encoding:UTF-8 -*-
# author : zpc
# date   : 2018/11/22
import threading
import time

theList = ['a','b','c']
if 'a' in theList:
    print 'a in the list'

def qselect(A, k):
    if len(A) < k:
        return A
    pivot = A[-1]
    right = [pivot] + [x for x in A[:-1] if x >= pivot]
    rlen = len(right)
    if rlen == k:
        return right
    if rlen > k:
        return qselect(right, k)
    else:
        left = [x for x in A[:-1] if x < pivot]
        return qselect(left, k - rlen) + right


for i in range(1, 10):
    print qselect([11, 8, 4, 9, 5, 2, 7, 1], i)

list = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]


class myThread(threading.Thread):
    def __init__(self, threadId, name):
        threading.Thread.__init__(self)
        self.threadId = threadId
        self.name = name

    def run(self):
        print "开始线程:", self.name
        # 获得锁，成功获得锁定后返回 True
        # 可选的timeout参数不填时将一直阻塞直到获得锁定
        # 否则超时后将返回 False
        # threadLock.acquire()
        print_time(self.name, list.__len__())
        # 释放锁
        # threadLock.release()

    def __del__(self):
        print self.name, "线程结束！"


def print_time(threadName, counter):
    while counter:
        list[counter - 1] += 1
        print "[%s] %s 修改第 %d 个值，修改后值为:%d" % (time.ctime(time.time()), threadName, counter, list[counter - 1])
        counter -= 1


# threadLock = threading.Lock()
threads = []
# 创建新线程
thread1 = myThread(1, "Thread-1")
thread2 = myThread(2, "Thread-2")
# 开启新线程
thread1.start()
thread2.start()
# 添加线程到线程列表
threads.append(thread1)
threads.append(thread2)
# 等待所有线程完成
for t in threads:
    t.join()
print "主进程结束！"
