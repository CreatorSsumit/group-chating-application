var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var io = require("socket.io")

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var socketio = io();
app.socketio = socketio;



var onlineuser = []

socketio.on("connection", function(socket) {

    var stack = [];
    socket.on("username", function(usernamevalue) {
        onlineuser.push(usernamevalue);



        if (onlineuser.length === 1) {
            socketio.emit("online", { data: "No Buddy is there except You", username: usernamevalue })

        } else {
            socketio.emit("online", onlineuser.length)
            socketio.emit("id", socket.id)
        }


        socket.on("i", function(dd) {
            socketio.emit("message", { msg: dd, id: socket.id, username: usernamevalue })

        })


        socket.on("typing", function(e) {
            socket.broadcast.emit("type", usernamevalue + e)

        })

        socket.on("nottyping", function(e) {
            socket.broadcast.emit("nottyping")
        })
        socket.on("disconnect", function() {
            onlineuser.pop();

            if (onlineuser.length === 1) {
                socketio.emit("online", { data: "No Buddy is there except You", username: usernamevalue })

            } else {
                socketio.emit("online", onlineuser.length)
                socketio.emit("id", socket.id)
            }
        })

    })

})



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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