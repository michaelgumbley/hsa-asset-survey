
//immediately-invoked function: used to execute immediately on page load, and only once, then kill local resources
// "global" is now a proxy for 'window'
                        //TODO: named functions shouldn't be here
(function (global) { 
  //locals
  var dc = {};
  var q1RowHtmlUrl = "snippets/q1-row-snippet.html";
  var q1LastRowNum = 0;
  var addingRow = false;

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
    inString = inString
      .replace(new RegExp(textToReplace, "g"), subValue);
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
 
      buildNewRowHtml (q1RowHtmlUrl, (q1LastRowNum + 1), newRowContainerId, addNewRowBtnIdPrefix);   

      q1LastRowNum++;

    });
  }


  // document.querySelector(targetSelector).addEventListener("click", function (event) { 
  //     console.log(targetSelector + " Click dynamic event!");

  //     //remove the line number at the end of targetSelector and ensure no hash prefix
  //     var addNewRowBtnIdPrefix =  targetSelector.slice(0, targetSelector.lastIndexOf("n") + 1); 
  //     addNewRowBtnIdPrefix = hashPrefix(addNewRowBtnIdPrefix, false);
 
  //     buildNewRowHtml (q1RowHtmlUrl, (q1LastRowNum + 1), newRowContainerId, addNewRowBtnIdPrefix);   

  //     q1LastRowNum++;

  //   });


  // Builds HTML for the home page based on categories array returned from the server.
  function buildNewRowHtml (htmlSnippetUrl, newRowNum, destSelector, addNewRowBtnIdPrefix) {

    destSelector = hashPrefix(destSelector, true); //needs hash
    addNewRowBtnIdPrefix = hashPrefix(addNewRowBtnIdPrefix, false); //no hash
    //change addingRow state
    addingRow = true;

    // Ajax call to get and use snippet content
    $ajaxUtils.sendGetRequest(
      htmlSnippetUrl,
      function (snippetHtml) {

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

        //change addingRow state
        addingRow = false;

      },
      false); // False here for regular HTML from the server(no need to process JSON).
  }


  // On page load - before images or CSS 
  $(function () { // Same as document.addEventListener("DOMContentLoaded"...

    //Initially create the first input row & add listener & increment rowcount
    console.log("Page loaded - make initial calls...");

    console.log("Initial buildNewRowHtml call - with newRowNum = 1");
    buildNewRowHtml (q1RowHtmlUrl, 1, "#q1InputRows", "q1AddRowBtn");
    
    console.log("Increment q1LastRowNum, when q1LastRowNum = ", q1LastRowNum);
    q1LastRowNum++;
    
  });  


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //TEST HARNESS:  quick and dirty Click Trigger #0 for Key Info heading
  document.querySelector("#clickTrigger0").addEventListener("click", function (event) { 
    console.log("Key Info Trigger Clicked!");

    //call
    document.querySelector("#q1InputRows").innerHTML = "";
    q1LastRowNum = 0;

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
    fillResponses(dc.allResponses);

  });



  //FUNCTION: to gather responses into a JSON object (on save or submit)
  function gatherResponses(){

    const allResponses = {q1: [], q2: [], q3: [] };

    //Q1 loop
    for (let i = 1; i <= q1LastRowNum; i++) {

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
    dc.allResponses = allResponses;

    console.log("dc created: ", dc);

    //return
    return allResponses;
  };


  //FUNCTION: to fill the existing responses into the grids
  function fillResponses(allResponses){

    console.log("Arg: ", allResponses);
    console.log("DC: ", dc.allResponses);

    //Q1 loop
    const q1RespObjArray = allResponses.q1;
    var q1ResponseLine = 0;

    console.log("Response array: ", q1RespObjArray);

    for (let i = 0; i < q1RespObjArray.length; i++){  //standard loop for arrays!
      //new response line
      q1ResponseLine++;

      console.log("New line no: " + q1ResponseLine + "  resp obj: ", q1RespObjArray[i]);

      //add response row if needed 
      if (q1LastRowNum < q1ResponseLine){
        console.log("Adding Q1 response row for filling.");
        buildNewRowHtml (q1RowHtmlUrl, q1ResponseLine, "#q1InputRows", "q1AddRowBtn");
        q1LastRowNum++;
      };

      //wait if new row is still being added
      let cnt = 0;
      while (addingRow && cnt <= 5) {
        //do nothing, just wait
        cnt++;
        delay(1500);
      };

      console.log("cnt = ", cnt);

      //fill row
      console.log(q1RespObjArray[i], q1RespObjArray[i].device);
      console.log(document.querySelector("#q1Device" + q1ResponseLine));
      console.log("innerHtml" , document.querySelector("#q1InputRows").innerHTML);
      document.querySelector("#q1Device" + q1ResponseLine).value = q1RespObjArray[i].device;  //ISSUE HERE with new row!!!
      document.querySelector("#q1Owner" + q1ResponseLine).value = q1RespObjArray[i].owner;

    };

    //TODO: Q2 loop

    //TODO: Q3 loop


  };

  async function delay(ms) {
    console.log('delaying ', ms);
    await new Promise(resolve => setTimeout(resolve, ms));
  };


    

  global.$dc = dc;

})(window);


