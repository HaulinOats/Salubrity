import React, {Component} from 'react';
import Modal from '../Widgets/Modal/Modal';
import axios from 'axios';
import Moment from 'react-moment';
import './Home.css';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.toggleHandler = this.toggleHandler.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderEnd = this.sliderEnd.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getAddedCall = this.getAddedCall.bind(this);
    this.state = {
      modalIsOpen:false,
      endTaskSliderValue:0,
      pivSelected:false,
      labSelected:false,
      portacathCathflowActive:false,
      picclineCathflowActive:false,
      activeBoxesArr:[],
      modalTitle:"",
      activeRecord:localStorage.getItem('activeRecord') !== 'undefined' ? JSON.parse(localStorage.getItem('activeRecord')) : null,
      queueItems:[],
      completedItems:[],
      procedures:[],
      proceduresDone:[]
    }
  }

  componentWillMount(){
    this.getActiveCalls();
    axios.get('/get-procedures')
    .then((resp)=>{
      this.setState({procedures:resp.data});
      console.log(resp.data);
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  getActiveCalls(){
    axios.get('/get-active-calls')
    .then((resp)=>{
      console.log(resp.data);
      this.setState({queueItems:resp.data});
    })
    .catch((err)=>{
      console.log(err);
    })
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
      this.setState({
        modalTitle:"Task Completed",
        modalIsOpen:true,
        endTaskSliderValue:0
      }, ()=>{
        // setTimeout(()=>{this.setState({modalIsOpen:false, endTaskSliderValue:0})}, 2000);
        setTimeout(()=>{this.setState({endTaskSliderValue:0})});
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

  procedureSelect(field){
    if(field === 'piv-dose'){
      
    }
    if(field === 'piv-attempt'){

    }
    if(field === 'lab-draw-type'){

    }
    if(field === 'lab-draw-attempt'){

    }
    if(field === 'site-care'){

    }
    if(field === 'dv-iv'){

    }
    if(field === 'pac-access'){

    }
    if(field === 'pac-deaccess'){

    }
    if(field === 'pac-cathflow'){

    }
    if(field === 'picc-line-removal'){

    }
    if(field === 'picc-line-cathflow'){

    }
    if(field === 'dressing-change-what'){

    }
    if(field === 'dressing-change-why'){

    }
    if(field === 'insertion-procedure'){

    }
  }

  pivSelected(){
    document.getElementById('piv-attempt-1').checked = true;
  }

  labDrawSelected(){
    document.getElementById('lab-draw-attempt-1').checked = true;
  }

  closeModal(){
    this.setState({
      modalIsOpen:false, 
      activeBoxesArr:[]
    });
  }

  getAddedCall(addedCall){
    let queue = this.state.queueItems;
    queue.push(addedCall)
    this.setState({queueItems: queue});
  }

  selectJob(job){
    axios.post('/set-call-as-open', {_id:job._id})
    .then((resp)=>{
      console.log(resp.data);
      this.setState({activeRecord:job}, ()=>{
        localStorage.setItem('activeRecord', JSON.stringify(this.state.activeRecord));
      });
      setTimeout(()=>{
        document.getElementById('open-tab').click();
      }, 0);
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  returnToQueue(){
    axios.post('/set-call-as-unopen', {_id:this.state.activeRecord._id})
    .then((resp)=>{
      console.log(resp.data);
      this.setState({activeRecord:null}, ()=>{
        localStorage.removeItem('activeRecord');
        document.getElementById('queue-tab').click();
      });
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  render(){
    return(
        <div className="container-fluid vas-app-container">
          <button type="button" className="btn btn-primary vas-queue-addCall" onClick={()=>{this.setState({modalIsOpen:true, modalTitle:"Add Call"})}}>Add Call</button>
          <ul className="nav nav-tabs vas-home-nav-tabs" id="myTab" role="tablist">
            <li className="nav-item vas-home-nav-item">
              <a className="nav-link vas-nav-link active" id="queue-tab" data-toggle="tab" href="#queue" role="tab" aria-controls="queue" aria-selected="true" onClick={e=>{this.getActiveCalls()}}>Queue</a>
            </li>
            <li className="nav-item vas-home-nav-item">
                <a className="nav-link vas-nav-link" id="completed-tab" data-toggle="tab" href="#completed" role="tab" aria-controls="completed" aria-selected="false">Complete</a>
            </li>
            {this.state.activeRecord &&
              <li className="nav-item vas-home-nav-item">
                <a className="nav-link vas-nav-link" id="open-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="false">Active Record</a>
              </li>
            }
          </ul>
          <div className="tab-content vas-main-tabContent" id="myTabContent">
            <div className="tab-pane fade show active" id="queue" role="tabpanel" aria-labelledby="queue-tab">
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
                      !item.isOpen ?
                        <tr key={index} className="vas-queue-tr" onClick={(e)=>{this.selectJob(item)}}>
                          <th scope="row">{item.room}</th>
                          <td>{item.job}</td>
                          <td>{item.contact}</td>
                          <td><Moment format='HH:mm'>{item.createdAt}</Moment></td>
                        </tr>
                      : null
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
            {this.state.activeRecord &&
              <div className="tab-pane fade show" id="home" role="tabpanel" aria-labelledby="open-tab">
                <header className="vas-main-header">
                  <p className="vas-main-header-text">Room: <b>{this.state.activeRecord.room}</b></p>
                  <button className="vas-main-header-btn" onClick={this.resetPage}>Reset Form</button>
                  <button className="vas-main-header-btn" onClick={e=>{this.returnToQueue()}}>Return To Queue</button>
                </header>
                <div className="vas-main-inner-container">
                  <header className="vas-main-inner-container-header">
                    <p>PIV Start</p>
                  </header>
                  <div className="vas-main-inner-container-main">
                    <div className="vas-main-inner-container-row">
                      <span className="vas-single-select-group">
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PIV Start' data-field='24g' id='piv-24' name="piv-dose"/>
                        <label className="vas-btn" htmlFor="piv-24" onClick={e=>{this.pivSelected(); this.procedureSelect('piv-dose')}}>24g</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PIV Start' data-field='22g' id='piv-22' name="piv-dose"/>
                        <label className="vas-btn" htmlFor="piv-22" onClick={e=>{this.pivSelected(); this.procedureSelect('piv-dose')}}>22g</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PIV Start' data-field='20g' id='piv-20' name="piv-dose"/>
                        <label className="vas-btn" htmlFor="piv-20" onClick={e=>{this.pivSelected(); this.procedureSelect('piv-dose')}}>20g</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PIV Start' data-field='18g' id='piv-18' name="piv-dose"/>
                        <label className="vas-btn" htmlFor="piv-18" onClick={e=>{this.pivSelected(); this.procedureSelect('piv-dose')}}>18g</label>
                      </span>
                      <span className="vas-single-select-group">
                        <p className="d-inline mr-2">Attempts:</p>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PIV Start' data-subfield='1 Attempt' id="piv-attempt-1" name="piv-attempt" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('piv-attempt')}} htmlFor="piv-attempt-1">1</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PIV Start' data-subfield='2 Attemps' id="piv-attempt-2" name="piv-attempt" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('piv-attempt')}} htmlFor="piv-attempt-2">2</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PIV Start' data-subfield='US Used' id="piv-us" name="piv-attempt" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('piv-attempt')}} htmlFor="piv-us">US Used</label>
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
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Lab Draw' data-field='From IV' id="lab-draw-iv" name="lab-draw-type" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('lab-draw-type')}} htmlFor="lab-draw-iv">From IV</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Lab Draw' data-field='Labs Only' id="lab-draw-labs" name="lab-draw-type"/>
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('lab-draw-type')}} htmlFor="lab-draw-labs">Labs Only</label>
                      </span>
                      <span className="vas-single-select-group">
                        <p className="d-inline mr-2">Attempts:</p>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Lab Draw' data-subfield='1 Attempt' id="lab-draw-attempt-1" name="lab-draw-attempt" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('lab-draw-attempt')}} htmlFor="lab-draw-attempt-1">1</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Lab Draw' data-subfield='2 Attempts' id="lab-draw-attempt-2" name="lab-draw-attempt" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('lab-draw-attempt')}} htmlFor="lab-draw-attempt-2">2</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Lab Draw' data-subfield='US Used' id="lab-draw-us" name="lab-draw-attempt" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('lab-draw-attempt')}} htmlFor="lab-draw-us">US Used</label>
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
                        <input type="checkbox" className="vas-main-select-input vas-multi-select" data-type='multi' data-procedure='Site Care' data-field='IV Flushed' id="site-care-iv-flushed" name="site-care" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('site-care')}} htmlFor="site-care-iv-flushed">IV Flushed</label>
                        <input type="checkbox" className="vas-main-select-input vas-multi-select" data-type='multi' data-procedure='Site Care' data-field='Saline Locked' id="site-care-saline-locked" name="site-care" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('site-care')}} htmlFor="site-care-saline-locked">Saline Locked</label>
                        <input type="checkbox" className="vas-main-select-input vas-multi-select" data-type='multi' data-procedure='Site Care' data-field='Dressing Changed' id="site-care-dressing-changed" name="site-care" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('site-care')}} htmlFor="site-care-dressing-changed">Dressing Changed</label>
                        <input type="checkbox" className="vas-main-select-input vas-multi-select" data-type='multi' data-procedure='Site Care' data-field='Dressing Reinforced' id="site-care-dressing-reinforced" name="site-care" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('site-care')}} htmlFor="site-care-dressing-reinforced">Dressing Reinforced</label>
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
                        <input type="checkbox" className="vas-main-select-input vas-multi-select" data-type='multi' data-procedure='DC IV' data-field='Infiltration' id="dc-iv-infiltration" name="dc-iv" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('dc-iv')}} htmlFor="dc-iv-infiltration">Infiltration</label>
                        <input type="checkbox" className="vas-main-select-input vas-multi-select" data-type='multi' data-procedure='DC IV' data-field='Phlebitis' id="dc-iv-phlebitis" name="dc-iv" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('dc-iv')}} htmlFor="dc-iv-phlebitis">Phlebitis</label>
                        <input type="checkbox" className="vas-main-select-input vas-multi-select" data-type='multi' data-procedure='DC IV' data-field='PT Removed' id="dc-iv-pt-removed" name="dc-iv" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('dc-iv')}} htmlFor="dc-iv-pt-removed">PT Removed</label>
                        <input type="checkbox" className="vas-main-select-input vas-multi-select" data-type='multi' data-procedure='DC IV' data-field='Leaking' id="dc-iv-leaking" name="dc-iv" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('dc-iv')}} htmlFor="dc-iv-leaking">Leaking</label>
                        <input type="checkbox" className="vas-main-select-input vas-multi-select" data-type='multi' data-procedure='DC IV' data-field='Bleeding' id="dc-iv-bleeding" name="dc-iv" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('dc-iv')}} htmlFor="dc-iv-bleeding">Bleeding</label>
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
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='Access' data-subfield='1 Attempt' id="pac-access-attempt-1" name="pac-access" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('pac-access')}} htmlFor="pac-access-attempt-1">1</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='Access' data-subfield='2 Attempts' id="pac-access-attempt-2" name="pac-access" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('pac-access')}} htmlFor="pac-access-attempt-2">2</label>
                      </div>
                    </div>
                    <div className="vas-main-inner-container-main-sub">
                      <header className="vas-main-inner-container-sub-header">
                        <p>Deaccess</p>
                      </header>
                      <div className="vas-main-inner-container-row">
                        <span className="vas-single-select-group">
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='De-Access' data-subfield='Contaminated' id="pac-deaccess-contaminated" name="pac-deaccess" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('pac-deaccess')}} htmlFor="pac-deaccess-contaminated">Contaminated</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='De-Access' data-subfield='Therapy Complete' id="pac-deaccess-therapy-complete" name="pac-deaccess" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('pac-deaccess')}} htmlFor="pac-deaccess-therapy-complete">Therapy Complete</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='De-Access' data-subfield='Needle Change' id="pac-deaccess-needle-change" name="pac-deaccess" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('pac-deaccess')}} htmlFor="pac-deaccess-needle-change">Needle Change</label>
                        </span>
                      </div>
                    </div>
                    <div className="vas-main-inner-container-row">
                      <div className="vas-main-cathflow-container">
                        <button className="btn vas-main-btn vas-main-cathflow-btn" onClick={()=>{this.setState({portacathCathflowActive:!this.state.portacathCathflowActive})}}>Cathflow</button>
                        {this.state.portacathCathflowActive &&
                        <span className="vas-main-cathflow-btn-container">
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='Cathflow' data-subfield='Initiated' id="pac-cathflow-initiated" name="pac-cathflow" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('pac-cathflow')}} htmlFor="pac-cathflow-initiated">Initiated</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='Cathflow' data-subfield='Completed' id="pac-cathflow-completed" name="pac-cathflow" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('pac-cathflow')}} htmlFor="pac-cathflow-completed">Completed</label>
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
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PICC Line' data-field='Removal' data-subfield='Therapy Complete' id="picc-line-therapy-complete" name="picc-line" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('picc-line-removal')}} htmlFor="picc-line-therapy-complete">Therapy Complete</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PICC Line' data-field='Removal' data-subfield='Discharge' id="picc-line-discharge" name="picc-line" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('picc-line-removal')}} htmlFor="picc-line-discharge">Discharge</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PICC Line' data-field='Removal' data-subfield='Clotted' id="picc-line-clotted" name="picc-line" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('picc-line-removal')}} htmlFor="picc-line-clotted">Clotted</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PICC Line' data-field='Removal' data-subfield='Contaminated' id="picc-line-contaminated" name="picc-line" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('picc-line-removal')}} htmlFor="picc-line-contaminated">Contaminated</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PICC Line' data-field='Removal' data-subfield='PT Removal' id="picc-line-pt-removal" name="picc-line" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('picc-line-removal')}} htmlFor="picc-line-pt-removal">PT Removal</label>
                        </span>
                      </div>
                    </div>
                    <div className="vas-main-inner-container-row">
                      <div className="vas-main-cathflow-container">
                        <button className="btn vas-main-btn vas-main-cathflow-btn" onClick={()=>{this.setState({picclineCathflowActive:!this.state.picclineCathflowActive})}}>Cathflow</button>
                        {this.state.picclineCathflowActive &&
                        <span className="vas-main-cathflow-btn-container">
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PICC Line' data-field='Cathflow' data-subfield='Initiated' id="picc-line-cathflow-initiated" name="picc-line-cathflow" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('picc-line-cathflow')}} htmlFor="picc-line-cathflow-initiated">Initiated</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='PICC Line' data-field='Cathflow' data-subfield='Completed' id="picc-line-cathflow-completed" name="picc-line-cathflow" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('picc-line-cathflow')}} htmlFor="picc-line-cathflow-completed">Completed</label>
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
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Dressing Change' data-field='What' data-subfield='PICC' id="dressing-change-picc" name="dressing-change-what" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('dressing-change-what')}} htmlFor="dressing-change-picc">PICC</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Dressing Change' data-field='What' data-subfield='Port-A-Cath' id="dressing-change-pac" name="dressing-change-what" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('dressing-change-what')}} htmlFor="dressing-change-pac">Port-A-Cath</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Dressing Change' data-field='What' data-subfield='Central Line' id="dressing-change-central-line" name="dressing-change-what" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('dressing-change-what')}} htmlFor="dressing-change-central-line">Central Line</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Dressing Change' data-field='What' data-subfield='Midline' id="dressing-change-mid-line" name="dressing-change-what" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('dressing-change-what')}} htmlFor="dressing-change-mid-line">Midline</label>
                        </span>
                      </div>
                    </div>
                    <div className="vas-main-inner-container-main-sub">
                      <header className="vas-main-inner-container-sub-header">
                        <p>Why:</p>
                      </header>
                      <div className="vas-main-inner-container-row">
                        <span className="vas-single-select-group">
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='Why' data-subfield='Per Protocol' id="dressing-change-per-protocol" name="dressing-change-why" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('dressing-change-why')}} htmlFor="dressing-change-per-protocol">Per Protocol</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='Why' data-subfield='Bleeding' id="dressing-change-bleeding" name="dressing-change-why" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('dressing-change-why')}} htmlFor="dressing-change-bleeding">Bleeding</label>
                          <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Port-A-Cath' data-field='Why' data-subfield='Dressing Compromised' id="dressing-change-dressing-compromised" name="dressing-change-why" />
                          <label className="vas-btn" onClick={e=>{this.procedureSelect('dressing-change-why')}} htmlFor="dressing-change-dressing-compromised">Dressing Compromised</label>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="vas-main-inner-container">
                  <header className="vas-main-inner-container-header">
                    <p>Insertion Procedure</p>
                  </header>
                  <div className="vas-main-inner-container-main">
                    <div className="vas-main-inner-container-row">
                      <span className="vas-single-select-group">
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Insertion Procedure' data-field='Midline' id="insertion-procedure-midline" name="insertion-procedure" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('insertion-procedure')}} htmlFor="insertion-procedure-midline">Midline</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Insertion Procedure' data-field='SL PICC' id="insertion-procedure-sl-picc" name="insertion-procedure" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('insertion-procedure')}} htmlFor="insertion-procedure-sl-picc">SL PICC</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Insertion Procedure' data-field='DL PICC' id="insertion-procedure-dl-picc" name="insertion-procedure" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('insertion-procedure')}} htmlFor="insertion-procedure-dl-picc">DL PICC</label>
                        <input type="radio" className="vas-main-select-input vas-single-select" data-procedure='Insertion Procedure' data-field='TL PICC' id="insertion-procedure-tl-picc" name="insertion-procedure" />
                        <label className="vas-btn" onClick={e=>{this.procedureSelect('insertion-procedure')}} htmlFor="insertion-procedure-tl-picc">TL PICC</label>
                      </span>
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

            }
          </div>
          {this.state.modalIsOpen && 
            <Modal 
              getAddedCall={this.getAddedCall}
              closeModal={this.closeModal}
              modalTitle={this.state.modalTitle} 
              selectedIds={this.state.activeBoxesArr} 
              toggleModal={this.toggleHandler}/>
          }
        </div>
    )
  }
}