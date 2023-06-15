import { readFile } from 'node:fs/promises'; 
import { writeFile } from 'node:fs/promises';
import express from 'express';  //framework for http endpoints
import Joi from 'joi';       // validation package using schemas
import { MongoClient, ServerApiVersion }  from 'mongodb';
import config from "config";
import { client } from "./db-connection.js";  //get the connection client to the HSA DB

const dataRouter = express.Router();

//GET DATA
dataRouter.get('/:id',  async function(req, res) {     // this route is assumed "/api/user-data"

	let idParam = req.params.id;

	async function run() {
	  try {
	    // Connect the client to the server
	    await client.connect();

	    //get the collection
	    const database = client.db('HSA');
	    const collection = database.collection('user_data');

	    // Query for a test
	    const query = { id: idParam };
	    const userInfo = await collection.findOne(query);

	    // console.log(userInfo);

	    //check for record found
	    if(userInfo == null){
	    	console.log("No existing data");
				res.send();  //respond with nothing
	    }
	    else{
	    	res.send(userInfo.data);
	    };
	   
	  } 
	  catch(err) {

			console.error(err.errno + err.message);
	  	res.status(400).send("Data API Error ");
		}
	  finally {
	    // Ensures that the client will close when you finish/error
	    await client.close();
	  };
	};  //end async function

	run().catch(console.dir);

}); 


//POST DATA
dataRouter.post('/:id', async function(req, res){

	const { error } = validatePostPayload(req.body);  
	if(error){
		res.status(400).send("Data Save API Error: " + error.details[0].message);
		return;
	};

	let idParam = req.params.id;
	let doc = {
		id: idParam,
		data: req.body
	}

	async function run() {
	  try {
	    // Connect the client to the server	
	    await client.connect();

	    //get the collection
	    const database = client.db('HSA');
	    const collection = database.collection('user_data');

	    // Query for a test
	    const query = { id: idParam };
	    const docCount = await collection.countDocuments(query);

	    console.log("Doc count:" + docCount);

	    if(docCount == 0){
	    	//insert
	    	const result = await collection.insertOne(doc);
	    }
	    else{
	    	//replace
	    	const result = await collection.replaceOne(query, doc);
	    };

	    //response
	    res.send(req.body);
	  } 
	  catch(err) {

			console.error(err.errno + err.message);
	  	res.status(400).send("Data API Error ");
		}
	  finally {
	    // Ensures that the client will close when you finish/error
	    await client.close();
	  };
	};  //end async function

	run().catch(console.dir);


});


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
