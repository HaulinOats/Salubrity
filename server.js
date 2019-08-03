const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require('path');
const LinvoDB = require("linvodb3");
LinvoDB.dbPath = `${process.cwd()}/vas-db`; 

//2nd parameter object defines schema for table
let Calls = new LinvoDB("Calls", {
  room:String,
  job:String,
  comments:{type:String, default:null},
  contact:Number,
  createdAt:{type:Date, default:new Date()},
  isOpen:{type:Boolean, default:false},
  proceduresDone:[],
  completedBy:{type:Number, default:null},
  completedAt:{type:Date, default:null}
});
let Users = new LinvoDB("Users", {
  fullname:String,
  username:String,
  contactId:Number,
  password:String,
  role:{type:String, default:'user'},
  createdAt:{type:Date, default:new Date()},
});
Users.ensureIndex({ fieldName: 'username', unique: true });
Users.ensureIndex({ fieldName: 'contactId', unique: true });

let Procedures = new LinvoDB("Procedures", {
  procedureId:Number,
  procedure:String,
  field:String,
  subField:{type:String, default:null}
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
//APP
app.post('/add-call', (req, res)=>{
  Calls.insert(req.body, (err, call)=>{
    if(err) res.send(err);
    res.send(call);
  });
});

app.get('/get-active-calls', (req, res)=>{
  Calls.find({completedAt:{$exists:false}}, (err, calls)=>{
    if(err) res.send(err)
    res.send(calls);
  })
});

app.post('/set-call-as-open', (req, res)=>{
  Calls.findOne(req.body, (err, call)=>{
    call.isOpen = true;
    call.save((err)=>{
      if(err) res.send(err);
      res.send(true);
    })
  });
});

app.post('/set-call-as-unopen', (req, res)=>{
  Calls.findOne(req.body, (err, call)=>{
    call.isOpen = false;
    call.save((err)=>{
      if(err) res.send(err);
      res.send(true);
    })
  });
});

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

function getProcedureSeed(){
  return [
    {
      procedureId:1,
      procedure:'PIV Start',
      field:'24g',
      subField:'1 Attempt'
    },
    {
      procedureId:2,
      procedure:'PIV Start',
      field:'24g',
      subField:'2 Attempts'
    },
    {
      procedureId:3,
      procedure:'PIV Start',
      field:'24g',
      subField:'US Used'
    },
    {
      procedureId:4,
      procedure:'PIV Start',
      field:'22g',
      subField:'1 Attempt'
    },
    {
      procedureId:5,
      procedure:'PIV Start',
      field:'22g',
      subField:'2 Attempts'
    },
    {
      procedureId:6,
      procedure:'PIV Start',
      field:'22g',
      subField:'US Used'
    },
    {
      procedureId:7,
      procedure:'PIV Start',
      field:'20g',
      subField:'1 Attempt'
    },
    {
      procedureId:8,
      procedure:'PIV Start',
      field:'20g',
      subField:'2 Attempts'
    },
    {
      procedureId:9,
      procedure:'PIV Start',
      field:'20g',
      subField:'US Used'
    },
    {
      procedureId:10,
      procedure:'PIV Start',
      field:'18g',
      subField:'1 Attempt'
    },
    {
      procedureId:11,
      procedure:'PIV Start',
      field:'18g',
      subField:'2 Attempts'
    },
    {
      procedureId:12,
      procedure:'PIV Start',
      field:'18g',
      subField:'US Used'
    },
    {
      procedureId:13,
      procedure:'Lab Draw',
      field:'From IV',
      subField:'1 Attempt'
    },
    {
      procedureId:14,
      procedure:'Lab Draw',
      field:'From IV',
      subField:'2 Attempts'
    },
    {
      procedureId:15,
      procedure:'Lab Draw',
      field:'From IV',
      subField:'US Used'
    },
    {
      procedureId:16,
      procedure:'Lab Draw',
      field:'Labs Only',
      subField:'1 Attempt'
    },
    {
      procedureId:17,
      procedure:'Lab Draw',
      field:'Labs Only',
      subField:'2 Attempts'
    },
    {
      procedureId:18,
      procedure:'Lab Draw',
      field:'Labs Only',
      subField:'US Used'
    },
    {
      procedureId:19,
      procedure:'Site Care',
      field:'IV Flushed'
    },
    {
      procedureId:20,
      procedure:'Site Care',
      field:'Saline Locked'
    },
    {
      procedureId:21,
      procedure:'Site Care',
      field:'Dressing Changed'
    },
    {
      procedureId:22,
      procedure:'Site Care',
      field:'Dressing Reinforced'
    },
    {
      procedureId:23,
      procedure:'DC IV',
      field:'Infiltration'
    },
    {
      procedureId:24,
      procedure:'DC IV',
      field:'Phlebitis'
    },
    {
      procedureId:25,
      procedure:'DC IV',
      field:'PT Removed'
    },
    {
      procedureId:26,
      procedure:'DC IV',
      field:'Leaking'
    },
    {
      procedureId:27,
      procedure:'DC IV',
      field:'Bleeding'
    },
    {
      procedureId:28,
      procedure:'Port-A-Cath',
      field:'Access',
      subField:'1 Attempt'
    },
    {
      procedureId:29,
      procedure:'Port-A-Cath',
      field:'Access',
      subField:'2 Attempts'
    },
    {
      procedureId:30,
      procedure:'Port-A-Cath',
      field:'De-Access',
      subField:'Contaminated'
    },
    {
      procedureId:31,
      procedure:'Port-A-Cath',
      field:'De-Access',
      subField:'Therapy Complete'
    },
    {
      procedureId:32,
      procedure:'Port-A-Cath',
      field:'De-Access',
      subField:'Needle Change'
    },
    {
      procedureId:33,
      procedure:'Port-A-Cath',
      field:'Cathflow',
      subField:'Initiated'
    },
    {
      procedureId:34,
      procedure:'Port-A-Cath',
      field:'Cathflow',
      subField:'Complete'
    },
    {
      procedureId:35,
      procedure:'PICC Line',
      field:'Removal',
      subField:'Therapy Complete'
    },
    {
      procedureId:36,
      procedure:'PICC Line',
      field:'Removal',
      subField:'Discharge'
    },
    {
      procedureId:37,
      procedure:'PICC Line',
      field:'Removal',
      subField:'Clotted'
    },
    {
      procedureId:38,
      procedure:'PICC Line',
      field:'Removal',
      subField:'Contaminated'
    },
    {
      procedureId:39,
      procedure:'PICC Line',
      field:'Removal',
      subField:'PT Removal'
    },
    {
      procedureId:40,
      procedure:'PICC Line',
      field:'Cathflow',
      subField:'Initiated'
    },
    {
      procedureId:41,
      procedure:'PICC Line',
      field:'Cathflow',
      subField:'Completed'
    },
    {
      procedureId:42,
      procedure:'Dressing Change',
      field:'What',
      subField:'PICC'
    },
    {
      procedureId:43,
      procedure:'Dressing Change',
      field:'What',
      subField:'Port-A-Cath'
    },
    {
      procedureId:44,
      procedure:'Dressing Change',
      field:'What',
      subField:'Central Line'
    },
    {
      procedureId:45,
      procedure:'Dressing Change',
      field:'What',
      subField:'Midline'
    },
    {
      procedureId:46,
      procedure:'Dressing Change',
      field:'Why',
      subField:'Per Protocol'
    },
    {
      procedureId:47,
      procedure:'Dressing Change',
      field:'Why',
      subField:'Bleeding'
    },
    {
      procedureId:48,
      procedure:'Dressing Change',
      field:'Why',
      subField:'Dressing Compromised'
    },
    {
      procedureId:49,
      procedure:'Insertion Procedure',
      field:'Midline'
    },
    {
      procedureId:50,
      procedure:'Insertion Procedure',
      field:'SL PICC'
    },
    {
      procedureId:51,
      procedure:'Insertion Procedure',
      field:'DL PICC'
    },
    {
      procedureId:52,
      procedure:'Insertion Procedure',
      field:'TL PICC'
    }
  ]
}