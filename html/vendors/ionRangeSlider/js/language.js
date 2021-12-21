Vue.use(VueI18n)

var messages = {
    zh: {
        language: '多语言',
        footer: '复旦大学数据分析与安全实验室 开发',
        close: '关闭',
        details: '详情',
        robot: {
            title: '智能机器人为您推荐',
            text: '这里有一些数据集您可能喜欢'
        },
        sidebar: {
                    smart_interaction: '智能交互',
                    welcome: '欢迎使用',
                    home: '主页'
        },
        navbar: {
            profile: '个人信息',
            settings: '设置',
            help: '帮助',
            logout: '注销'
        },
        dataset: {
            dataset: '数据集',
            recommendation: '以下是我们为您推荐的数据集：',
            createdTime: '创建时间',
            updatedTime: '更新时间',
            use: '使用该数据集',
            common: '常用',
            off: '关闭'
        },
        databoard: {
            createdAt: '创建于',
            updatedAt: '更新于',
            filter: '应用过滤',
            recommendation: '以下是各列的数据分布和为您推荐的过滤条件'
        }
    },
    en: {
        language: 'Language',
        footer: 'Made by DASLAB',
        close: 'close',
        details: 'details',
        robot: {
                    title: 'Robot recommending!',
                    text: 'Some datasets maybe you are interested in'
        },
        sidebar: {
                    smart_interaction: 'smart interaction',
                    welcome: 'Welcome',
                    home: 'home'
        },
        navbar: {
                    profile: 'Profile',
                    settings: 'Settings',
                    help: 'Help',
                    logout: 'Log out'
                },
        dataset: {
            dataset: 'Datasets',
            recommendation: 'These are the recommended datasets:',
            createdTime: 'created time',
            updatedTime: 'updated time',
            use: 'use this dataset',
            common: 'COMMON',
            off: 'OFF'
        },
        databoard: {
            createdAt: 'created at',
            updatedAt: 'updated at',
            filter: 'Apply filter',
            recommendation: 'These are the data distribution of each column and recommended filter:'
        }
    }
}

var i18n = new VueI18n({
    locale: 'en',
    messages
})