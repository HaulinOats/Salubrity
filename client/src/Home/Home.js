import React, {Component} from 'react';
import Modal from '../Widgets/Modal/Modal';
import Login from '../Widgets/Login/Login';
import axios from 'axios';
import Moment from 'react-moment';
import moment from 'moment';
import './Home.css';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.state = {
      modalIsOpen:false,
      endTaskSliderValue:0,
      pivSelected:false,
      labSelected:false,
      userId:'',
      modalTitle:'',
      modalMessage:'',
      modalConfirmation:false,
      activeRecord:null,
      queueItems:[],
      openCalls:[],
      completedCalls:[],
      procedures:[],
      allOptions:[],
      proceduresDone:[],
      currentUser:null,
      procedureVerified:false,
      postComments:'',
      hospital:''
    }
    this.toggleHandler = this.toggleHandler.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderEnd = this.sliderEnd.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getConfirmation = this.getConfirmation.bind(this);
    this.getAddedCall = this.getAddedCall.bind(this);
    this.takePicture = this.takePicture.bind(this);
    this.handleWindowBeforeUnload = this.handleWindowBeforeUnload.bind(this);
    this.handleOpenRecordPress = this.handleOpenRecordPress.bind(this);
    this.handleOpenRecordRelease = this.handleOpenRecordRelease.bind(this);
    this.getDateFromObjectId = this.getDateFromObjectId.bind(this);
    this.addCall = this.addCall.bind(this);
    this.deleteCall = this.deleteCall.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
    this.logout = this.logout.bind(this);
  }
  
  componentWillMount(){
    const storagecurrentUser = localStorage.getItem('currentUser');
    if(this.isValidStorageItem(storagecurrentUser)){
      this.setState({currentUser:JSON.parse(storagecurrentUser)});
    }
    setTimeout(()=>{this.stateLoadCalls()}, 0);
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.handleWindowBeforeUnload);
    if(this.state.activeRecord){
      document.getElementById('active-tab').click();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleWindowBeforeUnload);
  }

  isValidStorageItem(storageItem){
    return storageItem !== 'undefined' && storageItem !== undefined && storageItem !== null && storageItem !== 'null'
  }

  handleUserSessionData(){
    if(this.state.currentUser){
      //Allow user session access for 30 minutes (1800 seconds)
      //if it's been more than 30 minutes since last login, logout user
      if(Math.floor(Date.now() / 1000) - this.state.currentUser.lastLogin > 1800){
        this.logout();
      } else {
        //if user has refreshed at any point and it's been less than 30 minutes, refresh session
        let currentUser = {...this.state.currentUser}
        currentUser.lastLogin = Math.floor(Date.now() / 1000);
        this.setState({currentUser}, ()=>{
          console.log(currentUser);
          this.stateLoadCalls();
        });
      }
    }
  }

  loginCallback(user){
    let currentUser = user;
    currentUser.lastLogin = Math.floor(Date.now() / 1000);
    this.setState({currentUser:user}, this.stateLoadCalls);
  }

  logout(){
    this.setState({currentUser:null, activeRecord:null});
  }

  stateLoadCalls(){
    if(this.state.currentUser){
      this.getActiveCalls();
      this.getCompletedCalls();
      this.getProcedureData();
      this.getOptionsData();
      this.getOpenCalls();
      setTimeout(()=>{
        console.log(this.state);
      }, 250);
    }
  }

  getDateFromObjectId(objId){
    return new Date(parseInt(objId.substring(0, 8), 16) * 1000);
  }

  handleWindowBeforeUnload(){
    localStorage.setItem('currentUser', JSON.stringify(this.state.currentUser));
  }

  handleOpenRecordPress () {
    this.openRecordPressTimer = setTimeout(() => alert('long press activated'), 3000);
  }

  handleOpenRecordRelease () {
    clearTimeout(this.openRecordPressTimer);
  }

  addCall(){
    this.setState({
      modalTitle:'Add Call',
      modalIsOpen:true
    })
  }

  takePicture(){
    var video = document.getElementById('vas-home-label-video');
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.style.width = '350px';
    video.style.height = '200px';
    
    /* Setting up the constraint */
    var facingMode = "environment"; //user for user facing camera
    var constraints = {
      audio: false,
      video: {
       facingMode: facingMode
      }
    };
    
    /* Stream it to video element */
    navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
      video.srcObject = stream;
    });
  }

  getOpenCalls(){
    axios.get('/get-open-calls')
    .then((resp)=>{
      this.setState({openCalls:resp.data});
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  getProcedureData(){
    axios.get('/get-procedures')
    .then((resp)=>{
      this.setState({procedures:resp.data});
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  getOptionsData(){
    axios.get('/get-options')
    .then((resp)=>{
      this.setState({allOptions:resp.data});
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  getCompletedCalls(){
    axios.get('/get-completed-calls')
    .then((resp)=>{
      console.log(resp.data);
      if(resp.data.error){
        console.log(resp.data.error);
      } else {
        this.setState({completedCalls:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  getActiveCalls(){
    axios.get('/get-active-calls')
    .then((resp)=>{
      if(resp.data.error){
        console.log(resp.data.error);
        if(resp.data.placeholderData){
          this.setState({queueItems:resp.data.placeholderData, activeRecord:null});
        }
      } else {
        this.setState({queueItems:resp.data}, ()=>{
          for(let i = 0; i < this.state.queueItems.length; i++){
            if(this.state.queueItems[i].openBy && this.state.queueItems[i].openBy === this.state.currentUser.userId){
              this.setState({activeRecord:this.state.queueItems[i]});
              break;
            }
          }
        });
      }
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
    console.log(e.target.value);
    if(e.target.value < 100){
      this.setState({
        endTaskSliderValue:e.target.value
      })
    } else {
      let selectedTasks = document.querySelectorAll('.vas-home-select-input:checked');
      let proceduresDone = [];
      selectedTasks.forEach((el)=>{
        proceduresDone.push(Number(el.id));
      });
      if(this.procedureVerified(proceduresDone)){
        axios.post('/procedure-completed', {
          _id:this.state.activeRecord._id,
          proceduresDone,
          completedBy:Number(this.state.currentUser.userId),
          postComments:this.state.postComments.length ? this.state.postComments : null,
          hospital:Number(this.state.hospital)
        })
        .then(resp=>{
          if(resp.data.error){
            console.log(resp.data.error);
          } else {
            this.setState({
              activeRecord:null,
              modalTitle:'Task Complete',
              modalMessage:'Procedure was completed. Returning to queue.',
              modalIsOpen:true,
            }, ()=>{
              document.getElementById('queue-tab').click();
              setTimeout(()=>{
                this.setState({
                modalIsOpen:false,
                modalTitle:'',
                modalMessage:'',
                endTaskSliderValue:0
              })}, 2000);
            });
          }
        })
        .catch((err)=>{
          console.log(err);
        })
      }
    }
  }

  procedureVerified(proceduresList){
    let errors = '';
    if(!proceduresList.length){
      errors += '- You must select atleast 1 procedure\n';
    }
    if(!this.state.hospital.length || this.state.hospital === 'default'){
      errors += '- You must select a hospital\n';
    }
    if(errors.length){
      this.setState({
        modalIsOpen:true, 
        modalTitle:'Cannot Submit Procedure',
        modalMessage:errors,
        endTaskSliderValue:0
      });
      return false;
    }
    return true;
  }

  sliderEnd(e){
    if(this.state.endTaskSliderValue < 100){
      this.setState({endTaskSliderValue:0})
      e.target.value = 0;
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
    this.setState({
      modalIsOpen:false,
      modalMessage:'',
      modalTitle:'',
      modalConfirmation:false
    });
  }

  getConfirmation(isConfirmed){
    if(isConfirmed){
      axios.post('/delete-call', {
        _id:this.state.activeRecord._id
      })
      .then(resp=>{
        if(resp.data){
          this.setState({activeRecord:null}, ()=>{
            document.getElementById('queue-tab').click();
          });
        }
      })
      .catch(err=>{
        console.log(err);
        alert('error deleting record');
      })
    }
  }

  getAddedCall(addedCall){
    let queue = this.state.queueItems;
    queue.push(addedCall)
    this.setState({queueItems: queue});
  }

  selectJob(job){
    if(!this.state.activeRecord){
      axios.post('/set-call-as-open', {
        _id:job._id,
        userId:this.state.currentUser.userId
      })
      .then((resp)=>{
        if(resp.data.error){
          console.log(resp.data.error);
        } else {
          this.setState({activeRecord:resp.data});
          setTimeout(()=>{
            document.getElementById('active-tab').click();
          }, 0);
        }
      })
      .catch((err)=>{
        console.log(err);
      })
    } else {
      this.setState({
        modalIsOpen:true,
        modalTitle:'Record Already Open',
        modalMessage:'Please complete open task or return it to the queue'
      })
    }
  }

  returnToQueue(){
    axios.post('/set-call-as-unopen', {
      _id:this.state.activeRecord._id
    })
    .then((resp)=>{
      if(resp.data.error){
        console.log(resp.data.error)
      } else {
        console.log(resp.data);
        console.log('call was returned to queue');
        this.setState({activeRecord:null}, ()=>{
          document.getElementById('queue-tab').click();
        });
      }
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  showHiddenButtons(procedureName, groupName, elClass){
    let className = `.vas-home-${procedureName}-${groupName}`;
    let container = document.querySelector(className);
    if(container.classList.contains(elClass)){
      container.classList.remove(elClass);
      let containerInputs = document.querySelectorAll(`${className} input`);
      containerInputs.forEach((el)=>{
        el.checked = false;
      });
    } else {
      container.classList.add(elClass)
    }
  }

  selectButton(e, procedureName, groupName){
    if(procedureName === 'PIV Start'){
      if(groupName === 'Dosage'){
        selectFirstButtonNextGroup();
      }
    }
    if(procedureName === 'Lab Draw'){
      if(groupName === 'Draw Type'){
        selectFirstButtonNextGroup();
      }
    }
    function selectFirstButtonNextGroup(){
      let nextGroupContainer = e.target.closest('.vas-home-inner-span').nextSibling;
      nextGroupContainer.querySelector('.vas-home-select-input').checked = true;
    }
  }

  deleteCall(){
    this.setState({
      modalTitle:'Delete Active Record?',
      modalMessage:'Are you sure you want to delete the currently active record?',
      modalIsOpen:true,
      modalConfirmation:true
    });
  }

  hospitalChange(e){
    if(e.target.value !== 'default'){
      this.setState({hospital:e.target.value});
      console.log(this.state);
    } else {
      this.setState({hospital:null});
    }
  }

  render(){
    return(
      <div>
        {!this.state.currentUser &&
          <Login loginType={'user'} loginCallback={this.loginCallback}/>
        }
        {this.state.currentUser &&
          <div className="container-fluid vas-home-container">
            <header className='vas-home-main-header'>
              <ul className='vas-home-main-header-left'>
                <li className='vas-home-header-title'>VAS Tracker</li>
                <li className='vas-home-header-option'><button onClick={this.addCall}>Add Call</button></li>
                {/* <li className='vas-home-header-option'><button onClick={this.takePicture}>Take Picture</button></li> */}
              </ul>
              <span>
                <ul className='vas-home-header-ul'>
                  <li className='vas-home-main-header-user'>{this.state.currentUser.fullname}</li>
                  <li><button className='vas-home-main-header-logout' onClick={this.logout}>Logout</button></li>
                </ul>
              </span>
            </header>
            <ul className="nav nav-tabs vas-home-nav-tabs" id="myTab" role="tablist">
              <li className="nav-item vas-home-nav-item">
                <a className="nav-link vas-nav-link active" id="queue-tab" data-toggle="tab" href="#queue" role="tab" aria-controls="queue" aria-selected="true" onClick={e=>{this.getActiveCalls()}}>Queue</a>
              </li>
              <li className="nav-item vas-home-nav-item">
                  <a className="nav-link vas-nav-link" id="completed-tab" data-toggle="tab" href="#completed" role="tab" aria-controls="completed" aria-selected="false" onClick={e=>{this.getCompletedCalls()}}>Complete</a>
              </li>
              {this.state.activeRecord &&
                <li className="nav-item vas-home-nav-item">
                  <a className="nav-link vas-nav-link" id="active-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="false">Active Record</a>
                </li>
              }
            </ul>
            <div className="tab-content vas-home-tabContent" id="myTabContent">
              <div className="tab-pane fade show active" id="queue" role="tabpanel" aria-labelledby="queue-tab">
                <table className="vas-home-table vas-table table">
                <colgroup>
                  <col span="1" style={{width: '10%'}}></col>
                  <col span="1" style={{width: '50%'}}></col>
                  <col span="1" style={{width: '10%'}}></col>
                  <col span="1" style={{width: '15%'}}></col>
                  <col span="1" style={{width: '15%'}}></col>
                </colgroup>
                  <thead>
                    <tr className='vas-table-thead-row'>
                      <th>Room</th>
                      <th>Job</th>
                      <th>Contact</th>
                      <th>Call Time</th>
                      <th>Open By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!this.state.queueItems.length &&
                      <tr><td></td><td className="vas-queue-no-items">There are no items currently in the queue</td></tr>
                    }
                    {this.state.queueItems.map((item, index)=>{
                      return(
                        <tr key={index} className={'vas-home-table-tr vas-table-tr vas-table-tbody-row ' + (item.openBy ? 'vas-home-table-row-is-open' : '')} onClick={(e)=>{this.selectJob(item)}}>
                          <th>{item.room}</th>
                          <td><i className='vas-table-job-name'>{item.job}</i>{item.job === 'Custom' && ' - ' + item.preComments}</td>
                          <td>{item.contact}</td>
                          <td><Moment format='HH:mm'>{item.createdAt}</Moment></td>
                          <td>{item.openBy ? item.openBy : ''}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="tab-pane fade" id="completed" role="tabpanel" aria-labelledby="completed-tab">
                <table className="vas-home-table vas-queue-table table">
                  <thead className="vas-queue-thead">
                    <tr className='vas-table-thead-row'>
                      <th className='w-10'>Room</th>
                      <th className='w-30'>Job Requested</th>
                      <th className='w-10'>Done By</th>
                      <th className='w-10'>Call Time</th>
                      <th className='w-10'>Start Time</th>
                      <th className='w-15'>End Time</th>
                      <th className='w-15'>Response Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!this.state.completedCalls.length &&
                      <tr><td></td><td className="vas-queue-no-items">There are no items completed</td></tr>
                    }
                    {this.state.completedCalls.map((item, index)=>{
                      let startTime = moment(this.getDateFromObjectId(item._id));
                      let responseTime = moment(item.startTime);
                      let responseHours = responseTime.diff(startTime, 'hours');
                      let responseMinutes = responseTime.diff(startTime, 'minutes');
                      // let completionTime = moment(item.completedAt);
                      // let completionHours = completionTime.diff(startTime, 'hours');
                      // let completedMinutes = completionTime.diff(startTime, 'minutes');
                      return(
                        <tr key={index} className='vas-table-tbody-row'>
                          <td>{item.room}</td>
                          <td><i className='vas-table-job-name'>{item.job}</i></td>
                          <td>{item.completedBy}</td>
                          <td><Moment format='HH:mm'>{this.getDateFromObjectId(item._id)}</Moment></td>
                          <td><Moment format='HH:mm'>{item.startTime}</Moment></td>
                          <td><Moment format='HH:mm'>{item.completedAt}</Moment></td>
                          <td>{responseHours > 0 ? `${responseHours} Hr` : ''} {responseMinutes} Min</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {this.state.activeRecord &&
                <div className="tab-pane fade show" id="home" role="tabpanel" aria-labelledby="active-tab">
                  <header className="vas-home-record-header">
                    <p className="vas-home-record-header-text"><b>{this.state.activeRecord.job}</b></p>
                    <p className="vas-home-record-header-subtext">Room: <b>{this.state.activeRecord.room}</b></p>
                    <button className="vas-home-record-header-btn" onClick={this.resetPage}>Reset Form</button>
                    <button className="vas-home-record-header-btn" onClick={e=>{this.returnToQueue()}}>Return To Queue</button>
                    <button className='vas-home-record-header-btn vas-warn-btn' onClick={this.deleteCall}>Delete Call</button>
                    <div className='vas-home-options-container'>
                      {this.state.allOptions.map((option, idx)=>{
                        return(
                          <div className='vas-home-option-inner' key={idx}>
                            <label>{option.name}:</label>
                            {option.inputType === 'dropdown' &&
                              <select value={this.state.hospital} onChange={e=>{this.hospitalChange(e)}}>
                                <option value='default'>Select A Hospital</option>
                                {option.options.map((subOption, idx2)=>{
                                  return <option key={idx2} value={subOption.value}>{subOption.text}</option>
                                })}
                              </select>
                            }
                          </div>
                        )})
                      }  
                    </div>
                  </header>
                  {this.state.activeRecord.preComments &&
                    <div className="vas-home-inner-container vas-home-inner-container-main-comment">
                      <header className="vas-home-inner-container-header">
                        <p>Procedure Comments</p>
                      </header>
                      <div className="vas-home-inner-container-main">
                        <div className="vas-home-inner-container-row">
                          <p className='vas-home-comment'>{this.state.activeRecord.preComments}</p>
                        </div>
                      </div>
                    </div>
                  }
                  {
                    this.state.procedures.map((procedure, idx)=>{
                      return (
                        <div className="vas-home-inner-container" key={idx}>
                          <header className="vas-home-inner-container-header">
                            <p>{procedure.name}</p>
                          </header>
                          <div className="vas-home-inner-container-main">
                            {
                              procedure.groups.map((group, idx2)=>{
                                return(
                                  <span className='vas-home-inner-span' key={idx2}>
                                    {group.groupName === 'Cathflow' &&
                                      <button className='vas-home-cathflow-btn' onClick={e=>{this.showHiddenButtons(procedure.name.replace(/\s+/g, ''), group.groupName.replace(/\s+/g, ''), 'vas-home-important-hide')}}>{group.groupName}</button>
                                    }
                                    {group.groupName !== 'Cathflow' &&
                                      <h3>{group.groupName}</h3>
                                    }
                                    <div className={group.groupName === 'Cathflow' ? 'vas-home-inner-container-row vas-home-important-hide vas-home-' + procedure.name.replace(/\s+/g, '') + '-' + group.groupName.replace(/\s+/g, '')  : 'vas-home-inner-container-row'}>
                                      {
                                        group.groupOptions.map((option, idx3)=>{
                                          return(
                                            <span key={idx3}>
                                              <input type={group.inputType} className={"vas-home-select-input vas-"+ group.inputType +"-select"} id={option.taskId} name={procedure.name.replace(/\s+/g, '') +"_"+ group.groupName.replace(/\s+/g, '')}/>
                                              {group.inputType !== 'number' &&
                                                <label className="vas-btn" htmlFor={option.taskId} onClick={e=>{this.selectButton(e, procedure.name, group.groupName)}}>{option.value}</label>
                                              }
                                            </span>
                                          )
                                        })
                                      }
                                    </div>
                                  </span>
                                )
                              })
                            }
                            </div>
                          </div>
                        
                      )
                    })
                  }
                  <div className='vas-home-inner-container'>
                    <header className='vas-home-inner-container-header'>
                      <p>Additional Comments</p>
                    </header>
                    <div className='vas-home-inner-container-main'>
                      <textarea className='vas-home-post-comments' value={this.state.postComments} onChange={e=>{this.setState({postComments:e.target.value})}}></textarea>
                    </div>
                  </div>
                  {/* <div className='vas-home-inner-container'>
                    <header className='vas-home-inner-container-header'>
                      <p>Snapshot Label</p>
                    </header>
                    <div className='vas-home-inner-container-main'>
                      <video id='vas-home-label-video' />
                    </div>
                  </div> */}
                  <div className="vas-home-inner-container vas-home-inner-container-final">
                    <header className="vas-home-inner-container-header vas-home-inner-container-final-header">
                      <p>Complete Task</p>
                    </header>
                    <div className='vas-home-final-container'>
                      <div>
                        <p>Slide To Submit Task</p>
                        <input type="range" min="0" max="100" step="1" defaultValue={this.state.endTaskSliderValue} onChange={this.sliderChange} onMouseUp={this.sliderEnd} className="pullee" />
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
            {this.state.modalIsOpen && 
              <Modal 
                isConfirmation={this.state.modalConfirmation}
                currentUser={this.state.currentUser}
                getAddedCall={this.getAddedCall}
                getConfirmation={this.getConfirmation}
                closeModal={this.closeModal}
                modalTitle={this.state.modalTitle} 
                modalMessage={this.state.modalMessage}
                toggleModal={this.toggleHandler}/>
            }
          </div>
        }
      </div>
    )
  }
}