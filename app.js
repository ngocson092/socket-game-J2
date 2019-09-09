var fs = require('fs');
var express = require('express');
var app = express();
var Moniker = require('moniker');
var elastical = require('elastical');
const { Client } = require('@elastic/elasticsearch')
var vnc = require('./src/server.js');
var port = process.env.PORT || 5000;

var server = new vnc.Server();




app.use(express.static(__dirname + '/public'));


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
        updateNote();
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
            updateNote();
            client.index('vinachess', 'server', {boards: server.boards}, {id: 'latest', create: false}, function (err, res) {
                if (err) console.log(err);
                else console.log(res);
            });
        } catch (e) {
            handleException(e);
        }
    });
    socket.on('undo', function() {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.undo.call(board));
            updateNote();
        } catch (e) {
            handleException(e);
        }
    });
    socket.on('redo', function() {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.redo.call(board));
            updateNote();
        } catch (e) {
            handleException(e);
        }
    });
    socket.on('new', function() {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.newGame.call(board));
            updateNote();
        } catch (e) {
            handleException(e);
        }
    });
    socket.on('select', function(data) {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.select.call(board, data.index, data.path));
            updateNote();
        } catch (e) {
            handleException(e);
        }
    });
    socket.on('loadgame', function(data) {
        try {
            io.sockets.in(room).emit("board", vnc.Board.prototype.loadGame.call(board, data.note));
            updateNote();
        } catch (e) {
            handleException(e);
        }
    });
    socket.on('addnote', function(data) {
        try {
            client.index('note', room, data, {id: JSON.stringify(board.grid), create: false}, function (err, res) {
                if (err) console.log(err);
                else console.log(res);
            });
        } catch (e) {
            handleException(e);
        }
    });
    var handleException = function(e) {
        console.log(e);
    };
    var updateNote = function() {
        client.get('note', JSON.stringify(board.grid), function (err, doc, res) {
            if (doc) {
                io.sockets.in(room).emit('note', doc);
            } else {
                client.get('note', JSON.stringify(vnc.mirror(board.grid)), function (err2, doc2, res2) {
                    doc = {note: ''};
                    if (doc2) doc = {note: vnc.neutralize(doc2.note)};
                    io.sockets.in(room).emit('note', doc);
                });
            }
        });
    }
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

app.get("/g/:id", function(req, res){
  res.redirect('/?room=' + req.params.id);
});


http.listen(port, function(){
    console.log('listening on *:'+port);
});
