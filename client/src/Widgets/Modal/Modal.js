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
      selectedIds:this.props.selectedIds,
      customSelected:false,
      comment:'',
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

  handleNeedSelect(e){
    if(e.target.value === 'default'){
      this.setState({need:null, customSelected:false}, this.validateAddCall);
    } else if(e.target.value.toLowerCase() === 'custom'){ 
      this.setState({
        need:e.target.value,
        customSelected:true
      }, this.validateAddCall);
    } else {
      this.setState({need:e.target.value, customSelected:false, comment:""}, this.validateAddCall);
    }
  }

  validateAddCall(){
    if(this.state.roomNumber && this.state.roomNumber.length && 
      this.state.need){
      if(this.state.customSelected){
        if(this.state.comment.length){
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
      comment:this.state.comment,
      isOpen:false
    };

    if(this.state.comment.length < 1){
      delete addQuery.comment;
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
      this.props.getAddedCall(this.state.addedCall);
      this.props.closeModal()
    }, 2000);
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
              {this.state.isAddCall &&
              <div>
                <div className="vas-modal-add-call-row">
                  <div className="vas-modal-add-call-row-inner">
                    <p>Room Number</p>
                      <DebounceInput
                        className="vas-modal-add-call-input"
                        minLength={1}
                        debounceTimeout={300}
                        onChange={e => {this.setState({roomNumber: e.target.value}, this.validateAddCall)}} />
                  </div>
                  <div className="vas-modal-add-call-row-inner">
                    <p>Need</p>
                    <select className="vas-modal-add-call-input" onClick={e => {this.setState({needOpened:true})}} onChange={this.handleNeedSelect}>
                      <option value="default">Select Need</option>
                      <option>Lab Draw</option>
                      <option>New IV</option>
                      <option>PICC Line</option>
                      <option>Midline</option>
                      <option>Port Access</option>
                      <option>Port De-Access</option>
                      <option>Central Line Troubleshoot</option>
                      <option>Dressing Change</option>
                      <option>Custom</option>
                    </select>
                    </div>
                    <div className="vas-modal-add-call-row-inner">
                      <p>Contact Number</p>
                      <input type='text' className='vas-modal-add-call-input' value={this.state.contactNumber} onChange={e => {this.setState({contactNumber: e.target.value}, this.validateAddCall)}} />
                    </div>
                  </div>
                </div>
              }
              {this.state.customSelected &&
                <div>
                  <p className="vas-modal-comment-text">Comment:</p>
                  <DebounceInput
                    element="textarea"
                    className="vas-modal-add-call-textarea"
                    minLength={1}
                    debounceTimeout={300}
                    onChange={e => {this.setState({comment: e.target.value}, this.validateAddCall)}} />
                </div>
              }
              {this.state.selectedIds &&
                this.state.selectedIds.map((el, i)=>{
                  return <p key={i}>{el}</p>
                })
              }
            </div>
            {this.state.isAddCall && this.state.inputsValidated &&
            <div className="vas-modal-content-buttonContainer">
              <button className="btn btn-danger vas-modal-cancel" onClick={this.props.toggleModal}>Cancel</button>
              <button className="btn btn-success vas-modal-confirm" onClick={()=>{this.addCall()}}>Add To Queue</button>
            </div>
            }
          </div>
        </div>
      </div>
    )
  }
}