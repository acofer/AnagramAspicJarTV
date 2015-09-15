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

function anagram(dict, input){
	// Given a dictionary of sorted-letter-word keys and a phrase,
	// find some anagrams
	if (input.length <= 0){
		return null;
	}

	var kcopy = [];
	var idx = -1;
	var kcha = '';
	var searchedkeys = [];
	var keycombinations = []; // array of word keys that are valid combinations

	// loop over words
	// find a word
	//   are there any letters left?
	//     yes
	//       take those letters out
	//       
	//       loop over words...
	//     no
	//       add this combination of words to? return null
	//  find no words
	//    return null
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
		var strcpy = str.slice();
		for (var i=0; i < key.length; i++){
			var idx = strcpy.indexOf(key[i]);
			if (idx !== -1){
				strcpy.splice(idx, 1);
			}
		}
		return strcpy;
	}
	// let's try horribly nested iterative to sort out the algorithm logic...
	// possible key combinations
	// valid key combinations
	var validkeycombinations = [];
	for (var key_i in dict){
		var possiblekeycombination = [];
		if (key_is_in(key_i, input)){
			var newinput_i = remove_key(key_i, input);
			if (newinput_i.length <= 0){
				validkeycombinations.push([key_i]);
			} else {
				possiblekeycombination.push(key_i);
				// look for another key in the input
				for (var key_j in dict){
					if (key_is_in(key_j, newinput_i)){
						var newinput_j = remove_key(key_j, newinput_i);
						if (newinput_j.length <= 0){
							possiblekeycombination.push(key_j);
							validkeycombinations.push(possiblekeycombination);
						} else {

						}
					}
				}
			}
		}
	}

	var i = 0;
	// for (var key in dict){
	//	if (key.length <= input.length){
	// 		// make a shallow copy of the input string
	// 		var icopy = input.slice();
	// 		// are all letters of key in input?
	// 		// make an array to hold all of the letters
	// 		kcopy = [];
	// 		for(var k = 0; k < key.length; k++){
	// 			kcha = key[k];
	// 			idx = icopy.indexOf(kcha);
	// 			if (idx !== -1){
	// 				kcopy.push(kcha);
	// 				if (!icopy || !icopy.splice){
	// 					debugger;
	// 				}
	// 				icopy.splice(idx,1);
	// 			}
	// 		}
	// 		// TODO: build phrases
	// 		// Favor longest word keys?

	// 		// if all letters of key are in icopy, 
	// 		if (kcopy.length === key.length){
	// 			// for this key, see if we can anagram with the letters remaining
	// 			searchedkeys.push(key);
	// 			if(icopy.length > 0){
	// 				console.log('Word: ' + dict[key] + ' with remaining: ' + icopy);
	// 				var searchedkeyplus = anagram(dict, icopy);
	// 			} else {
	// 				// icopy is down to 0 characters
	// 				// searchedkeys is a valid combination of keys we can iterate through for anagram phrases
	// 				// what do we do with it?
	// 				return searchedkeys;
	// 			}
	// 		}
	// 		// if not, move to the next key
	// 	}
	// }
	// return words;
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
