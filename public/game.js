// NOTE: this example uses the xiangqi.js library:
// https://github.com/lengyanyu258/xiangqi.js

let board = null;
let game = new Xiangqi();

function removeGreySquares () {
    $('#myBoard .square-2b8ce').removeClass('highlight');
}

function greySquare (square) {
    let $square = $('#myBoard .square-' + square);

    $square.addClass('highlight');
}

function onDragStart (source, piece) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false;

    // or if it's not that side's turn
    if ((game.turn() === 'r' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^r/) !== -1)) {
        return false;
    }
}

function onDrop (source, target) {
    console.log('onDrop',source, target);
    removeGreySquares();

    // see if the move is legal
    let move = game.move({
        from: source,
        to: target
    });

    // illegal move
    if (move === null) return 'snapback';
}

function onClickPiece (square,squareElsIds) {
    // get list of possible moves for this square


    let moves = game.moves({
        square: square,
        verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    // highlight the square they moused over
    greySquare(square);

    // highlight the possible squares for this piece
    for (let i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
}

function onClickOutPiece (square, piece) {
    removeGreySquares();
}

function onSnapEnd () {
    board.position(game.fen());
}

let config = {
    draggable: true,
    sparePieces: false,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onClickOutPiece: onClickOutPiece,
    onClickPiece: onClickPiece,
    onSnapEnd: onSnapEnd,
    xiangqi:game,
    pieceTheme: '/library/xiangqiboardjs-0.2.0/img/xiangqipieces/wikipedia/{piece}.svg',
    boardTheme: '/library/xiangqiboardjs-0.2.0/img/xiangqiboards/wikimedia/xiangqiboard.svg',
};
board = Xiangqiboard('myBoard', config);



$(document).ready(function () {

    $('#button').click(function () {

        console.log(board);


        localStorage.setItem('history',JSON.stringify(game.history()))
        localStorage.setItem('fen',JSON.stringify(game.fen()))

    })

    $('#setB31Btn').on('click', function () {
        board.position('r1bakab1r/9/1cn2cn2/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1N2/9/RNBAKABR1');
    });

   $('#load-history').click(function () {



       var history = JSON.parse(localStorage.getItem('history'))
       var fen = JSON.parse(localStorage.getItem('fen'))


       if(history.length){
           var move = ''
           for(var i=0;i<history.length;i++){

               console.log(history[i].match(/.{1,2}/g));
               move = history[i].match(/.{1,2}/g).join('-')
               board.position(fen);
               board.start()
           }


       }


    })


})
