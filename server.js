const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const seedData = require('./seed-data');

//Mongoose
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
  room:{type:String, default:null, lowercase:true},
  provider:{type:String, lowercase:true},
  job:String,
  customJob:{type:String, default:null},
  preComments:{type:String, default:null},
  addComments:{type:String, default:null},
  contact:{type:Number, default:null},
  startTime:{type:Date, default:null},
  openBy:{type:Number, default:null},
  proceduresDone:[Object],
  mrn:{type:Number, default:null},
  completedAt:{type:Date, default:null, index:true},
  responseTime:{type:Number, default:null},
  procedureTime:{type:Number, default:null},
  completedBy:{type:Number, default:null},
  orderChange:{type:Number, default:null},
  wasConsultation:{type:Boolean, default:null},
  status:{type:Number, default:1}
})
callSchema.plugin(uniqueValidator, {message: `Could not insert call based on unique constraint: {PATH} {VALUE} {TYPE}`});
let Call = mongoose.model('Call', callSchema);

let itemSchema = new Schema({
  itemId:{type:Number, index:true, unique:true, required:true},
  procedureId:{type:Number, required:true},
  groupId:{type:Number, required:true},
  value:{type:String, default:null},
  isCustom:{type:Boolean, required:true},
  fieldAbbr:String,
  valuePrefix:String,
  valueSuffix:String
})
itemSchema.plugin(uniqueValidator, {message: 'Could not insert item on unique constraint: {PATH} {VALUE} {TYPE}'});
let Item = mongoose.model('Item', itemSchema);

let procedureSchema = new Schema({
  procedureId:{type:Number, index:true, unique:true},
  seq:{type:Number, required:true},
  groups:[
    {
      groupId:String,
      fieldName:{type:String, default:null},
      hideHeader:{type:Boolean, default:false},
      inputType:String,
      groupItems:[Number]
    }
  ]
});
procedureSchema.plugin(uniqueValidator, {message: `Could not insert procedure based on unique constraint: {PATH} {VALUE} {TYPE}`});
let Procedure = mongoose.model('Procedure', procedureSchema);

let optionSchema = new Schema({
  optionId:{type:Number, required:true},
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
    if(call){
      res.send(call);
    } else {
      res.send({'error':'error creating a new call'});
    }
  });
});

app.post('/delete-call', (req, res)=>{
  Call.deleteOne(req.body, (err)=>{
    if (err) return res.send(err);
    res.send(req.body);
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

app.post('/set-call-as-open', (req, res)=>{
  Call.findOne({_id:req.body._id}, (err, call)=>{
    if(err) return res.send(err);
    if(call){
      if(call.openBy) {
        res.send({'error':'call is already open'});
      } else {
        call.openBy = Number(req.body.userId);
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
      call.proceduresDone = req.body.proceduresDone;
      call.completedBy = Number(req.body.completedBy);
      call.completedAt = new Date(Date.now()).toISOString();
      call.procedureTime = req.body.procedureTime;
      call.responseTime = req.body.responseTime;

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
      let modifiedUser = user;
      delete user.password;
      res.send(modifiedUser);
    } else {
      res.send({'error':'could not find user from id: ' + req.body._id});
    }
  })
})

app.post('/login', (req, res)=>{
  User.findOne({username:req.body.username.toLowerCase()}, (err, user)=>{
    if(err) return res.send(err);
    if(user){
      if(user.password === req.body.password){
        if(req.body.loginType === 'user'){
          let loggedUser = user;
          loggedUser.password = undefined;
          res.send(loggedUser);
        } else {
          if(user.role === 'admin' || user.role === 'super'){
            let loggedUser = user;
            loggedUser.password = undefined;
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

app.post('/get-call-by-id', (req, res)=>{
  Call.findOne(req.body, (err, call)=>{
    if(err) return res.send(err);
    if(call){
      res.send(call);
    } else {
      res.send({'error':'could not find a call with that id' + req.body._id});
    }
  });
})

//ADMIN
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
  User.find().sort({userId:1}).exec((err, users)=>{
    if(err) return res.send(err);
    users.forEach((user, idx)=>{
      delete users[idx].password;
    })
    res.send(users);
  });
});

app.get('/get-procedures', (req, res)=>{
  Procedure.find().sort({seq:1}).exec((err, procedures)=>{
    if(err) return res.send(err);
    if(procedures.length){
      res.send({
        procedures,
        referenceObj:seedData.referencesObject
      });
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

app.get('/get-completed-calls', (req, res)=>{
  var start = new Date();
  start.setHours(0,0,0,0);
  
  var end = new Date();
  end.setHours(23,59,59,999);

  Call.find({completedAt: {$gte: start, $lt: end}}).sort({completedAt:-1}).exec((err, calls)=>{
    if(err) return res.send(err);
    if(calls.length){
      res.send(calls);
    } else {
      res.send({'error':'no completed calls for today, yet'});
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
    if(err) return res.send(err);
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
    if(err) return res.send(err);
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
    if(err) return res.send(err);
    if(calls.length){
      res.send(calls);
    } else {
      res.send({'error':`no calls returned for query`});
    }
  })
});

app.post('/sort-by-field', (req, res)=>{
  Call.find().sort(req.body).exec((err, calls)=>{
    if(err) return res.send(err);
    if(calls){
      res.send(calls);
    } else {
      res.send({'error':'not calls match that criteria'});
    }
  })
});

app.post('/add-hospital', (req, res)=>{
  Option.findOne({callFieldName:'hospital'}, (err, hospitals)=>{
    if(err) return res.send(err);
    if(hospitals){
      hospitals.options.push({
        id:hospitals.options.length + 1,
        name:req.body.hospitalName
      })
      hospitals.save(err2=>{
        if(err2) return res.send(err2);
        res.send(hospitals);
      })
    } else {
      res.send({'error':'error getting hospital data'});
    }
  })
})

app.post('/add-order-change', (req, res)=>{
  Option.findOne({callFieldName:'orderChange'}, (err, orderChanges)=>{
    if(err) return res.send(err);
    if(orderChanges){
      orderChanges.options.push({
        id:orderChanges.options.length + 1,
        name:req.body.orderChangeName
      })
      orderChanges.save(err2=>{
        if(err2) return res.send(err2);
        res.send(orderChanges);
      })
    } else {
      res.send({'error':'error getting order change data'});
    }
  })
})

app.post('/add-need-option', (req, res)=>{
  Option.findOne({callFieldName:'callNeeds'}, (err, needs)=>{
    if(err) return res.send(err);
    if(needs){
      needs.options.push({
        id:needs.options.length + 1,
        name:req.body.addNeedName
      })
      needs.save(err2=>{
        if(err2) return res.send(err2);
        res.send(needs);
      })
    } else {
      res.send({'error':'error getting order change data'});
    }
  })
})

app.post('/get-open-calls-in-range', (req, res)=>{
  Call.find({
    startTime: {
      $gte: new Date(req.body.startDate),
      $lt: new Date(req.body.endDate)
    },
    openBy:{
      $ne:null
    }
  }, (err, calls)=>{
    if(err) return res.send(err);
    if(calls){
      res.send(calls);
    } else {
      res.send({'error':'no open calls exist within that date query'});
    }
  })
})

app.post('/get-order-changes-in-range', (req, res)=>{
  Call.find({
    startTime: {
      $gte: new Date(req.body.startDate),
      $lt: new Date(req.body.endDate)
    },
    orderChange:{$ne:null}
  }, (err, calls)=>{
    if(err) return res.send(err);
    if(calls){
      res.send(calls);
    } else {
      res.send({'error':'no order changes happened within that date range'});
    }
  })
})

app.post('/save-call', (req, res)=>{
  Call.replaceOne({_id:req.body._id}, req.body, err=>{
    if(err) return res.send(err);
    res.send(true);
  });
})

//SUPER
app.post('/send-errors-to-admin', (req,res)=>{
  fs.writeFile('vas-errors.json', JSON.stringify(req.body), (err)=>{
    if(err) return res.send(err);
    res.send(true);
  });
});

app.get('/get-errors-json', (req, res)=>{
  fs.readFile('vas-errors.json', (err, data)=>{
    if(err) return res.send(err);
    res.send(JSON.parse(data));
  });
})

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
  Procedure.insertMany(seedData.procedureSeed, (err, procedures) => {
    if(err) return res.send(err);
    if(procedures){
      res.send(procedures);
    } else {
      res.send({'error':'no procedures exist'})
    }
  });
})

app.get('/seed-options', (req, res)=>{
  Option.insertMany(seedData.optionSeed, (err, options) => {
    if(err) return res.send(err);
    if(options){
      res.send(options);
    } else {
      res.send({'error':'no options exist'})
    }
  });
})

app.get('/seed-items', (req, res)=>{
  Item.insertMany(seedData.itemSeed, (err, items) => {
    if(err) return res.send({'error':err});
    if(items){
      res.send(items);
    } else {
      res.send({'error':'no items exist'})
    }
  });
})

app.use(((req, res) => res.sendFile(path.join(__dirname, './client/build/index.html'))));
app.listen(app.get('port'), ()=>{
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});