// var zlib = require('zlib');
var fs = require('fs');
var readline = require('readline');


function main(callback){
	console.log('Reading word file');
	// var wordsgz = fs.createReadStream('words.txt.gz');
	// var wordstream = wordsgz.pipe(gzip);
	var wordFileStream = fs.createReadStream('words.txt');
	var rl = readline.createInterface({
		input: wordFileStream
	});
	var dict = {};
	var oneword = '', 
	    onewordarr = [],
	    onewordsort = [];
	    onedict = {};
	rl.on('line', function(line){
		oneword = line;
		onewordarr = oneword.split(''); // Character array
		onewordsort = onewordarr.sort(); // Letters sorted
		onewordkey = onewordsort.join(''); // 'Key' for array of words that can be made with these letters
		onedict = dict[onewordkey]; // An array of words that sort to this key
		if (onedict && onedict.indexOf(oneword) === -1){
			onedict.push(oneword);
		} else {
			dict[onewordkey] = [onewordkey];
		}
		return; // readline on 'line'
	});
	rl.on('close', function(){
		if (callback){ callback(dict); }
		return; // readline on 'line';
	});
	return; // main
}

function allwords(dict, input){
	// Given a dictionary of sorted-letter-word keys and a word, 
	// return the dictionary entry for that word (all one-word anagrams of the word)
	return dict[input];
}

main(function(dict){
	console.log('Found %s unique sorts. ',Object.keys(dict).length);
	console.log(allwords(dict, "bird"));
});