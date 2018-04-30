# Loader  
A loading bar utility tool for the node terminal.  
  
## Setup  
```javascript
const Loader = require('tty-loader'),
loader = new Loader({options});
```  
The default `options` object is :  
```javascript
{
	fill: ['-', '[]', 'White', 'whiteBright'], //component styling
	mode: Symbol(AUTO), //disable auto-draw
	tty: process.stdout, //tty.WriteStream to bind to
	showPerc: true, //show percentance of the loading bar on right
	position: 'center', //position of loading bar
	width: process.stdout.columns / 2, //width of loading bar
	line: Symbol(AUTO), //line to bind
	completed: 0, //points pre-completed
	fake: 100 //pseudopoints-to-complete
}
```  
**Usage** :  
```javascript
loader.place(2); //place on second line of stream, given that it exists or an error will be thrown. This will lock the loader on that specific line rather than being appended to the output.
loader.update(50); //set the fill status to 50, given that loader's `fake` is 100, this will occupy half of loader's `width`
loader.updateBy(1); //this will set loader's `completed` to 51
loader.placeBy(1); //this will move loader's bound line by 1 down
loader.points(100); //this will set `fake` to 100
loader.pointsBy(1); //this will set `fake` to 101
loader.draw(); //this will render the loading bar to the console. This is automatically done if `_mode` is set to `Symbol(AUTO)` (default)
```  
> When the loading is completed the loader will emit a `completed` event on itself carrying the completition date and set its `_ended` property to that date.  
*Other properties:*  
* *_line* -> Bound line  
* *line* -> Line difference from bound line to current stream line  
* *_started* -> Loader's creation date  
* *tty* -> Bound TTY  
* *tty._data* -> Bound TTY's written data  
* *width* -> Loader's width in (characters)  
* *position* -> Loader's position (in characters)  
* *completed* -> Points completed out of `fake`  
* *_minus* -> Lines rendered useless by readline's erasing mechanism  
* *fill* -> Array containing all components if the loading bar  
* *_mode* -> Whether loader will be automatically rendered. Edit to disable  
  
***  
  
### Dependencies  
* Chalk  
* Stream-Intercept  
  
> [------------------------] 55%
