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
      activePage:'date'
    }
    this.startDateSelected = this.startDateSelected.bind(this);
    this.endDateSelected = this.endDateSelected.bind(this);
    this.submitDateRange = this.submitDateRange.bind(this);
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
          localStorage.setItem('userData', JSON.stringify(this.state.userData));
          console.log(userData);
        });
      }
    }
  }

  addUser(userObj){
    axios.post('/add-user', userObj)
    .then((resp)=>{
      alert('New user added');
    }).catch((err)=>{
      console.log(err);
    })
  }

  getAllUsers(){
    axios.get('/get-all-users')
    .then((resp)=>{
      console.log(resp.data);
    }).catch((err)=>{
      console.log(err);
    })
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
            localStorage.setItem('userData', JSON.stringify(this.state.userData));
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
      localStorage.removeItem('userData');
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
                {/* <button onClick={(e)=>{this.addUser({
                  fullname:'Brett Connolly',
                  username:'brett84c',
                  contactId:1001,
                  password:'lisa8484',
                  role:'admin'
                })}}>Add User</button> */}
              </div>
            </div>
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
              </div>
              <div className='vas-admin-page-container vas-admin-users-container' data-isactive={this.state.activePage === 'users' ? true : false}>
                <h2>Manage Users</h2>
              </div>
              <div className='vas-admin-page-container vas-admin-procedures-container' data-isactive={this.state.activePage === 'procedures' ? true : false}>
                <h2>Manage Procedure Info</h2>
              </div>
              <div className='vas-admin-date-query-container'>
                {this.state.isLoading &&
                  <img className='vas-admin-loading-gif' src={loadingGif} alt='loading'/>
                }
              </div>
              {/* <button onClick={(e)=>{this.getAllUsers()}}>Get All Users</button> */}
            </div>
          </div>
        }
      </div>
    )
  }
}