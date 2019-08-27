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
  },
  {
    name:'MD Order Changed?',
    inputType:'confirm',
    callFieldName:'orderChange',
    options:[
      {
        id:1,
        name:'PICC changed to ML'
      },
      {
        id:2,
        name:'PICC changed to IV'
      },
      {
        id:3,
        name:'ML changed to IV'
      },
      {
        id:4,
        name:'ML changed to PICC'
      },
      {
        id:5,
        name:'IV changed to PICC'
      },
      {
        id:6,
        name:'IV changed to ML'
      }
    ]
  },
  {
    name:'Consultation',
    inputType:'radio',
    callFieldName:'wasConsultation'
  },
  {
    name:'Call Needs',
    inputType:'dropdown',
    callFieldName:'callNeeds',
    options:[
      {
        id:1,
        name:'Lab Draw'
      },
      {
        id:2,
        name:'Blood Culture'
      },
      {
        id:3,
        name:'New IV'
      },
      {
        id:4,
        name:'PICC Line'
      },
      {
        id:5,
        name:'Midline'
      },
      {
        id:6,
        name:'Port Access'
      },
      {
        id:7,
        name:'Port De-Access'
      },
      {
        id:8,
        name:'Troubleshoot'
      },
      {
        id:9,
        name:'Dressing Change'
      },
      {
        id:10,
        name:'Labs + IV'
      },
      {
        id:11,
        name:'Custom'
      }
    ]
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
    groupName:'Ultrasound',
    value:'US Used',
    isCustom:false
  },
  {
    itemId:6,
    procedureName:'PIV Start',
    groupName:'Blood Drawn',
    value:'Blood Was Drawn',
    isCustom:false
  },
  {
    itemId:7,
    procedureName:'Lab Draw',
    groupName:'Draw Type',
    value:'From IV',
    isCustom:false
  },
  {
    itemId:8,
    procedureName:'Lab Draw',
    groupName:'Draw Type',
    value:'Labs Only',
    isCustom:false
  },
  {
    itemId:9,
    procedureName:'Lab Draw',
    groupName:'Ultrasound',
    value:'US Used',
    isCustom:false
  },
  {
    itemId:10,
    procedureName:'Blood Culture',
    groupName:'From',
    value:'PICC',
    isCustom:false
  },
  {
    itemId:11,
    procedureName:'Blood Culture',
    groupName:'From',
    value:'Midline',
    isCustom:false
  },
  {
    itemId:12,
    procedureName:'Blood Culture',
    groupName:'From',
    value:'Central Line',
    isCustom:false
  },
  {
    itemId:13,
    procedureName:'Blood Culture',
    groupName:'From',
    value:'IV',
    isCustom:false
  },
  {
    itemId:14,
    procedureName:'Blood Culture',
    groupName:'From',
    value:'Peripheral Stick x 1',
    isCustom:false
  },
  {
    itemId:15,
    procedureName:'Blood Culture',
    groupName:'From',
    value:'Peripheral Stick x 2',
    isCustom:false
  },
  {
    itemId:16,
    procedureName:'Blood Culture',
    groupName:'Ultrasound',
    value:'US Used',
    isCustom:false
  },
  {
    itemId:17,
    procedureName:'Site Care',
    groupName:'Care Type',
    value:'IV Flushed',
    isCustom:false
  },
  {
    itemId:18,
    procedureName:'Site Care',
    groupName:'Care Type',
    value:'Saline Locked',
    isCustom:false
  },
  {
    itemId:19,
    procedureName:'Site Care',
    groupName:'Care Type',
    value:'Dressing Changed',
    isCustom:false
  },
  {
    itemId:20,
    procedureName:'Site Care',
    groupName:'Care Type',
    value:'Dressing Reinforced',
    isCustom:false
  },
  {
    itemId:21,
    procedureName:'DC IV',
    groupName:'Reasons',
    value:'Inflitration',
    isCustom:false
  },
  {
    itemId:22,
    procedureName:'DC IV',
    groupName:'Reasons',
    value:'Phlebitis',
    isCustom:false
  },
  {
    itemId:23,
    procedureName:'DC IV',
    groupName:'Reasons',
    value:'PT Removal',
    isCustom:false
  },
  {
    itemId:24,
    procedureName:'DC IV',
    groupName:'Reasons',
    value:'Leaking',
    isCustom:false
  },
  {
    itemId:25,
    procedureName:'DC IV',
    groupName:'Reasons',
    value:'Painful',
    isCustom:false
  },
  {
    itemId:26,
    procedureName:'DC IV',
    groupName:'Reasons',
    value:'Per Protocol',
    isCustom:false
  },
  {
    itemId:27,
    procedureName:'Port-A-Cath',
    groupName:'Access Attempts',
    value:'1 Attempt',
    isCustom:false
  },
  {
    itemId:28,
    procedureName:'Port-A-Cath',
    groupName:'Access Attempts',
    value:'2 Attempts',
    isCustom:false
  },
  {
    itemId:29,
    procedureName:'Port-A-Cath',
    groupName:'Deaccess',
    value:'Contaminated',
    isCustom:false
  },
  {
    itemId:30,
    procedureName:'Port-A-Cath',
    groupName:'Deaccess',
    value:'Needle Change',
    isCustom:false
  },
  {
    itemId:31,
    procedureName:'Port-A-Cath',
    groupName:'Deaccess',
    value:'Therapy Complete',
    isCustom:false
  },
  {
    itemId:32,
    procedureName:'Port-A-Cath',
    groupName:'Cathflow',
    value:'Initiated',
    isCustom:false
  },
  {
    itemId:33,
    procedureName:'Port-A-Cath',
    groupName:'Cathflow',
    value:'Completed',
    isCustom:false
  },
  {
    itemId:34,
    procedureName:'PICC Line',
    groupName:'Removal',
    value:'Therapy Complete',
    isCustom:false
  },
  {
    itemId:35,
    procedureName:'PICC Line',
    groupName:'Removal',
    value:'Discharge',
    isCustom:false
  },
  {
    itemId:36,
    procedureName:'PICC Line',
    groupName:'Removal',
    value:'Clotted',
    isCustom:false
  },
  {
    itemId:37,
    procedureName:'PICC Line',
    groupName:'Removal',
    value:'Contaminated',
    isCustom:false
  },
  {
    itemId:38,
    procedureName:'PICC Line',
    groupName:'Removal',
    value:'PT Removal',
    isCustom:false
  },
  {
    itemId:39,
    procedureName:'PICC Line',
    groupName:'Cathflow',
    value:'Initiated',
    isCustom:false
  },
  {
    itemId:40,
    procedureName:'PICC Line',
    groupName:'Cathflow',
    value:'Completed',
    isCustom:false
  },
  {
    itemId:41,
    procedureName:'Dressing Change',
    groupName:'What',
    value:'PICC',
    isCustom:false
  },
  {
    itemId:42,
    procedureName:'Dressing Change',
    groupName:'What',
    value:'Port-A-Cath',
    isCustom:false
  },
  {
    itemId:43,
    procedureName:'Dressing Change',
    groupName:'What',
    value:'Central Line',
    isCustom:false
  },
  {
    itemId:44,
    procedureName:'Dressing Change',
    groupName:'What',
    value:'Midline',
    isCustom:false
  },
  {
    itemId:45,
    procedureName:'Dressing Change',
    groupName:'Why',
    value:'Per Protocol',
    isCustom:false
  },
  {
    itemId:46,
    procedureName:'Dressing Change',
    groupName:'Why',
    value:'Bleeding',
    isCustom:false
  },
  {
    itemId:47,
    procedureName:'Dressing Change',
    groupName:'Why',
    value:'Dressing Compromised',
    isCustom:false
  },
  {
    itemId:48,
    procedureName:'Troubleshoot',
    groupName:'Action Taken',
    value:'Midline',
    isCustom:false
  },
  {
    itemId:49,
    procedureName:'Troubleshoot',
    groupName:'Action Taken',
    value:'PICC',
    isCustom:false
  },
  {
    itemId:50,
    procedureName:'Troubleshoot',
    groupName:'Action Taken',
    value:'Central Line',
    isCustom:false
  },
  {
    itemId:51,
    procedureName:'Troubleshoot',
    groupName:'Action Taken',
    value:'Port',
    isCustom:false
  },
  {
    itemId:52,
    procedureName:'Troubleshoot',
    groupName:'Intervention',
    value:'Power Flush',
    isCustom:false
  },
  {
    itemId:53,
    procedureName:'Troubleshoot',
    groupName:'Intervention',
    value:'Clave Change',
    isCustom:false
  },
  {
    itemId:54,
    procedureName:'Troubleshoot',
    groupName:'Intervention',
    value:'Recommend DC',
    isCustom:false
  },
  {
    itemId:55,
    procedureName:'Troubleshoot',
    groupName:'Intervention',
    value:'Line Retracted',
    isCustom:false
  },
  {
    itemId:56,
    procedureName:'Troubleshoot',
    groupName:'Intervention',
    value:'Repositioned',
    isCustom:false
  },
  {
    itemId:57,
    procedureName:'Insertion Procedure',
    groupName:'Insertion Type',
    value:'Midline',
    isCustom:false
  },
  {
    itemId:58,
    procedureName:'Insertion Procedure',
    groupName:'Insertion Type',
    value:'SL PICC',
    isCustom:false
  },
  {
    itemId:59,
    procedureName:'Insertion Procedure',
    groupName:'Insertion Type',
    value:'TL PICC',
    isCustom:false
  },
  {
    itemId:60,
    procedureName:'Insertion Procedure',
    groupName:'Insertion Type',
    value:'DL PICC',
    isCustom:false
  },
  {
    itemId:61,
    procedureName:'Insertion Procedure',
    groupName:'Vessel',
    value:'Basilic',
    isCustom:false
  },
  {
    itemId:62,
    procedureName:'Insertion Procedure',
    groupName:'Vessel',
    value:'Brachial',
    isCustom:false
  },
  {
    itemId:63,
    procedureName:'Insertion Procedure',
    groupName:'Vessel',
    value:'Cephalic',
    isCustom:false
  },
  {
    itemId:64,
    procedureName:'Insertion Procedure',
    groupName:'Vessel',
    value:'Internal Jugular',
    isCustom:false
  },
  {
    itemId:65,
    procedureName:'Insertion Procedure',
    groupName:'Vessel',
    value:'Femoral',
    isCustom:false
  },
  {
    itemId:66,
    procedureName:'Insertion Procedure',
    groupName:'Laterality',
    value:'Left',
    isCustom:false
  },
  {
    itemId:67,
    procedureName:'Insertion Procedure',
    groupName:'Laterality',
    value:'Right',
    isCustom:false
  },
  {
    itemId:68,
    procedureName:'Insertion Procedure',
    groupName:'Insertion Length',
    value:'',
    isCustom:true,
    fieldAbbr:'Len',
    valuePrefix:'',
    valueSuffix:'cm'
  },
  {
    itemId:69,
    procedureName:'Dressing Change',
    groupName:'Why',
    value:'Site Assessment',
    isCustom:false
  },
  {
    itemId:70,
    procedureName:'PIV Start',
    groupName:'Patient Refused',
    value:'Patient Refused',
    isCustom:false
  },
  {
    itemId:71,
    procedureName:'Lab Draw',
    groupName:'Patient Refused',
    value:'Patient Refused',
    isCustom:false
  },
  {
    itemId:72,
    procedureName:'Blood Culture',
    groupName:'Patient Refused',
    value:'Patient Refused',
    isCustom:false
  },
  {
    itemId:73,
    procedureName:'Insertion Procedure',
    groupName:'Patient Refused',
    value:'Patient Refused',
    isCustom:false
  }
];

exports.procedureSeed = [
  {
    procedureId:1,
    name:'PIV Start',
    seq:1,
    groups:[
      {
        groupName:'Patient Refused',
        inputType:'radio',
        resetSiblings:true,
        groupItems:[70]
      },
      {
        groupName:'Size',
        inputType:'radio',
        groupItems:[1,2,3,4]
      },
      {
        groupName:'Ultrasound',
        inputType:'radio',
        groupItems:[5]
      },
      {
        groupName:'Blood Drawn',
        inputType:'radio',
        groupItems:[6]
      }
    ]
  },
  {
    procedureId:2,
    name:'Lab Draw',
    seq:2,
    groups:[
      {
        groupName:'Patient Refused',
        inputType:'radio',
        resetSiblings:true,
        groupItems:[71]
      },
      {
        groupName:'Draw Type',
        inputType:'radio',
        groupItems:[7,8]
      },
      {
        groupName:'Ultrasound',
        inputType:'radio',
        groupItems:[9]
      }
    ]
  },
  {
    procedureId:3,
    seq:3,
    name:'Blood Culture',
    groups:[
      {
        groupName:'Patient Refused',
        resetSiblings:true,
        inputType:'radio',
        groupItems:[72]
      },
      {
        groupName:'From',
        inputType:'radio',
        groupItems:[10,11,12,13,14,15]
      },
      {
        groupName:'Ultrasound',
        inputType:'radio',
        groupItems:[16]
      }
    ]
  },
  {
    procedureId:4,
    seq:4,
    name:'Site Care',
    groups:[
      {
        groupName:'Care Type',
        inputType:'checkbox',
        groupItems:[17,18,19,20]
      }
    ]
  },
  {
    procedureId:5,
    seq:5,
    name:'DC IV',
    groups:[
      {
        groupName:'Reasons',
        inputType:'checkbox',
        groupItems:[21,22,23,24,25,26]
      }
    ]
  },
  {
    procedureId:6,
    seq:6,
    name:'Port-A-Cath',
    groups:[
      {
        groupName:'Access Attempts',
        inputType:'radio',
        groupItems:[27,28]
      },
      {
        groupName:'Deaccess',
        inputType:'radio',
        groupItems:[29,30,31]
      },
      {
        groupName:'Cathflow',
        inputType:'radio',
        groupItems:[32,33]
      }
    ]
  },
  {
    procedureId:7,
    seq:7,
    name:'PICC Line',
    groups:[
      {
        groupName:'Removal',
        inputType:'radio',
        groupItems:[34,35,36,37,38]
      },
      {
        groupName:'Cathflow',
        inputType:'radio',
        groupItems:[39,40]
      }
    ]
  },
  {
    procedureId:8,
    seq:8,
    name:'Dressing Change',
    groups:[
      {
        groupName:'What',
        inputType:'radio',
        groupItems:[41,42,43,44]
      },
      {
        groupName:'Why',
        inputType:'radio',
        groupItems:[45,46,47,69]
      }
    ]
  },
  {
    procedureId:9,
    seq:9,
    name:'Troubleshoot',
    groups:[
      {
        groupName:'Action Taken',
        inputType:'radio',
        groupItems:[48,49,50,51]
      },
      {
        groupName:'Intervention',
        inputType:'checkbox',
        groupItems:[52,53,54,55,56]
      }
    ]
  },
  {
    procedureId:10,
    seq:10,
    name:'Insertion Procedure',
    groups:[
      {
        groupName:'Patient Refused',
        inputType:'radio',
        resetSiblings:true,
        groupItems:[73]
      },
      {
        groupName:'Insertion Type',
        inputType:'radio',
        groupItems:[57,58,59,60]
      },
      {
        groupName:'Vessel',
        inputType:'radio',
        groupItems:[61,62,63,64,65]
      },
      {
        groupName:'Laterality',
        inputType:'radio',
        groupItems:[66,67]
      },
      {
        groupName:'Insertion Length',
        fieldName:'insertionLength',
        inputType:'number',
        groupItems:[68]
      }
    ]
  }
];