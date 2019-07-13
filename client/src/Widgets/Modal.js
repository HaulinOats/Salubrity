import React, {Component} from 'react';
var ReactModal = require('react-bootstrap-modal');
 
export default class Modal extends Component {
  constructor(props){
    super(props);
    this.state = {
      open:false
    }
  }

  render(){
    let closeModal = () => this.setState({ open: false })
 
    let saveAndClose = () => {
      this.setState({ open: false })
    }
 
    return (
      <div>
        <button type='button' onClick={(e)=>{
          this.setState({open:true});
        }}>Launch modal</button>
        <ReactModal show={this.state.open} onHide={closeModal} aria-labelledby="modalHeader">
          <ReactModal.Header closeButton>
            <ReactModal.Title id='modalHeader'>A Title Goes here</ReactModal.Title>
          </ReactModal.Header>
          <ReactModal.Body>
            <p>Some Content here</p>
          </ReactModal.Body>
          <ReactModal.Footer>
            // If you don't have anything fancy to do you can use
            // the convenient `Dismiss` component, it will
            // trigger `onHide` when clicked
            <ReactModal.Dismiss className='btn btn-default'>Cancel</ReactModal.Dismiss>
 
            // Or you can create your own dismiss buttons
            <button className='btn btn-primary' onClick={saveAndClose}>
              Save
            </button>
          </ReactModal.Footer>
        </ReactModal>
      </div>
    )
  }
}