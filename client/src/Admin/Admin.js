import React, {Component} from 'react';
import Login from '../Widgets/Login/Login';
import './Admin.css';
import axios from 'axios';
import moment from 'moment';
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
      allUsers:[],
      allProcedures:[],
      allOptions:[],
      queriedCalls:[]
    }
    this.submitDateRange = this.submitDateRange.bind(this);
    this.seedProcedures = this.seedProcedures.bind(this);
    this.seedOptions = this.seedOptions.bind(this);
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
    axios.get('/get-all-users')
    .then((resp)=>{
      this.setState({allUsers:resp.data});
      console.log(resp.data);
    }).catch((err)=>{
      console.log(err);
    })

    axios.get('/get-procedures')
    .then((resp)=>{
      if(resp.data.error){
        console.log(resp.data.error);
      } else {
        this.setState({allProcedures:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })

    axios.get('/get-options')
    .then((resp)=>{
      if(resp.data.error){
        console.log(resp.data.error);
      } else {
        this.setState({allOptions:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })

    setTimeout(()=>{
      console.log(this.state);
    }, 0);
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

  seedProcedures(){
    axios.get('/seed-procedures')
    .then((resp)=>{
      console.log(resp.data);
      if(resp.data.error){
        console.log(resp.data.error);
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
      if(resp.data.error){
        console.log(resp.data.error);
      } else {
        this.setState({allOptions:resp.data});
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
        if(resp.data.errorType === 'uniqueViolated'){
          alert(`Error: another user is already assigned ${resp.data.key}`);
          console.log(resp.data);
        } else {
          alert('User Created');
          console.log(resp.data);
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

  deleteUser(e){
    let index = e.target.attributes['data-index'].value;
    axios.post('/delete-user', {_id:e.target.attributes['data-id'].value})
    .then((resp)=>{
      console.log('user deleted');
      let users = this.state.allUsers;
      users.splice(index, 1);
      this.setState({allUsers:users});
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

  startDateChange(date){
    console.log(date.target.value);
    this.setState({
      startDate: date
    });
  }
  
  endDateChange(date){
    console.log(date.target.value);
    this.setState({
      endDate: date
    });
  }

  submitDateRange(){
    console.log(moment(this.state.startDate).startOf('day'));
    console.log(moment(this.state.endDate).endOf('day'));
    // console.log(this.state.startDate.utc().startOf('day').toISOString());
    // console.log(this.state.endDate.utc().endOf('day').toISOString());
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
                <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'procedures' ? true : false} onClick={e=>{this.setState({activePage:'procedures'})}}>Manage Procedure Info</li>
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
                  <button className='vas-admin-date-range-submit' onClick={this.submitDateRange}>Submit</button>
                </div>
                <div className='vas-admin-date-query-container'>
                  <table className='vas-table vas-admin-table'>
                    <tbody>
                      <tr>
                        <th>Job</th>
                        <th>Comments</th>
                        <th>Procedures Done</th>
                        <th>Created At</th>
                        <th>Completed At</th>
                        <th>Completed By</th>
                      </tr>
                      {this.state.queriedCalls.map((call, idx)=>{
                        return(
                          <tr className='vas-table-tr' key={idx}>
                            <td>{call.job}</td>
                            <td>{call.comment}</td>
                            <td>
                              {call.proceduresDone.map((procedure, idx2)=>{
                                return <span key={idx2}>{procedure}, </span>
                              })}
                            </td>
                            <td>{call.createdAt}</td>
                            <td>{call.completedAt}</td>
                            <td>{call.completedBy}</td>
                          </tr>
                        )
                      })
                      }
                    </tbody>
                  </table>
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
                              <p data-id={val._id} data-index={idx} onClick={e=>{this.deleteUser(e)}}>&times;</p>
                            </td>
                          </tr>
                        )
                      })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='vas-admin-page-container vas-admin-procedures-container' data-isactive={this.state.activePage === 'procedures' ? true : false}>
                <h3>Manage Procedure Info</h3>
                <table className='vas-admin-table'>
                  <tbody>
                    <tr>
                      <th>Procedure ID</th>
                      <th>Name</th>
                      <th>Field</th>
                      <th>Value</th>
                      <th>Select Type</th>
                    </tr>
                    {
                      this.state.allProcedures.map((val, idx)=>{
                        return(
                          <tr key={idx}>
                            <td>{val.procedureId}</td>
                            <td>{val.name}</td>
                            <td>{val.field}</td>
                            <td>{val.value}</td>
                            <td>{val.selectType}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
              {this.state.currentUser.role === 'super' &&
                <div className='vas-admin-page-container vas-admin-super-container' data-isactive={this.state.activePage === 'super' ? true : false}>
                  <h3>Super Page</h3>
                  <button onClick={this.seedProcedures}>Seed Procedures</button>
                  <button onClick={this.seedOptions}>Seed Options</button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    )
  }
}