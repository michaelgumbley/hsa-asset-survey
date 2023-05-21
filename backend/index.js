import debug from 'debug';
// import { router }  from './routes/courses.js'; //routing module
// import { home }  from './routes/home.js'; //routing module
import { router }  from './routes/user-data.js'; //routing module
import express from 'express';  //framework for http endpoints
const app = express();
// import helmet from "helmet";  // set headers for security purposes   //not sure about this!
import morgan from "morgan";  // logging package
import config from "config";  // environment configuration package
// import { log } from './middleware/logger.js';
// import { authenticate } from './middleware/authenticator.js';

//check for PORT ENV variable
const port = process.env.PORT || config.get('default-port');

const startupDebugger = debug("app:startup");
// const dbDebugger = debug("app:db");

// //dynamic HTML example
// app.set('view engine', 'pug');  //this is all that's required to use pug
// app.set('views', './views');  //this is the path to the tempaltes

					//CODE TO ALLOW CROSS ORIGIN REQUESTS - using port 5000 (env var PORT)
					app.use(function(req, res, next) {
					  res.header("Access-Control-Allow-Origin", "*");
					  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
					  next();
					});

app.use(express.json());  // JSON middleware function
// app.use(log);
// app.use(authenticate);
// app.use(helmet());            //not sure about this!
app.use('/api/user-data', router);   //for any routes that start with "/api/user-data" use our "router" route
// app.use('', home); //no need for this route

// // Add Access Control Allow Origin headers
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:5000/questions.html");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });


//configuration
console.log("Application name: " + config.get('name'));
console.log("Default port: " + config.get('default-port'));

// console.log(`PWD: ${process.env.APPDEMO_PWD}`);
// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

// if(app.get('env') === 'development'){
	app.use(morgan('dev')); //tiny, short, dev, common, combined
	console.log("Morgan enabled...");
	startupDebugger("Morgan enabled (debugger)...");

// }

// dbDebugger("DB connected...");



app.listen(port, () => console.log('Listening on port', port));
