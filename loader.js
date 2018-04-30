'use strict';

const chalk = require('chalk'),
os = require('os'),
readline = require('readline'),
intercept = require('stream-intercept'),
events = require('events');

class Loader extends events.EventEmitter {
	
	constructor(obj = {}) {
		super();
		
		obj = obj || {};
		obj.width = obj.width || process.stdout.isTTY ? process.stdout.columns / 2 : Infinity;
		obj.position = obj.position !== undefined ? obj.position : 'center';
		obj.ty = obj.tty || process.stdout;
		obj.fill = obj.fill !== undefined ? obj.fill : ['-', '|', 'White'];
		this.showPerc = typeof obj.showPerc == 'boolean' ? obj.showPerc : obj.showPerc = true;
		
		if (obj.ty.isTTY) {
			this.tty = obj.ty;
		} else {
			let err = new TypeError(`Not a TTY.\n${obj.ty}`);
			err.code = 'ENOTTY';
			throw err;
		}
		
		try {
			intercept.write(this.tty);
		} catch(std) { }
		
		
		var func;
		
		this.tty.on('resize', func = () => {
			if (typeof obj.width != 'number') {
				let err = TypeError(`Width accepts only Numbers!\nPassed : ${typeof obj.width}!`);
				err.code = 'ENOTNUM';
				throw err;
			}
			this.width = obj.width > this.tty.columns ? this.tty.columns : obj.width;
			if (this.width <= 0 || this.width > this.tty.columns) {
				let err = new RangeError(`Invalid Width ${this.width}.\Must be within range '0-${this.tty.columns}'`);
				err.code = 'EOUTB';
				throw err;
			}
			switch (obj.position) {
				case 'left':
					this.position = 0;
					break;
				case 'right':
					this.position = this.tty.columns - this.width - (this.showPerc ? 7 : 2);
					break;
				case 'center':
					this.position = Math.floor((this.tty.columns - 2) / 2 - (this.width + (this.showPerc ? 6 : 2)) / 2);
					break;
				default:
					if (typeof obj.position != 'number') {
						let err = TypeError(`Invalid Position value.\nMust be either 'left', 'center', 'right' or a number.\nPassed : ${obj.position}`);
						err.code = 'EINVAL';
						throw err;
					}
					this.position = obj.position * 1;
			}
			if (this.position < 0 || this.position > this.tty.columns - this.width) {
				let err = new RangeError(`Invalid Position ${this.position}.\nMust be within range 0-${this.tty.columns - this.width}`);
				err.code = 'EOUTB';
				throw err;
			}
		});
		
		this.tty.on('data', data => {
			if (typeof this._line != 'symbol') {
				this.line = this._line - this.tty._data.split(os.EOL).length + this._minus;
			}
		});
		
		this.fake = obj.fake && typeof obj.fake == 'number' ? obj.fake : 100;
		if (this.fake <= 0) {
			let err = RangeError(`Fake must be positive!\nPassed : ${this.fake}`);
			err.code = 'EOUTB';
			throw err;
		}
		
		this.fill = new Array(Loader.fills.length);
		if (obj.fill instanceof Array) {
			for (let i in Loader.fills) {
				this.fill[i] = typeof obj.fill[i] == 'string' ? obj.fill[i] : Loader.fills[i];
			}
		} else {
			this.fill = Array.from(Loader.fills);
		}
		
		this.on('completed', date => this._ended = date);
		
		this.completed = typeof obj.completed == 'number' ? obj.completed : 0;
		this._line = this.line = obj.line || Loader.AUTO;
		this._mode = obj.mode !== undefined ? obj.mode : Loader.AUTO;
		this._minus = 1;
		this._started = new Date;
		func();
	} //ctor
	
	draw() {
		var line = this.line;
		readline.moveCursor(this.tty, 0, typeof line == 'number' ? line : - 1);
		readline.clearLine(this.tty, 0);
		this._minus++;
		let txt = '',
		perc = Math.round(this.completed * this.width / this.fake);
		txt += ' '.repeat(this.position) + this.fill[1].split('').shift();
		txt += chalk`{bg${this.fill[2]} ${this.fill[0].repeat(perc)}}`;
		txt += this.fill[0].repeat(this.width - perc);
		this.tty.write(chalk.bold[this.fill[3]](txt + this.fill[1].split('').pop() + (this.showPerc ? chalk` {bold ${Math.round(100 * this.completed / this.fake)}%}` : '')) + os.EOL);
		if (typeof line != 'symbol') {
			readline.moveCursor(this.tty, 0, - line);
		}
		return perc;
	} //draw
	
	update(num = 0) {
		if (typeof num != 'number') {
			let err = TypeError(`Update accepts only Numbers!\nPassed : ${typeof num}`);
			err.code = 'ENOTNUM';
			throw err;
		} else if (num < 0 || num > this.fake) {
			let err = RangeError(`Number out of boundaries 0-${this.fake}.\nPassed : ${num}`);
			err.code = 'EOUTB';
			throw err;
		}
		this.completed = num * 1;
		if (this.mode == Loader.AUTO) this.draw();
		if (this.completed >= this.fake) {
			this.emit('completed', this._ended = new Date);
		}
		return this.completed;
	} //update
	
	updateBy(num = 1) {
		if (typeof num != 'number') {
			let err = TypeError(`UpdateBy accepts only Numbers!\nPassed : ${typeof num}`);
			err.code = 'ENOTNUM';
			throw err;
		}
		return this.update(this.completed + num * 1 <= this.fake ? this.completed + num * 1 : (this.completed + num * 1 < 0 ? 0 : this.fake));
	} //updateBy
	
	points(num = 100) {
		if (typeof num != 'number') {
			let err = TypeError(`Points accepts only Numbers!\nPassed : ${typeof num}`);
			err.code = 'ENOTNUM';
			throw err;
		} else if (num <= 0) {
			let err = RangeError(`Number must be positive!\nPassed : ${num}`);
			err.code = 'EOUTB';
			throw err;
		}
		if (this._mode == Loader.AUTO) this.draw();
		return this.fake = num;
	} //points
	
	pointsBy(num = 1) {
		if (typeof num != 'number') {
			let err = TypeError(`PointsBy accepts only Numbers!\nPassed : ${typeof num}`);
			err.code = 'ENOTNUM';
			throw err;
		}
		return this.points(this.fake + num * 1);
	} //pointsBy
	
	place(num = this._line) {
		if (typeof num != 'number') {
			let err = TypeError(`Place accepts only Numbers!\nPassed : ${typeof num}`);
			err.code = 'ENOTNUM';
			throw err;
		} else if (num < 0 || num > this.tty._data.split(os.EOL).length - this._minus) {
			let err = RangeError(`Number out of boundaries 0-${this.tty._data.split(os.EOL).length - this._minus}.\nPassed : ${num}`);
			err.code = 'EOUTB';
			throw err;
		}
		this._line = num * 1;
		this.tty.write(os.EOL);
		if (this._mode == Loader.AUTO) this.draw();
		return this._line;
	} //place
	
	placeBy(num = 1) {
		if (typeof num != 'number') {
			let err = TypeError(`PlaceBy accepts only Numbers!\nPassed : ${typeof num}`);
			err.code = 'ENOTNUM';
			throw err;
		}
		return this.place(this._line + num * 1);
	} //placeBy
	
} //Loader

Loader.AUTO = Symbol('AUTO');
Loader.fills = ['-', '[]', 'White', 'whiteBright'];

module.exports = Loader;
