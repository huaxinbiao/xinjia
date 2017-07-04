/*连接方法*/
const MongoClient = require('mongodb').MongoClient;
const mongoConnectUrl = 'mongodb://localhost:27017/chat';

module.exports = {  
    MongoClient,  
    mongoConnectUrl
};

/*MongoClient.connect(mongoConnectUrl, function(err, db){
	if(err) return console.log(err);
	console.log('连接成功');
});*/
