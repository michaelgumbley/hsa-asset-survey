//ISSUE: getting resources & waiting for DOM load prior to building elements (line 24)

const resourceLoaded = (function () {
  //create private Set
  const resourceRegister = new Set(); //snippet1, snippet2, snippet3, savedData, DOMloaded

  return function (resourceName) { 
    //add resource
    resourceRegister.add(resourceName);
    console.log("Added: "+ resourceName);

    if(resourceRegister.has("snippet1") && resourceRegister.has("snippet2") && resourceRegister.has("snippet3") && 
      resourceRegister.has("savedData") && resourceRegister.has("DOMloaded"))
    {
      //load is complete - do stuff here 
      //call checkAuthentication() - needs return
      //check authentication
      checkAuthentication();

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

      // // plus 1 new row
      // buildNewRowHtml ($hsa.q1RowHtml, $hsa.q1LastRowNum + 1, "#q1InputRows", "q1AddRowBtn");
      // $hsa.q1LastRowNum++;



      // //build and load Q1
      // console.log("Initial buildNewRowHtml call - with newRowNum = 1");
      // // buildNewRowHtml (q1RowHtmlUrl, 1, "#q1InputRows", "q1AddRowBtn");
      // buildNewRowHtml ($hsa.q1RowHtml, 1, "#q1InputRows", "q1AddRowBtn");
      
      // console.log("Increment q1LastRowNum, when q1LastRowNum = ", $hsa.q1LastRowNum);
      // $hsa.q1LastRowNum++;

 
      //build and load Q2
      //build and load Q3
    }
    return true}
})();


//immediately-invoked function: used to execute immediately on page load, and only once, then kill local resources
(function (global) { 

  //Step 0 - Set vars
  const q1RowHtmlUrl = "snippets/q1-row-snippet.html";
  const q2RowHtmlUrl = "snippets/q2-row-snippet.html";
  const q3RowHtmlUrl = "snippets/q3-row-snippet.html";
  const savedDataUrl = "resources/saved-data.json";
  global.$hsa = {};
  $hsa.q1LastRowNum = 0;

  //Step 1 - Get resourses - async

  // Ajax calls to get Q1, Q2 ,Q3 snippet content
  $ajaxUtils.sendGetRequest(
    q1RowHtmlUrl,
    function (snippetHtml) {
      //save snippet to resources object
      $hsa.q1RowHtml = snippetHtml;
      //register loaded resource
      resourceLoaded("snippet1"); 
    },
    false); // False here for regular HTML from the server(no need to process JSON).

  $ajaxUtils.sendGetRequest(
    q2RowHtmlUrl,
    function (snippetHtml) {
      //save snippet to resources object
      $hsa.q2RowHtml = snippetHtml;
      //register loaded resource
      resourceLoaded("snippet2");
    },
    false); 

  $ajaxUtils.sendGetRequest(
    q3RowHtmlUrl, 
    function (snippetHtml) {
      //save snippet to resources object
      $hsa.q3RowHtml = snippetHtml;
      //register loaded resource
      resourceLoaded("snippet3");
    },
    false); 

    // Ajax calls to get saved data object
    $ajaxUtils.sendGetRequest(
      savedDataUrl,
      function (jsonObject) {
        //parse and store save json object
        $hsa.savedData = jsonObject;
        console.log("Saved Data - ", jsonObject);

        //register loaded resource
        resourceLoaded("savedData");
      },
      true); // True here to process as JSON.


  //Step 3 - generate page elements
  //step 4 - enable listeners & functionality

})(window);



//immediately-invoked function: used to execute immediately on page load, and only once, then kill local resources
// "global" is now a proxy for 'window'
                        //TODO: named functions shouldn't be here
// (function (global) { 
  //locals
  // var dc = {};
  // var q1RowHtmlUrl = "snippets/q1-row-snippet.html";
  // var q1LastRowNum = 0;
  // var addingRow = false;

  // Convenience function for inserting innerHTML
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    //set
    targetElem.innerHTML = html;
  };

  // Convenience function for appending HTML to innerHTML
  var appendHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    var currentHtml = targetElem.innerHTML;
    //replace
    targetElem.innerHTML = currentHtml + html;
  };

  //Convenience function to ensure a 'Hash' prefix is explicitly included where it's needed and not anywhere else
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


  // Return substitution of '{{subLocator}}' with subValue within 'inString'
  var substituteValue = function (inString, subLocator, subValue) {
    var textToReplace = "{{" + subLocator + "}}";
    inString = inString.replace(new RegExp(textToReplace, "g"), subValue);
    
    return inString;
  };

  

  //add dynamic NewRowBtnListener to new buttons - assumes targetSelector contains "AddRowBtn" pattern
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


  // Builds HTML for the home page based on categories array returned from the server.  ORIGINAL
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


  // On page load - before images or CSS 
  $(function () { // Same as document.addEventListener("DOMContentLoaded"...

    //register loaded resource
    resourceLoaded("DOMloaded");
  });  


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //TEST HARNESS:  quick and dirty Click Trigger #0 for Key Info heading
  document.querySelector("#clickTrigger0").addEventListener("click", function (event) { 
    console.log("Key Info Trigger Clicked!");

    //call
    document.querySelector("#q1InputRows").innerHTML = "";
    $hsa.q1LastRowNum = 0;

  });

  //TEST HARNESS:  quick and dirty Click Trigger #1 for Form H3
  document.querySelector("#clickTrigger1").addEventListener("click", function (event) { 
    console.log("H3 Trigger Clicked!");

    //call
    gatherResponses();

  });

  //TEST HARNESS:  quick and dirty Click Trigger #2 for Q2 "p" tag
  document.querySelector("#clickTrigger2").addEventListener("click", function (event) { 
    console.log("Q2 Trigger Clicked!");

    //call
    fillQ1Responses();

  });



  //FUNCTION: to gather responses into a JSON object (on save or submit)
  function gatherResponses(){

    const allResponses = {q1: [], q2: [], q3: [] };

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

    console.log("allResponses: ", allResponses);

    //add to object instance
    $hsa.allResponses = allResponses;

    //return
    return allResponses;
  };


  //FUNCTION: to fill the existing responses into the grids
  function fillQ1Responses(){

    //Q1 loop
    const q1RespObjArray = $hsa.allResponses.q1;
    var q1ResponseLine = 0;

    console.log("Response array: ", q1RespObjArray);

    for (let i = 0; i < q1RespObjArray.length; i++){  //standard loop for arrays!
      //new response line
      q1ResponseLine++;

      console.log("New line no: " + q1ResponseLine + "  resp obj: ", q1RespObjArray[i]);

      //add response row if needed 
      if ($hsa.q1LastRowNum < q1ResponseLine){
        console.log("Adding Q1 response row for filling.");
        buildNewRowHtml ($hsa.q1RowHtml, q1ResponseLine, "#q1InputRows", "q1AddRowBtn");
        $hsa.q1LastRowNum++;
      };


      //fill row
      console.log(q1RespObjArray[i]);

      document.querySelector("#q1Device" + q1ResponseLine).value = q1RespObjArray[i].device; 
      document.querySelector("#q1Owner" + q1ResponseLine).value = q1RespObjArray[i].owner;

    };

    //TODO: Q2 loop

    //TODO: Q3 loop


  };




    



// })(window);


