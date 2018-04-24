#!/usr/bin/env node
const fs = require('fs');
const [,, input_file, output_file] = process.argv;

if (!input_file && !output_file) return console.log('File names required!');

fs.readFile(input_file, 'utf8', (err,data) => {
  if (err) {
    return console.log(err);
  }
  initializePatternMatch(data, (formattedData) => {
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
	data = data.split(/\n/);
	let patternArrays = [];
	let pathArrays = [];
	let finalMatches = [];
	let numberOfPatterns;

	data.forEach((line, i) => {
		if (!numberOfPatterns) {
			const num = Number(line);
			if (Number.isInteger(num) && !numberOfPatterns) {
				numberOfPatterns = num;
			}
		} else {
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

	pathArrays.forEach((path) => {
		let matches = [];
		patternArrays.forEach((pattern) => {
			if (path.length === pattern.length) {
				let matched = true;
				for (let i = 0; i < path.length; i++) {
					if ((path[i] != pattern[i]) && (pattern[i] != '*')) {
						matched = false;
						break;
					}
				}
				if (matched) matches.push(pattern);
			}
		});
		if (matches.length) {
			if (matches.length > 1) {
				let matchesIndepth = [];

				matches.forEach((match) => {
					const wildcards = match.filter(value => value === '*').length;
					const firstWildcard = match.findIndex(value => value === '*');
					matchesIndepth.push({'match': match, 'wildcards': wildcards, 'firstWildcard': firstWildcard})
				});

				const minWildcards = matchesIndepth.reduce((min, match) => match.wildcards < min ? match.wildcards : min, matchesIndepth[0].wildcards);
				matchesIndepth = matchesIndepth.filter(value => value.wildcards === minWildcards);

				if (matchesIndepth.length > 1) {
					const firstWildcard = matchesIndepth.reduce((max, match) => match.firstWildcard > max ? match.firstWildcard : max, matchesIndepth[0].firstWildcard);
					matchesIndepth = matchesIndepth.filter(value => value.firstWildcard === firstWildcard);
				}
				finalMatches.push(matchesIndepth[0].match.join())

			} else {
				finalMatches.push(matches.join())
			}
		} else {
			finalMatches.push('NO MATCH')
		}
	});

	if (finalMatches && Array.isArray(finalMatches)) finalMatches = finalMatches.join('\n') + '\n';
	return cb(finalMatches);
}
