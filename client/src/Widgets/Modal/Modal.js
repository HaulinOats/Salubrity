import React, {Component} from 'react';
import './Modal.css';

export default class Modal extends Component {
  constructor(props){
    super(props);
    console.log(props);
    this.state = {
      isOpen:true
    }
  }

  render(){
    return(
      <div className="vas-modal-container" data-isOpen={this.state.isOpen}>
        <div className="vas-modal-clickguard" onClick={this.props.toggleModal}></div>
        <div className="vas-modal-content">
          <div className="vas-modal-content-inner">
            <header className="vas-modal-content-header">
              <p>Selected Items:</p>
              <div className="vas-modal-content-closeBtn" onClick={this.props.toggleModal}>&#10006;</div>
            </header>
            <hr></hr>
            <div className="vas-modal-content-main">
            {this.props.selectedIds.map((item, i)=>{
              return <p key={i}>{item}</p>
            })}
            </div>
            <hr></hr>
            <div className="vas-modal-content-buttonContainer">
              <button className="btn btn-danger vas-modal-cancel" onClick={this.props.toggleModal}>Cancel</button>
              <button className="btn btn-success vas-modal-confirm" onClick={this.props.toggleModal}>OK</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}