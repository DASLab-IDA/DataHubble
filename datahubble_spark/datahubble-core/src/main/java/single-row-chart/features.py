class Type(object):
    none=0
    categorical=1
    numerical=2
    temporal=3
    longStr=4

    @staticmethod
    def getType(s):
        if len(s)>=7 and s[0:7]=='varchar':
            return Type.categorical
        elif len(s)>=4 and s[0:4]=='char':
            return Type.categorical
        elif s=='string' or s=='str':
            return Type.categorical
        elif len(s)>=3 and s[0:3]=='int':
            return Type.numerical
        elif s=='int' or s=='double' or s=='float' or s.find('decimal')>=0:
            return Type.numerical
        elif s.find('date')>=0 or s.find('datetime')>=0 or s.find('timestamp')>=0:
            return Type.temporal
        elif s=='text':
            return Type.categorical

class Features(object):
    def __init__(self,name,type,origin):
        self.name=name
        self.type=type
        self.origin=origin
        self.min=self.minmin=self.max=self.distinct=self.ratio=self.bin_num=0
        self.interval=''
        self.distinct_values=[]
        self.interval_bins=[]










