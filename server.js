const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require('path');
const LinvoDB = require("linvodb3");
LinvoDB.dbPath = `${process.cwd()}/vas-db`; 

//2nd parameter object defines schema for table
let Calls = new LinvoDB("Calls", {
  room:String,
  jobId:Number,
  createdAt:{type:Date, default:new Date()},
  createdBy:Number,
  isOpen:{type:Boolean, default:false},
  jobsCompleted:[Number],
  comments:String,
  answeredAt:{type:Date, default:new Date()},
  completedBy:{type:Number, default:null},
  completedAt:{type:Date, default:null}
});
let Users = new LinvoDB("Users", {
  fullname:String,
  username:String,
  contactId:Number,
  password:'lisa8484',
  role:{type:String, default:'user'},
  createdAt:{type:Date, default:new Date()},
});
Users.ensureIndex({ fieldName: 'username', unique: true });
Users.ensureIndex({ fieldName: 'contactId', unique: true });

let Procedures = new LinvoDB("Procedures", {
  procedureId:Number,
  name:String,
  description:String
});
Procedures.ensureIndex({ fieldName: 'procedureId', unique: true });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.get("/home", (req, res) => {
  res.send('server reached');
});

app.post('/custom-query',(req,res)=>{
  
});

////ROUTES
//ADMIN

app.post('/admin-login', (req, res)=>{
  Users.find({username:req.body.username.toLowerCase()}, (err, user)=>{
    if(err) res.send(err);
    if(user[0].password.toLowerCase() === req.body.password){
      let loggedUser = user[0];
      delete loggedUser.password;
      res.send(loggedUser);
    } else {
      res.send(false);
    }
  })
});

app.post('/add-user', (req, res)=>{
  Users.find({}).sort({ contactId: -1 }).limit(1).exec((err, users)=>{
    newUserData.contactId = users[0].contactId + 1;
    Users.insert(req.body, (err, user)=>{
      if(err) res.send(err);
      res.send(true);
    });
  });
});

app.get('/get-all-users', (req, res)=>{
  Users.find({}, function (err, users) {
    if(err) res.send(err);
    res.send(users);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
