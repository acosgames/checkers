
import React, { Component } from 'react';
import fs from 'flatstore';
import { send } from '../fsg';

function Skip(props) {

    let [timeleft] = fs.useWatch('timeleft');
    let [next] = fs.useWatch('next');
    let id = next?.id;

    const skipPlayer = () => {
        send('skip', { id })
    }

    if (!id || id != this.props.id) {
        return (<React.Fragment></React.Fragment>);
    }

    if (timeleft <= 0) {
        return (
            <button onClick={skipPlayer}>Kick</button>
        )
    }

    return (<React.Fragment></React.Fragment>);
}

export default Skip;