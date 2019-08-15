import React, {Component} from 'react';
import Login from '../Widgets/Login/Login';
import './Admin.css';
import axios from 'axios';
import moment from 'moment';
import Moment from 'react-moment';
import loadingGif from '../../public/loading.gif';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
        }, ()=>{
          console.log(this.state.allItems);
          console.log(this.state.itemsById);
        });
      }
    })
    .catch((err)=>{
      console.log(err);
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
  }

  seedProcedures(){
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
  }
  
  seedOptions(){
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
  }

  seedItems(){
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
  }

  addUser(){
    let validationErrors = []
    if(this.state.addPassword.length < 4){
      validationErrors.push('Password or PIN must be atleast 4 characters');
    }
    if(!validationErrors.length){
      this.setState({addValidationErrors:[]});
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
      }).catch((err)=>{
        console.log(err);
      })
    } else {
      this.setState({addValidationErrors:validationErrors});
    }
  }

  deleteUser(id){
    axios.post('/delete-user', {_id:id})
    .then((resp)=>{
      console.log('user deleted');
      if(resp.data.error || resp.data._message){
        console.log(resp.data)
      } else {
        this.getAllUsers();
      }
    }).catch((err)=>{
      console.log(err);
    })
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
  }

  seedSuper(){
    axios.get('/seed-super')
    .then(resp=>{
      console.log(resp.data);
    })
    .catch(err=>{
      console.log(err)
    })
  }

  filterDropdown(e, whichDropdown){
    if(whichDropdown === 1){
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
    }
    if(whichDropdown === 2){
      this.setState({secondFilterValue:Number(e.target.value)});
    }
  }

  queryCallsByProcedure(){
    console.log('here');
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

    console.log(query);
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
  }

  sortQuery(){
    axios.post('/sort-by-field', {'responseTime':1})
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
  }

  toggleSort(){
    let sortArr = this.state.queriedCalls;
    sortArr.reverse();
    this.setState({queriedCalls:sortArr});
  }

  render(){
    let isAdmin = false;
    if(this.state.currentUser){
      isAdmin = (this.state.currentUser.role === 'admin' || this.state.currentUser.role === 'super') ? true : false;
    }
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
                <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'users' ? true : false} onClick={e=>{this.setState({activePage:'users'})}}>Manage Users</li>
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
                    <select className='vas-admin-query-dropdown-1' value={this.state.firstFilterValue} onChange={e=>{this.filterDropdown(e, 1)}}>
                      <option value="">No Filter</option>
                      <option value="completedBy">Nurse</option>
                      <option value="hospital">Hospital</option>
                      <option value="mrn">MRN</option>
                      <option value='provider'>Provider</option>
                      <option value='procedureId'>Procedure</option>
                      <option value='responseTime'>Response Time</option>
                      <option value='procedureTime'>Procedure Time</option>
                    </select>
                  </div>
                  {this.state.firstFilterValue === 'completedBy' &&
                    <div className='vas-admin-filter-container'>
                      <p>Nurse Name:</p>
                      <select className='vas-admin-query-dropdown-2' value={this.state.secondFilterValue} onChange={e=>{this.filterDropdown(e, 2)}}>
                        <option value=''>Select User</option>
                        {this.state.secondDropdownArr.map((user, idx)=>{
                          return <option key={idx} value={user.userId}>{user.fullname}</option>
                        })}
                      </select>
                    </div>
                  }
                  {this.state.firstFilterValue === 'hospital' &&
                    <div className='vas-admin-filter-container'>
                      <p>Name:</p>
                      <select className='vas-admin-query-dropdown-2' value={this.state.secondFilterValue} onChange={e=>{this.filterDropdown(e, 2)}}>
                        <option value=''>Select Hospital</option>
                        {this.state.secondDropdownArr.map((hospital, idx)=>{
                          return <option key={idx} value={hospital.id}>{hospital.name}</option>
                        })}
                      </select>
                    </div>
                  }
                  {this.state.firstFilterValue === 'provider' &&
                    <div className='vas-admin-filter-container'>
                      <p>Provider Name:</p>
                      <input type='text' value={this.state.secondFilterValue} onChange={e=>{this.setState({secondFilterValue:e.target.value})}}/>
                    </div>
                  }
                  {this.state.firstFilterValue === 'mrn' &&
                    <div className='vas-admin-filter-container'>
                      <p>Medical Record Number:</p>
                      <input type='text' value={this.state.secondFilterValue} onChange={e=>{this.setState({secondFilterValue:e.target.value})}}/>
                    </div>
                  }
                  {this.state.firstFilterValue === 'procedureId' &&
                    <div className='vas-admin-filter-container'>
                      <p>Procedure:</p>
                      <select value={this.state.secondFilterValue} onChange={e=>{this.filterDropdown(e, 2)}}>
                        <option value=''>Select Procedure</option>
                        {this.state.secondDropdownArr.map((procedure, idx)=>{
                          return <option key={idx} value={procedure.procedureId}>{procedure.name}</option>
                        })
                        }
                      </select>
                    </div>
                  }
                  {this.state.firstFilterValue === 'responseTime' &&
                    <button onClick={e=>{this.sortQuery()}}>Submit</button>
                  }
                  {this.state.secondFilterValue.length !== 0 &&
                    <button onClick={e=>{this.queryCalls()}}>Submit</button>
                  }
                  {!this.state.firstFilterValue &&
                    <button className='vas-admin-date-range-submit d-inline' onClick={this.submitDateRange}>Submit</button>
                  }
                  <button className='d-inline' onClick={e=>{this.toggleSort()}}>Reverse Sort</button>
                </div>
                <div className='vas-admin-date-query-container'>
                  <div className='vas-admin-custom-table'>
                    <div className='vas-admin-custom-table-body'>
                      {this.state.queriedCalls.map((call, idx)=>{
                        let callTime = moment(this.getDateFromObjectId(call._id));
                        let responseTime = moment(call.startTime);
                        let responseHours = responseTime.diff(callTime, 'hours');
                        let responseMinutes = responseTime.diff(callTime, 'minutes') % 60;
                        let completionTime = moment(call.completedAt);
                        let completionHours = completionTime.diff(responseTime, 'hours');
                        let completionMinutes = completionTime.diff(responseTime, 'minutes');
                        return(
                          <div key={idx} className='vas-admin-custom-table-item'>
                            <div className='vas-admin-custom-table-item-column vas-admin-custom-table-item-column-1'>
                              <div className='vas-admin-custom-table-td vas-admin-custom-table-date'><Moment format='MM/DD/YYYY'>{call.completedAt}</Moment></div>
                            </div>
                            <div className='vas-admin-custom-table-item-column vas-admin-custom-table-item-column-2'>
                              <div className='vas-admin-custom-table-td vas-admin-custom-table-hospital'>
                                <p className='vas-admin-custom-item-subfield'>Hospital:</p>
                                <p className='vas-admin-custom-item-subvalue'>{this.state.hospitalsById[call.hospital].name}</p>
                              </div>
                              <div className='vas-admin-custom-table-td vas-admin-custom-table-nurse'>
                                <p className='vas-admin-custom-item-subfield'>Nurse:</p>
                                <p className='vas-admin-custom-item-subvalue'>{this.state.userDataByUserId[call.completedBy] ? this.state.userDataByUserId[call.completedBy].fullname : 'Default'}</p>
                              </div>
                              <div className='vas-admin-custom-table-td vas-admin-custom-table-mrn'>
                                <p className='vas-admin-custom-item-subfield'>MRN:</p>
                                <p className='vas-admin-custom-item-subvalue'>{call.mrn}</p>
                              </div>
                              <div className='vas-admin-custom-table-td vas-admin-custom-table-room'>
                                <p className='vas-admin-custom-item-subfield'>Room:</p>
                                <p className='vas-admin-custom-item-subvalue'>{call.room}</p>
                              </div>
                              <div className='vas-admin-custom-table-td vas-admin-custom-table-provider'>
                                <p className='vas-admin-custom-item-subfield'>Provider:</p>
                                <p className='vas-admin-custom-item-subvalue'>{call.provider}</p>
                              </div>
                            </div>
                            <div className='vas-admin-custom-table-item-column vas-admin-custom-table-item-column-3'>
                              <div className='vas-admin-custom-table-td vas-admin-custom-table-procedures'>
                                {call.proceduresDone.map((procedure, idx2)=>{
                                  return (
                                    <div className='vas-admin-query-procedure-container' key={idx2}>
                                      <p className='vas-admin-query-procedure-names'>{this.state.proceduresById[procedure.procedureId].name}</p>
                                      <div className='vas-admin-query-item-container'>
                                      {procedure.itemIds && procedure.itemIds.length &&
                                        procedure.itemIds.map((id, idx3)=>{
                                          let isCustom = this.state.itemsById[id].isCustom;
                                          return (
                                            <p key={idx3} className='vas-admin-query-item'>{!isCustom ? this.state.itemsById[id].value : this.state.itemsById[id].groupName + ":" + procedure.customValues[id]}</p>
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
                              <div className='vas-admin-custom-table-td vas-admin-custom-table-response'><p className='vas-admin-left-column'>Response Time:</p><p className='vas-admin-right-column'>{responseHours > 0 ? `${responseHours} Hr` : ''} {responseMinutes} Min</p></div>
                              <div className='vas-admin-custom-table-td vas-admin-custom-table-response'><p className='vas-admin-left-column'>Procedure Time:</p><p className='vas-admin-right-column'>{completionHours > 0 ? `${completionHours} Hr` : ''} {completionMinutes} Min</p></div>
                            </div>
                          </div>
                        )
                      })
                      }
                    </div>
                  </div>
                  {this.state.isLoading &&
                    <img className='vas-admin-loading-gif' src={loadingGif} alt='loading'/>
                  }
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
                  <input type='checkbox' checked={this.state.addAdminAccess} onClick={e=>{this.setState({addAdminAccess:!this.state.addAdminAccess})}}/>
                  <p className='vas-admin-add-user-notes'>Contact ID will automatically be created once new user is added (auto-incrementing)</p>
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
                      {this.state.allUsers.map((val, idx)=>{
                        return(
                          <tr key={idx}>
                            <td>{val.userId}</td>
                            <td>{val.fullname}</td>
                            <td>{val.username}</td>
                            <td>{val.password}</td>
                            <td>{val.role}</td>
                            <td className='vas-admin-delete-user'>
                              <p data-id={val._id} data-index={idx} onClick={e=>{this.deleteUser(val._id)}}>&times;</p>
                            </td>
                          </tr>
                        )
                      })
                      }
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
      </div>
    )
  }
}