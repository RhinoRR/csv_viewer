'use strict'

const express = require('express')
const Server = require('http').Server
const formidable = require('formidable-serverless')
const csv = require('csvtojson')
const fs = require('fs')
const app = express()
const port = 2772
const cors = require('cors')
const server = new Server(app)
server.listen(port)

let filePath = ''
let data

app.use(cors())

// __dirname is used here along with package.json.pkg.assets
// see https://github.com/zeit/pkg#config and
// https://github.com/zeit/pkg#snapshot-filesystem
app.use('/', express.static(__dirname + '/public'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

app.post('/uploadFile',async (req, res, next)=>{

  let form = new formidable.IncomingForm()

 await form.parse(req);

  form.on('fileBegin', function (name, file){
      file.path = __dirname + '/public/csv/' + file.name;
      
  });

 form.on('file', function (name, file){
      console.log('Uploaded ' + file.name)
      let oldpath = file.path
      let newpath = __dirname +`\\public\\csv\\${file.name}`
  fs.rename(oldpath, newpath, function (err) {
          if (err) throw err;
          filePath = newpath
          console.log('File uploaded and moved!'+ filePath);
          res.end();
        });
   
  
      console.log("The file was stored in "+newpath)

 
  });
  res.status(302)
  res.header("Location",`/parseCSV`)
})

app.get('/parseCSV', (req, res, next)=>{
 
 csv().fromFile(filePath).then((jsonObj)=>{
      data = jsonObj
      //console.log(data)
  })

  res.sendFile(__dirname+"/public/success.html")

})

app.get('/viewData', (req,res)=>{ 
  //console.log("The data is here now "+JSON.stringify(data))

  res.json({data})
  //res.end()
})
