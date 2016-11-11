/**
 * Created by xiaos on 16/11/10.
 */
module.exports = {
    port: 3000,
    session: {
        secret: 'myblog',
        key: 'myblog',
        maxAge: 2592000000,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    },
    mongodb: 'mongodb://localhost:27017/myblog'
};