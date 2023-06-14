
//module-level vars
let credentialsUrl = "http://localhost:5000/api/auth/";
let tokenGeneratorUrl = "http://localhost:5000/api/auth/get-token/";
let canvasElement;
var answer = 0;
var isHuman = false;
const maxTries = 2;
var countTries = 0;


function resetCanvas(){
    console.log("Resetting challenge");

    let num1 = Math.round(Math.random() * 6) + 3;
    let num2 = Math.round(Math.random() * 5) + 1;
    answer = num1 + num2;

    let challengeStr = num1 + " + " + num2;
    // console.log(challengeStr, answer);

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
            document.querySelector("#securityOutcome").style = "color:red;";
            document.querySelector("#securityOutcome").innerHTML = "Input is incorrect. Try again.";
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
    document.querySelector("#securityOutcome").innerHTML = "";

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
function createParamsToken(userid, username){


    // //format 1: d1,d2,d3,m1,m2,m3,m4,name1-12
    // //format 2: rl,N7,rl,N3,rl,N6,m1,m2,m3,m4,rn,N5,N9,rl,N2,rl,d1,d2,d3,rl,N4,N1,rl,N8,rl,N10,rl,rl,N11,rl,N12,rl,rn,rn
    // //get days and minutes
    // let d = new Date();
    // let minsToday = d.getMinutes() + (d.getHours() * 60);
    // let dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    // return "?" + dayOfYear + "|" + minsToday + "|" + id + "|" + username;

    //Post user details to generate token
    const pst =  new Promise((resolve) => {

        // Create an XMLHttpRequest object
        const xhttp = new XMLHttpRequest();

        // The callback function
        xhttp.onload = function() {
          
            if(this.status == 200){
                let token = this.responseText;
                console.log("Token - ", token);

                //open target page with token
                window.location.assign('questions.html' + '?' + token); 
                // console.log("open page  - ", 'questions.html' + '?' + token);

            }
            else{
                //other error type
                alert("Token generator API call error - status: " + this.status);

            };

            //resolve promise
            resolve();
          
        }; //end onload function

        //form up the credentials payload
        const userPayload = {
            id: userid,
            name: username
        };

        // Post the request
        xhttp.open("POST", tokenGeneratorUrl);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(userPayload));

    }); //end Promise





    
};


//add submit event listener - called after credentials loaded
function addSubmitListener(){

    document.querySelector("#submit").addEventListener("click", function (event) { 

        //check for valid security check (CAPTCHA)
        if(! isHuman){
            document.querySelector("#securityOutcome").style = "color:red;"
            document.querySelector("#securityOutcome").innerHTML = "Security check required."
            return; //exit
        };

        //Post credentials async for authentication
        const pst =  new Promise((resolve) => {

            // Create an XMLHttpRequest object
            const xhttp = new XMLHttpRequest();

            // The callback function
            xhttp.onload = function() {
              
                if(this.status == 200){
                    const userObj = JSON.parse(this.responseText);
                    console.log("Authenticated user - ", userObj);

                    //create authentication token here for security management
                    console.log(userObj.name);
                    // let token = createParamsToken(userObj.id, userObj.name) ;
                    createParamsToken(userObj.id, userObj.name) ;
                    // console.log(token);
                    
                    // //open target page with token
                    // window.location.assign('questions.html' + '?' + token); 

                }
                else if(this.status == 401){
                    // display error message  
                    alert("Authentication error - the email & password combination provided does not exist!");

                    document.querySelector("#email").value = "";
                    document.querySelector("#pwd").value = "";
                    document.querySelector("#email").focus();
                }
                else{
                    //other error type
                    alert("API call error - status: " + this.status);

                };

                //resolve promise
                resolve();
              
            }; //end onload function

            //form up the credentials payload
            const credPayload = {
                email: document.querySelector("#email").value.toLowerCase().trim(),
                password: document.querySelector("#pwd").value.trim()
            };

            // Post the request
            xhttp.open("POST", credentialsUrl);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify(credPayload));

        }); //end Promise

    }); //end addEventListener
};



// On page load - before images or CSS 
$(function () { // Same as document.addEventListener("DOMContentLoaded"...

    //enable the submit button
    addSubmitListener();

    //set canvas
    canvasElement = document.querySelector("#mathCanvas");
    resetCanvas();

    
  });  

