var fs = require('fs');
var express = require('express');
var app = express();
var Moniker = require('moniker');
var path = require('path');
var elastical = require('elastical');
const { Client } = require('@elastic/elasticsearch')
var vnc = require('./src/server.js');
var port = process.env.PORT || 5000;

var server = new vnc.Server();

app.engine('ejs', require('express-ejs-extend')); // add this line
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.static(__dirname + '/public'));

app.get("/room/:id", function(req, res){
    var id = req.params.id;

    var title = 'room'
    res.render('room', {
        room: id,
        title: title
    });
});
app.get("/", function(req, res){

    var title = 'Home'
    res.render('home', {
        title: title
    });
});


var http = require('http').createServer(app);
var io = require('socket.io')(http);



setTimeout(function() { io.sockets.emit('restart') }, 5000);

// socket.io
io.on('connection', function (socket) {
    var user = addUser(socket.handshake.address.address);
    var board, room;
    socket.emit("welcome", user);

    socket.on('join', function(data) {

        console.log({data});

        room = data.room;
        socket.join(room);
        user.room = room;
        updateUsers();
        server.join(user.name, room);
        board = server.boards[room];
        socket.emit("board", board);

    });
    socket.on('disconnect', function() {
        removeUser(user);
        server.unjoin(user.name);
    });
    socket.on('chat', function(data) {
        var m1 = '<strong>' + data.username + ': <em>' + data.message + '</em></strong>';
        var m2 = data.username + ': ' + data.message;
        socket.emit("updateChat", { message: m1 });
        socket.broadcast.to(room).emit("updateChat", { message: m2 });
    });
    socket.on('send', function(data) {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.move.call(board, data.message));
        } catch (e) {
            handleException(e);
        }
    });

    socket.on('new', function() {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.newGame.call(board));
        } catch (e) {
            handleException(e);
        }
    });

    socket.on('loadgame', function(data) {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.loadGame.call());
        } catch (e) {
            handleException(e);
        }
    });

    var handleException = function(e) {
        console.log(e);
    };

});

var users = [];

var addUser = function(address) {
    var user = {
        name: Moniker.choose(),
        ip: address
    }
    users.push(user);
    updateUsers();
    return user;
}
var removeUser = function(user) {
    for(var i=0; i<users.length; i++) {
        if(user.name === users[i].name) {
            users.splice(i, 1);
            updateUsers();
            return;
        }
    }
}
var updateUsers = function() {
    io.sockets.emit("users", { users: users, count: users.length });
}
var findUser = function(username) {
    for(var i=0; i<users.length; i++) {
        if(username === users[i].name) {
            return users[i];
        }
    }
}




http.listen(port, function(){
    console.log('listening on *:'+port);
});
