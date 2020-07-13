import React, {Component} from 'react';
import './Login.css';
import DebounceInput from 'react-debounce-input';
import Modal from '../Modal/Modal';
import axios from 'axios';

export default class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      loginType:this.props.loginType,
      modalIsOpen:false,
      modalMessage:'',
      modalTitle:'',
      modalConfirmation:false,
      confirmationType:null
    }
    this.closeModal = this.closeModal.bind(this);
  }

  login(){
    if(this.loginValidated()){
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

  loginValidated(){
    let errors = '';

    if(this.state.username.length < 5){
      errors += '- Username too short (minimum of 5 characters)\n';
    }
    if(this.state.password.length < 4){
      errors += '- Password too short (minimum of 4 characters)\n';
    }

    if(errors.length){
      this.setState({
        modalIsOpen:true, 
        modalTitle:'Login Validation Failed',
        modalMessage:errors
      });
      return false;
    }
    return true;
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
          <h2 onClick={e=>{window.location.reload()}}>Salubrity</h2>
          <h3 className='vas-capitalize'>{this.state.loginType} Login</h3>
          <div className="vas-login-form">
            <DebounceInput
              className="vas-login-username-field"
              placeholder="Username"
              type="text"
              debounceTimeout={100}
              onChange={e => {this.setState({username: e.target.value})}} />
            <DebounceInput
              className="vas-login-pw-field"
              placeholder="Password"
              type="password"
              debounceTimeout={100}
              onChange={e => {this.setState({password: e.target.value})}}
              onKeyUp={e => {if(e.key === 'Enter'){this.login()}}} />
            <button className='vas-login-btn' onClick={e=>{this.login()}}>Sign in</button>
            <button style={{'display':'none'}}onClick={e=>{this.seedSuper()}}>Seed Super</button>
            <p>Test Username: <b style={{"font-weight":"bold"}}>Tester</b></p>
            <p>Test Password: <b style={{"font-weight":"bold"}}>1234</b></p>
          </div>
        </div>
        {this.state.modalIsOpen && 
          <Modal 
            closeModal={this.closeModal}
            modalTitle={this.state.modalTitle} 
            modalMessage={this.state.modalMessage}
            toggleModal={this.toggleHandler}/>
        }
      </div>
    )
  }
}