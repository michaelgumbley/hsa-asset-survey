// ***** IFFE SETUP CODE ***** //

(function (global) { 
	//immediately-invoked function: executes immediately, and only once, then kills local resources

	//SETUP STEP 0 - Set vars
  const q1RowHtmlUrl = "snippets/q1-row-snippet.html";
  const q2RowHtmlUrl = "snippets/q2-row-snippet.html";
  const q3RowHtmlUrl = "snippets/q3-row-snippet.html";
  const savedDataUrl = "resources/saved-data.json";
  global.$hsa = {};
  $hsa.q1LastRowNum = 0;

  //SETUP STEP 1 - Get resourses 

	//Get Q1 snippet content
	const s1 = new Promise((resolve) => {
		//ajax call
		$ajaxUtils.sendGetRequest(
	    q1RowHtmlUrl,
	    function (snippetHtml) {
	      //save snippet to resources object
	      $hsa.q1RowHtml = snippetHtml;
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
	      $hsa.q2RowHtml = snippetHtml;
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
	      $hsa.q3RowHtml = snippetHtml;
	      //resolve promise
	      resolve();
	    },
	    false); 
	});
 
	//Get saved data
	const sd =  new Promise((resolve) => {

		//compile the correct URL first, using the userId???

		//ajax call
		$ajaxUtils.sendGetRequest(
      savedDataUrl,
      function (jsonObject) {
        //parse and store save json object
        $hsa.savedData = jsonObject;
        console.log("Saved Data - ", jsonObject);

        //resolve promise
	      resolve();
      },
      true); // True here to process as JSON.
	});
  

	//Once all resources have been loaded
  Promise.all([s1, s2, s3, sd])
	.then(result => checkDOMReadyState())
	.catch(err => console.log('Error:', err.message));


                  //FIRST NODE GET CALL!
                  const nodeUrl = "http://localhost:5000/api/genres"
                  const p = new Promise((resolve, reject) => {
                    //ajax call
                    $ajaxUtils.sendGetRequest(
                      nodeUrl,
                      function (genres) {
                        //resolve promise
                        resolve(genres); 
                      },
                      false); // False here for regular HTML from the server(no need to process JSON).
                  });

                  p
                  .then(result => console.log('result = ', result))
                  .catch(err => console.log('Error', err.message));




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

		console.log("Finalising Setup!!!")

		//call checkAuthentication() - needs return
    //check authentication
    checkAuthentication();
    console.log($hsa.userid);

    //get responses for this userid
    console.log($hsa.savedData[$hsa.userid]);
    $hsa.allResponses = $hsa.savedData[$hsa.userid];

    //LOAD Q1
    // add required rows
    $hsa.q1LastRowNum = 0;
    let rowsNeeded = $hsa.allResponses.q1.length + 1;
    
    console.log("rowsNeeded = " + rowsNeeded);

    while ($hsa.q1LastRowNum < rowsNeeded){
      //increment last row
      $hsa.q1LastRowNum++;

      console.log("Adding Q1 response row " + $hsa.q1LastRowNum + " for filling.");
      //add it
      buildNewRowHtml ($hsa.q1RowHtml, $hsa.q1LastRowNum, "#q1InputRows", "q1AddRowBtn"); 
    };

    //fill the rows
    fillQ1Responses();

	};

	//CHECK AUTHENTICATION called from finaliseSetup() once per page load, after DOM loaded
	function checkAuthentication(){
    //check authentication
    const queryString = window.location.search;
    console.log(queryString);
    let params = queryString.slice(1).split("|");
    let d = new Date();
    let minsToday = d.getMinutes() + (d.getHours() * 60);
    let dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    if(dayOfYear == params[0] && minsToday >= params[1] && minsToday < (params[1] +30)){ //keep valid for 30 mins
      console.log("Hello " + params[3] + "  id: " + params[2]);
      //set id & username
      $hsa.userid = params[2];
      $hsa.username = params[3];
    }
    else{
      console.log("Authentication issues! " + dayOfYear + " " + params[0] + " | " +  minsToday + " " +  params[1]);

      //Repace inner html with authentication issue msg
      document.querySelector("#survey-container").innerHTML = 
        "<h3>Authentication issue!</h3><h4>Please return to the <a href='index.html'>login page</a> to reauthenticate</h4>";
    };
  };



})(window);  //END OF SET UP - end IFFE 



// ***** CORE PAGE LOGIC FUNCTIONS ***** //

//function to add dynamic NewRowBtnListener to new buttons - assumes targetSelector contains "AddRowBtn" pattern
function addNewRowBtnListener(targetSelector, newRowContainerId){

  targetSelector = hashPrefix(targetSelector, true);
  document.querySelector(targetSelector).addEventListener("click", function (event) { 
    console.log(targetSelector + " Click dynamic event!");

    //remove the line number at the end of targetSelector and ensure no hash prefix
    var addNewRowBtnIdPrefix =  targetSelector.slice(0, targetSelector.lastIndexOf("n") + 1); 
    addNewRowBtnIdPrefix = hashPrefix(addNewRowBtnIdPrefix, false);

    // buildNewRowHtml (q1RowHtmlUrl, (q1LastRowNum + 1), newRowContainerId, addNewRowBtnIdPrefix);
    //increment last row
    $hsa.q1LastRowNum++;
    //now add it
    buildNewRowHtml ($hsa.q1RowHtml, $hsa.q1LastRowNum, newRowContainerId, addNewRowBtnIdPrefix);
    //refill the data
    fillQ1Responses();

  });
}


// Function to Build HTML response rows
function buildNewRowHtml (snippetHtml, newRowNum, destSelector, addNewRowBtnIdPrefix) {

  destSelector = hashPrefix(destSelector, true); //needs hash
  addNewRowBtnIdPrefix = hashPrefix(addNewRowBtnIdPrefix, false); //no hash

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
  addNewRowBtnListener(btnSelector, destSelector);
    
};


//function to fill the existing responses into the grids
function fillQ1Responses(){

  //Q1 loop
  const q1RespObjArray = $hsa.allResponses.q1;
  var q1ResponseLine = 0;
  console.log("fillQ1Responses");

  for (let i = 0; i < q1RespObjArray.length; i++){  //standard loop for arrays!
    //new response line
    q1ResponseLine++;

    //add response row if needed 
    if ($hsa.q1LastRowNum < q1ResponseLine){
      console.log("Adding Q1 response row for filling.");
      buildNewRowHtml ($hsa.q1RowHtml, q1ResponseLine, "#q1InputRows", "q1AddRowBtn");
      $hsa.q1LastRowNum++;
    };


    //fill row
    document.querySelector("#q1Device" + q1ResponseLine).value = q1RespObjArray[i].device; 
    document.querySelector("#q1Owner" + q1ResponseLine).value = q1RespObjArray[i].owner;

  };

  //TODO: Q2 loop

  //TODO: Q3 loop


};



//function to gather responses into a JSON object (on save or submit)
function gatherResponses(){

  const allResponses = {q1: [], q2: [], q3: [] };

  console.log("gatherResponses");

  //Q1 loop
  for (let i = 1; i <= $hsa.q1LastRowNum; i++) {

    let deviceId = "device" + i; 
    let deviceVal = document.querySelector("#q1Device" + i).value;
    let ownerVal = document.querySelector("#q1Owner" + i).value;

    //add if not empty
    if((deviceVal + ownerVal).trim().length > 0 ){
      //add to allResponses
      allResponses.q1.push( {device: deviceVal.trim(), owner: ownerVal.trim()} );
    };
  }; //end for

  //TODO: Q2 loop

  //TODO: Q3 loop



  //add to object instance
  $hsa.allResponses = allResponses;

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


          //FIRST NODE POST CALL!
          let settings = {
            "url": "http://localhost:5000/api/genres",
            "method": "POST",
            "timeout": 0,
            "headers": {
              "Content-Type": "application/json"
            },
            "data": JSON.stringify({
              "name": "sci-fi"
            }),
          };

          $.ajax(settings).done(function (response) {
            console.log("POSTED: ", response);
          });