var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto'); //加密密码
const validator = require('validator'); //表单验证
const Basic = require('../models/basic.js');
const Page = require('../models/page.js');
const ObjectID = require('mongodb').ObjectID;
const Function = require('../models/function.js');

/* GET home page. */
/**
 * 首页
 * @method /
 * @param {String} ification 分类数据库文档
 * @param {String} delete 分类逻辑删除 0否 1是
 * @param {Object} ification 输出的分类
 *
 */
router.get('/index', function(req, res, next) {
	res.redirect('/');
})
router.get('/', function(req, res, next) {
	//toplevel，查找成功案例下的分类
	Basic.findOne('toplevel', {
		type: '1'
	}, {}, function(err, result) {
		if(err) {
			return res.redirect('/404');
		}
		let objId = [];
		if(result){
			for(let key in result.ification) {
				objId.push(ObjectID(result.ification[key]))
			}
		}
		//获取分类列表
		Basic.findData('ification', {
			_id: {
				"$in": objId
			},
			delete: 0
		}, {
			title: 1,
			describe: 1
		}, function(err1, result1) {
			if(err1) {
				return res.redirect('/404');
			}
			/*res.render('web/index/index', {
				title: '信嘉法律咨询',
				selected: 'index',
				ification: result1
			});*/
			//获取所有分类
			Basic.findData('ification', {delete: 0}, {title: 1,describe: 1}, function(err4, result4) {
				if(err4) {
					return res.redirect('/404');
				}
				//获取专业特长
				Basic.findOne('toplevel', {type: 'professional'}, {}, function(err3, result3){
					if(err3) {
						return res.redirect('/404');
					}
					//获取法律知识
					Basic.findOne('toplevel', {type: 'law'}, {}, function(err5, result5){
						if(err5) {
							return res.redirect('/404');
						}
						//获取下载分类
						Basic.findData('download_ification', {delete: 0}, {title: 1}, function(err2, result2){
							if(err2) {
								return res.redirect('/404');
							}
							let objId = [];
							for(let key in result2) {
								objId.push(result2[key]._id.toString());
							}
							var docs = [];
							var findOne = function(i){
								Page.find('download_file', {
									ification: objId[i]
								}, {}, 1, 4, function(error, doc) {
									if(error) {
										return res.redirect('/404');
									}
									if(i>=objId.length){
										//获取分类下的文章
										//console.log(docs)
										res.render('web/index/index', {
											title: '信嘉法律咨询',
											selected: 'index',
											ification: result1,
											professional: result3?result3.professional:[],
											ification_whole: result4,
											download_ification: result2,
											download: docs,
											law: result5?result5.professional:[],
										});
									}else{
										docs = [...docs, ...doc];
										findOne(++i);
									}
								})
							}
							findOne(0);
						});
					})
				})
			})
		})
	})
});

/**
 * 分类列表页
 * @method index/list
 * @param {String} ification 分类数据库文档
 * @param {String} delete 分类逻辑删除 0否 1是
 * @param {Object} ification 输出的分类
 */
router.get('/index/ification', function(req, res, next) {
	return res.redirect('/index/ification/index');
})
router.get('/index/ification/:type', function(req, res, next) {
	if(req.params.type != 1 && req.params.type != 2 && req.params.type != 'index') {
		return res.redirect('/index/ification/index');
	}
	if(req.params.type == 1 || req.params.type == 2){
		//toplevel，查找分类
		Basic.findOne('toplevel', {
			type: req.params.type
		}, {}, function(err, result) {
			if(err) {
				return res.redirect('/404');
			}
			let objId = [];
			if(result){
				for(let key in result.ification) {
					objId.push(ObjectID(result.ification[key]))
				}
			}else{
				return res.redirect('/'); 
			}
			//获取分类列表
			Basic.findData('ification', {
				_id: {
					"$in": objId
				},
				delete: 0
			}, {}, function(err1, result1) {
				if(err1) {
					return res.redirect('/404');
				}
				//获取分类下的文章
				let objId = [];
				for(let key in result1) {
					objId.push(result1[key]._id.toString());
				}
				if(objId.length<200){
					var docs = [];
					var findOne = function(i){
						Page.find('articlecollection', {
							ification_id: objId[i],
							label: req.params.type
						}, {}, 1, 10, function(error, doc) {
							if(error) {
								return res.redirect('/404');
							}
							if(i>=objId.length){
								//获取分类下的文章
								//console.log(docs)
								res.render('web/article/ification', {
									title: '信嘉法律咨询-分类列表',
									selected: req.params.type,
									type: req.params.type,
									ification: result1,
									article: docs
								});
							}else{
								docs = [...docs, ...doc];
								findOne(++i);
							}
						})
					}
					findOne(0);
				}else{
					//查找文章
					Basic.findData('articlecollection', {
						ification_id: {
							"$in": objId
						},
						label: req.params.type
					}, {}, function(err2, result2) {
						if(err2) {
							return res.redirect('/404');
						}
						//获取分类下的文章
						res.render('web/article/ification', {
							title: '信嘉法律咨询-分类列表',
							selected: req.params.type,
							type: req.params.type,
							ification: result1,
							article: result2
						});
					})
				}
			})
		})
	}else{
		Basic.findData('ification', {
			delete: 0
		}, {}, function(err, result) {
			if(err) {
				return res.redirect('/404');
			}
			let objId = [];
			for(let key in result) {
				objId.push(result[key]._id.toString());
			}
//			Page.findData('articlecollection', {
//				ification_id: {
//					"$in": objId
//				}
//			}, {}, 1, 1, function(err1, result1) {
//				
//			})
			if(objId.length<200){
				var docs = [];
				var findOne = function(i){
					Page.find('articlecollection', {
						ification_id: objId[i]
					}, {}, 1, 10, function(error, doc) {
						if(error) {
							return res.redirect('/404');
						}
						if(i>=objId.length){
							//获取分类下的文章
							//console.log(docs)
							res.render('web/article/ification', {
								title: '信嘉法律咨询',
								selected: req.params.type,
								type: req.params.type,
								ification: result,
								article: docs
							});
						}else{
							docs = [...docs, ...doc];
							findOne(++i);
						}
					})
				}
				findOne(0);
			}else{
				//查找文章
				Basic.findData('articlecollection', {
					ification_id: {
						"$in": objId
					}
				}, {}, function(err1, result1) {
					if(err1) {
						return res.redirect('/404');
					}
					//获取分类下的文章
					res.render('web/article/ification', {
						title: '信嘉法律咨询',
						selected: req.params.type,
						type: req.params.type,
						ification: result,
						article: result1
					});
				})
			}
		})
		
	}
})





/**
 * 文章列表页
 * @method index/list
 * @param {String} ification 分类数据库文档
 * @param {String} delete 分类逻辑删除 0否 1是
 * @param {Object} ification 输出的分类
 */
router.get('/index/list', function(req, res, next) {
	return res.redirect('/index/list/index');
})
router.get('/index/list/:type', function(req, res, next) {
	if(req.params.type != 1 && req.params.type != 2 && req.params.type != 'index') {
		return res.redirect('/index/list/index');
	}
	Basic.findOne('ification', {
		delete: 0
	}, {}, function(err, result) {
		if(err) {
			return res.redirect('/404');
		}
		return res.redirect('/index/list/'+req.params.type+'/'+result._id);
	})
})
router.get('/index/list/:type/:ification', function(req, res, next) {
	var page = req.query.page ? req.query.page : '1';
	if(req.params.type != 1 && req.params.type != 2 && req.params.type != 'index') {
		return res.redirect('/index/list');
	}
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	if(req.params.type == 1 || req.params.type == 2) {
		var opation = {
			type: req.params.type
		};
		//toplevel，查找分类
		Basic.findOne('toplevel', opation, {}, function(err, result) {
			if(err) {
				return res.redirect('/404');
			}
			let objId = [];
			for(let key in result.ification) {
				objId.push(ObjectID(result.ification[key]))
			}
			//获取分类列表
			Basic.findData('ification', {
				_id: {
					"$in": objId
				},
				delete: 0
			}, {}, function(err1, result1) {
				if(err1) {
					return res.redirect('/404');
				}
				//获取分类下的文章
				var opation1 = {
					ification_id: req.params.ification
				}
				if(req.query.label == 1 || req.query.label == 2) {
					opation1.label = req.query.label
				}
				var strip = 10;
				Page.find('articlecollection', opation1, {}, page, strip, function(err2, docs, total) {
					if(err2) {
						return res.redirect('/404');
					}
					Basic.findOne('about', {type: 1}, {}, function(err3, result3){
						if(err3){
							return res.redirect('/404');
						}
						console.log(result3)
						res.render('web/article/list', {
							title: '信嘉法律咨询-文章列表',
							selected: null,
							ification: result1,
							article: docs,
							type: req.params.type,
							label: req.query.label,
							page: Math.ceil(total / strip),
							curr: page,
							about: result3?result3:{},
							ification_curr: req.params.ification,
							formatDateTime: Function.formatDateTime
						});
					})
				})
			})
		})
	} else if(req.params.type == 'index') {
		var opation = {
			delete: 0
		};
		Basic.findData('ification', opation, {}, function(err, result) {
			if(err) {
				return res.redirect('/404');
			}
			//获取分类下的文章
			var opation1 = {
				ification_id: req.params.ification
			}
			if(req.query.label == 1 || req.query.label == 2) {
				opation1.label = req.query.label
			}
			var strip = 20;
			Page.find('articlecollection', opation1, {}, page, strip, function(err2, docs, total) {
				if(err2) {
					return res.redirect('/404');
				}
				Basic.findOne('about', {type: 1}, {}, function(err3, result3){
					if(err3){
						return res.redirect('/404');
					}
					res.render('web/article/list', {
						title: '信嘉法律咨询-文章列表',
						selected: null,
						ification: result,
						article: docs,
						type: req.params.type,
						label: req.query.label,
						page: Math.ceil(total / strip),
						curr: page,
						about: result3,
						ification_curr: req.params.ification,
						formatDateTime: Function.formatDateTime
					});
				})
			})
		})
	}
});





/**
 * 文章详情页
 * @method /index/article
 * @param {String} article_id 文章id
 */
router.get('/index/article/:article_id', function(req, res, next) {
	var article_id = req.params.article_id;
	if(!validator.isByteLength(article_id, {min:24, max:24})){
		return res.redirect('/404');
	}
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	//获取文章存不存在
	Basic.findOne('articlecollection', {article_id: ObjectID(article_id)}, {}, function(err, result){
		//console.log(result)
		if(err || !result){
			return res.redirect('/404');
		}
		//获取分类
		Basic.findOne('ification', {delete: 0, _id: ObjectID(result.ification_id)}, {describe: 0}, function(err1, result1){
			if(err1){
				return res.redirect('/404');
			}
			//获取文章详情
			var opation = {
				_id: ObjectID(result.article_id)
			};
			var screem = {};
			//console.log(result.collection)
			Basic.findOne(AdmincConst.SOLPREFIX + result.collection, opation, screem, function(err2, result2){
				if(err2||!result2){
					return res.redirect('/404');
				}
				//查找上一条
				Page.findAdjacent(AdmincConst.SOLPREFIX + result.collection, {
					_id: { '$lt': ObjectID(result.article_id) }
				}, {}, 1, function(err3, result3){
					if(err3){
						return res.redirect('/404');
					}
					//查找下一条
					Page.findAdjacent(AdmincConst.SOLPREFIX + result.collection, {
						_id: { '$gt': ObjectID(result.article_id) }
					}, {}, 1, function(err4, result4){
						if(err4){
							return res.redirect('/404');
						}
						//获取最新10篇文章
						Page.find('articlecollection', {}, {}, 1, 10, function(error, docs, total) {
							if(error) {
								return res.redirect('/404');
							}
							//文章
							res.render('web/article/details', {
								title: '信嘉法律咨询',
								selected: null,
								ification: result1,
								article: result2,
								prev: result3[0],
								next: result4[0],
								docs: docs,
								formatDateTime: Function.formatDateTime
							});
						})
					})
				})
			})
		})
	})
})




//网站留言
router.get('/index/messages', function(req, res, next) {
	res.render('web/about/messages', {
		title: '信嘉法律咨询-留言咨询'
	});
})
router.post('/index/messages', function(req, res, next) {
	if(req.body.name.length>6 || req.body.name.length<2){
		return res.json({
			code: 101,
			msg: '联系人输入不正确'
		});
	}
	if(req.body.tel.length>100 || req.body.tel.length<5){
		return res.json({
			code: 101,
			msg: '联系方式输入不正确'
		});
	}
	if(req.body.content.length>600 || req.body.content.length<2){
		return res.json({
			code: 101,
			msg: '咨询问题输入不正确'
		});
	}
	var data = {
		name: req.body.name,
		tel: req.body.tel,
		content: req.body.content,
		type: 0,
		time: new Date().getTime().toString()
	}
	Basic.insertOne('messages', data, function(err, result){
		if(err){
			return res.json({
				code: 101,
				msg: '留言失败'
			});
		}
		res.status(200);
    	return res.json({
			code: 200,
			msg: '留言成功'
		});
	})
})




//关于我们
router.get('/index/about', function(req, res, next) {
	Basic.findOne('about', {type: 1}, {}, function(err, result){
		if(err){
			return res.redirect('/404');
		}
		//获取最新10篇文章
		Page.find('articlecollection', {}, {}, 1, 10, function(error, docs, total) {
			if(error) {
				return res.redirect('/404');
			}
			//文章
			res.render('web/about/index', {
				title: '信嘉法律咨询-关于我们',
				selected: 'about',
				article: result?result:{},
				docs: docs,
				formatDateTime: Function.formatDateTime
			});
		})
	})
})




//文件下载列表页
router.get('/index/download/:type', function(req, res, next) {
	//获取分类列表
	var page = req.query.page ? req.query.page : '1';
	if(!validator.isNumeric(page)){
		res.redirect('/download/index');
	}
	page = parseInt(page);
	//输出分类
	Basic.findData('download_ification', {delete: 0}, {describe: 0}, function(err, result){
		if(err){
			return res.redirect('/404');
		}
		var opation = {}
		if(req.params.type != 'index'){
			opation.ification = req.params.type;
		}
		var strip = 10;
		Page.find('download_file', opation, {}, page, strip, function(err1, docs, total){
			if(err1){
				return res.redirect('/404');
			}
			res.render('web/download/index', {
				title: '信嘉法律咨询-资料下载',
				selected: null,
				type: req.params.type,
				page: Math.ceil(total / strip),
				curr: page,
				download_ification: result,
				download: docs,
				formatDateTime: Function.formatDateTime
			});
		})
	})		
});

/*//文件下载
router.get('/uploads/download/:time/:fileName', function(req, res, next) {
 	// 实现文件下载 
 	console.log('uploads/download/'+req.params.time+'/'+req.params.fileName)
	res.download('uploads/download/'+req.params.time+'/', req.params.fileName);
});*/

//咨询留言consultation
router.get('/index/consultation', function(req, res, next) {
	var page = req.query.page ? req.query.page : '1';
	var strip = 10;
	Page.find('messages', {}, {}, page, strip, function(err, docs, total){
		if(err){
			return res.redirect('/admin/404');
		}
		res.render('web/about/consultation', {
			title: '信嘉法律咨询-咨询留言',
			selected: 'consultation',
			docs: docs,
			page: Math.ceil(total / strip),
			curr: page,
			formatDateTime: Function.formatDateTime
		});
	})
})


module.exports = router;