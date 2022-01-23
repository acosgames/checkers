
import React, { Component, useEffect } from 'react';
import fs from 'flatstore';
import Cell from './Cell';
import Timebar from './timebar';


function findOtherPlayer(localId) {
    let players = fs.get('players');
    for (var id in players) {
        let player = players[id];
        if (id != localId)
            return { id, player };
    }
    return { id: null, player: null };
}

function Timeleft(props) {
    let timeleft = props.timeleft;
    try {
        if (typeof timeleft != 'number')
            timeleft = Number.parseInt(timeleft);

        timeleft = Math.ceil(timeleft / 1000);
    }
    catch (e) {
        timeleft = 0;
    }
    return (<>{timeleft}</>)
}
Timeleft = fs.connect(['timeleft'])(Timeleft);

function TopPlayer(props) {
    let local = fs.get('local');
    let next = fs.get('next');
    let events = fs.get('events');
    let gameover = events?.gameover;
    let isWinner = gameover?.id == local.id;

    let other = findOtherPlayer(local.id);
    let player = other?.player;
    let id = other?.id + '';
    let isNext = (next?.id == id || isWinner);
    let classNext = isNext ? 'next' : '';

    let score = player?.score || 0;
    if (score > 0) {
        score = '+' + score;
    }
    else {
        score = '';
    }


    return (
        <div className={"hstack " + classNext + ' type-' + player?.type}>
            <div className={"ztop hstack " + classNext + ' type-' + player?.type}>

                <div className={'marker'}>{isNext ? '⇨' : ''}</div>
                <div className="timer"><Timeleft /></div>
                <div className="player">{player?.name}</div>
                <div className="eaten">{score}</div>

            </div>
            <Timebar />
        </div>
    )
}
TopPlayer = fs.connect(['next'])(TopPlayer);


function BottomPlayer(props) {

    let local = fs.get('local');
    let next = fs.get('next');

    let events = fs.get('events');
    let gameover = events?.gameover;
    let isWinner = gameover?.id == local.id;

    let isNext = (next.id == local.id) || isWinner;
    let classNext = isNext ? 'next' : '';

    let score = local?.score || 0;
    if (score > 0) {
        score = '+' + score;
    }
    else {
        score = '';
    }
    if (isWinner)
        score = 'WINNER';
    return (
        <div className={"hstack " + classNext + ' type-' + local?.type}>
            <div className={"ztop hstack " + classNext + ' type-' + local?.type}>
                <div className={'marker'}>{isNext ? '⇨' : ''}</div>
                <div className="timer"><Timeleft /></div>
                <div className="player">{local.name}</div>
                <div className="eaten">{score}</div>
            </div>
            <Timebar />
        </div>
    )
}
BottomPlayer = fs.connect(['next'])(BottomPlayer);


function IsChainUpdate(props) {
    useEffect(() => {
        let local = fs.get('local');
        let next = fs.get('next');
        if (next.id != local.id)
            return;
        fs.set('highlight', []);
        fs.set('selected', null);
    })
    return <></>
}
IsChainUpdate = fs.connect(['next-pos'])(IsChainUpdate);


class Gamescreen extends Component {
    constructor(props) {
        super(props);
        this.ref = null;
    }



    updatePosition() {
        if (!this.ref)
            return;

        let rect = JSON.stringify(this.ref.getBoundingClientRect());
        rect = JSON.parse(rect);
        rect.offsetWidth = this.ref.offsetWidth;
        rect.offsetHeight = this.ref.offsetHeight;

        fs.set('gamearea', rect);
    }

    renderCheckerGrid() {
        let elems = [];
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                elems.push(<Cell key={x + ',' + y} x={x} y={y} />)
            }
        }
        return elems;
    }

    render() {

        let local = fs.get('local');
        let shouldRotate = local.type == 'W';
        let classRotate = shouldRotate ? 'shouldRotate' : '';
        return (
            <div className="gamewrapper" ref={el => {
                if (!el) return;
                this.ref = el;
                setTimeout(this.updatePosition.bind(this), 2000);
            }}>
                <IsChainUpdate />
                <div className="vstack">
                    <TopPlayer />
                    <div className="gamescreen" >
                        <div className={"checkers-grid " + classRotate}>
                            {this.renderCheckerGrid()}
                        </div>
                    </div>
                    <BottomPlayer />
                </div>
            </div>
        )
    }

}

export default fs.connect(['local'])(Gamescreen);