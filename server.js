const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require('path');
const LinvoDB = require("linvodb3");
LinvoDB.dbPath = `./vas-db/vas.db`; 

//2nd parameter object defines schema for table
let Calls = new LinvoDB("Calls", {
  room:String,
  job:String,
  comments:{type:String, default:null},
  contact:Number,
  createdAt:{type:Date, default:new Date()},
  createdBy:{type:Number, default:null},
  isOpen:{type:Boolean, default:false},
  openBy:{type:Number, default:null},
  proceduresDone:[],
  mdn:{type:String, default:null},
  completedAt:{type:Date, default:null},
  completedBy:{type:Number, default:null}
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
    if(err) return err;
    res.send(call);
  });
});

app.get('/get-active-calls', (req, res)=>{
  Calls.find({completedAt:{$exists:false}}, (err, calls)=>{
    if(err) return err;
    if(calls.length){
      res.send(calls);
    } else {
      res.send({'error':'there are no calls to return', 'placeholderData':[]});
    }
  })
});

app.get('/get-completed-calls', (req, res)=>{
  var start = new Date();
  start.setHours(0,0,0,0);
  
  var end = new Date();
  end.setHours(23,59,59,999);

  Calls.find({completedAt: {$gte: start, $lt: end}}, (err, calls)=>{
    if(err) return err;
    res.send(calls);
  });
});

app.get('/get-open-calls', (req, res)=>{
  var start = new Date();
  start.setHours(0,0,0,0);
  
  var end = new Date();
  end.setHours(23,59,59,999);

  Calls.find({isOpen:true}, (err, calls)=>{
    if(err) return err;
    res.send(calls);
  });
});

app.post('/set-call-as-open', (req, res)=>{
  Calls.findOne({_id:req.body._id}, (err, call)=>{
    if(err) return err;
    if(call){
      if(call.isOpen) {
        res.send({'error':'call is already open'});
      } else {
        call.isOpen = true;
        call.openBy = req.body.userId;
        call.save((err2)=>{
          if(err2) return err2;
          res.send(call);
        })
      }
    } else {
      res.send({'error':'could not find call to set as open'});
    }
  });
});

app.post('/set-call-as-unopen', (req, res)=>{
  Calls.findOne(req.body, (err, call)=>{
    if(err) return err;
    if(call){
      call.isOpen = false;
      call.openBy = null;
      call.save((err2)=>{
        if(err2) return err2;
        res.send(call);
      })
    } else {
      res.send({'error':'could not find call to set as unopen'});
    }
  });
});

app.post('/procedure-completed', (req, res)=>{
  Calls.findOne({_id:req.body.id}, (err, call)=>{
    if(err) return err;
    if(call){
      call.proceduresDone = req.body.proceduresDone;
      call.isOpen = false;
      call.completedBy = Number(req.body.completedBy);
      call.completedAt = new Date();
      call.save((err2)=>{
        if(err2) return err2;
        res.send(call);
      })
    } else {
      res.send({'error':'could not find procedure to mark as complete'});
    }
  })
});

app.post('/get-user-by-id', (req, res)=>{
  Users.findOne(req.body, (err, user)=>{
    if(err) return err;
    if(user){
      res.send(user);
    } else {
      res.send({'error':'could not find user from id: ' + req.body._id});
    }
  })
})

//ADMIN
app.post('/login', (req, res)=>{
  Users.findOne({username:req.body.username.toLowerCase()}, (err, user)=>{
    if(err) return err;
    if(user){
      if(user.password.toLowerCase() === req.body.password.toLowerCase()){
        if(req.body.loginType === 'user'){
          let loggedUser = user;
          delete loggedUser.password;
          res.send(loggedUser);
        } else {
          if(user.role === 'admin' || user.role === 'super'){
            let loggedUser = user;
            delete loggedUser.password;
            res.send(loggedUser);
          } else {
            res.send({'error':'regular users cannot login to admin'});
          }
        }
      } else {
        res.send({'error':'incorrect password'});
      }
    } else {
      res.send({'error':"user doesn't exist"});
    }
  })
});

app.post('/add-user', (req, res)=>{
  let newUser = req.body;
  Users.find().sort({ userId: -1 }).limit(1).exec((err, users)=>{
    if(err) return err;
    if(users.length){
      newUser.userId = users[0].userId + 1;
      Users.insert(newUser, (err2, user)=>{
        if(err2) return err2;
        res.send(user);
      });
    } else {
      res.send({'error':'error adding new user'})
    }
  });
});

app.post('/delete-user', (req, res)=>{
  Users.findOne(req.body, (err, user)=>{
    if(err) return err;
    if(user){
      Users.remove(req.body, {}, (err2)=>{
        if(err2) return err2;
        res.send(true);
      });
    } else {
      res.send({'error':'could not find user to delete'});
    }
  });
});

app.get('/get-all-users', (req, res)=>{
  Users.find({role: {$ne: 'super'}}).sort({ userId: 1 }).exec((err, users)=>{
    if(err) return err;
    res.send(users);
  });
});

app.get('/get-procedures', (req, res)=>{
  Procedures.find().sort({procedureId:1}).exec((err, procedures)=>{
    if(err) return err;
    res.send(procedures);
  });
});

//SUPER
app.post('/get-calls-date-range', (req, res) =>{
  console.log(new Date(req.body.startDate));
  console.log(new Date(req.body.endDate));
  // Calls.find({completedAt: {
  //   $gte: new Date(req.body.startDate),
  //   $lt: new Date(req.body.endDate)
  // }}, (err, calls)=>{
  //   if(err) return err;
  //   res.send(calls);
  // });

  Calls.find({completedAt:{$exists:true}}, (err, calls)=>{
    if(err) return err;
    res.send(calls);
  });
});

app.get('/seed-super',(req,res)=>{
  Users.insert({
    fullname:'Brett Connolly',
    username:'brett84c',
    userId:1001,
    password:'lisa8484',
    role:'super'
  }, (err, newUser)=>{
    if(err) return err;
    res.send(newUser);
  })
});

app.get('/seed-procedures', (req, res)=>{
  Procedures.insert(getProcedureSeed(), (err, newDocs) => {
    if(err) return err;
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