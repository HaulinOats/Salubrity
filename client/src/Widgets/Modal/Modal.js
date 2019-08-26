import React, {Component} from 'react';
import './Modal.css';
import axios from 'axios';
import {DebounceInput} from 'react-debounce-input';

export default class Modal extends Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen:true,
      modalTitle:this.props.modalTitle,
      modalMessage:this.props.modalMessage,
      currentUser:this.props.currentUser,
      isConfirmation:this.props.isConfirmation,
      customSelected:false,
      custom:'',
      preComments:'',
      isAddCall:false,
      roomNumber:null,
      need:null,
      needOpened:false,
      contactNumber:'',
      inputsValidated:false,
      addedCall:null
    }
    this.handleNeedSelect = this.handleNeedSelect.bind(this);
  };

  componentWillMount(){
    if(this.state.modalTitle === "Add Call"){
      this.setState({isAddCall:true});
    }
  }

  componentDidMount(){
    console.log(this.state);
  }

  handleNeedSelect(e){
    if(e.target.value === 'default'){
      this.setState({need:null, customSelected:false}, this.validateAddCall);
    } else if(e.target.value.toLowerCase() === 'custom'){ 
      this.setState({
        need:e.target.value,
        customSelected:true
      }, this.validateAddCall);
    } else {
      this.setState({need:e.target.value, customSelected:false, custom:""}, this.validateAddCall);
    }
  }

  validateAddCall(){
    if(this.state.roomNumber && this.state.roomNumber.length && 
      this.state.need){
      if(this.state.customSelected){
        if(this.state.custom.length){
          this.setState({inputsValidated:true});
        } else {
          this.setState({inputsValidated:false});
        }
      } else {
        this.setState({inputsValidated:true});
      }
    } else {
      this.setState({inputsValidated:false});
    }
  }

  addCall(){
    let addQuery = {
      room:this.state.roomNumber,
      job:this.state.need,
      contact:this.state.contactNumber,
      createdAt:new Date().toISOString(),
      createdBy:this.state.currentUser.userId,
      customJob:this.state.custom.length ? this.state.custom : null,
      preComments:this.state.preComments.length ? this.state.preComments : null,
      isOpen:false
    };

    if(this.state.custom.length < 1){
      delete addQuery.custom;
    }

    axios.post('/add-call', addQuery)
    .then((resp)=>{
      this.setState({
        isAddCall:false,
        saveConfirmed:true,
        customSelected:false,
        addedCall:resp.data
      }, this.closeModal);
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  closeModal(){
    setTimeout(()=>{
      this.props.closeModal()
    }, 2000);
  }

  getConfirmation(isConfirmed){
    this.props.getConfirmation(isConfirmed);
    this.props.closeModal();
  }

  render(){
    return(
      <div className="vas-modal-container" data-isOpen={this.state.isOpen}>
        <div className="vas-modal-clickguard" onClick={this.props.closeModal}></div>
        <div className="vas-modal-content">
          <div className="vas-modal-content-inner">
            <header className="vas-modal-content-header">
              <p className='vas-modal-header-text'>{this.state.modalTitle}</p>
              <div className="vas-modal-content-closeBtn" onClick={this.props.closeModal}>&#10006;</div>
            </header>
            <div className="vas-modal-content-main">
              {this.state.saveConfirmed &&
                <p className="vas-modal-saved-msg">Item added to queue!</p>
              }
              {this.state.modalMessage &&
                <p className='vas-modal-message'>{this.state.modalMessage}</p>
              }
              {this.state.isAddCall &&
              <div>
                <div className="vas-modal-add-call-row">
                  <div className="vas-modal-add-call-row-inner">
                    <p>Room:</p>
                      <DebounceInput
                        className="vas-modal-add-call-input"
                        minLength={1}
                        debounceTimeout={300}
                        onChange={e => {this.setState({roomNumber: e.target.value}, this.validateAddCall)}} />
                  </div>
                  <div className="vas-modal-add-call-row-inner">
                    <p>Need:</p>
                    <select className="vas-modal-add-call-input" onClick={e => {this.setState({needOpened:true})}} onChange={this.handleNeedSelect}>
                      <option value="default">Select Need</option>
                      <option>Lab Draw</option>
                      <option>New IV</option>
                      <option>PICC Line</option>
                      <option>Midline</option>
                      <option>Port Access</option>
                      <option>Port De-Access</option>
                      <option>Troubleshoot</option>
                      <option>Dressing Change</option>
                      <option>Labs + IV</option>
                      <option>Custom</option>
                    </select>
                    </div>
                    {this.state.customSelected &&
                      <div className='vas-modal-add-call-row-inner'>
                        <p>Custom Name:</p>
                        <input className='vas-modal-add-call-input vas-modal-custom-input' type='text' value={this.state.custom} onChange={e => {this.setState({custom: e.target.value}, this.validateAddCall)}} />
                      </div>
                    }
                    <div className="vas-modal-add-call-row-inner">
                      <p>Contact:</p>
                      <input type='text' className='vas-modal-add-call-input' value={this.state.contactNumber} onChange={e => {this.setState({contactNumber: e.target.value}, this.validateAddCall)}} />
                    </div>
                    <div className='vas-modal-add-call-row-block'>
                      <p>Pre-Procedure Notes:</p>
                      <textarea className='vas-modal-add-call-textarea' value={this.state.preComments} onChange={e=>{this.setState({preComments:e.target.value})}}></textarea>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div className='vas-modal-content-buttonContainer-outer'>
              {this.state.isConfirmation && 
                <div className='vas-modal-content-buttonContainer'>
                  <button className='vas-btn-confirm vas-btn-no' onClick={e=>{this.getConfirmation(false)}}>Cancel</button>
                  <button className='vas-btn-confirm vas-btn-yes' onClick={e=>{this.getConfirmation(true)}}>OK</button>
                </div>
              }
              {this.state.isAddCall && this.state.inputsValidated &&
                <div className="vas-modal-content-buttonContainer">
                  <button className="btn btn-danger vas-modal-cancel" onClick={this.props.toggleModal}>Cancel</button>
                  <button className="btn btn-success vas-modal-confirm" onClick={()=>{this.addCall()}}>Add To Queue</button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}