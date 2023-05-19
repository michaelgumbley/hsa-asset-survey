function log (req, res, next){  // custom middleware function
	console.log("Logging...");
	next();
}

//new expoert syntax
export { log };