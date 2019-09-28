import React, {Component} from 'react';
import Login from '../Components/Login/Login';
import Modal from '../Components/Modal/Modal';
import EditProcedure from '../Components/EditProcedure/EditProcedure';
import Filters from '../Components/Filters/Filters';
import helpers from '../helpers';
import './Admin.css';
import axios from 'axios';
import loadingGif from '../../public/loading.gif';
import ReturnedProcedures from '../Components/ReturnedProcedures/ReturnedProcedures';
import ls from 'local-storage';
import moment from 'moment';
import DatePicker from "react-datepicker";

export default class Admin extends Component {
  constructor(props){
    super(props);
    this.state = {
      aggregateStartDate:moment(),
      aggregateEndDate:moment(),
      aggregateData:[],
      aggregateInsertionTypes:[],
      currentUser:null,
      isLoading:false,
      activePage:'query',
      activeRecord:null,
      addFullName:'',
      addUserName:'',
      addPassword:'',
      addAdminAccess:false,
      procedures:null,
      allUsers:null,
      usersById:null,
      hospitals:null,
      hospitalsById:null,
      itemsById:null,
      proceduresById:null,
      orderChanges:null,
      orderChangeById:null,
      allOptions:[],
      queriedCalls:[],
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
    this.seedProcedures = this.seedProcedures.bind(this);
    this.seedOptions = this.seedOptions.bind(this);
    this.seedItems = this.seedItems.bind(this);
    this.addUser = this.addUser.bind(this);
    this.logout = this.logout.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
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
    this.returnedCalls = this.returnedCalls.bind(this);
    this.aggregateData = this.aggregateData.bind(this);
    this.aggregateStartDateOnChange = this.aggregateStartDateOnChange.bind(this);
    this.aggregateEndDateOnChange = this.aggregateEndDateOnChange.bind(this);
    this.addField = this.addField.bind(this);
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
  }

  addField(){
    axios.get('/add-field-to-model-documents').then(resp=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        console.log('field added to model')
      }
    }).catch(err=>{
      console.log(err);
    })
  }

  aggregateStartDateOnChange(date){
    this.setState({aggregateStartDate:date})
  }
  
  aggregateEndDateOnChange(date){
    this.setState({aggregateEndDate:date})
  }

  aggregateData(){
    axios.post('/get-aggregation', {
      completedAt:{
        startDate: moment(this.state.aggregateStartDate).startOf('day').toISOString(),
        endDate: moment(this.state.aggregateEndDate).endOf('day').toISOString()
      }
    }).then(resp=>{
      let insertionTypes = [];
      for(let i = 0; i < resp.data.length; i++){
        switch(resp.data[i]._id){
          case 58:
          case 59:
          case 60:
          case 61:
          case 62:
            insertionTypes.push({
              itemId:resp.data[i]._id,
              count:resp.data[i].count
            })
            break;
          default:
        }
      }
      console.log(resp.data);
      console.log(insertionTypes);
      this.setState({
        aggregateData:resp.data,
        aggregateInsertionTypes:insertionTypes
      })
    }).catch(err=>{
      console.log('error: ', err);
    })
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
      activePage:'query',
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
    this.setState({
      currentUser:user
    }, ()=>{
      this.startSessionInterval();
      this.refreshUserSession();
      this.stateLoadCalls();
    });
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
    console.log(`${Math.floor(timeDiff/60)} minutes inactive (ends session at 30)`);
    if(timeDiff > 1800){
      console.log('Logging user out due to inactivity');
      this.logout();
    }
    if(timeDiff > 1620){
      this.setState({
        modalTitle:'Session Is About To End',
        modalMessage:'You are about to be logged out due to inactivity. Click "OK" to continue session.',
        modalIsOpen:true,
        modalConfirmation:true
      })
    }
  }

  stateLoadCalls(){
    helpers.getOptionsData().then(data=>{
      this.setState({
        allOptions:data.options,
        hospitals:data.hospitals,
        hospitalsById:data.hospitalsById,
        orderChanges:data.orderChanges,
        orderChangeById:data.orderChangeById,
        statusById:data.statuses
      })
    }).catch(err=>{
      console.log(err);
    })

    helpers.getProcedureData().then(data=>{
      let proceduresById = {};
      for(let i = 0; i < data.procedures.length; i++){
        proceduresById[data.procedures[i].procedureId] = data.procedures[i];
      }
      this.setState({
        procedures:data.procedures,
        proceduresById
      }, ()=>{
        setTimeout(()=>{
          console.log(this.state);
        },1000)
      })
    }).catch(err=>{
      console.log(err);
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
        alert(resp.data.error ? resp.data.error : resp.data._message);
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
        alert(resp.data.error ? resp.data.error : resp.data._message);
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
        alert(resp.data.error ? resp.data.error : resp.data._message);
      } else {
        console.log(resp.data);
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
          alert(resp.data.error ? resp.data.error : resp.data._message);
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
        alert(resp.data.error ? resp.data.error : resp.data._message);
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

  returnedCalls(calls){
    let queriedCalls = calls;
    for(let i = 0; i < queriedCalls.length; i++){
      if(queriedCalls[i].completedBy !== null){
        queriedCalls[i].completedByName = this.state.usersById[queriedCalls[i].completedBy].fullname;
      } else {
        queriedCalls[i].completedByName = null;
      }
      //add hospital name to call for sorting
      if(queriedCalls[i].hospital !== null){
        queriedCalls[i].hospitalName = this.state.hospitalsById[queriedCalls[i].hospital].name;
      } else {
        queriedCalls[i].hospitalName = null;
      }
    }
    this.setState({queriedCalls});
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
        alert(resp.data.error ? resp.data.error : resp.data._message);
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
        alert(resp.data.error ? resp.data.error : resp.data._message);
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
        alert(resp.data.error ? resp.data.error : resp.data._message);
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

  editCompletedCall(callId){
    helpers.getCallById(callId).then(resp=>{
      this.setState({
        activeRecord:resp,
        activePage:'active'
      })
    }).catch(err=>{
      console.log(err);
    })
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
    let isAdmin;
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
            <header className='vas-main-header'>
              <div className='vas-header-left-container'>
                <h2 className='vas-admin-main-title'>VAS Admin</h2>
                <p className='vas-admin-menu-toggle' onClick={this.toggleMainMenu}>Menu &#9660;</p>
                <ul className={'vas-admin-menu ' + (this.state.menuIsVisible ? 'vas-admin-menu-visible' : '')} onClick={this.closeMenu}>
                  <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'query' ? true : false} onClick={e=>{this.setState({activePage:'query'})}}>Query</li>
                  <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'aggregate' ? true : false} onClick={e=>{this.setState({activePage:'aggregate'})}}>Aggregate</li>
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
                <p className='vas-admin-username vas-capitalize'>{this.state.currentUser.fullname}</p>
                <p className='vas-admin-logout' onClick={this.logout}>Logout</p>
              </div>
            </header>
            <div className='vas-admin-main-content'>
              <div className='vas-admin-page-container vas-admin-date-container' data-isactive={this.state.activePage === 'query' ? true : false}>
                {this.state.orderChanges && this.state.procedures && this.state.hospitals && this.state.allUsers && this.state.usersById && this.state.hospitalsById && this.state.itemsById &&
                  <Filters 
                    orderChanges={this.state.orderChanges.options}
                    procedures={this.state.procedures}
                    hospitals={this.state.hospitals.options}
                    allUsers={this.state.allUsers}
                    usersById={this.state.usersById} 
                    itemsById={this.state.itemsById}
                    hospitalsById={this.state.hospitalsById}
                    returnedCalls={this.returnedCalls}/>
                }
                {this.state.queriedCalls.length > 0 &&
                <ReturnedProcedures 
                  isAdmin={isAdmin}
                  queriedProcedures={this.state.queriedCalls}
                  proceduresById={this.state.proceduresById}
                  hospitalsById={this.state.hospitalsById}
                  usersById={this.state.usersById}
                  itemsById={this.state.itemsById}
                  editCompletedCall={this.editCompletedCall} 
                  orderChangeById={this.state.orderChangeById}/>
                }
              </div>
              <div className='vas-admin-page-container vas-admin-date-container' data-isactive={this.state.activePage === 'aggregate' ? true : false}>
                <div className='vas-filters-date-range-container'>
                  <div className='vas-filters-date-range-inner'>
                    <p className='vas-filters-date-label'>From:</p>
                    <DatePicker className='vas-filters-datepicker' selected={this.state.aggregateStartDate} onChange={this.aggregateStartDateOnChange} />
                  </div>  
                  <div className='vas-filters-date-range-inner'>
                    <p className='vas-filters-date-label'>To:</p>
                    <DatePicker className='vas-filters-datepicker' selected={this.state.aggregateEndDate} onChange={this.aggregateEndDateOnChange} />
                  </div>
                </div>
                <button onClick={this.aggregateData}>Aggregate</button>
                {this.state.aggregateData.length > 0 &&
                  <div className='vas-admin-aggregation-container'>
                    {this.state.aggregateInsertionTypes.length > 0 &&
                      <div className='vas-admin-aggregation-section'>
                        <h2>Aggregate Of Insertion Types</h2>
                        <div>
                          {this.state.aggregateInsertionTypes.map(insertion=>{
                            return (
                              <div key={insertion.itemId} className='vas-admin-aggregation-inner-container'>
                                <p className='vas-admin-aggregation-inner-container-left'>{this.state.itemsById[insertion.itemId].value}:</p>
                                <p className='vas-admin-aggregation-inner-container-right'>{insertion.count}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
              <div className='vas-admin-page-container vas-admin-active-container' data-isactive={this.state.activePage === 'active' ? true : false}>
                {this.state.activeRecord && this.state.procedures && this.state.itemsById && this.state.allOptions.length > 0 &&
                  <EditProcedure 
                    activeRecord={this.state.activeRecord}
                    allOptions={this.state.allOptions}
                    procedures={this.state.procedures}
                    usersById={this.state.usersById}
                    itemsById={this.state.itemsById}
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
                      {this.state.allUsers && this.state.allUsers.map((user, idx)=>{
                        return(
                          <tr key={user._id}>
                            <td>{user.userId}</td>
                            <td className='vas-capitalize'>{user.fullname}</td>
                            <td>{user.username}</td>
                            <td>
                              {user.role !== 'admin' && user.role !== 'super' &&
                                <span className='vas-admin-manage-users-pw'>
                                  <p onClick={e=>{this.togglePassword(e, true)}}>********</p>
                                  <p style={{'display':'none'}} onClick={e=>{this.togglePassword(e, false)}}>{user.password}</p>
                                </span>
                              }
                            </td>
                            <td>{user.role}</td>
                            <td className='vas-admin-delete-user'>
                              {user.role !== 'admin' && user.role !== 'super' &&
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
                  <button onClick={this.addField}>Add Field</button>
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