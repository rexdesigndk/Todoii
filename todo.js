// Makes sure animations has ended required for animate.css 
$.fn.extend({
	animateCss: function (animationName, callback) {
		var animationEnd = (function (el) {
			var animations = {
				animation: 'animationend',
				OAnimation: 'oAnimationEnd',
				MozAnimation: 'mozAnimationEnd',
				WebkitAnimation: 'webkitAnimationEnd',
			};

			for (var t in animations) {
				if (el.style[t] !== undefined) {
					return animations[t];
				}
			}
		})(document.createElement('div'));

		this.addClass('animated ' + animationName).one(animationEnd, function () {
			$(this).removeClass('animated ' + animationName);

			if (typeof callback === 'function') callback();
		});

		return this;
	},
});

if (Storage) {
	let items = JSON.parse(localStorage.getItem("listitems"));

	if (items && items.length > 0) {

		for (let c = 0; c < items.length; c++) {
			if (isStorageItemExpired(items[c].lastUpdated)) {
				storageItemDelete(items[c].task);
				continue;
			}

			let newItem = `<li class=\"todoitems\">
				<button class=\"donebtn\">
					<i class=\"fas fa-check fa-lg\"></i>
				</button>\
				<span class="items`;
			if (items[c].finished === true) {
				newItem += " completedtask\" contenteditable=\"false\">";
			} else {
				newItem += "\" contenteditable=\"true\">";
			}
			newItem += items[c].task + `</span>
				<button class="delbtn">\
					<i class="fas fa-times fa-lg"></i>\
				</button>\
			</li>`;

			$('.ullist').prepend(newItem);
		}
	}
}
// Get's current date and display's it to the user
let date = new Date();
let day = $('#day').text(["Sunday,", "Monday,", "Tuesday,", "Wednesday,", "Thursday,", "Friday,", "Saturday,"][(new Date()).getDay()]);
let currentday = $('#dayofweek').text(date.getDate());
let month = $('#month').text(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(new Date()).getDay()]);
let currentYear = $('#year').text(date.getFullYear());

// Get's the current time
let hours = date.getHours();

// Set's the background according to the time of day
if (hours < 6 || hours > 19) {
	if (!$('.bodyhead').hasClass('nightbg')) $('.bodyhead').addClass('nightbg');
	if ($('.bodyhead').hasClass('daybg')) $('.bodyhead').removeClass('daybg');
} else {
	if ($('.bodyhead').hasClass('nightbg')) $('.bodyhead').removeClass('nightbg');
	if (!$('.bodyhead').hasClass('daybg')) $('.bodyhead').addClass('daybg');
}
$("#listinput").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#additembtn").click();
    }
});
// Disable the add button if input isn't focused 
$(document).ready(function (e) {
	$('#additembtn').prop('disabled', true);
	$('#listinput').keyup(function () {
		let inputVal = $('#listinput').val();
		$('#additembtn').prop('disabled', !inputVal || inputVal.length < 2 ? true : false);
	});

	// adds items to the list
	$('#additembtn').click(function (e) {
		let inputValue = $('#listinput').val();

		if (!inputValue || inputValue.length < 2) return;

		let dataArray = [];
		if (localStorage.getItem('listitems')) {
			let oldData = JSON.parse(localStorage.getItem('listitems'));

			for (let i = 0; i < oldData.length; i++) {
				dataArray.push(oldData[i]);
			}
		}
		dataArray.push({
			finished: false,
			task: inputValue,
			lastUpdated: getUnixTime()
		});
		localStorage.setItem('listitems', JSON.stringify(dataArray));

		$('.ullist').prepend('\
			<li class="todoitems">\
				<button class="donebtn">\
				<i class="fas fa-check fa-lg"></i>\
				</button>\
				<span class="items" contenteditable="true">' + $('#listinput').val() + '</span>\
				<button class="delbtn">\
				<i class="fas fa-times fa-lg"></i>\
				</button>\
			</li>\
		')

		$('li:first').animateCss('fadeInDown');
		$('#listinput').focus();
		$('#listinput').val('');
		$('#additembtn').prop('disabled', true);
	});
});

// Removes items on the list
$(document).on('click', '.delbtn', function () {
	let self = this;
	$(self).parent().animateCss('fadeOutLeft', function () {
		storageItemDelete($(self).parent().children('.items').text());

		$(self).parent().remove();
	});
});

// Marks the list item done
$(document).on('click', '.donebtn', function () {
	let self = this;
	if ($(self).parent().children('.items').hasClass('completedtask')) {
		storageToggleStatus($(self).parent().children('.items').text());

		$(self).parent().children('.items').removeClass('completedtask');
		$(self).removeClass('donebtncomplete');
		$(self).parent().children('.items').prop('contenteditable', true);
	} else {
		storageToggleStatus($(self).parent().children('.items').text());

		$(self).parent().children('.items').addClass('completedtask');
		$(self).addClass('donebtncomplete');
		$(self).parent().children('.items').prop('contenteditable', false);
	}
});

/**
 * Checks if a storage item has expired and should be deleted.
 * @param {uinteger} lastUpdated 
 * @param {uinteger} expiration 
 */
function isStorageItemExpired(lastUpdated, expiration = 7) {
	return getUnixTime() > lastUpdated + secondsInDays(expiration);
}

/**
 * Get amount of seconds from a number of days
 */
function secondsInDays(days) {
	return 60 * 60 * 24 * days;
}

/**
 * Gets the current unix timestamp
 */
function getUnixTime() {
	return Math.floor(Date.now() / 1000);
}

/**
 * Toggles the completed status of the storage item.
 * @param {string} taskText
 */
function storageToggleStatus(taskText) {
	let storedItems = JSON.parse(localStorage.getItem('listitems'));

	if (storedItems && storedItems.length <= 0) return;

	let newItems = [];

	for (let i = 0; i < storedItems.length; i++) {
		if (storedItems[i].task == taskText) {
			storedItems[i].finished = !storedItems[i].finished;
			storedItems[i].lastUpdated = getUnixTime();
			for (let a = 0; a < storedItems.length; a++) {
				newItems.push(storedItems[a]);
			}

			localStorage.setItem('listitems', JSON.stringify(newItems));

			break;
		}
	}
}

/**
 * Deletes the storage item by its task text.
 * @param {string} taskText 
 */
function storageItemDelete(taskText) {
	let storedItems = JSON.parse(localStorage.getItem('listitems'));
	let newItems = [];

	if (storedItems && storedItems.length > 0) {
		for (let i = 0; i < storedItems.length; i++) {
			if (storedItems[i].task == taskText) continue;

			newItems.push(storedItems[i]);
		}
	}

	localStorage.setItem('listitems', JSON.stringify(newItems));
}