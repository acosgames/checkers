
import React, { Component } from 'react';
import fs from 'flatstore';

import AlertPanel from './alertpanel';
import Cell from './Cell';
import PlayerList from './playerlist';


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
                elems.push(<Cell x={x} y={y} />)
            }
        }
        return elems;
    }

    render() {
        return (
            <div className="gamewrapper" ref={el => {
                if (!el) return;
                this.ref = el;
                setTimeout(this.updatePosition.bind(this), 2000);
            }}>
                <div className="vstack">
                    <div className="vstack-noh" >
                        <div className="vstack">
                            <PlayerList />
                        </div>
                        <AlertPanel />
                    </div>
                    <div className="gamescreen" >
                        <div className="checkers-grid">
                            {this.renderCheckerGrid()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default Gamescreen;