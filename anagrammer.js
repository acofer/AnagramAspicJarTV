// var zlib = require('zlib');
var fs = require('fs');
var readline = require('readline');

var director = require('director');


function main(callback){
	console.log('Reading word file');
	// var wordsgz = fs.createReadStream('words.txt.gz');
	// var wordstream = wordsgz.pipe(gzip);
	var wordFileStream = fs.createReadStream('small-words.txt');
	var rl = readline.createInterface({
		input: wordFileStream
	});
	var dict = {};
	var onearr = {};
	var dictlines = 0;
	rl.on('line', function(line){
		dictlines++;
		if (dictlines > 100){ return; }
		onewordkey = key(line);
		onearr = dict[onewordkey];
		if (onearr && onearr.indexOf(line) === -1){
			onearr.push(line);
		} else {
			dict[onewordkey] = [line];
		}
		return; // readline on 'line'
	});
	rl.on('close', function(){
		if (callback){ callback(dict); }
		return; // readline on 'line';
	});
	return; // main
}


function key(word){
	return word.split('').sort().join('');
}

//Dispatch router when we get a line
function _onLine(line) {
  line = line.trim();

  if(line){
  	for(var i = 0; i < commands.length; i++){
  		if (commands[i][0] === line){
		    this.router.dispatch('on', line);
  			return;
  		}
  	}
  	// console.log(allwords(this.dict, line));
  	var line_copy = line.toLowerCase().replace(/\s+/g, '');
  	words = anagram(this.dict, line_copy.split(''));
  	console.log('Words: ' + words);
  	this.rl.prompt();
  } else {
    this.rl.prompt();
  }
}

function _onNotFound() {
  console.log('Command not found!');
  this.rl.prompt();
}

//on readline close
function _onClose() {
  console.log('Good bye!');
  process.exit(0);
}

//on SIGINT (Control-C)
function _onInt() {
  _onClose();
}

//on SIGCONT (return from background)
function _onCont() {
  this.rl.prompt();
}

function allwords(dict, input){
	// Given a dictionary of sorted-letter-word keys and a word, 
	// return the dictionary entry for that word (all one-word anagrams of the word)
	return dict[key(input)];
}

function key_is_in(key, str){
	// return true if all of the letters in key are also in str
	if (key.length > str.length){
		return false;
	}
	for (var i=0; i < key.length; i++){
		if (str.indexOf(key[i]) === -1){
			return false;
		}
	}
	return true;
}

function remove_key(key, str){
	// remove each letter in key from str
	var strcpy = str.slice();
	for (var i=0; i < key.length; i++){
		var idx = strcpy.indexOf(key[i]);
		if (idx !== -1){
			strcpy.splice(idx, 1);
		}
	}
	return strcpy;
}

function anagram(dict, input){
	// Given a dictionary of sorted-letter-word keys and a phrase,
	// find some anagrams
	if (input.length <= 0){
		return null;
	}

	var validkeycombinations = [];
	var possiblekeycombination = [];
	recursecombinations(dict, input, validkeycombinations, possiblekeycombination);
	// TODO: remove duplicates in valid key combinations, iterate all phrases
	return validkeycombinations;
}

function recursecombinations(dict, input, validkeycombinations, possiblekeycombination){
	// Check all word keys in the dictionary to see if they 'fit' in input.
	// If this word key 'fits' and uses all the letters, then this word key stack is a valid
	// combination of word keys.
	// If the word key 'fits' and does not use all the letters, then add the key to 
	// the word key 'stack' and check the rest of the letters.
	// If the word key 'fits' but the rest of the letters are not usable as a word, 
	// then pop this word off the stack and keep going.
	for (var key_i in dict){
		if (dict.hasOwnProperty(key_i)){
			if (key_is_in(key_i, input)){
				var newinput_i = remove_key(key_i, input);
				// if all letters in input have been 'used'
				if (newinput_i.length <= 0){
					// add a copy of this key combination to valid combinations array
					possiblekeycombination.push(key_i);
					validkeycombinations.push(possiblekeycombination.slice());
					// clear out this 'stack' of possible combinations
					possiblekeycombination.slice(0, possiblekeycombination.length);
				} else {
					// add this word key to the possible combination 'stack'
					possiblekeycombination.push(key_i);
					// check the rest of the letters in the word key
					recursecombinations(dict, newinput_i, validkeycombinations, possiblekeycombination);
				}
				// this word key has been checked
				possiblekeycombination.pop();
			}
		}
	}
	return;
}

var commands = [
    ['/quit', '/quit'],         //quit the app
    ['/bye', '/bye'],           //quit the app
    ['/exit', '/exit'],         //quit the app
];

main(function(dict){
	console.log('Found %s unique sorts. ',Object.keys(dict).length);
	this.rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	this.router = new director.cli.Router().configure({ notfound: _onNotFound.bind(this) });
	this.slash_quit = this.slash_bye = this.slash_exit = function() {
	  this.rl.close();
	};
	this.dict = dict;
	this.slashfunc = {"slash_quit": slash_quit, "slash_exit": slash_exit, "slash_bye": slash_bye};
	for(var i = 0, len = commands.length; i < len; ++i) {
	    var cmd = commands[i];
	    this.router.on(cmd[1], this.slashfunc[cmd[0].replace('/', 'slash_')].bind(this));
	}
	this.rl.setPrompt('$> ', 3);

	this.rl.on('line', _onLine.bind(this));
	this.rl.on('close', _onClose.bind(this));
	this.rl.on('SIGINT', _onInt.bind(this));
	this.rl.on('SIGCONT', _onCont.bind(this));

	this.rl.prompt();
});
