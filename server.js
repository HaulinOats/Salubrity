const forceSecure = require("force-secure-express");
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
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://brett84c:lisa8484@ds331798-a0.mlab.com:31798,ds331798-a1.mlab.com:31798/heroku_tbkgh512?replicaSet=rs-ds331798', {
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
  isAvailable:{type:Boolean, default:false},
  isActive:{type:Boolean, default:true}
});
userSchema.plugin(uniqueValidator, {message: `Could not insert user based on unique constraint: {PATH} {VALUE} {TYPE}`})
let User = mongoose.model('User', userSchema);

let callSchema = new Schema({
  addComments:{type:String, default:null},
  completedAt:{type:Date, default:null, index:true},
  completedBy:{type:Number, default:null},
  contact:{type:String, default:null},
  createdAt:{type:Date, default:Date.now()},
  createdBy:{type:Date, default:null},
  customJob:{type:String, default:null},
  dob:{type:Date, default:null},
  dressingChangeDate:{type:Date, default:null},
  hospital:{type:Number, default:null},
  referenceCallId:{type:String, default:null},
  insertedBy:{type:String, default:null},
  insertionLength:{type:Number, default:0},
  itemIds:{type:Array, default:null},
  job:{type:String, default:null},
  mrn:{type:Number, default:null},
  openBy:{type:Number, default:null},
  orderChange:{type:Number, default:null},
  patientName:{type:String, default:null},
  preComments:{type:String, default:null},
  procedureIds:{type:Array, default:null},
  proceduresDone:[Object],
  procedureTime:{type:Number, default:null},
  provider:{type:String, lowercase:true},
  responseTime:{type:Number, default:null},
  room:{type:String, default:null, lowercase:true},
  startTime:{type:Date, default:null},
  status:{type:Number, default:1},
  updatedAt:{type:Date, default:null},
  updatedBy:{type:Number, default:null},
  wasConsultation:{type:Boolean, default:false}
},{
  versionKey: false
})
callSchema.plugin(uniqueValidator, {message: `Could not insert call based on unique constraint: {PATH} {VALUE} {TYPE}`});
let Call = mongoose.model('Call', callSchema);

let itemSchema = new Schema({
  itemId:{type:Number, index:true, unique:true, required:true},
  procedureName:{type:String, required:true},
  procedureId:{type:Number, required:true},
  groupName:{type:String, required:true},
  fieldName:{type:String, default:null},
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
  name:{type:String, required:true},
  seq:{type:Number, required:true},
  groups:[
    {
      seq:Number,
      groupName:String,
      hideHeader:{type:Boolean, default:false},
      hideGroup:{type:Boolean, default:false},
      fieldName:{type:String},
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

app.use(forceSecure(['salubrity-vas.herokuapp.com']));
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
  Call.find({
    completedAt:null,
    dressingChangeDate:null
  }, (err, calls)=>{
    if(err) return res.send(err);
    if(calls){
      res.send(calls);
    } else {
      res.send({'error':'there are no calls to return'});
    }
  })
});

app.post('/get-open-call-for-user', (req, res)=>{
  Call.findOne(req.body, (err, call)=>{
    if(err) return res.send(err);
    if(call){
      res.send(call);
    } else {
      res.send({'error':'no open records for user'});
    }
  })
});

app.get('/get-open-line-procedures', (req, res)=>{
  Call.find({
    dressingChangeDate:{$ne:null},
    completedAt:null
  }).sort({dressingChangeDate:1}).exec((err, calls)=>{
    if(err) return res.send(err);
    if(calls){
      res.send(calls);
    } else {
      res.send({'error':'there are no open line procedures to return'});
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

app.post('/set-as-done-editing', (req, res)=>{
  Call.findOne(req.body, (err, call)=>{
    if(err) return res.send(err);
    if(call){
      call.openBy = null;
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
  Call.findOneAndUpdate({_id:req.body.newCallObj._id},{$set:req.body.newCallObj}, {new:true}, (err, call)=>{
    if(err) return res.send(err);
    //if a dressing change date was set, create new call record
    //and populate with relevant line procedure data
    if(req.body.dressingChangeDate){
      let newCallObj = {};
      newCallObj.completedAt = null;
      newCallObj.hospital = call.hospital;
      newCallObj.room = call.room;
      newCallObj.provider = call.provider;
      newCallObj.job = call.job;
      newCallObj.customJob = call.customJob;
      newCallObj.contact = call.contact;
      newCallObj.insertionLength = call.insertionLength;
      newCallObj.mrn = call.mrn;
      newCallObj.orderChange = call.orderChange;
      newCallObj.wasConsultation = call.wasConsultation;
      newCallObj.createdBy = call.completedBy;
      newCallObj.createdAt = new Date();
      newCallObj.startTime = new Date();
      newCallObj.dob = call.dob;
      newCallObj.insertedBy = call.insertedBy;
      newCallObj.dressingChangeDate = new Date(req.body.dressingChangeDate);

      //carry over any line procedure selections (anything within Port-A-Cath and Insertion Procedures)
      let itemIds = [];
      let procedureIds = [];
      let proceduresDone = call.proceduresDone;
      var i = proceduresDone.length;
      while (i--) {
        if(proceduresDone[i].procedureId === 4 || proceduresDone[i].procedureId === 8){
          procedureIds.push(proceduresDone[i].procedureId);
          proceduresDone[i].itemIds.forEach(itemId=>{
            itemIds.push(itemId);
          })
        } else {
          proceduresDone.splice(i,1);
        }
      }
      newCallObj.procedureIds = procedureIds;
      newCallObj.itemIds = itemIds;
      newCallObj.proceduresDone = proceduresDone;

      Call.create(newCallObj, (err2, call2)=>{
        if(err2) return res.send(err2);
        //delete initial call created for external placement since it shouldn't be 
        //counted towards insertion aggregations or as it's own call/procedure for VAS
        if(req.body.initialExternalPlacement){
          Call.deleteOne({_id:req.body.newCallObj._id}, (err3)=>{
            if(err3) return res.send(err3);
            res.send(call2);
          })
        } else {
          res.send(call2);
        }
      })
    } else {
      res.send(call);
    }
  })
});

app.post('/get-user-by-id', (req, res)=>{
  User.findOne(req.body, (err, user)=>{
    if(err) return res.send(err);
    if(user){
      let modifiedUser = user;
      modifiedUser.password = undefined;
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
  Call.findOne({_id:req.body._id}, (err, call)=>{
    if(err) return res.send(err);
    if(call){
      if(call.openBy && call.openBy !== req.body.userId){
        res.send({
          'isOpen':'Record is already open by:',
          'userId':call.openBy
        })
      } else {
        call.openBy = req.body.userId;
        call.save(err2=>{
          if(err2) return res.send(err2);
          res.send(call);
        })
      }
    } else {
      res.send({'error':'could not find a call with that id' + req.body._id});
    }
  });
})

// app.post('/get-calls-by-hospital-and-insertion-type', (req, res)=>{
//   Call.find({
//     completedAt: {
//       $gte: new Date(req.body.dateQuery.startDate),
//       $lt: new Date(req.body.dateQuery.endDate)
//     },
//     hospital:req.body.hospital,
//     'proceduresDone.itemIds':{
//       $in:req.body.itemIds
//     }
//   }, (err, calls)=>{
//     if(err) return res.send(err);
//     if(calls.length){
//       res.send(calls);
//     } else {
//       res.send({'error':`no calls returned for this query: procedureId = ${req.body.procedureId}`});
//     }
//   })
// })

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

app.post('/toggle-user-is-active', (req, res)=>{
  User.findOne(req.body, (err, user)=>{
    if(err) return res.send(err);
    if(user){
      user.isActive = !user.isActive;
      user.save(err2=>{
        if(err2) return res.send(err2);
        res.send(user);
      })
    } else {
      res.send({'error':"Could not find that user"})
    }
  })
})

app.get('/get-all-users', (req, res)=>{
  User.find().sort({userId:1}).exec((err, users)=>{
    if(err) return res.send(err);
    users.forEach((user, idx)=>{
      users[idx].password = undefined;
    })
    res.send(users);
  });
});

app.get('/admin-get-all-users', (req, res)=>{
  User.find().sort({userId:-1}).exec((err, users)=>{
    if(err) return res.send(err);
    users.forEach((user, idx)=>{
      if(user.role !== 'user'){
        users[idx].password = undefined;
      }
    })
    res.send(users);
  });
});

app.get('/get-procedures', (req, res)=>{
  Procedure.find().sort({seq:1}).exec((err, procedures)=>{
    if(err) return res.send(err);
    if(procedures.length){
      res.send({
        procedures
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
  // var start = new Date();
  // start.setHours(0,0,0,0);
  
  // var end = new Date();
  // end.setHours(23,59,59,999);

  // Call.find({completedAt: {$gte: start, $lt: end}}).sort({completedAt:-1}).exec((err, calls)=>{
  Call.find({completedAt: {$gt:new Date(Date.now() - 12*60*60 * 1000)}}).sort({completedAt:-1}).exec((err, calls)=>{
    if(err) return res.send(err);
    if(calls){
      res.send(calls);
    } else {
      res.send({'error':'no completed calls for today, yet'});
    }
  });
});

app.post('/create-dressing-change-record', (req, res)=>{
  console.log(req.body);
  // Call.create(req.body, (err, call)=>{
  //   if(err) return res.send(err);
  //   call.dressingChangeDate = new Date(req.body.dressingChangeDate);
  // });
});

app.post('/get-calls-by-query', (req, res)=>{
  
  //normal query
  let queryObj = {
    completedAt: {
      $gte: new Date(req.body.startDate),
      $lt: new Date(req.body.endDate)
    }
  };
  let dataObj = {};

  req.body.filtersArr.forEach(filter=>{
    fieldName = filter[0];
    filterValue = filter[1];
    switch(fieldName){
      case 'insertionType':
        queryObj['itemIds'] = {$in:[Number(filterValue)]}
        break;
      case 'procedureId':
        let fValue = Number(filterValue);
        if(fValue === 1 || fValue === 10){
          queryObj['procedureIds'] = {$in:[1,10]}
        } else {
          queryObj['procedureIds'] = Number(filterValue)
        }
        break;
      case 'insertedBy':
        queryObj['insertedBy'] = {$ne:null}
        break;
      case 'hospital':
        if(filterValue.toLowerCase() === 'erlanger'){
          queryObj['hospital'] = {$in:[1,2,3,4,5]};
        } else {
          queryObj['hospital'] = Number(filterValue);
        }
        break;
      default:
        queryObj[fieldName] = filterValue;
    }
  })

  queryObj['dressingChangeDate'] = {$eq:null}

  Call.find(queryObj, (err, calls)=>{
    if(err) return res.send(err);
    dataObj.calls = calls;
    Call.aggregate([
      {$match:queryObj},
      {$project : {'itemIds' : 1, _id :0}}, {$unwind : '$itemIds'}, 
      {$group : {'_id': '$itemIds', count :{$sum :1}}}
    ]).exec((err2, agg)=>{
      if(err2) return res.send(err2);
      dataObj.aggregation = agg;
      res.send(dataObj);
    })
  })
})

app.post('/get-calls-by-date-range', (req, res) =>{
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
      res.send({'error':`no calls returned for this query: ${req.body.query.key} = ${req.body.query.value}`});
    }
  })
})

// app.post('/calls-by-procedure-id', (req, res)=>{
//   Call.find({
//     completedAt: {
//       $gte: new Date(req.body.dateQuery.startDate),
//       $lt: new Date(req.body.dateQuery.endDate)
//     },
//     'proceduresDone.procedureId':{
//       $eq:req.body.procedureId
//     }
//   }, (err, calls)=>{
//     if(err) return res.send(err);
//     if(calls.length){
//       res.send(calls);
//     } else {
//       res.send({'error':`no calls returned for this query: procedureId = ${req.body.procedureId}`});
//     }
//   })
// });

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
      res.send({'error':`no calls returned for this query: ${req.body.query.key} = ${req.body.query.value}`});
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

app.post('/get-insertion-types-aggregation', (req, res)=>{
  Call.aggregate([
    {$match:{
      completedAt:{
        $gte:new Date(req.body.completedAt.startDate),
        $lte:new Date(req.body.completedAt.endDate)
      }
    }},
    {$project : {'itemIds' : 1, _id :0}}, {$unwind : '$itemIds'}, 
    {$group : {'_id': '$itemIds', count :{$sum :1}}}
  ]).exec((err, calls)=>{
    if(err) return res.send(err);
    res.send(calls)
  });
})

app.post('/get-hospitals-aggregation', (req, res)=>{
  Call.aggregate([
    {$match:{
      completedAt:{
        $gte:new Date(req.body.completedAt.startDate),
        $lte:new Date(req.body.completedAt.endDate)
      }
    }},
    {$group : { _id : '$hospital', count : {$sum : 1}}}
  ], (err, calls)=>{
    if(err) return res.send(err);
    res.send(calls);    
  })
})

app.post('/admin-update-user-data', (req,res)=>{
  User.findOneAndUpdate({_id:req.body._id},{
    $set:{
      [req.body.field]:req.body.value
    }
  }, (err, user)=>{
    if(err) return res.send(err);
    res.send(user);
  })
})

app.post('/toggle-user-availability', (req,res)=>{
  User.findOne({_id:req.body._id}, (err, user)=>{
    if(err) return res.send(err);
    user.isAvailable = !user.isAvailable;
    user.save((err2, updateUser)=>{
      if(err2) return res.send(err2);
      updateUser.password = undefined;
      res.send(updateUser);
    })
  })
})

app.get('/get-online-users', (req,res)=>{
  User.find({isAvailable:true}, (err, users)=>{
    if(err) return res.send(err);
    let onlineUsers = [];
    users.forEach(user=>{
      onlineUsers.push(user.fullname);
    })
    res.send(onlineUsers);
  })
})

// app.get('/close-all-open-lines', (req,res)=>{
//   Call.updateMany({dressingChangeDate:{$ne:null}}, 
//     {$set:{dressingChangeDate:null}}, {multi:true},(err, calls)=>{
//     if(err) return res.send(err);
//     res.send(true);
//   })
// })

// app.get('/delete-all-open-lines', (req, res)=>{
//   Call.deleteMany({dressingChangeDate:{$ne:null}}, (err)=>{
//     if(err) return res.send(err);
//     res.send(true);
//   })
// })

// app.get('/set-as-unopen', (req,res)=>{
//   Call.updateMany({completedBy:{$ne:null}},
//     {$set:{openBy:null}}, {multi:true},(err, calls)=>{
//     if(err) return res.send(err);
//     res.send(true);
//   })
// })

app.post('/update-admin-password', (req, res)=>{
  User.findOne({username:req.body.username}, (err, user)=>{
    if(err) return res.send(err);
    if(user.password === req.body.password){
      user.password = req.body.newPassword;
      user.save((err2)=>{
        if(err2) return res.send(err2);
        res.send(user);
      })
    } else {
      res.send({'error':'incorrect password for that admin user'});
    }
  })
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

// app.get('/seed-super',(req,res)=>{
//   User.create({
//     fullname:'Brett Connolly',
//     username:'',
//     userId:1001,
//     password:'',
//     role:'super'
//   }, (err, newUser)=>{
//     if(err) return res.send(err);
//     res.send(newUser);
//   })
// });

app.get('/seed-procedures', (req, res)=>{
  Procedure.insertMany(seedData.procedureSeed,{ordered:false}, (err, procedures) => {
    if(err) return res.send(err);
    if(procedures){
      res.send(procedures);
    } else {
      res.send({'error':'no procedures exist'})
    }
  });
})

app.get('/seed-options', (req, res)=>{
  Option.insertMany(seedData.optionSeed,{ordered:false}, (err, options) => {
    if(err) return res.send(err);
    if(options){
      res.send(options);
    } else {
      res.send({'error':'no options exist'})
    }
  });
})

app.get('/seed-items', (req, res)=>{
  Item.insertMany(seedData.itemSeed,{ordered:false}, (err, items) => {
    if(err) return res.send({'error':err});
    if(items){
      res.send(items);
    } else {
      res.send({'error':'no items exist'})
    }
  });
})

app.get('/create-call-data-json', (req, res)=>{
  Call.find({}, (err, calls)=>{
    if(err) return res.send(err);
    let JSONFilePath = `./client/public/calls.json`;
    let callJSON = [];
    calls.forEach(call=>{
      callJSON.push(call);
    })
    fs.writeFile(JSONFilePath, JSON.stringify(callJSON), err2=>{
      if(err2) return res.send(err2);
      res.send(true);
    })
  })
})

app.get('/delete-call-data-json', (req, res)=>{
  fs.unlink('./client/public/calls.json', err=>{
    if(err) return res.send(err);
    res.send(true);
  })
})

app.use(((req, res) => res.sendFile(path.join(__dirname, './client/build/index.html'))));
app.listen(app.get('port'), ()=>{
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});