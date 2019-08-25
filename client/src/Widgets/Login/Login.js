import React, {Component} from 'react';
import './Login.css';
import DebounceInput from 'react-debounce-input';
import axios from 'axios';

export default class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      loginType:this.props.loginType
    }
  }

  login(isTest){
    if(isTest){
      axios.post('/login', {
        username:'test',
        password:'1234',
        loginType:'user'
      })
      .then((resp)=>{
        console.log(resp.data);
        if(resp.data.error){
          console.log(resp.data.error)
        } else {
          this.props.loginCallback(resp.data);
        }
      })
      .catch((err)=>{
        alert('Username or password do not match.');
        console.log(err);
      })
    } else {
      axios.post('/login', {
        username:this.state.username,
        password:this.state.password,
        loginType:this.state.loginType
      })
      .then((resp)=>{
        console.log(resp.data);
        if(resp.data.error){
          console.log(resp.data.error)
          alert(resp.data.error);
        } else {
          this.props.loginCallback(resp.data);
        }
      })
      .catch((err)=>{
        alert('Username or password do not match.');
        console.log(err);
      })
    }
  }

  seedSuper(){
    axios.get('/seed-super')
    .then(resp => {
      console.log(resp.data);
    })
    .catch(err=>{
      console.log(err);
    })
  }

  render(){
    return(
      <div className='vas-login-container'>
        <div className="vas-login-wrap">
          <div className='vas-login-color-border'>
            <div className='vas-login-color-border-block vas-login-color-border-block-1'></div>
            <div className='vas-login-color-border-block vas-login-color-border-block-2'></div>
            <div className='vas-login-color-border-block vas-login-color-border-block-3'></div>
            <div className='vas-login-color-border-block vas-login-color-border-block-4'></div>
            <div className='vas-login-color-border-block vas-login-color-border-block-5'></div>
          </div>
          <h2>VAS Tracker</h2>
          <h3 className='vas-capitalize'>{this.state.loginType} Login</h3>
          <div className="vas-login-form">
            <DebounceInput
              className="vas-login-username-field"
              placeholder="Username"
              type="text"
              minLength={4}
              debounceTimeout={100}
              onChange={e => {this.setState({username: e.target.value.toLowerCase()})}} />
            <DebounceInput
              className="vas-login-pw-field"
              placeholder="Password"
              type="password"
              minLength={4}
              debounceTimeout={100}
              onChange={e => {this.setState({password: e.target.value.toLowerCase()})}}
              onKeyUp={e => {if(e.key === 'Enter'){this.login()}}} />
            <button className='vas-login-btn' onClick={e=>{this.login()}}>Sign in</button>
            {this.state.loginType === 'user' &&
              <button className='vas-login-btn' onClick={e=>{this.login(true)}}>Test Login</button>
            }
            <button style={{'display':'none'}}onClick={e=>{this.seedSuper()}}>Seed Super</button>
          </div>
        </div>
      </div>
    )
  }
}