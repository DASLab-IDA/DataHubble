import sqlalchemy as sa

class KylinUtil(object):
    def __init__(self, hostname, port, user, password, database):
        self.hostname = hostname
        self.port = port
        self.user = user
        self.password = password
        self.database = database
        self.kylin_engine = \
            sa.create_engine('kylin://{}:{}@{}:{}/{}'.format(self.user, self.password, self.hostname,self.port, self.database),
                                             connect_args={'is_ssl': False, 'timeout': 60})

    def getKylinEngeine(self):
        return self.kylin_engine

    def executeQuery(self, sql):
        results = [e for e in self.kylin_engine.execute(sql)]
        return results

kylin_util = KylinUtil('master', '7070', 'ADMIN', 'KYLIN', 'bigbench_1t_sample')