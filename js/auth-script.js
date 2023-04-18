
//module-level vars
var credentialsUrl = "resources/credentials.json";
var credentialsArray;

//add submit event listener
function addSubmitListener(){

	document.querySelector("#submit").addEventListener("click", function (event) { 

	  //get form values
		var user = {};
		user.email = document.querySelector("#email").value;
		user.password = document.querySelector("#pwd").value;

		//check for a credential match
		var index = credentialsArray.findIndex(function(val, idx, arr){

	  	return val.email === user.email && val.password === user.password;
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

//get credentials
function getLoginCredentials(){

	// Ajax call to get and use resource content
  $ajaxUtils.sendGetRequest(
    credentialsUrl,
    function (credentialsJson) {

    	//set module-level var
    	credentialsArray = credentialsJson;

      console.log("Credentials loaded!", credentialsArray);

    },
    true); // 'True' here to parse as JSON resource 
};



// On page load - before images or CSS 
$(function () { // Same as document.addEventListener("DOMContentLoaded"...

  //async call to get the auth object
	credentialsArray = getLoginCredentials();
    

  //then enable the submit button
	addSubmitListener();

    
  });  

