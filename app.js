//Main app

function PersistenceService() {}

PersistenceService.prototype.save = function(record) {
	throw "Must be overridden";
};

PersistenceService.prototype.list = function() {
	throw "Must be overridden";
}

PersistenceService.prototype.getRecordsForUser = function(user) {
	throw "Must be overridden";
}

function InMemoryPersistenceService() {
	PersistenceService.call();
	this.records = [];
}

InMemoryPersistenceService.prototype = Object.create(PersistenceService.prototype);
InMemoryPersistenceService.prototype.constructor = InMemoryPersistenceService;

InMemoryPersistenceService.prototype.list = function() {
	return this.records;
};

InMemoryPersistenceService.prototype.save = function(record) {
	if(typeof record !== "undefined") {
		this.records.push(record);
	} else {
		throw "Please provide a record";
	}
};

InMemoryPersistenceService.prototype.getRecordsForUser = function(user) {
	return this.records.filter(function(item) {
		return item.user === user;
	});
};

var StatusEnum = Object.freeze({AWAITING_DECISION: 1, ACCEPTED: 2, REJECTED: 3});

function Record(user, start, end, status) {
	this.user = user;
	this.startDate = start;
	this.endDate = end;
	this.status = status;
}

function User(displayName, email) {
	this.displayName = displayName;
	this.email = email;
}

function VacationBookingApp(name, persistenceService) {
	this.name = name;
	this.persistenceService = persistenceService;
	this.isCool = true;
}

VacationBookingApp.prototype.requestVacation = function(request) {
	if(typeof request !== "undefined") {
		this.persistenceService.save(request);
	} else {
		throw "Please provide a non-null argument";
	}
};

VacationBookingApp.prototype.listRequestsFromUser = function(user) {
	if(typeof user !== "undefined") {
		return this.persistenceService.getRecordsForUser(user);
	} else {
		throw "Please provide a user";
	}
};
