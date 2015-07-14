var host = "lab-lamp.scm.cityu.edu.hk",
  port = 8094, CLKTEST = 0, wordnet,
	wordLists = [], colorVals = [],
  dbug = 0, timeStamp = 0, bgTimeStamp = 0,
  mode = CLKTEST, stepMs = 1000, bgColor = 0,
  fontColor = 255.0, bgCycleUp = true, font;

var rts, canvasWidth = 1100, canvasHeight = 800, fontSize = 48;

var words = ['A', 'raw', 'memory', '.', 'Church', '.', 'A', 'loud', 'room', 'with', 'children', 'playing', ',', 'thoughtlessly', '.', 'Wandering', 'wildly', '.', 'I', 'stand', 'small', 'and', 'young', 'within', 'a', 'chaotic', 'garden', 'of', 'little', 'ideas', 'and', 'unaware', ',', 'tiny', 'minds', '.', 'Colorful', 'toys', 'litter', 'the', 'ground', 'and', 'posters', 'of', 'silent', 'saints', 'loom', '.', 'My', 'mother', 'rises', 'tall', 'and', 'aware', '.', 'She', 'departs', 'gracefully', '.', 'I', 'pull', 'a', 'blue', ',', 'plastic', 'bucket', 'to', 'the', 'door', 'and', 'climb', 'it', '.', 'Staring', 'through', 'the', 'window', '.', 'Bells', 'ringing', '.', 'My', 'mom', 'is', 'walking', 'down', 'a', 'long', 'hall', ',', 'bright', 'with', 'holy', 'light', '.', 'I', 'am', 'trembling', ',', 'abiding', 'while', 'the', 'adults', 'pray', '.', 'I', 'play', ',', 'barely', ',', 'with', 'a', 'little', 'red', 'ambulance', ',', 'watching', 'the', 'empty', 'corridor', '.'];
var allpos = ['-', 'a', 'nn', '-', 'nn', '-', '-', 'a', 'nn', '-', 'nns', 'vbg', '-', 'r', '-', 'vbg', 'r', '-', '-', 'vb', 'a', '-', 'a', '-', '-', 'a', 'nn', '-', 'a', 'nns', '-', 'a', '-', 'a', 'nns', '-', 'a', 'nns', 'vb', '-', 'nn', '-', 'nns', '-', 'a', 'nns', 'vb', '-', '-', 'nn', 'vbz', 'a', '-', 'a', '-', '-', 'vbz', 'r', '-', '-', 'vb', '-', 'a', '-', 'a', 'nn', '-', '-', 'nn', '-', 'vb', '-', '-', 'vbg', '-', '-', 'nn', '-', 'nns', 'vbg', '-', '-', 'nn', '-', 'vbg', '-', '-', 'a', 'nn', '-', 'a', '-', 'a', 'nn', '-', '-', 'vb', 'vbg', '-', 'vbg', '-', '-', 'nns', 'vb', '-', '-', 'vb', '-', 'r', '-', '-', '-', 'a', 'a', 'nn', '-', 'vbg', '-', 'a', 'nn', '-'];
var commons = ['.', ',', 'one', 'I', 'play', 'pull', 'all', 'a', 'an', 'and', 'is', 'it', 'about', 'above', 'across', 'after', 'against', 'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'but', 'by', 'each', 'down', 'during', 'except', 'for', 'from', 'in', 'inside', 'into', 'there', 'like', 'my', 'near', 'of', 'off', 'on', 'out', 'outside', 'over', 'since', 'the', 'through', 'throughout', 'till', 'to', 'toward', 'under', 'until', 'wait', 'stand', 'plus', 'up', 'upon', 'with', 'without', 'according', 'because', 'way', 'addition', 'front', 'regard', 'instead', 'account'];
var ignores = 'womb-to-tomb|hearable|lav|bimester|quadripara|quintipara|lebensraum|ells|chutzpanik|free-lances|puerpera|inspissate|pyrolatries|inexperient|primipara|nonesuches|jimhickeys|brainpowers|cacodaemons|fakirs|kalifahs|nonsuches|macadamizing';

function preload() {

  font = loadFont('LondonBetween.ttf');
}

function setup() {

  createCanvas(canvasWidth, canvasHeight).parent("p5jsContainer");

  textFont(font, 48);

  wordnet = new RiWordNet(host, port);
  for (var i = 0; i < words.length; i++) {

    wordLists[i] = [words[i]];
    colorVals[i] = 255.0;
  }

  reformat();
}

function draw() {

  if (CLKTEST && mode == 0) return;

  if (millis() - bgTimeStamp > 100) {

    bgColor += bgCycleUp ? .42 : -.42;
    bgCycleUp = (bgColor > 254) ? false : (bgColor < 1) ? true : bgCycleUp;
    fontColor = fontColor - 1.0;
    bgTimeStamp = millis();
  }

  tryReplacement();
  background(bgColor);
  drawText();
}

function drawText() {

	noStroke();

	for (var i = 0; i < rts.length; i++) {
		fill(colorVals[i]);
		text(rts[i].text(), rts[i].get('x'), rts[i].get('y'));
	}
}

function reformat() {

  rts = {};

  var theText = RiTa.untokenize(words);

  rts = RiString.createWords({
	  font: font, fontSize: fontSize, text: theText,
	  x: 30, y: 60, w: canvasWidth - 50, h: canvasHeight - 100,
  });

  timeStamp = millis();
}

function mouseReleased() {

  if (CLKTEST) {

    mode = CLKTEST;
    timeStamp = -stepMs;
  }
}

function isCommon(word) {

    var test = word.replace(/\.$/, '');
    for (var i = 0; i < commons.length; i++) {
      if (commons[i] === test)
        return true;
    }
    return false;
}

function tryReplacement() {

	if (millis() - timeStamp > stepMs) {// only change if stepMs has elapsed

		// count is set to random so loop begins randomly in paragraph
		var replaceIdx = Math.floor(random(1, words.length));
		var toChange = words[replaceIdx];

		if (toChange.length < 2 || isCommon(toChange))
			return;

		// once two minutes pass, 120000ms, then the text goes into
		// "remembering" state where it is more likely to remember a
		// replacement that it has already made then to make a new replacement

		if (!CLKTEST) {

 			var now = millis(), max = (now-timeStamp > 120000) ? 10 : 5;
  			mode  = Math.floor(random(1, max));
  		}

		timeStamp = millis();
		//console.log("TRY: " + millis() +" NEXT: "+(timeStamp+stepMs));

  		//busy = 1;

		// switch statement which either changes verbs, nouns,
		// adverbs, or adjectives; or remembers an older word
		switch (mode) {
			case 1:
				if (allpos[replaceIdx].indexOf("a") == 0)
					replaceAdj(toChange, replaceIdx);
				break;
			case 2:
				if (allpos[replaceIdx].indexOf("n") == 0)
					replaceNoun(toChange, replaceIdx);
				break;
			case 3:
				if (allpos[replaceIdx].indexOf("r") == 0)
					replaceAdv(toChange, replaceIdx);
				break;
			case 4:
				if (allpos[replaceIdx].indexOf("v") == 0)
					replaceVerb(toChange, replaceIdx);
				break;
			case 9:
				replaceIdx = remember(toChange, replaceIdx);
				break;
		}
	}
}

  // here are the methods for retrieving words from wordNet and making
  // appropriate changes to their structure if needed.

function replaceAdj(toChange, replaceIdx) {

	wordnet.getAllSynonyms(toChange, "a", function(asyns) {

		if (asyns.length) {

			var newWord = asyns[Math.floor(random(asyns.length))];
			if (dbug) console.log("replaceAdj(): '" + toChange + "' -> " + newWord);
			fireReplaceEvent(replaceIdx, newWord);
		}
	});

}

function replaceAdv(toChange, replaceIdx) {

	wordnet.getAllDerivedTerms(toChange, "r", function(dts) {

		if (dts.length > 0) {

			var randAdj = dts[Math.floor(random(dts.length))];
			wordnet.getAllSynonyms(randAdj, "a", function(asyns) {

				if (asyns.length > 0) {

					var adj = asyns[Math.floor(random(asyns.length))];
					var newStr = toAdverb(adj);
					if (dbug) console.log("Adverbify: '" + adj + "' -> " + newStr);

					wordnet.exists(newStr, function(yes) {

						if (yes) {
							if (dbug) console.log("replaceAdv(): '"+toChange+"' -> "+newStr);
							fireReplaceEvent(replaceIdx, newStr);
						}
						else {
							console.log("wn.reject: "+newStr);
						}
					});
				}
			});
		}
	});
}

function replaceNoun(toChange, replaceIdx) {

	wordnet.getAllSynonyms(toChange, "n", function(nsyns) {

		if (nsyns.length > 0) {

			var newStr = nsyns[Math.floor(random(nsyns.length))];

			if (!endsWith(newStr, "ing")) {

				if (allpos[replaceIdx] === "nns") {

					var orig = newStr; // tmp-remove
					newStr = RiTa.pluralize(newStr);
					if (dbug) console.log("Pluralizing: '" + orig + "' -> " + newStr + " [orig=" + words[replaceIdx]+"]");

					wordnet.exists(newStr, function(yes) { // Does this happen?

						if (!yes) {
							console.log("WN-plural-rejection***: '" + newStr);
							return;
						}

						if (dbug) console.log("replaceNoun(): '" + toChange + "' -> " + newStr);

						fireReplaceEvent(replaceIdx, newStr);
					});
				}        var args = { tense: RiTa.PRESENT_TENSE, number: RiTa.SINGULAR, person: RiTa.THIRD_PERSON };

			}
			else {
				if (dbug) console.log("Ignoring -ing noun! -> " + newStr);
			}
		}
	});
}

function replaceVerb(toChange, replaceIdx) {

    if (replaceIdx < 2) return;

    if (equalsIgnoreCase(toChange, "am")) {

        fireReplaceEvent(replaceIdx, "was");
        return;
    }
    else if (equalsIgnoreCase(toChange,"was")) {

        fireReplaceEvent(replaceIdx, "am");
        return;
    }

	wordnet.getAllCoordinates(toChange, "v", function(vsyns) {

		if (vsyns.length > 0) {

			var newStr = vsyns[Math.floor(random(vsyns.length))];
			var orig = newStr;
			// tmp-remove

			if (allpos[replaceIdx] === "vbg") {

				newStr = RiTa.getPresentParticiple(newStr);
				if (dbug) console.log("Adding-ing: " + orig + " -> " + newStr);
			}
			else if (allpos[replaceIdx] === "vbz") {

		        var args = { tense: RiTa.PRESENT_TENSE, number: RiTa.SINGULAR, person: RiTa.THIRD_PERSON };

				newStr = RiTa.conjugate(newStr, args);
				if (dbug) console.log("Conjugate(3rd)***: " + orig + " -> " + newStr);
			}

			if (dbug) console.log("replaceVerb(): '" + toChange + "' -> " + newStr);

			fireReplaceEvent(replaceIdx, newStr);
		}
	});
}

function remember(toChange, idx) {

	for (var t = 0; t < wordLists.length; t++) {

		if (idx >= wordLists.length) idx = 0;

		if (wordLists[idx].length == 1) {

			idx++; // update counter and continue if an array of size 1 is found
			continue;
		}

		var lastWord;
		if (wordLists[idx].length > 2) {

			// remove the last item in the array
			wordLists[idx].pop();

			// current one which is now at the end
			lastWord = wordLists[idx][wordLists[idx].length - 1];

			// check the word against common words to ignore
			if (!isCommon(lastWord)) {

				if (dbug) console.log("remember(): '" + toChange + "' -> " + lastWord);
				fireReplaceEvent(idx, lastWord);
				break;
			}
		}
		idx++; // update counter if a word is not returned
	}

    return idx;
}

function onReplaceEvent(re) {

	var sub = re.data();
	var newWord = sub.word;

	if (newWord != null) {

		//timeStamp = millis();
		if (CLKTEST) mode = 0;
		makeSubstitution(newWord, sub.idx);
	}
}

function makeSubstitution(newWord, idx) {

	var all = rts;

	for (var t = 0; t < all.length; t++) {

		var riString = all[t].text();
		if (equalsIgnoreCase(riString, words[idx]) ||
			 equalsIgnoreCase(riString, words[idx] + ".") ||
			  equalsIgnoreCase(riString, words[idx] + ","))
		{
			//  change the color of text if needed
			changeTextColor(mode, t);
		}
	}

    adjustDeterminer(newWord, idx); // may change words[idx-1]

  	console.log(words[idx] + "-> "+newWord+ " @"+millis());

    // here is where the replacement is actually made
    words[idx] = newWord;

    // following 5 lines needed to add the new word to the
    // arrays of words that keep track of the history of replacements
    var tempArray = wordLists[Math.min(idx, wordLists.length-1)];
    if (mode <= 4) tempArray.push(newWord);


    reformat(); // reformat the screen
}

function adjustDeterminer(newWord, idx) {

  	//console.log("adjustDeterminer: "+newWord);

    if (idx < 1) return;

    var firstLetter = newWord.charAt(0);

    if (equalsIgnoreCase(words[idx-1], "a") && /[aeiou]/.test(firstLetter)) {

      	words[idx-1] = checkCase(idx-1, "an");
    }
    else if (equalsIgnoreCase(words[idx-1], "an") && /[^aeiou]/.test(firstLetter)) {

      	words[idx-1] = checkCase(idx-1,"a");
    }
}

function fireReplaceEvent(replaceIdx, newWord) {

    if (ignores.indexOf(newWord)>-1) return;

    onReplaceEvent(new RiTaEvent(wordnet, null,
        new Sub(checkCase(replaceIdx, newWord), replaceIdx)));
}

function toAdverb(nStr) {

	if (endsWith(nStr, "y"))
		return nStr.substring(0, nStr.length - 1) + "ily";

	return nStr + (endsWith(nStr, "ic") ? "ally" : "ly");
}

function Sub(s, index) {

		this.word = s;
		this.idx = index;
};

////////////////////////////////////////////////////////////////////////

function isPlural(s) { return (!s.equals(RiTa.stem(s))); }

function endsWith(str, ending) {

	return str.slice(-ending.length) == ending;
}

function checkCase(idx, word)
{
	var first = words[idx].charAt(0);
    if (idx < 1 || first == first.toUpperCase()) {

        word = RiTa.upperCaseFirst(word);
        if (dbug) console.log("Capitalizing: "+word+" [orig="+words[idx]+"]");
    }

    return word;
}

function changeTextColor(num, t) {

		colorVals[t] = (num <= 4) ? Math.max(0, colorVals[t] - 50) :
		  Math.min(255, colorVals[t] + 50);
}

function equalsIgnoreCase(a,b) {

	return a && b && (a.toUpperCase() === b.toUpperCase());
}
