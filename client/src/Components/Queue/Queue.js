import React, {Component} from 'react';
import helpers from '../../helpers';
import Moment from 'react-moment';
import './Queue.css';

export default class Queue extends Component{
  render(){
    return(
      <div className="vas-home-table vas-table">
        <div className='vas-home-table-body'>
          <div className='vas-table-thead-row'></div>
          {this.props.queueItems.length > 0 && this.props.usersById && this.props.hospitalsById && this.props.queueItems.map((item, idx)=>{
            return(
              <div key={item._id} className={'vas-home-table-tr vas-status-' + item.status + (item.openBy ? ' vas-home-table-row-is-open' : '')} onClick={(e)=>{this.props.selectJob(item)}}>
                <div className='vas-home-table-time vas-width-10'>
                  <Moment format='HH:mm'>{helpers.getDateFromObjectId(item._id)}</Moment>
                  <Moment className='vas-home-table-time-date' format='M/D'>{helpers.getDateFromObjectId(item._id)}</Moment>
                </div>
                <div className='vas-width-90'>
                  <p className='vas-home-table-job-name'>{item.job}{item.customJob ? ' - ' + item.customJob : ''}<b className={'vas-open-status ' + (item.openBy ? 'vas-open-label-blink' : '' )}>{item.openBy ? 'OPEN' : ''}</b></p>
                  <div className='vas-home-table-tr-inner'>
                    <p><b>Room:</b><i className='vas-uppercase'>{item.room}</i></p>
                    <p><b>Hospital:</b><i className='vas-capitalize'>{this.props.hospitalsById[item.hospital] ? this.props.hospitalsById[item.hospital].name : 'N/A'}</i></p>
                    <p><b>Contact:</b><i>{item.contact ? item.contact : 'N/A'}</i></p>
                    <p><b>Nurse:</b><i className='vas-capitalize'>{this.props.usersById[item.openBy] ? this.props.usersById[item.openBy].fullname : (item.openBy ? item.openBy : 'N/A')}</i></p>
                  </div>
                </div>
              </div>
            )
          })}
          {this.props.queueItems.length < 1 &&
            <div><p className='vas-queue-no-items'>There are no items currently in the queue</p></div>
          }
        </div>
      </div>
    )
  }
}