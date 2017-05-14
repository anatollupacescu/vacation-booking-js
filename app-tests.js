//App tests
/*
Use cases:

As a user I want to be able to :
	- submit a time period
	- see my submitted periods.
	- remove a previously submited period from the list awaiting approval.
	- see an error if the starting date is in the past.
	- see an error if the end date is in the past.
	- see an error if the start date is later than the end date.
	- see an error if the period is less than 1 day.
	- see an error if the period overlaps a previously submitted period.
*Mentions*
On top of my page I want to see a form that would allow me to pick a starting and ending date of my vacation
with a button to submit it.
Bellow the form I want to see a list of my previously submitted time periods divesed in three compartments:
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
*Mentions*
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
	
*/

QUnit.test( "Testing app from the user's perspective", function( assert ) {
  var app = new VacationBookingApp('lolo', new InMemoryPersistenceService());
  assert.ok( app.name == "lolo", "App name is set correctly" );
  assert.ok( app.isCool === true, "App flag default value is correct");
  var jora = 'jora';
  var record = new Record(jora, new Date(), new Date(), StatusEnum.AWAITING_DECISION);
  app.requestVacation(record);
  assert.ok( app.listRequestsFromUser('iura').equals([]), "Vacation request is registered for the correct user");
  assert.ok( app.listRequestsFromUser(jora).equals([record]), "Vacation request registered correctly");
});
