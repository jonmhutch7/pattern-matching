#!/usr/bin/env node
const fs = require('fs');
const [,, input_file, output_file] = process.argv;

if (!input_file && !output_file) return console.log('File names required!');

// read input file
fs.readFile(input_file, 'utf8', (err,data) => {
  if (err) {
    return console.log(err);
  }
  //pass data to matching function
  initializePatternMatch(data, (formattedData) => {
  	// once data is formatted, spit it out into a new file
  	fs.writeFile(output_file, formattedData, (err) => {
  	    if (err) {
  	    	console.log(err);
  	    } else {
  	    	console.log("Successfully Written to File.");
  	    }
  	});
  });
});

const initializePatternMatch = (data, cb) => {
	//split data into array for readabiity
	data = data.split(/\n/);

	let patternArrays = [];
	let pathArrays = [];
	let finalMatches = [];
	let numberOfPatterns;

	//iterate through array to seperate patterns from paths
	data.forEach((line, i) => {
		//check tol see if first integer, the number of avaible patters, is recorded
		if (!numberOfPatterns) {
			// turn the value into a number, check if it is actually a number and record number of patterns
			const num = Number(line);
			if (Number.isInteger(num) && !numberOfPatterns) {
				numberOfPatterns = num;
			}
		} else {
			// use numberofpatters to split the patterns from paths into their own arrays for comparison
			if (i <= (numberOfPatterns + 1)) {
				line = line.split(/,/);
				patternArrays.push(line);
			} else {
				line = line.split(/\//);
				line = line.filter(line => line === 0 || line); 
				pathArrays.push(line);
			} 
		}
	});

	// Match patterns to paths
	pathArrays.forEach((path) => {
		let matches = [];
		//find pattern matches by length and then by each value
		patternArrays.forEach((pattern) => {
			if (path.length === pattern.length) {
				let matched = true;
				for (let i = 0; i < path.length; i++) {
					// check if the path value is not equal to the pattern value or that the pattern also isnt a wildcard
					if ((path[i] != pattern[i]) && (pattern[i] != '*')) {
						matched = false;
						// break the for loop if the path value doesnt match the pattern value, no need to go through the rest.
						break;
					}
				}
				if (matched) matches.push(pattern);
			}
		});
		// if no matches, record as NO MATCH
		if (matches.length) {
			// if more than one match, move on, if not, record the match as a string with join()
			if (matches.length > 1) {
				let matchesIndepth = [];
				// iterate through matches to find the number of wildcards and the position of the first wildcard. 
				matches.forEach((match) => {
					const wildcards = match.filter(value => value === '*').length;
					const firstWildcard = match.findIndex(value => value === '*');
					// throw them into an object with in depth data
					matchesIndepth.push({'match': match, 'wildcards': wildcards, 'firstWildcard': firstWildcard})
				});
				// first, find the match with the least amt of wildcards
				const minWildcards = matchesIndepth.reduce((min, match) => match.wildcards < min ? match.wildcards : min, matchesIndepth[0].wildcards);
				// filter the array to remove matches that don't have the least amout of wildcards
				matchesIndepth = matchesIndepth.filter(value => value.wildcards === minWildcards);

				// If there is still more than one match...
				if (matchesIndepth.length > 1) {
					// Find the match with the wildcard in latest position in the pattern
					const firstWildcard = matchesIndepth.reduce((max, match) => match.firstWildcard > max ? match.firstWildcard : max, matchesIndepth[0].firstWildcard);
					// filter the array to remove matches that are earlier in the pattern than the match with the latest wildcard
					matchesIndepth = matchesIndepth.filter(value => value.firstWildcard === firstWildcard);
				}
				// Always pull the first match no matter what
				finalMatches.push(matchesIndepth[0].match.join())

			} else {
				finalMatches.push(matches.join())
			}
		} else {
			finalMatches.push('NO MATCH')
		}
	});

	//verify that there are finalMatches, that its an arrary so we can join the arrray, add a new line and send it to be printed
	if (finalMatches && Array.isArray(finalMatches)) finalMatches = finalMatches.join('\n') + '\n';
	return cb(finalMatches);
}
