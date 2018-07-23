 let bcrypt = require('bcryptjs');
let model = require('../models/test');
let axios = require('axios');

exports.getCourseList = async function (req){
	try {
		let info = await model.getCourseList(req.cookies['SAI']);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}  

exports.getTests = async function (req){
	try {
		let info = await model.getTests(req.cookies['SAI'], req.body.rate);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}  

exports.getTest = async function (req){
	try {
		let info = await model.getTest(req.cookies['SAI'], req.body.test);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}  

exports.checkResult = async function(req) {
	try {
		let info = await model.getResult(req.cookies['SAI'], req.body.test, req.body.result);
		if (info.status ==202) {
			return info;
		} else {
			let body = info.body;
			let result = JSON.parse(req.body.result);
			let correct={};
			let weight = {};
			for (let i =0;i<body.length;i++) {
				correct[i]=body[i]["correct"];
				weight[i] = body[i]["weight"];
			}
			console.log(correct);
			console.log(result);
			let count = 0;
			let percent = 0;
			let overall = 0;
			for (let i =0;i<body.length;i++) {
				console.log(correct[i], result[i]);
				if (correct[i]!=null && result[i]!=null && result[i]==correct[i]) {
					count++;
					percent+=weight[i];
				}
				overall+=weight[i];
			}
			let ans = Math.round(percent/overall*100);
			await model.setResult(req.cookies['SAI'], ans, req.body.test);
			return {
				status: 200,
				message: "result has been calculated",
				count: count,
				percent: ans,
				correct: correct
			}
		}
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
		consol.log(err.message);
	}
}