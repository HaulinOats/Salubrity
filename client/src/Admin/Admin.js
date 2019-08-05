import React, {Component} from 'react';
import './Admin.css';
import axios from 'axios';
import {DebounceInput} from 'react-debounce-input';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import loadingGif from '../../public/loading.gif';

export default class Admin extends Component {
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      userData:localStorage.getItem('userData') !== 'undefined' ? JSON.parse(localStorage.getItem('userData')) : null,
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
      allProcedures:[]
    }
    this.startDateSelected = this.startDateSelected.bind(this);
    this.endDateSelected = this.endDateSelected.bind(this);
    this.submitDateRange = this.submitDateRange.bind(this);
    this.customQuery = this.customQuery.bind(this);
    this.addUser = this.addUser.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentWillMount(){
    if(this.state.userData){
      //Allow user session access for 30 minutes (1800 seconds)
      //if it's been more than 30 minutes since last login, logout user
      if(Math.floor(Date.now() / 1000) - this.state.userData.lastLogin > 1800){
        this.logout();
      } else {
        //if user has refreshed at any point and it's been less than 30 minutes, refresh session
        let userData = {...this.state.userData}
        userData.lastLogin = Math.floor(Date.now() / 1000);
        this.setState({userData}, ()=>{
          this.setStorageItem(false, 'userData', this.state.userData);
          console.log(userData);
        });
      }

      axios.get('/get-all-users')
      .then((resp)=>{
        this.setState({allUsers:resp.data});
      }).catch((err)=>{
        console.log(err);
      })
  
      axios.get('/get-procedures')
      .then((resp)=>{
        this.setState({allProcedures:resp.data});
      })
      .catch((err)=>{
        console.log(err);
      })
    }
  }

  setStorageItem(isRemove, name, data){
    if(isRemove){
      localStorage.removeItem(name)
    } else {
      localStorage.setItem(name, JSON.stringify(data));
    }
  }

  customQuery(){
    axios.get('/seed-procedures')
    .then((resp)=>{
      console.log(resp.data);
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  addUser(){
    let validationErrors = []
    if(this.state.addFullName.length < 5 || this.state.addUserName.length < 5){
      validationErrors.push('Full Name & Username must be atleast 5 characters');
    }
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

  adminLogin(){
    if(!this.state.userData){
      axios.post('/admin-login', {
        username:this.state.username,
        password:this.state.password
      })
      .then((resp)=>{
        if(resp.data){
          console.log('login successful');
          let userData = resp.data;
          userData.lastLogin = Math.floor(Date.now() / 1000);
          this.setState({userData}, ()=>{
            axios.get('/get-all-users')
            .then((resp)=>{
              this.setState({allUsers:resp.data});
            }).catch((err)=>{
              console.log(err);
            })
        
            axios.get('/get-procedures')
            .then((resp)=>{
              this.setState({allProcedures:resp.data});
            })
            .catch((err)=>{
              console.log(err);
            })
            this.setStorageItem(false, 'userData', this.state.userData);
            console.log(userData);
          });
        } else {
          alert('Incorrect password');
          console.log(resp.data);
        }
      })
      .catch((err)=>{
        alert('Username or password do not match.');
        console.log(err);
      })
    }
  }

  logout(){
    this.setState({userData:null}, ()=>{
      this.setStorageItem(true, 'userData');
    });
  }

  startDateSelected(date){
    this.setState({
      startDate: date
    });
  }
  
  endDateSelected(date){
    this.setState({
      endDate: date
    });
  }

  submitDateRange(){
    console.log('start date: ', this.state.startDate);
    console.log('end date: ', this.state.endDate);
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
    return(
      <div className='vas-admin-container'>
        {!this.state.userData &&
          <div className='vas-admin-login-container p-3'>
            <div className="vas-admin-login-wrap">
              <div className='vas-admin-color-border'>
                <div className='vas-admin-color-border-block vas-admin-color-border-block-1'></div>
                <div className='vas-admin-color-border-block vas-admin-color-border-block-2'></div>
                <div className='vas-admin-color-border-block vas-admin-color-border-block-3'></div>
                <div className='vas-admin-color-border-block vas-admin-color-border-block-4'></div>
                <div className='vas-admin-color-border-block vas-admin-color-border-block-5'></div>
              </div>
              <h2>VAS Tracker</h2>
              <h3>Admin Login</h3>
              <div className="vas-admin-login-form">
                <DebounceInput
                  className="vas-admin-username-field"
                  placeholder="Username"
                  type="text"
                  minLength={4}
                  debounceTimeout={100}
                  onChange={e => {this.setState({username: e.target.value.toLowerCase()})}} />
                <DebounceInput
                  className="vas-admin-pw-field"
                  placeholder="Password"
                  type="password"
                  minLength={5}
                  debounceTimeout={100}
                  onChange={e => {this.setState({password: e.target.value.toLowerCase()})}}
                  onKeyUp={e => {if(e.key === 'Enter'){this.adminLogin()}}} />
                <button className='vas-admin-login-btn' onClick={e=>{this.adminLogin()}}>Sign in</button>
              </div>
            </div>
            <button style={{display:'none'}} onClick={e=>{this.seedSuper()}}>Seed Super</button>
          </div>
        }
        {this.state.userData &&
          <div className='vas-admin-main-container'>
            <header>
              <h2>VAS Tracker Admin Panel</h2>
              <ul className='vas-admin-menu'>
                <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'date' ? true : false} onClick={e=>{this.setState({activePage:'date'})}}>Date Range</li>
                <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'users' ? true : false} onClick={e=>{this.setState({activePage:'users'})}}>Manage Users</li>
                <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'procedures' ? true : false} onClick={e=>{this.setState({activePage:'procedures'})}}>Manage Procedure Info</li>
                {this.state.userData.role === 'super' &&
                  <li className='vas-admin-menu-item' data-isactive={this.state.activePage === 'super' ? true : false} onClick={e=>{this.setState({activePage:'super'})}}>Super</li>
                }
              </ul>
              <p className='vas-admin-username'>{this.state.userData.fullname}</p>
              <p className='vas-admin-logout' onClick={this.logout}>Logout</p>
            </header>
            <div className='vas-admin-main-content'>
              <div className='vas-admin-page-container vas-admin-date-container' data-isactive={this.state.activePage === 'date' ? true : false}>
                <div className='vas-admin-date-range-container'>
                  <div className='vas-admin-date-range-inner'>
                    <p className='vas-damin-date-label'>From:</p>
                    <DatePicker className='vas-admin-datepicker' selected={this.state.startDate} onChange={this.startDateSelected} />
                  </div>  
                  <div className='vas-admin-date-range-inner'>
                    <p className='vas-damin-date-label'>To:</p>
                    <DatePicker className='vas-admin-datepicker' selected={this.state.endDate} onChange={this.endDateSelected} />
                  </div>
                  <div className='vas-admin-date-range-checkboxes'>
                    <input className='vas-admin-date-range-show-all' type='checkbox' />
                    <label>Show All Data</label>
                  </div>
                  <button className='vas-admin-date-range-submit' onClick={this.submitDateRange}>Submit</button>
                </div>
                <div className='vas-admin-date-query-container'>
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
                        <th onClick={e=>{this.sortColumn('contactId')}}>contactId</th>
                        <th onClick={e=>{this.sortColumn('fullname')}}>fullname</th>
                        <th onClick={e=>{this.sortColumn('username')}}>username</th>
                        <th onClick={e=>{this.sortColumn('password')}}>password/pin</th>
                        <th onClick={e=>{this.sortColumn('role')}}>role</th>
                        <th className='vas-admin-delete-user'>Delete?</th>
                      </tr>
                      {this.state.allUsers.map((val, idx)=>{
                        return(
                          <tr key={idx}>
                            <td>{val.contactId}</td>
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
              {this.state.userData.role === 'super' &&
                <div className='vas-admin-page-container vas-admin-super-container' data-isactive={this.state.activePage === 'super' ? true : false}>
                  <h3>Super Page</h3>
                  <button onClick={this.customQuery}>Custom Query</button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    )
  }
}