
import express from 'express';  //framework for http endpoints
const home = express.Router();


home.get('/',  (req, res) => {  //args path and callback - route handler

	// res.send('Hello World');
	res.render('index.pug', {title:'My Express App', message: 'Hello'});

}); 


home.get('/api/posts/:year/:month',  (req, res) => {  

	res.send(req.params);

}); 


export { home };