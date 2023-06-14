import { readFile } from 'node:fs/promises'; 
import express from 'express';  //framework for http endpoints
const authRouter = express.Router();
import Joi from 'joi';       // validation package using schemas

const resourcePathStr = "../user-data/credentials.json";
const fillerChar = "$";
let indexCodes = {};
indexCodes.dayOfYear = [39,6,15];
indexCodes.minsToday = [35,40,5,23];
indexCodes.userId = [7,18];
indexCodes.userName = [29,8,21,37,4,28,32,9,22,26,16,38,19,2];


//POST - main authentication request
authRouter.post('/', async function(req, res){

	const { error } = validateAuthPayload(req.body);  
	if(error){
		res.status(400).send("Data Save API validation error: " + error.details[0].message);
		return;
	};
	console.log("Auth payload validated!");
	

	try {

		//get filepath
	  const fileUrl = new URL(resourcePathStr, import.meta.url);  //needs to be a URL

	  //read in credentials
	  const credentialsText = await readFile(fileUrl, { encoding: 'utf8' });
		const credentialsArray = JSON.parse(credentialsText);

	  //get payload elements
	  let userEmail = req.body.email;
    let userPwd = req.body.password;

	  //check for a credential match
    let index = credentialsArray.findIndex(function(val, idx, arr){

      return val.email === userEmail && val.password === userPwd;
    });


		//do the id & password match?
    if (index !== -1) {
        
      console.log("User found!");

	    //create the return object
	    const userObj = {
	    	id: credentialsArray[index].id,
	    	name: credentialsArray[index].name
	    };

	    //return valid user details
	    res.send(userObj);
	    
    }
    else {
    		//Authentication issue
        console.log("Username or password error!");
    		//return error code
    		res.status(401).send("Authentication issue - user not found");

    };
	  
	} 
	catch (err) {
	  console.error("authRouter error: ",err.message);
	  res.status(400).send("Data API Error ");
	}  

});


//POST - get-token request
authRouter.post('/get-token/', async function(req, res){

	const { error } = validateGetTokenPayload(req.body);  
	if(error){
		res.status(400).send("Get token API validation error: " + error.details[0].message);
		return;
	};
	
	console.log("get-token payload validated!");

  //get days and minutes
  let d = new Date();
  let minsToday = d.getMinutes() + (d.getHours() * 60);
  let dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

  // set initial random token string to 44 chars 
  let token =  "";
  for(let i = 0; i < 44; i++){
  	token += generateChar("random");
  };
  //encode all
  token = encodeStringValue(token, indexCodes.dayOfYear, dayOfYear);
  token = encodeStringValue(token, indexCodes.minsToday, minsToday);
  token = encodeStringValue(token, indexCodes.userId, req.body.id);
  token = encodeStringValue(token, indexCodes.userName, req.body.name);

  //return valid user details
	res.send(token);

});

//POST - check-token request
authRouter.post('/check-token/', async function(req, res){

	const { error } = validateCheckTokenPayload(req.body);  
	if(error){
		res.status(400).send("check-token API validation error: " + error.details[0].message);
		return;
	};
	
	console.log("check-token payload validated!");

	//create return object
	let userObj = {
  	id: "",
  	name: ""
  };

	try{
			//decode token 
			let tokenStr = req.body.token;
			let tokDayOfYear = Number( decodeStringValue(tokenStr, indexCodes.dayOfYear) );
			let tokMinsToday = Number( decodeStringValue(tokenStr, indexCodes.minsToday) );
			let tokUserId = decodeStringValue(tokenStr, indexCodes.userId);
			let tokUserName = decodeStringValue(tokenStr, indexCodes.userName);

			console.log(tokDayOfYear + " " + tokMinsToday  + " " + tokUserId + " " + tokUserName);


      //check authentication
			// let tokenStr = req.body.token;
      // let params = tokenStr.split("|");
      let d = new Date();
      let minsToday = d.getMinutes() + (d.getHours() * 60);
      let dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

      //check for timeout
      if(dayOfYear == tokDayOfYear && minsToday >= tokMinsToday && minsToday < (tokMinsToday + 30)){ //keep valid for 30 mins
        
        //check for all parameters
        if(tokUserId != "" && tokUserName != ""){

          //all is well - update object
          userObj.id = tokUserId;
          userObj.name = tokUserName;

          //return valid user details
					res.send(userObj);

        }
        else{
        	//send 400 Bad Request error
        	res.status(400).send("User info not found!");
        };
        
      }
      else{
        console.log("Authentication error - timeout! " + dayOfYear + " " + params[0] + " | " +  minsToday + " " +  params[1]);
        //send 401 Unauthorized error
        res.status(401).send("Authentication timeout!");
      };

    }
    catch(err){
      //send 400 Bad Request error
      res.status(400).send("check-token API Error: " + err.message);  
    };

});



// *** VALIDATION FUNCTIONS *** //

function validateAuthPayload(credentials){

	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(3).required()
	});

	return schema.validate(credentials);
};

function validateGetTokenPayload(userDetails){

	const schema = Joi.object({
		id: Joi.number().required(),
		name: Joi.string().min(2).required()
	});

	return schema.validate(userDetails);
};

function validateCheckTokenPayload(token){

	const schema = Joi.object({
		token: Joi.string().min(32).max(48).required()
	});

	return schema.validate(token);

};


// *** CONVENIENCE FUNCTIONS *** //

function encodeStringValue(hostString, indexArray, value){

	const strArray = hostString.split("");
	// var returnString = hostString;
	let indexVal = -1;
	let stringVal = value.toString();

	console.log("Encoding ", indexArray.length);

	//loop through array
	for (let i = 0; i < indexArray.length; i++){  //standard loop for arrays!

		indexVal = indexArray[i];

		if(i < stringVal.length){
			strArray[indexVal] = stringVal[i]; //still more value to encode
		}
		else{
			strArray[indexVal] = fillerChar; //no more value, add filler
		};
		
	};

	return strArray.join("");
};

function decodeStringValue(hostString, indexArray){

	let returnString = "";

	//loop through array
	indexArray.forEach(function(val){
		//add is not filler
		if(hostString[val] != fillerChar){
			returnString += hostString[val];
		};
		
	});

	return returnString;
};

//Generate random char values
function generateChar(charType = "random"){

	if(charType.toLowerCase() == "random"){
		//weighted random values
		let types = ["upper","lower","lower","number","number"];
		charType = types[Math.floor(Math.random() * 5)];
	}

	if(charType.toLowerCase() == "upper"){

		//generate a number from 0-25
		let num = Math.floor(Math.random() * 26);
		return String.fromCharCode(65 + num);

	}
	else if(charType.toLowerCase() == "lower"){

		//generate a number from 0-25
		let num = Math.floor(Math.random() * 26);
		return String.fromCharCode(97 + num);

	}
	else if(charType.toLowerCase() == "number"){

		//generate a number from 0-9
		return Math.floor(Math.random() * 10).toString();
	}
	else{
		return "";
	};
	
};



//export
export { authRouter };