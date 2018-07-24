'use strict';

class Vector {
	constructor (x = 0, y = 0) {
		this.x = x;
		this.y = y;
	};

	plus(vector) {
		if (!(vector instanceof Vector)) {
			// форматирование
			throw new Error ('Можно прибавлять к вектору только вектор типа Vector');
			}
		return new Vector(this.x + vector.x, this.y + vector.y);
	};

	times (n) {
		return new Vector(this.x * n, this.y * n);
	}
}


class Actor {
	constructor (pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
		if (!(pos instanceof Vector)) {

			// лучше писать название аргумента
			// АК: исправил
			throw new Error('Аргумент pos не является объектом типа Vector');
		}
		if (!(size instanceof Vector)) {
			throw new Error('Аргумент size не является объектом типа Vector');
		}
		if (!(speed instanceof Vector)) {
			throw new Error('Аргумент speed не является объектом типа Vector');
		}

		this.pos = pos;
		this.size = size;
		this.speed = speed;

	}

	act () {};

	get left() {
		return this.pos.x;
	}; // точки с запятой в конце методов класса не нужны
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

		// лучше писать название аргумента
		// АК: исправил
	isIntersect(actor) {
		if (!(actor instanceof Actor)) {
			throw new Error('Аргумент actor отсутствует или не является объектом типа Actor');
		}

		// не используйте == для сравеннеия, это может привести к ошибке при преобраозвании типов
		// (используйте ===)
		// АК: Исправил

		if (this === actor) {
			return false;
		}

		// условие можно обратить и написать просто return <условие> 
		// чтобы обратить условине нужно заменить || на &&
		// и все операторы на противоположные
		// >= на <, <= на >
		// АК: Логично - так короче, спасибо :-)
		// внешние скобки можно опустить
		return (this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top);
	}
}


class Level {
	constructor (grid = [], actors = []) {
		// здесь можно создать копии массивов,
		// чтобы поля обхекта было сложнее изменить извне
		// АК: использовал метод slice()
		this.grid = grid.slice();
		this.actors = actors.slice();
		this.status = null;
		this.finishDelay = 1;
		// у аргмента есть значение по умолчанию, проверку можно опустить
		// для поиска объектов в массиве есть сппециальный метод
		// АК: применил метод find()
		// тут лучше использовать стрелочную функцию
		this.player = this.actors.find(function (elem) {
			return elem.type === 'player';
		});

		this.height = grid.length;
		// лишняя проверка & некорректное вычисление длины строки
		// АК: решено по-новому
		// название yLength не очень подходит содержанию
		// ведь в переменной массив
		// стрелочная фукнция здесь лучше подходит
		const yLength = grid.map(function (elem) {
			return elem.length;
		});
		// вот это правильно
		this.width = Math.max(0, ...yLength);
	};

	isFinished () {
		// здесь можно написать просто return <выражение в if>
		// АК: исправил
		// внешние скобки можно опустить
		return (this.status != null && this.finishDelay < 0);
	};

	actorAt (actor) {
		if (!actor || !(actor instanceof Actor)) {
			throw new Error('Аргумент actor отсутствует или не является движущимся объектом');
		}

		// лишняя проверка
		// АК: убрал проверку вообще

		// для поиска объектов в массиве есть специальный метод
		// АК: использовал метод find()
		// стрелочная функция
		return this.actors.find(function (elem) {
			return elem.isIntersect(actor);
		});
	}

	obstacleAt (pos, size) {
		if (!(pos instanceof Vector) || !(size instanceof Vector)) {
			throw new Error('Аргумент не является объектом типа Vector');
		}
		// значение присваивается переменной 1 раз - лучше использовать const
		// АК: поменял let на const
		const xLeft = Math.floor(pos.x);
		const xRight = Math.ceil(pos.x + size.x);
		const yTop = Math.floor(pos.y);
		const yBottom = Math.ceil(pos.y + size.y);

		if (xLeft < 0 || xRight > this.width || yTop < 0) {
			return 'wall';
		}

		if (yBottom > this.height) {
			return 'lava';
		}

		for (let y = yTop; y < yBottom; y++) {
		 	for (let x = xLeft; x < xRight; x++) {
		 		// const
		 		// АК: сделал
				const stopLine = this.grid[y][x];
				// можно написать просто if (stopLine)
				// АК: заменил
				if (stopLine) {
					return stopLine;
				}
			}
		}
		// лишняя строчка
		// АК: убрал строку return undefined
	}

	removeActor(actor){
		const actorToRemove = this.actors.indexOf(actor);
		// !==
		// АК: сделал
		if (actorToRemove !== -1) {
			this.actors.splice(actorToRemove, 1);
		}
	}

	noMoreActors(type){
		// тут лучше использовать метод some
		// АК: использовал
		// стрелочная функция
		return !this.actors.some(function (elem) {
			return elem.type === type;
		})
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
}


class LevelParser {
	constructor (dictionary = {}) {
		// можно создать копию объекта
		// АК: создал
		this.dictionary = Object.assign({}, dictionary);
	}

	actorFromSymbol(symbol) {
		// лишняя проверка
		// АК: убрал проверку
		return this.dictionary[symbol];
	}

	obstacleFromSymbol(symbol) {
		// лишняя проверка
		// АК: убрал проверку и лишнюю строку в конце метода
		if (symbol === 'x') {
			return 'wall';
		}
		if (symbol === '!') {
			return 'lava';
		}
	}

	createGrid(gridPlan) {
		// лучше использовать стрелочные функции
		// вместо var лушче использвать let и const
		// АК: сделал через стрелочные функции

		return gridPlan.reduce((memo, elem) => {
			const line = elem.split('')
				.map(elem => this.obstacleFromSymbol(elem));
				// форматирование
			memo.push(line);
			return memo;
		}, []);
	}

	createActors(gridPlan) {
		// стрелочные функции
		// АК: сделал через стрелочные функции

		return gridPlan.reduce((memo, ySymb, y) => {
			ySymb.split('').forEach((xSymb, x) => {
				// значение присваивается переменой 1 раз - используйте const
				let symb = this.actorFromSymbol(xSymb);
				if (typeof symb === 'function') {
					// const
					let movingActor = new symb(new Vector(x, y));
					if (movingActor instanceof Actor) {
						memo.push(movingActor);
						return memo;
					}
				}
			});
			return memo;
		}, []);
	}

	parse(gridPlan) {
		return new Level(this.createGrid(gridPlan), this.createActors(gridPlan));
	}
	// точка с запятой лишняя
	// АК: убрал
}


class Fireball extends Actor {
	constructor (pos = new Vector(0, 0), speed = new Vector(0, 0)) {
		// const
		// АК: поменял
		const size = new Vector(1, 1);
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
		} else {
			this.pos = newPos;
		}
	}
}


class HorizontalFireball extends Fireball {
	constructor (pos = new Vector(0, 0)) {
		super (pos, new Vector(2, 0));
	}
}


class VerticalFireball extends Fireball {
	constructor (pos = new Vector(0, 0)) {
		super (pos, new Vector(0, 2));
	}
}


class FireRain extends Fireball {
	constructor (pos = new Vector(0, 0)) {
		super (pos, new Vector(0, 3));
		this.startPos = pos;
	}

	handleObstacle() {
		this.pos = this.startPos;
	}
}


class Coin extends Actor {
	constructor (pos = new Vector(0, 0)) {
		super (pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
		this.springSpeed = 8;
		this.springDist = 0.07;
		// random принимает 1 аргумент
		// АК: изменил
		this.spring = Math.random() * 2 * Math.PI;
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
}


class Player extends Actor {
	constructor (pos = new Vector(0, 0)) {
		// здесь лучше задать все аргументы, потому что неизвестно какое
		// значение по-умолчнию может оказаться у speed в классе Actor
		super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));		// speed vector remains the same, i.e (0, 0)
	}

	get type() {
		return 'player';
	}
}

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
		'    o   x',
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