import { MongoClient, ServerApiVersion }  from 'mongodb';
import config from "config";

const dbUri = getDbConnectionStr();

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(dbUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

function getDbConnectionStr(){
	//get conn string
	const baseConnStr = config.get('hsa-db-conn-str');

	//get DB username & passweord ENV variables
	const dbUser = process.env.HSA_DB_USER || "missing_env_HSA_DB_USER";
	const dbPwd = process.env.HSA_DB_PWD || "missing_env_HSA_DB_PWD";

	//form up the string
	let connStr = baseConnStr.replace("<username>", dbUser);
	connStr = connStr.replace("<password>", dbPwd);

	//return
	return connStr;

};


//export 
export { client };
