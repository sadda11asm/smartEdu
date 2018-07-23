 let bcrypt = require('bcryptjs');
let model = require('../models/request');
let axios = require('axios');

exports.getTeachersList = async function (req){
	try {
		let request = JSON.parse(req.body.request).request;
		console.log("request", request)
		let info = await model.getLessonsNumber(req.cookies['SAI'], req.body.rate);
		if (info.status == 202 || info.status == 400) {
			return info;
		}
		let count = info.count;
		let min;
		if (count==1) min =1;
		else min = count/4;
		// console.log("MIN", min);
		info = await model.getTeachers();
		if (info.status == 202 || info.status == 400) {
			return info;
		}
		let teachers = info.body[0];
		// console.log("teachers", teachers);
		let matched=[];
		for (let i=0;i<teachers.length;i++) {
			let cnt = 0;
			let data1 = (await model.getTeacherGraph(teachers[i]["id"]));
			if (data1.status == "202") {
				// console.log("NO GRAPH FOR TEACHER ", teachers[i]["id"])
				continue;
			}
			let data = data1.body
			console.log("data", data);
			for (let j=0;j<data.length;j++) {
				let day = data[j]['nday'];
				let start = parseInt(data[j]['start']);
				let finish = parseInt(data[j]['finish']);
				// console.log("start & finish", start, finish);
				for (let k=0;k<request.length;k++) {
					let req_day = request[k]["day"];
					// console.log("day", day, req_day);
					if (req_day == day) {
						for (let t = 0; t < request[k]["periods"].length;t++) {
							let req_start = parseInt(request[k]["periods"][t]["start"]);
							let req_finish = parseInt(request[k]["periods"][t]["finish"]);
							// console.log('req_start & req_finish', req_start, req_finish)
							if (start>=req_finish || finish<= req_start) {
								continue;
							} else {
								cnt++;
								break;
							}
						}
					}
				}
			}
			if (cnt>=min) {
				matched.push(teachers[i]);
			}
		}
		if (matched.length>0) {
			return {
				status: 200,
				body: matched
			}
		} else {
			return {
				status: 202,
				message: 'none of the teachers matched'
			}
		}
	} catch (err) {
		console.log(err);
		return {
			status: 404,
			message: err.message
		}
	}
}  

exports.sendRequest = async function (req) {
	try {
		let rate = req.body.rate;
		let teacher = req.body.teacher;
		let id = req.cookies['SAI'];
		let level = await model.getLowestLevel(rate);
		console.log(level);
		if (level == null) {
			throw new Error("No any level of this rate");
		}
		let request = JSON.parse(req.body.request).request;
		return await model.sendRequest(id, rate, teacher, request, level);
	} catch (err) {
		console.log(err);
		return {
			status: 404,
			message: err.message
		}
	}
}