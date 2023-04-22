

//module-level vars
var credentialsUrl = "resources/credentials.json";
var credentialsArray;
var canvasElement;
var answer = 0;
var isHuman = false;
const maxTries = 2;
var countTries = 0;

//add submit event listener - called after credentials loaded
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

        //check for valid security check
        if(! isHuman){
            document.querySelector("#securityOutcome").style = "color:red;"
            document.querySelector("#securityOutcome").innerHTML = "Security check required."
            return; //exit
        };

        //open the target page if id & password match
		if (index !== -1) {
            
            //create authentication token here for security management
            console.log(credentialsArray[index].name);
            let token = createParamsToken(credentialsArray[index].name);
            console.log(token);
            //open with token
            window.open('questions.html' + token); //opens the target page if id & password match
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


function resetCanvas(){
    console.log("Resetting challenge");

    let num1 = Math.round(Math.random() * 6) + 3;
    let num2 = Math.round(Math.random() * 5) + 1;
    answer = num1 + num2;

    let challengeStr = num1 + " + " + num2;
    console.log(challengeStr, answer);

    var ctx = canvasElement.getContext("2d");
    ctx.scale(1, 1);
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.font = "18px Arial italics";
    ctx.strokeText(challengeStr, 20, 20);
};

function checkChallenge(){

    //do nothing if check has already passed
    if(isHuman) return;

    //increment tries
    countTries++;

    //get input and check
    let userInput = document.querySelector("#securityInput").value;
    userInput = Math.trunc(Number(userInput));

    if(userInput == answer){
        isHuman = true;

        //show success msg
        document.querySelector("#securityOutcome").style = "color:green;"
        document.querySelector("#securityOutcome").innerHTML = "Check succeeded!"

        //disable input box and buttons
        document.querySelector("#checkBtn").style.color = "gray"
        document.querySelector("#resetBtn").style = "color:gray;"
        document.querySelector("#securityInput").disabled = true;
    }
    else{
        //fail condition
        isHuman = false;

        //check tries
        if(countTries > maxTries){
            alert("Security check failed. Resetting challenge.");
            resetChallenge();
        }
        else{
            //show fail msg
            document.querySelector("#securityOutcome").style = "color:red;"
            document.querySelector("#securityOutcome").innerHTML = "Input is incorrect. Try again."
            document.querySelector("#securityInput").focus();
        }
    }
};

function resetChallenge(){

    //do nothing if check has already passed
    if(isHuman) return;

    //ensure "check" button has text
    countTries = 0;
    // let checkBtn = document.querySelector("#checkBtn");
    // checkBtn.value = "Check";
    // checkBtn.style = 'font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;';

    //clear input box
    document.querySelector("#securityInput").value = "";

    //reset canvas
    resetCanvas();
};

//UX candy to clear error message on input
document.querySelector("#securityInput").addEventListener("keydown", function (event) { 

    //if an attempt has been made, there should be a meesage.  Remove it.
    if(countTries > 0){
    document.querySelector("#securityOutcome").innerHTML = " ";
    }

});

//form up the parameter token for the main page.
function createParamsToken(username){

    //format 1: d1,d2,d3,m1,m2,m3,m4,name1-12
    //format 2: rl,N7,rl,N3,rl,N6,m1,m2,m3,m4,rn,N5,N9,rl,N2,rl,d1,d2,d3,rl,N4,N1,rl,N8,rl,N10,rl,rl,N11,rl,N12,rl,rn,rn
    //get days and minutes
    let d = new Date();
    console.log(d);
    let minsToday = d.getMinutes() + (d.getHours() *60 );
    let dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    let d2 = new Date(d.getFullYear(), 0, 1, 2, 15);
    console.log(d2);
    let minsToday2 = d2.getMinutes() + (d2.getHours() *60 );
    let dayOfYear2 = Math.floor((d2 - new Date(d2.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    console.log("test mins (135): " + minsToday2);
    console.log("test days (33): " + dayOfYear2);

    return "?" + dayOfYear + "|" + minsToday + "|" + username;
    
}



// On page load - before images or CSS 
$(function () { // Same as document.addEventListener("DOMContentLoaded"...

    //async call to get the auth object
	credentialsArray = getLoginCredentials();
    

    //then enable the submit button
    addSubmitListener();

    //set canvas
    canvasElement = document.querySelector("#mathCanvas");
    resetCanvas();

    
  });  

