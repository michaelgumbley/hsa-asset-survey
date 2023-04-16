
// var users = [{
//   username: 'admin',
//   password: 'abc123'
// },{
//   username: 'user1',
//   password: '321cba'
// }];

// var index = users.indexof(function (user) {
//   return users.username === user.username &&
//   users.password === user.password;
// })

// if (index !== -1) {
//   window.open('dashboard.html')/*opens the target page while Id & password matches*/
// }
// else {
//   alert("Error Password or Username"
// )/*displays error message*/

var users = [];

//add submit event listener
function addSubmitListener(){

	document.querySelector("#submit").addEventListener("click", function (event) { 

	  //get form values
		var user = {};
		user.username = document.querySelector("#email").value;
		user.password = document.querySelector("#pwd").value;

		//check for a credential match
		var index = users.findIndex(function(val, idx, arr){

	  	return val.username === user.username && val.password === user.password;
		});

		if (index !== -1) {
			//TO DO: create authentication token here for security management
		  window.open('questions.html'); //opens the target page if id & password match
		}
		else {
		  alert("Username or password error!");/*display error message*/
		  document.querySelector("#email").value = "";
		  document.querySelector("#pwd").value = "";
		  document.querySelector("#email").focus();

		};


	});
}





// On page load - before images or CSS 
$(function () { // Same as document.addEventListener("DOMContentLoaded"...

    //async call to get the auth object
    
    users = [{
	  username: 'mike',
	  password: 'qwe123'
	},{
	  username: 'user1',
	  password: '321cba'
	}];

    //then enable the submit button
	addSubmitListener();

    
  });  

