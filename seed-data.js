exports.optionSeed = [
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


exports.itemSeed = [
  {
    itemId:1,
    procedureName:'PIV Start',
    groupName:'Size',
    value:'24g',
    isCustom:false
  },
  {
    itemId:2,
    procedureName:'PIV Start',
    groupName:'Size',
    value:'22g',
    isCustom:false
  },
  {
    itemId:3,
    procedureName:'PIV Start',
    groupName:'Size',
    value:'20g',
    isCustom:false
  },
  {
    itemId:4,
    procedureName:'PIV Start',
    groupName:'Size',
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
    groupName:'Ultrasound',
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
    groupName:'Ultrasound',
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
    isCustom:true,
    fieldAbbr:'Len',
    valuePrefix:'',
    valueSuffix:'cm'
  }
];

exports.procedureSeed = [
  {
    procedureId:1,
    name:'PIV Start',
    groups:[
      {
        groupName:'Size',
        inputType:'radio',
        groupItems:[1,2,3,4]
      },
      {
        groupName:'Attempts',
        inputType:'radio',
        groupItems:[5,6]
      },
      {
        groupName:'Ultrasound',
        inputType:'radio',
        groupItems:[7]
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
        groupItems:[10,11]
      },
      {
        groupName:'Ultrasound',
        inputType:'radio',
        groupItems:[12]
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
      }
    ]
  }
];

exports.produceCallDummyData = () =>{
  let dummyCallsArr = [];
  let providerArr = ['Connolly', 'Dube', 'Ulysses', 'Monroe', 'Knope', 'Smith', 'Manhole', 'Blaton', 'Cruz', 'Rockefeller'];
  let jobArr = ['Lab Draw','New IV','PICC Line','Midline','Port Access','Port De-Access','Central Line Troubleshoot','Dressing Change','Labs + IV','Custom'];
  let commentFiller = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";
  let userIds = [1002, 1003, 1004, 1005];
  
  for(let i = 0; i < 101; i++){
    let dummyCall = {};
    dummyCall.room = Math.floor(Math.random() * 10000);
    dummyCall.job = jobArr[Math.floor(jobArr.length * Math.random())];
    dummyCall.jobComments = Math.floor(Math.random() * 10) < 1 ? commentFiller : null;
    dummyCall.addComments = Math.floor(Math.random() * 10) < 1 ? commentFiller : null;
    dummyCall.createdBy = userIds[Math.floor(Math.random() * userIds.length)];
    dummyCall.startTime = randomDate(new Date(2019, 7, 12), new Date());
    dummyCall.proceduresDone = [];
    
    let procedureArr = [];
    let procedureLoopLength = Math.floor(Math.random() * 2);
    for(let j = 0; j < procedureLoopLength; j++){
      let procedureNum = Math.floor(Math.random() * 8) + 1;
      if(procedureArr.indexOf(procedureNum) < 0){
        dummyCall.proceduresDone.push({
          procedureId:procedureNum,
          itemIds:[12, 45, 33, 20]
        });
        procedureArr.push(procedureNum);
      }
    }

    //if insertion procedure
    if(procedureArr.indexOf(8) > 0){
      dummyCall.hospital = Math.floor(Math.random() * 6) + 1;
      dummyCall.mrn = Math.random() * (9999999 - 1000000) + 1000000;
      dummyCall.provider = providerArr[Math.floor(providerArr.length * Math.random())];
    }
    dummyCall.completedAt = randomDate(startTime, new Date())
    dummyCall.responseTime = Math.random() * (120000 - 1000) + 1000;
    dummyCall.procedureTime = Math.random() * (120000 - 1000) + 1000;
    dummyCall.completedBy = userIds[Math.floor(Math.random()*userIds.length)];
    dummyCall.isTest = true;
    dummyCallsArr.push(dummyCall);
  }
  
  return dummyCallsArr;
  
  function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
}