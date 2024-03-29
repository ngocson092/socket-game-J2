$(document).ready(function() {
    $("#field").keyup(function(e) {
        if(e.keyCode == 13) {
            sendMessage();
        }
    });
    $( "#tabs" ).tabs();
});


window.onload = function() {
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var welcome = document.getElementById("welcome");
    var allUsers = document.getElementById("users");
    var chatElem = document.getElementById("chat");
    var boardElem = document.getElementById("board");

    console.log({vnc});

    var board, username, last, rotation = vnc.Piece.BLACK;
    var waitingForOther = false;
    var url = document.URL;
    var index = url.indexOf('room=');
    var room = index < 0 ? 'public' : url.substring(index+5, url.length);
    var worker = new Worker('nextMove.js');
    var bestMoves; // next best moves
    worker.addEventListener('message', function(e) {
      $('#status').html("Score: " + (board.turn*2-1)*e.data.next.value + " (" + e.data.next.move + ") " + e.data.time);
      bestMoves = [e.data.next.move[0]];
    }, false);

    var socket = io.connect(url);
    socket.emit('join', { room: room });
    // handler for board click
    handleClick = function(elem, pos, type) {
        if (waitingForOther) return;
        // need to get piece selected first
        if (!last && type && type.indexOf(board.turn) >= 0) {
            elem.className += ' selected';
            last = {elem: elem, pos: pos, type: type};
        } else if (last) {
            if (type.indexOf(board.turn) >= 0) {
                // remove the selected class for last selected elem
                var klass = last.elem.className;
                last.elem.className = klass.substring(0, klass.length-9);
                // and select this one
                elem.className += ' selected';
                last = {elem: elem, pos: pos, type: type};
            } else {
                var move = vnc.Board.prototype.getMove.call(board, last.type, last.pos, pos, rotation);
                if (move) {
                    // remove the selected class for last selected elem
                    last.elem.className = 'piece ' + last.pos;
                    // and select this one
                    elem.className = elem.className.replace(type, '') + ' selected ' + last.type;
                    console.log(move);
                    board = vnc.Board.prototype.move.call(board, move); // move this board, then broadcast to others
                    showMoves();
                    socket.emit('send', { message: move, username: username });
                    last = null;
                    startClocks(board.turn);
                    waitingForOther = true;
                }
            }
        }
    };
    selectMove = function(idx, pid) {
        socket.emit('select', { index: idx, path: pid });
    };
    var showMoves = function() {
        var moves = vnc.Board.prototype.getMoves.call(board);
        $('#moves').html(moves.html);
        var sch = Math.floor((board.index+1)/2) * 1.8 * $('#moves')[0].scrollHeight / vnc.max(board.paths);
        $('#moves').stop().animate({scrollTop: sch}, 1000);
        drawTree(moves.tree);

    };
    var startClocks = function(who) {
        if (who === undefined) { // new game
            clock1.stop(); clock1.setTime(0);
            clock2.stop(); clock2.setTime(0);
        } else if ((who + rotation) !== 1) {
            clock1.start();
            clock2.stop();
        } else {
            clock2.start();
            clock1.stop();
        }
    }

    socket.on('welcome', function (data) {
        username = data.name;
        welcome.innerHTML = "<strong>" + data.name + "</strong>: welcome to " + room + "@vinachess.net";
    });

    socket.on('restart', function () {
        $('#status').html("Server's restarted, refresh your browser now!");
        setTimeout(function() { location.reload(true) }, 2000);
     });

    socket.on('updateChat', function (data) {
        chatElem.innerHTML = data.message + '<br/>' + chatElem.innerHTML;
    });

    socket.on('note', function (data) {
        $('#notefield').val(data.note);
    });

    socket.on('users', function (data) {
        var str = '', count = 0;
        for(var i = 0; i < data.users.length; i++) {
            var user = data.users[i];
            if (user.room) {
                count += 1;
                str += user.name + ' <small>(' + user.room + ')</small><br />';
            }
        }
        allUsers.innerHTML = "<strong>There are " + count + " online users:</strong><br />" + str;
    });

    socket.on('board', function (data) {
        board = data;
        waitingForOther = false;
        boardElem.innerHTML = vnc.Board.prototype.toHtml.call(board, rotation);
        showMoves();
        var color = board.turn ? 'WHITE' : 'BLACK';
        $('#turn').html(color).attr('class', color);
        if (board.history.length === 1) {
            startClocks();
            $('#loadgame').show();
        } else {
            $('#loadgame').hide();
            startClocks(board.turn);
        }
        if (board.lastMove.move) {
          next = search.next(board);
          bestMoves = next.moves;
          //console.log(next);
          //$('#status').html("Moves: " + search.format(board, bestMoves));
          worker.postMessage({board: board, depth: 6, bestMoves: bestMoves});
        } else {
          $('#status').html("");
        }
    });

    sendButton.onclick = sendMessage = function() {
        var text = field.value;
        socket.emit('chat', { message: text, username: username });
        field.value = "";
    };

    $('#undo').click(function() {
        socket.emit('undo');
    });

    $('#redo').click(function() {
        socket.emit('redo');
    });

    $('#new').click(function() {
        socket.emit('new');
    });

    $('#rotate').click(function() {
        rotation = vnc.Piece.WHITE - rotation;
        boardElem.innerHTML = vnc.Board.prototype.toHtml.call(board, rotation);
        // swap clocks:
        var time2 = clock2.getTime().time;
        clock2.setTime(clock1.getTime().time);
        clock1.setTime(time2);
        startClocks(board.turn);
    });

    $('#room').click(function() {
        var rand = Math.floor((Math.random()*1000)+1);
        window.location = '/?room=P' + rand;
    });

    $('#addnote').click(function() {
        socket.emit('addnote', { note: $('#notefield').val(), room: room });
        $('#notestatus').slideDown(function() {
            setTimeout(function() {
                $('#notestatus').slideUp();
            }, 5000);
        });
    });
    $('#loadgame').click(function() {
        socket.emit('loadgame', { note: $('#notefield').val(), room: room });
        $('#loadstatus').slideDown(function() {
            setTimeout(function() {
                $('#loadstatus').slideUp();
            }, 5000);
        });
    });
    $('#hint').click(function() {
        worker.postMessage({board: board, depth: 8, bestMoves: bestMoves});
    });
    var clock1 = $('#clock1').FlipClock({
        autoStart: false
    });
    var clock2 = $('#clock2').FlipClock({
        autoStart: false
    });
};
