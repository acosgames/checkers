import fs from 'flatstore';
import { send } from '../acosg';
import { useEffect } from 'react';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

fs.set('highlight', []);

function Cell(props) {

    // 'state-board', 'selected', 'highlight'
    let [state] = fs.useWatch('state');
    let [selected] = fs.useWatch('selected');
    let [highlighted] = fs.useWatch('highlight');


    const x = props.x;
    const y = props.y;
    // const state = fs.get('state');
    let board = state?.board;
    let cell = 0;
    if (board) {
        cell = board[x][y];
    }


    const getCell = (x, y) => {
        let state = fs.get('state');
        if (x < 0 || x >= 8 || y < 0 || y >= 8)
            return null;
        if (!state.board)
            return null;
        return state.board[x][y];
    }

    const actionToCoords = (x, y, dir) => {

        var coords = { x, y };
        switch (dir) {
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
        coords.dir = dir;
        return coords;
    }

    const actionToCell = (x, y, action) => {
        switch (action) {
            case 1: //left up
                return leftUpDiagonal(x, y)
            case 2: //right up
                return rightUpDiagonal(x, y)
            case 3: //left down
                return leftDownDiagonal(x, y)
            case 4: //right down
                return rightDownDiagonal(x, y)
        }
    }

    const leftUpDiagonal = (x, y) => {
        return getCell(x - 1, y - 1);
    }
    const rightUpDiagonal = (x, y) => {
        return getCell(x - 1, y + 1);
    }
    const leftDownDiagonal = (x, y) => {
        return getCell(x + 1, y - 1);
    }
    const rightDownDiagonal = (x, y) => {
        return getCell(x + 1, y + 1);
    }

    /**
     * Validation Checks
     * 0. Check if user owns the cell
     * 1. Check blocked
     * 2. Check diagonal move
     * 3. Check jump over opponent into empty spot
     * 4. Check lands on touchdown
     * 
     * Dir=1 -- Left Up Diagonal
     * x=(x-1); y=(y-1);
     * Dir=2 -- Right Up Diagonal
     * x=(x-1); y=(y+1);
     * Dir=3 -- Left Down Diagonal
     * x=(x+1); y=(y-1);
     * Dir=4 -- Right Down Diagonal
     * x=(x+1); y=(y+1);
     * 
     * @param {[x,y]} from 
     * @param {[x,y]} to 
     */
    const processsValidMove = (x, y, dir, isTest) => {

        let user = fs.get('local');
        let players = fs.get('players');
        let state = fs.get('state');

        let cell = getCell(x, y)

        //normal run we can only move our own piece
        if (!isTest && !checkUserOwnsCell(user.type, cell))
            return false;

        //testing a chain jump must have empty cell
        if (isTest && cell != 0)
            return false;

        if (!isTest && !checkValidAction(cell, dir))
            return false;

        if (isTest && !checkValidAction(isTest, dir))
            return false;

        let cellTo = actionToCell(x, y, dir);
        if (cellTo == null)
            //invalid move
            return false;

        const coords = actionToCoords(x, y, dir);
        let otherType = getTypeFromCell(cellTo);
        if (!otherType) {
            if (!isTest)
                //empty cell, allow move
                return [coords];

            return false;

        }

        if (otherType == user.type)
            return false;

        //perform action one more time to see if we can jump over opponent piece

        let cellFinal = actionToCell(coords.x, coords.y, dir);
        let finalType = getTypeFromCell(cellFinal);

        if (finalType)
            //the checker item is blocked
            return false;


        //we can successfully eat the opponent
        //get coords to highlight those cells
        const to = actionToCoords(coords.x, coords.y, dir);

        let results = [to];

        if (isTest)
            return results;

        for (var i = 1; i <= 4; i++) {
            let attempt = processsValidMove(to.x, to.y, i, cell);
            if (attempt) {
                for (var a = 0; a < attempt.length; a++) {
                    results.push(attempt[a]);
                }
            }
        }


        //check if we can eat another cell
        return results;
    }


    const checkValidAction = (cell, dir) => {
        //black starters can only go up
        if (cell == 1) {
            if (dir != 1 && dir != 2)
                return false;
        }
        //white starters can only go down
        else if (cell == 2) {
            if (dir != 3 && dir != 4)
                return false;
        }

        //everything else is fair game
        return true;
    }

    const getPlayerFromType = (type) => {
        let players = cup.players();
        for (var id in players)
            if (players[id] == type)
                return players[id];
    }
    const getTypeFromCell = (cell) => {
        if (cell == 1 || cell == 3)
            return 'B';
        if (cell == 2 || cell == 4)
            return 'W';
        return null;
    }

    const getOppositeType = (type) => {
        return type == 'B' ? 'W' : 'B';
    }

    const checkUserOwnsCell = (type, cell) => {
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



    // XOXOXOXO
    // OXOXOXOX
    // at row 0
    // white when even
    // brown when odd
    //next rows flip 
    let squareType = '';
    if (y % 2)
        squareType = (x % 2) ? 'even' : 'odd';
    else
        squareType = (x % 2) ? 'odd' : 'even';

    let selectedX = selected?.x;
    let selectedY = selected?.y;
    let isSelected = (selectedX == x && selectedY == y);

    // let highlighted = fs.get('highlight') || [];
    let isHighlighted = false;
    for (var i = 0; i < highlighted.length; i++) {
        let h = highlighted[i];
        if (h.x == x && h.y == y)
            isHighlighted = h;
    }

    const classSelected = isSelected ? 'selected' : '';
    const classHighlighted = isHighlighted ? 'highlight' : '';

    //on first click, select the cell (only if user owns it)
    const onCellClick = (isSimulate) => {

        if (isSelected) {
            return;
        }

        if (isHighlighted) {
            let selected = fs.get('selected');
            if (selected && !isSimulate)
                send('move', { from: [selected.x, selected.y], dir: isHighlighted.dir })
            fs.set('highlight', []);
            fs.set('selected', null);
            return;
        }

        let local = fs.get('local');
        let cell = getCell(x, y);
        if (local.type == 'B' && (cell == 1 || cell == 3)) {
            fs.set('selected', { x, y });
        }
        else if (local.type == 'W' && (cell == 2 || cell == 4)) {
            fs.set('selected', { x, y });
        }
        else {
            return;
        }


        let highlight = [];
        for (var i = 1; i <= 4; i++) {
            let attempt = processsValidMove(x, y, i);
            if (attempt) {
                for (var a = 0; a < attempt.length; a++)
                    highlight.push(attempt[a]);
            }

        }

        fs.set('highlight', highlight);
    }

    useEffect(() => {

        //check if user is forced into doing a chain move
        //if they are, highlight the items for them
        let next = fs.get('next');
        if (next.pos) {

            if (x == next.pos[0] && y == next.pos[1]) {
                onCellClick(true);
            }
        }
    })

    let isKing = (cell == 3 || cell == 4);
    let checkerType = isKing ? 'K' : '';
    let classCheckerType = isKing ? 'king' : 'normie';

    const user = fs.get('local');
    let shouldRotate = user.type == 'W';
    let classRotate = shouldRotate ? 'shouldRotate' : '';

    // let choices = [1, 2, 3, 4]; 
    // cell = choices[getRandomInt(0, 3)]; 
    return (
        <div className={"cell " + squareType} onClick={() => { onCellClick() }}>
            <div className={'type-' + cell + ' ' + classCheckerType + ' ' + classRotate} >
                <span></span>
            </div>
            <div className={classHighlighted + ' ' + classSelected}></div>
        </div>
    )
}


export default Cell;