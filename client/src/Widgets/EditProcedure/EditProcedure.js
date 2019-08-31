import React, {Component} from 'react';
import './EditProcedure.css';
import {DebounceInput} from 'react-debounce-input';

export default class Modal extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeRecord:this.props.activeRecord,
      allOptions:this.props.allOptions,
      procedures:this.props.procedures,
      itemsById:this.props.itemsById
    }
  };

  render(){
    return(
      <div className='vas-edit-procedure-page-record-container'>
        <header className={"vas-edit-procedure-record-header vas-status-" + this.state.activeRecord.status}>
          <p className="vas-edit-procedure-record-header-text">
            <b className="vas-edit-procedure-live-edit-input vas-edit-procedure-job-input vas-block">{this.state.activeRecord.job}</b>
            <DebounceInput
              type="text"
              className="vas-edit-procedure-live-edit-input vas-edit-procedure-custom-job-input vas-inline-block"
              debounceTimeout={750}
              value={this.state.activeRecord.customJob ? this.state.activeRecord.customJob : ''}
              onChange={e=>{this.props.inputLiveUpdate(e, 'customJob')}} />
          </p>
          <p className="vas-edit-procedure-record-header-subtext vas-pointer">
            <b className='vas-edit-procedure-room-text'>Room:</b>
            <DebounceInput
                className="vas-edit-procedure-live-edit-input vas-edit-procedure-live-edit-input-room vas-inline-block vas-uppercase"
                type="text"
                debounceTimeout={750}
                value={this.state.activeRecord.room ? this.state.activeRecord.room : ''}
                onChange={e=>{this.props.inputLiveUpdate(e, 'room')}} />
          </p>
          <div className='vas-edit-procedure-status-container'>
            <p className='vas-edit-procedure-status-text'>Status:</p>
            <select className='vas-select' value={this.state.activeRecord.status} onChange={e=>{this.props.changeStatus(e)}}>
              {this.state.allOptions[6].options.map(option=>{
                return <option key={option.id} value={option.id}>{option.name}</option>
              })}
            </select>
          </div>
          <button className="vas-edit-procedure-record-header-btn" onClick={e=>{this.props.resetForm()}}>Reset Form</button>
          <button className="vas-edit-procedure-record-header-btn" onClick={e=>{this.props.returnToQueue()}}>Return To Queue</button>
          <button className='vas-edit-procedure-record-header-btn vas-warn-btn' onClick={e=>{this.props.deleteCall()}}>Delete Call</button>
        </header>
        {this.state.activeRecord.preComments &&
          <div className="vas-edit-procedure-inner-container vas-edit-procedure-inner-container-main-comment">
            <header className="vas-edit-procedure-inner-container-header">
              <p>Pre-Procedure Notes</p>
            </header>
            <div className="vas-edit-procedure-inner-container-main">
              <div className="vas-edit-procedure-inner-container-row">
                <p className='vas-edit-procedure-comment'>{this.state.activeRecord.preComments}</p>
              </div>
            </div>
          </div>
        }
        {this.state.procedures.map((procedure, idx)=>{
            return (
              <div className="vas-edit-procedure-inner-container" key={procedure._id}>
                <header className="vas-edit-procedure-inner-container-header">
                  <p>{procedure.name}</p>
                  <button className='vas-edit-procedure-reset-buttons' onClick={e=>{this.props.resetSection(e)}}>Reset</button>
                </header>
                <div className="vas-edit-procedure-inner-container-main">
                  {procedure.groups.map((group, idx2)=>{
                    return(
                      <span className='vas-edit-procedure-inner-span' data-procedure={procedure.name.replace(/\s+/g, '')} data-idx={idx2} key={idx+group.groupName}>
                        {group.groupName === 'Cathflow' &&
                          <button className='vas-edit-procedure-cathflow-btn' onClick={e=>{this.props.showHiddenButtons(procedure.name.replace(/\s+/g, ''), group.groupName.replace(/\s+/g, ''), 'vas-edit-procedure-important-hide')}}>{group.groupName}</button>
                        }
                        {!group.hideHeader &&
                          <h3>{group.groupName}</h3>
                        }
                        <div className={'vas-edit-procedure-inner-container-row ' + (group.groupName === 'Cathflow' ? 'vas-edit-procedure-important-hide vas-edit-procedure-' + procedure.name.replace(/\s+/g, '') + '-' + group.groupName.replace(/\s+/g, '')  : '')}>
                          {group.groupItems.map((itemId)=>{
                              let customInput = (group.inputType === 'number' || group.inputType === 'text') ? true : false;
                              return(
                                <span key={itemId}>
                                  {!customInput &&
                                    <span>
                                      <input type={group.inputType} className={"vas-edit-procedure-select-input vas-"+ group.inputType +"-select"} data-procedureid={procedure.procedureId} id={itemId} name={procedure.name.replace(/\s+/g, '') +"_"+ group.groupName.replace(/\s+/g, '')}/>
                                      <label className="vas-btn" htmlFor={itemId} onClick={e=>{this.props.selectButton(e, procedure.name, group.groupName, group.resetSiblings)}}>{this.state.itemsById[itemId].value}</label>
                                    </span>
                                  }
                                  {customInput &&
                                    <span>
                                      <input type={group.inputType} onChange={e=>{this.props.changeCustomInput(e, group.fieldName)}} data-procedureid={procedure.procedureId} placeholder={this.state.itemsById[itemId].value} className={"vas-custom-input vas-"+ group.inputType +"-select"} id={itemId} />
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
        {this.props.insertionTypeSelected &&
          <div className='vas-edit-procedure-options-container'>
            <div className='vas-edit-procedure-option-inner'>
              <label>{this.state.allOptions[1].name}:</label>{/* Medical Record Number */}
              <DebounceInput className='vas-custom-input' debounceTimeout={750} type='number' value={this.state.activeRecord.mrn ? this.state.activeRecord.mrn : ''} onChange={e=>{this.props.inputLiveUpdate(e, 'mrn')}} />
            </div>
            <div className='vas-edit-procedure-option-inner'>
              <label>{this.state.allOptions[2].name}:</label>{/* Provider */}
              <DebounceInput className='vas-custom-input' debounceTimeout={750} type="text" value={this.state.activeRecord.provider ? this.state.activeRecord.provider : ''} onChange={e=>{this.props.inputLiveUpdate(e, 'provider')}} />
            </div>
          </div>
        }
        <div className='vas-edit-procedure-inner-container'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>Hospital</p>
            <button className='vas-edit-procedure-reset-buttons' onClick={e=>{this.props.resetSection(e, 'orderChange')}}>Reset</button>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <select className='vas-select' value={this.state.activeRecord.hospital ? this.state.activeRecord.hospital : ''} onChange={e=>{this.props.hospitalChange(e)}}>
              <option value=''>Select A Hospital</option>
              {this.state.allOptions[0] && this.state.allOptions[0].options.map((subOption, idx2)=>{
                return <option key={subOption.id} value={subOption.id}>{subOption.name}</option>
              })}
            </select>
          </div>
        </div>
        <div className='vas-edit-procedure-inner-container vas-edit-procedure-order-change'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>MD Order Change</p>
            <button className='vas-edit-procedure-reset-buttons' onClick={e=>{this.props.resetSection(e, 'orderChange')}}>Reset</button>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <input type='radio' className="vas-radio-select" id='order-change' name='order-change'/>
            <label className="vas-btn" htmlFor='order-change' onClick={e=>{this.setState({orderChanged:true}, this.props.setOrderChanged)}}>Order Was Changed</label>
            {this.state.orderChanged &&
              <select className='vas-select' value={this.state.orderSelected} onChange={e=>{this.props.orderSelect(e)}}>
                <option value="default">Select An Order</option>
                {this.state.allOptions[3].options.map((option, idx)=>{
                  return <option key={option.id} value={option.id}>{option.name}</option>
                })}
              </select>
            }
          </div>
        </div>
        <div className='vas-edit-procedure-inner-container vas-edit-procedure-order-change'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>Consultation</p>
            <button className='vas-edit-procedure-reset-buttons' onClick={e=>{this.props.resetSection(e, 'consultation')}}>Reset</button>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <input type='radio' className="vas-radio-select vas-edit-procedure-consultation-input" id='consultation' name='consultation'/>
            <label className="vas-btn" htmlFor='consultation' onClick={e=>{this.props.setConsultation()}}>Consultation Done</label>
          </div>
        </div>
        <div className='vas-edit-procedure-inner-container'>
          <header className='vas-edit-procedure-inner-container-header'>
            <p>Additional Comments</p>
          </header>
          <div className='vas-edit-procedure-inner-container-main'>
            <DebounceInput element='textarea' className='vas-edit-procedure-add-comments' debounceTimeout={750} value={this.state.activeRecord.addComments ? this.state.activeRecord.addComments : ''} onChange={e=>{this.props.inputLiveUpdate(e, 'addComments')}}/>
          </div>
        </div>
        <div className="vas-edit-procedure-inner-container vas-edit-procedure-inner-container-final">
          <header className="vas-edit-procedure-inner-container-header vas-edit-procedure-inner-container-final-header">
            <p>Complete Task</p>
          </header>
          <div className='vas-edit-procedure-final-container'>
            <div>
              <button className='vas-button vas-edit-procedure-complete-procedure-btn' onClick={this.props.completeProcedure}>Submit Procedure</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}