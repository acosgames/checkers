import cup from './acosg';

let defaultGame = {
    state: {
        board: [
            [0, 2, 0, 2, 0, 2, 0, 2], //white
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0], //black
        ]
    },
    players: {},
    next: {},
    events: {}
}

class Checkers {

    onNewGame(action) {
        cup.setGame(defaultGame);
        this.newRound();;
    }

    onSkip(action) {
        let next = cup.next();
        if (!next || !next.id)
            return;

        this.playerLeave(next.id);
    }

    onJoin(action) {
        cup.log(action);
        if (!action.user.id)
            return;

        let player = cup.players(action.user.id);
        player.rank = 2;
        player.score = 0;

        let playerCount = cup.playerCount();
        if (playerCount <= 2) {
            cup.event('join', {
                id: action.user.id
            });
        }
    }

    onLeave(action) {
        this.playerLeave(action.user.id);
    }

    playerLeave(id) {
        let players = cup.players();
        let otherPlayerId = null;
        if (players[id]) {
            otherPlayerId = this.selectNextPlayer(id);
            //delete players[id];
        }

        if (otherPlayerId) {
            let otherPlayer = players[otherPlayerId];
            this.setWinner(otherPlayer.type, 'forfeit')
        }
    }

    onMove(action) {
        let state = cup.state();
        let id = action.user.id;
        let user = cup.players(id);


        let from = action.payload.from;
        let dir = action.payload.dir;
        let kill;

        if (!this.processsValidMove(action.user.id, user, from, dir)) {
            cup.ignore();
            return false;
        }

        if (user.score >= 12) {
            this.setWinner(user);
            return true;
        }

        cup.setTimelimit(10000);
        this.selectNextPlayer(action.user.id);
        cup.event('move', {
            id, from, dir
        });
    }


    /**
     * Validation Checks
     * 0. Check if user owns the cell
     * 1. Check blocked
     * 2. Check diagonal move
     * 3. Check jump over opponent into empty spot
     * 4. Check lands on touchdown
     * 
     * Left Up Diagonal
     * x=(x-1); y=(y-1);
     * Right Up Diagonal
     * x=(x+1); y=(y-1);
     * Left Down Diagonal
     * x=(x-1); y=(y+1);
     * Right Down Diagonal
     * x=(x+1); y=(y+1);
     * 
     * @param {[x,y]} from 
     * @param {[x,y]} to 
     */
    processsValidMove(userid, user, from, dir, isTest) {

        let state = cup.state();

        let x = from[0];
        let y = from[1];
        let cell = this.getCell(x, y)

        if (!this.checkUserOwnsCell(user.type, cell))
            return false;

        if (!this.checkValidAction(cell, dir))
            return false;

        let cellTo = this.actionToCell(from[0], from[1], dir);
        if (cellTo == null)
            //invalid move
            return false;

        let otherType = this.getTypeFromCell(cellTo);
        if (!otherType) {

            let to = this.actionToCoords(from[0], from[1], dir);

            //clear out previous cell 
            state.board[x][y] = 0;

            //move to next cell
            state.board[to.x][to.y] = cell;

            //check if we need to king the cell
            this.processNewKing(user.type, to);
            //empty cell, allow move
            return true;
        }

        //perform action one more time to see if we can jump over
        let cellFinal = this.actionToCell(from[0], from[1], dir);
        let finalType = this.getTypeFromCell(cellFinal);

        if (finalType)
            //the checker item is blocked
            return false;

        if (isTest)
            return true;

        //we successfully ate the opponent
        //set their cell to 0
        //give score point to user
        let to = this.actionToCoords(from[0], from[1], dir);
        board[to.x][to.y] = 0;
        user.score += 1;

        //check all the directions
        // if another eat is possible, let user go again
        let hasAnotherMove = false;
        for (var i = 1; i <= 4; i++) {
            if (this.processsValidMove(userid, user, from, i, true)) {
                hasAnotherMove = true;
                cup.next({ id: userid })
                break;
            }
        }

        //no more moves, let next player go
        if (!hasAnotherMove) {
            let otherType = this.getOppositeType(user.type);
            let otherId = this.getPlayerFromType(otherType);
            cup.next({ id: otherId });
        }

        //check if we can eat another cell
        return true;
    }

    processNewKing(type, coords) {
        let state = cup.state();
        let cell = this.getCell(coords.x, coords.y);
        //B reaches the top of the board
        if (type == 'B' && cell == 1) {
            if (coords.y == 0) {
                state.board[coords.x][coords.y] = 3;
            }
        }
        //W reaches bottom of the board
        else if (type == 'W' && cell == 2) {
            if (coords.y == 7) {
                state.board[coords.x][coords.y] = 4;
            }
        }

    }

    checkValidAction(cell, action) {
        //black starters can only go up
        if (cell == 1) {
            if (action != 1 && action != 2)
                return false;
        }
        //white starters can only go down
        else if (cell == 2) {
            if (action != 3 && action != 4)
                return false;
        }

        //everything else is fair game
        return true;
    }

    getPlayerFromType(type) {
        let players = cup.players();
        for (var id in players)
            if (players[id] == type)
                return players[id];
    }
    getTypeFromCell(cell) {
        if (cell == 1 || cell == 3)
            return 'B';
        if (cell == 2 || cell == 4)
            return 'W';
        return null;
    }

    getOppositeType(type) {
        return type == 'B' ? 'W' : 'B';
    }

    checkUserOwnsCell(type, cell) {
        if (type == 'B') {
            if (cell != 1 && cell != 3) {
                return false;
            }
        }
        else if (type == 'W') {
            if (cell != 2 && cell != 4) {
                return false;
            }
        }
        return true;
    }

    getCell(x, y) {
        let state = cup.state();
        if (x < 0 || x >= 8 || y < 0 || y >= 8)
            return null;
        return state.board[x][y];
    }

    actionToCoords = (x, y, action) => {

        var coords = { x, y };
        switch (action) {
            case 1: //left up
                coords = { x: (x - 1), y: (y - 1) }
                break;
            case 2: //right up
                coords = { x: (x - 1), y: (y + 1) }
                break;
            case 3: //left down
                coords = { x: (x + 1), y: (y - 1) }
                break;
            case 4: //right down
                coords = { x: (x + 1), y: (y + 1) }
                break;
        }
        coords.action = action;
        return coords;
    }

    actionToCell = (x, y, action) => {
        switch (action) {
            case 1: //left up
                return this.leftUpDiagonal(x, y)
            case 2: //right up
                return this.rightUpDiagonal(x, y)
            case 3: //left down
                return this.leftDownDiagonal(x, y)
            case 4: //right down
                return this.rightDownDiagonal(x, y)
        }
    }

    leftUpDiagonal = (x, y) => {
        return this.getCell(x - 1, y - 1);
    }
    rightUpDiagonal = (x, y) => {
        return this.getCell(x - 1, y + 1);
    }
    leftDownDiagonal = (x, y) => {
        return this.getCell(x + 1, y - 1);
    }
    rightDownDiagonal = (x, y) => {
        return this.getCell(x + 1, y + 1);
    }

    newRound() {
        let playerList = cup.playerList();

        let state = cup.state();
        //select the starting player
        if (!state.sx || state.sx.length == 0) {
            let randomPlayerID = Math.floor(Math.random() * playerList.length);
            state.sx = this.selectNextPlayer(playerList[randomPlayerID]);
        }
        else {
            state.sx = this.selectNextPlayer(state.sx);
        }

        //set the starting player, and set type for other player
        let players = cup.players();
        for (var id in players)
            players[id].type = 'W';
        players[state.sx].type = 'B';

        cup.event('newround', true);
        cup.setTimelimit(10000);
    }


    selectNextPlayer(userid) {
        let action = cup.action();
        let players = cup.playerList();
        userid = userid || action.user.id;

        //only 2 players so just filter the current player
        let remaining = players.filter(x => x != userid);
        cup.next({
            id: remaining[0],
            action: 'move'
        });
        return remaining[0];
    }


    setTie() {
        cup.gameover({ type: 'tie' })
        cup.next({});
    }

    // set the winner event and data
    setWinner(playerid) {
        //find user who matches the win type
        let player = cup.players(playerid);
        if (!player) {
            player = {}
            player.id = 'unknown player';
        }

        cup.gameover({
            type: 'winner',
            id: player.id
        });
    }
}

export default new Checkers();