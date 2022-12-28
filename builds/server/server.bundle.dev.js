/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./game-server/acosg.js":
/*!******************************!*\
  !*** ./game-server/acosg.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

class ACOSG {
    constructor() {
        try {
            this.actions = JSON.parse(JSON.stringify(globals.actions()));
        }
        catch (e) { this.error('Failed to load actions'); return }
        try {
            this.originalGame = JSON.parse(JSON.stringify(globals.game()));
        }
        catch (e) { this.error('Failed to load originalGame'); return }
        try {
            this.nextGame = JSON.parse(JSON.stringify(globals.game()));
        }
        catch (e) { this.error('Failed to load nextGame'); return }


        this.currentAction = null;

        this.isNewGame = false;
        // this.markedForDelete = false;
        this.defaultSeconds = 15;
        // this.nextTimeLimit = -1;
        this.kickedPlayers = [];

        // if (!this.nextGame || !this.nextGame.rules || Object.keys(this.nextGame.rules).length == 0) {
        //     this.isNewGame = true;
        //     this.error('Missing Rules');
        // }

        if (this.nextGame) {
            if (!('timer' in this.nextGame)) {
                this.nextGame.timer = {};
            }
            if (!('state' in this.nextGame)) {
                this.nextGame.state = {};
            }

            if (!('players' in this.nextGame)) {
                this.nextGame.players = {};
            }

            //if (!('prev' in this.nextGame)) {
            this.nextGame.prev = {};
            //}

            if (!('next' in this.nextGame)) {
                this.nextGame.next = {};
            }

            if (!('rules' in this.nextGame)) {
                this.nextGame.rules = {};
            }

            this.nextGame.events = {};
        }



    }

    on(type, cb) {

        // if (type == 'newgame') {
        //     //if (this.isNewGame) {
        //     this.currentAction = this.actions[0];
        //     if (this.currentAction.type == '')
        //         cb(this.actions[0]);
        //     this.isNewGame = false;
        //     //}

        //     return;
        // }

        for (var i = 0; i < this.actions.length; i++) {
            if (this.actions[i].type == type) {
                this.currentAction = this.actions[i];
                let result = cb(this.currentAction);
                if (typeof result == "boolean" && !result) {
                    this.ignore();
                    break;
                }
            }

        }

    }

    ignore() {
        globals.ignore();
        return false;
    }

    setGame(game) {
        for (var id in this.nextGame.players) {
            let player = this.nextGame.players[id];
            game.players[id] = player;
        }
        this.nextGame = game;
    }

    submit() {
        if (this.kickedPlayers.length > 0)
            this.nextGame.kick = this.kickedPlayers;

        globals.finish(this.nextGame);
    }

    gameover(payload) {
        this.event('gameover', payload);
    }

    log(msg) {
        globals.log(msg);
    }
    error(msg) {
        globals.error(msg);
    }

    kickPlayer(id) {
        this.kickedPlayers.push(id);
    }

    database() {
        return globals.database();
    }

    action() {
        return this.currentAction;
    }

    state(key, value) {

        if (typeof key === 'undefined')
            return this.nextGame.state;
        if (typeof value === 'undefined')
            return this.nextGame.state[key];

        this.nextGame.state[key] = value;
    }

    playerList() {
        return Object.keys(this.nextGame.players);
    }
    playerCount() {
        return Object.keys(this.nextGame.players).length;
    }

    players(userid, value) {
        if (typeof userid === 'undefined')
            return this.nextGame.players;
        if (typeof value === 'undefined')
            return this.nextGame.players[userid];

        this.nextGame.players[userid] = value;
    }

    rules(rule, value) {
        if (typeof rule === 'undefined')
            return this.nextGame.rules;
        if (typeof value === 'undefined')
            return this.nextGame.rules[rule];

        this.nextGame.rules[rule] = value;
    }

    prev(obj) {
        if (typeof obj === 'object') {
            this.nextGame.prev = obj;
        }
        return this.nextGame.prev;
    }

    next(obj) {
        if (typeof obj === 'object') {
            this.nextGame.next = obj;
        }
        return this.nextGame.next;
    }

    setTimelimit(seconds) {
        seconds = seconds || this.defaultSeconds;
        if (!this.nextGame.timer)
            this.nextGame.timer = {};
        this.nextGame.timer.set = Math.min(10000, Math.max(10, seconds));
    }

    reachedTimelimit(action) {
        if (typeof action.timeleft == 'undefined')
            return false;
        return action.timeleft <= 0;
    }

    event(name, payload) {
        if (!payload)
            return this.nextGame.events[name];

        this.nextGame.events[name] = payload || {};
    }

    clearEvents() {
        this.nextGame.events = {};
    }
    // events(name) {
    //     if (typeof name === 'undefined')
    //         return this.nextGame.events;
    //     this.nextGame.events.push(name);
    // }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new ACOSG());

/***/ }),

/***/ "./game-server/game.js":
/*!*****************************!*\
  !*** ./game-server/game.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _acosg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./acosg */ "./game-server/acosg.js");


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
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].setGame(defaultGame);
        this.newRound();;
    }

    onSkip(action) {
        let next = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next();
        if (!next || !next.id)
            return;

        this.playerLeave(next.id);
    }

    onJoin(action) {
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].log(action);
        if (!action.user.id)
            return;

        let player = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players(action.user.id);
        player.rank = 2;
        player.score = 0;

        let playerCount = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].playerCount();
        if (playerCount <= 2) {
            _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].event('join', {
                id: action.user.id
            });
        }
    }

    onLeave(action) {
        this.playerLeave(action.user.id);
    }

    playerLeave(id) {
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
        let player = players[id];

        let otherType = this.getOppositeType(player.type);
        let otherId = this.getPlayerIdFromType(otherType);

        this.setWinner(otherId, 'forfeit')

    }

    onMove(action) {
        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
        let id = action.user.id;
        let user = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players(id);


        let from = action.payload.from;
        let dir = action.payload.dir;
        let kill;

        let x = from[0];
        let y = from[1];
        let next = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next();

        //if the previous move is part of a chain,
        // force the user to play one of the moves
        if (next.pos) {
            let rx = next.pos[0];
            let ry = next.pos[1];

            if (rx != x && ry != y) {
                _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].ignore();
                return false;
            }

            let isValidDirection = false;
            if (Array.isArray(next.dirs))
                for (var i = 0; i < next.dirs.length; i++) {
                    if (dir == next.dirs[i])
                        isValidDirection = true;
                }

            if (!isValidDirection) {
                _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].ignore();
                return false;
            }
        }

        if (!this.processValidMove(action.user.id, user, from, dir)) {
            _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].ignore();
            return false;
        }

        if (user.score >= 12) {
            this.setWinner(action.user.id, 'winner');
            return true;
        }

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].setTimelimit(30);
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

        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();

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

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].log('finalType =  ' + finalType);

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
            _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next({ id: userid, pos: [coords.x, coords.y], dirs: requiredMove })
            _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].log("Has Another move: " + userid);
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

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].log("Player Moved: " + JSON.stringify(user));


        //check if we can eat another cell
        return true;
    }



    processNewKing(coords) {
        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
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
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
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
        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
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
        let playerList = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].playerList();

        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
        //select the starting player

        let randomPlayerID = Math.floor(Math.random() * playerList.length);
        state.sx = playerList[randomPlayerID];


        //set the starting player, and set type for other player
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
        for (var id in players) {
            let player = players[id];
            player.rank = 2;
            player.score = 0;
            player.type = 'W';
            _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].log(id + ' ' + JSON.stringify(player));
        }

        players[state.sx].type = 'B';

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next({ id: state.sx });
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].event('newround', true);
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].setTimelimit(30);
    }

    findNextPlayer() {
        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
        let next = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next();
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
        let current = players[next.id];
        let otherType = this.getOppositeType(current.type);
        let otherId = this.getPlayerIdFromType(otherType);
        return otherId;
    }

    selectNextPlayer(type) {
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].log("Current Type: " + type);
        let otherType = this.getOppositeType(type);
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].log("Other Type: " + otherType);
        let otherId = this.getPlayerIdFromType(otherType);
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next({ id: otherId });
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].log("Next PLayer: " + otherId);
    }


    setTie() {
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].gameover({ type: 'tie' })
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next({});
    }

    // set the winner event and data   
    setWinner(playerid, type) {
        //find user who matches the win type  
        let player = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players(playerid);
        if (!player) {
            player = {}
            player.id = 'unknown player';
        }

        player.rank = 1;

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].gameover({
            type,
            id: playerid
        });
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new Checkers());

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************************!*\
  !*** ./game-server/index.js ***!
  \******************************/
/* harmony import */ var _acosg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./acosg */ "./game-server/acosg.js");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./game */ "./game-server/game.js");




_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('gamestart', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onNewGame(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('skip', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onSkip(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('join', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onJoin(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('leave', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onLeave(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('move', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onMove(action));

_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].submit();
})();

/******/ })()
;
//# sourceMappingURL=server.bundle.dev.js.map