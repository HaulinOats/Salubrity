import React, {Component} from 'react';
import './Admin.css';
import axios from 'axios';
import {DebounceInput} from 'react-debounce-input';

export default class Admin extends Component {
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      userData:localStorage.getItem('userData') !== 'undefined' ? JSON.parse(localStorage.getItem('userData')) : null
    }
  }

  componentDidMount(){
    if(this.state.userData){
      //Allow user session access for 30 minutes (1800 seconds)
      //if it's been more than 30 minutes since last login, logout user
      if(Math.floor(Date.now() / 1000) - this.state.userData.lastLogin > 5){
        this.setState({userData:null}, ()=>{
          localStorage.removeItem('userData');
        });
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

  addUser(){
    axios.post('/add-user', {
      fullname:'Brett Connolly',
      username:'brett84c',
      contactId:1001,
      password:'lisa8484',
      role:'admin'
    })
    .then((resp)=>{
      console.log(resp.data);
    }).catch((err)=>{
      console.log(err);
    })
  }

  // customQuery(){
  //   axios.post('/custom-query', {})
  //   .then((resp)=>{
  //     console.log(resp.data);
  //   }).catch((err)=>{
  //     console.log(err);
  //   })
  // }

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
                <button onClick={(e)=>{this.addUser()}}>Add User</button>
                <button onClick={(e)=>{this.getAllUsers()}}>Get All Users</button>
              </div>
            </div>
          </div>
        }
        {this.state.userData &&
          <div className='vas-admin-main-container'>
            <h2>Admin Panel</h2>
          </div>
        }
      </div>
    )
  }
}