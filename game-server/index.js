import cup from './acosg';
import checkers from './game';


cup.on('gamestart', (action) => checkers.onNewGame(action));
cup.on('skip', (action) => checkers.onSkip(action));
cup.on('join', (action) => checkers.onJoin(action));
cup.on('leave', (action) => checkers.onLeave(action));
cup.on('move', (action) => checkers.onMove(action));

cup.submit();