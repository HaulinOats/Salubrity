import React, {Component} from 'react';
import Modal from '../Widgets/Modal/Modal';
import Login from '../Widgets/Login/Login';
import EditProcedure from '../Widgets/EditProcedure/EditProcedure';
import axios from 'axios';
import Moment from 'react-moment';
import ls from 'local-storage';
import './Home.css';
import loadingGif from '../../public/loading.gif';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.state = {
      currentUser:null,
      errorArr:[],
      activeHomeTab:'queue',
      isLoading:false,
      modalIsOpen:false,
      modalTitle:'',
      modalMessage:'',
      modalConfirmation:false,
      confirmationType:null,
      activeRecord:null,
      queueItems:[],
      completedCalls:[],
      procedures:[],
      allOptions:[],
      usersById:null,
      itemsById:null,
      hospitalsById:null,
      referenceObj:null,
      statusById:null,
      orderChangeById:null,
      selectedProcedures:[],
      procedureVerified:false,
      insertionTypeSelected:false,
      insertionLength:'',
      lastUpdate:0,
      lastUpdateHide:false
    };
    this.toggleHandler = this.toggleHandler.bind(this);
    this.completeProcedure = this.completeProcedure.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getConfirmation = this.getConfirmation.bind(this);
    this.getDateFromObjectId = this.getDateFromObjectId.bind(this);
    this.addCall = this.addCall.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
    this.setUserSession = this.setUserSession.bind(this);
    this.logout = this.logout.bind(this);
    this.reverseCompletedSort = this.reverseCompletedSort.bind(this);
    this.resetSection = this.resetSection.bind(this);
    this.stateLoadCalls = this.stateLoadCalls.bind(this);
    this.addToErrorArray = this.addToErrorArray.bind(this);
    this.sendErrorsToAdmin = this.sendErrorsToAdmin.bind(this);
    this.saveActiveRecord = this.saveActiveRecord.bind(this);
    this.checkActiveRecord = this.checkActiveRecord.bind(this);
    this.visibilityChange = this.visibilityChange.bind(this);
    this.editCompletedCall = this.editCompletedCall.bind(this);
    this.inputLiveUpdate = this.inputLiveUpdate.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.returnToQueue = this.returnToQueue.bind(this);
    this.deleteCall = this.deleteCall.bind(this);
    this.showHiddenButtons = this.showHiddenButtons.bind(this);
    this.selectButton = this.selectButton.bind(this);
    this.changeCustomInput = this.changeCustomInput.bind(this);
    this.hospitalChange = this.hospitalChange.bind(this);
    this.orderSelect = this.orderSelect.bind(this);
    this.toggleConsultation = this.toggleConsultation.bind(this);
    this.setRecordStateItems = this.setRecordStateItems.bind(this);
    this.timerTick = this.timerTick.bind(this);
  }

  resetState(){
    this.setState({
      errorArr:[],
      activeHomeTab:'queue',
      modalIsOpen:false,
      modalTitle:'',
      modalMessage:'',
      modalConfirmation:false,
      confirmationType:null,
      activeRecord:null,
      selectedProcedures:[],
      procedureVerified:false,
      insertionTypeSelected:false,
      insertionLength:''
    });
  }
  
  componentWillMount() {
    if(ls('currentUser')){
      this.setState({
        currentUser:ls('currentUser')
      }, ()=>{
        this.setUserSession();
        this.stateLoadCalls();
      });
    }

    if(ls('activeHomeTab')){
      this.setState({activeHomeTab:ls('activeHomeTab')}, ()=>{
        if(this.state.activeHomeTab === 'active'){
          this.setState({lastUpdateHide:true});
        }
      });
    }

    // Set the name of the hidden property and the change event for visibility
    this.documentProps = {
      hidden:null,
      visibilityChange:null
    }

    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
      this.documentProps.hidden = "hidden";
      this.documentProps.visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.documentProps.hidden = "msHidden";
      this.documentProps.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.documentProps.hidden = "webkitHidden";
      this.documentProps.visibilityChange = "webkitvisibilitychange";
    }

    document.addEventListener("visibilitychange", this.visibilityChange);
  }

  visibilityChange(){
    if(document[this.documentProps.hidden]){
      this.stopIntervals();
    } else {
      this.startIntervals();
      if(this.state.activeHomeTab === 'queue'){
        this.getActiveCalls();
      }
      if(this.state.activeHomeTab === 'complete'){
        this.getCompletedCalls();
      }
    }
  }

  // getCallById(id){
  //   this.setState({isLoading:true})
  //   axios.post('/get-call-by-id', {
  //     _id:id
  //   }).then(resp=>{
  //     if(resp.data.error || resp.data._message){
  //       console.log(resp.data);
  //     } else {
  //       this.setState({activeRecord:resp.data});
  //     }
  //   })
  //   .catch(err=>{
  //     console.log(err);
  //     this.addToErrorArray(err);
  //   })
  //   .finally(()=>{
  //     this.setState({isLoading:false})
  //   })
  // }

  editCompletedCall(completedCall){
    let isAdmin = this.state.currentUser.role === 'admin' || this.state.currentUser.role === 'super';
    if(isAdmin || this.state.currentUser.userId === completedCall.completedBy){
      this.setState({
        activeRecord:completedCall
      }, ()=>{
        this.setRecordStateItems();
        this.setTab('active')
      });
    }
  }

  componentDidMount(){
    this.startIntervals();
  }

  startIntervals(){
    console.log('starting intervals...');
    this.sessionInterval = setInterval(()=>{
      if(this.state.currentUser){
        this.checkUserSession();
      }
    }, 180000);//check session every 3 minutes (180000)ms

    //Timer showing when last update occured
    this.setState({lastUpdate:0}, ()=>{
      this.updateTimer = setInterval(this.timerTick, 1000);
    })

    // this.getLatestData = setInterval(()=>{
    //   if(this.state.currentUser){
    //     if(this.state.activeHomeTab === 'queue'){
    //       this.getActiveCalls();
    //     }
    //     if(this.state.activeHomeTab === 'complete'){
    //       this.getCompletedCalls();
    //     }
    //   }
    // }, 10000);
  }

  stopIntervals(){
    // console.log('stopping intervals...');
    // clearInterval(this.getLatestData);
    clearInterval(this.updateTimer);
  }

  componentWillUnmount(){
    this.stopIntervals();
  }

  checkUserSession(){
    let currentTime = Math.floor(Date.now() / 1000);
    let timeDiff = currentTime - this.state.currentUser.lastLogin;
    console.log(`${Math.floor(timeDiff/60)} minutes inactive (ends session at 60)`);
    if(timeDiff > 3600){
      console.log('Logging user out due to inactivity');
      this.logout();
    }
    if(timeDiff > 3419){
      this.setState({
        modalTitle:'Session Is About To End',
        modalMessage:'You are about to be logged out due to inactivity. Click "OK" to continue session.',
        modalIsOpen:true,
        modalConfirmation:true
      })
    }
  }

  setUserSession(){
    let currentUser = this.state.currentUser;
    currentUser.lastLogin = Math.floor(Date.now() / 1000);
    this.setState({currentUser}, ()=>{
      ls('currentUser', this.state.currentUser);
    });
  }

  loginCallback(user){
    this.setState({
      currentUser:user    
    }, ()=>{
      this.setUserSession();
      this.stateLoadCalls();
      this.startIntervals();
    });
  }

  logout(){
    this.stopIntervals();
    this.resetModal();
    this.setState({currentUser:null}, this.resetState);
    ls.clear();
  }

  stateLoadCalls(){
    this.getAllUsers();
    this.getActiveCalls();
    this.getCompletedCalls();
    this.getProcedureData();
    this.getOptionsData();
    this.getItemsData();
    setTimeout(()=>{
      console.log(this.state);
    }, 1000);
  }

  setTab(tab, event){
    if(event){
      let tabElement = event.currentTarget.querySelector('.vas-home-nav-item-refresh-bar');
      tabElement.classList.add('vas-home-refresh-bar-activate');
      setTimeout(()=>{
        tabElement.classList.remove('vas-home-refresh-bar-activate');
      }, 1000);
    }
    clearInterval(this.updateTimer);
    this.setState({activeHomeTab:tab, lastUpdate:0}, ()=>{
      ls('activeHomeTab', this.state.activeHomeTab);
      if(this.state.activeHomeTab === 'queue'){
        this.setState({lastUpdateHide:false});
        this.getActiveCalls();
        this.updateTimer = setInterval(this.timerTick, 1000);
      }
      if(this.state.activeHomeTab === 'complete'){
        this.setState({lastUpdateHide:false});
        this.getCompletedCalls();
        this.updateTimer = setInterval(this.timerTick, 1000);
      }
      if(this.state.activeHomeTab === 'active'){
        this.setState({lastUpdateHide:true});
      }
      this.setUserSession();
    });
  }

  timerTick(){
    this.setState({lastUpdate:this.state.lastUpdate + 1});
  }

  getAllUsers(){
    axios.get('/get-all-users')
    .then((resp)=>{
      let usersObj = {};
      for(let i = 0; i < resp.data.length; i++){
        let user = resp.data[i];
        delete user.password;
        usersObj[resp.data[i].userId] = user;
      }
      this.setState({
        usersById:usersObj
      });
    }).catch((err)=>{
      this.addToErrorArray(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  getDateFromObjectId(objId){
    if(objId){
      return new Date(parseInt(objId.substring(0, 8), 16) * 1000);
    }
  }

  resetSection(e, type){
    let isInsertionProcedure = false;
    let sectionInputs = e.target.closest('.vas-edit-procedure-inner-container').querySelectorAll('input');
    sectionInputs.forEach(el=>{
      if(el.type === 'checkbox' || el.type === 'radio'){
        el.checked = false;
      }
      if(el.type === 'number' || el.type === 'text'){
        el.value = '';
      }
      if(!isInsertionProcedure && el.getAttribute('data-procedureid') === '8'){
        isInsertionProcedure = true;
      }
    });
    if(isInsertionProcedure){
      document.querySelectorAll('.vas-edit-procedure-inner-span[data-procedureid="8"]').forEach((el, idx)=>{
        if(idx > 1){
          el.style.display = 'none';
        }
      });
      this.setState({
        insertionTypeSelected:false,
        insertionLength:''
      });
    }
    
    let activeRecord = this.state.activeRecord;
    if(type === 'consultation'){
      activeRecord.wasConsultation = false;
    }
    
    if(type === 'orderChange'){
      activeRecord.orderChange = null;
    }
    this.setState({activeRecord}, this.saveActiveRecord);
    this.setUserSession();
  }

  toggleConsultation(){
    let activeRecord = this.state.activeRecord;
    activeRecord.wasConsultation = !activeRecord.wasConsultation;
    this.setState({activeRecord}, this.saveActiveRecord);
  }

  addCall(){
    this.setState({
      modalTitle:'Add Call',
      modalIsOpen:true
    })
    this.setUserSession();
  }

  inputLiveUpdate(e, field){
    let targetValue = e.target.value;
    let activeRecord = this.state.activeRecord;

    if(e.target.type === 'number'){
      activeRecord[field] = Number(targetValue);
    } else {
      activeRecord[field] = targetValue;
    }

    if(targetValue.length < 1){
      activeRecord[field] = null;
    }

    this.setState({activeRecord}, this.saveActiveRecord);
  }

  saveActiveRecord(){
    axios.post('/save-call', this.state.activeRecord)
    .then(resp=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        console.log('active call saved');
      }
    })
    .catch(err=>{
      console.log(err);
      this.addToErrorArray(err);
    })
    this.setUserSession();
  }

  getProcedureData(){
    axios.get('/get-procedures')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({
          procedures:resp.data.procedures,
          referenceObj:resp.data.referenceObj
        });
      }
    })
    .catch((err)=>{
      console.log(err);
      this.addToErrorArray(err);
    })
  }

  getOptionsData(){
    this.setState({isLoading:true});
    axios.get('/get-options')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        let hospitals = {};
        resp.data[0].options.forEach(hospital=>{
          hospitals[hospital.id] = hospital;
        });
        let orders = {};
        resp.data[3].options.forEach(order=>{
          orders[order.id] = order;
        });
        let status = {};
        resp.data[6].options.forEach(status=>{
          status[status.id] = status;
        })
        this.setState({
          allOptions:resp.data,
          hospitalsById:hospitals,
          orderChangeById:orders,
          statusById:status
        });
      }
    })
    .catch((err)=>{
      console.log(err);
      this.addToErrorArray(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  getItemsData(){
    this.setState({isLoading:true});
    axios.get('/get-items')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        let items = {};
        resp.data.forEach(item=>{
          items[item.itemId] = item;
        })
        this.setState({
          itemsById:items
        });
      }
    })
    .catch((err)=>{
      console.log(err);
      this.addToErrorArray(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  getCompletedCalls(){
    // this.setState({isLoading:true});
    axios.get('/get-completed-calls')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        console.log('completed calls updating...');
        this.setState({completedCalls:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
      this.addToErrorArray(err);
    })
    .finally(()=>{
      // this.setState({isLoading:false});
    });
  }

  getActiveCalls(){
    // this.setState({isLoading:true});
    axios.get('/get-active-calls')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        console.log('active calls updating...');
        this.setState({queueItems:resp.data}, this.checkActiveRecord);
      }
    })
    .catch((err)=>{
      console.log(err);
      this.addToErrorArray(err);
    })
    .finally(()=>{
      // this.setState({isLoading:false});
    })
  }

  checkActiveRecord(){
    if(!this.state.activeRecord){
      let activeRecordExists = false;
      for(let i = 0; i < this.state.queueItems.length; i++){
        if(this.state.queueItems[i].openBy && this.state.queueItems[i].openBy === this.state.currentUser.userId){
          activeRecordExists = true;
          this.setState({activeRecord:this.state.queueItems[i]}, this.setRecordStateItems);
          break;
        }
      }
      if(!activeRecordExists){
        this.setState({activeHomeTab:'queue'});
      }
    }
  }

  setRecordStateItems(){
    let stateObj = {};
    //check which procedure items should updated state
    if(this.state.activeRecord.proceduresDone.length){
      console.log(this.state.activeRecord.proceduresDone)
      this.state.activeRecord.proceduresDone.forEach(procedureArr=>{
        procedureArr.itemIds.forEach(itemId=>{
          switch(this.state.itemsById[itemId].groupId){
            case 18://Insertion Length
              stateObj.insertionTypeSelected = true;
              break;
            default:
          }
        });

        //find and set custom values, if they exist
        if(procedureArr.hasOwnProperty('customValues')){
          stateObj.insertionLength = String(procedureArr.customValues['70']);
        }
      });
    }
    this.setState(stateObj, ()=>{
      console.log(this.state);
    });
  }

  addToErrorArray(err){
    let errArr = this.state.errorArr;
    errArr.push(err);
    this.setState({errorArr:errArr});
  }

  sendErrorsToAdmin(){
    this.setState({isLoading:true});
    axios.post('/send-errors-to-admin', this.state.errorArr)
    .then(resp=>{
      alert('Errors sent to admin');
    })
    .catch(err=>{
      alert('Error sending errors to Admin (the irony)');
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  reverseCompletedSort(){
    let items = this.state.completedCalls;
    this.setState({completedCalls:items.reverse()});
    this.setUserSession();
  }

  toggleHandler() {
    this.setState({
      modalIsOpen: !this.state.modalIsOpen
    });
    this.setUserSession();
  }

  orderSelect(e){
    let activeRecord = this.state.activeRecord;
    if(e.target.value === ''){
      activeRecord.orderChange = null;
    } else {
      activeRecord.orderChange = Number(e.target.value);
    }
    this.setState({activeRecord}, this.saveActiveRecord);
  }

  completeProcedure(){
    if(this.state.activeRecord.completedAt){
      this.updateProcedure();
    } else {
      this.saveNewProcedure();
    }
    this.setUserSession();
  }

  updateProcedure(){
    let proceduresArr = this.createProcedureObject();
    if(this.procedureVerified(proceduresArr)){
      let updatedRecord = this.state.activeRecord;
      updatedRecord.proceduresDone = this.addCustomValuesToProceduresArr(proceduresArr);
      this.setState({activeRecord:updatedRecord}, ()=>{
        this.saveActiveRecord();
        this.procedureSaved(true);
      });
    }
  }

  addCustomValuesToProceduresArr(proceduresArr){
    for(let i = 0; i < proceduresArr.length; i++){
      //Insertion Procedure
      if(proceduresArr[i].procedureId === 8){
        proceduresArr[i].itemIds.push(70);
        proceduresArr[i].customValues = {
          '70': Number(this.state.insertionLength)
        }
      }
    }
    return proceduresArr;
  }
  
  saveNewProcedure(){
    let proceduresArr = this.createProcedureObject();
    if(this.procedureVerified(proceduresArr)){
      proceduresArr = this.addCustomValuesToProceduresArr(proceduresArr);

      let completionTime = new Date();
      let callTime = this.getDateFromObjectId(this.state.activeRecord._id);
      let startTime = new Date(this.state.activeRecord.startTime);

      this.setState({isLoading:true});
      axios.post('/procedure-completed', {
        _id:this.state.activeRecord._id,
        proceduresDone:proceduresArr,
        completedBy:Number(this.state.currentUser.userId),
        completedAt:completionTime.toISOString(),
        procedureTime:completionTime - startTime,
        responseTime:startTime - callTime
      })
      .then(resp=>{
        if(resp.data.error || resp.data._message){
          console.log(resp.data);
        } else {
          let queueItems = this.state.queueItems;
          for(var i = queueItems.length -1; i >= 0 ; i--){
            if(queueItems[i]._id === this.state.activeRecord._id){
              queueItems.splice(i, 1);
            }
          }
          this.procedureSaved(false, queueItems);
        }
      })
      .catch((err)=>{
        console.log(err);
        this.addToErrorArray(err);
      })
      .finally(()=>{
        this.setState({isLoading:false});
      })
    }
  }

  procedureSaved(isEdit, queueItems){
    this.setTab('queue');
    this.setState({
      queueItems: queueItems ? queueItems : this.state.queueItems,
      activeRecord:null,
      modalTitle: isEdit ? 'Procedure Updated' : 'Task Complete',
      modalMessage: isEdit ? 'Procedure was updated. Returning to queue.' : 'Procedure was completed. Returning to queue.',
      modalIsOpen:true
    }, ()=>{
      setTimeout(()=>{
        this.resetState();
      }, 2000);
    });
  }

  createProcedureObject(){
    let procedureObj = {};
    let selectedTasks = document.querySelectorAll('.vas-edit-procedure-select-input:checked');
    selectedTasks.forEach((el)=>{
      let itemId = Number(el.id);
      let procedureId = Number(el.getAttribute('data-procedureid'));
      if(!procedureObj.hasOwnProperty(procedureId)){
        procedureObj[procedureId] = []
      }
      procedureObj[procedureId].push(itemId);
    });

    let procedureArr = [];
    let procedureObjKeys = Object.keys(procedureObj);
    for(let key of procedureObjKeys){
      procedureArr.push({
        procedureId:Number(key),
        itemIds:procedureObj[key]
      })
    }

    return procedureArr
  }

  procedureVerified(proceduresList){
    let errors = '';
    if(!proceduresList.length){
      errors += '- You must select at least 1 procedure or confirm consultation\n';
    }

    if(this.state.insertionTypeSelected){
      if(!this.state.insertionLength.length || this.state.insertionLength === '0'){
        errors += '- You must enter an insertion length (cannot be 0)\n';
      }
      if(!this.state.activeRecord.hospital || this.state.activeRecord.hospital < 1){
        errors += '- You must select a hospital\n';
      }
      if(!this.state.activeRecord.mrn || String(this.state.activeRecord.mrn).length < 5 || String(this.state.activeRecord.mrn).length > 7){
        errors += '- Medical Record Number must be between 5 and 7 digits\n';
      }
      if(!this.state.activeRecord.provider || !this.state.activeRecord.provider.length){
        errors += '- You must enter a provider name\n';
      }
    }
    
    if(!this.state.activeRecord.room || !this.state.activeRecord.room.length){
      errors += '- Room number field cannot be empty\n';
    }
    
    if(errors.length && !this.state.activeRecord.wasConsultation){
      this.setState({
        modalIsOpen:true, 
        modalTitle:'Cannot Submit Procedure',
        modalMessage:errors
      });
      return false;
    }
    return true;
  }

  closeModal(callData){
    if(callData){
      let queueItems = this.state.queueItems;
      queueItems.push(callData);
      this.setState({
        queueItems,
        modalTitle:'Call Was Added',
        modalMessage:'Your call was added to the queue!'
      }, ()=>{
        setTimeout(()=>{
          this.resetModal();
        }, 2000);
      });
    } else {
      this.resetModal();
    }
  }

  resetModal(){
    this.setState({
      modalIsOpen:false,
      modalMessage:'',
      modalTitle:'',
      modalConfirmation:false,
      confirmationType:null
    });
  }

  getConfirmation(isConfirmed){
    if(isConfirmed){
      if(this.state.confirmationType){
        if(this.state.confirmationType === 'delete-call'){
          this.setState({isLoading:true});
          axios.post('/delete-call', {
            _id:this.state.activeRecord._id
          })
          .then(resp=>{
            if(resp.data){
              let queueItems = this.state.queueItems;
              for(var i = queueItems.length -1; i >= 0 ; i--){
                if(queueItems[i]._id === this.state.activeRecord._id){
                  queueItems.splice(i, 1);
                }
              }
              this.setTab('queue');
              this.setState({
                activeRecord:null,
                queueItems
              }, ()=>{
                this.resetState();
              });
            }
          })
          .catch(err=>{
            console.log(err);
            this.addToErrorArray(err);
          })
          .finally(()=>{
            this.setState({isLoading:false});
          })
        }
        if(this.state.confirmationType === 'reset-page'){
          window.location.reload();
        }
      }
    }
    this.setUserSession();
  }

  selectJob(job){
    if(!this.state.activeRecord){
      if(job.openBy){
        this.setState({
          modalIsOpen:true,
          modalTitle:'Record Already Open',
          modalMessage:'This record is currently opened by someone else'
        });
      } else {
        this.setState({isLoading:true});
        axios.post('/set-call-as-open', {
          _id:job._id,
          userId:this.state.currentUser.userId
        })
        .then((resp)=>{
          if(resp.data.error || resp.data._message){
            console.log(resp.data);
          } else {
            this.setState({
              activeRecord:resp.data
            }, ()=>{
              this.setTab('active');
            });
          }
        })
        .catch((err)=>{
          console.log(err);
          this.addToErrorArray(err);
        })
        .finally(()=>{
          this.setState({isLoading:false});
        })
      }
    } else {
      if(job._id !== this.state.activeRecord._id){
        this.setState({
          modalIsOpen:true,
          modalTitle:'You Have An Open Record',
          modalMessage:'You already have a record open. Complete it or "Return To Queue" to select a different one.'
        });
      }
      this.setTab('active');
    }
    this.setUserSession();
  }

  returnToQueue(){
    this.setState({isLoading:true});
    axios.post('/set-call-as-unopen', {
      _id:this.state.activeRecord._id
    })
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setTab('queue')
        this.setState({activeRecord:null}, ()=>{
          this.resetState();
        });
      }
    })
    .catch((err)=>{
      console.log(err);
      this.addToErrorArray(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    });
    this.setUserSession();
  }

  showHiddenButtons(procedureId, groupId, elClass){
    let className = `.vas-edit-procedure-${procedureId}-${groupId}`;
    let container = document.querySelector(className);
    if(container.classList.contains(elClass)){
      container.classList.remove(elClass);
      let containerInputs = document.querySelectorAll(`${className} input`);
      containerInputs.forEach((el)=>{
        el.checked = false;
      });
    } else {
      container.classList.add(elClass)
    }
  }

  selectButton(e, groupId){
    if(Number(groupId) === 11){//What
      this.checkSiblings(e);
    }
    if(Number(groupId) === 15){//Insertion Type
      this.setState({insertionTypeSelected:true});
      document.querySelectorAll('.vas-edit-procedure-inner-span[data-procedure="8"]').forEach((el)=>{
        el.style.display = 'inline';
      })
      this.checkSiblings(e);
    }
    this.setUserSession();
  }
  
  checkSiblings(e){
    let groupContainer = e.target.closest('.vas-edit-procedure-inner-span');
    while(groupContainer.nextSibling){
      let nextSib =  groupContainer.nextSibling.querySelector('.vas-edit-procedure-select-input');
      if(nextSib){
        //57 = PAC:Initiated (Port-A-Cath), 60 = Patient Refused (Insertion Procedure)
        if(nextSib.id === '55' || nextSib.id === '57'){
          nextSib.checked = false;
        } else {
          nextSib.checked = true;
        }
      }
      groupContainer = groupContainer.nextSibling;
    }
  }

  changeCustomInput(e, fieldName){
    this.setState({[fieldName]:e.target.value});
    this.setUserSession();
  }

  resetForm(){
    this.setState({
      modalTitle:'Reset Form?',
      modalMessage:'Are you sure you want to reset the current form? Will cause an app/page reload.',
      modalIsOpen:true,
      modalConfirmation:true,
      confirmationType:'reset-page'
    });
  }

  deleteCall(){
    this.setState({
      modalTitle:'Delete Active Record?',
      modalMessage:'Are you sure you want to delete the currently active record?',
      modalIsOpen:true,
      modalConfirmation:true,
      confirmationType:'delete-call'
    });
    this.setUserSession();
  }

  hospitalChange(e){
    let activeRecord = this.state.activeRecord;
    if(e.target.value !== ''){
      activeRecord.hospital = Number(e.target.value);
    } else {
      activeRecord.hospital = null;
    }
    this.setState({activeRecord}, this.saveActiveRecord);
  }

  procedureOptionCustomChange(e, field){
    this.setState({[field]:e.target.value});
    this.setUserSession();
  }

  changeStatus(e){
    let activeRecord = this.state.activeRecord;
    activeRecord.status = e.target.value;
    this.setState({activeRecord}, this.saveActiveRecord);
  }

  render(){
    let lastUpdateMin = Math.floor(this.state.lastUpdate/60);
    let lastUpdateSec = this.state.lastUpdate - lastUpdateMin * 60;

    return(
      <div>
        {!this.state.currentUser &&
          <Login loginType={'user'} loginCallback={this.loginCallback}/>
        }
        {this.state.currentUser && this.state.usersById &&
          <div className="vas-container-fluid vas-home-container">
            <header className='vas-main-header'>
              <div className='vas-header-left-container'>
                <h1 className='vas-home-header-title vas-pointer' onClick={e=>{window.location.reload()}}>VAS Tracker</h1>
                <button className='vas-button vas-home-add-call' onClick={this.addCall}>Add Call</button>
              </div>
              <div className='vas-header-right-container'>
                <span className={"vas-status-dot " + (this.state.errorArr.length > 0 ? 'vas-status-bad' : '')} onClick={this.sendErrorsToAdmin}></span>
                <p className='vas-home-main-header-user vas-nowrap'>{this.state.currentUser.fullname}</p>
                <button className='vas-home-main-header-logout' onClick={this.logout}>Logout</button>
              </div>
            </header>
            <ul className='vas-home-nav-tabs'>
              <li className='vas-home-nav-item' data-isactive={this.state.activeHomeTab === 'queue' ? true : false} onClick={e=>{this.setTab('queue', e)}}>
                <p className='vas-home-nav-item-text'>Queue</p>
                <div className='vas-home-nav-item-refresh-bar'></div>
              </li>
              <li className='vas-home-nav-item' data-isactive={this.state.activeHomeTab === 'complete' ? true : false} onClick={e=>{this.setTab('complete', e)}}>
                <p className='vas-home-nav-item-text'>Completed</p>
                <div className='vas-home-nav-item-refresh-bar'></div>
              </li>
              {this.state.activeRecord &&
                <li className={'vas-home-nav-item vas-status-' + this.state.activeRecord.status} data-isactive={this.state.activeHomeTab === 'active' ? true : false} onClick={e=>{this.setTab('active', e)}}>
                  <p className='vas-home-nav-item-text'>Open</p>
                  <div className='vas-home-nav-item-refresh-bar'></div>
                </li>
              }
              {!this.state.lastUpdateHide &&
                <div className='vas-home-last-update-container'>
                  <p className='vas-home-last-update-label'>Last Update:</p>
                  <p className='vas-home-last-update-timer'>{lastUpdateMin > 0 ? lastUpdateMin : '0'}:{lastUpdateSec < 10 ? '0' + lastUpdateSec : lastUpdateSec}</p>
                </div>
              }
            </ul>
            <div className="vas-home-tabContent">
              <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'queue' ? true : false}>
                <div className="vas-home-table vas-table">
                  <div className='vas-table-thead-row'></div>
                  <div className='vas-home-table-body'>
                    {this.state.queueItems.length > 0 && this.state.hospitalsById && this.state.queueItems.map((item, idx)=>{
                      return(
                        <div key={item._id} className={'vas-home-table-tr vas-status-' + item.status + (item.openBy ? ' vas-home-table-row-is-open' : '')} onClick={(e)=>{this.selectJob(item)}}>
                          <div className='vas-home-table-time vas-width-10'>
                            <Moment format='HH:mm'>{this.getDateFromObjectId(item._id)}</Moment>
                            <Moment className='vas-home-table-time-date' format='M/D'>{this.getDateFromObjectId(item._id)}</Moment>
                          </div>
                          <div className='vas-width-90'>
                            <p className='vas-home-table-job-name'>{item.job}{item.customJob ? ' - ' + item.customJob : ''}<b className={'vas-home-table-open-status ' + (item.openBy ? 'vas-home-open-label-blink' : '' )}>{item.openBy ? 'OPEN' : ''}</b></p>
                            <div className='vas-home-table-tr-inner'>
                              <p><b>Room:</b><i className='vas-uppercase'>{item.room}</i></p>
                              <p><b>Hospital:</b><i className='vas-capitalize'>{this.state.hospitalsById[item.hospital] ? this.state.hospitalsById[item.hospital].name : 'N/A'}</i></p>
                              <p><b>Contact:</b><i>{item.contact ? item.contact : 'N/A'}</i></p>
                              <p><b>Nurse:</b><i className='vas-capitalize'>{this.state.usersById[item.openBy] ? this.state.usersById[item.openBy].fullname : (item.openBy ? item.openBy : 'N/A')}</i></p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {this.state.queueItems.length < 1 &&
                      <div><p className='vas-queue-no-items'>There are no items currently in the queue</p></div>
                    }
                  </div>
                </div>
              </div>
              <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'complete' ? true : false}>
                <div className="vas-home-table vas-table">
                    <div className='vas-table-thead-row vas-home-completed-thead'>
                      <button className='vas-btn-normal vas-home-reverse-sort-btn' onClick={this.reverseCompletedSort}>Reverse Sort</button>
                    </div>
                    <div className='vas-home-table-body'>
                      {this.state.completedCalls.length < 1 &&
                        <div><p className='vas-queue-no-items'>There are no completed items yet for today</p></div>
                      }
                      {this.state.completedCalls.length > 0 && this.state.hospitalsById && this.state.referenceObj && this.state.itemsById && this.state.completedCalls.map((call)=>{
                        let responseTimeHr = Math.floor(call.responseTime/3600000) % 24;
                        let responseTimeMin = Math.floor(call.responseTime/60000) % 60;
                        let procedureTimeHr = Math.floor(call.procedureTime/3600000) % 24;
                        let procedureTimeMin = Math.floor(call.procedureTime/60000) % 60;
                        return(
                          <div className='vas-admin-custom-table-item-outer-container' key={call._id} onClick={e=>{this.editCompletedCall(call)}}>
                            <div className='vas-admin-custom-table-item-outer'>
                              <div className='vas-admin-custom-table-item-outer'>
                                <div className='vas-admin-custom-table-item vas-call-table-item'>
                                  <div className='vas-home-custom-table-column-1'>
                                    <Moment format='HH:mm'>{this.getDateFromObjectId(call._id)}</Moment>
                                    <Moment className='vas-home-table-time-date' format='M/D'>{this.getDateFromObjectId(call._id)}</Moment>
                                  </div>
                                  <div className={'vas-home-custom-table-column-2 ' + (call.orderChange ? 'vas-admin-order-change' : '')}>
                                    <div className='vas-admin-custom-table-td vas-admin-custom-table-nurse'>
                                      <p className='vas-admin-custom-item-subfield'>Nurse:</p>
                                      <p className='vas-admin-custom-item-subvalue'>{this.state.usersById[call.completedBy] ? this.state.usersById[call.completedBy].fullname : call.completedBy}</p>
                                    </div>
                                    <div className='vas-admin-custom-table-td vas-admin-custom-table-room'>
                                      <p className='vas-admin-custom-item-subfield'>Room:</p>
                                      <p className='vas-admin-custom-item-subvalue vas-uppercase'>{call.room}</p>
                                    </div>
                                    <span>
                                      <div className='vas-admin-custom-table-td vas-admin-custom-table-hospital'>
                                        <p className='vas-admin-custom-item-subfield'>Hospital:</p>
                                        <p className='vas-admin-custom-item-subvalue'>{call.hospital ? this.state.hospitalsById[call.hospital].name : 'N/A'}</p>
                                      </div>
                                      <div className='vas-admin-custom-table-td vas-admin-custom-table-mrn'>
                                        <p className='vas-admin-custom-item-subfield'>MRN:</p>
                                        <p className='vas-admin-custom-item-subvalue'>{call.mrn ? call.mrn : 'N/A'}</p>
                                      </div>
                                      <div className='vas-admin-custom-table-td vas-admin-custom-table-provider'>
                                        <p className='vas-admin-custom-item-subfield'>Provider:</p>
                                        <p className='vas-admin-custom-item-subvalue'>{call.provider ? call.provider : 'N/A'}</p>
                                      </div>
                                      {call.orderChange &&
                                        <div className='vas-admin-custom-table-td vas-admin-custom-table-order-change'>
                                          <p className='vas-admin-custom-item-subfield'>Order Change:</p>
                                          <p className='vas-admin-custom-item-subvalue'>{this.state.orderChangeById[call.orderChange].name}</p>
                                        </div>
                                      }
                                    </span>
                                  </div>
                                  <div className='vas-home-custom-table-column-3'>
                                    <div className='vas-call-times-row'><p className='vas-call-times-left'>Call Time:</p><p className='vas-call-times-right'><Moment format='HH:mm'>{this.getDateFromObjectId(call._id)}</Moment></p></div>
                                    <div className='vas-call-times-row'><p className='vas-call-times-left'>Start Time:</p><p className='vas-call-times-right'><Moment format='HH:mm'>{call.startTime}</Moment></p></div>
                                    <div className='vas-call-times-row'><p className='vas-call-times-left'>End Time:</p><p className='vas-call-times-right'><Moment format='HH:mm'>{call.completedAt}</Moment></p></div>
                                    <div className='vas-call-times-row'><p className='vas-call-times-left'>Response Time:</p><p className='vas-call-times-right'>{responseTimeHr > 0 ? responseTimeHr + ' Hr ' : ''}{responseTimeMin + ' Min'}</p></div>
                                    <div className='vas-call-times-row'><p className='vas-call-times-left'>Procedure Time:</p><p className='vas-call-times-right'>{procedureTimeHr > 0 ? procedureTimeHr + ' Hr ' : ''}{procedureTimeMin + ' Min'}</p></div>
                                  </div>
                                </div>
                                <div className='vas-home-custom-table-item-column-procedures'>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-procedures'>
                                    {call.proceduresDone.map((procedure, idx)=>{
                                      return (
                                        <div className='vas-admin-query-procedure-container' key={procedure.procedureId}>
                                          <p className='vas-admin-query-procedure-names'>{this.state.referenceObj.procedures[procedure.procedureId].name}</p>
                                          <div className='vas-admin-query-item-container'>
                                          {procedure.itemIds && procedure.itemIds.length > 0 &&
                                            procedure.itemIds.map((id, idx)=>{
                                              let isCustom = this.state.itemsById[id].isCustom;
                                              return (
                                                <p key={id + idx} className='vas-admin-query-item'>{!isCustom ? this.state.itemsById[id].value : this.state.itemsById[id].valuePrefix + procedure.customValues[id] + this.state.itemsById[id].valueSuffix}</p>
                                              )
                                            })
                                          }
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                              {call.wasConsultation &&
                                <div className='vas-call-consultation-container'>
                                  <p className='vas-call-consultation'>Consultation Done</p>
                                </div>
                              }
                              {(call.addComments || call.preComments) &&
                                <div className='vas-call-comments-container'>
                                  {call.preComments &&
                                    <p className='vas-call-comment'><b>Pre-Procedure:</b> {call.preComments}</p>
                                  }
                                  {call.addComments &&
                                    <p className='vas-call-comment'><b>Add'l:</b> {call.addComments}</p>
                                  }
                                </div>
                              }
                            </div>
                          </div>  
                        )
                      })
                      }
                    </div>
                </div>
              </div>
              <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'active' ? true : false}>
                {this.state.activeRecord && this.state.procedures && this.state.referenceObj && this.state.itemsById && this.state.allOptions.length > 0 &&
                  <EditProcedure 
                    insertionTypeSelected={this.state.insertionTypeSelected}
                    insertionLength={this.state.insertionLength}
                    currentRecord={this.state.activeRecord}
                    isPostEdit={this.state.activeRecord.completedAt ? true : false}
                    allOptions={this.state.allOptions}
                    procedures={this.state.procedures}
                    usersById={this.state.usersById}
                    itemsById={this.state.itemsById}
                    referenceObj={this.state.referenceObj}
                    inputLiveUpdate={this.inputLiveUpdate}
                    changeStatus={this.changeStatus}
                    resetForm={this.resetForm} 
                    returnToQueue={this.returnToQueue}
                    deleteCall={this.deleteCall}
                    resetSection={this.resetSection}
                    showHiddenButtons={this.showHiddenButtons}
                    selectButton={this.selectButton}
                    changeCustomInput={this.changeCustomInput}
                    hospitalChange={this.hospitalChange}
                    orderSelect={this.orderSelect}
                    toggleConsultation={this.toggleConsultation} 
                    setOrderWasChanged={this.setOrderWasChanged}
                    completeProcedure={this.completeProcedure}/>
                }
              </div>
            </div>
            {this.state.modalIsOpen && 
              <Modal 
                isConfirmation={this.state.modalConfirmation}
                currentUser={this.state.currentUser}
                getConfirmation={this.getConfirmation}
                closeModal={this.closeModal}
                modalTitle={this.state.modalTitle} 
                modalMessage={this.state.modalMessage}
                toggleModal={this.toggleHandler}/>
            }
          </div>
        }
        {this.state.isLoading && 
          <div className='vas-loading-container'>
            <img className='vas-loading-img' src={loadingGif} alt='loading'/>
            <p className='vas-loading-text'>Loading...</p>
          </div>
        }
      </div>
    )
  }
}