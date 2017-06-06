//Main app

function PersistenceService() {}

PersistenceService.prototype.save = function(record) {
	throw "Must be overridden";
};

PersistenceService.prototype.getRecordsForUser = function(user) {
	throw "Must be overridden";
};

PersistenceService.prototype.remove = function(id) {
	throw "Must be overridden";
};

function InMemoryPersistenceService() {
	PersistenceService.call();
	this.records = [];
	this.id = 0;
}

InMemoryPersistenceService.prototype = Object.create(PersistenceService.prototype);
InMemoryPersistenceService.prototype.constructor = InMemoryPersistenceService;

InMemoryPersistenceService.prototype.save = function(record) {
	if (typeof record !== "undefined") {
	    record.id = this.id;
	    this.id = this.id + 1;
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

InMemoryPersistenceService.prototype.remove = function(id) {
    this.records = this.records.filter(function(item) {
        return item.id !== id;
    });
};

InMemoryPersistenceService.prototype.update = function(record) {
	if(typeof record === "undefined" || typeof record.id === "undefined") {
		throw "Record not valid";
	}
	this.records = this.records.filter(function(item) {
		return item.id !== record.id;
	});
	this.records.push(record);
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

function Record(id, user, start, end, status) {
    this.id = id;
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
	var record = new Record(null, this.user, start, end, StatusEnum.AWAITING_DECISION);
	this.persistenceService.save(record);
};

UserActions.prototype.cancelVacationRequest = function(id) {
	var myRequests = this.persistenceService.getRecordsForUser(this.user);
	var requestsForId = myRequests.filter(function(item) {
	    return item.id === id;
	});
	if(requestsForId.length !== 1) {
	    throw "Expected one record";
	}
	var recordToCancel = requestsForId[0];
	if(recordToCancel.status !== StatusEnum.AWAITING_DECISION) {
	    throw "Can not cancel record";
	}
	this.persistenceService.remove(recordToCancel.id);
};

UserActions.prototype.listPendingVacationRequests = function() {
	var myRequests = this.persistenceService.getRecordsForUser(this.user);
	return myRequests.filter(function(item) {
	    return item.status === StatusEnum.AWAITING_DECISION;
	});
};

UserActions.prototype.listRejectedVacationRequests = function() {
	var myRequests = this.persistenceService.getRecordsForUser(this.user);
	return myRequests.filter(function(item) {
	    return item.status === StatusEnum.REJECTED;
	});
};

UserActions.prototype.listAcceptedVacationRequests = function() {
	var myRequests = this.persistenceService.getRecordsForUser(this.user);
	return myRequests.filter(function(item) {
	    return item.status === StatusEnum.ACCEPTED;
	});
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
	    return item.status === StatusEnum.AWAITING_DECISION;
	});
};

ManagerActions.prototype.listRejectedVacationRequests = function() {
	return this.persistenceService.records.filter(function(item) {
	    return item.status === StatusEnum.REJECTED;
	});
};

ManagerActions.prototype.listAcceptedVacationRequests = function() {
	return this.persistenceService.records.filter(function(item) {
	    return item.status === StatusEnum.ACCEPTED;
	});
};

ManagerActions.prototype.acceptVacationRequest = function(id) {
	var recordsWithId = this.listPendingVacationRequests().filter(function(item) {
		return item.id === id;
	});
	if(recordsWithId.length !== 1) {
		throw "Expected to fine one record";
	}
	var vacationRequest = recordsWithId[0];
	vacationRequest.status = StatusEnum.ACCEPTED;
	this.persistenceService.update(vacationRequest);
};

ManagerActions.prototype.rejectVacationRequest = function(id) {
	var recordsWithId = this.listPendingVacationRequests().filter(function(item) {
		return item.id === id;
	});
	if(recordsWithId.length !== 1) {
		throw "Expected to fine one record";
	}
	var vacationRequest = recordsWithId[0];
	vacationRequest.status = StatusEnum.REJECTED;
	this.persistenceService.update(vacationRequest);
};
