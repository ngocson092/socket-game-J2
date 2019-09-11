
window['Game'] =function () {
    var myBoard = 'myBoard';
    var boardInstance = {};
    let $board = $('#' + myBoard);
    let squareClass = 'square-2b8ce';



    var Game = {
        game: null,
        Xiangqi: new Xiangqi(),
        sound () {
            return {
                playAudio: function (type) {
                    let audioElement= $('#sound_' + type)[0]

                    if(typeof audioElement != 'undefined'){
                        console.log('#sound_' + type);
                        audioElement.currentTime = 0;
                        audioElement.play();
                    }


                },
                win: function () {
                    this.playAudio('win')
                },
                lose: function () {
                    this.playAudio('lose')
                },
                attackedKing: function () {
                    this.playAudio('attacked_king')
                },
                stepMove: function () {
                    this.playAudio('stepmove')
                },
                killPiece: function () {
                    this.playAudio('kill_piece')
                },
                startGame: function () {
                    this.playAudio('start_game')
                }

            }
        },

        popup(){
            var _this = this;

            return {

                startGame(){

                    setTimeout(function () {

                        var startGame = setInterval(function () {

                            $(document).ready(function () {
                                if($board.find('.game-popup .start-game').length && $('#audio-list').find('audio').length){
                                    _this.sound().startGame()
                                    $board.find('.game-popup .start-game').fadeIn(400)
                                    setTimeout(function () {
                                        $board.find('.game-popup .start-game').fadeOut()
                                    },800)
                                    clearInterval(startGame)
                                }
                            })

                        },200)

                    },300)


                },
                attackedKing(){

                        if($board.find('.game-popup .king-attacked').length && $('#audio-list').find('audio').length){
                            _this.sound().attackedKing()
                            $board.find('.game-popup .king-attacked').fadeIn(400)
                            setTimeout(function () {
                                $board.find('.game-popup .king-attacked').fadeOut()
                            },800)

                        }

                },
                winGame(){
                    if($board.find('.game-popup .win-game').length && $('#audio-list').find('audio').length){
                        $board.find('.game-popup .win-game').fadeIn(400)
                    }

                },
                loseGame(){
                    if($board.find('.game-popup .lose-game').length && $('#audio-list').find('audio').length){
                        $board.find('.game-popup .lose-game').fadeIn(400)
                    }

                }
            }

        },
        initGame () {
            this.popup().startGame()


            this.board = Xiangqiboard(myBoard, this.getConfig());
            boardInstance = this.board;

            $board.append(`
                <div class="game-popup">
                    <div class="king-attacked"></div>
                    <div class="start-game"></div>
                    <div class="win-game"></div>
                    <div class="lose-game"></div>
                </div>
           
            `)

        },

        getConfig  () {

            var coreGame = this.Xiangqi;
            function markStepBefore(source, target) {
                $board.find('.' + squareClass).removeClass('highlight-move-source');
                $board.find('.square-' + source).addClass('highlight-move-source');
                $board.find('.' + squareClass).removeClass('highlight-move-target');
                $board.find('.square-' + target).addClass('highlight-move-target');
            }
            function removeGreySquares() {
                $('#myBoard .square-2b8ce').removeClass('highlight');
            }
            function greySquare(square, notE) {
                let $square = $('#myBoard .square-' + square);
                let $squarenotE = $('#myBoard .square-' + square).not('.square-' + notE);
                $square.addClass('highlight');
                if ($squarenotE.find('img').length) {
                    $squarenotE.addClass('mark-attack')
                }
            }

            function onDrop(source, target) {
                console.log('onDrop', source, target);
                removeGreySquares();

                // see if the move is legal
                let move = coreGame.move({
                    from: source,
                    to: target
                });
                markStepBefore(source, target);
                // illegal move
                if (move === null) return 'snapback';


            }
            function onClickPiece(square, squareElsIds) {
                console.log('onClickPiece');
                console.log(this);

                // get list of possible moves for this square

                // var currentPieceLength = _.keys(game.);

                let moves = coreGame.moves({
                    square: square,
                    verbose: true
                });

                // exit if there are no moves available for this square
                if (moves.length === 0) return;

                // highlight the square they moused over
                greySquare(square, square);

                // highlight the possible squares for this piece
                for (let i = 0; i < moves.length; i++) {
                    greySquare(moves[i].to, square);
                }
            }
            function onClickOutPiece(square, piece) {
                removeGreySquares();
            }
            function onSnapEnd() {
                boardInstance.position(boardInstance.fen());
            }
            function onDragStart (source, piece) {
                // do not pick up pieces if the game is over
                if (coreGame.game_over()) return false;

                // or if it's not that side's turn
                if ((coreGame.turn() === 'r' && piece.search(/^b/) !== -1) ||
                    (coreGame.turn() === 'b' && piece.search(/^r/) !== -1)) {
                    return false;
                }
            }




            return {
                draggable: false,
                sparePieces: false,
                position: 'start',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onClickOutPiece: onClickOutPiece,
                onClickPiece:onClickPiece,
                onSnapEnd:onSnapEnd,
                pieceTheme(piece) {
                    if (piece.search(/r/) !== -1) {
                        return '/images/' + piece + '.png';
                    }
                    return '/images/' + piece + '.png';
                },
                boardTheme: '/images/ban_co_3.png',
                sound: this.sound(),
                yourTurn: 'r',
                xiangqi: this.Xiangqi,
                popup: this.popup(),
            }
        }
    };
    return Game;
}
