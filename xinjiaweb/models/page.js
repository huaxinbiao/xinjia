const mongodb = require('../conf/db');
const MongoClient = mongodb.MongoClient;
const mongoConnectUrl = mongodb.mongoConnectUrl;
const ObjectID = require('mongodb').ObjectID;

/**
 * 分页查询
 * @method findPage
 * @param {String} mongoConnectUrl 数据库连接
 * @param {String} coll 集合名称
 * @param {Object} opation 条件
 * @param {Object} screem 返回那些字段
 * @param {Object} page 请求页数
 * @param {Object} strip 返回条数
 * @param {Function} callback 回调函数
 * @return {Null}
 *
 */
exports.find = function (coll, opation, screem={}, page, strip, callback=function(){}){
	MongoClient.connect(mongoConnectUrl, function(err, db){
		if(err) return console.log(err);
		// 打开集合
		var collection = db.collection(coll);
		//使用 count 返回特定查询的文档数 total
        collection.count(opation, function (err1, total) {
            //根据 opation 对象条件查询，并跳过前 (page-1)*strip 个结果，返回之后的 strip 个结果
            collection.find(opation, screem, {
              skip: (page - 1)*strip,
              limit: strip
            }).sort({
              time: -1
            }).toArray(function (err2, docs) {
              db.close();
              if (err2) {
                return callback(err2);
              }
              callback(err2, docs, total);
            });
        });
	});
}


/**
 * 分页查询
 * @method findPage
 * @param {String} mongoConnectUrl 数据库连接
 * @param {String} coll 集合名称
 * @param {Object} opation 条件
 * @param {Object} screem 返回那些字段
 * @param {Object} page 请求页数
 * @param {Object} strip 返回条数
 * @param {Function} callback 回调函数
 * @return {Null}
 *
 */
/*exports.findData = function (coll, opation, screem={}, page, strip, callback=function(){}){
	MongoClient.connect(mongoConnectUrl, function(err, db){
		if(err) return console.log(err);
		// 打开集合
		var collection = db.collection(coll).aggregate([{
				$match: opation
            },{
            	$sort: {time: -1}
            },{
            	$group: {
            		_id: {"ification_id": true},
				  	initial: {"person": []},
				  	reduce: function(cur, prev) {
					    prev.person.push({title: cur.title});
				  	}
            	}
            },{
              	$limit: strip
            },{
              	$skip: (page - 1)*strip
            }], function(err, docs) {
            	//注意，这里的sort操作要放在group前面进行
            	console.log(err)
				db.close();
		        if(err) {
		            return callback(err);
		        }
		        callback(null, docs);
    		});
	});
}*/