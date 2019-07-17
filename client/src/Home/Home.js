import React, {Component} from 'react';
import Modal from '../Widgets/Modal/Modal';
import './Home.css';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.toggleHandler = this.toggleHandler.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderEnd = this.sliderEnd.bind(this);
    this.state = {
      modalIsOpen:false,
      sliderValue:0,
      activeRecord:{
        roomNumber:1001,
        jobRequest:"PIV",
        contact:1482,
        callTime:"0900"
      },
      queueItems:[
        {
          roomNumber:1001,
          jobRequest:"PIV",
          contact:1482,
          callTime:"0900"
        },
        {
          roomNumber:1001,
          jobRequest:"Dressing Change",
          contact:1482,
          callTime:"1400"
        },
        {
          roomNumber:1001,
          jobRequest:"Lab Draw",
          contact:1482,
          callTime:"1900"
        },
        {
          roomNumber:1001,
          jobRequest:"Port Access",
          contact:1482,
          callTime:"1250"
        }
      ],
      completedItems:[
        {
          roomNumber:1001,
          jobRequest:"PIV",
          contact:1482,
          callTime:"0900"
        },
        {
          roomNumber:1001,
          jobRequest:"Dressing Change",
          contact:1482,
          callTime:"1400"
        },
        {
          roomNumber:1001,
          jobRequest:"Lab Draw",
          contact:1482,
          callTime:"1900"
        },
        {
          roomNumber:1001,
          jobRequest:"Port Access",
          contact:1482,
          callTime:"1250"
        }
      ]
    }
  }

  toggleHandler() {
    this.setState({
      modalIsOpen: !this.state.modalIsOpen
    });
  }

  sliderChange(e){
    console.log('sliderChange');
    this.setState({
      sliderValue:e.target.value
    })
  }

  sliderEnd(e){
    if(this.state.sliderValue < 100){
      this.setState({
        sliderValue:0
      })
    }
  }

  render(){
    return(
        <div className="container-fluid vas-app-container">
          <button type="button" className="btn btn-primary vas-queue-addCall" onClick={()=>{this.setState({modalIsOpen:true})}}>Add Call</button>
          <ul className="nav nav-tabs vas-home-nav-tabs" id="myTab" role="tablist">
            <li className="nav-item vas-home-nav-item">
              <a className="nav-link vas-nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Active/Open</a>
            </li>
            <li className="nav-item vas-home-nav-item">
              <a className="nav-link vas-nav-link" id="queue-tab" data-toggle="tab" href="#queue" role="tab" aria-controls="queue" aria-selected="true">Queue</a>
            </li>
            <li className="nav-item vas-home-nav-item">
                <a className="nav-link vas-nav-link" id="completed-tab" data-toggle="tab" href="#completed" role="tab" aria-controls="completed" aria-selected="false">Completed</a>
            </li>
          </ul>
          <div className="tab-content vas-main-tabContent" id="myTabContent">
            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
              <header className="vas-main-header"><p>Room: <b>{this.state.activeRecord.roomNumber}</b></p></header>
              <div className="vas-main-inner-container">
                <div className="vas-main-inner-container-row">
                  <span className="vas-main-btn-section">
                    <span className="vas-main-btn-section-leader">
                      <button className="btn vas-main-btn vas-main-needle-btn">PIV Start</button>
                    </span>
                    <span className="vas-main-btn-section-child">
                      <button className="btn vas-main-btn vas-main-sub-btn vas-main-btn-active">24g</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">22g</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">20g</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">18g</button>
                      <p className="d-inline mr-2">Attempts:</p>
                      <button className="btn vas-main-btn vas-main-sub-btn vas-main-btn-active">1</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">2</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">US Used</button>
                    </span>
                  </span>
                </div>
                <div className="vas-main-inner-container-row">
                  <span className="vas-main-btn-section">
                    <span className="vas-main-btn-section-leader">
                      <button className="btn vas-main-btn vas-main-needle-btn">Lab Draw</button>
                    </span>
                    <span className="vas-main-btn-section-child">
                      <button className="btn vas-main-btn vas-main-sub-btn vas-main-btn-active">From IV</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Labs only</button>
                      <p className="d-inline mr-2">Attempts:</p>
                      <button className="btn vas-main-btn vas-main-sub-btn vas-main-btn-active">1</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">2</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">US Used</button>
                    </span>
                  </span>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <div className="vas-main-inner-container-row">
                  <span className="vas-main-btn-section">
                    <button className="btn vas-main-btn vas-main-sub-btn vas-main-btn-active">IV Flushed</button>
                    <button className="btn vas-main-btn vas-main-sub-btn">Saline Locked</button>
                    <button className="btn vas-main-btn vas-main-sub-btn">Dressing Changed</button>
                    <button className="btn vas-main-btn vas-main-sub-btn">Dressing Reinforced</button>
                  </span>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <div className="vas-main-inner-container-row">
                  <span className="vas-main-btn-section">
                    <span className="vas-main-btn-section-leader">
                      <button className="btn vas-main-btn vas-main-discontinue-btn">DC IV</button>
                    </span>
                    <span className="vas-main-btn-section-child">
                      <button className="btn vas-main-btn vas-main-sub-btn">Site Rotation</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Infiltration</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Phlebitis</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">PT Removed</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Leaking</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Bleeding</button>
                    </span>
                  </span>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <div className="vas-main-inner-container-row">
                  <p className="d-inline mr-2">Port-a-Cath</p>
                  <span className="vas-main-btn-section">
                    <span className="vas-main-btn-section-leader">
                      <button className="btn vas-main-btn vas-main-needle-btn">Access</button>
                    </span>
                    <span className="vas-main-btn-section-child">
                      <p className="d-inline">Attempts:</p>
                      <button className="btn vas-main-btn vas-main-sub-btn">1</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">2</button>
                    </span>
                  </span>
                </div>
                <div className="vas-main-inner-container-row">
                  <button className="btn vas-main-btn vas-main-critical-btn">Cathflo</button>
                  <span className="vas-main-btn-section">
                    <span className="vas-main-btn-section-leader">
                      <button className="btn vas-main-btn vas-main-discontinue-btn">Deaccess</button>
                    </span>
                    <span className="vas-main-btn-section-child">
                      <button className="btn vas-main-btn vas-main-sub-btn">Contaminated</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Therapy Complete</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Needle Change</button>
                    </span>
                  </span>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <div className="vas-main-inner-container-row">
                  <p className="d-inline mr-2">PICC Line</p>
                  <span className="vas-main-btn-section">
                    <span className="vas-main-btn-section-leader">
                      <button className="btn vas-main-btn vas-main-discontinue-btn">Removal</button>
                    </span>
                    <span className="vas-main-btn-section-child">
                      <button className="btn vas-main-btn vas-main-sub-btn">Therapy Complete</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Discharge</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Clotted</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">Conteminated</button>
                      <button className="btn vas-main-btn vas-main-sub-btn">PT Removed</button>
                    </span>
                  </span>
                </div>
                <div className="vas-main-inner-container-row">
                  <span className="vas-main-btn-section">
                    <button className="btn vas-main-btn vas-main-critical-btn">Cathflo</button>
                  </span>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <div className="vas-main-inner-container-row">
                  <span className="vas-main-btn-section-leader">
                    <button className="btn vas-main-btn vas-main-discontinue-btn">Dressing Change</button>
                  </span>
                  <span className="vas-main-btn-section-child">
                    <button className="btn vas-main-btn vas-main-sub-btn">PICC</button>
                    <button className="btn vas-main-btn vas-main-sub-btn">Port-a-Cath</button>
                    <button className="btn vas-main-btn vas-main-sub-btn">Central Line</button>
                    <button className="btn vas-main-btn vas-main-sub-btn">Mid Line</button>
                    <button className="btn vas-main-btn vas-main-sub-btn">Per Protocol</button>
                    <button className="btn vas-main-btn vas-main-sub-btn">Bleeding</button>
                    <button className="btn vas-main-btn vas-main-sub-btn">Dressing Compromised</button>
                  </span>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <p>Slide to end task </p>
                <input type="range" value={this.state.sliderValue} onChange={this.sliderChange} onMouseUp={this.sliderEnd} className="pullee" />
              </div>
            </div>
            <div className="tab-pane fade" id="queue" role="tabpanel" aria-labelledby="queue-tab">
              <table className="table vas-queue-table">
                <thead className="vas-queue-thead">
                  <tr>
                    <th scope="col">Room</th>
                    <th scope="col">Job Requested</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Call Time</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.queueItems.map((item, index)=>{
                    return(
                      <tr key={index} className="vas-queue-tr">
                        <th scope="row">{item.roomNumber}</th>
                        <td>{item.jobRequest}</td>
                        <td>{item.contact}</td>
                        <td>{item.callTime}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="tab-pane fade" id="completed" role="tabpanel" aria-labelledby="completed-tab">
              <table className="table vas-queue-table">
                <thead className="vas-queue-thead">
                  <tr>
                    <th scope="col">Room</th>
                    <th scope="col">Job Requested</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Call Time</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.queueItems.map((item, index)=>{
                    return(
                      <tr key={index} className="vas-queue-tr">
                        <th scope="row">{item.roomNumber}</th>
                        <td>{item.jobRequest}</td>
                        <td>{item.contact}</td>
                        <td>{item.callTime}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {this.state.modalIsOpen && <Modal toggleModal={this.toggleHandler}/>}
        </div>
    )
  }
}
