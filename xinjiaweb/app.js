var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var admin = require('./routes/admin');

var settings = require('./settings');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());//加载解析json的中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//设置静态文件存放目录
app.use('/uploads', express.static('uploads')); 

//session
var sessionMiddleware = session({
    resave: true,  //是否允许session重新设置，要保证session有操作的时候更新session必须设置这个属性为true
    rolling: true, //是否按照原设定的maxAge值重设session同步到cookie中，要保证session有操作的时候必须设置这个属性为true*/
    saveUninitialized: true,  //是否设置session在存储容器中可以给修改
		secret: settings.cookieSecret,
		key: settings.db, //cookie name
		cookie: {maxAge:1000 * 60 * 60 * 8},//8小时
		store: new MongoStore({
			db: settings.db,
			host: settings.host,
			port: settings.port,
			url: 'mongodb://localhost/xinjia'
		})
})
app.use(sessionMiddleware);

app.use('/', index);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
