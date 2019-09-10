var vnc = vnc || {};

vnc.Piece = {
  X: 9, Y: 10,
  color: ['black', 'white'],
  BLACK: 0, WHITE: 1,
  START: {
    Tg: ['a5'], S: ['a4','a6'], T: ['a3','a7'], M: ['a2','a8'], X: ['a1','a9'],
    B: ['d1','d3','d5','d7','d9'], P: ['c2','c8']
  },
  LETTER: 'abcdefghij' // for Y axis
};


vnc.Server = function(restore) {
  // only restore the boards
  this.boards = restore ? restore.boards : {};
  // always let users reconnect
  this.users = [];

  this.join = function(person, room) {
    var room = room || 'public';
    this.users.push(person);
    if (!this.boards[room]) {
        this.boards[room] = new vnc.Board();
        this.boards[room].newGame();
    }
  };

  this.unjoin = function(person) {
    var index = this.users.indexOf(person);
    if (index >= 0) {
      this.users.splice(index, 1);
    }
  };

  this.board = function(room) {
    var room = room || 'public';
    return this.boards[room];
  };

  for (var i = 0; i < arguments.length; i++) {
    this.join(arguments[i]);
  };
};


vnc.Board = function() {
  this.turn = 0;
};

vnc.Board.prototype.newGame = function(white, black, turn) {
  this.white = vnc.copy(white || vnc.Piece.START);
  this.black = vnc.copy(black || vnc.Piece.START);
  this.turn = turn === undefined ? vnc.Piece.WHITE : turn;
  this.lastMove = {};
  this.history = [];
  this.paths = [];
  this.path = 0;
  this.paths.push(this.history);
  vnc.Board.prototype.init.call(this);
  this.index = 0;
  this.count = 32; // 32 pieces at the start
  this.history[this.index] = {move: null, count: 32,
                             white: vnc.copy(this.white),
                             black: vnc.copy(this.black),
                             grid:  vnc.copy(this.grid)};
  return this;
};

vnc.Board.prototype.loadGame = function(data) {
  return this;
};

vnc.color = function(c) { return vnc.Piece.color[c] };
vnc.Board.prototype.color = function(c) { return vnc.color(c || this.turn); };

// export as node module
var module = module || {};
module.exports = vnc;
