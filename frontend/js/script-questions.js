//Module-level Variables
// const urlDomain = "http://localhost:5000"; //dev
const urlDomain = "https://hsa-survey-70c4965b0531.herokuapp.com"; //prod
const savedDataUrlStub = urlDomain + "/api/user-data/"; 
const checkTokenUrl = urlDomain + "/api/auth/check-token";
$hsa = {};
$hsa.authenticated = false;
$hsa.q1 = {};
$hsa.q2 = {};
$hsa.q3 = {};
// $hsa.q1.lastRowNum = 0; //needed?
// $hsa.q2.lastRowNum = 0; //needed?
// $hsa.q3.lastRowNum = 0; //needed?
$hsa.lastSavedIdx = -1;
let savedDataUrl = "";


// ***** IFFE SETUP CODE ***** //
(function (global) { 
	//immediately-invoked function: executes immediately, and only once, then kills local resources

	//SETUP STEP 0 - Set vars
  const q1RowHtmlUrl = "snippets/q1-row-snippet.html";
  const q2RowHtmlUrl = "snippets/q2-row-snippet.html";
  const q3RowHtmlUrl = "snippets/q3-row-snippet.html";
  // const savedDataUrl = "resources/saved-data.json";

  //SETUP STEP 1 - Get resourses 

	//Get Q1 snippet content
	const s1 = new Promise((resolve) => {
		//ajax call
		$ajaxUtils.sendGetRequest(
	    q1RowHtmlUrl,
	    function (snippetHtml) {
	      //save snippet to resources object
	      $hsa.q1.rowHtml = snippetHtml;
	      //resolve promise
	      resolve(); 
	    },
	    false); // False here for regular HTML from the server(no need to process JSON).
	});

	//Get Q2 snippet content
	const s2 = new Promise((resolve) => {
		//ajax call
		$ajaxUtils.sendGetRequest(
	    q2RowHtmlUrl,
	    function (snippetHtml) {
	      //save snippet to resources object
	      $hsa.q2.rowHtml = snippetHtml;
	      //resolve promise
	      resolve();
	    },
	    false); 
	});

	//Get Q3 snippet content
	const s3 = new Promise((resolve) => {
		//ajax call
		$ajaxUtils.sendGetRequest(
	    q3RowHtmlUrl, 
	    function (snippetHtml) {
	      //save snippet to resources object
	      $hsa.q3.rowHtml = snippetHtml;
	      //resolve promise
	      resolve();
	    },
	    false); 
	});

  //Post to check authentication
  const auth =  new Promise((resolve) => {

    // Create an XMLHttpRequest object
    const xhttp = new XMLHttpRequest();

    // The callback function
    xhttp.onload = function() {
      
      if(this.status == 200){
        let userObj = JSON.parse(this.responseText);
        console.log("Returned - ", JSON.stringify(userObj));

        //save authenticated user info
        $hsa.userid = userObj.id;
        $hsa.username = userObj.name;
        $hsa.authenticated = true;

        //Set welcomeStmt
        document.querySelector("#welcomeStmt").innerHTML = 
        "<p>Hi " + $hsa.username + ", thank you for taking the time to answer this survey.</p>";
      }
      else if(this.status == 401){
        //authentication issue
        alert("Error: " + this.responseText);
        $hsa.userid = 0;
      }
      else{
        //other error type
        alert("Check-token API call error - status: " + this.status);
        $hsa.userid = 0;
      };

      //resolve promise
      resolve();
      
    }; //end onload function

    //form up the token payload
    const tokenString = window.location.search.slice(1);  //queryString minus the "?"
    const tokenPayload = {
        token: tokenString
    };

    // Post the request
    xhttp.open("POST", checkTokenUrl);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(tokenPayload));

  }); //end Promise

  

	//Once all resources have been loaded
  Promise.all([s1, s2, s3, auth])
	.then(result => loadSavedData())
	.catch(err => console.log('Error:', err.message));


  //async function to retrieve saved data before calling checkDOMReadyState()
  async function loadSavedData(){

    //Get saved data - server API solution
    const sdPromise =  new Promise((resolve) => {

      // Create an XMLHttpRequest object
      const xhttp = new XMLHttpRequest();

      // The callback function
      xhttp.onload = function() {
        try{
          //get responseText
          let responseText = this.responseText;

          // Check for valid response
          if(responseText == ""){
            console.log("Defaulting return data");
            responseText = '{ "q1": [], "q2": [], "q3": [] }';
          };
          // Use the returned Data
          const jsonObject = JSON.parse(responseText);
          $hsa.allResponses = jsonObject; //by user
          console.log("API Loaded Data - ", jsonObject);
        }
        catch(err){
          console.log("Caught the async error!");
          throw(err);
        };

        //resolve promise
        resolve();
        console.log("GET resolved");
        
      };
      
      //construct the URL
      savedDataUrl = savedDataUrlStub + $hsa.userid.toString();
      console.log(savedDataUrl);

      // Send the request
      xhttp.open("GET", savedDataUrl);
      xhttp.send();
      
    }); //end promise

    sdPromise
    .then(result => checkDOMReadyState())
    .catch(err => console.log('Error retrieving data:', err.message));

  };


	function checkDOMReadyState(){

		if (document.readyState == 'loading') { //i.e. not 'interactive' or 'complete'
		  // still loading, wait for the event
		  console.log("DOM still loading")
		  document.addEventListener('DOMContentLoaded', finaliseSetup);
		} 
		else {
		  // DOM is ready!
		  console.log("DOM is ready!")
		  finaliseSetup();
		};

	};

	//SETUP STEP 2 - FINALISATION - called from checkDOMReadyState() after all resources are loaded
	function finaliseSetup(){

		console.log("Finalising Setup!!!");
    console.log("Authenticated = " + $hsa.authenticated);

    //confirm authentication
    if(!$hsa.authenticated){
      //Repace inner html with authentication issue msg
      document.querySelector("#survey-container").innerHTML = 
        "<h3>Authentication issue!</h3><h4>Please return to the <a href='index.html'>login page</a> to reauthenticate</h4>";

      //stop further execution
      return;
    }

    //LOAD Q1
    // add required rows
    $hsa.q1.lastRowNum = 0;
    let q1RowsNeeded = $hsa.allResponses.q1.length + 1;
    
    console.log("Q1rowsNeeded = " + q1RowsNeeded);

    while ($hsa.q1.lastRowNum < q1RowsNeeded){
      //increment last row
      $hsa.q1.lastRowNum++;

      console.log("Adding Q1 response row " + $hsa.q1.lastRowNum + " for filling.");
      //add it
      buildNewRowHtml ("q1");
    };

    //LOAD Q2
    // add required rows
    $hsa.q2.lastRowNum = 0;
    let q2RowsNeeded = $hsa.allResponses.q2.length + 1;
    
    console.log("Q2rowsNeeded = " + q2RowsNeeded);

    while ($hsa.q2.lastRowNum < q2RowsNeeded){
      //increment last row
      $hsa.q2.lastRowNum++; 

      console.log("Adding Q2 response row " + $hsa.q2.lastRowNum + " for filling.");
      //add it
      buildNewRowHtml ("q2");
    };

    //LOAD Q3
    // add required rows
    $hsa.q3.lastRowNum = 0;
    let q3RowsNeeded = $hsa.allResponses.q3.length + 1;
    
    console.log("Q3rowsNeeded = " + q3RowsNeeded);

    while ($hsa.q3.lastRowNum < q3RowsNeeded){
      //increment last row
      $hsa.q3.lastRowNum++;

      console.log("Adding Q3 response row " + $hsa.q3.lastRowNum + " for filling.");
      //add it 
      buildNewRowHtml ("q3");
    };

    //fill the rows
    fillResponses();


	};

	// //CHECK AUTHENTICATION called from "get saved data" code once per page load, after DOM loaded
	// function checkAuthentication(){
  //   // try{
  //   //   //check authentication
  //   //   const queryString = window.location.search;
  //   //   console.log(queryString);
  //   //   let params = queryString.slice(1).split("|");
  //   //   let d = new Date();
  //   //   let minsToday = d.getMinutes() + (d.getHours() * 60);
  //   //   let dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

  //   //   if(dayOfYear == params[0] && minsToday >= params[1] && minsToday < (params[1] +30)){ //keep valid for 30 mins
  //   //     console.log("check auth - name: " + params[3] + "  id: " + params[2]);
  //   //     //set id & username
  //   //     $hsa.userid = params[2];
  //   //     $hsa.username = params[3];

  //   //     if($hsa.userid != undefined && $hsa.username != undefined){
  //   //       //all is well
  //   //       $hsa.authenticated = true;

  //   //       //Set welcomeStmt
  //   //       document.querySelector("#welcomeStmt").innerHTML = 
  //   //         "<p>Hi " + $hsa.username + ", thank you for taking the time to answer this survey.</p>";
  //   //     };
        
  //   //   }
  //   //   else{
  //   //     console.log("Authentication issues! " + dayOfYear + " " + params[0] + " | " +  minsToday + " " +  params[1]);
  //   //     //set uid to non-errorring value
  //   //     $hsa.userid = 0;
  //   //   };

  //   // }
  //   // catch(err){
  //   //   //set uid to non-errorring value
  //   //   $hsa.userid = 0;
  //   // };

    

  //   //Post to check authentication
  //   const auth =  new Promise((resolve) => {

  //       // Create an XMLHttpRequest object
  //       const xhttp = new XMLHttpRequest();

  //       // The callback function
  //       xhttp.onload = function() {
          
  //           if(this.status == 200){
  //               let userObj = JSON.parse(this.responseText);
  //               console.log("Returned - ", userObj.stringify());

  //               //save authenticated user info
  //               $hsa.userid = userObj.id;
  //               $hsa.username = userObj.name;
  //               $hsa.authenticated = true;

  //               //Set welcomeStmt
  //               document.querySelector("#welcomeStmt").innerHTML = 
  //               "<p>Hi " + $hsa.username + ", thank you for taking the time to answer this survey.</p>";
  //           }
  //           else if(this.status == 401){
  //             //authentication issue
  //             alert("Error: " + this.responseText);

  //           }
  //           else{
  //               //other error type
  //               alert("Check-token API call error - status: " + this.status);

  //           };

  //           //resolve promise
  //           resolve();
          
  //       }; //end onload function

  //       //form up the token payload
  //       const tokenString = window.location.search.slice(1);  //queryString minus the "?"
  //       const tokenPayload = {
  //           token: tokenString
  //       };

  //       // Post the request
  //       xhttp.open("POST", checkTokenUrl);
  //       xhttp.setRequestHeader("Content-type", "application/json");
  //       xhttp.send(JSON.stringify(tokenPayload));

  //   }); //end Promise
    
  // };



})(window);  //END OF SET UP - end IFFE 



// ***** CORE PAGE LOGIC FUNCTIONS ***** //

//function to add dynamic NewRowBtnListener to new buttons - assumes targetSelector contains "AddRowBtn" pattern
function addNewRowBtnListener(targetSelector, questionId){

  questionId = questionId.toLowerCase();
  targetSelector = hashPrefix(targetSelector, true);
  document.querySelector(targetSelector).addEventListener("click", function (event) { 
    console.log(targetSelector + " Click dynamic event!");

    //increment last row
    $hsa[questionId].lastRowNum++;

    //now add it
    buildNewRowHtml (questionId);

    //refill the data                                                                 
    fillResponses();

  });
}


// Function to Build HTML response rows
function buildNewRowHtml (questionId) {

  questionId = questionId.toLowerCase();
  let snippetHtml = $hsa[questionId].rowHtml;
  let newRowNum = $hsa[questionId].lastRowNum;
  let destSelector = "#" + questionId + "InputRows";
  let addNewRowBtnIdPrefix = questionId + "AddRowBtn";

  //STEP 1: substitute now row numbers
  var htmlToAppend = substituteValue(snippetHtml, "RowNum", newRowNum);

  // STEP 2: Insert the produced HTML into the page
  appendHtml(destSelector, htmlToAppend);

  // STEP 3: hack to hide previous New Row button
  var htmlText = document.querySelector(destSelector).innerHTML;
  var textToReplace = addNewRowBtnIdPrefix + (newRowNum - 1) + '"';
  var subValue = textToReplace + ' hidden';
  var newHtml = htmlText.replace(new RegExp(textToReplace, "g"), subValue);
  document.querySelector(destSelector).innerHTML = newHtml;

  // STEP 4: add dynamic listener
  var btnSelector = addNewRowBtnIdPrefix + newRowNum; 
  addNewRowBtnListener(btnSelector, questionId);
    
};


//function to fill the existing responses into the grids
function fillResponses(){

  //Q1 loop
  const q1RespObjArray = $hsa.allResponses.q1;
  var q1ResponseLine = 0;
  console.log("fillQ1Responses");

  for (let i = 0; i < q1RespObjArray.length; i++){  //standard loop for arrays!
    //new response line
    q1ResponseLine++;

    //add response row if needed 
    if ($hsa.q1.lastRowNum < q1ResponseLine){
      console.log("Adding Q1 response row for filling.");
      buildNewRowHtml ("q1");
      $hsa.q1.lastRowNum++;
    };


    //fill row
    document.querySelector("#q1Device" + q1ResponseLine).value = q1RespObjArray[i].device; 
    document.querySelector("#q1Owner" + q1ResponseLine).value = q1RespObjArray[i].owner;

  }; //end loop

  //TODO: Q2 loop
  const q2RespObjArray = $hsa.allResponses.q2;
  var q2ResponseLine = 0;
  console.log("fillQ2Responses");

  for (let i = 0; i < q2RespObjArray.length; i++){  //standard loop for arrays!
    //new response line
    q2ResponseLine++;

    //add response row if needed 
    if ($hsa.q2.lastRowNum < q2ResponseLine){
      console.log("Adding Q2 response row for filling.");
      buildNewRowHtml ("q2");
      $hsa.q2.lastRowNum++;
    };


    //fill row
    document.querySelector("#q2App" + q2ResponseLine).value = q2RespObjArray[i].app; 
    document.querySelector("#q2Owner" + q2ResponseLine).value = q2RespObjArray[i].owner;
    document.querySelector("#q2Usage" + q2ResponseLine).value = q2RespObjArray[i].usage;

  }; //end loop

  //Q3 loop
  const q3RespObjArray = $hsa.allResponses.q3;
  var q3ResponseLine = 0;
  console.log("fillQ3Responses");

  for (let i = 0; i < q3RespObjArray.length; i++){  //standard loop for arrays!
    //new response line
    q3ResponseLine++;

    //add response row if needed 
    if ($hsa.q3.lastRowNum < q3ResponseLine){
      console.log("Adding Q3 response row for filling.");
      buildNewRowHtml ("q3");
      $hsa.q3.lastRowNum++;
    };

    //fill row
    document.querySelector("#q3Dataset" + q3ResponseLine).value = q3RespObjArray[i].dataset; 
    document.querySelector("#q3Description" + q3ResponseLine).value = q3RespObjArray[i].description;

  }; //end loop


};



//function to gather responses into a JSON object (on save or submit)
function gatherResponses(forceSave = false){

  const allResponses = {q1: [], q2: [], q3: [] };

  console.log("gatherResponses - force save = " + forceSave);

  //Q1 loop
  for (let i = 1; i <= $hsa.q1.lastRowNum; i++) {

    let deviceId = "device" + i; 
    let deviceVal = document.querySelector("#q1Device" + i).value;
    let ownerVal = document.querySelector("#q1Owner" + i).value;

    //add if not empty
    if((deviceVal + ownerVal).trim().length > 0 ){
      //add to allResponses
      allResponses.q1.push( {device: deviceVal.trim(), owner: ownerVal.trim()} );
    };
  }; //end for

  //Q2 loop
  for (let i = 1; i <= $hsa.q2.lastRowNum; i++) {

    let appId = "app" + i; 
    let appVal = document.querySelector("#q2App" + i).value;
    let ownerVal = document.querySelector("#q2Owner" + i).value;
    let usageVal = document.querySelector("#q2Usage" + i).value;

    //add if not empty
    if((appVal + ownerVal + usageVal).trim().length > 0 ){
      //add to allResponses
      allResponses.q2.push( {app: appVal.trim(), owner: ownerVal.trim(), usage: usageVal.trim()} );
    };
  }; //end for

  //Q3 loop
  for (let i = 1; i <= $hsa.q3.lastRowNum; i++) {

    let datasetId = "dataset" + i; 
    let datasetVal = document.querySelector("#q3Dataset" + i).value;
    let descriptionVal = document.querySelector("#q3Description" + i).value;

    //add if not empty
    if((datasetVal + descriptionVal).trim().length > 0 ){
      //add to allResponses
      allResponses.q3.push( {dataset: datasetVal.trim(), description: descriptionVal.trim()} );
    };
  }; //end for


  //add to object instance
  $hsa.allResponses = allResponses;

  console.log("Gathered data: ", allResponses);

  //Save to the server if more than a minute has passed OR forceSave is true
  let currentMinute = new Date().getMinutes();
  if(currentMinute != $hsa.lastSavedIdx || forceSave){ 
    saveUserData();
    $hsa.lastSavedIdx = currentMinute;
  };

};

//Function to Post data - WEB SERVER SOLUTION        
function saveUserData(){

  //Post async
  const pst =  new Promise((resolve) => {

    // Create an XMLHttpRequest object
    const xhttp = new XMLHttpRequest();

    // The callback function
    xhttp.onload = function() {
      
      const jsonObject = JSON.parse(this.responseText);
      console.log("Data saved remotely - ", jsonObject);

      //resolve promise
      resolve();
      
    };

    // Post the request
    xhttp.open("POST", savedDataUrl);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify($hsa.allResponses));

  });

};

//function to handle the sumbit button click
function submitForm(){
  console.log("Form submitting!");

  if (confirm("Please confirm if you are happy to submit this survey")) {

    //gather and force save
    gatherResponses(true); 
    //navigate to final page
    window.location.assign("final.html");
  } 
  else {
    //do nothing
  };


};

//function to handle the save button click
function saveForm(){
  console.log("Form saving!");

  //gather and force save
  gatherResponses(true); 

  alert("Form data saved for later. You can safely navigate away.")

};



// ***** CONVENIENCE FUNCTIONS ***** //

// function for inserting innerHTML
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  //set
  targetElem.innerHTML = html;
};

// function for appending HTML to innerHTML
var appendHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  var currentHtml = targetElem.innerHTML;
  //replace
  targetElem.innerHTML = currentHtml + html;
};

//function to ensure a 'Hash' prefix is explicitly included where it's needed and not anywhere else
var hashPrefix = function (selector, includeHash){
  var returnVal = "";
  if(includeHash){  //needs hash prefix
    if(selector.charAt(0) == "#")
      returnVal = selector;
    else
      returnVal = "#" + selector;
  }
  else{ //no hash please
    if(selector.charAt(0) == "#")
      returnVal = selector.slice(1);
    else
      returnVal = selector;
  };
  //return
  return returnVal;
};


// function to substitute '{{subLocator}}' with subValue within 'inString'
var substituteValue = function (inString, subLocator, subValue) {
  var textToReplace = "{{" + subLocator + "}}";
  inString = inString.replace(new RegExp(textToReplace, "g"), subValue);
  
  return inString;
};


