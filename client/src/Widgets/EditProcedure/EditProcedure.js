import React, {Component} from 'react';
import './EditProcedure.css';
import {DebounceInput} from 'react-debounce-input';

export default class Modal extends Component {
  constructor(props){
    super(props);
    this.state = {
      proceduresDoneIdArr:null
    }
  };

  componentWillMount(){
    let proceduresDoneIdArr = [];
    this.props.currentRecord.proceduresDone.forEach(procedureArr=>{
      procedureArr.itemIds.forEach(itemId=>{
        proceduresDoneIdArr.push(itemId);
      })
    });
    this.setState({
      proceduresDoneIdArr
    });
  }

  componentDidMount(){
    console.log(this.props);
  }

  render(){
    return(
      <div className={'vas-edit-procedure-page-record-container ' + (this.props.isPostEdit ? 'vas-edit-procedure-is-post-edit' : '')}>
        <header className={"vas-edit-procedure-record-header vas-status-" + this.props.currentRecord.status}>
          {this.props.isPostEdit &&
            <h2 className='vas-edit-procedure-edit-title'>POST PROCEDURE EDIT</h2>
          }
          <p className="vas-edit-procedure-record-header-text">
            <b className="vas-edit-procedure-live-edit-input vas-edit-procedure-job-input vas-block">{this.props.currentRecord.job}</b>
            <DebounceInput
              type="text"
              className="vas-edit-procedure-live-edit-input vas-edit-procedure-custom-job-input vas-inline-block"
              debounceTimeout={750}
              value={this.props.currentRecord.customJob ? this.props.currentRecord.customJob : ''}
              onChange={e=>{this.props.inputLiveUpdate(e, 'customJob')}} />
          </p>
          <p className="vas-edit-procedure-record-header-subtext vas-pointer">
            <b className='vas-edit-procedure-room-text'>Room:</b>
            <DebounceInput
                className="vas-edit-procedure-live-edit-input vas-edit-procedure-live-edit-input-room vas-inline-block vas-uppercase"
                type="text"
                debounceTimeout={750}
                value={this.props.currentRecord.room ? this.props.currentRecord.room : ''}
                onChange={e=>{this.props.inputLiveUpdate(e, 'room')}} />
          </p>
          <div className='vas-edit-procedure-status-container'>
            <p className='vas-edit-procedure-status-text'>Status:</p>
            <select className='vas-select' value={this.props.currentRecord.status} onChange={e=>{this.props.changeStatus(e)}}>
              {this.props.allOptions[6].options.map(option=>{
                return <option key={option.id} value={option.id}>{option.name}</option>
              })}
            </select>
          </div>
          {this.props.usersById && this.props.usersById[this.props.currentRecord.completedBy] &&
            <div className='vas-edit-procedure-completed-by-container'>
              <p><b>Completed By: </b>{this.props.usersById[this.props.currentRecord.completedBy].fullname}</p>
            </div>
          }
          {!this.props.isPostEdit &&
            <span>
              <button className="vas-edit-procedure-record-header-btn" onClick={e=>{this.props.resetForm()}}>Reset Form</button>
              <button className="vas-edit-procedure-record-header-btn" onClick={e=>{this.props.returnToQueue()}}>Return To Queue</button>
            </span>
          }
          {this.props.isPostEdit &&
            <button className="vas-edit-procedure-record-header-btn" onClick={e=>{this.props.resetForm()}}>Cancel Editing</button>
          }
          <button className='vas-edit-procedure-record-header-btn vas-warn-btn' onClick={e=>{this.props.deleteCall()}}>Delete Call</button>
        </header>
        <div className="vas-edit-procedure-inner-container vas-edit-procedure-inner-container-main-comment">
          <header className="vas-edit-procedure-inner-container-header">
            <p>Pre-Procedure Notes</p>
          </header>
          <div className="vas-edit-procedure-inner-container-main">
            <div className="vas-edit-procedure-inner-container-row">
              <DebounceInput element='textarea' className='vas-edit-procedure-add-comments' debounceTimeout={750} value={this.props.currentRecord.preComments ? this.props.currentRecord.preComments : ''} onChange={e=>{this.props.inputLiveUpdate(e, 'preComments')}}/>
            </div>
          </div>
        </div>
        {this.state.proceduresDoneIdArr && this.props.referenceObj && this.props.procedures.map((procedure, idx)=>{
            return (
              <div className="vas-edit-procedure-inner-container" key={procedure._id}>
                <header className="vas-edit-procedure-inner-container-header">
                  <p>{this.props.referenceObj.procedures[procedure.procedureId].name}</p>
                  <button className='vas-edit-procedure-reset-buttons' onClick={e=>{this.props.resetSection(e)}}>Reset</button>
                </header>
                <div className="vas-edit-procedure-inner-container-main">
                  {procedure.groups.map((group, idx2)=>{
                    return(
                      <span className='vas-edit-procedure-inner-span' data-procedure={procedure.procedureId} data-idx={idx2} key={idx + group.groupId}>
                        {/* Cathflow: groupId = 14 */}
                        {group.groupId === '14' &&
                          <button className='vas-edit-procedure-cathflow-btn' onClick={e=>{this.props.showHiddenButtons(procedure.procedureId, group.groupId, 'vas-edit-procedure-important-hide')}}>{this.props.referenceObj.groups[group.groupId].name}</button>
                        }
                        {!group.hideHeader &&
                          <h3>{this.props.referenceObj.groups[group.groupId].name}</h3>
                        }
                        {/* Cathflow: groupId = 14 */}
                        <div className={'vas-edit-procedure-inner-container-row ' + (group.groupId === '14' && !this.props.isPostEdit ? 'vas-edit-procedure-important-hide vas-edit-procedure-' + procedure.procedureId + '-' + group.groupId : '')}>
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
                                      <label className="vas-btn" htmlFor={itemId} onClick={e=>{this.props.selectButton(e, group.groupId, group.resetSiblings)}}>{this.props.itemsById[itemId].value}</label>
                                    </span>
                                  }
                                  {customInput &&
                                    <span>
                                      <input 
                                        type={group.inputType} 
                                        className={"vas-custom-input vas-"+ group.inputType +"-select"} 
                                        onChange={e=>{this.props.changeCustomInput(e, group.fieldName)}} 
                                        data-procedureid={procedure.procedureId} 
                                        placeholder={this.props.itemsById[itemId].value}
                                        value={this.props.insertionLength}
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
        {(this.props.insertionTypeSelected || this.props.isPostEdit) &&
          <div className='vas-edit-procedure-options-container'>
            <div className='vas-edit-procedure-option-inner'>
              <label>{this.props.allOptions[1].name}:</label>{/* Medical Record Number */}
              <DebounceInput className='vas-custom-input' debounceTimeout={750} type='number' value={this.props.currentRecord.mrn ? this.props.currentRecord.mrn : ''} onChange={e=>{this.props.inputLiveUpdate(e, 'mrn')}} />
            </div>
            <div className='vas-edit-procedure-option-inner'>
              <label>{this.props.allOptions[2].name}:</label>{/* Provider */}
              <DebounceInput className='vas-custom-input' debounceTimeout={750} type="text" value={this.props.currentRecord.provider ? this.props.currentRecord.provider : ''} onChange={e=>{this.props.inputLiveUpdate(e, 'provider')}} />
            </div>
          </div>
        }
        <div className='vas-edit-procedure-inner-container'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>Hospital</p>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <select className='vas-select' value={this.props.currentRecord.hospital ? this.props.currentRecord.hospital : ''} onChange={e=>{this.props.hospitalChange(e)}}>
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
            <select className='vas-select' value={this.props.currentRecord.orderChange ? this.props.currentRecord.orderChange : ''} onChange={this.props.orderSelect}>
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
            <button className='vas-edit-procedure-reset-buttons' onClick={e=>{this.props.resetSection(e, 'consultation')}}>Reset</button>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <input type='checkbox' className="vas-radio-select vas-edit-procedure-consultation-input" id='consultation' defaultChecked={this.props.currentRecord.wasConsultation} onChange={this.props.toggleConsultation} name='consultation'/>
            <label className="vas-btn" htmlFor='consultation'>Consultation Done</label>
          </div>
        </div>
        <div className='vas-edit-procedure-inner-container'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>Additional Comments</p>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <DebounceInput element='textarea' className='vas-edit-procedure-add-comments' debounceTimeout={750} value={this.props.currentRecord.addComments ? this.props.currentRecord.addComments : ''} onChange={e=>{this.props.inputLiveUpdate(e, 'addComments')}}/>
          </div>
        </div>
        <div className="vas-edit-procedure-inner-container vas-edit-procedure-inner-container-final">
          <header className="vas-edit-procedure-inner-container-header vas-edit-procedure-inner-container-final-header">
            <p>Submit Procedure</p>
          </header>
          <div className='vas-edit-procedure-final-container'>
            <div>
              <button className='vas-button vas-edit-procedure-complete-procedure-btn' onClick={this.props.completeProcedure}>{this.props.isPostEdit ? 'Save Record' : 'Submit Procedure'}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}