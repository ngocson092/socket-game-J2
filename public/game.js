


$(document).ready(function () {



    $('#btn-create-room').click(function() {
        console.log(1111);
        var rand = Math.floor((Math.random()*1000)+1);
        window.location = '/room/' + rand;
    });



    /*
    * js for chess
    *
    * */
    if(!$('#myBoard').length){ return;}


    let board = null;
    let game = new Xiangqi();
    let $board = $('#myBoard');
    let squareClass = 'square-2b8ce';
    function markStepBefore (source,target) {

        $board.find('.' + squareClass).removeClass('highlight-move-source');
        $board.find('.square-' + source).addClass('highlight-move-source');
        $board.find('.' + squareClass).removeClass('highlight-move-target');
        $board.find('.square-' + target).addClass('highlight-move-target');

    }
    function removeGreySquares () {
        $('#myBoard .square-2b8ce').removeClass('highlight');
    }

    function greySquare (square,notE) {
        let $square = $('#myBoard .square-' + square);
        let $squarenotE = $('#myBoard .square-' + square).not('.square-'+notE);



        $square.addClass('highlight');
        if($squarenotE.find('img').length){
            $squarenotE.addClass('mark-attack')
        }
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
        markStepBefore(source,target);
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
        greySquare(square,square);

        // highlight the possible squares for this piece
        for (let i = 0; i < moves.length; i++) {
            greySquare(moves[i].to,square);
        }
    }

    function onClickOutPiece (square, piece) {
        removeGreySquares();
    }

    function onSnapEnd () {
        board.position(board.fen());
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
        pieceTheme (piece){
            // graphic theme for red pieces
            if (piece.search(/r/) !== -1) {
                return '/images/' + piece + '.png';
            }

            // traditional theme for black pieces
            return '/images/' + piece + '.png';
        },

        boardTheme: '/images/ban_co_3.png',
    };
    board = Xiangqiboard('myBoard', config);




    $('#button').click(function () {

        console.log(
            board.fen()
        );
        console.log(
            game.fen()
        );

        localStorage.setItem('history',JSON.stringify(game.history()))
        localStorage.setItem('game_fen',JSON.stringify(game.fen()))

    })

    $('#setB31Btn').on('click', function () {


        board.position('r1bakab1r/9/1cn2cn2/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1N2/9/RNBAKABR1');

        game  = new Xiangqi('r1bakab1r/9/1cn2cn2/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1N2/9/RNBAKABR1 r - - 0 1');


    });

   $('#load-history').click(function () {
       let gamefen = JSON.parse(localStorage.getItem('game_fen'))
       let boardfen =  gamefen.split(' ')[0]
       board.position(boardfen);
       game  = new Xiangqi(gamefen);
       config.xiangqi = game
    })





})
