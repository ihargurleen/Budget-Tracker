 
// SFKriO6KpTcSOfCY password
// ihargurleenkaurr_db_user
// localhost
// mCluster0ongodb://ihargurleenkaurr_db_user:<db_password>@ac-bloc8kq-shard-00-00.wpdgdjq.mongodb.net:27017,ac-bloc8kq-shard-00-01.wpdgdjq.mongodb.net:27017,ac-bloc8kq-shard-00-02.wpdgdjq.mongodb.net:27017/?ssl=
// true&replicaSet=atlas-12mtl0-shard-0&authSource=admin&appName=
 import app from "./app.js";
import {db} from "./db.js";

const PORT = process.env.PORT || 3000;
 
db();   


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
}   );