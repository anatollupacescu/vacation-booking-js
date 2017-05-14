//Main app

function VacationBookingApp(name) {
	this.name = name;
	this.isCool = true;
}

App.prototype.makeMoney = function(howMuch) {
	return 'You just made ' + howMuch + ' cash';
};
