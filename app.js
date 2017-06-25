//Main app

function PersistenceService() {}

PersistenceService.prototype.save = function(record) {
	throw "Must be overridden";
};

PersistenceService.prototype.getRecordsByUser = function(user) {
	throw "Must be overridden";
};

PersistenceService.prototype.getRecordsById = function(id) {
	throw "Must be overridden";
};

PersistenceService.prototype.getRecordsByStatus = function(status) {
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

InMemoryPersistenceService.prototype.getRecordsByUser = function(user) {
    return this.records.filter(function(item) {
        return JSON.stringify(item.user) === JSON.stringify(user);
    });
};

InMemoryPersistenceService.prototype.getRecordById = function(id) {
    var records = this.records.filter(function(item) {
        return item.id === id;
    });
    if(records.length > 1) {
        throw "Multiple records with the same id found";
    }
    if(records.length > 0) {
        return records[0];
    }
    return new Record();
};

InMemoryPersistenceService.prototype.getRecordsByStatus = function(status) {
    return this.records.filter(function(item) {
        return item.status === status;
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
	this.remove(record.id);
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

function Validator(name, func) {
	this.name = name;
	this.func = func;
}

function VacationBookingApp(persistenceService, userAuthList, validators = []) {
	this.userAuthList = userAuthList;
	this.persistenceService = persistenceService;
	this.validators = validators;
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
	return new UserActions(user, this.persistenceService, this.validators);
};

VacationBookingApp.prototype.addValidator = function(validator) {
	if (typeof validator === "undefined") {
		throw "Please provide a validator";
	}
	this.validators.push(validator);
};

VacationBookingApp.prototype.listPendingVacationRequests = function() {
	throw "Must be overridden";
};

VacationBookingApp.prototype.listRejectedVacationRequests = function() {
	throw "Must be overridden";
};

VacationBookingApp.prototype.listAcceptedVacationRequests = function() {
	throw "Must be overridden";
};

function UserActions(user, persistenceService, validators) {
	VacationBookingApp.call(this, persistenceService, [], validators);
	this.user = user;
}

UserActions.prototype = Object.create(UserActions.prototype);
UserActions.prototype.constructor = VacationBookingApp;

/* user asks for a vacation */
UserActions.prototype.submitVacationRequest = function(start, end) {
	if (typeof start === "undefined" || typeof end === "undefined") {
		throw "Please provide a start and end date";
	}
	var records = this.persistenceService.records;
	var failedValidators = this.validators.filter(function(validator) {
		if(validator.func(records, start, end)) {
			return validator.name;
		}
	});
	if(failedValidators.length > 0) {
		return failedValidators;
	}
	var record = new Record(null, this.user, start, end, StatusEnum.AWAITING_DECISION);
	this.persistenceService.save(record);
	return [];
};

UserActions.prototype.cancelVacationRequest = function(id) {
	var myRequests = this.persistenceService.getRecordsByUser(this.user);
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
	var myRequests = this.persistenceService.getRecordsByUser(this.user);
	return myRequests.filter(function(item) {
	    return item.status === StatusEnum.AWAITING_DECISION;
	});
};

UserActions.prototype.listRejectedVacationRequests = function() {
	var myRequests = this.persistenceService.getRecordsByUser(this.user);
	return myRequests.filter(function(item) {
	    return item.status === StatusEnum.REJECTED;
	});
};

UserActions.prototype.listAcceptedVacationRequests = function() {
	var myRequests = this.persistenceService.getRecordsByUser(this.user);
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
	return this.persistenceService.getRecordsByStatus(StatusEnum.AWAITING_DECISION);
};

ManagerActions.prototype.listRejectedVacationRequests = function() {
	return this.persistenceService.getRecordsByStatus(StatusEnum.REJECTED);
};

ManagerActions.prototype.listAcceptedVacationRequests = function() {
	return this.persistenceService.getRecordsByStatus(StatusEnum.ACCEPTED);
};

ManagerActions.prototype.acceptVacationRequest = function(id) {
	var vacationRequest = this.persistenceService.getRecordById(id);
	if(typeof vacationRequest.id === "undefined") {
	    throw "Record not found";
	}
	if(vacationRequest.status !== StatusEnum.AWAITING_DECISION) {
		throw "Record is not awaiting decision";
	}
	vacationRequest.status = StatusEnum.ACCEPTED;
	this.persistenceService.update(vacationRequest);
};

ManagerActions.prototype.rejectVacationRequest = function(id) {
	var vacationRequest = this.persistenceService.getRecordById(id);
	if(typeof vacationRequest.id === "undefined") {
	    throw "Record not found";
	}
	if(vacationRequest.status !== StatusEnum.AWAITING_DECISION) {
		throw "Record is not awaiting decision";
	}
	vacationRequest.status = StatusEnum.REJECTED;
	this.persistenceService.update(vacationRequest);
};
