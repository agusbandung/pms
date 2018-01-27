var express = require('express');
var router = express.Router();
let pg = require('pg');
let conString = "postgres://postgres:1234@localhost:5432/pms";
let client = new pg.Client(conString);
const bodyParser = require('body-parser');


/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login Page' } );
});

// router.get('/', function(req, res, next) {
//   client.connect();
//   let url = (req.url == "/") ? "/?page=1" :req.url;
//   let page = Number(req.query.page) || 1;
//   if(url.indexOf('&search=') != -1){
//     page = 1;
//   }
//   url = url.replace('&search=', '')
//   let params = []
//   let isfilter = false;
//   let sql = 'SELECT count(*) as total FROM vproject'
//   if(req.query.cid && req.query.id){
//     params.push(`projectid = '${req.query.projectid}'`);
//     isfilter = true;
//   }
//   if (req.query.cname && req.query.name) {
//     params.push(`name = '${req.query.name}'`);
//     isfilter = true;
//   }
//   if (req.query.cmember && req.query.member) {
//     params.push(` = '${req.query.member}'`);
//     isfilter = true;
//   }
//
//   if (isfilter) {
//
//     sql += ' WHERE ' + params.join(' AND ')
//   }
//
//   //menghitung semua data yang ada di Database
//   client.query(sql, (err, data)=>{
//     if(err){
//       return data.send(err);
//     }
//
//     //pagination
//
//     let limit = 3
//     let offset = (page-1) * 3
//     let total = data.rows[0].total;
//     let pages = (total == 0) ? 1 : Math.ceil(total/limit);
//     sql = "SELECT * FROM vproject";
//     if(isfilter){
//       sql += ' WHERE ' + params.join(' AND ')
//     }
//     sql += ` LIMIT ${limit} OFFSET ${offset}`;
//     client.query(sql, (err, data) => {
//       res.render('project',{title:"pms",rows : data.rows, query : req.query, pagination:{page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}});
//
//     })
//   });
// });

router.post('/', function(req, res){
  //mengambil data user dari Database
  let email = req.body.email;
  let pass = req.body.password;
  client.connect();
  client.query("SELECT * FROM users WHERE email = $1 and password = $2", [email, pass],(err, data)=>{
   if(err) {
     return res.send(err);
   }

//  if(emid == data.rows['email'] && pass == data.rows['password']){
     if(data.rows.length > 0){
     req.session.email = email;
     res.redirect('/project')
   }else{
     res.redirect('/')
   }
 });
})

router.get('/project', function(req, res){
  if(req.session.email){
    res.render('project', { title: 'Express' });
  }else{
    res.redirect('/')
  }

})

router.post('/index', function(req, res){
  //mengambil data user dari Database
  let email = req.body.email;
  let pass = req.body.password;
  client.query("SELECT * FROM users WHERE email = $1 and password = $2", [email, pass],(err, data)=>{
   if(err) {
     return res.send(err);
   }
   if(data.rows.length > 0){
     req.session.email = email;
     res.redirect('/project')
   }else{
     res.redirect('/')
   }
 });
})

router.get('/add', function(req, res, next){
  client.query(`select * from users order by firstname`, (err, data)=>{
    res.render('add',{data:data.rows});
})

router.post('/add', function(req, res, next){
  let isi = req.body;
  let tambah =  "insert into projects(name) values($1)";
   client.query(tambah, [isi.name], (err, data) => {
      if (err) {
        return res.send(err);
        }
        res.redirect('/projects');
  })
})
})
router.get ('/delete/:id', function(req,res) {
  var id = req.params.id
  client.query (`DELETE FROM vproject Where projectid= '${id}'`, (err,rows) =>{
    if(err) {
      console.error(err)
      return res.send(err);
    }
    if(rows.length > 0){
      res.render('delete', {item: rows[0]});
    }else{
      res.redirect('/');
    }
  })
})


router.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/')
  })
})


module.exports = router;
