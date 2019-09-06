import React, {Component} from 'react';
import './ReturnedProcedures.css';
import Moment from 'react-moment';

export default class ReturnedProcedures extends Component {
  constructor(props){
    super(props);
    this.state = {

    }
  };

  componentWillMount(){

  }

  componentDidMount(){
    console.log(this.props);
  }

  render(){
    return(
    <div className="vas-home-table vas-table">
      <div className='vas-table-thead-row vas-home-completed-thead'>
        <button className='vas-btn-normal vas-home-reverse-sort-btn' onClick={this.props.reverseCompletedSort}>Reverse Sort</button>
      </div>
      <div className='vas-home-table-body'>
        {this.props.queriedProcedures.length < 1 &&
          <div><p className='vas-queue-no-items'>There are no completed items yet for today</p></div>
        }
        {this.props.queriedProcedures.length > 0 && this.props.hospitalsById && this.props.referenceObj && this.props.itemsById && this.props.queriedProcedures.map((call)=>{
          let responseTimeHr = Math.floor(call.responseTime/3600000) % 24;
          let responseTimeMin = Math.floor(call.responseTime/60000) % 60;
          let procedureTimeHr = Math.floor(call.procedureTime/3600000) % 24;
          let procedureTimeMin = Math.floor(call.procedureTime/60000) % 60;
          return(
            <div className='vas-admin-custom-table-item-outer-container' key={call._id} onClick={e=>{this.props.editCompletedCall(call)}}>
              <div className='vas-admin-custom-table-item-outer'>
                <div className='vas-admin-custom-table-item-outer'>
                  <div className='vas-admin-custom-table-item vas-call-table-item'>
                    <div className='vas-home-custom-table-column-1'>
                      <Moment format='HH:mm'>{this.props.getDateFromObjectId(call._id)}</Moment>
                      <Moment className='vas-home-table-time-date' format='M/D'>{this.props.getDateFromObjectId(call._id)}</Moment>
                    </div>
                    <div className={'vas-home-custom-table-column-2 ' + (call.orderChange ? 'vas-admin-order-change' : '')}>
                      <div className='vas-admin-custom-table-td vas-admin-custom-table-nurse'>
                        <p className='vas-admin-custom-item-subfield'>Nurse:</p>
                        <p className='vas-admin-custom-item-subvalue'>{this.props.usersById[call.completedBy] ? this.props.usersById[call.completedBy].fullname : call.completedBy}</p>
                      </div>
                      <div className='vas-admin-custom-table-td vas-admin-custom-table-room'>
                        <p className='vas-admin-custom-item-subfield'>Room:</p>
                        <p className='vas-admin-custom-item-subvalue vas-uppercase'>{call.room}</p>
                      </div>
                      <span>
                        <div className='vas-admin-custom-table-td vas-admin-custom-table-hospital'>
                          <p className='vas-admin-custom-item-subfield'>Hospital:</p>
                          <p className='vas-admin-custom-item-subvalue'>{call.hospital ? this.props.hospitalsById[call.hospital].name : 'N/A'}</p>
                        </div>
                        <div className='vas-admin-custom-table-td vas-admin-custom-table-mrn'>
                          <p className='vas-admin-custom-item-subfield'>MRN:</p>
                          <p className='vas-admin-custom-item-subvalue'>{call.mrn ? call.mrn : 'N/A'}</p>
                        </div>
                        <div className='vas-admin-custom-table-td vas-admin-custom-table-provider'>
                          <p className='vas-admin-custom-item-subfield'>Provider:</p>
                          <p className='vas-admin-custom-item-subvalue'>{call.provider ? call.provider : 'N/A'}</p>
                        </div>
                        {call.orderChange &&
                          <div className='vas-admin-custom-table-td vas-admin-custom-table-order-change'>
                            <p className='vas-admin-custom-item-subfield'>Order Change:</p>
                            <p className='vas-admin-custom-item-subvalue'>{this.props.orderChangeById[call.orderChange].name}</p>
                          </div>
                        }
                      </span>
                    </div>
                    <div className='vas-home-custom-table-column-3'>
                      <div className='vas-call-times-row'><p className='vas-call-times-left'>Call Time:</p><p className='vas-call-times-right'><Moment format='HH:mm'>{this.props.getDateFromObjectId(call._id)}</Moment></p></div>
                      <div className='vas-call-times-row'><p className='vas-call-times-left'>Start Time:</p><p className='vas-call-times-right'><Moment format='HH:mm'>{call.startTime}</Moment></p></div>
                      <div className='vas-call-times-row'><p className='vas-call-times-left'>End Time:</p><p className='vas-call-times-right'><Moment format='HH:mm'>{call.completedAt}</Moment></p></div>
                      <div className='vas-call-times-row'><p className='vas-call-times-left'>Response Time:</p><p className='vas-call-times-right'>{responseTimeHr > 0 ? responseTimeHr + ' Hr ' : ''}{responseTimeMin + ' Min'}</p></div>
                      <div className='vas-call-times-row'><p className='vas-call-times-left'>Procedure Time:</p><p className='vas-call-times-right'>{procedureTimeHr > 0 ? procedureTimeHr + ' Hr ' : ''}{procedureTimeMin + ' Min'}</p></div>
                    </div>
                  </div>
                  <div className='vas-home-custom-table-item-column-procedures'>
                    <div className='vas-admin-custom-table-td vas-admin-custom-table-procedures'>
                      {call.proceduresDone.map((procedure, idx)=>{
                        return (
                          <div className='vas-admin-query-procedure-container' key={procedure.procedureId}>
                            <p className='vas-admin-query-procedure-names'>{this.props.referenceObj.procedures[procedure.procedureId].name}</p>
                            <div className='vas-admin-query-item-container'>
                            {procedure.itemIds && procedure.itemIds.length > 0 &&
                              procedure.itemIds.map((id, idx)=>{
                                let isCustom = this.props.itemsById[id].isCustom;
                                return (
                                  <p key={id + idx} className='vas-admin-query-item'>{!isCustom ? this.props.itemsById[id].value : this.props.itemsById[id].valuePrefix + procedure.customValues[id] + this.props.itemsById[id].valueSuffix}</p>
                                )
                              })
                            }
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                {call.wasConsultation &&
                  <div className='vas-call-consultation-container'>
                    <p className='vas-call-consultation'>Consultation Done</p>
                  </div>
                }
                {(call.addComments || call.preComments) &&
                  <div className='vas-call-comments-container'>
                    {call.preComments &&
                      <p className='vas-call-comment'><b>Pre-Procedure:</b> {call.preComments}</p>
                    }
                    {call.addComments &&
                      <p className='vas-call-comment'><b>Add'l:</b> {call.addComments}</p>
                    }
                  </div>
                }
              </div>
            </div>  
          )
        })}
      </div>
    </div>
    
    )
  }
}

