import debug from 'debug';
import { dataRouter }  from './routes/user-data.js'; //routing module
import { authRouter }  from './routes/authentication.js'; //routing module
import express from 'express';  //framework for http endpoints
const app = express();
// import helmet from "helmet";  // set headers for security purposes   //not sure about this!
import morgan from "morgan";  // logging package
import config from "config";  // environment configuration package


//check for PORT ENV variable
const port = process.env.PORT || config.get('default-port');

const startupDebugger = debug("app:startup");


					//CODE TO ALLOW CROSS ORIGIN REQUESTS - using port 5000 (env var PORT)
					app.use(function(req, res, next) {
					  res.header("Access-Control-Allow-Origin", "*");
					  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
					  next();
					});

app.use(express.json());  // JSON middleware function
// app.use(helmet());            //not sure about this!
app.use('/api/user-data', dataRouter);   //for any routes that start with "/api/user-data" use our "dataRouter" route
app.use('/api/auth', authRouter);   //for any routes that start with "/api/auth" use our "authRouter" route



app.use(morgan('dev')); //tiny, short, dev, common, combined
console.log("Morgan enabled...");
startupDebugger("Morgan enabled (debugger)...");





app.listen(port, () => console.log('Listening on port', port));
