'use strict';

class Vector {
	constructor (x = 0, y = 0) {
		this.x = x;
		this.y = y;
	};

	plus(vector) {
		if (!(vector instanceof Vector)) {
			throw new Error ('Можно прибавлять к вектору только вектор типа Vector');
			}
		return new Vector(this.x + vector.x, this.y + vector.y);
	};

	times (n) {
		return new Vector(this.x * n, this.y * n);
	}
};


class Actor {
	constructor (pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
		if (!(pos instanceof Vector)) {
			throw new Error('Первый аргумент (расположение) не является объектом типа Vector');
		}
		if (!(size instanceof Vector)) {
			throw new Error('Второй аргумент (размер) не является объектом типа Vector');
		}
		if (!(speed instanceof Vector)) {
			throw new Error('Третий аргумент (скорость) не является объектом типа Vector');
		}

		this.pos = pos;
		this.size = size;
		this.speed = speed;

	}

		act () {};

		get left() {
			return this.pos.x;
		};
		get right() {
			return this.pos.x + this.size.x;
		};
		get top() {
			return this.pos.y;
		};
		get bottom() {
			return this.pos.y + this.size.y;
		};

		get type() {
			return 'actor';
		};

		isIntersect(actor) {
			if (!(actor instanceof Actor)) {
				throw new Error('Аргумент отсутствует или не является объектом типа Actor');
			}

			if (this == actor) {
				return false;
			}

			if (this.left >= actor.right || this.right <= actor.left || this.top >= actor.bottom || this.bottom <= actor.top) {
				return false;
			}
			else {
				return true;
			}
		};
};


class Level {
	constructor (grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.status = null;
		this.finishDelay = 1;

		if (actors) {
			for (let actor of actors) {
				if (actor.type === 'player') {
					this.player = actor;
				}
			}
		};

		if (this.grid.length > 0) {
			this.height = this.grid.length;
			for (let elem of this.grid) {
					if (typeof elem !== 'undefined') {
						this.width = Math.max(elem.length);
						}
					}
				}
			else {
				this.height = 0;
				this.width = 0;
		}
	};

	isFinished () {
		if (this.status != null && this.finishDelay < 0) {
			return true;
		}
		return false;
	};

	actorAt (actor) {
		if (!actor || !(actor instanceof Actor)) {
			throw new Error('Аргумент отсутствует или не является движущимся объектом');
		}

		if (this.actors.length == 1 || this.grid === 'undefined') {
			return undefined;
		}

		for (let object of this.actors) {
			if (actor.isIntersect(object)) {
				return object;
				}
			}
		return undefined;
	}

	obstacleAt (pos, size) {
		if (!(pos instanceof Vector) || !(size instanceof Vector)) {
			throw new Error('Аргумент не является объектом типа Vector');
		}

		let xLeft = Math.floor(pos.x);
		let xRight = Math.ceil(pos.x + size.x);
		let yTop = Math.floor(pos.y);
		let yBottom = Math.ceil(pos.y + size.y);

		if (xLeft < 0 || xRight > this.width || yTop < 0) {
			return 'wall';
		}

		if (yBottom > this.height) {
			return 'lava';
		}

		for (let y = yTop; y < yBottom; y++) {
			for (let x = xLeft; x < xRight; x++) {
				let stopLine = this.grid[y][x];
				if (typeof stopLine !== 'undefined') {
					return stopLine;
				}
			}
		}
		return undefined;
	 }

	removeActor(actor){
		const actorToRemove = this.actors.indexOf(actor);
		if (actorToRemove != -1) {
			this.actors.splice(actorToRemove, 1);
		}
	}

	noMoreActors(type){
		let actorOut = true;
		this.actors.forEach(function (actor){
			if (actor.type === type) {
				actorOut = false;
				}
			}
		)
		return actorOut;
	}

	playerTouched(type, actor = undefined) {
		if (this.status !== null) {
			return;
		}

		if (type === 'lava' || type === 'fireball') {
			this.status = 'lost';
		}

		if (type === 'coin' && actor.type === 'coin') {
			this.removeActor(actor);
			if(this.noMoreActors('coin')) {
				this.status = 'won';
			}
		}
	}
};


class LevelParser {
	constructor (dictionary = {}) {
		this.dictionary = dictionary;
	}

  actorFromSymbol(symbol) {
  	if (!symbol || !this.dictionary[symbol]) {
  		return undefined;
  	}
    return this.dictionary[symbol];
  }

  obstacleFromSymbol(symbol) {
    if (symbol) {
      if (symbol === 'x') {
        return 'wall';
      }
      if (symbol === '!') {
        return 'lava';
      }
      return undefined;
    }
  }

	createGrid(gridPlan) {
		var self = this;
		return gridPlan.map(function (line) {
			let newLine = [];
			for (var i = 0; i < line.length; i++) {
				newLine.push(self.obstacleFromSymbol(line[i]));
			}
			return newLine;
		});
	}

	createActors(gridPlan) {
		var self = this;
		return gridPlan.reduce(function (memo, ySymb, y) {
			ySymb.split('').forEach(function (xSymb, x) {
				let symb = self.actorFromSymbol(xSymb);
				if (typeof symb === 'function') {
					let movingActor = new symb(new Vector(x, y));
					if (!(movingActor instanceof Actor)) {
						return;
						}
					else {
						memo.push(movingActor);
					}
				}
			})
			return memo;
		}, []);
	}

	parse(gridPlan) {
		return new Level(this.createGrid(gridPlan), this.createActors(gridPlan));
	}
}; // class LevelParser ends


class Fireball extends Actor {
	constructor (pos = new Vector(0, 0), speed = new Vector(0, 0)) {
		let size = new Vector(1, 1);
		super(pos, size, speed);
	};

	get type() {
		return 'fireball';
	};

	getNextPosition(time = 1) {
		return this.pos.plus(this.speed.times(time));
	};

	handleObstacle() {
		this.speed = this.speed.times(-1);
	};

	act(time, gridNow) {
		let newPos = this.getNextPosition(time);
		if (gridNow.obstacleAt(newPos, this.size)) {
			this.handleObstacle();
		}
		else {
			this.pos = newPos;
		}
	};
}; // class Fireball ends


class HorizontalFireball extends Fireball {
	constructor (pos = new Vector(0, 0)) {
		super (pos, new Vector(2, 0));
	}
}

class VerticalFireball extends Fireball {
	constructor (pos = new Vector(0, 0)) {
		super (pos, new Vector(0, 2));
	}
};


class FireRain extends Fireball {
	constructor (pos = new Vector(0, 0)) {
		super (pos, new Vector(0, 3));
		this.startPos = pos;
	}

  handleObstacle() {
    this.pos = this.startPos;
  }
};

class Coin extends Actor {
	constructor (pos = new Vector(0, 0)) {
		super (pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.random(0, Math.PI * 2);
		this.startPos = this.pos;
	}

	get type() {
		return 'coin';
	}

	updateSpring (time = 1) {
		this.spring = this.spring + this.springSpeed *time;
	}

	getSpringVector () {
		let newPosY = Math.sin(this.spring) * this.springDist;
		return new Vector(0, newPosY);
	}

	getNextPosition (time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
	}

	act(time) {
		this.pos = this.getNextPosition(time);
	}
} // class Coin ends


class Player extends Actor {
	constructor (pos = new Vector(0, 0)) {
		super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));		// speed vector remains the same, i.e (0, 0)
	}

	get type() {
		return 'player';
	}
};

// run the game!

const schemas = [
  [
    '         ',
    '|        ',
    '    =    ',
    '       o ',
    '     !xxx',
    ' @       ',
    'xxx!     ',
    '         '
  ],
  [
    '|     v  ',
    '         ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
  ]
];

const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'o': Coin
};

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => document.writeln('<center><h1>Вы выиграли приз!</h1></center>'));

