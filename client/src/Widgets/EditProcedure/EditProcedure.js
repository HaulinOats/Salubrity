import React, {Component} from 'react';
import './EditProcedure.css';
import Modal from '../../Widgets/Modal/Modal';
import axios from 'axios';
import helpers from '../../helpers';
import {DebounceInput} from 'react-debounce-input';

export default class EditProcedure extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentRecord:null,
      isPostEdit:false,
      insertionLength:'',
      insertionTypeSelected:false,
      proceduresDoneIdArr:null,
      procedureVerified:false,
      modalIsOpen:false,
      modalTitle:'',
      modalMessage:'',
      modalConfirmation:false,
      confirmationType:null
    }
    this.saveCurrentRecord = this.saveCurrentRecord.bind(this);
    this.hospitalChange = this.hospitalChange.bind(this);
    this.resetSection = this.resetSection.bind(this);
    this.toggleConsultation = this.toggleConsultation.bind(this);
    this.changeCustomInput = this.changeCustomInput.bind(this);
    this.selectButton = this.selectButton.bind(this);
    this.checkSiblings = this.checkSiblings.bind(this);
    this.inputLiveUpdate = this.inputLiveUpdate.bind(this);
    this.completeProcedure = this.completeProcedure.bind(this);
    this.updateProcedure = this.updateProcedure.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
    this.saveNewProcedure = this.saveNewProcedure.bind(this);
    this.createProcedureObject = this.createProcedureObject.bind(this);
    this.procedureSaved = this.procedureSaved.bind(this);
    this.deleteCall = this.deleteCall.bind(this);
    this.returnToQueue = this.returnToQueue.bind(this);
    this.getConfirmation = this.getConfirmation.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.resetModal = this.resetModal.bind(this);
    this.orderSelect = this.orderSelect.bind(this);
    this.showHiddenButtons = this.showHiddenButtons.bind(this);
    this.setRecordStateItems = this.setRecordStateItems.bind(this);
  };
  
  componentDidMount(){
    // console.log(this.state);
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      currentRecord:nextProps.activeRecord,
      isPostEdit:nextProps.activeRecord.completedAt ? true : false
    }, ()=>{
      let proceduresDoneIdArr = [];
      this.state.currentRecord.proceduresDone.forEach(procedureArr=>{
        procedureArr.itemIds.forEach(itemId=>{
          proceduresDoneIdArr.push(itemId);
        })
      });
      this.setState({proceduresDoneIdArr}, this.setRecordStateItems)
    })
  }

  //NON-LIFECYCLE METHODS

  addCustomValuesToProceduresArr(proceduresArr){
    for(let i = 0; i < proceduresArr.length; i++){
      //Insertion Procedure
      if(proceduresArr[i].procedureId === 8){
        proceduresArr[i].itemIds.push(70);
        proceduresArr[i].customValues = {
          '70': Number(this.state.insertionLength)
        }
      }
    }
    return proceduresArr;
  }
  
  changeCustomInput(e, fieldName){
    this.setState({[fieldName]:e.target.value});
    this.props.refreshUserSession();
  }

  changeStatus(e){
    let activeRecord = this.state.currentRecord;
    activeRecord.status = e.target.value;
    this.setState({activeRecord}, this.saveCurrentRecord);
  }

  checkSiblings(e){
    let groupContainer = e.target.closest('.vas-edit-procedure-inner-span');
    while(groupContainer.nextSibling){
      let nextSib =  groupContainer.nextSibling.querySelector('.vas-edit-procedure-select-input');
      if(nextSib){
        //if next id is a 
        //55 = PAC:Initiated (Port-A-Cath), 57 = Patient Refused (Insertion Procedure)
        if(nextSib.id === '55' || nextSib.id === '57'){
          nextSib.checked = false;
        } else {
          nextSib.checked = true;
        }
      }
      groupContainer = groupContainer.nextSibling;
    }
  }

  closeModal(callData){
    if(callData){
      this.setState({
        modalTitle:'Call Was Added',
        modalMessage:'Your call was added to the queue!'
      }, ()=>{
        setTimeout(()=>{
          this.resetModal();
        }, 2000);
      });
    } else {
      this.resetModal();
    }
  }

  completeProcedure(){
    if(this.state.currentRecord.completedAt){
      this.updateProcedure();
    } else {
      this.saveNewProcedure();
    }
    this.props.refreshUserSession();
  }

  createProcedureObject(){
    let procedureObj = {};
    let selectedTasks = document.querySelectorAll('.vas-edit-procedure-select-input:checked');
    selectedTasks.forEach((el)=>{
      let itemId = Number(el.id);
      let procedureId = Number(el.getAttribute('data-procedureid'));
      if(!procedureObj.hasOwnProperty(procedureId)){
        procedureObj[procedureId] = []
      }
      procedureObj[procedureId].push(itemId);
    });

    let procedureArr = [];
    let procedureObjKeys = Object.keys(procedureObj);
    for(let key of procedureObjKeys){
      procedureArr.push({
        procedureId:Number(key),
        itemIds:procedureObj[key]
      })
    }

    return procedureArr
  }

  deleteCall(){
    this.setState({
      modalTitle:'Delete Active Record?',
      modalMessage:'Are you sure you want to delete the currently active record?',
      modalIsOpen:true,
      modalConfirmation:true,
      confirmationType:'delete-call'
    });
    this.props.refreshUserSession();
  }

  getConfirmation(isConfirmed){
    if(isConfirmed){
      if(this.state.confirmationType){
        if(this.state.confirmationType === 'delete-call'){
          axios.post('/delete-call', {
            _id:this.state.currentRecord._id
          })
          .then(resp=>{
            if(resp.data){
              this.props.closeRecordCallback('delete');
            }
          })
          .catch(err=>{
            console.log(err);
          })
        }
        if(this.state.confirmationType === 'reset-page'){
          window.location.reload();
        }
      }
    }
    this.props.refreshUserSession();
  }

  hospitalChange(e){
    let currentRecord = this.state.currentRecord;
    if(e.target.value !== ''){
      currentRecord.hospital = Number(e.target.value);
    } else {
      currentRecord.hospital = null;
    }
    this.setState({currentRecord}, this.saveCurrentRecord);
  }

  inputLiveUpdate(e, field){
    let targetValue = e.target.value;
    let currentRecord = this.state.currentRecord;

    if(e.target.type === 'number'){
      currentRecord[field] = Number(targetValue);
    } else {
      currentRecord[field] = targetValue;
    }

    if(targetValue.length < 1){
      currentRecord[field] = null;
    }
    this.setState({currentRecord}, this.saveCurrentRecord);
  }

  orderSelect(e){
    let currentRecord = this.state.currentRecord;
    if(e.target.value === ''){
      currentRecord.orderChange = null;
    } else {
      currentRecord.orderChange = Number(e.target.value);
    }
    this.setState({currentRecord}, this.saveCurrentRecord);
  }

  procedureSaved(isEdit){
    this.setState({
      activeRecord:null,
      modalTitle: isEdit ? 'Procedure Updated' : 'Task Complete',
      modalMessage: isEdit ? 'Procedure was updated. Returning to queue.' : 'Procedure was completed. Returning to queue.',
      modalIsOpen:true
    }, ()=>{
      setTimeout(()=>{
        this.props.closeRecordCallback();
      }, 2000);
    });
  }

  procedureVerified(proceduresList){
    let errors = '';
    if(!proceduresList.length){
      errors += '- You must select at least 1 procedure or confirm consultation\n';
    }

    if(this.state.insertionTypeSelected){
      if(!this.state.insertionLength.length || this.state.insertionLength === '0'){
        errors += '- You must enter an insertion length (cannot be 0)\n';
      }
      if(!this.state.currentRecord.hospital || this.state.currentRecord.hospital < 1){
        errors += '- You must select a hospital\n';
      }
      if(!this.state.currentRecord.mrn || String(this.state.currentRecord.mrn).length < 5 || String(this.state.currentRecord.mrn).length > 7){
        errors += '- Medical Record Number must be between 5 and 7 digits\n';
      }
      if(!this.state.currentRecord.provider || !this.state.currentRecord.provider.length){
        errors += '- You must enter a provider name\n';
      }
    }
    
    if(!this.state.currentRecord.room || !this.state.currentRecord.room.length){
      errors += '- Room number field cannot be empty\n';
    }
    
    if(errors.length && !this.state.currentRecord.wasConsultation){
      this.setState({
        modalIsOpen:true, 
        modalTitle:'Cannot Submit Procedure',
        modalMessage:errors
      });
      return false;
    }
    return true;
  }

  resetForm(){
    this.setState({
      modalTitle:'Reset Form?',
      modalMessage:'Are you sure you want to reset the current form? Will cause an app/page reload.',
      modalIsOpen:true,
      modalConfirmation:true,
      confirmationType:'reset-page'
    });
  }

  resetModal(){
    this.setState({
      modalIsOpen:false,
      modalMessage:'',
      modalTitle:'',
      modalConfirmation:false,
      confirmationType:null
    });
  }
  
  resetSection(e){
    let isInsertionProcedure = false;
    let sectionInputs = e.target.closest('.vas-edit-procedure-inner-container').querySelectorAll('input');
    sectionInputs.forEach(el=>{
      if(el.type === 'checkbox' || el.type === 'radio'){
        el.checked = false;
      }
      if(el.type === 'number' || el.type === 'text'){
        el.value = '';
      }
      if(!isInsertionProcedure && el.getAttribute('data-procedureid') === '8'){
        isInsertionProcedure = true;
      }
    });
    if(isInsertionProcedure){
      document.querySelectorAll('.vas-edit-procedure-inner-span[data-procedureid="8"]').forEach((el, idx)=>{
        if(idx > 1){
          el.style.display = 'none';
        }
      });
      this.setState({
        insertionTypeSelected:false,
        insertionLength:''
      });
    }
  
    this.saveCurrentRecord();
    this.props.refreshUserSession();
  }

  returnToQueue(){
    axios.post('/set-call-as-unopen', {
      _id:this.state.currentRecord._id
    })
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.props.closeRecordCallback();
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    this.props.refreshUserSession();
  }

  saveCurrentRecord(){
    axios.post('/save-call', this.state.currentRecord)
    .then(resp=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        console.log('active call saved');
      }
    })
    .catch(err=>{
      console.log(err);
    })
    this.props.refreshUserSession();
  }

  saveNewProcedure(){
    let proceduresArr = this.createProcedureObject();
    if(this.procedureVerified(proceduresArr)){
      proceduresArr = this.addCustomValuesToProceduresArr(proceduresArr);

      let completionTime = new Date();
      let callTime = helpers.getDateFromObjectId(this.state.currentRecord._id);
      let startTime = new Date(this.state.currentRecord.startTime);

      axios.post('/procedure-completed', {
        _id:this.state.currentRecord._id,
        proceduresDone:proceduresArr,
        completedBy:Number(this.props.currentUser.userId),
        completedAt:completionTime.toISOString(),
        procedureTime:completionTime - startTime,
        responseTime:startTime - callTime
      })
      .then(resp=>{
        if(resp.data.error || resp.data._message){
          console.log(resp.data);
        } else {
          this.procedureSaved(false);
        }
      })
      .catch((err)=>{
        console.log(err);
      })
    }
  }

  selectButton(e, groupId){
    console.log('groupId: ', groupId);
    if(Number(groupId) === 11){//What
      this.checkSiblings(e);
    }
    if(Number(groupId) === 15){//Insertion Type
      this.setState({insertionTypeSelected:true});
      document.querySelectorAll('.vas-edit-procedure-inner-span[data-procedure="8"]').forEach((el)=>{
        el.style.display = 'inline';
      })
      this.checkSiblings(e);
    }
    this.props.refreshUserSession();
  }

  setRecordStateItems(){
    let stateObj = {};
    //check which procedure items should updated state
    if(this.state.currentRecord.proceduresDone.length){
      console.log(this.state.currentRecord.proceduresDone)
      this.state.currentRecord.proceduresDone.forEach(procedureArr=>{
        procedureArr.itemIds.forEach(itemId=>{
          switch(this.props.itemsById[itemId].groupId){
            case 18://Insertion Length
              stateObj.insertionTypeSelected = true;
              break;
            default:
          }
        });

        //find and set custom values, if they exist
        if(procedureArr.hasOwnProperty('customValues')){
          stateObj.insertionLength = String(procedureArr.customValues['70']);
        }
      });
    }
    this.setState(stateObj);
  }

  showHiddenButtons(procedureId, groupId, elClass){
    let className = `.vas-edit-procedure-${procedureId}-${groupId}`;
    let container = document.querySelector(className);
    if(container.classList.contains(elClass)){
      container.classList.remove(elClass);
      let containerInputs = document.querySelectorAll(`${className} input`);
      containerInputs.forEach((el)=>{
        el.checked = false;
      });
    } else {
      container.classList.add(elClass)
    }
  }

  toggleConsultation(){
    let currentRecord = this.state.currentRecord;
    currentRecord.wasConsultation = !currentRecord.wasConsultation;
    this.setState({currentRecord}, this.saveCurrentRecord);
  }

  updateProcedure(){
    let proceduresArr = this.createProcedureObject();
    if(this.procedureVerified(proceduresArr)){
      let updatedRecord = this.state.currentRecord;
      updatedRecord.proceduresDone = this.addCustomValuesToProceduresArr(proceduresArr);
      this.setState({currentRecord:updatedRecord}, ()=>{
        this.saveCurrentRecord();
        this.procedureSaved(true);
      });
    }
  }

  render(){
    return(
      <div className={'vas-edit-procedure-page-record-container ' + (this.state.isPostEdit ? 'vas-edit-procedure-is-post-edit' : '')}>
        {this.state.currentRecord &&
        <span>
        <header className={"vas-edit-procedure-record-header vas-status-" + this.state.currentRecord.status}>
          {this.state.isPostEdit &&
            <h2 className='vas-edit-procedure-edit-title'>POST PROCEDURE EDIT</h2>
          }
          <p className="vas-edit-procedure-record-header-text">
            <b className="vas-edit-procedure-live-edit-input vas-edit-procedure-job-input vas-block">{this.state.currentRecord.job}</b>
            <DebounceInput
              type="text"
              className="vas-edit-procedure-live-edit-input vas-edit-procedure-custom-job-input vas-inline-block"
              debounceTimeout={750}
              value={this.state.currentRecord.customJob ? this.state.currentRecord.customJob : ''}
              onChange={e=>{this.inputLiveUpdate(e, 'customJob')}} />
          </p>
          <p className="vas-edit-procedure-record-header-subtext vas-pointer">
            <b className='vas-edit-procedure-room-text'>Room:</b>
            <DebounceInput
                className="vas-edit-procedure-live-edit-input vas-edit-procedure-live-edit-input-room vas-inline-block vas-uppercase"
                type="text"
                debounceTimeout={750}
                value={this.state.currentRecord.room ? this.state.currentRecord.room : ''}
                onChange={e=>{this.inputLiveUpdate(e, 'room')}} />
          </p>
          <div className='vas-edit-procedure-status-container'>
            <p className='vas-edit-procedure-status-text'>Status:</p>
            <select className='vas-select' value={this.state.currentRecord.status} onChange={this.changeStatus}>
              {this.props.allOptions[6].options.map(option=>{
                return <option key={option.id} value={option.id}>{option.name}</option>
              })}
            </select>
          </div>
          {this.props.usersById && this.props.usersById[this.state.currentRecord.completedBy] &&
            <div className='vas-edit-procedure-completed-by-container'>
              <p><b>Completed By: </b>{this.props.usersById[this.state.currentRecord.completedBy].fullname}</p>
            </div>
          }
          {!this.state.isPostEdit &&
            <span>
              <button className="vas-edit-procedure-record-header-btn" onClick={this.resetForm}>Reset Form</button>
              <button className="vas-edit-procedure-record-header-btn" onClick={this.returnToQueue}>Return To Queue</button>
            </span>
          }
          {this.state.isPostEdit &&
            <button className="vas-edit-procedure-record-header-btn" onClick={this.resetForm}>Cancel Editing</button>
          }
          <button className='vas-edit-procedure-record-header-btn vas-warn-btn' onClick={this.deleteCall}>Delete Call</button>
        </header>
        <div className="vas-edit-procedure-inner-container vas-edit-procedure-inner-container-main-comment">
          <header className="vas-edit-procedure-inner-container-header">
            <p>Pre-Procedure Notes</p>
          </header>
          <div className="vas-edit-procedure-inner-container-main">
            <div className="vas-edit-procedure-inner-container-row">
              <DebounceInput element='textarea' className='vas-edit-procedure-add-comments' debounceTimeout={750} value={this.state.currentRecord.preComments ? this.state.currentRecord.preComments : ''} onChange={e=>{this.inputLiveUpdate(e, 'preComments')}}/>
            </div>
          </div>
        </div>
        {this.state.proceduresDoneIdArr && this.props.referenceObj && this.props.procedures.map((procedure, idx)=>{
            return (
              <div className="vas-edit-procedure-inner-container" key={procedure._id}>
                <header className="vas-edit-procedure-inner-container-header">
                  <p>{this.props.referenceObj.procedures[procedure.procedureId].name}</p>
                  <button className='vas-edit-procedure-reset-buttons' onClick={this.resetSection}>Reset</button>
                </header>
                <div className="vas-edit-procedure-inner-container-main">
                  {procedure.groups.map((group, idx2)=>{
                    return(
                      <span className='vas-edit-procedure-inner-span' data-procedure={procedure.procedureId} data-idx={idx2} key={idx + group.groupId}>
                        {/* Cathflow: groupId = 14 */}
                        {group.groupId === '14' &&
                          <button className='vas-edit-procedure-cathflow-btn' onClick={e=>{this.showHiddenButtons(procedure.procedureId, group.groupId, 'vas-edit-procedure-important-hide')}}>{this.props.referenceObj.groups[group.groupId].name}</button>
                        }
                        {!group.hideHeader &&
                          <h3>{this.props.referenceObj.groups[group.groupId].name}</h3>
                        }
                        {/* Cathflow: groupId = 14 */}
                        <div className={'vas-edit-procedure-inner-container-row ' + (group.groupId === '14' && !this.state.isPostEdit ? 'vas-edit-procedure-important-hide vas-edit-procedure-' + procedure.procedureId + '-' + group.groupId : '')}>
                          {group.groupItems.map((itemId)=>{
                              let customInput = (group.inputType === 'number' || group.inputType === 'text') ? true : false;
                              return(
                                <span key={itemId}>
                                  {!customInput &&
                                    <span>
                                      <input 
                                        type={group.inputType} 
                                        className={"vas-edit-procedure-select-input vas-"+ group.inputType +"-select"} 
                                        data-procedureid={procedure.procedureId} id={itemId} 
                                        name={procedure.procedureId + "_" + group.groupId}
                                        defaultChecked={this.state.proceduresDoneIdArr.indexOf(itemId) > -1 ? true : false}/>
                                      <label className="vas-btn" htmlFor={itemId} onClick={e=>{this.selectButton(e, group.groupId)}}>{this.props.itemsById[itemId].value}</label>
                                    </span>
                                  }
                                  {customInput &&
                                    <span>
                                      <input 
                                        type={group.inputType} 
                                        className={"vas-custom-input vas-"+ group.inputType +"-select"} 
                                        onChange={e=>{this.changeCustomInput(e, group.fieldName)}} 
                                        data-procedureid={procedure.procedureId} 
                                        placeholder={this.props.itemsById[itemId].value}
                                        value={this.state.insertionLength}
                                        id={itemId} />
                                    </span>
                                  }
                                </span>
                              )
                            })
                          }
                        </div>
                      </span>
                    )})
                  }
                  </div>
              </div>
            )
          })
        }
        {(this.state.insertionTypeSelected || this.state.isPostEdit) &&
          <div className='vas-edit-procedure-options-container'>
            <div className='vas-edit-procedure-option-inner'>
              <label>{this.props.allOptions[1].name}:</label>{/* Medical Record Number */}
              <DebounceInput className='vas-custom-input' debounceTimeout={750} type='number' value={this.state.currentRecord.mrn ? this.state.currentRecord.mrn : ''} onChange={e=>{this.inputLiveUpdate(e, 'mrn')}} />
            </div>
            <div className='vas-edit-procedure-option-inner'>
              <label>{this.props.allOptions[2].name}:</label>{/* Provider */}
              <DebounceInput className='vas-custom-input' debounceTimeout={750} type="text" value={this.state.currentRecord.provider ? this.state.currentRecord.provider : ''} onChange={e=>{this.inputLiveUpdate(e, 'provider')}} />
            </div>
          </div>
        }
        <div className='vas-edit-procedure-inner-container'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>Hospital</p>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <select className='vas-select' value={this.state.currentRecord.hospital ? this.state.currentRecord.hospital : ''} onChange={this.hospitalChange}>
              <option value=''>Select A Hospital</option>
              {this.props.allOptions[0] && this.props.allOptions[0].options.map((subOption, idx2)=>{
                return <option key={subOption.id} value={subOption.id}>{subOption.name}</option>
              })}
            </select>
          </div>
        </div>
        <div className='vas-edit-procedure-inner-container vas-edit-procedure-order-change'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>MD Order Change</p>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <select className='vas-select' value={this.state.currentRecord.orderChange ? this.state.currentRecord.orderChange : ''} onChange={this.orderSelect}>
              <option value=''>Select An Order Change</option>
              {this.props.allOptions[3].options.map((option, idx)=>{
                return <option key={option.id} value={option.id}>{option.name}</option>
              })}
            </select>
          </div>
        </div>
        <div className='vas-edit-procedure-inner-container vas-edit-procedure-order-change'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>Consultation</p>
            <button className='vas-edit-procedure-reset-buttons' onClick={this.resetSection}>Reset</button>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <input type='checkbox' className="vas-radio-select vas-edit-procedure-consultation-input" id='consultation' defaultChecked={this.state.currentRecord.wasConsultation} onChange={this.toggleConsultation} name='consultation'/>
            <label className="vas-btn" htmlFor='consultation'>Consultation Done</label>
          </div>
        </div>
        <div className='vas-edit-procedure-inner-container'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>Additional Comments</p>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <DebounceInput element='textarea' className='vas-edit-procedure-add-comments' debounceTimeout={750} value={this.state.currentRecord.addComments ? this.state.currentRecord.addComments : ''} onChange={e=>{this.inputLiveUpdate(e, 'addComments')}}/>
          </div>
        </div>
        <div className="vas-edit-procedure-inner-container vas-edit-procedure-inner-container-final">
          <header className="vas-edit-procedure-inner-container-header vas-edit-procedure-inner-container-final-header">
            <p>Submit Procedure</p>
          </header>
          <div className='vas-edit-procedure-final-container'>
            <div>
              <button className='vas-button vas-edit-procedure-complete-procedure-btn' onClick={this.completeProcedure}>{this.state.isPostEdit ? 'Save Record' : 'Submit Procedure'}</button>
            </div>
          </div>
        </div>  
      </span>}
      {this.state.modalIsOpen && 
        <Modal 
          isConfirmation={this.state.modalConfirmation}
          currentUser={this.state.currentUser}
          getConfirmation={this.getConfirmation}
          closeModal={this.closeModal}
          modalTitle={this.state.modalTitle} 
          modalMessage={this.state.modalMessage}
          toggleModal={this.toggleHandler}/>
      }
      </div>
    )
  }
}