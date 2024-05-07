var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require("express-session");
var exphbs = require('express-handlebars');
var passport = require('passport')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/admin');
var gymRouter = require('./routes/gym-owner');
var userRouter = require('./routes/users')


var db=require("./config/connection");
var app = express();
app.use(session({
  resave: true,
  saveUninitialized: false,
  secret:"key",cookie:{maxAge:600000}
  // Other session options...
}));
app.use(passport.initialize());
app.use(passport.session())

db.connect()

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.set('trust proxy', true)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'normalLayout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
}));



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', usersRouter);
app.use('/gymowner',gymRouter);

app.use("/users",userRouter)
app.use('/registergym', indexRouter);
app.use('/owner-dashboard', indexRouter);
app.use('/gymimage', indexRouter);
app.use('/getaddress', indexRouter);
app.use('/check', indexRouter);
app.use('/ticket',indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
