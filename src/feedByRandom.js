const toastr = require('toastr')
const $ = require('jquery')
require('jquery-ui/themes/base/core.css')
require('jquery-ui/themes/base/theme.css')
require('jquery-ui/themes/base/selectable.css')
require('jquery-ui/ui/core')
// require('jquery-ui/ui/widgets/selectable')
require('jquery-ui/ui/widgets/slider')
require('jquery-ui/themes/base/slider.css')

// --------------------------- PUTS TOGETHER DYNAMIC ELEMENTS OF THE PAGE ------------------------------//
$(document).ready(function() {
	var v = 0;

// Iterations Slider Bar
	$( "#iterations" ).slider({
      range: "max",
      min: 1000, // 100 is the minimum because of the progress bar
      max: 1000000,
      value: 10000,
      slide: function( event, ui ) {
        $( "#amount" ).val( ui.value );
      }
    });
    
    $( "#amount" ).val( $( "#iterations" ).slider( "value" ) );

	$('#stop').on('click', function() {
		feedCalc.stopCalculating = true;
	});

	for (var seedName in seeds) {
		var id = seedName.replace(' ','-');
		$('#table-body').append(
			'<tr data-seedname="' + seedName + '">' +
				'<td style="width:150px;">'+ seedName  +'</td>' +
				'<td><input type="text" style="text-align:center;width:60px;" id="'+ id +'-pp" value="'+ seeds[seedName][0]  +'"/></td>' +
				'<td><input type="text" style="text-align:center;width:60px;" id="'+ id +'-cost" value="'+ seeds[seedName][1]  +'"/></td>' +
				'<td><input type="number" style="text-align:center;width:60px;" id="'+ id +'-min" value="'+ seeds[seedName][2]  +'" min="0" max="100" /></td>' +
				'<td><input type="number" style="text-align:center;width:60px;" id="'+ id +'-max" value="'+ seeds[seedName][3]  +'" min="0" max="100" /></td>' +
				'<td><input type="number" style="text-align:center;width:60px;" id="'+id+'-result" min="0" max="100" /></td>' +
				'<td><button class="btn btn-sm btn-primary glyphicon glyphicon-trash killButton"></button></td>' +
	        '</tr>');
		// $('#' + id + '-pp').on('change', go);
		// $('#' + id + '-cost').on('change', go);
		// $('#' + id + '-min').on('change', go);
		// $('#' + id + '-max').on('change', go);
		$('#' + id + '-result').on('change', function() {
			var answer = {}, sumProtein = 0, sumCost = 0, costPerPound, newAnswer = {}, totalLbs = 0;

			for (var seedName in seeds) {
				var id = seedName.replace(' ','-');
				answer[seedName] = $('#' + id + '-result').val();
				sumProtein += answer[seedName] * seeds[seedName][0];
				sumCost += answer[seedName] * seeds[seedName][1];
				totalLbs += +answer[seedName];
				console.log(answer[seedName]);
			}
			if (totalLbs !== 100) {

				if (v === 0) {toastr.warning('Adjust amounts until the total adds to 100 for accurate data.')}
				$('#numLbs').addClass('alert-danger');
				$('#poundsDiv').animate({opacity: 1},500, function() {});
				v++;
			} else {
					$('#numLbs').removeClass('alert-danger');
					$('#poundsDiv').delay(1000).animate({opacity: 0},3000, function() {});
			}

			costPerPound = (sumCost * .01);
			newAnswer = [answer, sumProtein, costPerPound, totalLbs];
			makeResultTable(newAnswer);
		});

	}

	// NEW ROW
	// var i=1;
	$("#new_row").click(function(){
      $('#table-body').append(
			'<tr>' +
				'<td style="width:150px;"><input style="width:150px;" placeholder="Ingredient Name" id="newIngredient-name" /></td>' +
				'<td><input type="text" style="text-align:center;width:60px;" id="newIngredient-pp" placeholder="% protein" /></td>' +
				'<td><input type="text" style="text-align:center;width:60px;" id="newIngredient-cost" placeholder="$/lb" /></td>' +
				'<td><input type="number" style="text-align:center;width:60px;" id="newIngredient-min" placeholder="min" /></td>' +
				'<td><input type="number" style="text-align:center;width:60px;" id="newIngredient-max" placeholder="max" /></td>' +
				'<td><input type="number" style="text-align:center;width:60px;" id="newIngredient-result" min="0" max="100" /></td>' +
				'<td><button class="btn btn-sm btn-primary glyphicon glyphicon-trash killButton"></button></td>' +
	        '</tr>');
      // i++;
  	});
	// ADD ROW (to object)
	
	$("#add_row").click(function(){
		var seedName = $('#newIngredient-name').val();
		seeds[seedName] = [$('#newIngredient-pp').val(), $('#newIngredient-cost').val(), $('#newIngredient-min').val(), $('#newIngredient-max').val()]
		var id = seedName.replace(' ','-');
		$('#newIngredient-name').parent().html(seedName);
		$('#newIngredient-name').remove();
		$('#newIngredient-pp')[0].id = id + '-pp';
		$('#newIngredient-cost')[0].id = id + '-cost';
		$('#newIngredient-min')[0].id = id + '-min';
		$('#newIngredient-max')[0].id = id + '-max';
		$('#newIngredient-result')[0].id = id + '-result';
	});
	
	


	// REMOVE ROW - this is not working for ingredient with 2 words
	$(document).on("click",'.killButton', function(){
		var $killrow = $(this).parents('tr');
	
		delete seeds[$killrow.data('seedname')];
    	$killrow.addClass("danger");
		$killrow.fadeOut(350, function(){
    		$(this).remove();

		});
	});


    //console.log('document ready')
	$('#butt').on('click', go);

});

// ----------------------------- actual calculation part -------------------------------//

var seeds = {
	'Nutri-balancer' :  [0,     1.25,   3, 3],
	'Ag lime' : 		[0,     0.079,  5, 5],
	'Corn' : 			[0.09,  0.0725, 0, 30],
	'Soybean meal' : 	[0.45,  0.419,  0, 30],
	'Flax' : 			[0.37,  0.75,   0, 10],
	'Milo' : 			[0.09,  0.15,   0, 30],
	'Sunflower seeds' : [0.15,  0.37,   0, 30],
	'Winter Peas' : 	[0.22,  0.66,   0, 30],
	'Wheat' : 			[0.125, 0.236,  0, 30],
	'Oats' : 			[0.14,  0.18,   0, 15],
	'Barley' : 			[0.123, 0.42,   0, 15],
	'Fish meal' : 		[0.6,   0.997,  0, 5]
};

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getRandomInt(min, max) {
	max = parseFloat(max); // processes more quickly when this is done
	min = parseFloat(min);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function backend(target, seedsRequired, seedsNotRequired) {
	var seed, randomTry = {}, leftToProcess = 100, sumProtein = 0, sumCost = 0, costPerPound;

	// pick the ones with min > 0 first
	var numSeedsRequired = seedsRequired.length;
	for (var i = 0; i < numSeedsRequired; i++) {
		var randomQuantity;
		var seed = seedsRequired[i];
		randomQuantity = getRandomInt(seeds[seedsRequired[i]][2], seeds[seedsRequired[i]][3]);
		if (randomQuantity > leftToProcess) {
			randomQuantity = leftToProcess;
			break;
		}
		randomTry[seed] = randomQuantity;
		leftToProcess -= randomQuantity;

		sumProtein += randomQuantity * seeds[seedsRequired[i]][0];
		sumCost += randomQuantity * seeds[seedsRequired[i]][1];
	}

	// pick the rest
	var seedsNotRequiredCopy = seedsNotRequired.slice(0);
	var randomOrderArray = shuffleArray(seedsNotRequiredCopy)
	var numRandomOrderArray = randomOrderArray.length;
	for (var i = 0; i < numRandomOrderArray; i++) {
		var randomQuantity;
		var randomIndex = Math.floor(Math.random()*randomOrderArray.length); // pick random index
		var seed = randomOrderArray[randomIndex]; // assign associated item (seed name)
		randomQuantity = getRandomInt(seeds[seed][2], seeds[seed][3]); // pick random quantity from that item
		if (randomIndex > -1) {
	    	randomOrderArray.splice(randomIndex, 1); // take item out of temp array
		}
		if (randomQuantity > leftToProcess) {
			randomQuantity = leftToProcess; // if there isn't enough left, just fill up the rest and quit
			break;
		}
		randomTry[seed] = randomQuantity;
		leftToProcess -= randomQuantity;
		sumProtein += randomQuantity * seeds[seed][0]; // the randomly picked item
		sumCost += randomQuantity * seeds[seed][1];
	}

    costPerPound = (sumCost * .01);
	if (leftToProcess !== 0) {
		feedCalc.randomIsOff += 1;
		return false;
	}

	if ((sumProtein >= target && sumProtein <= (target + .5)) && (costPerPound < .5)) {
		return [randomTry, sumProtein, costPerPound];
	} else {
		return false;
	}
};



var feedCalc = {
	randomIsOff : 0
}; // global scope

function go(event) {
	// resetProgressBar(); //#
	feedCalc.stopCalculating = false;

	var seedsRequired = getSeedsRequired();
	var seedsNotRequired = getSeedsNotRequired();

	event.preventDefault();

	for (var seedName in seeds) {
		var id = seedName.replace(' ','-');
		//console.log($('#' + id).val())
		seeds[seedName][0] = $('#' + id + '-pp').val();
		seeds[seedName][1] = $('#' + id + '-cost').val();
		seeds[seedName][2] = $('#' + id + '-min').val();
		seeds[seedName][3] = $('#' + id + '-max').val();
	}

	// fetch input for protein value
	if ($('#targetProtein').val() === 'layer') {
		feedCalc.targetFromHTML = 16;
	} else {
		feedCalc.targetFromHTML = 18;
	};

	// fetch input from slider
	feedCalc.n = $('#amount').val();
	feedCalc.answers = [];
	feedCalc.randomIsOff = 0;
	feedCalc.startTime = new Date().getTime();
	iterate(0, seedsRequired,seedsNotRequired);
	console.log('started');
}

function getSeedsRequired() {
	var seedsRequired = [];
	for (seed in seeds) {
		if (seeds[seed][2] > 0) {
			seedsRequired.push(seed);	
		}
	}
	return seedsRequired;
}

function getSeedsNotRequired() {
	var seedsNotRequired = [];
	for (seed in seeds) {
		if (seeds[seed][2] == 0) {
			seedsNotRequired.push(seed);	
		}
	}
	return seedsNotRequired;
}

function iterate(i0, inc_seedsRequired, inc_seedsNotRequired) {
	var chunkSize = Math.floor(feedCalc.n / 100);
	for (var i = i0; i < i0 + chunkSize ; i++) {
		if (i >= feedCalc.n) { 
			processAnswers(feedCalc.answers); return;
		}
		var attempt = backend(feedCalc.targetFromHTML, inc_seedsRequired, inc_seedsNotRequired);
		if (attempt) {
			feedCalc.answers.push(attempt)
		};
	}
	var percent = Math.floor(((i + 1) / feedCalc.n) * 100) ;
	if (percent > 100) {
		percent = 100;
	}
	if (feedCalc.stopCalculating) {
		updateProgressBar(percent);
		processAnswers();
	} else {
		updateProgressBar(percent);
		setTimeout(iterate.bind(undefined, i, inc_seedsRequired, inc_seedsNotRequired));
	}
}

function updateProgressBar(percent) {
	$('#pb').attr('aria-valuenow', percent).css('width', percent + '%');
    $('#percentDone').html(percent);
}

//# doesn't work
function resetProgressBar() {
	$('#pb').attr('aria-valuenow', 0).css('width', 0 + '%');
	$('#percentDone').html(0);
}

function processAnswers() {
	console.log('Percentage when Random selection doesnt add up to 0: ' + Math.floor(feedCalc.randomIsOff / feedCalc.n * 100) + '%');
	console.log('finished taking ' + (new Date().getTime() - feedCalc.startTime) + ' ms');

	feedCalc.answers.sort(function(a, b){
		return a[2] - b[2];
	});

	//console.log(answers);
	var bestAnswer;
	bestAnswer = feedCalc.answers[0];
	// return bestAnswer;
	for (var seedName in seeds) {
		//console.log(seedName);
		var id = seedName.replace(' ','-');
		//console.log(bestAnswer[0][0][seedName]);
		$('#' + id + '-result').val(bestAnswer[0][seedName]);

	}
	makeResultTable(bestAnswer);
}

function makeResultTable(Answer) {
	$('#pp-result').html(Answer[1].toFixed(2) + "%");
	$('#lb-result').html("$" + Answer[2].toFixed(2));
	$('#50lb-result').html("$" + (Answer[2] * 50).toFixed(2));
	$('#40lb-result').html("$" + (Answer[2] * 40).toFixed(2));
	$('#numLbs').html(Answer[3]);
}

