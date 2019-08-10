const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
mongoose.connect('mongodb://brett84c:lisa8484@ds343127.mlab.com:43127/heroku_fnvv7pg3', {
  useNewUrlParser:true,
  autoIndex:false
}, (err)=>{
  if(err) return err;
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log('db connected');});

let userSchema = new Schema({
  fullname:String,
  username:{type:String, lowercase:true, unique:true},
  userId:{type:Number, index:true, unique:true},
  password:{type:String, lowercase:true},
  role:{type:String, default:'user'},
});
userSchema.plugin(uniqueValidator);
let User = mongoose.model('User', userSchema);

let callSchema = new Schema({
  hospital:{type:Number, default:null},
  room:{type:String, default:null},
  job:String,
  preComments:{type:String, default:null},
  postComments:{type:String, default:null},
  contact:Number,
  createdBy:{type:Number, default:null},
  startTime:{type:Date, default:null},
  isOpen:{type:Boolean, default:false},
  openBy:{type:Number, default:null},
  proceduresDone:[],
  mrn:{type:String, default:null},
  completedAt:{type:Date, default:null, index:true},
  completedBy:{type:Number, default:null}
})
callSchema.plugin(uniqueValidator);
let Call = mongoose.model('Call', callSchema);

let procedureSchema = new Schema({ 
  procedureId:{type:Number, index:true, unique:true},
  name:String,
  value:String,
  groups:[
    {
      groupName:String,
      inputType:String,
      groupOptions:[
        {
          value:String,
          taskId:{type:Number, index:true, unique:true}
        }
      ]
    }
  ]
});
procedureSchema.plugin(uniqueValidator);
let Procedure = mongoose.model('Procedure', procedureSchema);

let optionSchema = new Schema({ 
  name:String,
  inputType:String,
  callFieldName:{type:String, index:true, unique:true},
  options:[
    {
      text:String,
      value:{type:Number, index:true}
    }
  ]
});
optionSchema.plugin(uniqueValidator);
let Option = mongoose.model('Option', optionSchema);

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
  Call.create(req.body, (err, call)=>{
    if(err) return err;
    res.send(call);
  });
});

app.post('/delete-call', (req, res)=>{
  Call.deleteOne(req.body, (err)=>{
    if (err) return err;
    res.send(true);
  });
});

app.get('/get-active-calls', (req, res)=>{
  Call.find({completedAt:null}, (err, calls)=>{
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

  Call.find({completedAt: {$gte: start, $lt: end}}, (err, calls)=>{
    if(err) return err;
    if(calls.length){
      res.send(calls);
    } else {
      res.send({'error':'no calls were found with that query'});
    }
  });
});

app.get('/get-open-calls', (req, res)=>{
  var start = new Date();
  start.setHours(0,0,0,0);
  
  var end = new Date();
  end.setHours(23,59,59,999);

  Call.find({isOpen:true}, (err, calls)=>{
    if(err) return err;
    res.send(calls);
  });
});

app.post('/set-call-as-open', (req, res)=>{
  Call.findOne({_id:req.body._id}, (err, call)=>{
    if(err) return err;
    if(call){
      if(call.isOpen) {
        res.send({'error':'call is already open'});
      } else {
        call.isOpen = true;
        call.openBy = req.body.userId;
        call.startTime = new Date();
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
  Call.findOne(req.body, (err, call)=>{
    if(err) return err;
    if(call){
      call.isOpen = false;
      call.openBy = null;
      call.startTime = null;
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
  Call.findOne({_id:req.body._id}, (err, call)=>{
    if(err) return err;
    if(call){
      call.proceduresDone = req.body.proceduresDone;
      call.postComments = req.body.postComments;
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
  User.findOne(req.body, (err, user)=>{
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
  User.findOne({username:req.body.username.toLowerCase()}, (err, user)=>{
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
  User.find().sort({ userId: -1 }).limit(1).exec((err, users)=>{
    if(err) return err;
    if(users.length){
      newUser.userId = users[0].userId + 1;
      User.create(newUser, (err2, user)=>{
        if(err2) return err2;
        res.send(user);
      });
    } else {
      res.send({'error':'error adding new user'})
    }
  });
});

app.post('/delete-user', (req, res)=>{
  User.remove(req.body, (err)=>{
    if(err) return err;
    res.send(true);
  });
});

app.get('/get-all-users', (req, res)=>{
  User.find({role: {$ne: 'super'}}).sort({ userId: 1 }).exec((err, users)=>{
    if(err) return err;
    res.send(users);
  });
});

app.get('/get-procedures', (req, res)=>{
  Procedure.find().sort({procedureId:1}).exec((err, procedures)=>{
    if(err) return err;
    if(procedures.length){
      res.send(procedures);
    } else {
      res.send({'error':'there were no procedures to return'});
    }
  });
});

app.get('/get-options', (req, res)=>{
  Option.find().exec((err, options)=>{
    if(err) return err;
    if(options.length){
      res.send(options);
    } else {
      res.send({'error':'there were no options to return'});
    }
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

  Call.find({completedAt:{$ne:null}}, (err, calls)=>{
    if(err) return err;
    res.send(calls);
  });
});

app.get('/seed-super',(req,res)=>{
  User.create({
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
  Procedure.insertMany(getProcedureSeed(), (err, procedures) => {
    if(err) return err;
    if(procedures){
      res.send(procedures);
    } else {
      res.send({'error':'no procedures exist'})
    }
  });
})

app.get('/seed-options', (req, res)=>{
  Option.create(getOptionsSeed(), (err, options) => {
    if(err) return err;
    if(options){
      res.send(options);
    } else {
      res.send({'error':'no options exist'})
    }
  });
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

function getOptionsSeed(){
  return {
    name:'Hospital',
    inputType:'dropdown',
    callFieldName:'hospital',
    options:[
      {
        text:'Erlanger Main',
        value:1
      },
      {
        text:'Erlanger East',
        value:2
      },
      {
        text:'Erlanger North',
        value:3
      },
      {
        text:"Erlanger Children's",
        value:4
      },
      {
        text:"Erlanger Bledsoe",
        value:5
      },
      {
        text:"Siskin",
        value:6
      }
    ]
  }
}

function getProcedureSeed(){
  return [
    {
      procedureId:1,
      name:'PIV Start',
      groups:[
        {
          groupName:'Dosage',
          inputType:'radio',
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
          inputType:'radio',
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
          inputType:'radio',
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
          inputType:'radio',
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
          inputType:'checkbox',
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
          inputType:'checkbox',
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
          inputType:'radio',
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
          inputType:'radio',
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
          inputType:'radio',
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
          inputType:'radio',
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
          inputType:'radio',
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
          inputType:'radio',
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
          inputType:'radio',
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
          inputType:'radio',
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
        },
        {
          groupName:'Vessel',
          inputType:'radio',
          groupOptions:[
            {
              value:'Basilic',
              taskId:47
            },
            {
              value:'Brachial',
              taskId:48
            },
            {
              value:'Cephalic',
              taskId:49
            },
            {
              value:'Internal Jugular',
              taskId:50
            }
          ]
        },
        {
          groupName:'Laterality',
          inputType:'radio',
          groupOptions:[
            {
              value:'Left',
              taskId:51
            },
            {
              value:'Right',
              taskId:52
            }
          ]
        },
        {
          groupName:'Insertion Length (in cm)',
          inputType:'number',
          groupOptions:[
            {
              value:'',
              taskId:53
            }
          ]
        },
        {
          groupName:'Circumference (in cm)',
          inputType:'number',
          groupOptions:[
            {
              value:'',
              taskId:54
            }
          ]
        }
      ]
    }
  ];
}