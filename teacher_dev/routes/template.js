let connect = require('../modules/connect');

module.exports = async function(req,res) 
{
    if(!req.cookies['SAI'])
    {
        res.status(418).json({message: 'no index'});
    }
    else
    {
        if(!req.body.method)
        {
            res.status(405).json({message: 'no method'});
        }
        else
        {
            let con = await connect();
            try
            {
                switch(req.body.method)
                {
                    case "REVERSE":
                    if(!req.body.first || !req.body.second)
                    {
                        res.status(418).json({message: 'no first or second'});
                    }
                    else
                    {
                        let [firstinfo] = await con.query('select * from template where id = ?', req.body.first);
                        let [secondinfo] = await con.query('select * from template where id = ?', req.body.second);
                        console.log(firstinfo[0])
                        console.log(secondinfo[0])
                        await con.query('update template as t set t.order = ? where t.id = ?', [firstinfo[0].order, secondinfo[0].temp_id]);
                        await con.query('update template as t set t.order = ? where t.id = ?', [secondinfo[0].order, firstinfo[0].temp_id]);
                        
                        res.sendStatus(200);
                    }
                    break;
                    case 'GET-TEMP':
                    if(!req.body.group_id)
                    {
                        res.status(418).json({message: 'no group_id'});
                    }
                    else
                    {
                        let group_id = req.body.group_id;
                        let template_id = await con.query(`
                                select id temp_id from smartEdu.template
                                where rate in (select rate from smartEdu._group where id = 1) 
                                and lesson in (select min(lesson) from smartEdu.chart where _group = 1) 
                                and level in (select level from smartEdu._group where id = 1) 
                                and teacher = 1 order by template.ord
                                and dz = null`
                            ,[group_id,group_id,group_id,req.cookies['SAI']]);
                        
                        if(template_id[0].length > 0)
                        {
                            let mas = [];

                            for(let i = 0; i<template_id[0].length; i++)
                            {
                                 let templates = await con.query('select * from content where template = ? ', template_id[0][i].temp_id);
                                 mas.push(templates[0]);
                            }
                                
                            let used_temps = await con.query('select template from usedTemplate where teacher = ? and _group = ?', 
                                [req.cookies['SAI'], group_id]);    

                            res.status(200).json({body: mas, used: used_temps[0]});
                        }
                        else
                        {
                            res.status(202).json({message: 'no template'});
                        }
                    }
                    break;
                    case 'USE':
                    if(!req.body.temp_id || !req.body.group_id)
                    {
                        res.status(418).json({message: 'no temp-id or group_id'});
                    }
                    else
                    {
                        console.log('body',req.body);
                        console.log('cookie',req.cookies['SAI'])
                        let used = await con.query('insert into usedTemplate(teacher, template, _group) values (?,?,?)', 
                            [req.cookies['SAI'], req.body.temp_id, req.body.group_id]);

                        if(used[0].affectedRows > 0)
                        {
                            res.status(200).json({message: 'ok'});
                        }
                        else
                        {
                            res.status(202).json({message: 'troubles with insert'})
                        }
                    }
                    break;
                    case 'GET-PATH-TO-TEMPLATE':

                    let rate = await con.query(`SELECT r.id, r.name, r.title, r.content, r.cost, r.lessons, r.unlim, r.type, r.company FROM .rate r
                                                join .company c on c.id = r.company
                                                join .teacher t on t.company =  c.id
                                                where t.id = ?`, req.cookies['SAI']);

                    let level = await con.query(`SELECT l.id, l.name, l.rate 
                                                from .level l
                                                join .rate r on l.rate = r.id
                                                join .company c on c.id = r.company
                                                join .teacher t on t.company = c.id
                                                where t.id = ?`, req.cookies['SAI']);

                    if(rate[0].length > 0 && level[0].length > 0)
                    {

                      let rateListObj = {};
                      let rateListArr = [];

                      for (var i = 0; i < rate[0].length; i++) {

                        let lvlListObj = {};
                        let lvlListArr = [];

                        for (var k = 0; k < level[0].length; k++) {

                            let lesson = await con.query('select id, lessons from .rate where id = ?', rate[0][i].id);

                          if (level[0][k].rate == rate[0][i].id) 
                          {

                            lvlListObj = {
                            lvl_id: level[0][k].id,
                            lvl_name: level[0][k].name,
                            lessons: lesson[0][0].lessons
                            }

                            lvlListArr.push(lvlListObj);

                          }

                        }
                            rateListObj = {
                              rate_id: rate[0][i].id,
                              rate_name: rate[0][i].name,
                              level: lvlListArr
                            }

                            rateListArr.push(rateListObj)
                    
                        }
                            res.status(202).json(rateListArr);
                    }
                    else
                    {
                      res.status(202).json({message: 'empty'});
                    }

                    break;
                    case 'GET':
                    if (req.body.rate_id && req.body.lesson_num && req.body.lvl_id) {

                        let temp = await con.query(`select 
                                                    t.id as temp_id, 
                                                    t.rate as rate_id, 
                                                    t.lesson as lesson_num, 
                                                    teacher.id as teacher_id, 
                                                    level.name as lvl_name, 
                                                    t.ord,
                                                    t.dz
                                                    from smartEdu.template t 
                                                    join smartEdu.level on level.id = t.level
                                                    join smartEdu.teacher on teacher.id = ?
                                                    where t.rate = ?
                                                    and t.lesson = ?
                                                    and t.level = ?
                                                    order by t.ord;`, 
                                                    [req.cookies['SAI'], req.body.rate_id, req.body.lesson_num, req.body.lvl_id]);

                        
                        if (temp[0].length>0) {

                            let template = [];
                            let templateObj = {};

                            for (var i = 0; i < temp[0].length; i++) {

                                let content = await con.query('select template as temp_id, content, type, id as cont_id from .content where template=?', [temp[0][i].temp_id]);

                                templateObj = {
                                    order: temp[0][i].ord,
                                    temp_id: temp[0][i].temp_id,
                                    dz: temp[0][i].dz,
                                    content: content[0]
                                }
                                template.push(templateObj);
                            }

                            res.status(200).json({template});

                        } else {

                            res.status(202).json({message: 'empty temp'});

                        }

                    } else {

                        res.status(202).json({message: 'empty'});

                    }
                    break;
                    
                    case 'POST':
                    if (req.body.data && req.body.rate_id && req.body.lesson_num && req.body.lvl_id && req.body.dz) {

                        let data = JSON.parse(req.body.data)
                        
                        let temp = await con.query('insert into template (rate, teacher, lesson, level, dz) values (?,?,?,?,?)', [req.body.rate_id, req.cookies['SAI'], req.body.lesson_num, req.body.lvl_id, req.body.dz]);
     
                        let w =  await con.query('update template as t set t.ord = ? where id = ?', [temp[0].insertId, temp[0].insertId]);

                        if (temp[0].affectedRows>0) {
                            for (var i = 0; i < data.length; i++) {
                                let type = data[i].type;
                                let content = data[i].content;
                                if (content.replace(/\s+/g, '')!='') {
                                    let cont = await con.query('insert into content (template, type, content) values (?,?,?)', [temp[0].insertId, type, content]);
                                }
                            }

                            let newContent = await con.query('select template as temp_id, content, type, id as cont_id from .content where template=?', [temp[0].insertId]);
                            if (newContent[0].length>0) {
                                let [tempinfo] = await con.query(`select * from template where id = ?`, temp[0].insertId);
                                res.status(202).json({temp_id: tempinfo[0].id, order: tempinfo[0].ord, content: newContent[0], dz: tempinfo[0].dz});
                                
                            } else {
                                await con.query(`delete from template where id=?`, [temp[0].insertId]);
                                res.status(202).json({message: 'content not found'});

                            }
                        } else {

                            res.status(202).json({message: 'template not created'});

                        }
                        
                    } else {

                        res.status(202).json({message: 'empty'});

                    }
                    break;
                    case 'PATCH':

                    if (req.body.data && req.body.temp_id && req.body.rate_id && req.body.lesson_num && req.body.lvl_id && req.body.dz) {

                        await con.query('delete from content where template = ?', [req.body.temp_id]);

                        let data = JSON.parse(req.body.data)

                        for (var i = 0; i < data.length; i++) {
                            let type = data[i].type;
                            let content = data[i].content;
                            if (content.replace(/\s+/g, '')!='') {
                                let cont = await con.query('insert into content (template, type, content) values (?,?,?)', [req.body.temp_id, type, content]);
                            }
                        }

                        let newContent = await con.query('select * from .content where template=?', [req.body.temp_id]);

                        if (newContent[0].length>0) {
                            await con.query('update template as t set t.dz = ? where id = ?', [req.body.dz, req.body.temp_id]);
                            let [tempinfo] = await con.query(`select * from template where id = ?`, req.body.temp_id);
                            res.status(200).json({temp_id: req.body.temp_id, order: tempinfo[0].ord, content: newContent[0], dz: tempinfo[0].dz});

                        } else {

                            await con.query(`delete from template where id=?`, [req.body.temp_id])
                            res.status(202).json({message: 'content not found'});

                        }


                    } else {

                        res.status(202).json({message: 'empty'});

                    }
                    break;
                    case 'DELETE':
                    if (req.body.temp_id) {

                        let content = await con.query('delete from content where template = ?', [req.body.temp_id]);
                        let template = await con.query('delete from template where id = ?', [req.body.temp_id]);

                        if (template[0].affectedRows>0) {

                            res.status(200).json({message: 'template deleted'});

                        } else {

                            res.status(200).json({message: 'template not found'});

                        }

                    } else {

                        res.status(202).json({message: 'empty'});

                    }
                    break;
                    default:
                    res.status(405).json({message: 'Invalid method'});
                    break;
                }
            }
            catch(err)
            {
                console.log(err);
            }
            finally
            {   
                con.end();
                con.destroy();
            }
        }
    }
};