$(document).ready(function () {



    /*
    * setup game
    *
    * */

    if(isBoardElementReady()){
        var chessGame = new Game()
        chessGame.initGame();
    }


    function isBoardElementReady(){
        return  $('#myBoard').length
    }


    $('#btn-create-room').click(function () {
        var rand = Math.floor((Math.random() * 1000) + 1);
        window.location = '/room/' + rand;
    });

    $('#button').click(function () {
        localStorage.setItem('history', JSON.stringify(game.history()))
        localStorage.setItem('game_fen', JSON.stringify(game.fen()))
    })

    $('#load-history').click(function () {
        let gamefen = JSON.parse(localStorage.getItem('game_fen'))
        let boardfen = gamefen.split(' ')[0]
        boardInstance.position(boardfen);
        game = new Xiangqi(gamefen);
        config.xiangqi = game
    })


})
