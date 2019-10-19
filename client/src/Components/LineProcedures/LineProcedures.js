import React, {Component} from 'react';
import './LineProcedures.css';
import Moment from 'react-moment';
import moment from 'moment';

export default class LineProcedures extends Component{
  render(){
    let today = moment();
    //UPDATE
    let lineTypes = [30,58,59,60,61,62];
    let lateralities = [68,69];
    return(
      <div className='vas-line-procedures'>
        <div className='vas-line-procedures-table'>
          <header className='vas-line-procedures-table-header'>
            <button className='vas-line-procedures-table-header-reverse' onClick={e=>{this.props.reverseSort('lines')}}>Reverse Sort</button>
          </header>
          {this.props.lineProcedures.length < 1 &&
            <p className='vas-line-procedures-no-calls'>There are no open lines types at this time</p>
          }
          {this.props.lineProcedures.map((lineProcedure, idx)=>{
            let daysTilDressingDate = moment(lineProcedure.dressingChangeDate).diff(today, 'days');
            let lineType = 'N/A';
            let laterality = 'N/A';
            lineProcedure.itemIds.forEach(itemId=>{
              if(lineTypes.indexOf(itemId) > -1){
                lineType = this.props.itemsById[itemId].value;
              }
              if(lateralities.indexOf(itemId) > -1){
                laterality = this.props.itemsById[itemId].value;
              }
            });
            return(
            <div key={lineProcedure._id + idx} className={'vas-line-procedures-line-item ' + (daysTilDressingDate < 2 ? 'vas-line-procedure-line-item-attention' : '')} onClick={e=>{this.props.editCompletedCall(lineProcedure._id, lineProcedure.completedBy)}}>
              <div className='vas-line-procedures-line-item-left'>
                <Moment className='vas-line-procedures-main-date' format='M/D'>{lineProcedure.dressingChangeDate}</Moment>
              </div>
              <div className='vas-line-procedures-line-item-right'>
                <div className='vas-line-procedures-line-item-field-container'>
                  <p className='vas-line-procedures-line-item-field-container-left'>Room:</p>
                  <p className='vas-line-procedures-line-item-field-container-right'>{lineProcedure.room}</p>
                </div>
                <div className='vas-line-procedures-line-item-field-container'>
                  <p className='vas-line-procedures-line-item-field-container-left'>Hospital:</p>
                  <p className='vas-line-procedures-line-item-field-container-right'>{this.props.hospitalsById[lineProcedure.hospital] ? this.props.hospitalsById[lineProcedure.hospital].name : 'N/A'}</p>
                </div>
                <div className='vas-line-procedures-line-item-field-container'>
                  <p className='vas-line-procedures-line-item-field-container-left'>Type:</p>
                  <p className='vas-line-procedures-line-item-field-container-right'>{lineType}</p>
                </div>
                <div className='vas-line-procedures-line-item-field-container'>
                  <p className='vas-line-procedures-line-item-field-container-left'>Laterality:</p>
                  <p className='vas-line-procedures-line-item-field-container-right'>{laterality}</p>
                </div>
                <div className='vas-line-procedures-line-item-field-container'>
                  <p className='vas-line-procedures-line-item-field-container-left'>Insertion Date:</p>
                  <p className='vas-line-procedures-line-item-field-container-right'><Moment format='M/D'>{lineProcedure.completedAt}</Moment></p>
                </div>
                <div className='vas-line-procedures-line-item-field-container'>
                  <p className='vas-line-procedures-line-item-field-container-left'>Dressing Date:</p>
                  <p className='vas-line-procedures-line-item-field-container-right'><Moment format='M/D'>{lineProcedure.dressingChangeDate}</Moment></p>
                </div>
              </div>
            </div>)
          })}
        </div>
      </div>
    )
  }
}