import React, {Component} from 'react';
import './Modal.css';
import {DebounceInput} from 'react-debounce-input';

export default class Modal extends Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen:true,
      modalTitle:this.props.modalTitle,
      selectedIds:this.props.selectedIds,
      otherSelected:false,
      comment:"",
      isAddCall:false,
      roomNumber:null,
      need:null,
      needOpened:false,
      contactNumber:null,
      inputsValidated:false
    }
    this.handleNeedSelect = this.handleNeedSelect.bind(this);
  }

  componentWillMount(){
    if(this.state.modalTitle === "Add Call"){
      this.setState({isAddCall:true});
    }
  }

  handleNeedSelect(e){
    if(e.target.value === 'default'){
      this.setState({need:null, otherSelected:false}, this.validateAddCall);
    } else if(e.target.value === 'other'){ 
      this.setState({
        need:e.target.value,
        otherSelected:true
      }, this.validateAddCall);
    } else {
      this.setState({need:e.target.value, otherSelected:false, comment:""}, this.validateAddCall);
    }
  }

  validateAddCall(){
    if(this.state.roomNumber && this.state.roomNumber.length && 
      this.state.need && 
      this.state.contactNumber && this.state.contactNumber.length){
      if(this.state.otherSelected){
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

  closeModal(){
    setTimeout(()=>{
      this.props.closeModal()
    }, 2000);
  }

  render(){
    return(
      <div className="vas-modal-container" data-isOpen={this.state.isOpen}>
        <div className="vas-modal-clickguard" onClick={this.props.toggleModal}></div>
        <div className="vas-modal-content">
          <div className="vas-modal-content-inner">
            <header className="vas-modal-content-header">
              <p>{this.state.modalTitle}</p>
              <div className="vas-modal-content-closeBtn" onClick={this.props.toggleModal}>&#10006;</div>
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
                      <option>New IV</option>
                      <option>IV + Labs</option>
                      <option>Lab Draw</option>
                      <option>PICC Dressing</option>
                      <option>Midline Dressing</option>
                      <option>Port Access</option>
                      <option>Port Deaccess</option>
                      <option>Line Not Flushing</option>
                      <option>DC PICC</option>
                      <option>Place PICC</option>
                      <option>Place Midline</option>
                      <option value="other">Other</option>
                    </select>
                    </div>
                    <div className="vas-modal-add-call-row-inner">
                      <p>Contact Number</p>
                      <DebounceInput
                        className="vas-modal-add-call-input"
                        minLength={1}
                        debounceTimeout={300}
                        onChange={e => {this.setState({contactNumber: e.target.value}, this.validateAddCall)}} />
                    </div>
                  </div>
                </div>
              }
              {this.state.otherSelected &&
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
              { this.state.selectedIds.length &&
                this.state.selectedIds.map((el, i)=>{
                  return <p index={i}>{el}</p>
                })
              }
            </div>
            {this.state.isAddCall && this.state.inputsValidated &&
            <div className="vas-modal-content-buttonContainer">
              <button className="btn btn-danger vas-modal-cancel" onClick={this.props.toggleModal}>Cancel</button>
              <button className="btn btn-success vas-modal-confirm" onClick={()=>{this.setState({isAddCall:false, saveConfirmed:true, otherSelected:false}, this.closeModal)}}>Add To Queue</button>
            </div>
            }
          </div>
        </div>
      </div>
    )
  }
}