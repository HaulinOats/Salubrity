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


////ROUTES
//SUPER
app.post('/custom-query',(req,res)=>{
  let newUser = req.body;
  Users.find({}).sort({ contactId: -1 }).limit(1).exec((err, users)=>{
    newUser.contactId = users[0].contactId + 1;
    Users.insert(newUser, (err, user)=>{
      if(err) res.send(err);
      res.send(user);
    });
  });
});

app.get('/seed-procedures', (req, res)=>{
  Procedures.insert(getProcedureSeed(), (err, newDocs) => {
    if(err) res.send(err);
    res.send('procedures seeded');
  });
})

//ADMIN
app.post('/admin-login', (req, res)=>{
  Users.find({username:req.body.username.toLowerCase()}, (err, user)=>{
    if(err) res.send(err);
    if(user[0].password.toLowerCase() === req.body.password.toLowerCase()){
      let loggedUser = user[0];
      delete loggedUser.password;
      res.send(loggedUser);
    } else {
      res.send(false);
    }
  })
});

app.post('/add-user', (req, res)=>{
  let newUser = req.body;
  Users.find({}).sort({ contactId: -1 }).limit(1).exec((err, users)=>{
    newUser.contactId = users[0].contactId + 1;
    Users.insert(newUser, (err, user)=>{
      if(err) res.send(err);
      res.send(user);
    });
  });
});

app.post('/delete-user', (req, res)=>{
  Users.findOne(req.body, (err, user)=>{
    Users.remove(req.body, {}, (err1)=>{
      if(err1) res.send(err1);
      res.send(true)
    });
  });
});

app.get('/get-all-users', (req, res)=>{
  Users.find({role: {$ne: 'super'}}).sort({ contactId: 1 }).exec((err, users)=>{
    if(err) res.send(err);
    res.send(users);
  });
});

app.get('/get-procedures', (req, res)=>{
  Procedures.find().sort({procedureId:1}).exec((err, procedures)=>{
    if(err) res.send(err)
    res.send(procedures);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

function getProcedureSeed(){
  return [{
      procedureId:1,
      name:'Peripheral Site Care',
      description:''
    },
    {
      procedureId:2,
      name:'Peripheral Starts',
      description:''
    },
    {
      procedureId:3,
      name:'Ultrasound PIV Sticks',
      description:''
    },
    {
      procedureId:4,
      name:'Ultrasound Lab Sticks',
      description:''
    },
    {
      procedureId:5,
      name:'Lab Draw',
      description:''
    },
    {
      procedureId:6,
      name:'PICC DSG &Delta;',
      description:''
    },
    {
      procedureId:7,
      name:'CL DSG &Delta;',
      description:''
    },
    {
      procedureId:8,
      name:'ML DSG &Delta;',
      description:''
    },
    {
      procedureId:9,
      name:'Port DSG &Delta;',
      description:''
    },
    {
      procedureId:10,
      name:'PICC Site Check',
      description:''
    },
    {
      procedureId:11,
      name:'CL Site Check',
      description:''
    },
    {
      procedureId:12,
      name:'ML Site Check',
      description:''
    },
    {
      procedureId:13,
      name:'Port Site Check',
      description:''
    },
    {
      procedureId:14,
      name:'Port Access',
      description:''
    },
    {
      procedureId:15,
      name:'Port De-Access',
      description:''
    },
    {
      procedureId:16,
      name:'PICC Placement',
      description:''
    },
    {
      procedureId:17,
      name:'ML Placement',
      description:''
    },
    {
      procedureId:18,
      name:'PICC Troubleshoot',
      description:''
    },
    {
      procedureId:19,
      name:'ML Troubleshoot',
      description:''
    },
    {
      procedureId:20,
      name:'CL Troubleshoot',
      description:''
    },
    {
      procedureId:21,
      name:'Port Troubleshoot',
      description:''
    },
    {
      procedureId:22,
      name:'Cathflow Administration - PICC',
      description:''
    },
    {
      procedureId:23,
      name:'Cathflow Administration - Port',
      description:''
    },
    {
      procedureId:24,
      name:'Cathflow Administration - Central Line',
      description:''
    },
    {
      procedureId:25,
      name:'Custom',
      description:"Here's a really long description for the custom field so I can test what it looks like when it's line-wrapping (or attempting to) and I guess here's a little more text"
    }];
}