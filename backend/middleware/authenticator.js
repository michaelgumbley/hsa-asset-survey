function authenticate (req, res, next){  // custom middleware function
	console.log("Authenticating...");
	next();
}

//new expoert syntax
export { authenticate };