import datetime

def get_date_between(datestart = None,dateend = None):
    date_list = []
    date_list.append(datestart)
    while datestart<dateend:
        datestart+=datetime.timedelta(days=+1)
        date_list.append(datestart)
    return  date_list
