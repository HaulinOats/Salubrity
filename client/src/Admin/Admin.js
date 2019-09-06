import React, {Component} from 'react';
import Login from '../Widgets/Login/Login';
import Modal from '../Widgets/Modal/Modal';
import EditProcedure from '../Widgets/EditProcedure/EditProcedure';
import './Admin.css';
import axios from 'axios';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import loadingGif from '../../public/loading.gif';
import ReturnedProcedures from '../Widgets/ReturnedProcedures/ReturnedProcedures';
import ls from 'local-storage';

export default class Admin extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentUser:null,
      startDate:moment(),
      endDate:moment(),
      isLoading:false,
      activePage:'date',
      activeRecord:null,
      addFullName:'',
      addUserName:'',
      addPassword:'',
      addAdminAccess:false,
      allUsers:[],
      procedures:[],
      allItems:[],
      usersById:null,
      referenceObj:null,
      hospitalsById:null,
      itemsById:null,
      proceduresById:null,
      orderChangeById:null,
      allOptions:[],
      queriedCalls:[],
      firstFilterValue:'',
      secondFilterValue:'',
      secondDropdownArr:[],
      addHospitalName:'',
      addOrderChangeName:'',
      addNeedName:'',
      modalIsOpen:false,
      modalMessage:'',
      modalTitle:'',
      modalConfirmation:false,
      confirmationType:null,
      menuIsVisible:false,
      insertionLength:'',
      insertionTypeSelected:false
    }
    this.submitDateRange = this.submitDateRange.bind(this);
    this.seedProcedures = this.seedProcedures.bind(this);
    this.seedOptions = this.seedOptions.bind(this);
    this.seedItems = this.seedItems.bind(this);
    this.addUser = this.addUser.bind(this);
    this.logout = this.logout.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
    this.startDateChange = this.startDateChange.bind(this);
    this.endDateChange = this.endDateChange.bind(this);
    this.sortByOnChange = this.sortByOnChange.bind(this);
    this.addHospital = this.addHospital.bind(this);
    this.addOrderChange = this.addOrderChange.bind(this);
    this.handleUserSessionData = this.handleUserSessionData.bind(this);
    this.addNeed = this.addNeed.bind(this);
    this.addInputChange = this.addInputChange.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.refreshUserSession = this.refreshUserSession.bind(this);
    this.toggleMainMenu = this.toggleMainMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.editCompletedCall = this.editCompletedCall.bind(this);
    this.setRecordStateItems = this.setRecordStateItems.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.deleteCall = this.deleteCall.bind(this);
    this.getConfirmation = this.getConfirmation.bind(this);
    this.changeCustomInput = this.changeCustomInput.bind(this);
    this.completeProcedure = this.completeProcedure.bind(this);
    this.inputLiveUpdate = this.inputLiveUpdate.bind(this);
    this.toggleConsultation = this.toggleConsultation.bind(this);
    this.orderSelect = this.orderSelect.bind(this);
    this.hospitalChange = this.hospitalChange.bind(this);
  }

  componentWillMount(){
    if(ls('currentUser')){
      this.setState({
        currentUser:ls('currentUser')
      }, ()=>{
        this.refreshUserSession();
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
  }

  componentDidMount(){
    this.startSessionInterval();
    console.log(this.state);
  }

  refreshUserSession(){
    let currentUser = this.state.currentUser;
    currentUser.lastLogin = Math.floor(Date.now() / 1000);
    this.setState({currentUser}, ()=>{
      ls('currentUser', this.state.currentUser);
    });
  }

  loginCallback(user){
    let currentUser = user;
    currentUser.lastLogin = Math.floor(Date.now() / 1000);
    this.setState({currentUser:user}, this.stateLoadCalls);
  }

  handleUserSessionData(){
    this.stateLoadCalls();
  }

  startSessionInterval(){
    console.log('starting intervals...');
    this.sessionInterval = setInterval(()=>{
      if(this.state.currentUser){
        this.checkUserSession();
      }
    }, 180000);//check session every 3 minutes (180000)ms
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

  stateLoadCalls(){
    this.setState({isLoading:true});
    this.getAllUsers();
    this.getProcedureData();
    this.getOptionsData();
    this.getItemsData();
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

  getAllUsers(){
    axios.get('/get-all-users')
    .then((resp)=>{
      let usersObj = {};
      for(let i = 0; i < resp.data.length; i++){
        usersObj[resp.data[i].userId] = resp.data[i]
      }
      this.setState({
        allUsers:resp.data,
        usersById:usersObj
      });
    }).catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  seedProcedures(){
    this.setState({isLoading:true});
    axios.get('/seed-procedures')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({allProcedures:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }
  
  seedOptions(){
    this.setState({isLoading:true});
    axios.get('/seed-options')
    .then(resp=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({allOptions:resp.data});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  seedItems(){
    this.setState({isLoading:true});
    axios.get('/seed-items')
    .then(resp=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({allItems:resp.data});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
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

  orderSelect(e){
    let activeRecord = this.state.activeRecord;
    if(e.target.value === ''){
      activeRecord.orderChange = null;
    } else {
      activeRecord.orderChange = Number(e.target.value);
    }
    this.setState({activeRecord}, this.saveActiveRecord);
  }

  closeMenu(){
    this.setState({menuIsVisible:false});
  }

  toggleConsultation(){
    let activeRecord = this.state.activeRecord;
    activeRecord.wasConsultation = !activeRecord.wasConsultation;
    this.setState({activeRecord}, this.saveActiveRecord);
  }

  completeProcedure(){
    let proceduresArr = this.createProcedureObject();
    if(this.procedureVerified(proceduresArr)){
      let updatedRecord = this.state.activeRecord;
      updatedRecord.proceduresDone = this.addCustomValuesToProceduresArr(proceduresArr);
      this.setState({activeRecord:updatedRecord}, ()=>{
        this.saveActiveRecord();
        this.setState({activePage:'date'});
      });
    }
    this.refreshUserSession();
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
    this.refreshUserSession();
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

  changeCustomInput(e, fieldName){
    this.setState({[fieldName]:e.target.value});
    this.refreshUserSession();
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
              let queriedCalls = this.state.queriedCalls;
              for(var i = queriedCalls.length -1; i >= 0 ; i--){
                if(queriedCalls[i]._id === this.state.activeRecord._id){
                  queriedCalls.splice(i, 1);
                }
              }
              this.setState({
                activePage:'date',
                activeRecord:null
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
          this.setState({activePage:'date', activeRecord:null});
        }
      }
    }
    this.refreshUserSession();
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
    this.refreshUserSession();
  }

  addUser(){
    if(this.userIsValidated()){
      this.setState({isLoading:true});
      axios.post('/add-user', {
        fullname:this.state.addFullName,
        username:this.state.addUserName.toLowerCase(),
        password:this.state.addPassword.toLowerCase(),
        role:this.state.addAdminAccess ? 'admin' : 'user'
      })
      .then((resp)=>{
        if(resp.data.error || resp.data._message){
          console.log(resp.data);
        } else {
          let users = this.state.allUsers;
          users.push(resp.data);
          this.setState({
            addFullName:'',
            addUserName:'',
            addPassword:'',
            addAdminAccess:false,
            allUsers:users
          });
        }
      })
      .catch((err)=>{
        console.log(err);
      })
      .finally(()=>{
        this.setState({isLoading:false});
      })
    }
  }

  toggleMainMenu(){
    this.setState({
      menuIsVisible:!this.state.menuIsVisible
    });
  }

  userIsValidated(){
    let errors = '';

    if(this.state.addUserName.length < 5){
      errors += '- Username must be at least 5 characters long\n';
    }
    if(this.state.addPassword.length < 4){
      errors += '- Password must be at least 4 characters long\n';
    }
    if(this.state.addFullName.length < 5){
      errors += '- Full Name must be at least 5 characters long\n';
    }

    if(errors.length){
      this.setState({
        modalIsOpen:true, 
        modalTitle:'Add User Validation Failed',
        modalMessage:errors
      });
      return false;
    }
    return true;
  }

  deleteUser(id){
    this.setState({isLoading:true});
    axios.post('/delete-user', {_id:id})
    .then((resp)=>{
      console.log('user deleted');
      if(resp.data.error || resp.data._message){
        console.log(resp.data)
      } else {
        this.getAllUsers();
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  togglePassword(e, shouldShow){
    e.target.style.display = 'none';
    if(shouldShow){
      e.target.nextSibling.style.display = 'block'
    } else {
      e.target.previousSibling.style.display = 'block'
    }
  }

  sortColumn(field){
    let users = this.state.allUsers;
    users.sort((a, b) => {
      return a[field] > b[field] ? 1 : -1;
    });
    this.setState({allUsers:users});
  }

  logout(){
    clearInterval(this.sessionInterval);
    this.setState({currentUser:null}, this.resetState);
    ls.clear();
  }

  getDateFromObjectId(objId){
    return new Date(parseInt(objId.substring(0, 8), 16) * 1000);
  }

  startDateChange(date){
    this.setState({
      startDate: date
    });
  }
  
  endDateChange(date){
    this.setState({
      endDate: date
    });
  }

  submitDateRange(){
    this.setState({isLoading:true});
    axios.post('/get-calls-date-range', {
      startDate:moment(this.state.startDate).startOf('day').toISOString(),
      endDate:moment(this.state.endDate).endOf('day').toISOString()
    })
    .then(resp=>{
      this.setState({queriedCalls:resp.data});
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  seedSuper(){
    this.setState({isLoading:true});
    axios.get('/seed-super')
    .then(resp=>{
      console.log(resp.data);
    })
    .catch(err=>{
      console.log(err)
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
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

  filterDropdown(e, whichDropdown){
    if(whichDropdown === 1){
      if(e.target.value !== 'default'){
        let filterArr = [];
        if(e.target.value === 'completedBy'){
          filterArr = this.state.allUsers;
        }
        if(e.target.value === 'procedureId'){
          filterArr = this.state.allProcedures;
        }
        if(e.target.value === 'hospital'){
          filterArr = this.state.allOptions[0].options;
        }
        this.setState({
          firstFilterValue:e.target.value,
          secondFilterValue:'',
          secondDropdownArr:filterArr,
          sortBy:'default'
        });
      } else {
        this.resetFilters();
      }
    }
    if(whichDropdown === 2){
      if(e.target.value !== 'default'){
        this.setState({secondFilterValue:Number(e.target.value)});
      } else {
        this.setState({
          secondFilterValue:''
        });
      }
    }
  }

  resetFilters(){
    this.setState({
      firstFilterValue:'',
      secondFilterValue:'',
      secondDropdownArr:''
    });
  }

  getOpenCalls(){
    this.setState({isLoading:true});
    axios.post('/get-open-calls-in-range', {
      startDate:moment(this.state.startDate).startOf('day').toISOString(),
      endDate:moment(this.state.endDate).endOf('day').toISOString()
    })
    .then(resp=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({queriedCalls:resp.data});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  getOrderChanges(){
    this.setState({isLoading:true});
    axios.post('/get-order-changes-in-range', {
      startDate:moment(this.state.startDate).startOf('day').toISOString(),
      endDate:moment(this.state.endDate).endOf('day').toISOString()
    })
    .then(resp=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({queriedCalls:resp.data});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  queryCallsByProcedure(){
    this.setState({isLoading:true});
    axios.post('/calls-by-procedure-id', {
      procedureId:Number(this.state.secondFilterValue),
      dateQuery:{
        startDate:moment(this.state.startDate).startOf('day').toISOString(),
        endDate:moment(this.state.endDate).endOf('day').toISOString()
      }
    })
    .then(resp=>{
      if(resp.data.error || resp.data._message){
        this.setState({queriedCalls:[]});
      } else {
        this.setState({queriedCalls:resp.data});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  queryCallsByString(){
    this.setState({isLoading:true});
    axios.post('/calls-containing-value', {
      query:{
        key:this.state.firstFilterValue,
        value:this.state.secondFilterValue
      },
      dateQuery:{
        startDate:moment(this.state.startDate).startOf('day').toISOString(),
        endDate:moment(this.state.endDate).endOf('day').toISOString()
      }
    })
    .then(resp=>{
      if(resp.data.error || resp.data._message){
        this.setState({queriedCalls:[]});
      } else {
        this.setState({queriedCalls:resp.data});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  queryCalls(){
    let query = {
      query: {
        key:this.state.firstFilterValue,
        value:this.state.secondFilterValue
      },
      dateQuery:{
        startDate:moment(this.state.startDate).startOf('day').toISOString(),
        endDate:moment(this.state.endDate).endOf('day').toISOString()
      }
    }
    //modify query based on selection
    if(this.state.firstFilterValue === 'completedBy' || this.state.firstFilterValue === 'mrn'){
      query.query.value = Number(query.query.value);
    }

    if(this.state.firstFilterValue === 'procedureId'){
      return this.queryCallsByProcedure();
    }

    if(this.state.firstFilterValue === 'provider' || this.state.firstFilterValue === 'room'){
      return this.queryCallsByString();
    }

    this.setState({isLoading:true});
    axios.post('/calls-by-single-criteria', query)
    .then(resp=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        this.setState({queriedCalls:[]});
      } else {
        this.setState({queriedCalls:resp.data});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  sortQuery(){
    this.setState({isLoading:true});
    axios.post('/sort-by-field', {[this.state.firstFilterValue]:1})
    .then(resp=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        this.setState({queriedCalls:[]});
      } else {
        this.setState({queriedCalls:resp.data});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  toggleSort(){
    let sortArr = this.state.queriedCalls;
    sortArr.reverse();
    this.setState({queriedCalls:sortArr});
  }

  customInputKeyUp(e){
    if(e.which === 13){//Enter
      if(this.state.secondFilterValue.length){
        document.querySelector('.vas-admin-search-submit').click();
      }
    }
  }

  sortByOnChange(e){
    if(e.target.value !== 'default'){
      let sortArr = this.state.queriedCalls;
      sortArr.sort((a,b)=>{
        if(a[e.target.value] < b[e.target.value]) return -1;
        if(a[e.target.value] > b[e.target.value]) return 1;
        return 0;
      })
      this.setState({queriedCalls:sortArr});
    }
  }

  addInputChange(fieldName, e){
    this.setState({[fieldName]:e.target.value});
  }

  addHospital(){
    this.setState({isLoading:true});
    axios.post('/add-hospital', {
      hospitalName:this.state.addHospitalName
    })
    .then(resp=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        let options = this.state.allOptions;
        options[0] = resp.data;
        this.setState({allOptions:options, addHospitalName:''});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  addOrderChange(){
    this.setState({isLoading:true});
    axios.post('/add-order-change', {
      orderChangeName:this.state.addOrderChangeName
    })
    .then(resp=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        let options = this.state.allOptions;
        options[3] = resp.data;
        this.setState({allOptions:options, addOrderChangeName:''});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  addNeed(){
    this.setState({isLoading:true});
    axios.post('/add-need-option', {
      addNeedName:this.state.addNeedName
    })
    .then(resp=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        let options = this.state.allOptions;
        options[5] = resp.data;
        this.setState({allOptions:options, addNeedName:''});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  editCompletedCall(completedCall){
    let isAdmin = this.state.currentUser.role === 'admin' || this.state.currentUser.role === 'super';
    if(isAdmin || this.state.currentUser.userId === completedCall.completedBy){
      console.log(completedCall);
      this.setState({
        activeRecord:completedCall,
        activePage:'active'
      }, ()=>{
        window.scrollTo(0,0);
        this.setRecordStateItems();
      });
    }
  }

  closeModal(){
    this.setState({
      modalIsOpen:false,
      modalMessage:'',
      modalTitle:'',
      modalConfirmation:false,
      confirmationType:null
    });
  }

  render(){
    let isAdmin = false;
    if(this.state.currentUser){
      isAdmin = (this.state.currentUser.role === 'admin' || this.state.currentUser.role === 'super') ? true : false;
    }
    let isSortable = this.state.firstFilterValue === 'responseTime' || this.state.firstFilterValue === 'procedureTime';
    let isCustomSearch = this.state.firstFilterValue === 'mrn' || this.state.firstFilterValue === 'provider' || this.state.firstFilterValue === 'room';
    return(
      <div className='vas-admin-container'>
        {!isAdmin &&
          <Login loginType={'admin'} loginCallback={this.loginCallback} />
        }
        {this.state.currentUser && isAdmin &&
          <div className='vas-admin-main-container'>
            <header className='vas-main-header'>
              <div className='vas-header-left-container'>
                <h2 className='vas-admin-main-title'>VAS Admin</h2>
                <p className='vas-admin-menu-toggle' onClick={this.toggleMainMenu}>Menu &#9660;</p>
                <ul className={'vas-admin-menu ' + (this.state.menuIsVisible ? 'vas-admin-menu-visible' : '')} onClick={this.closeMenu}>
                  <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'date' ? true : false} onClick={e=>{this.setState({activePage:'date'})}}>Query Database</li>
                  {this.state.activeRecord &&
                    <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'active' ? true : false} onClick={e=>{this.setState({activePage:'active'})}}>Active</li>
                  }
                  <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'users' ? true : false} onClick={e=>{this.setState({activePage:'users'})}}>Users</li>
                  <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'options' ? true : false} onClick={e=>{this.setState({activePage:'options'})}}>Options</li>
                  {this.state.currentUser.role === 'super' &&
                    <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'super' ? true : false} onClick={e=>{this.setState({activePage:'super'})}}>Super</li>
                  }
                </ul>
                {this.state.menuIsVisible &&
                  <div className='vas-menu-clickguard' onClick={this.closeMenu}></div>
                }
              </div>
              <div className='vas-header-right-container'>
                <p className='vas-admin-username'>{this.state.currentUser.fullname}</p>
                <p className='vas-admin-logout' onClick={this.logout}>Logout</p>
              </div>
            </header>
            <div className='vas-admin-main-content'>
              <div className='vas-admin-page-container vas-admin-date-container' data-isactive={this.state.activePage === 'date' ? true : false}>
                <div className='vas-admin-filters-container'>
                  <div className='vas-admin-date-range-inner'>
                    <p className='vas-damin-date-label'>From:</p>
                    <DatePicker className='vas-admin-datepicker' selected={this.state.startDate} onChange={this.startDateChange} />
                  </div>  
                  <div className='vas-admin-date-range-inner'>
                    <p className='vas-damin-date-label'>To:</p>
                    <DatePicker className='vas-admin-datepicker' selected={this.state.endDate} onChange={this.endDateChange} />
                  </div>
                  <div className='vas-admin-filter-container'>
                    <p>Filters:</p>
                    <select className='vas-select vas-admin-query-dropdown-1' value={this.state.firstFilterValue} onChange={e=>{this.filterDropdown(e, 1)}}>
                      <option value="default">No Filter</option>
                      <option value="completedBy">Nurse</option>
                      <option value="hospital">Hospital</option>
                      <option value="mrn">MRN</option>
                      <option value='provider'>Provider</option>
                      <option value='room'>Room</option>
                      <option value='procedureId'>Procedure</option>
                      <option value='orderChange'>Order Change</option>
                      <option value='responseTime'>Response Time</option>
                      <option value='procedureTime'>Procedure Time</option>
                      {/* <option value='openBy'>Open Calls</option> */}
                    </select>
                  </div>
                  {this.state.firstFilterValue === 'openBy' &&
                    <button className='vas-admin-search-submit' onClick={e=>{this.getOpenCalls()}}>Submit</button>
                  }
                  {this.state.firstFilterValue === 'completedBy' &&
                    <div className='vas-admin-filter-container'>
                      <p>Nurse Name:</p>
                      <select className='vas-select vas-admin-query-dropdown-2' value={this.state.secondFilterValue} onChange={e=>{this.filterDropdown(e, 2)}}>
                        <option value='default'>Select User</option>
                        {this.state.secondDropdownArr.map((user, idx)=>{
                          return <option className='vas-capitalize' key={user._id} value={user.userId}>{user.fullname}</option>
                        })}
                      </select>
                    </div>
                  }
                  {this.state.firstFilterValue === 'hospital' &&
                    <div className='vas-admin-filter-container'>
                      <p>Name:</p>
                      <select className='vas-select vas-admin-query-dropdown-2' value={this.state.secondFilterValue} onChange={e=>{this.filterDropdown(e, 2)}}>
                        <option value='default'>Select Hospital</option>
                        {this.state.secondDropdownArr.map((hospital, idx)=>{
                          return <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                        })}
                      </select>
                    </div>
                  }
                  {this.state.firstFilterValue === 'orderChange' &&
                    <button className='vas-admin-search-submit' onClick={e=>{this.getOrderChanges()}}>Submit</button>
                  }
                  {isCustomSearch &&
                    <div className='vas-admin-filter-container'>
                      <p>Search:</p>
                      <input type='text' value={this.state.secondFilterValue} onKeyUp={e=>{this.customInputKeyUp(e)}} onChange={e=>{this.setState({secondFilterValue:e.target.value})}}/>
                    </div>
                  }
                  {this.state.firstFilterValue === 'procedureId' &&
                    <div className='vas-admin-filter-container'>
                      <p>Procedure:</p>
                      <select className='vas-select' value={this.state.secondFilterValue} onChange={e=>{this.filterDropdown(e, 2)}}>
                        <option value='default'>Select Procedure</option>
                        {this.state.secondDropdownArr.map((procedure, idx)=>{
                          return <option key={procedure.procedureId} value={procedure.procedureId}>{procedure.name}</option>
                        })
                        }
                      </select>
                    </div>
                  }
                  {isSortable &&
                    <button onClick={e=>{this.sortQuery()}}>Submit</button>
                  }
                  {this.state.secondFilterValue.length !== 0 &&
                    <button className='vas-admin-search-submit' onClick={e=>{this.queryCalls()}}>Submit</button>
                  }
                  {!this.state.firstFilterValue &&
                    <button className='vas-admin-date-range-submit d-inline' onClick={this.submitDateRange}>Submit</button>
                  }
                </div>
                <ReturnedProcedures 
                  queriedProcedures={this.state.queriedCalls}
                  hospitalsById={this.state.hospitalsById}
                  usersById={this.state.usersById}
                  referenceObj={this.state.referenceObj}
                  itemsById={this.state.itemsById}
                  getDateFromObjectId={this.getDateFromObjectId}
                  editCompletedCall={this.editCompletedCall} 
                  orderChangeById={this.state.orderChangeById}/>
              </div>
              <div className='vas-admin-page-container vas-admin-active-container' data-isactive={this.state.activePage === 'active' ? true : false}>
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
              <div className='vas-admin-page-container vas-admin-users-container' data-isactive={this.state.activePage === 'users' ? true : false}>
                <div className='vas-admin-add-user-container'>
                  <h3 className="vas-admin-h3">Add User</h3>
                  <label>User's Full Name:</label>
                  <input type='text' placeholder="example: Brett Connolly" value={this.state.addFullName} onChange={e=>{this.setState({addFullName:e.target.value})}} />
                  <label>Username:</label>
                  <input type='text' placeholder="example: kitty453" value={this.state.addUserName} onChange={e=>{this.setState({addUserName:e.target.value})}}/>
                  <label>Password or PIN</label>
                  <input type='text' placeholder="example: hello123 or 1542" value={this.state.addPassword} onChange={e=>{this.setState({addPassword:e.target.value})}}/>
                  <label>Allow admin access?</label>
                  <select className='vas-admin-allow-admin-access-dropdown' value={this.state.addAdminAccess} onChange={e=>{this.setState({addAdminAccess:Boolean(e.target.value)})}}>
                    <option value='false'>No</option>
                    <option value='true'>Yes</option>
                  </select>
                  <p className='vas-admin-add-user-notes'>User ID will automatically be created once new user is added (auto-incrementing)</p>
                  <button className='vas-admin-create-user' onClick={this.addUser}>Add User</button>
                </div>
                <div className='vas-admin-remove-user-container'>
                  <h3 className="vas-admin-h3">Modify Users</h3>
                  <p className='vas-admin-add-user-notes'>Click on table header to sort by field</p>
                  <table className='vas-admin-table'>
                    <tbody>
                      <tr>
                        <th onClick={e=>{this.sortColumn('userId')}}>userId</th>
                        <th onClick={e=>{this.sortColumn('fullname')}}>fullname</th>
                        <th onClick={e=>{this.sortColumn('username')}}>username</th>
                        <th onClick={e=>{this.sortColumn('password')}}>password/pin</th>
                        <th onClick={e=>{this.sortColumn('role')}}>role</th>
                        <th className='vas-admin-delete-user'>Delete?</th>
                      </tr>
                      {this.state.allUsers.map((user, idx)=>{
                        return(
                          <tr key={user._id}>
                            <td>{user.userId}</td>
                            <td className='vas-capitalize'>{user.fullname}</td>
                            <td>{user.username}</td>
                            <td>
                              {user.role !== 'admin' &&
                                <span className='vas-admin-manage-users-pw'>
                                  <p onClick={e=>{this.togglePassword(e, true)}}>********</p>
                                  <p style={{'display':'none'}} onClick={e=>{this.togglePassword(e, false)}}>{user.password}</p>
                                </span>
                              }
                            </td>
                            <td>{user.role}</td>
                            <td className='vas-admin-delete-user'>
                              {user.role !== 'admin' &&
                                <p data-id={user._id} data-index={idx} onClick={e=>{this.deleteUser(user._id)}}>&times;</p>
                              }
                            </td>
                          </tr>
                        )
                      })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='vas-admin-page-container vas-admin-options-container' data-isactive={this.state.activePage === 'options' ? true : false}>
                <h3 className="vas-admin-h3">Modify Options</h3>
                <div className='vas-admin-options-hospitals-container'>
                  <h4>Manage Hospital Names</h4>
                  <div className='vas-block-container'>
                    <input className='vas-block-input' type="text" value={this.state.addHospitalName} onChange={e=>{this.addInputChange('addHospitalName',e)}} />
                    <button className='vas-block-button' onClick={this.addHospital}>Add Hospital</button>
                  </div>
                  <table className='vas-admin-list-table'>
                    <tbody>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                      </tr>
                      {this.state.allOptions && this.state.allOptions[0] &&
                        this.state.allOptions[0].options.map((option, idx)=>{
                        return(
                          <tr key={option.id}>
                            <td>{option.id}</td>
                            <td>{option.name}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <hr></hr>
                <div className='vas-admin-options-order-change-container'>
                  <h4>Manage Order Change Options</h4>
                  <div className='vas-admin-order-change-input-container vas-block-container'>
                    <input className='vas-block-input' type="text" value={this.state.addOrderChangeName} onChange={e=>{this.addInputChange('addOrderChangeName',e)}} />
                    <button className='vas-admin-order-change-input-submit vas-block-button' onClick={this.addOrderChange}>Add Order Change</button>
                  </div>
                  <table className='vas-admin-list-table'>
                    <tbody>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                      </tr>
                      {this.state.allOptions && this.state.allOptions[3] &&
                        this.state.allOptions[3].options.map((option, idx)=>{
                        return(
                          <tr key={option.id}>
                            <td>{option.id}</td>
                            <td>{option.name}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <hr></hr>
                <div className='vas-admin-options-order-change-container'>
                  <h4>Manage Add Call 'Need' Options</h4>
                  <div className='vas-admin-order-change-input-container vas-block-container'>
                    <input className='vas-block-input' type="text" value={this.state.addNeedName} onChange={e=>{this.addInputChange('addNeedName', e)}} />
                    <button className='vas-admin-order-change-input-submit vas-block-button' onClick={this.addNeed}>Add Need Option</button>
                  </div>
                  <table className='vas-admin-list-table'>
                    <tbody>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                      </tr>
                      {this.state.allOptions && this.state.allOptions[5] && this.state.allOptions[5].options.map((option, idx)=>{
                        return(
                          <tr key={option.id}>
                            <td>{option.id}</td>
                            <td>{option.name}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {this.state.currentUser.role === 'super' &&
                <div className='vas-admin-page-container vas-admin-super-container' data-isactive={this.state.activePage === 'super' ? true : false}>
                  <h3 className="vas-admin-h3">Super Page</h3>
                  <button onClick={this.seedProcedures}>Seed Procedures</button>
                  <button onClick={this.seedOptions}>Seed Options</button>
                  <button onClick={this.seedItems}>Seed Items</button>
                </div>
              }
            </div>
          </div>
        }
        {this.state.isLoading && 
          <div className='vas-loading-container'>
            <img className='vas-loading-img' src={loadingGif} alt='loading'/>
            <p className='vas-loading-text'>Loading...</p>
          </div>
        }
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
    )
  }
}