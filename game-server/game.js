import cup from './acosg';

let defaultGame = {
    state: {
        board: [
            // [0, 2, 0, 2, 0, 2, 0, 2],
            // [0, 0, 2, 0, 2, 0, 2, 0],
            // [0, 2, 0, 2, 0, 0, 0, 2],
            // [2, 0, 0, 0, 1, 0, 2, 0],
            // [0, 0, 0, 0, 0, 1, 0, 0],
            // [1, 0, 1, 0, 0, 0, 1, 0],
            // [0, 1, 0, 1, 0, 1, 0, 1],
            // [1, 0, 0, 0, 1, 0, 1, 0]
            // [0, 0, 0, 2, 0, 2, 0, 0], [2, 0, 0, 0, 2, 0, 2, 0], [0, 2, 0, 2, 0, 2, 0, 2], [2, 0, 0, 0, 0, 0, 2, 0], [0, 1, 0, 1, 0, 1, 0, 1], [0, 0, 0, 0, 0, 0, 4, 0], [0, 1, 0, 1, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0]

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
        let player = players[id];

        let otherType = this.getOppositeType(player.type);
        let otherId = this.getPlayerIdFromType(otherType);

        this.setWinner(otherId, 'forfeit')

    }

    onMove(action) {
        let state = cup.state();
        let id = action.user.id;
        let user = cup.players(id);


        let from = action.payload.from;
        let dir = action.payload.dir;
        let kill;

        let x = from[0];
        let y = from[1];
        let next = cup.next();

        //if the previous move is part of a chain,
        // force the user to play one of the moves
        if (next.pos) {
            let rx = next.pos[0];
            let ry = next.pos[1];

            if (rx != x && ry != y) {
                cup.ignore();
                return false;
            }

            let isValidDirection = false;
            if (Array.isArray(next.dirs))
                for (var i = 0; i < next.dirs.length; i++) {
                    if (dir == next.dirs[i])
                        isValidDirection = true;
                }

            if (!isValidDirection) {
                cup.ignore();
                return false;
            }
        }

        if (!this.processValidMove(action.user.id, user, from, dir)) {
            cup.ignore();
            return false;
        }

        if (user.score >= 12) {
            this.setWinner(action.user.id, 'winner');
            return true;
        }

        cup.setTimelimit(3000);
        // this.selectNextPlayer(action.user.id);
        // cup.event('move', {
        //     id, from, dir
        // });
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
    processValidMove(userid, user, from, dir, isChain) {

        let state = cup.state();

        let x = from[0];
        let y = from[1];
        let cell = this.getCell(x, y)

        if (!isChain && !this.checkUserOwnsCell(user.type, cell))
            return false;

        if (isChain && cell != 0)
            return false;

        if (!isChain && !this.checkValidAction(cell, dir))
            return false;

        if (isChain && !this.checkValidAction(isChain, dir))
            return false;

        let cellTo = this.actionToCell(from[0], from[1], dir);
        if (cellTo == null)
            //invalid move 
            return false;

        let to = this.actionToCoords(from[0], from[1], dir);
        let otherType = this.getTypeFromCell(cellTo);
        if (!otherType && !isChain) {
            //clear out previous cell 
            state.board[x][y] = 0;

            //move to next cell
            state.board[to.x][to.y] = cell;

            //check if we need to king the cell
            this.processNewKing(to);

            //empty cell, allow move
            this.selectNextPlayer(user.type);
            return true;
        }

        if (!otherType && isChain)
            return false;

        if (otherType == user.type) {
            return false;
        }

        //perform action one more time to see if we can jump over
        let cellFinal = this.actionToCell(to.x, to.y, dir);
        let finalType = this.getTypeFromCell(cellFinal);

        cup.log('finalType =  ' + finalType);

        if (finalType)
            //the checker item is blocked
            return false;

        let coords = this.actionToCoords(to.x, to.y, dir);

        if (isChain) {
            if (cellFinal == 0)
                return dir;
            return false;
        }


        //run before we change the cells
        //check all the directions
        // if another eat is possible, let user go again
        let hasAnotherMove = false;
        let requiredMove = [];
        for (var i = 1; i <= 4; i++) {
            let attempt = this.processValidMove(userid, user, [coords.x, coords.y], i, cell);
            if (attempt) {
                requiredMove.push(attempt);
                hasAnotherMove = true;
            }
        }

        if (requiredMove.length > 0) {
            cup.next({ id: userid, pos: [coords.x, coords.y], dirs: requiredMove })
            cup.log("Has Another move: " + userid);
        }

        //no more moves, let next player go
        else {
            this.selectNextPlayer(user.type);
        }


        //we successfully ate the opponent
        //set their cell to 0
        //give score point to user

        //clear the previous location
        state.board[x][y] = 0;

        //eat the opponent piece
        state.board[to.x][to.y] = 0;

        //set the cell of final location
        state.board[coords.x][coords.y] = cell;

        this.processNewKing(coords);

        // cup.log("Start Pos: " + JSON.stringify({ x, y }));
        // cup.log("Opponent Pos: " + JSON.stringify(to));
        // cup.log("Final Pos: " + JSON.stringify(coords));
        user.score += 1;

        cup.log("Player Moved: " + JSON.stringify(user));


        //check if we can eat another cell
        return true;
    }



    processNewKing(coords) {
        let state = cup.state();
        let cell = this.getCell(coords.x, coords.y);
        //B reaches the top of the board
        if (cell == 1) {
            if (coords.x == 0) {
                state.board[coords.x][coords.y] = 3;
            }
        }
        //W reaches bottom of the board
        else if (cell == 2) {
            if (coords.x == 7) {
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

    getPlayerIdFromType(type) {
        let players = cup.players();
        for (var id in players) {
            let player = players[id];
            if (player?.type == type)
                return id;
        }


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

    getCell = (x, y) => {
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

        let randomPlayerID = Math.floor(Math.random() * playerList.length);
        state.sx = playerList[randomPlayerID];


        //set the starting player, and set type for other player
        let players = cup.players();
        for (var id in players) {
            let player = players[id];
            player.rank = 2;
            player.score = 0;
            player.type = 'W';
            cup.log(id + ' ' + JSON.stringify(player));
        }

        players[state.sx].type = 'B';

        cup.next({ id: state.sx });
        cup.event('newround', true);
        cup.setTimelimit(30000);
    }

    findNextPlayer() {
        let state = cup.state();
        let next = cup.next();
        let players = cup.players();
        let current = players[next.id];
        let otherType = this.getOppositeType(current.type);
        let otherId = this.getPlayerIdFromType(otherType);
        return otherId;
    }

    selectNextPlayer(type) {
        cup.log("Current Type: " + type);
        let otherType = this.getOppositeType(type);
        cup.log("Other Type: " + otherType);
        let otherId = this.getPlayerIdFromType(otherType);
        cup.next({ id: otherId });
        cup.log("Next PLayer: " + otherId);
    }


    setTie() {
        cup.gameover({ type: 'tie' })
        cup.next({});
    }

    // set the winner event and data   
    setWinner(playerid, type) {
        //find user who matches the win type  
        let player = cup.players(playerid);
        if (!player) {
            player = {}
            player.id = 'unknown player';
        }

        player.rank = 1;

        cup.gameover({
            type,
            id: playerid
        });
    }
}

export default new Checkers();