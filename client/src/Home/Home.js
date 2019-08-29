import React, {Component} from 'react';
import Modal from '../Widgets/Modal/Modal';
import Login from '../Widgets/Login/Login';
import axios from 'axios';
import Moment from 'react-moment';
import {DebounceInput} from 'react-debounce-input';
import ls from 'local-storage';
import './Home.css';
import loadingGif from '../../public/loading.gif';
import io from 'socket.io-client';
const socket = io();

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
      proceduresById:null,
      hospitalsById:null,
      statusById:null,
      orderChangeById:null,
      selectedProcedures:[],
      procedureVerified:false,
      insertionTypeSelected:false,
      insertionLength:'',
      customFields:[],
      orderChanged:false,
      orderSelected:'',
      wasConsultation:false,
      isFullscreen:false
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
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
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
      insertionLength:'',
      customFields:[],
      orderChanged:false,
      orderSelected:'',
      wasConsultation:false
    });
  }

  componentDidUpdate(){
    if(this.state.isFullscreen){

    }
  }
  
  componentWillMount() {
    if(ls('currentUser')){
      this.setState({
        currentUser:ls('currentUser'),
        isFullscreen:true
      }, ()=>{
        this.setUserSession();
        this.stateLoadCalls();
      });
    }

    if(ls('activeHomeTab')){
      this.setState({activeHomeTab:ls('activeHomeTab')});
    }

    //get document for accessing fullscreen API
    this.document = document.documentElement;
  }

  componentDidMount(){
    this.sessionInterval = setInterval(()=>{
      if(this.state.currentUser){
        this.checkUserSession();
      }
    }, 180000);//check session every 3 minutes (180000)ms
  }

  componentWillUnmount(){
    clearInterval(this.sessionInterval);
  }

  checkUserSession(){
    let currentTime = Math.floor(Date.now() / 1000);
    let timeDiff = currentTime - this.state.currentUser.lastLogin;
    console.log(`${Math.floor(timeDiff/60)} minutes inactive (ends session at 30)`);
    if(timeDiff > 1800){
      console.log('Logging user out due to inactivity');
      this.logout();
    }
    if(timeDiff > 1619){
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
      currentUser:user,
      isFullscreen:true
    }, ()=>{
      this.setUserSession();
      this.stateLoadCalls();
    });
  }

  logout(){
    this.setState({currentUser:null}, this.resetState);
    ls.clear();
    this.exitFullscreen();
  }

  stateLoadCalls(){
    this.sockListeners();
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

  sockListeners(){
    socket.on('connect', ()=>{
      console.log('socket opened...');
    });
    socket.on('call', data=>{
      let callObj = JSON.parse(data);
      let calls;
      switch(callObj.action){
        case 'addCall':
          calls = this.state.queueItems;
          calls.push(callObj.call);
          this.setState({queueItems:calls});
          break;
        case 'callUpdate':
          calls = this.state.queueItems;
          for(let i = 0; i < calls.length; i++){
            if(calls[i]._id === callObj.call._id){
              calls[i] = callObj.call;
              break;
            }
          }
          this.setState({queueItems:calls});
          break;
        case 'callCompleted':
          //remove from queue
          calls = this.state.queueItems;
          for(let i = calls.length - 1; i >= 0; i--) {
            if(calls[i]._id === callObj.call._id) {
              calls.splice(i, 1);
              break;
            }
          }
          //add to completed
          let completedCalls = this.state.completedCalls;
          completedCalls.unshift(callObj.call);
    
          this.setState({
            queueItems:calls,
            completedCalls
          });
          break;
        case 'callDeleted':
          calls = this.state.queueItems;
          for(let i = calls.length - 1; i >= 0; i--) {
            if(calls[i]._id === callObj.call._id) {
              calls.splice(i, 1);
              break;
            }
          }
          this.setState({queueItems:calls});
          break;
        default:
      }
    });
    socket.on('disconnect', ()=>{
      console.log('... socket closed');
    });
  }

  toggleFullscreen(){
    if(this.state.isFullscreen){
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  enterFullscreen(){
    if (this.document.requestFullscreen) {
      this.document.requestFullscreen();
    } else if (this.document.mozRequestFullScreen) { /* Firefox */
      this.document.mozRequestFullScreen();
    } else if (this.document.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      this.document.webkitRequestFullscreen();
    } else if (this.document.msRequestFullscreen) { /* IE/Edge */
      this.document.msRequestFullscreen();
    }
  }

  exitFullscreen(){
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }

  setTab(tab){
    this.setState({activeHomeTab:tab}, ()=>{
      ls('activeHomeTab', this.state.activeHomeTab);
      this.setUserSession();
    });
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
    let sectionInputs = e.target.closest('.vas-home-inner-container').querySelectorAll('input');
    sectionInputs.forEach(el=>{
      if(el.type === 'checkbox' || el.type === 'radio'){
        el.checked = false;
      }
      if(el.type === 'number' || el.type === 'text'){
        el.value = '';
      }
      if(!isInsertionProcedure && el.getAttribute('data-procedureid') === '10'){
        isInsertionProcedure = true;
      }
    });
    if(isInsertionProcedure){
      document.querySelectorAll('.vas-home-inner-span[data-procedure="InsertionProcedure"]').forEach((el, idx)=>{
        if(idx > 1){
          el.style.display = 'none';
        }
      });
      this.setState({
        insertionTypeSelected:false,
        insertionLength:''
      });
    }
    
    if(type === 'consultation'){
      this.setState({wasConsultation:false});
    }

    if(type === 'orderChange'){
      this.setState({
        orderChanged:false,
        orderSelected:''
      });
    }
    this.setUserSession();
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
    axios.post('/save-active-record', this.state.activeRecord)
    .then(resp=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        console.log('active record saved');
      }
    })
    .catch(err=>{
      console.log(err);
      this.addToErrorArray(err);
    })
    this.setUserSession();
  }

  getProcedureData(){
    this.setState({isLoading:true});
    axios.get('/get-procedures')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        //sort procedures by 'seq' number
        let procedures = resp.data;
        procedures.sort((a,b)=>{
          if(a.seq < b.seq) return -1;
          if(a.seq > b.seq) return 1;
          return 0;
        });
        //create procedure names object
        let procedureNamesObj = {};
        for(let i = 0; i < resp.data.length; i++){
          procedureNamesObj[resp.data[i].procedureId] = resp.data[i];
        }
        this.setState({
          procedures,
          proceduresById:procedureNamesObj
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
    this.setState({isLoading:true});
    axios.get('/get-completed-calls')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({completedCalls:resp.data});
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

  getActiveCalls(){
    this.setState({isLoading:true});
    axios.get('/get-active-calls')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        this.setState({queueItems:[]});
      } else {
        this.setState({queueItems:resp.data}, ()=>{
          let activeRecordExists = false;
          for(let i = 0; i < this.state.queueItems.length; i++){
            if(this.state.queueItems[i].openBy && this.state.queueItems[i].openBy === this.state.currentUser.userId){
              this.setState({activeRecord:this.state.queueItems[i]});
              activeRecordExists = true;
              break;
            }
          }
          if(!activeRecordExists){
            this.setTab('queue');
          }
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

  completeProcedure(){
    let proceduresArr = this.createProcedureObject();
    if(this.procedureVerified(proceduresArr)){
      // grab custom input values if a procedure was selected that has them
      //check if any procedures have required fields
      for(let i = 0; i < proceduresArr.length; i++){
        //Insertion Procedure
        if(proceduresArr[i].procedureId === 10){
          proceduresArr[i].itemIds.push(68);
          proceduresArr[i].customValues = {
            '68': Number(this.state.insertionLength)
          }
        }
      }

      let completionTime = new Date();
      let callTime = this.getDateFromObjectId(this.state.activeRecord._id);
      let startTime = new Date(this.state.activeRecord.startTime);

      this.setState({isLoading:true});
      axios.post('/procedure-completed', {
        _id:this.state.activeRecord._id,
        proceduresDone:proceduresArr,
        completedBy:Number(this.state.currentUser.userId),
        completedAt:completionTime.toISOString(),
        addComments:this.state.activeRecord.addComments ? this.state.activeRecord.addComments.trim() : null,
        hospital:this.state.activeRecord.hospital ? this.state.activeRecord.hospital : null,
        provider:this.state.activeRecord.provider ? this.state.activeRecord.provider.trim() : null,
        mrn:(this.state.activeRecord.mrn && this.state.activeRecord.mrn.length > 4 && this.state.activeRecord.mrn.length < 8) ? this.state.activeRecord.mrn : null,
        procedureTime:completionTime - startTime,
        responseTime:startTime - callTime,
        orderChange: this.state.orderChanged ? Number(this.state.orderSelected) : null,
        wasConsultation:this.state.wasConsultation
      })
      .then(resp=>{
        if(resp.data.error || resp.data._message){
          console.log(resp.data);
        } else {
          this.setTab('queue');
          this.setState({
            activeRecord:null,
            modalTitle:'Task Complete',
            modalMessage:'Procedure was completed. Returning to queue.',
            modalIsOpen:true
          }, ()=>{
            setTimeout(()=>{
              this.resetState();
            }, 2000);
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
    this.setUserSession();
  }

  createProcedureObject(){
    let procedureObj = {};
    let selectedTasks = document.querySelectorAll('.vas-home-select-input:checked');
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

    if(this.state.orderChanged){
      if(!this.state.orderSelected.length){
        errors += '- You must select an order change option\n';
      }
    }

    if(this.state.insertionTypeSelected){
      if(!this.state.insertionLength.length){
        errors += '- You must enter an insertion length\n';
      }
      if(!this.state.activeRecord.hospital || this.state.activeRecord.hospital < 1){
        errors += '- You must select a hospital\n';
      }
      if(!this.state.activeRecord.mrn || String(this.state.activeRecord.mrn).length < 5 || String(this.state.activeRecord.mrn).length > 7){
        console.log(this.state.activeRecord.mrn);
        errors += '- Medical Record Number must be between 5 and 7 digits\n';
      }
      if(!this.state.activeRecord.provider || !this.state.activeRecord.provider.length){
        errors += '- You must enter a provider name\n';
      }
    }
    
    if(!this.state.activeRecord.room || !this.state.activeRecord.room.length){
      errors += '- Room number field cannot be empty\n';
    }
    
    if(errors.length && !this.state.wasConsultation){
      this.setState({
        modalIsOpen:true, 
        modalTitle:'Cannot Submit Procedure',
        modalMessage:errors
      });
      return false;
    }
    return true;
  }

  closeModal(){
    this.setState({
      modalIsOpen:false,
      modalMessage:'',
      modalTitle:'',
      modalConfirmation:false,
      confirmationType:null
    }, this.setUserSession);
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
              this.setTab('queue');
              this.setState({activeRecord:null}, ()=>{
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
    console.log(job);
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
            this.setState({activeRecord:resp.data}, ()=>{
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

  showHiddenButtons(procedureName, groupName, elClass){
    let className = `.vas-home-${procedureName}-${groupName}`;
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

  selectButton(e, procedureName, groupName, resetSiblings){
    if(procedureName === 'Dressing Change'){
      if(groupName === 'What'){
        checkSiblings();
      }
    }
    if(procedureName === 'Insertion Procedure'){
      if(groupName === 'Insertion Type'){
        this.setState({insertionTypeSelected:true});
        document.querySelectorAll('.vas-home-inner-span[data-procedure="InsertionProcedure"]').forEach((el)=>{
          el.style.display = 'inline';
        })
        checkSiblings();
      }
    }

    function checkSiblings(){
      let groupContainer = e.target.closest('.vas-home-inner-span');
      while(groupContainer.nextSibling){
        let nextSib =  groupContainer.nextSibling.querySelector('.vas-home-select-input');
        if(nextSib.id === '7' || nextSib.id === '12' || nextSib.id === '73'){
          nextSib.checked = false;
        } else {
          nextSib.checked = true;
        }
        groupContainer = groupContainer.nextSibling;
      }
    }
    this.setUserSession();
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

  orderSelect(e){
    if(e.target.value === 'default'){
      this.setState({orderSelected:''});
    } else {
      this.setState({orderSelected:e.target.value});
    }
    this.setUserSession();
  }

  changeStatus(e){
    let activeRecord = this.state.activeRecord;
    activeRecord.status = e.target.value;
    this.setState({activeRecord}, this.saveActiveRecord);
  }

  render(){
    return(
      <div>
        {!this.state.currentUser &&
          <Login loginType={'user'} loginCallback={this.loginCallback}/>
        }
        {this.state.currentUser && this.state.usersById &&
          <div className="vas-container-fluid vas-home-container">
            <header className='vas-main-header'>
              <div className='vas-header-left-container'>
                <h1 className='vas-home-header-title vas-pointer' onClick={e=>{this.setState({isFullscreen:!this.state.isFullscreen}, this.toggleFullscreen)}}>VAS Tracker</h1>
                <button className='vas-button vas-home-add-call' onClick={this.addCall}>Add Call</button>
              </div>
              <div className='vas-header-right-container'>
                <span className={"vas-status-dot " + (this.state.errorArr.length > 0 ? 'vas-status-bad' : '')} onClick={this.sendErrorsToAdmin}></span>
                <p className='vas-home-main-header-user vas-nowrap'>{this.state.currentUser.fullname}</p>
                <button className='vas-home-main-header-logout' onClick={this.logout}>Logout</button>
              </div>
            </header>
            <ul className='vas-home-nav-tabs'>
              <li className='vas-home-nav-item' data-isactive={this.state.activeHomeTab === 'queue' ? true : false} onClick={e=>{this.setTab('queue')}}>Queue</li>
              <li className='vas-home-nav-item' data-isactive={this.state.activeHomeTab === 'complete' ? true : false} onClick={e=>{this.setTab('complete')}}>Completed</li>
              {this.state.activeRecord &&
                <li className={'vas-home-nav-item vas-status-' + this.state.activeRecord.status} data-isactive={this.state.activeHomeTab === 'active' ? true : false} onClick={e=>{this.setTab('active')}}>Active/Open</li>
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
                          <div className='vas-home-table-time vas-width-10'><Moment format='HH:mm'>{this.getDateFromObjectId(item._id)}</Moment></div>
                          <div className='vas-width-90'>
                            <p className='vas-home-table-job-name'>{item.job}{item.customJob ? ' - ' + item.customJob : ''}<b className={'vas-home-table-open-status ' + (item.openBy ? 'vas-home-open-label-blink' : '' )}>{item.openBy ? 'OPEN' : ''}</b></p>
                            <div className='vas-home-table-tr-inner'>
                              <p><b>Room:</b><i className='vas-uppercase'>{item.room}</i></p>
                              <p><b>Hospital:</b><i className='vas-capitalize'>{this.state.hospitalsById[item.hospital] ? this.state.hospitalsById[item.hospital].name : 'N/A'}</i></p>
                              <p><b>Contact:</b><i>{item.contact ? item.contact : 'N/A'}</i></p>
                              <p><b>Nurse:</b><i className='vas-capitalize'>{this.state.usersById[item.openBy] ? this.state.usersById[item.openBy].fullname : 'N/A'}</i></p>
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
                      {this.state.completedCalls.length > 0 && this.state.hospitalsById && this.state.proceduresById && this.state.itemsById && this.state.completedCalls.map((call)=>{
                        let isComments = call.addComments;
                        let isHospital = call.hospital;
                        let responseTimeHr = Math.floor(call.responseTime/3600000) % 24;
                        let responseTimeMin = Math.floor(call.responseTime/60000) % 60;
                        let procedureTimeHr = Math.floor(call.procedureTime/3600000) % 24;
                        let procedureTimeMin = Math.floor(call.procedureTime/60000) % 60;
                        return(
                          <div key={call._id} className='vas-admin-custom-table-item-outer'>
                            {!call.openBy &&
                              <div>
                                <div className='vas-admin-custom-table-item vas-call-table-item'>
                                  <div className='vas-home-custom-table-column-1'>
                                    <p><Moment format='HH:mm'>{this.getDateFromObjectId(call._id)}</Moment></p>
                                  </div>
                                  <div className={'vas-home-custom-table-column-2 ' + (call.orderChange ? 'vas-admin-order-change' : '')}>
                                    {call.orderChange &&
                                      <div className='vas-admin-custom-table-td vas-admin-custom-table-order-change'>
                                        <p className='vas-admin-custom-item-subfield'>Order Change:</p>
                                        <p className='vas-admin-custom-item-subvalue'>{this.state.orderChangeById[call.orderChange].name}</p>
                                      </div>
                                    }
                                    <div className='vas-admin-custom-table-td vas-admin-custom-table-nurse'>
                                      <p className='vas-admin-custom-item-subfield'>Nurse:</p>
                                      <p className='vas-admin-custom-item-subvalue'>{this.state.usersById[call.completedBy] ? this.state.usersById[call.completedBy].fullname : 'Super Admin'}</p>
                                    </div>
                                    <div className='vas-admin-custom-table-td vas-admin-custom-table-room'>
                                      <p className='vas-admin-custom-item-subfield'>Room:</p>
                                      <p className='vas-admin-custom-item-subvalue vas-uppercase'>{call.room}</p>
                                    </div>
                                    <span>
                                      <div className='vas-admin-custom-table-td vas-admin-custom-table-hospital'>
                                        <p className='vas-admin-custom-item-subfield'>Hospital:</p>
                                        <p className='vas-admin-custom-item-subvalue'>{isHospital ? this.state.hospitalsById[call.hospital].name : 'N/A'}</p>
                                      </div>
                                      <div className='vas-admin-custom-table-td vas-admin-custom-table-mrn'>
                                        <p className='vas-admin-custom-item-subfield'>MRN:</p>
                                        <p className='vas-admin-custom-item-subvalue'>{call.mrn ? call.mrn : 'N/A'}</p>
                                      </div>
                                      <div className='vas-admin-custom-table-td vas-admin-custom-table-provider'>
                                        <p className='vas-admin-custom-item-subfield'>Provider:</p>
                                        <p className='vas-admin-custom-item-subvalue'>{call.provider ? call.provider : 'N/A'}</p>
                                      </div>
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
                                    {call.proceduresDone.map((procedure)=>{
                                      return (
                                        <div className='vas-admin-query-procedure-container' key={procedure.procedureId}>
                                          <p className='vas-admin-query-procedure-names'>{this.state.proceduresById[procedure.procedureId].name}</p>
                                          <div className='vas-admin-query-item-container'>
                                          {procedure.itemIds && procedure.itemIds.length > 0 &&
                                            procedure.itemIds.map((id)=>{
                                              let isCustom = this.state.itemsById[id].isCustom;
                                              return (
                                                <p key={id} className='vas-admin-query-item'>{!isCustom ? this.state.itemsById[id].value : this.state.itemsById[id].valuePrefix + procedure.customValues[id] + this.state.itemsById[id].valueSuffix}</p>
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
                            }
                            {call.wasConsultation &&
                              <div className='vas-call-consultation-container'>
                                <p className='vas-call-consultation'>Consultation Done</p>
                              </div>
                            }
                            {isComments &&
                              <div className='vas-call-comments-container'>
                                {call.preComments &&
                                  <p className='vas-call-comment'><b>Pre-Procedure Comments:</b> {call.preComments}</p>
                                }
                                {call.addComments &&
                                  <p className='vas-call-comment'><b>Add'l Comments:</b> {call.addComments}</p>
                                }
                              </div>
                            }
                          </div>    
                        )
                      })
                      }
                    </div>
                </div>
              </div>
              {this.state.activeRecord && this.state.itemsById && this.state.allOptions.length > 0 &&
                <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'active' ? true : false}>
                  <header className={"vas-home-record-header vas-status-" + this.state.activeRecord.status}>
                    <p className="vas-home-record-header-text">
                      <b className="vas-home-live-edit-input vas-home-job-input vas-block">{this.state.activeRecord.job}</b>
                      <DebounceInput
                        type="text"
                        className="vas-home-live-edit-input vas-home-custom-job-input vas-inline-block"
                        debounceTimeout={750}
                        value={this.state.activeRecord.customJob ? this.state.activeRecord.customJob : ''}
                        onChange={e=>{this.inputLiveUpdate(e, 'customJob')}} />
                    </p>
                    <p className="vas-home-record-header-subtext vas-pointer">
                      <b className='vas-home-room-text'>Room:</b>
                      <DebounceInput
                          className="vas-home-live-edit-input vas-home-live-edit-input-room vas-inline-block vas-uppercase"
                          type="text"
                          debounceTimeout={750}
                          value={this.state.activeRecord.room ? this.state.activeRecord.room : ''}
                          onChange={e=>{this.inputLiveUpdate(e, 'room')}} />
                    </p>
                    <div className='vas-home-status-container'>
                      <p className='vas-home-status-text'>Status:</p>
                      <select className='vas-select vas-home-status-dropdown' value={this.state.activeRecord.status} onChange={e=>{this.changeStatus(e)}}>
                        {this.state.allOptions[6].options.map(option=>{
                          return <option key={option.id} value={option.id}>{option.name}</option>
                        })}
                      </select>
                    </div>
                    <button className="vas-home-record-header-btn" onClick={e=>{this.resetForm()}}>Reset Form</button>
                    <button className="vas-home-record-header-btn" onClick={e=>{this.returnToQueue()}}>Return To Queue</button>
                    <button className='vas-home-record-header-btn vas-warn-btn' onClick={e=>{this.deleteCall()}}>Delete Call</button>
                  </header>
                  {this.state.activeRecord.preComments &&
                    <div className="vas-home-inner-container vas-home-inner-container-main-comment">
                      <header className="vas-home-inner-container-header">
                        <p>Pre-Procedure Notes</p>
                      </header>
                      <div className="vas-home-inner-container-main">
                        <div className="vas-home-inner-container-row">
                          <p className='vas-home-comment'>{this.state.activeRecord.preComments}</p>
                        </div>
                      </div>
                    </div>
                  }
                  {this.state.procedures.map((procedure, idx)=>{
                      return (
                        <div className="vas-home-inner-container" key={procedure._id}>
                          <header className="vas-home-inner-container-header">
                            <p>{procedure.name}</p>
                            <button className='vas-btn-reset-buttons' onClick={e=>{this.resetSection(e)}}>Reset</button>
                          </header>
                          <div className="vas-home-inner-container-main">
                            {procedure.groups.map((group, idx2)=>{
                              return(
                                <span className='vas-home-inner-span' data-procedure={procedure.name.replace(/\s+/g, '')} data-idx={idx2} key={idx+group.groupName}>
                                  {group.groupName === 'Cathflow' &&
                                    <button className='vas-home-cathflow-btn' onClick={e=>{this.showHiddenButtons(procedure.name.replace(/\s+/g, ''), group.groupName.replace(/\s+/g, ''), 'vas-home-important-hide')}}>{group.groupName}</button>
                                  }
                                  {!group.hideHeader &&
                                    <h3>{group.groupName}</h3>
                                  }
                                  <div className={group.groupName === 'Cathflow' ? 'vas-home-inner-container-row vas-home-important-hide vas-home-' + procedure.name.replace(/\s+/g, '') + '-' + group.groupName.replace(/\s+/g, '')  : 'vas-home-inner-container-row'}>
                                    {group.groupItems.map((itemId)=>{
                                        let customInput = (group.inputType === 'number' || group.inputType === 'text') ? true : false;
                                        return(
                                          <span key={itemId}>
                                            {!customInput &&
                                              <span>
                                                <input type={group.inputType} className={"vas-home-select-input vas-"+ group.inputType +"-select"} data-procedureid={procedure.procedureId} id={itemId} name={procedure.name.replace(/\s+/g, '') +"_"+ group.groupName.replace(/\s+/g, '')}/>
                                                <label className="vas-btn" htmlFor={itemId} onClick={e=>{this.selectButton(e, procedure.name, group.groupName, group.resetSiblings)}}>{this.state.itemsById[itemId].value}</label>
                                              </span>
                                            }
                                            {customInput &&
                                              <span>
                                                <input type={group.inputType} onChange={e=>{this.changeCustomInput(e, group.fieldName)}} data-procedureid={procedure.procedureId} placeholder={this.state.itemsById[itemId].value} className={"vas-custom-input vas-home-select-input vas-"+ group.inputType +"-select"} id={itemId} />
                                              </span>
                                            }
                                          </span>
                                        )
                                      })
                                    }
                                  </div>
                                </span>
                              )})
                            }
                            </div>
                        </div>
                      )
                    })
                  }
                  {this.state.insertionTypeSelected &&
                    <div className='vas-home-options-container'>
                      <div className='vas-home-option-inner'>
                        <label>{this.state.allOptions[1].name}:</label>{/* Medical Record Number */}
                        <DebounceInput className='vas-custom-input' debounceTimeout={750} type='number' value={this.state.activeRecord.mrn ? this.state.activeRecord.mrn : ''} onChange={e=>{this.inputLiveUpdate(e, 'mrn')}} />
                      </div>
                      <div className='vas-home-option-inner'>
                        <label>{this.state.allOptions[2].name}:</label>{/* Provider */}
                        <DebounceInput className='vas-custom-input' debounceTimeout={750} type="text" value={this.state.activeRecord.provider ? this.state.activeRecord.provider : ''} onChange={e=>{this.inputLiveUpdate(e, 'provider')}} />
                      </div>
                    </div>
                  }
                  <div className='vas-home-inner-container'>
                    <header className='vas-home-inner-container-header'>
                      <p>Hospital</p>
                      <button className='vas-btn-reset-buttons' onClick={e=>{this.resetSection(e, 'orderChange')}}>Reset</button>
                    </header>
                    <div className='vas-home-inner-container-main'>
                      <select className='vas-select' value={this.state.activeRecord.hospital} onChange={e=>{this.hospitalChange(e)}}>
                        <option value=''>Select A Hospital</option>
                        {this.state.allOptions[0] && this.state.allOptions[0].options.map((subOption, idx2)=>{
                          return <option key={subOption.id} value={subOption.id}>{subOption.name}</option>
                        })}
                      </select>
                    </div>
                  </div>
                  <div className='vas-home-inner-container vas-home-order-change'>
                    <header className='vas-home-inner-container-header'>
                      <p>MD Order Change</p>
                      <button className='vas-btn-reset-buttons' onClick={e=>{this.resetSection(e, 'orderChange')}}>Reset</button>
                    </header>
                    <div className='vas-home-inner-container-main'>
                      <input type='radio' className="vas-radio-select vas-home-order-change-input" id='order-change' name='order-change'/>
                      <label className="vas-btn" htmlFor='order-change' onClick={e=>{this.setState({orderChanged:true})}}>Order Was Changed</label>
                      {this.state.orderChanged &&
                        <select className='vas-select' value={this.state.orderSelected} onChange={e=>{this.orderSelect(e)}}>
                          <option value="default">Select An Order</option>
                          {this.state.allOptions[3].options.map((option, idx)=>{
                            return <option key={option.id} value={option.id}>{option.name}</option>
                          })}
                        </select>
                      }
                    </div>
                  </div>
                  <div className='vas-home-inner-container vas-home-order-change'>
                    <header className='vas-home-inner-container-header'>
                      <p>Consultation</p>
                      <button className='vas-btn-reset-buttons' onClick={e=>{this.resetSection(e, 'consultation')}}>Reset</button>
                    </header>
                    <div className='vas-home-inner-container-main'>
                      <input type='radio' className="vas-radio-select vas-home-consultation-input" id='consultation' name='consultation'/>
                      <label className="vas-btn" htmlFor='consultation' onClick={e=>{this.setState({wasConsultation:true})}}>Consultation Done</label>
                    </div>
                  </div>
                  <div className='vas-home-inner-container'>
                    <header className='vas-home-inner-container-header'>
                      <p>Additional Comments</p>
                    </header>
                    <div className='vas-home-inner-container-main'>
                      <DebounceInput element='textarea' className='vas-home-add-comments' debounceTimeout={750} value={this.state.activeRecord.addComments ? this.state.activeRecord.addComments : ''} onChange={e=>{this.inputLiveUpdate(e, 'addComments')}}/>
                    </div>
                  </div>
                  <div className="vas-home-inner-container vas-home-inner-container-final">
                    <header className="vas-home-inner-container-header vas-home-inner-container-final-header">
                      <p>Complete Task</p>
                    </header>
                    <div className='vas-home-final-container'>
                      <div>
                        <button className='vas-button vas-home-complete-procedure-btn' onClick={this.completeProcedure}>Submit Procedure</button>
                      </div>
                    </div>
                  </div>
                </div>
              }
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