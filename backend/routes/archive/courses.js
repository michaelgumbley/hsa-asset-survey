import express from 'express';  //framework for http endpoints
const router = express.Router();
import Joi from 'joi';       // validation package using schemas


const courses = [
	{id: 1, name: "course1"},
	{id: 2, name: "course2"},
	{id: 3, name: "course3"}
];

// router.get()
// router.post()
// router.put()
// router.delete()

router.get('/',  (req, res) => {     // this route is assumed "/api/courses"

	res.send(courses);

}); 

router.get('/:id',  (req, res) => {  

	const course = courses.find(c => c.id === parseInt(req.params.id));
	if(!course) res.status(404).send("Course id not found");
	else res.send(course);

}); 


//POST - for adding/routerending
router.post('/', (req, res) => {

	const { error } = validateCourse(req.body);  // OBJECT DESTRUCTURING - gets the error part of the result only
	if(error){
		res.status(400).send("Post Error: " + error.details[0].message);
		return;
	};

	const	course = {
		id: courses.length + 1,
		name: req.body.name
	}

	courses.push(course);

	res.send(course);

});

//PUT - for updating
router.put('/:id', (req, res) => {

	//look up course - if not found, return 404
	const idx = courses.findIndex(c => c.id === parseInt(req.params.id));
	if(idx == -1) {
		res.status(404).send("Course id not found");
		return;
	};

	//validate - if invalid, return 400 - bad request
	const { error } = validateCourse(req.body);  // OBJECT DESTRUCTURING - gets the error part of the result only
	if(error){
		res.status(400).send("Put Error: " + error.details[0].message);
		return;
	};

	//update the course
	const	course = {
		id: courses[idx].id,
		name: req.body.name
	}
	courses[idx].name = req.body.name;

	//return the updated course
	res.send(course);
	console.log("Updated course!");

});

function validateCourse(course){
	const schema = Joi.object({
		name: Joi.string().min(3).required()
	});
	return schema.validate(course);
}


router.delete('/:id', (req, res) => {

	//look up course - if not found, return 404
	const idx = courses.findIndex(c => c.id === parseInt(req.params.id));
	if(idx == -1) {
		res.status(404).send("Course id not found");
		return;
	};

	//select it
	const course = courses[idx];

	//delete it
	courses.splice(idx,1);

	//return it
	res.send(course);

});

export { router };
