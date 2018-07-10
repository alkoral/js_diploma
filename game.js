'use strict';

class Vector {
	constructor (x = 0, y = 0) {
		this.x = x;
		this.y = y
	}

	plus (vector) {
		if (!(vector instanceof Vector)) {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
			}
		return new Vector(this.x + vector.x, this.y + vector.y);
	}

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
		this.act = function () {};
	}

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

};
