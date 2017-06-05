//Main app

function PersistenceService() {}

PersistenceService.prototype.save = function(record) {
	throw "Must be overridden";
};

PersistenceService.prototype.getRecordsForUser = function(user) {
	throw "Must be overridden";
}

function InMemoryPersistenceService() {
	PersistenceService.call();
	this.records = [];
}

InMemoryPersistenceService.prototype = Object.create(PersistenceService.prototype);
InMemoryPersistenceService.prototype.constructor = InMemoryPersistenceService;

InMemoryPersistenceService.prototype.save = function(record) {
	if (typeof record !== "undefined") {
		this.records.push(record);
	} else {
		throw "Please provide a record";
	}
};

InMemoryPersistenceService.prototype.getRecordsForUser = function(user) {
    return this.records.filter(function(item) {
        return JSON.stringify(item.user) === JSON.stringify(user);
    });
};

var StatusEnum = Object.freeze({
	AWAITING_DECISION: 1,
	ACCEPTED: 2,
	REJECTED: 3
});
var Role = Object.freeze({
	MANAGER: 1,
	NON_MANAGER: 2
});

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

function UserAuth(user, password, role) {
	this.user = user;
	this.password = password;
	this.role = role;
}

function VacationBookingApp(persistenceService, userAuthList) {
	this.userAuthList = userAuthList;
	this.persistenceService = persistenceService;
}

VacationBookingApp.prototype.logIn = function(email, password) {
	var userAuthArr = this.userAuthList.filter(function(auth) {
		return auth.user.email === email && auth.password === password;
	});
	var userAuth = userAuthArr[0]
	if (typeof userAuth === "undefined") {
		throw "user not found";
	}
	var user = userAuth.user;
	if (typeof user === "undefined") {
		throw "user not provided in the auth object";
	}
	if (userAuth.role === Role.MANAGER) {
		return new ManagerActions(user, this.persistenceService);
	}
	return new UserActions(user, this.persistenceService);
}

VacationBookingApp.prototype.listPendingVacationRequests = function() {
	throw "Must be overridden";
};

VacationBookingApp.prototype.listRejectedVacationRequests = function() {
	throw "Must be overridden";
};

VacationBookingApp.prototype.listAcceptedVacationRequests = function() {
	throw "Must be overridden";
};

function UserActions(user, persistenceService) {
	VacationBookingApp.call(this, persistenceService);
	this.user = user;
}

UserActions.prototype = Object.create(UserActions.prototype);
UserActions.prototype.constructor = VacationBookingApp;

/* user asks for a vacation */
UserActions.prototype.submitVacationRequest = function(start, end) {
	if (typeof start === "undefined" || typeof end === "undefined") {
		throw "Please provide a start and end date";
	}
	var record = new Record(this.user, start, end, StatusEnum.AWAITING_DECISION);
	this.persistenceService.save(record);
};

UserActions.prototype.cancelVacationRequest = function(id) {
	//filter records
	//get record with id and user
	//throw error if not found
	//throw error if status is not StatusEnum.AWAITING
};

UserActions.prototype.listPendingVacationRequests = function() {
	var myRequests = this.persistenceService.getRecordsForUser(this.user);
	return myRequests.filter(function(item) {
	    return item.status === StatusEnum.AWAITING_DECISION;
	});
};

UserActions.prototype.listRejectedVacationRequests = function() {
	return new Array();
	//filter records
	//based on REJECTED and user
};

UserActions.prototype.listAcceptedVacationRequests = function() {
	return new Array();
};

UserActions.prototype.removeRejectedVacationRequest = function(vacationRequestId) {
	throw "Not supported";
};

function ManagerActions(user, persistenceService) {
	VacationBookingApp.call(this, persistenceService);
	this.user = user;
}

ManagerActions.prototype = Object.create(ManagerActions.prototype);
ManagerActions.prototype.constructor = VacationBookingApp;

ManagerActions.prototype.listPendingVacationRequests = function() {
	return this.persistenceService.records.filter(function(item) {
	    return item.user === this.user && item.status === StatusEnum.AWAITING_DECISION;
	});
};

ManagerActions.prototype.listRejectedVacationRequests = function() {
	return new Array();
	//filter records
	//based on REJECTED and user
};

ManagerActions.prototype.listAcceptedVacationRequests = function() {
	return new Array();
};

ManagerActions.prototype.acceptVacationRequest = function(id) {
	//filter records
	//based on id and status AWAITING
	//if found - change status to ACCEPTED
	//throw
};

ManagerActions.prototype.rejectVacationRequest = function(id) {
	//filter records
	//based on id and status AWAITING
	//if found - change status to REJECTED
	//throw
};