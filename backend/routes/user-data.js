import { readFile } from 'node:fs/promises'; 
import { writeFile } from 'node:fs/promises';
import express from 'express';  //framework for http endpoints
const router = express.Router();
import Joi from 'joi';       // validation package using schemas


// async function funcName(){
//   try{ 
//     const r1 = await func1(1);   //returns a promise  
//     const r2 = await func2(r1);   //returns a promise  
//     console.log(r2);
//   }
//   catch(err){
//     console.log('Error ', err);
//   }
// };
// funcName(); //call async function

// router.get('/',  async function(req, res) {     // this route is assumed "/api/user-data"
// 	try {
// 	  const filePath = new URL('../user-data/saved-data.json', import.meta.url);  //needs to be a URL
// 	  const contents = await readFile(filePath, { encoding: 'utf8' });
// 	  console.log(contents);
// 	  res.send(contents);
// 	} 
// 	catch (err) {
// 	  console.error(err.message);
// 	}

// }); 


router.get('/:id',  async function(req, res) {     // this route is assumed "/api/user-data"
	try {

		const pathStr =  getUserDataFilePath(parseInt(req.params.id));
	  const filePath = new URL(pathStr, import.meta.url);  //needs to be a URL

		//TODO: check for file exists! Otherwise return an ...

	  const contents = await readFile(filePath, { encoding: 'utf8' });
	  console.log(contents);
	  res.send(contents);
	} 
	catch (err) {

		if(err.errno == -4058){
			console.log("Caught - no such file");
			// let defaultJson = '{ "q1": [], "q2": [], "q3": [] }'
			// res.send(defaultJson);
			res.send();
		}
		else{
			console.error(err.errno + err.message);
	  	res.status(400).send("Data API Error ");
		}
	  
	}

}); 


//POST 
router.post('/:id', async function(req, res){

	// if(req.params.id????){
	// 	res.status(400).send("Data Save API Error: " + error.details[0].message);
	// 	return;
	// };

	// const { error } = validatePostPayload(req.body);  
	// if(error){
	// 	res.status(400).send("Data Save API Error: " + error.details[0].message);
	// 	return;
	// };

	try {

		//get filepath
		const pathStr =  getUserDataFilePath(parseInt(req.params.id));
	  const filePath = new URL(pathStr, import.meta.url);  //needs to be a URL

		//TODO: check for file exists! Otherwise return an ...

		//TODO: save backup 

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





// const courses = [
// 	{id: 1, name: "course1"},
// 	{id: 2, name: "course2"},
// 	{id: 3, name: "course3"}
// ];

// // router.get()
// // router.post()
// // router.put()
// // router.delete()

// router.get('/',  (req, res) => {     // this route is assumed "/api/courses"

// 	res.send(courses);

// }); 

// router.get('/:id',  (req, res) => {  

// 	const course = courses.find(c => c.id === parseInt(req.params.id));
// 	if(!course) res.status(404).send("Course id not found");
// 	else res.send(course);

// }); 


// //POST - for adding/routerending
// router.post('/', (req, res) => {

// 	const { error } = validateCourse(req.body);  // OBJECT DESTRUCTURING - gets the error part of the result only
// 	if(error){
// 		res.status(400).send("Post Error: " + error.details[0].message);
// 		return;
// 	};

// 	const	course = {
// 		id: courses.length + 1,
// 		name: req.body.name
// 	}

// 	courses.push(course);

// 	res.send(course);

// });

// //PUT - for updating
// router.put('/:id', (req, res) => {

// 	//look up course - if not found, return 404
// 	const idx = courses.findIndex(c => c.id === parseInt(req.params.id));
// 	if(idx == -1) {
// 		res.status(404).send("Course id not found");
// 		return;
// 	};

// 	//validate - if invalid, return 400 - bad request
// 	const { error } = validateCourse(req.body);  // OBJECT DESTRUCTURING - gets the error part of the result only
// 	if(error){
// 		res.status(400).send("Put Error: " + error.details[0].message);
// 		return;
// 	};

// 	//update the course
// 	const	course = {
// 		id: courses[idx].id,
// 		name: req.body.name
// 	}
// 	courses[idx].name = req.body.name;

// 	//return the updated course
// 	res.send(course);
// 	console.log("Updated course!");

// });

// function validateCourse(course){
// 	const schema = Joi.object({
// 		name: Joi.string().min(3).required()
// 	});
// 	return schema.validate(course);
// }


// router.delete('/:id', (req, res) => {

// 	//look up course - if not found, return 404
// 	const idx = courses.findIndex(c => c.id === parseInt(req.params.id));
// 	if(idx == -1) {
// 		res.status(404).send("Course id not found");
// 		return;
// 	};

// 	//select it
// 	const course = courses[idx];

// 	//delete it
// 	courses.splice(idx,1);

// 	//return it
// 	res.send(course);

// });

export { router };
