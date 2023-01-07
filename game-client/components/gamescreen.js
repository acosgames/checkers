
import React, { Component, useEffect, useRef } from 'react';
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
    let [timeleft] = fs.useWatch('timeleft');
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

function TopPlayer(props) {
    let [next] = fs.useWatch('next');
    let [events] = fs.useWatch('events');
    let gameover = events?.gameover;

    let local = fs.get('local');

    let other = findOtherPlayer(local.id);
    let player = other?.player;
    let id = other?.id + '';
    let isWinner = gameover?.id == id;
    let isNext = (next?.id == id || isWinner);
    let classNext = isNext ? 'next' : '';

    let score = player?.score || 0;
    if (score > 0) {
        score = '+' + score;
    }
    else {
        score = '';
    }
    if (isWinner)
        score = 'WINNER';

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


function BottomPlayer(props) {
    let local = fs.get('local');
    let [next] = fs.useWatch('next');
    let [events] = fs.useWatch('events');
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


function IsChainUpdate(props) {
    let [next] = fs.useWatch('next');

    useEffect(() => {
        let local = fs.get('local');
        if (next.id != local.id)
            return;
        fs.set('highlight', []);
        fs.set('selected', null);
    })
    return <></>
}
IsChainUpdate = IsChainUpdate;


function Gamescreen(props) {

    let ref = useRef();

    let [local] = fs.useWatch('local');

    const updatePosition = () => {
        if (!ref)
            return;

        let rect = JSON.stringify(ref.current.getBoundingClientRect());
        rect = JSON.parse(rect);
        rect.offsetWidth = ref.current.offsetWidth;
        rect.offsetHeight = ref.current.offsetHeight;

        fs.set('gamearea', rect);
    }

    const renderCheckerGrid = () => {
        let elems = [];
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                elems.push(<Cell key={x + ',' + y} x={x} y={y} />)
            }
        }
        return elems;
    }

    useEffect(() => {
        setTimeout(updatePosition, 2000);
    }, [])

    let shouldRotate = local.type == 'W';
    let classRotate = shouldRotate ? 'shouldRotate' : '';
    return (
        <div className="gamewrapper" ref={ref}>
            <IsChainUpdate />
            <div className="vstack">
                <TopPlayer />
                <div className="gamescreen" >
                    <div className={"checkers-grid " + classRotate}>
                        {renderCheckerGrid()}
                    </div>
                </div>
                <BottomPlayer />
            </div>
        </div>
    )


}

export default Gamescreen;