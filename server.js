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
  if(err) return res.send(err);
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log('db connected');});

let userSchema = new Schema({
  fullname:{type:String, lowercase:true},
  username:{type:String, lowercase:true, unique:true},
  userId:{type:Number, index:true, unique:true},
  password:{type:String, lowercase:true},
  role:{type:String, default:'user', lowercase:true},
});
userSchema.plugin(uniqueValidator, {message: `Could not insert user based on unique constraint: {PATH} {VALUE} {TYPE}`})
let User = mongoose.model('User', userSchema);

let callSchema = new Schema({
  hospital:{type:Number, default:null},
  room:{type:String, default:null},
  provider:{type:String, lowercase:true},
  job:String,
  jobComments:String,
  addComments:String,
  contact:Number,
  createdBy:{type:Number, default:null},
  startTime:{type:Date, default:null},
  isOpen:{type:Boolean, default:false},
  openBy:{type:Number, default:null},
  proceduresDone:[Object],
  mrn:{type:Number, default:null},
  completedAt:{type:Date, default:null, index:true},
  responseTime:Number,
  procedureTime:Number,
  completedBy:{type:Number, default:null}
})
callSchema.plugin(uniqueValidator, {message: `Could not insert call based on unique constraint: {PATH} {VALUE} {TYPE}`});
let Call = mongoose.model('Call', callSchema);

let itemSchema = new Schema({
  itemId:{type:Number, index:true, unique:true, required:true},
  procedureName:{type:String, required:true},
  groupName:{type:String, required:true},
  value:{type:String, default:null},
  isCustom:{type:Boolean, required:true}
})
itemSchema.plugin(uniqueValidator, {message: 'Could not insert item on unique constraint: {PATH} {VALUE} {TYPE}'});
let Item = mongoose.model('Item', itemSchema);

let procedureSchema = new Schema({
  procedureId:{type:Number, index:true, unique:true},
  name:String,
  groups:[
    {
      groupName:String,
      fieldName:{type:String, default:null},
      inputType:String,
      groupItems:[Number]
    }
  ]
});
procedureSchema.plugin(uniqueValidator, {message: `Could not insert procedure based on unique constraint: {PATH} {VALUE} {TYPE}`});
let Procedure = mongoose.model('Procedure', procedureSchema);

let optionSchema = new Schema({ 
  name:String,
  inputType:String,
  callFieldName:{type:String, index:true, unique:true},
  options:{
    type: [Object],
    default: () => { return null; }
  }
});
optionSchema.plugin(uniqueValidator, {message: `Could not insert option based on unique constraint: {PATH} {VALUE} {TYPE}`});
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
    if(err) return res.send(err);
    res.send(call);
  });
});

app.post('/delete-call', (req, res)=>{
  Call.deleteOne(req.body, (err)=>{
    if (err) return res.send(err);
    res.send(true);
  });
});

app.get('/get-active-calls', (req, res)=>{
  Call.find({completedAt:null}, (err, calls)=>{
    if(err) return res.send(err);
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
    if(err) return res.send(err);
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
    if(err) return res.send(err);
    res.send(calls);
  });
});

app.post('/set-call-as-open', (req, res)=>{
  Call.findOne({_id:req.body._id}, (err, call)=>{
    if(err) return res.send(err);
    if(call){
      if(call.isOpen) {
        res.send({'error':'call is already open'});
      } else {
        call.isOpen = true;
        call.openBy = req.body.userId;
        call.startTime = new Date();
        call.save((err2)=>{
          if(err2) return res.send(err2);
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
    if(err) return res.send(err);
    if(call){
      call.isOpen = false;
      call.openBy = null;
      call.startTime = null;
      call.save((err2)=>{
        if(err2) return res.send(err2);
        res.send(call);
      })
    } else {
      res.send({'error':'could not find call to set as unopen'});
    }
  });
});

app.post('/procedure-completed', (req, res)=>{
  Call.findOne({_id:req.body._id}, (err, call)=>{
    if(err) return res.send(err);
    if(call){
      //if no comments added, delete node
      if(req.body.addComments !== null){
        call.addComments = req.body.addComments;
      } else {
        call.addComments = undefined;
      }

      //if no job comments, delete node
      if(call.jobComments === null){
        call.jobComments = undefined;
      }

      call.provider = req.body.provider;
      call.proceduresDone = req.body.proceduresDone;
      call.completedBy = Number(req.body.completedBy);
      call.completedAt = req.body.completedAt;
      call.procedureTime = req.body.procedureTime;
      call.responseTime = req.body.responseTime;
      call.hospital = req.body.hospital;
      call.mrn = req.body.mrn;
      call.job = undefined;
      call.isOpen = undefined;
      call.openBy = undefined;
      call.contact = undefined;

      call.save((err2)=>{
        if(err2) return res.send(err2);
        res.send(call);
      })
    } else {
      res.send({'error':'could not find procedure to mark as complete'});
    }
  })
});

app.post('/get-user-by-id', (req, res)=>{
  User.findOne(req.body, (err, user)=>{
    if(err) return res.send(err);
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
    if(err) return res.send(err);
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
    if(err) return res.send(err);
    if(users.length){
      newUser.userId = users[0].userId + 1;
      User.create(newUser, (err2, user)=>{
        if(err2) return res.send(err2);
        res.send(user);
      });
    } else {
      res.send({'error':'error adding new user'})
    }
  });
});

app.post('/delete-user', (req, res)=>{
  User.remove(req.body, (err)=>{
    if(err) return res.send(err);
    res.send(true);
  });
});

app.get('/get-all-users', (req, res)=>{
  User.find({role: {$ne: 'super'}}).sort({ userId: 1 }).exec((err, users)=>{
    if(err) return res.send(err);
    res.send(users);
  });
});

app.get('/get-procedures', (req, res)=>{
  Procedure.find().sort({procedureId:1}).exec((err, procedures)=>{
    if(err) return res.send(err);
    if(procedures.length){
      res.send(procedures);
    } else {
      res.send({'error':'there were no procedures to return'});
    }
  });
});

app.get('/get-options', (req, res)=>{
  Option.find().exec((err, options)=>{
    if(err) return res.send(err);
    if(options.length){
      res.send(options);
    } else {
      res.send({'error':'there were no options to return'});
    }
  });
});

app.get('/get-items', (req, res)=>{
  Item.find().sort({itemId:1}).exec((err, items)=>{
    if(err) return res.send(err);
    if(items.length){
      res.send(items);
    } else {
      res.send({'error':'there were no items to return'});
    }
  });
});

app.post('/get-calls-date-range', (req, res) =>{
  // console.log(new Date(req.body.startDate));
  // console.log(new Date(req.body.endDate));
  Call.find({completedAt: {
    $gte: new Date(req.body.startDate),
    $lt: new Date(req.body.endDate)
  }}, (err, calls)=>{
    if(err) return res.send(err);
    res.send(calls);
  });
  // //Get all completed calls
  // Call.find({completedAt:{$ne:null}}, (err, calls)=>{
  //   if(err) return res.send(err);
  //   res.send(calls);
  // });
});

app.post('/calls-containing-value', (req, res)=>{
  Call.find({
    completedAt: {
      $gte: new Date(req.body.dateQuery.startDate),
      $lt: new Date(req.body.dateQuery.endDate)
    },
    [req.body.query.key]:{
      $regex:req.body.query.value
    }
  }, (err, calls)=>{
    if(err) res.send(err);
    if(calls.length){
      res.send(calls);
    } else {
      res.send({'error':`no calls returned for query`});
    }
  })
})

app.post('/calls-by-procedure-id', (req, res)=>{
  Call.find({
    completedAt: {
      $gte: new Date(req.body.dateQuery.startDate),
      $lt: new Date(req.body.dateQuery.endDate)
    },
    'proceduresDone.procedureId':{
      $eq:req.body.procedureId
    }
  }, (err, calls)=>{
    if(err) res.send(err);
    if(calls.length){
      res.send(calls);
    } else {
      res.send({'error':`no calls returned for query`});
    }
  })
});

app.post('/calls-by-single-criteria', (req, res)=>{
  Call.find({
    completedAt: {
      $gte: new Date(req.body.dateQuery.startDate),
      $lt: new Date(req.body.dateQuery.endDate)
    },
    [req.body.query.key]:req.body.query.value
  }, (err, calls)=>{
    if(err) res.send(err);
    if(calls.length){
      res.send(calls);
    } else {
      res.send({'error':`no calls returned for query`});
    }
  })
});

app.post('/sort-by-field', (req, res)=>{
  Call.find().sort(req.body).exec((err, calls)=>{
    if(err) res.send(err);
    if(calls){
      res.send(calls);
    } else {
      res.send({'error':'not calls match that criteria'});
    }
  })
});

app.post('/add-hospital', (req, res)=>{
  Option.findOne({callFieldName:'hospital'}, (err, hospitals)=>{
    if(err) res.send(err);
    if(hospitals){
      hospitals.options.push({
        id:hospitals.options.length + 1,
        name:req.body.hospitalName
      })
      hospitals.save(err2=>{
        if(err2) res.send(err2);
        res.send(hospitals);
      })
    } else {
      res.send({'error':'error getting hospital data'});
    }
  })
})

//SUPER
app.get('/seed-super',(req,res)=>{
  User.create({
    fullname:'Brett Connolly',
    username:'brett84c',
    userId:1001,
    password:'lisa8484',
    role:'super'
  }, (err, newUser)=>{
    if(err) return res.send(err);
    res.send(newUser);
  })
});

app.get('/seed-procedures', (req, res)=>{
  Procedure.insertMany(getProcedureSeed(), (err, procedures) => {
    if(err) return res.send(err);
    if(procedures){
      res.send(procedures);
    } else {
      res.send({'error':'no procedures exist'})
    }
  });
})

app.get('/seed-options', (req, res)=>{
  Option.insertMany(getOptionsSeed(), (err, options) => {
    if(err) return res.send(err);
    if(options){
      res.send(options);
    } else {
      res.send({'error':'no options exist'})
    }
  });
})

app.get('/seed-items', (req, res)=>{
  Item.insertMany(getItemsSeed(), (err, items) => {
    if(err) return res.send({'error':err});
    if(items){
      res.send(items);
    } else {
      res.send({'error':'no items exist'})
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
  return [
    {
      name:'Hospital',
      inputType:'dropdown',
      callFieldName:'hospital',
      options:[
        {
          id:1,
          name:'Erlanger Main'
        },
        {
          id:2,
          name:'Erlanger East'
        },
        {
          id:3,
          name:'Erlanger North'
        },
        {
          id:4,
          name:"Erlanger Children's"
        },
        {
          id:5,
          name:"Erlanger Bledsoe"
        },
        {
          id:6,
          name:"Siskin"
        }
      ]
    },
    {
      name:'Medical Record Number',
      inputType:'number',
      callFieldName:'mrn'
    },
    {
      name:'Provider',
      inputType:'text',
      callFieldName:'provider'
    }
  ];
}

function getItemsSeed(){
  return [
    {
      itemId:1,
      procedureName:'PIV Start',
      groupName:'Dosage',
      value:'24g',
      isCustom:false
    },
    {
      itemId:2,
      procedureName:'PIV Start',
      groupName:'Dosage',
      value:'22g',
      isCustom:false
    },
    {
      itemId:3,
      procedureName:'PIV Start',
      groupName:'Dosage',
      value:'20g',
      isCustom:false
    },
    {
      itemId:4,
      procedureName:'PIV Start',
      groupName:'Dosage',
      value:'18g',
      isCustom:false
    },
    {
      itemId:5,
      procedureName:'PIV Start',
      groupName:'Attempts',
      value:'1 Attempt',
      isCustom:false
    },
    {
      itemId:6,
      procedureName:'PIV Start',
      groupName:'Attempts',
      value:'2 Attempts',
      isCustom:false
    },
    {
      itemId:7,
      procedureName:'PIV Start',
      groupName:'Attempts',
      value:'US Used',
      isCustom:false
    },
    {
      itemId:8,
      procedureName:'Lab Draw',
      groupName:'Draw Type',
      value:'From IV',
      isCustom:false
    },
    {
      itemId:9,
      procedureName:'Lab Draw',
      groupName:'Draw Type',
      value:'Labs Only',
      isCustom:false
    },
    {
      itemId:10,
      procedureName:'Lab Draw',
      groupName:'Attempts',
      value:'1 Attempt',
      isCustom:false
    },
    {
      itemId:11,
      procedureName:'Lab Draw',
      groupName:'Attempts',
      value:'2 Attempts',
      isCustom:false
    },
    {
      itemId:12,
      procedureName:'Lab Draw',
      groupName:'Attempts',
      value:'US Used',
      isCustom:false
    },
    {
      itemId:13,
      procedureName:'Site Care',
      groupName:'Care Type',
      value:'IV Flushed',
      isCustom:false
    },
    {
      itemId:14,
      procedureName:'Site Care',
      groupName:'Care Type',
      value:'Saline Locked',
      isCustom:false
    },
    {
      itemId:15,
      procedureName:'Site Care',
      groupName:'Care Type',
      value:'Dressing Changed',
      isCustom:false
    },
    {
      itemId:16,
      procedureName:'Site Care',
      groupName:'Care Type',
      value:'Dressing Reinforced',
      isCustom:false
    },
    {
      itemId:17,
      procedureName:'DC IV',
      groupName:'Reasons',
      value:'Inflitration',
      isCustom:false
    },
    {
      itemId:18,
      procedureName:'DC IV',
      groupName:'Reasons',
      value:'Phlebitis',
      isCustom:false
    },
    {
      itemId:19,
      procedureName:'DC IV',
      groupName:'Reasons',
      value:'PT Removal',
      isCustom:false
    },
    {
      itemId:20,
      procedureName:'DC IV',
      groupName:'Reasons',
      value:'Leaking',
      isCustom:false
    },
    {
      itemId:21,
      procedureName:'DC IV',
      groupName:'Reasons',
      value:'Bleeding',
      isCustom:false
    },
    {
      itemId:22,
      procedureName:'Port-A-Cath',
      groupName:'Access Attempts',
      value:'1 Attempt',
      isCustom:false
    },
    {
      itemId:23,
      procedureName:'Port-A-Cath',
      groupName:'Access Attempts',
      value:'2 Attempts',
      isCustom:false
    },
    {
      itemId:24,
      procedureName:'Port-A-Cath',
      groupName:'Deaccess',
      value:'Contaminated',
      isCustom:false
    },
    {
      itemId:25,
      procedureName:'Port-A-Cath',
      groupName:'Deaccess',
      value:'Needle Change',
      isCustom:false
    },
    {
      itemId:26,
      procedureName:'Port-A-Cath',
      groupName:'Deaccess',
      value:'Therapy Complete',
      isCustom:false
    },
    {
      itemId:27,
      procedureName:'Port-A-Cath',
      groupName:'Cathflow',
      value:'Initiated',
      isCustom:false
    },
    {
      itemId:28,
      procedureName:'Port-A-Cath',
      groupName:'Cathflow',
      value:'Completed',
      isCustom:false
    },
    {
      itemId:29,
      procedureName:'PICC Line',
      groupName:'Removal',
      value:'Therapy Complete',
      isCustom:false
    },
    {
      itemId:30,
      procedureName:'PICC Line',
      groupName:'Removal',
      value:'Discharge',
      isCustom:false
    },
    {
      itemId:31,
      procedureName:'PICC Line',
      groupName:'Removal',
      value:'Clotted',
      isCustom:false
    },
    {
      itemId:32,
      procedureName:'PICC Line',
      groupName:'Removal',
      value:'Contaminated',
      isCustom:false
    },
    {
      itemId:33,
      procedureName:'PICC Line',
      groupName:'Removal',
      value:'PT Removal',
      isCustom:false
    },
    {
      itemId:34,
      procedureName:'PICC Line',
      groupName:'Cathflow',
      value:'Initiated',
      isCustom:false
    },
    {
      itemId:35,
      procedureName:'PICC Line',
      groupName:'Cathflow',
      value:'Completed',
      isCustom:false
    },
    {
      itemId:36,
      procedureName:'Dressing Change',
      groupName:'What',
      value:'PICC',
      isCustom:false
    },
    {
      itemId:37,
      procedureName:'Dressing Change',
      groupName:'What',
      value:'Port-A-Cath',
      isCustom:false
    },
    {
      itemId:38,
      procedureName:'Dressing Change',
      groupName:'What',
      value:'Central Line',
      isCustom:false
    },
    {
      itemId:39,
      procedureName:'Dressing Change',
      groupName:'What',
      value:'Midline',
      isCustom:false
    },
    {
      itemId:40,
      procedureName:'Dressing Change',
      groupName:'Why',
      value:'Per Protocol',
      isCustom:false
    },
    {
      itemId:41,
      procedureName:'Dressing Change',
      groupName:'Why',
      value:'Bleeding',
      isCustom:false
    },
    {
      itemId:42,
      procedureName:'Dressing Change',
      groupName:'Why',
      value:'Dressing Compromised',
      isCustom:false
    },
    {
      itemId:43,
      procedureName:'Insertion Procedure',
      groupName:'Insertion Type',
      value:'Midline',
      isCustom:false
    },
    {
      itemId:44,
      procedureName:'Insertion Procedure',
      groupName:'Insertion Type',
      value:'SL PICC',
      isCustom:false
    },
    {
      itemId:45,
      procedureName:'Insertion Procedure',
      groupName:'Insertion Type',
      value:'TL PICC',
      isCustom:false
    },
    {
      itemId:46,
      procedureName:'Insertion Procedure',
      groupName:'Insertion Type',
      value:'DL PICC',
      isCustom:false
    },
    {
      itemId:47,
      procedureName:'Insertion Procedure',
      groupName:'Vessel',
      value:'Basilic',
      isCustom:false
    },
    {
      itemId:48,
      procedureName:'Insertion Procedure',
      groupName:'Vessel',
      value:'Brachial',
      isCustom:false
    },
    {
      itemId:49,
      procedureName:'Insertion Procedure',
      groupName:'Vessel',
      value:'Cephalic',
      isCustom:false
    },
    {
      itemId:50,
      procedureName:'Insertion Procedure',
      groupName:'Vessel',
      value:'Internal Jugular',
      isCustom:false
    },
    {
      itemId:51,
      procedureName:'Insertion Procedure',
      groupName:'Vessel',
      value:'Femoral',
      isCustom:false
    },
    {
      itemId:52,
      procedureName:'Insertion Procedure',
      groupName:'Laterality',
      value:'Left',
      isCustom:false
    },
    {
      itemId:53,
      procedureName:'Insertion Procedure',
      groupName:'Laterality',
      value:'Right',
      isCustom:false
    },
    {
      itemId:54,
      procedureName:'Insertion Procedure',
      groupName:'Insertion Length',
      value:'',
      isCustom:true
    },
    {
      itemId:55,
      procedureName:'Insertion Procedure',
      groupName:'Circumference',
      value:'',
      isCustom:true
    }
  ];
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
          groupItems:[1,2,3,4]
        },
        {
          groupName:'Attempts',
          inputType:'radio',
          groupItems:[5,6,7]
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
          groupItems:[8,9]
        },
        {
          groupName:'Attempts',
          inputType:'radio',
          groupItems:[10,11,12]
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
          groupItems:[13,14,15,16]
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
          groupItems:[17,18,19,20,21]
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
          groupItems:[22,23]
        },
        {
          groupName:'Deaccess',
          inputType:'radio',
          groupItems:[24,25,26]
        },
        {
          groupName:'Cathflow',
          inputType:'radio',
          groupItems:[27,28]
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
          groupItems:[29,30,31,32,33]
        },
        {
          groupName:'Cathflow',
          inputType:'radio',
          groupItems:[34,35]
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
          groupItems:[36,37,38,39]
        },
        {
          groupName:'Why',
          inputType:'radio',
          groupItems:[40,41,42]
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
          groupItems:[43,44,45,46]
        },
        {
          groupName:'Vessel',
          inputType:'radio',
          groupItems:[47,48,49,50,51]
        },
        {
          groupName:'Laterality',
          inputType:'radio',
          groupItems:[52,53]
        },
        {
          groupName:'Insertion Length',
          fieldName:'insertionLength',
          inputType:'number',
          groupItems:[54]
        },
        {
          groupName:'Circumference',
          fieldName:'circumference',
          inputType:'number',
          groupItems:[55]
        }
      ]
    }
  ];
}