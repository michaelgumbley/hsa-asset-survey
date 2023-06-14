import { readFile } from 'node:fs/promises'; 
import { writeFile } from 'node:fs/promises';
import express from 'express';  //framework for http endpoints
const dataRouter = express.Router();
import Joi from 'joi';       // validation package using schemas




dataRouter.get('/:id',  async function(req, res) {     // this route is assumed "/api/user-data"
	try {

		const pathStr =  getUserDataFilePath(parseInt(req.params.id));
	  const filePath = new URL(pathStr, import.meta.url);  //needs to be a URL

	  const contents = await readFile(filePath, { encoding: 'utf8' });

	  res.send(contents);
	} 
	catch (err) {

		if(err.errno == -4058){
			console.log("Caught - no such file");
			res.send();  //respond with nothing
		}
		else{
			console.error(err.errno + err.message);
	  	res.status(400).send("Data API Error ");
		}
	  
	}

}); 


//POST 
dataRouter.post('/:id', async function(req, res){

	// if(req.params.id????){
	// 	res.status(400).send("Data Save API Error: " + error.details[0].message);
	// 	return;
	// };

	const { error } = validatePostPayload(req.body);  
	if(error){
		res.status(400).send("Data Save API Error: " + error.details[0].message);
		return;
	};

	try {

		//get filepath
		const pathStr =  getUserDataFilePath(parseInt(req.params.id));
	  const filePath = new URL(pathStr, import.meta.url);  //needs to be a URL

		//TODO: save backup is a file exists

		//write file
		const result = await writeFile(filePath, JSON.stringify(req.body));

	  res.send(req.body);
	} 
	catch (err) {
	  console.error("My error: ",err.message);
	  res.status(400).send("Data API Error ");
	}  

});



function getUserDataFilePath(id){

	return '../user-data/data-'+ id +'.json';

};


function validatePostPayload(userData){
	const schema = Joi.object({
		q1: Joi.array().required(),
		q2: Joi.array().required(),
		q3:Joi.array().required()
	});
	return schema.validate(userData);
};


//export 
export { dataRouter };
