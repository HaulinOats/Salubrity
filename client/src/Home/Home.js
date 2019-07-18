import React, {Component} from 'react';
import Modal from '../Widgets/Modal/Modal';
import './Home.css';
import queueData from '../queueData';
import completedData from '../completedData';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.toggleHandler = this.toggleHandler.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderEnd = this.sliderEnd.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.state = {
      modalIsOpen:false,
      endTaskSliderValue:0,
      pivSelected:false,
      labSelected:false,
      portacathCathflowActive:false,
      picclineCathflowActive:false,
      activeBoxesArr:[],
      modalTitle:"",
      activeRecord:{
        roomNumber:1001
      },
      queueItems:[],
      completedItems:[]
    }
  }

  componentDidMount(){
    this.setState({
      queueItems:queueData,
      completedItems:completedData
    });
  }

  toggleHandler() {
    this.setState({
      modalIsOpen: !this.state.modalIsOpen
    });
  }

  sliderChange(e){
    if(e.target.value < 100){
      this.setState({
        endTaskSliderValue:e.target.value
      })
    } else {
      var activeBoxesArr = [];
      var itemButtons = document.querySelectorAll('.vas-main-select-input:checked');
      itemButtons.forEach((el)=>{
        activeBoxesArr.push(el.id);
      });
      this.setState({
        modalTitle:"Task Completed",
        activeBoxesArr:activeBoxesArr,
        modalIsOpen:true,
        endTaskSliderValue:100
      }, ()=>{
        // setTimeout(()=>{this.setState({modalIsOpen:false, endTaskSliderValue:0})}, 2000);
      });
    }
  }

  sliderEnd(){
    if(this.state.endTaskSliderValue < 100){
      this.setState({endTaskSliderValue:0})
    } else {
      this.setState({endTaskSliderValue:100})
    }
  }

  resetPage(){
    var checkboxesAndRadioBtns = document.querySelectorAll('input:checked');
    checkboxesAndRadioBtns.forEach((el)=>{
      el.checked = false;
    });
  }

  pivSelected(){
    document.getElementById('piv-attempt-1').checked = true;
  }

  labDrawSelected(){
    document.getElementById('lab-draw-attempt-1').checked = true;
  }

  closeModal(){
    this.setState({modalIsOpen:false});
  }

  render(){
    return(
        <div className="container-fluid vas-app-container">
          <button type="button" className="btn btn-primary vas-queue-addCall" onClick={()=>{this.setState({modalIsOpen:true, modalTitle:"Add Call"})}}>Add Call</button>
          <ul className="nav nav-tabs vas-home-nav-tabs" id="myTab" role="tablist">
            <li className="nav-item vas-home-nav-item">
              <a className="nav-link vas-nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Active/Open</a>
            </li>
            <li className="nav-item vas-home-nav-item">
              <a className="nav-link vas-nav-link" id="queue-tab" data-toggle="tab" href="#queue" role="tab" aria-controls="queue" aria-selected="false">Queue</a>
            </li>
            <li className="nav-item vas-home-nav-item">
                <a className="nav-link vas-nav-link" id="completed-tab" data-toggle="tab" href="#completed" role="tab" aria-controls="completed" aria-selected="false">Completed</a>
            </li>
          </ul>
          <div className="tab-content vas-main-tabContent" id="myTabContent">
            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
              <header className="vas-main-header">
                <p className="vas-main-header-text">Room: <b>{this.state.activeRecord.roomNumber}</b></p>
                <button className="vas-main-header-btn" onClick={this.resetPage}>Reset Form</button>
                <button className="vas-main-header-btn" onClick={this.resetPage}>Return To Queue</button>
              </header>
              <div className="vas-main-inner-container">
                <header className="vas-main-inner-container-header">
                  <p>PIV Start</p>
                </header>
                <div className="vas-main-inner-container-main">
                  <div className="vas-main-inner-container-row">
                    <span className="vas-single-select-group">
                      <input type="radio" className="vas-main-select-input vas-single-select" id="piv-24" name="piv-dose" />
                      <label className="vas-btn" htmlFor="piv-24" onClick={this.pivSelected}>24g</label>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="piv-22" name="piv-dose"/>
                      <label className="vas-btn" htmlFor="piv-22" onClick={this.pivSelected}>22g</label>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="piv-20" name="piv-dose"/>
                      <label className="vas-btn" htmlFor="piv-20" onClick={this.pivSelected}>20g</label>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="piv-18" name="piv-dose"/>
                      <label className="vas-btn" htmlFor="piv-18" onClick={this.pivSelected}>18g</label>
                    </span>
                    <span className="vas-single-select-group">
                      <p className="d-inline mr-2">Attempts:</p>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="piv-attempt-1" name="piv-attempt" />
                      <label className="vas-btn" htmlFor="piv-attempt-1">1</label>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="piv-attempt-2" name="piv-attempt" />
                      <label className="vas-btn" htmlFor="piv-attempt-2">2</label>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="piv-us" name="piv-attempt" />
                      <label className="vas-btn" htmlFor="piv-us">US Used</label>
                    </span>
                  </div>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <header className="vas-main-inner-container-header">
                  <p>Lab Draw</p>
                </header>
                <div className="vas-main-inner-container-main">
                  <div className="vas-main-inner-container-row">
                    <span className="vas-single-select-group">
                      <input type="radio" className="vas-main-select-input vas-single-select" id="lab-draw-iv" name="lab-draw" onClick={this.labDrawSelected} />
                      <label className="vas-btn" htmlFor="lab-draw-iv">From IV</label>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="lab-draw-labs" name="lab-draw" onClick={this.labDrawSelected}/>
                      <label className="vas-btn" htmlFor="lab-draw-labs">Labs Only</label>
                    </span>
                    <span className="vas-single-select-group">
                      <p className="d-inline mr-2">Attempts:</p>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="lab-draw-attempt-1" name="lab-draw-attempt" />
                      <label className="vas-btn" htmlFor="lab-draw-attempt-1">1</label>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="lab-draw-attempt-2" name="lab-draw-attempt" />
                      <label className="vas-btn" htmlFor="lab-draw-attempt-2">2</label>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="lab-draw-us" name="lab-draw-attempt" />
                      <label className="vas-btn" htmlFor="lab-draw-us">US Used</label>
                    </span>
                  </div>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <header className="vas-main-inner-container-header">
                  <p>Site Care</p>
                </header>
                <div className="vas-main-inner-container-main">
                  <div className="vas-main-inner-container-row">
                    <span className="vas-multi-select-group">
                      <input type="checkbox" className="vas-main-select-input vas-multi-select" id="site-care-iv-flushed" name="site-care" />
                      <label className="vas-btn" htmlFor="site-care-iv-flushed">IV Flushed</label>
                      <input type="checkbox" className="vas-main-select-input vas-multi-select" id="site-care-saline-locked" name="site-care" />
                      <label className="vas-btn" htmlFor="site-care-saline-locked">Saline Locked</label>
                      <input type="checkbox" className="vas-main-select-input vas-multi-select" id="site-care-dressing-changed" name="site-care" />
                      <label className="vas-btn" htmlFor="site-care-dressing-changed">Dressing Changed</label>
                      <input type="checkbox" className="vas-main-select-input vas-multi-select" id="site-care-dressing-reinforced" name="site-care" />
                      <label className="vas-btn" htmlFor="site-care-dressing-reinforced">Dressing Reinforced</label>
                    </span>
                  </div>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <header className="vas-main-inner-container-header">
                  <p>DC IV</p>
                </header>
                <div className="vas-main-inner-container-main">
                  <div className="vas-main-inner-container-row">
                    <span className="vas-multi-select-group">
                      <input type="checkbox" className="vas-main-select-input vas-multi-select" id="dc-iv-infiltration" name="dc-iv" />
                      <label className="vas-btn" htmlFor="dc-iv-infiltration">Infiltration</label>
                      <input type="checkbox" className="vas-main-select-input vas-multi-select" id="dc-iv-phlebitis" name="dc-iv" />
                      <label className="vas-btn" htmlFor="dc-iv-phlebitis">Phlebitis</label>
                      <input type="checkbox" className="vas-main-select-input vas-multi-select" id="dc-iv-pt-removed" name="dc-iv" />
                      <label className="vas-btn" htmlFor="dc-iv-pt-removed">PT Removed</label>
                      <input type="checkbox" className="vas-main-select-input vas-multi-select" id="dc-iv-leaking" name="dc-iv" />
                      <label className="vas-btn" htmlFor="dc-iv-leaking">Leaking</label>
                      <input type="checkbox" className="vas-main-select-input vas-multi-select" id="dc-iv-bleeding" name="dc-iv" />
                      <label className="vas-btn" htmlFor="dc-iv-bleeding">Bleeding</label>
                    </span>
                  </div>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <header className="vas-main-inner-container-header">
                  <p>Port-a-Cath</p>
                </header>
                <div className="vas-main-inner-container-main">
                  <div className="vas-main-inner-container-main-sub">
                    <header className="vas-main-inner-container-sub-header">
                      <p>Access Attempts:</p>
                    </header>
                    <div className="vas-main-inner-container-row">
                      <input type="radio" className="vas-main-select-input vas-single-select" id="pac-access-attempt-1" name="pac-access" />
                      <label className="vas-btn" htmlFor="pac-access-attempt-1">1</label>
                      <input type="radio" className="vas-main-select-input vas-single-select" id="pac-access-attempt-2" name="pac-access" />
                      <label className="vas-btn" htmlFor="pac-access-attempt-2">2</label>
                    </div>
                  </div>
                  <div className="vas-main-inner-container-main-sub">
                    <header className="vas-main-inner-container-sub-header">
                      <p>Deaccess</p>
                    </header>
                    <div className="vas-main-inner-container-row">
                      <span className="vas-single-select-group">
                        <input type="radio" className="vas-main-select-input vas-single-select" id="pac-deaccess-contaminated" name="pac-deaccess" />
                        <label className="vas-btn" htmlFor="pac-deaccess-contaminated">Contaminated</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="pac-deaccess-therapy-complete" name="pac-deaccess" />
                        <label className="vas-btn" htmlFor="pac-deaccess-therapy-complete">Therapy Complete</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="pac-deaccess-needle-change" name="pac-deaccess" />
                        <label className="vas-btn" htmlFor="pac-deaccess-needle-change">Needle Change</label>
                      </span>
                    </div>
                  </div>
                  <div className="vas-main-inner-container-row">
                    <div className="vas-main-cathflow-container">
                      <button className="btn vas-main-btn vas-main-cathflow-btn" onClick={()=>{this.setState({portacathCathflowActive:!this.state.portacathCathflowActive})}}>Cathflow</button>
                      {this.state.portacathCathflowActive &&
                      <span className="vas-main-cathflow-btn-container">
                        <input type="radio" className="vas-main-select-input vas-single-select" id="pac-cathflow-initiated" name="pac-cathflow" />
                        <label className="vas-btn" htmlFor="pac-cathflow-initiated">Initiated</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="pac-cathflow-completed" name="pac-cathflow" />
                        <label className="vas-btn" htmlFor="pac-cathflow-completed">Completed</label>
                      </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <header className="vas-main-inner-container-header">
                  <p>PICC Line</p>
                </header>
                <div className="vas-main-inner-container-main">
                  <div className="vas-main-inner-container-main-sub">
                    <header className="vas-main-inner-container-sub-header">
                      <p>Removal</p>
                    </header>
                    <div className="vas-main-inner-container-row">
                      <span className="vas-single-select-group">
                        <input type="radio" className="vas-main-select-input vas-single-select" id="picc-line-therapy-complete" name="picc-line" />
                        <label className="vas-btn" htmlFor="picc-line-therapy-complete">Therapy Complete</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="picc-line-discharge" name="picc-line" />
                        <label className="vas-btn" htmlFor="picc-line-discharge">Discharge</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="picc-line-clotted" name="picc-line" />
                        <label className="vas-btn" htmlFor="picc-line-clotted">Clotted</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="picc-line-contaminated" name="picc-line" />
                        <label className="vas-btn" htmlFor="picc-line-contaminated">Contaminated</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="picc-line-pt-removal" name="picc-line" />
                        <label className="vas-btn" htmlFor="picc-line-pt-removal">PT Removal</label>
                      </span>
                    </div>
                  </div>
                  <div className="vas-main-inner-container-row">
                    <div className="vas-main-cathflow-container">
                      <button className="btn vas-main-btn vas-main-cathflow-btn" onClick={()=>{this.setState({picclineCathflowActive:!this.state.picclineCathflowActive})}}>Cathflow</button>
                      {this.state.picclineCathflowActive &&
                      <span className="vas-main-cathflow-btn-container">
                        <input type="radio" className="vas-main-select-input vas-single-select" id="picc-line-cathflow-initiated" name="picc-line-cathflow" />
                        <label className="vas-btn" htmlFor="picc-line-cathflow-initiated">Initiated</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="picc-line-cathflow-completed" name="picc-line-cathflow" />
                        <label className="vas-btn" htmlFor="picc-line-cathflow-completed">Completed</label>
                      </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="vas-main-inner-container">
                <header className="vas-main-inner-container-header">
                  <p>Dressing Change</p>
                </header>
                <div className="vas-main-inner-container-main">
                  <div className="vas-main-inner-container-main-sub">
                    <header className="vas-main-inner-container-sub-header">
                      <p>What:</p>
                    </header>
                    <div className="vas-main-inner-container-row">
                      <span className="vas-single-select-group">
                        <input type="radio" className="vas-main-select-input vas-single-select" id="dressing-change-picc" name="dressing-change-what" />
                        <label className="vas-btn" htmlFor="dressing-change-picc">PICC</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="dressing-change-pac" name="dressing-change-what" />
                        <label className="vas-btn" htmlFor="dressing-change-pac">Port-a-Cath</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="dressing-change-central-line" name="dressing-change-what" />
                        <label className="vas-btn" htmlFor="dressing-change-central-line">Central Line</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="dressing-change-mid-line" name="dressing-change-what" />
                        <label className="vas-btn" htmlFor="dressing-change-mid-line">Mid Line</label>
                      </span>
                    </div>
                  </div>
                  <div className="vas-main-inner-container-main-sub">
                    <header className="vas-main-inner-container-sub-header">
                      <p>Why:</p>
                    </header>
                    <div className="vas-main-inner-container-row">
                      <span className="vas-single-select-group">
                        <input type="radio" className="vas-main-select-input vas-single-select" id="dressing-change-per-protocol" name="dressing-change-why" />
                        <label className="vas-btn" htmlFor="dressing-change-per-protocol">Per Protocol</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="dressing-change-bleeding" name="dressing-change-why" />
                        <label className="vas-btn" htmlFor="dressing-change-bleeding">Bleeding</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" id="dressing-change-dressing-compromised" name="dressing-change-why" />
                        <label className="vas-btn" htmlFor="dressing-change-dressing-compromised">Dressing Compromised</label>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="vas-main-inner-container vas-main-inner-container-final">
                <header className="vas-main-inner-container-header vas-main-inner-container-final-header">
                  <p>Slide to complete task</p>
                </header>
                <input type="range" min="0" max="100" step="1" value={this.state.endTaskSliderValue} onChange={this.sliderChange} onMouseUp={this.sliderEnd} className="pullee" />
              </div>
            </div>
            <div className="tab-pane fade" id="queue" role="tabpanel" aria-labelledby="queue-tab">
              <table className="table vas-queue-table">
                <thead className="vas-queue-thead">
                  <tr>
                    <th scope="col">Room</th>
                    <th scope="col">Job</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Call Time</th>
                  </tr>
                </thead>
                <tbody>
                  {!this.state.queueItems.length &&
                    <tr><td className="vas-queue-no-items">There are no items currently in the queue</td></tr>
                  }
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
                  {!this.state.completedItems.length &&
                    <tr><td className="vas-queue-no-items">There are no items completed</td></tr>
                  }
                  {this.state.completedItems.map((item, index)=>{
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
          {this.state.modalIsOpen && 
            <Modal 
              closeModal={this.closeModal}
              modalTitle={this.state.modalTitle} 
              selectedIds={this.state.activeBoxesArr} 
              toggleModal={this.toggleHandler}/>
          }
        </div>
    )
  }
}
