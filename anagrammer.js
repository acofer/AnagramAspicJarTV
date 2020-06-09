/* jshint node:true, esversion: 6 */
(function(){
	'use strict';

	// var zlib = require('zlib');
	var fs = require('fs');
	var readline = require('readline');

	var director = require('director');

	String.prototype.splice = function(index, count){
		return this.slice(0, index) + this.slice(index + count);
	};

  // globals ugh
	var router;
	var rl;
	var gdict;
	var closeFunc = function(){
		rl.close();
	};
	var commands = {
		'/quit': closeFunc,
		'/exit': closeFunc,
		'/bye': closeFunc,
	};

	readWordsFile(dict => {
		console.log('Found %s unique keys.',Object.keys(dict).length);
		// now that we've read in the words file, create the REPL
		gdict = dict;
		anagram(gdict, 'art chung');
		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		router = new director.cli.Router().configure({ notfound: _onNotFound });
		for (var i in commands){
		  router.on(i, commands[i]);
		}

		rl.setPrompt('$> ', 3);

		rl.on('line', _onLine); // read a line and anagram it
		rl.on('close', _onClose);
		rl.on('SIGINT', _onInt);
		rl.on('SIGCONT', _onCont);

		rl.prompt();
	});


	function readWordsFile(callback){
		// callback will have as a parameter the dict that we build
		console.log('Reading word file');
		// var wordsgz = fs.createReadStream('words.txt.gz');
		// var wordstream = wordsgz.pipe(gzip);
		var wordFileStream = fs.createReadStream('small-words.txt');
		var rl = readline.createInterface({
			input: wordFileStream
		});
		var dict = {};
		var onearr = [];
		var dictlines = 0;
		var onewordkey;
		rl.on('line', function(line){
			dictlines++;
			if (dictlines > 100){ return; } // limit dictionary to 100 items for debugging
			// for each word, make a key of it
			// which is the sorted letters
			onewordkey = key(line);
			// see if this key is already in dict
			if (onewordkey in dict && dict[onewordkey].indexOf(line) !== -1){
				// if so, add this word to the dict of words for this key
				dict[onewordkey].push(line);
			} else {
				// if not, then add this key and an array containing this word
				dict[onewordkey] = [line];
			}
			return; // readline on 'line'
		});
		rl.on('close', function(){
			if (callback){ return callback(dict); }
			return;
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
			    router.dispatch('on', line);
	  			return;
	  		}
	  	}
	  	// console.log(allwords(this.dict, line));
	  	var line_copy = line.toLowerCase().replace(/\s+/g, '');
	  	var words = anagram(gdict, line_copy.split(''));
	  	console.log('Words: ' + words);
	  	rl.prompt();
	  } else {
	    rl.prompt();
	  }
	}

	function _onNotFound() {
	  console.log('Command not found!');
	  rl.prompt();
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
	  rl.prompt();
	}

	function allwords(dict, input){
		// Given a dictionary of sorted-letter-word keys and a word, 
		// return the dictionary entry for that word (all one-word anagrams of the word)
		return dict[key(input)];
	}

	function keyIsIn(key, str){
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

	function removeKey(key, str){
		// remove each letter in key from str
		var strcopy = str.slice();
		for (var i=0; i < key.length; i++){
			var idx = strcopy.indexOf(key[i]);
			if (idx !== -1){
				strcopy = strcopy.splice(idx, 1);
			}
		}
		return strcopy;
	}

	function anagram(dict, input){
		// Given a dictionary of sorted-letter-word keys and a phrase,
		// find some anagrams
		if (input.length <= 0){
			return null;
		}

		var validkeycombinations = [];
		var possiblekeycombination = [];
		recurseCombinations(dict, input, validkeycombinations, possiblekeycombination);
		// TODO: remove duplicates in valid key combinations, iterate all phrases, case insensitive
		return validkeycombinations;
	}

	function recurseCombinations(dict, input, validkeycombinations, possiblekeycombination){
		// Check all word keys in the dictionary to see if they 'fit' in input.
		// If this word key 'fits' and uses all the letters, then this word key stack is a valid
		// combination of word keys.
		// If the word key 'fits' and does not use all the letters, then add the key to 
		// the word key 'stack' and check the rest of the letters.
		// If the word key 'fits' but the rest of the letters are not usable as a word, 
		// then pop this word off the stack and keep going.
		for (var key_i in dict){
			if (keyIsIn(key_i, input)){
				console.log(input);
				var newinput_i = removeKey(key_i, input);
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
					recurseCombinations(dict, newinput_i, validkeycombinations, possiblekeycombination);
				}
				// this word key has been checked
				possiblekeycombination.pop();
			}
		}
		return;
	}
})();
