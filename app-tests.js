//App tests
/*
Use cases:

As a user I want to be able to :
	- submit a time period
	- see my submitted periods.
	- cancel a previously submited period from the list awaiting approval.
	- see my approved vacations
	- see my rejected vacation requests
future 
	- remove a rejected vacation request record
	- see an error if the starting date is in the past.
	- see an error if the end date is in the past.
	- see an error if the start date is later than the end date.
	- see an error if the period is less than 1 day.
	- see an error if the period overlaps a previously submitted period.
*Details*
	On top of my page I want to see a form that would allow me to pick a starting and ending date of my vacation
with a button to submit it.
Bellow the form I want to see a list of my previously submitted time periods divided in three sections:
	- records of the time periods that are awaiting action from my manager
	- records of the time periods that have been accepted
	- records of the time periods that have been rejected, with their corresponding messages.

As a manager I want to be able to:
	- see everyone's submitted vacation requests.
	- mark a vacation request as 'accepted'.
	- see everyone's accepted vacations on my calendar.
	- mark a vacation request as 'rejected' and add a message.
	- see the list of rejected vacation requests
	- see how many users haven't used all their vacation days
*Details*
	On top of the page I want to see the list of vacation requests awaiting approval with 'approve' or 'reject' option next
to each one. After I approve a request it should move to the list in the middle of the page. The rejected requests 
should go in the table at the bottom of the page. Upon rejecting a request I want to have an option to provide a message.
On a separate page I want to see the calendar on the left half of the page and the list of users with approved vacations 
on the right one. The list on the right has to have a checkbox next to each record and upon checking the box the vacation 
days should be highlited on the calendar.

Other
	- data auditing - every action should be logged.

Roles: user (u), manager (m)
Objects: vacation request record (VR)
User (u) actions: view, create, remove
Manager (m) actions: view, accept, reject, cancel
VR states: awaiting approval [AA], rejected [R], accepted [A]
Flow:

u -> create VR -> VR:AA

When VR:AA
	u,m can view VR
	u can remove VR
	m can reject VR - VR:R
	m can accept VR - VR:A

When VR:R
	u,m can view VR
	error for any other action -> 'Can not do [action] on a rejected record'

When VR:A
	u,m can view VR
	m can cancel VR -> VR removed from the system
	error for any other action -> 'Can not do [action] on a accepted record'
	
Testing

Test scenario 1

	user logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records

	manager logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records 

	user logs in
	user requests valid vacation

	user logs in
		sees 1 pending records
		sees 0 accepted records
		sees 0 rejected records

	manager logs in
		sees 1 pending records
		sees 0 accepted recods
		sees 0 rejected records 

	user logs in
		sees 1 pending recods

	user logs in
	user cancels request 1

	user logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records

Test scenario 2
	
	user logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records

	user logs in
	user requests valid vacation

	user logs in
		sees 1 pending records
		sees 0 accepted records
		sees 0 rejected records

	manager logs in
		sees 1 pending records
		sees 0 accepted recods
		sees 0 rejected recods

	manager logs in
	manager rejects request

	manager logs in
		sees 0 pending records
		sees 0 accepted records
		sees 1 rejected records

	user logs in
		sees 0 pending records
		sees 0 accepted records
		sees 1 rejected records

Test scenario 3

	user logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records

	manager logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records 
	
	user logs in
	user requests valid vacation

	user logs in
		sees 1 pending records
		sees 0 accepted records
		sees 0 rejected records

	manager logs in
		sees 1 pending records
		sees 0 accepted recods
		sees 0 rejected records 

	manager logs in
	manager accepts pending vacation request

	manager logs in
		sees 0 pending records
		sees 1 accepted records
		sees 0 rejected records

	user logs in
		sees 0 pending records
		sees 1 accepted records
		sees 0 rejected records

Test scenario 4

	user Jora logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records

	user Vasea logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records

	manager logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records

	user Jora logs in
	user Jora requests valid vacation

	user Jora logs in
		sees 1 pending records
		sees 0 accepted records
		sees 0 rejected records

	user Vasea logs in
		sees 0 pending records
		sees 0 accepted recods
		sees 0 rejected records

	manager logs in
		sees 1 pending records
		sees 0 accepted recods
		sees 0 rejected records 

	user Vasea logs in
	user Vasea requests valid vacation

	user Jora logs in
		sees 1 pending records
		sees 0 accepted records
		sees 0 rejected records

	user Vasea logs in
		sees 1 pending records
		sees 0 accepted recods
		sees 0 rejected records

	manager logs in
		sees 2 pending records
		sees 0 accepted recods
		sees 0 rejected records 

	manager logs in
	manager accepts Jora's pending vacation request

	user Jora logs in
		sees 0 pending records
		sees 1 accepted records
		sees 0 rejected records

	user Vasea logs in
		sees 1 pending records
		sees 0 accepted recods
		sees 0 rejected records
	
	manager logs in
		sees 0 pending records
		sees 1 accepted recods
		sees 0 rejected records 
		
	manager logs in
	manager accepts Vasea's pending vacation request

	user Jora logs in
		sees 0 pending records
		sees 1 accepted records
		sees 0 rejected records

	user Vasea logs in
		sees 0 pending records
		sees 1 accepted recods
		sees 0 rejected records
	
	manager logs in
		sees 0 pending records
		sees 2 accepted recods
		sees 0 rejected records 
*/

var jora = new User("Jora", "jora@mail.ru");
var userJoraAuth = new UserAuth(jora, "123456", Role.NON_MANAGER);
var vasea = new User("Vasilii", "vasea@gmail.com");
var userVaseaAuth = new UserAuth(vasea, "112233", Role.NON_MANAGER);
var manager = new User("Glavni", "nacalnic@hotmail.coom");
var managerAuth = new UserAuth(manager, "qazwsx", Role.MANAGER);
var userAuthList = [ userJoraAuth, userVaseaAuth, managerAuth ];

function actionsForManager(app) {
	return app.logIn(manager.email, managerAuth.password);
}

function actionsForVasea(app) {
	return app.logIn(vasea.email, userVaseaAuth.password);
}

function actionsForJora(app) {
	return	app.logIn(jora.email, userJoraAuth.password);
}

function managerAcceptsVacationRequestForUser(assert, app, user) {
	var manager = actionsForManager(app);
	var pendingRequests = manager.listPendingVacationRequests();
	assert.ok( pendingRequests.length > 0);
	var recordsForUser = pendingRequests.filter(function(item) {
		return  JSON.stringify(item.user) === JSON.stringify(user);
	});
	assert.ok (recordsForUser.length > 0);
	var recordForUser = recordsForUser[0];
	assert.ok( recordForUser.user === user);
	manager.acceptVacationRequest(recordForUser.id);
}

function managerRejectsVacationRequest(assert, app, user) {
	var manager = actionsForManager(app);
	var pendingRequests = manager.listPendingVacationRequests();
	assert.ok( pendingRequests.length > 0);
	var recordForUser = pendingRequests.filter(function(item) {
		return  JSON.stringify(item.user) === JSON.stringify(user);
	});
	assert.ok (recordsForUser.length > 0);
	var recordForUser = recordsForUser[0];
	assert.ok( recordForUser.user === user);
	manager.rejectVacationRequest(recordForUser.id);
}

function vaseaSubmitsVacationRequest(assert, app, start, end) {
	var vasea = actionsForVasea(app);
	return vasea.submitVacationRequest(start, end);
}

function vaseaCancelsVacationRequest(assert, app) {
	var vasea = actionsForVasea(app);
	var pending = vasea.listPendingVacationRequests();
	assert.ok(pending.length > 0);
	var id = pending[0].id;
	vasea.cancelVacationRequest(id);
}

function joraSubmitsVacationRequest(assert, app, start, end) {
	var  jora = actionsForJora(app);
	return jora.submitVacationRequest(start, end);
}

function vaseaSeesRecords(assert, app, pending, accepted, rejected) {
	var vasea = actionsForVasea(app);
	assert.ok( vasea.listPendingVacationRequests().length === pending);
	assert.ok( vasea.listRejectedVacationRequests().length === rejected);
	assert.ok( vasea.listAcceptedVacationRequests().length === accepted);
}

function joraSeesRecords(assert, app, pending, accepted, rejected) {
	var jora = actionsForJora(app);
	assert.ok( jora.listPendingVacationRequests().length === pending);
	assert.ok( jora.listRejectedVacationRequests().length === rejected);
	assert.ok( jora.listAcceptedVacationRequests().length === accepted);
}

function managerSeesRecords(assert, app, pending, accepted, rejected) {
	var manager = actionsForManager(app);
	assert.ok( manager.listPendingVacationRequests().length === pending);
	assert.ok( manager.listRejectedVacationRequests().length === rejected);
	assert.ok( manager.listAcceptedVacationRequests().length === accepted);
}

function managerAcceptsVaseasRequest(assert, app) {
	var vasea = actionsForVasea(app);
	managerAcceptsVacationRequestForUser(assert, app, vasea.user);
}
function managerAcceptsJorasRequest(assert, app) {
	var jora = actionsForJora(app);
	managerAcceptsVacationRequestForUser(assert, app, jora.user);
}

function managerRejectsVaseasRequest(assert, app) {
	var manager = actionsForManager(app);
	var pending = manager.listPendingVacationRequests();
	assert.ok ( pending.length > 0);
	var req = pending[0];
	manager.rejectVacationRequest(req.id);
}

function createApp() {
	var persistence = new InMemoryPersistenceService();
	return new VacationBookingApp(persistence, userAuthList);
}

function isNotNull(assert, app) {
	assert.ok (typeof app !== "undefined", "Application created");
}

QUnit.test( "User can submit and cancel vacation requests", function( assert ) {
  var app = createApp();
  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 0);

assert.throws ( function() { jora.cancelVacationRequest(0); }, "Can not cancel non-existent request");
  vaseaSubmitsVacationRequest(assert, app, new Date(), new Date());

assert.throws ( function() { vasea.cancelVacationRequest(1); }, "Can not cancel wrong request");
  vaseaSeesRecords(assert, app, 1, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 1, 0, 0);

  vaseaCancelsVacationRequest(assert, app);

  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 0);
});

QUnit.test( "User can submit multiple vacation requests", function( assert ) {
  var app = createApp();
  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 0);
  joraSubmitsVacationRequest(assert, app, new Date(), new Date());
  joraSubmitsVacationRequest(assert, app, new Date(), new Date());
  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 2, 0, 0);
  managerSeesRecords(assert, app, 2, 0, 0);
});

QUnit.test( "Manager can reject vacation request", function( assert ) {
  var app = createApp();
  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 0);

  vaseaSubmitsVacationRequest(assert, app, new Date(), new Date());

  vaseaSeesRecords(assert, app, 1, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 1, 0, 0);

  managerRejectsVaseasRequest(assert, app);

  vaseaSeesRecords(assert, app, 0, 0, 1);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 1);
});

QUnit.test( "Manager can accept vacation request", function( assert ) {
  var app = createApp();
  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 0);

  joraSubmitsVacationRequest(assert, app, new Date(), new Date());

  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 1, 0, 0);
  managerSeesRecords(assert, app, 1, 0, 0);

  managerAcceptsJorasRequest(assert, app);

  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 0, 1, 0);
  managerSeesRecords(assert, app, 0, 1, 0);
});

QUnit.test( "Manager can see and accept multiple requests", function( assert ) {
  var app = createApp();
  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 0);

  joraSubmitsVacationRequest(assert, app, new Date(), new Date());

  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 1, 0, 0);
  managerSeesRecords(assert, app, 1, 0, 0);

  vaseaSubmitsVacationRequest(assert, app, new Date(), new Date());
  vaseaSeesRecords(assert, app, 1, 0, 0);
  joraSeesRecords(assert, app, 1, 0, 0);
  managerSeesRecords(assert, app, 2, 0, 0);
  
  managerAcceptsJorasRequest(assert, app);

  vaseaSeesRecords(assert, app, 1, 0, 0);
  joraSeesRecords(assert, app, 0, 1, 0);
  managerSeesRecords(assert, app, 1, 1, 0);

  managerAcceptsVaseasRequest(assert, app);

  vaseaSeesRecords(assert, app, 0, 1, 0);
  joraSeesRecords(assert, app, 0, 1, 0);
  managerSeesRecords(assert, app, 0, 2, 0);
});

QUnit.test( "App can have multiple validators", function( assert ) {
	var validator = new Validator("validator", function(records, date1, date2) {
		return false;
	});
  var app = createApp();
  app.addValidator(validator);
  isNotNull(assert, app);
  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 0);
  var failMessages = joraSubmitsVacationRequest(assert, app, new Date(), new Date());
  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 1, 0, 0);
  managerSeesRecords(assert, app, 1, 0, 0);
});

QUnit.test( "Accepted vacation request can not be accepted or rejected", function( assert ) {
    var app = createApp();
    var vasea = actionsForVasea(app);
    vasea.submitVacationRequest(new Date(), new Date());
    var manager = actionsForManager(app);
    assert.throws( function() { manager.cancelVacationRequest(0); }, "Can not cancel a not accepted request");
    managerAcceptsVacationRequestForUser(assert, app, vasea.user);
    assert.throws( function() { manager.acceptVacationRequest(0); }, "Can not accept accepted request");
    assert.throws( function() { manager.rejectVacationRequest(0); }, "Can not reject accepted request");
});

QUnit.test( "App can have multiple validators", function( assert ) {
    var validator1 = new Validator("test 1", function(records, date1, date2) {
    	return true;
    });
    var validator2 = new Validator("test 2", function(records, date1, date2) {
    	return true;
    });
  var app = createApp();
  app.addValidator(validator1);
  app.addValidator(validator2);
  isNotNull(assert, app);
  vaseaSeesRecords(assert, app, 0, 0, 0);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 0);
  var failMessages = joraSubmitsVacationRequest(assert, app, new Date(), new Date());
  assert.ok (failMessages.length === 2, "Received two validation messages");
});

QUnit.test( "Overlapping dates validator", function( assert ) {
    var overlappingDatesValidator = new Validator("test 1", function(existingArr, start, end) {
    	var conflictingDates = existingArr.filter(function(item){
    		return !(start > item.endDate || end < item.startDate);
    	});
    	return conflictingDates.length > 0;
    });
  var app = createApp();
  app.addValidator(overlappingDatesValidator);
  isNotNull(assert, app);
  joraSeesRecords(assert, app, 0, 0, 0);
  managerSeesRecords(assert, app, 0, 0, 0);
  var failMessages = joraSubmitsVacationRequest(assert, app, new Date("2015-03-25"), new Date("2015-03-28"));
  assert.ok (failMessages.length === 0, "First vacation should work");
  joraSeesRecords(assert, app, 1, 0, 0);
  managerSeesRecords(assert, app, 1, 0, 0);
  var failMessages = joraSubmitsVacationRequest(assert, app, new Date("2015-03-15"), new Date("2015-03-22"));
  assert.ok (failMessages.length === 0, "Non-overlapping vacation should work");
  joraSeesRecords(assert, app, 2, 0, 0);
  managerSeesRecords(assert, app, 2, 0, 0);
  var failMessages = joraSubmitsVacationRequest(assert, app, new Date("2015-03-13"), new Date("2015-03-16"));
  assert.ok (failMessages.length === 1, "Validation failed as expected");
  joraSeesRecords(assert, app, 2, 0, 0);
  managerSeesRecords(assert, app, 2, 0, 0);
  var failMessages = joraSubmitsVacationRequest(assert, app, new Date("2015-03-16"), new Date("2015-03-17"));
  assert.ok (failMessages.length === 1, "Validation failed as expected");
  joraSeesRecords(assert, app, 2, 0, 0);
  managerSeesRecords(assert, app, 2, 0, 0);
  var failMessages = joraSubmitsVacationRequest(assert, app, new Date("2015-03-28"), new Date("2015-03-29"));
  assert.ok (failMessages.length === 1, "Validation failed as expected");
  joraSeesRecords(assert, app, 2, 0, 0);
  managerSeesRecords(assert, app, 2, 0, 0);
});