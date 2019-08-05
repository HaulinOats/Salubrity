const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require('path');
const LinvoDB = require("linvodb3");
LinvoDB.dbPath = `./vas-db`; 

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
  userId:Number,
  password:String,
  role:{type:String, default:'user'},
  createdAt:{type:Date, default:new Date()},
});
Users.ensureIndex({ fieldName: 'username', unique: true });
Users.ensureIndex({ fieldName: 'userId', unique: true });

let Procedures = new LinvoDB("Procedures", { 
  procedureId:Number,
  name:String,
  groups:[
    {
      groupName:String,
      selectType:String,
      groupOptions:[
        {
          value:String,
          taskId:Number
        }
      ]
    }
  ],
  value:String,
  selectType:String
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
  Calls.find({completedAt:{$exists:false}, isOpen:false}, (err, calls)=>{
    if(err) res.send(err)
    res.send(calls);
  })
});

app.get('/get-completed-calls', (req, res)=>{
  var start = new Date();
  start.setHours(0,0,0,0);
  
  var end = new Date();
  end.setHours(23,59,59,999);

  Calls.find({completedAt: {$gte: start, $lt: end}}, (err, calls)=>{
    if(err) res.send(err)
    res.send(calls);
  });
});

app.post('/set-call-as-open', (req, res)=>{
  Calls.findOne(req.body, (err, call)=>{
    if(err) send.send(err);
    if(call.isOpen) {
     res.send('open'); 
    } else {
      call.isOpen = true;
      call.save((err2)=>{
        if(err2) res.send(err);
        res.send(true);
      })
    }
  });
});

app.post('/set-call-as-unopen', (req, res)=>{
  Calls.findOne(req.body, (err, call)=>{
    if(err) res.send(err);
    call.isOpen = false;
    call.save((err2)=>{
      if(err2) res.send(err2);
      res.send(true);
    })
  });
});

app.post('/procedure-completed', (req, res)=>{
  Calls.findOne({_id:req.body.id}, (err, call)=>{
    if(err) res.send(err);
    call.proceduresDone = req.body.proceduresDone;
    call.isOpen = false;
    call.completedBy = req.body.completedBy;
    call.completedAt = new Date();
    call.save((err2)=>{
      if(err2) res.send(err2);
      res.send(call);
    })
  })
});

//ADMIN
app.post('/admin-login', (req, res)=>{
  Users.findOne({username:req.body.username.toLowerCase()}, (err, user)=>{
    if(err) res.send(err);
    if(user){
      if(user.password.toLowerCase() === req.body.password.toLowerCase()){
        let loggedUser = user;
        delete loggedUser.password;
        res.send(loggedUser);
      } else {
        res.send(false);
      }
    } else {
      res.send(false);
    }
  })
});

app.post('/add-user', (req, res)=>{
  let newUser = req.body;
  Users.find({}).sort({ userId: -1 }).limit(1).exec((err, users)=>{
    newUser.userId = users[0].userId + 1;
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
  Users.find({role: {$ne: 'super'}}).sort({ userId: 1 }).exec((err, users)=>{
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
app.get('/seed-super',(req,res)=>{
  Users.insert({
    fullname:'Brett Connolly',
    username:'brett84c',
    userId:1001,
    password:'lisa8484',
    role:'super'
  }, (err, newUser)=>{
    if(err) res.send(err);
    res.send(newUser);
  })
});

app.get('/seed-procedures', (req, res)=>{
  Procedures.insert(getProcedureSeed(), (err, newDocs) => {
    if(err) res.send(err);
    res.send('procedures seeded');
  });
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

function getProcedureSeed(){
  return [
    {
      procedureId:1,
      name:'PIV Start',
      groups:[
        {
          groupName:'Dosage',
          selectType:'single',
          groupOptions:[
            {
              value:'24g',
              taskId:1
            },
            {
              value:'22g',
              taskId:2
            },
            {
              value:'20g',
              taskId:3
            },
            {
              value:'18g',
              taskId:4
            }
          ]
        },
        {
          groupName:'Attempts',
          selectType:'single',
          groupOptions:[
            {
              value:'1 Attempt',
              taskId:5
            },
            {
              value:'2 Attempts',
              taskId:6
            },
            {
              value:'US Used',
              taskId:7
            }
          ]
        }
      ]
    },
    {
      procedureId:2,
      name:'Lab Draw',
      groups:[
        {
          groupName:'Draw Type',
          selectType:'single',
          groupOptions:[
            {
              value:'From IV',
              taskId:8
            },
            {
              value:'Labs Only',
              taskId:9
            }
          ]
        },
        {
          groupName:'Attempts',
          selectType:'single',
          groupOptions:[
            {
              value:'1 Attempt',
              taskId:10
            },
            {
              value:'2 Attempts',
              taskId:11
            },
            {
              value:'US Used',
              taskId:12
            }
          ]
        }
      ]
    },
    {
      procedureId:3,
      name:'Site Care',
      groups:[
        {
          groupName:'Care Type',
          selectType:'multi',
          groupOptions:[
            {
              value:'IV Flushed',
              taskId:13
            },
            {
              value:'Saline Locked',
              taskId:14
            },
            {
              value:'Dressing Changed',
              taskId:15
            },
            {
              value:'Dressing Reinforced',
              taskId:16
            }
          ]
        }
      ]
    },
    {
      procedureId:4,
      name:'DC IV',
      groups:[
        {
          groupName:'Reasons',
          selectType:'multi',
          groupOptions:[
            {
              value:'Infiltration',
              taskId:17
            },
            {
              value:'Phlebitis',
              taskId:18
            },
            {
              value:'PT Removal',
              taskId:19
            },
            {
              value:'Leaking',
              taskId:20
            },
            {
              value:'Bleeding',
              taskId:21
            }
          ]
        }
      ]
    },
    {
      procedureId:5,
      name:'Port-A-Cath',
      groups:[
        {
          groupName:'Access Attempts',
          selectType:'single',
          groupOptions:[
            {
              value:'1 Attempt',
              taskId:22
            },
            {
              value:'2 Attempts',
              taskId:23
            }
          ]
        },
        {
          groupName:'Deaccess',
          selectType:'single',
          groupOptions:[
            {
              value:'Contaminated',
              taskId:24
            },
            {
              value:'Therapy Complete',
              taskId:25
            },
            {
              value:'Needle Change',
              taskId:26
            }
          ]
        },
        {
          groupName:'Cathflow',
          selectType:'single',
          groupOptions:[
            {
              value:'Initiated',
              taskId:27
            },
            {
              value:'Completed',
              taskId:28
            }
          ]
        }
      ]
    },
    {
      procedureId:6,
      name:'PICC Line',
      groups:[
        {
          groupName:'Removal',
          selectType:'single',
          groupOptions:[
            {
              value:'Therapy Complete',
              taskId:29
            },
            {
              value:'Discharge',
              taskId:30
            },
            {
              value:'Clotted',
              taskId:31
            },
            {
              value:'Contaminated',
              taskId:32
            },
            {
              value:'PT Removal',
              taskId:33
            }
          ]
        },
        {
          groupName:'Cathflow',
          selectType:'single',
          groupOptions:[
            {
              value:'Initiated',
              taskId:34
            },
            {
              value:'Completed',
              taskId:35
            }
          ]
        }
      ]
    },
    {
      procedureId:7,
      name:'Dressing Change',
      groups:[
        {
          groupName:'What',
          selectType:'single',
          groupOptions:[
            {
              value:'PICC',
              taskId:36
            },
            {
              value:'Port-A-Cath',
              taskId:37
            },
            {
              value:'Central Line',
              taskId:38
            },
            {
              value:'Midline',
              taskId:3
            }
          ]
        },
        {
          groupName:'Why',
          selectType:'single',
          groupOptions:[
            {
              value:'Per Protocol',
              taskId:40
            },
            {
              value:'Bleeding',
              taskId:41
            },
            {
              value:'Dressing Compromised',
              taskId:42
            }
          ]
        }
      ]
    },
    {
      procedureId:8,
      name:'Insertion Procedure',
      groups:[
        {
          groupName:'Insertion Type',
          selectType:'single',
          groupOptions:[
            {
              value:'Midline',
              taskId:43
            },
            {
              value:'SL PICC',
              taskId:44
            },
            {
              value:'TL PICC',
              taskId:45
            },
            {
              value:'DL PICC',
              taskId:46
            }
          ]
        }
      ]
    }
  ];
}