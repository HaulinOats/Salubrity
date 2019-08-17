import React, {Component} from 'react';
import Login from '../Widgets/Login/Login';
import './Admin.css';
import axios from 'axios';
import moment from 'moment';
import Moment from 'react-moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import loadingGif from '../../public/loading.gif';

export default class Admin extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentUser:null,
      startDate:moment(),
      endDate:moment(),
      isLoading:false,
      activePage:'date',
      addFullName:'',
      addUserName:'',
      addPassword:'',
      addAdminAccess:false,
      addValidationErrors:[],
      userDataByUserId:{},
      allUsers:[],
      allProcedures:[],
      allItems:[],
      hospitalsById:{},
      itemsById:{},
      proceduresById:{},
      allOptions:[],
      queriedCalls:[],
      firstFilterValue:'',
      secondFilterValue:'',
      secondDropdownArr:[],
      addHospitalName:''
    }
    this.submitDateRange = this.submitDateRange.bind(this);
    this.seedProcedures = this.seedProcedures.bind(this);
    this.seedOptions = this.seedOptions.bind(this);
    this.seedItems = this.seedItems.bind(this);
    this.handleWindowBeforeUnload = this.handleWindowBeforeUnload.bind(this);
    this.addUser = this.addUser.bind(this);
    this.logout = this.logout.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
    this.startDateChange = this.startDateChange.bind(this);
    this.endDateChange = this.endDateChange.bind(this);
    this.sortByOnChange = this.sortByOnChange.bind(this);
    this.hospitalInputChange = this.hospitalInputChange.bind(this);
    this.addHospital = this.addHospital.bind(this);
  }

  componentWillMount(){
    const storagecurrentUser = localStorage.getItem('currentUser');
    if(this.isValidStorageItem(storagecurrentUser)){
      this.setState({currentUser:JSON.parse(storagecurrentUser)}, this.handleUserSessionData);
    } else {
      this.handleUserSessionData();
    }
  }

  isValidStorageItem(storageItem){
    return storageItem !== 'undefined' && storageItem !== undefined && storageItem !== null && storageItem !== 'null'
  }

  loginCallback(user){
    let currentUser = user;
    currentUser.lastLogin = Math.floor(Date.now() / 1000);
    this.setState({currentUser:user}, this.stateLoadCalls);
  }

  handleUserSessionData(){
    if(this.state.currentUser){
      //Allow user session access for 30 minutes (1800 seconds)
      //if it's been more than 30 minutes since last login, logout user
      if(Math.floor(Date.now() / 1000) - this.state.currentUser.lastLogin > 1800){
        this.logout();
      } else {
        //if user has refreshed at any point and it's been less than 30 minutes, refresh session
        let currentUser = {...this.state.currentUser}
        currentUser.lastLogin = Math.floor(Date.now() / 1000);
        this.setState({currentUser}, ()=>{
          console.log(currentUser);
          this.stateLoadCalls();
        });
      }
    }
  }

  stateLoadCalls(){
    this.setState({isLoading:true});
    this.getAllUsers();
    axios.get('/get-procedures')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        let procedureNamesObj = {};
        for(let i = 0; i < resp.data.length; i++){
          procedureNamesObj[resp.data[i].procedureId] = resp.data[i];
        }
        this.setState({
          allProcedures:resp.data,
          proceduresById:procedureNamesObj
        });
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })

    axios.get('/get-options')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        let hospitals = {};
        resp.data[0].options.forEach(hospital=>{
          hospitals[hospital.id] = hospital;
        })
        this.setState({
          allOptions:resp.data,
          hospitalsById:hospitals
        });
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })

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
          allItems:resp.data,
          itemsById:items
        });
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })

    setTimeout(()=>{
      console.log(this.state);
    }, 100);
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.handleWindowBeforeUnload);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleWindowBeforeUnload);
  }

  handleWindowBeforeUnload(){
    localStorage.setItem('currentUser', JSON.stringify(this.state.currentUser));
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
        userDataByUserId:usersObj
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

  addUser(){
    let validationErrors = []
    if(this.state.addPassword.length < 4){
      validationErrors.push('Password or PIN must be atleast 4 characters');
    }
    if(!validationErrors.length){
      this.setState({addValidationErrors:[]});
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
    } else {
      this.setState({addValidationErrors:validationErrors});
    }
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
    this.setState({currentUser:null});
    localStorage.clear();
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
      console.log(resp.data);
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

  filterDropdown(e, whichDropdown){
    document.querySelector('.vas-admin-custom-table-header-sortby').selectedIndex = 0;
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
        console.log(resp.data);
        this.setState({queriedCalls:resp.data}, this.resetFilters);
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

  queryCalls(){
    document.querySelector('.vas-admin-custom-table-header-sortby').selectedIndex = 0;
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

    if(this.state.firstFilterValue === 'provider'){
      return this.queryCallsByString();
    }

    console.log(query);
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

  hospitalInputChange(e){
    this.setState({addHospitalName:e.target.value});
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
        this.setState({allOptions:options});
      }
    })
    .catch(err=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
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
            <header>
              <h2>VAS Tracker Admin Panel</h2>
              <ul className='vas-admin-menu'>
                <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'date' ? true : false} onClick={e=>{this.setState({activePage:'date'})}}>Query Database</li>
                <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'users' ? true : false} onClick={e=>{this.setState({activePage:'users'})}}>Users</li>
                <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'options' ? true : false} onClick={e=>{this.setState({activePage:'options'})}}>Options</li>
                {this.state.currentUser.role === 'super' &&
                  <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'super' ? true : false} onClick={e=>{this.setState({activePage:'super'})}}>Super</li>
                }
              </ul>
              <p className='vas-admin-username'>{this.state.currentUser.fullname}</p>
              <p className='vas-admin-logout' onClick={this.logout}>Logout</p>
            </header>
            <div className='vas-admin-main-content'>
              <div className='vas-admin-page-container vas-admin-date-container' data-isactive={this.state.activePage === 'date' ? true : false}>
                <div className='vas-admin-date-range-container'>
                  <div className='vas-admin-date-range-inner'>
                    <p className='vas-damin-date-label'>From:</p>
                    <DatePicker selected={this.state.startDate} onChange={this.startDateChange} />
                  </div>  
                  <div className='vas-admin-date-range-inner'>
                    <p className='vas-damin-date-label'>To:</p>
                    <DatePicker selected={this.state.endDate} onChange={this.endDateChange} />
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
                      <option value='responseTime'>Response Time</option>
                      <option value='procedureTime'>Procedure Time</option>
                      <option value='isOpen'>Open Calls</option>
                    </select>
                  </div>
                  {this.state.firstFilterValue === 'isOpen' &&
                    <button className='vas-admin-search-submit' onClick={e=>{this.getOpenCalls()}}>Submit</button>
                  }
                  {this.state.firstFilterValue === 'completedBy' &&
                    <div className='vas-admin-filter-container'>
                      <p>Nurse Name:</p>
                      <select className='vas-select vas-admin-query-dropdown-2' value={this.state.secondFilterValue} onChange={e=>{this.filterDropdown(e, 2)}}>
                        <option value='default'>Select User</option>
                        {this.state.secondDropdownArr.map((user, idx)=>{
                          return <option key={user._id} value={user.userId}>{user.fullname}</option>
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
                <div className='vas-admin-date-query-container'>
                  <div className='vas-admin-custom-table'>
                    <div className='vas-admin-custom-table-body'>
                      <div className='vas-admin-custom-table-header'>
                        <p className='d-inline'>Sort By:</p>
                        <select className='vas-select vas-admin-custom-table-header-sortby' onChange={this.sortByOnChange}>
                          <option value='default'>Select A Field</option>
                          <option value='userId'>User</option>
                          <option value='hospital'>Hospital</option>
                          <option value='mrn'>MRN</option>
                          <option value='provider'>Provider</option>
                          <option value='responseTime'>Response Time</option>
                          <option value='procedureTime'>Procedure Time</option>
                        </select>
                        <button className='vas-admin-reverse-sort-btn float-right' onClick={e=>{this.toggleSort()}}>Reverse Sort</button>
                      </div>
                      {!this.state.queriedCalls.length &&
                        <div className='vas-admin-no-calls-container'>
                          <p>No calls returned with that query</p>
                        </div>
                      }
                      {this.state.queriedCalls.map((call)=>{
                        let isComments = call.jobComments || call.addComments;
                        let isHospital = call.hospital;
                        let responseTimeHr = Math.floor(call.responseTime/3600000) % 24;
                        let responseTimeMin = Math.floor(call.responseTime/60000) % 60;
                        let procedureTimeHr = Math.floor(call.procedureTime/3600000) % 24;
                        let procedureTimeMin = Math.floor(call.procedureTime/60000) % 60;
                        return(
                          <div key={call._id} className='vas-admin-custom-table-item-outer'>
                            {!call.isOpen &&
                              <div className='vas-admin-custom-table-item'>
                                <div className='vas-admin-custom-table-item-column vas-admin-custom-table-item-column-1'>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-date'><Moment format='MM/DD/YYYY'>{call.completedAt}</Moment></div>
                                </div>
                                <div className='vas-admin-custom-table-item-column vas-admin-custom-table-item-column-2'>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-nurse'>
                                    <p className='vas-admin-custom-item-subfield'>Nurse:</p>
                                    <p className='vas-admin-custom-item-subvalue'>{this.state.userDataByUserId[call.completedBy] ? this.state.userDataByUserId[call.completedBy].fullname : 'Default'}</p>
                                  </div>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-room'>
                                    <p className='vas-admin-custom-item-subfield'>Room:</p>
                                    <p className='vas-admin-custom-item-subvalue'>{call.room}</p>
                                  </div>
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
                                </div>
                                <div className='vas-admin-custom-table-item-column vas-admin-custom-table-item-column-3'>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-procedures'>
                                    {call.proceduresDone.map((procedure)=>{
                                      return (
                                        <div className='vas-admin-query-procedure-container' key={procedure.procedureId}>
                                          <p className='vas-admin-query-procedure-names'>{this.state.proceduresById[procedure.procedureId].name}</p>
                                          <div className='vas-admin-query-item-container'>
                                          {procedure.itemIds && procedure.itemIds.length &&
                                            procedure.itemIds.map((id)=>{
                                              let isCustom = this.state.itemsById[id].isCustom;
                                              return (
                                                <p key={id} className='vas-admin-query-item'>{!isCustom ? this.state.itemsById[id].value : this.state.itemsById[id].groupName + ":" + procedure.customValues[id]}</p>
                                              )
                                            })
                                          }
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-jobComment'></div>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-addComments'></div>
                                </div>
                                <div className='vas-admin-custom-table-item-column vas-admin-custom-table-item-column-4'>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-callTime'><p className='vas-admin-left-column'>Call Time:</p><p className='vas-admin-right-column'><Moment format='HH:mm'>{this.getDateFromObjectId(call._id)}</Moment></p></div>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-startTime'><p className='vas-admin-left-column'>Start Time:</p><p className='vas-admin-right-column'><Moment format='HH:mm'>{call.startTime}</Moment></p></div>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-endTime'><p className='vas-admin-left-column'>End Time:</p><p className='vas-admin-right-column'><Moment format='HH:mm'>{call.completedAt}</Moment></p></div>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-response'><p className='vas-admin-left-column'>Response Time:</p><p className='vas-admin-right-column'>{responseTimeHr > 0 ? responseTimeHr + ' Hr ' : ''}{responseTimeMin + ' Min'}</p></div>
                                  <div className='vas-admin-custom-table-td vas-admin-custom-table-response'><p className='vas-admin-left-column'>Procedure Time:</p><p className='vas-admin-right-column'>{procedureTimeHr > 0 ? procedureTimeHr + ' Hr ' : ''}{procedureTimeMin + ' Min'}</p></div>
                                </div>
                              </div>
                            }
                            {call.isOpen &&
                              <span className='w-100'>
                                <div className='vas-admin-is-open-container'>
                                  <div data-width='15'>
                                    <p><b>Opened:</b> <Moment format='HH:mm'>{call.startTime}</Moment></p>
                                  </div>
                                  <div data-width='25'>
                                    <p><b>Job:</b> {call.job}</p>
                                  </div>
                                  <div data-width='10'>
                                    <p><b>User:</b> {this.state.userDataByUserId[call.openBy] ? this.state.userDataByUserId[call.openBy].fullname : 'Admin'}</p>
                                  </div>
                                  <div >
                                    <p data-width='10'><b>Room:</b> {call.room}</p>
                                  </div>
                                  <div data-width='40'>
                                    <button className='vas-button'>Return To Queue</button>
                                    <button className='vas-button vas-red-button'>Delete Call</button>
                                  </div>
                                </div>
                              </span>
                            }
                            {isComments &&
                              <div className='vas-admin-custom-table-item-comments'>
                                {call.jobComments && 
                                  <p className='vas-admin-job-comments'><b>Job Comments:</b> {call.jobComments}</p>
                                }
                                {call.addComments &&
                                  <p className='vas-admin-add-comments'><b>Add'l Comments:</b> {call.addComments}</p>
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
              </div>
              <div className='vas-admin-page-container vas-admin-users-container' data-isactive={this.state.activePage === 'users' ? true : false}>
                <div className='vas-admin-add-user-container'>
                  <h3>Add User</h3>
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
                  <h3>Modify Users</h3>
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
                            <td className='text-capitalize'>{user.fullname}</td>
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
                <h3>Modify Options</h3>
                <div className='vas-admin-options-hospitals-container'>
                  <h4>Manage Hospital Names</h4>
                  <div className='vas-admin-hospital-input-container'>
                    <input className='d-block' type="text" value={this.state.addHospitalName} onChange={this.hospitalInputChange} />
                    <button className='vas-admin-hospital-input-submit' onClick={this.addHospital}>Add Hospital</button>
                  </div>
                  <table className='vas-admin-hospitals-list'>
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
              </div>
              {this.state.currentUser.role === 'super' &&
                <div className='vas-admin-page-container vas-admin-super-container' data-isactive={this.state.activePage === 'super' ? true : false}>
                  <h3>Super Page</h3>
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
      </div>
    )
  }
}