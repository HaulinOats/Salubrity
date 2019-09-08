import React, {Component} from 'react';
import Login from '../Widgets/Login/Login';
import Modal from '../Widgets/Modal/Modal';
import EditProcedure from '../Widgets/EditProcedure/EditProcedure';
import helpers from '../helpers';
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
      procedures:[],
      allItems:[],
      allUsers:[],
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
      menuIsVisible:false
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
    this.addHospital = this.addHospital.bind(this);
    this.addOrderChange = this.addOrderChange.bind(this);
    this.addNeed = this.addNeed.bind(this);
    this.addInputChange = this.addInputChange.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.refreshUserSession = this.refreshUserSession.bind(this);
    this.toggleMainMenu = this.toggleMainMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.editCompletedCall = this.editCompletedCall.bind(this);
    this.closeRecordCallback = this.closeRecordCallback.bind(this);
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

  closeRecordCallback(type){
    let queriedCalls = this.state.queriedCalls;
    switch(type){
      case 'delete':
        for(var i = queriedCalls.length -1; i >= 0 ; i--){
          if(queriedCalls[i]._id === this.state.activeRecord._id){
            queriedCalls.splice(i, 1);
            break;
          }
        }
        break;
      default:
        for(var j = 0; j < queriedCalls.length;j++){
          if(queriedCalls[j]._id === this.state.activeRecord._id){
            queriedCalls[j] = this.state.activeRecord;
            break;
          }
        }
        break;
    }
    this.setState({
      activePage:'date',
      activeRecord:null,
      queriedCalls
    })
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
    helpers.getProcedureData().then(data=>{
      this.setState({
        procedures:data.procedures,
        referenceObj:data.referenceObj
      })
    }).catch(err=>{
      this.addToErrorArray(err);
    })
    
    helpers.getOptionsData().then(data=>{
      this.setState({
        allOptions:data.options,
        hospitalsById:data.hospitals,
        orderChangeById:data.orders,
        statusById:data.statuses
      })
    }).catch(err=>{
      this.addToErrorArray()
    })
    
    helpers.getItemsData().then(data=>{
      this.setState({itemsById:data});
    }).catch(err=>{
      console.log(err);
    })

    this.getAllUsers();
  }
  
  getAllUsers(){
    helpers.getAllUsers().then(data=>{
      this.setState({
        allUsers:data.usersArr,
        usersById:data.usersById
      })
    }).catch(err=>{
      console.log(err);
    });
  }

  seedProcedures(){
    this.setState({isLoading:true});
    axios.get('/seed-procedures').then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({allProcedures:resp.data});
      }
    }).catch((err)=>{
      console.log(err);
    }).finally(()=>{
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

  closeMenu(){
    this.setState({menuIsVisible:false});
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
    }).then(resp=>{
      let calls = resp.data;
      //add nurse name to call for sorting
      for(let i = 0; i < calls.length; i++){
        if(calls[i].completedBy !== null){
          calls[i].completedByName = this.state.usersById[calls[i].completedBy].fullname;
        } else {
          calls[i].completedByName = null;
        }
        //add hospital name to call for sorting
        if(calls[i].hospital !== null){
          calls[i].hospitalName = this.state.hospitalsById[calls[i].hospital].name;
        } else {
          calls[i].hospitalName = null;
        }
      }
      this.setState({queriedCalls:calls});
    }).catch(err=>{
      console.log(err);
    }).finally(()=>{
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
          secondDropdownArr:filterArr
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
        alert(resp.data);
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
        alert(resp.data);
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
        alert(resp.data);
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
        alert(resp.data)
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

  customInputKeyUp(e){
    if(e.which === 13){//Enter
      if(this.state.secondFilterValue.length){
        document.querySelector('.vas-admin-search-submit').click();
      }
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
      this.setState({
        activeRecord:completedCall,
        activePage:'active'
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
                {this.state.queriedCalls.length > 0 &&
                <ReturnedProcedures 
                  queriedProcedures={this.state.queriedCalls}
                  hospitalsById={this.state.hospitalsById}
                  usersById={this.state.usersById}
                  referenceObj={this.state.referenceObj}
                  itemsById={this.state.itemsById}
                  editCompletedCall={this.editCompletedCall} 
                  orderChangeById={this.state.orderChangeById}/>
                }
              </div>
              <div className='vas-admin-page-container vas-admin-active-container' data-isactive={this.state.activePage === 'active' ? true : false}>
                {this.state.activeRecord && this.state.procedures && this.state.referenceObj && this.state.itemsById && this.state.allOptions.length > 0 &&
                  <EditProcedure 
                    activeRecord={this.state.activeRecord}
                    allOptions={this.state.allOptions}
                    procedures={this.state.procedures}
                    usersById={this.state.usersById}
                    itemsById={this.state.itemsById}
                    referenceObj={this.state.referenceObj}
                    refreshUserSession={this.refreshUserSession}
                    closeRecordCallback={this.closeRecordCallback}
                    currentUser={this.state.currentUser}/>
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
            closeModal={this.closeModal}
            modalTitle={this.state.modalTitle} 
            modalMessage={this.state.modalMessage}
            toggleModal={this.toggleHandler}/>
        }
      </div>
    )
  }
}