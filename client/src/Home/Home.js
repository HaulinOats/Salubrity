import React, {Component} from 'react';
import Modal from '../Widgets/Modal/Modal';
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
      activeBoxesArr:[],
      userId:'',
      modalTitle:'',
      activeRecord:null,
      queueItems:[],
      openCalls:[],
      completedCalls:[],
      procedures:[],
      proceduresDone:[],
      currentUser:null,
      procedureValidated:false
    }
    this.toggleHandler = this.toggleHandler.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderEnd = this.sliderEnd.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getAddedCall = this.getAddedCall.bind(this);
    this.handleWindowBeforeUnload = this.handleWindowBeforeUnload.bind(this);
    this.userIdChange = this.userIdChange.bind(this);
    this.handleOpenRecordPress = this.handleOpenRecordPress.bind(this);
    this.handleOpenRecordRelease = this.handleOpenRecordRelease.bind(this);
  }
  
  componentWillMount(){
    const storageActiveRecord = localStorage.getItem('activeRecord');
    const storageUserId = localStorage.getItem('userId');
    if(this.isValidStorageItem(storageActiveRecord)){
      this.setState({activeRecord: JSON.parse(storageActiveRecord)});
    } 
    if(this.isValidStorageItem(storageUserId)){
      this.setState({userId: JSON.parse(storageUserId)});
    }
    setTimeout(()=>{this.stateLoadCalls()}, 0);
  }

  isValidStorageItem(storageItem){
    return storageItem !== 'undefined' && storageItem !== undefined && storageItem !== null && storageItem !== 'null'
  }

  stateLoadCalls(){
    this.getActiveCalls();
    this.getCompletedCalls();
    this.getProcedureData();
    this.getOpenCalls();
    this.getUserById();

    setTimeout(()=>{
      console.log(this.state);
    }, 250);
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

  handleWindowBeforeUnload(){
    localStorage.setItem('activeRecord', JSON.stringify(this.state.activeRecord));
    localStorage.setItem('userId', JSON.stringify(this.state.userId));
  }

  handleOpenRecordPress () {
    this.openRecordPressTimer = setTimeout(() => alert('long press activated'), 3000);
  }

  handleOpenRecordRelease () {
    clearTimeout(this.openRecordPressTimer);
  }

  getUserById(){
    if(this.state.userId.length > 3){
      axios.post('/get-user-by-id', {
        userId:Number(this.state.userId)
      })
      .then(resp=>{
        if(resp.data.error){
          console.log(resp.data.error);
        } else {
          this.setState({currentUser:resp.data});
          window.scrollTo(0,document.body.scrollHeight);
        }
      })
      .catch(err=>{
        console.log(err);
      })
    } else {
      this.setState({currentUser:null});
    }
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

  getCompletedCalls(){
    axios.get('/get-completed-calls')
    .then((resp)=>{
      console.log(resp.data);
      this.setState({completedCalls:resp.data});
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
          this.setState({queueItems:resp.data.placeholderData});
        }
      } else {
        this.setState({queueItems:resp.data});
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
      this.setState({
        modalTitle:"Task Completed",
        modalIsOpen:true,
        endTaskSliderValue:0
      }, ()=>{
        setTimeout(()=>{this.setState({modalIsOpen:false, endTaskSliderValue:0})}, 2000);
        axios.post('/procedure-completed', {
          id:this.state.activeRecord._id,
          proceduresDone,
          completedBy:this.state.userId
        })
        .then(resp=>{
          if(resp.data.error){
            console.log(resp.data.error);
          } else {
            let completedCalls = this.state.completedCalls;
            completedCalls.push(resp.data);
            this.setState({
              activeRecord:null,
              completedCalls
            }, ()=>{
              document.getElementById('queue-tab').click();
            });
          }
        })
        .catch((err)=>{
          console.log(err);
        })
      });
    }
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
      activeBoxesArr:[]
    });
  }

  getAddedCall(addedCall){
    let queue = this.state.queueItems;
    queue.push(addedCall)
    this.setState({queueItems: queue});
  }

  selectJob(job){
    if(!this.state.activeRecord){
      axios.post('/set-call-as-open', {_id:job._id})
      .then((resp)=>{
        if(resp.data.error){
          console.log(resp.data.error);
        } else {
          this.setState({activeRecord:resp.data}, ()=>{
            let queueArr = this.state.queueItems;
            for(let i = queueArr.length - 1; i >= 0; --i){
              console.log(queueArr[i]._id);
              console.log(this.state.activeRecord._id);
              if(queueArr[i] === this.state.activeRecord._id){
                queueArr.splice(i, 1);
              }
            }
            this.setState({queueItems:queueArr});
          });
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
        modalTitle:'Please complete open task or return it to the queue'
      })
    }
  }

  returnToQueue(){
    axios.post('/set-call-as-unopen', {_id:this.state.activeRecord._id})
    .then((resp)=>{
      console.log('call was returned to queue');
      this.setState({activeRecord:null}, ()=>{
        document.getElementById('queue-tab').click();
      });
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

  userIdChange(e){
    this.setState({userId:e.target.value}, this.getUserById);
  }

  render(){
    let nameArr;
    let displayName;
    if(this.state.currentUser){
      nameArr = this.state.currentUser.fullname.split(' ');
      displayName = `${nameArr[0][0]}. ${nameArr[1]}`;
    }
    return(
        <div className="container-fluid vas-home-container">
          <button type="button" className="btn btn-primary vas-queue-addCall" onClick={()=>{this.setState({modalIsOpen:true, modalTitle:"Add Call"})}}>Add Call</button>
          <ul className="nav nav-tabs vas-home-nav-tabs" id="myTab" role="tablist">
            <li className="nav-item vas-home-nav-item">
              <a className="nav-link vas-nav-link active" id="queue-tab" data-toggle="tab" href="#queue" role="tab" aria-controls="queue" aria-selected="true" onClick={e=>{this.getActiveCalls()}}>Queue</a>
            </li>
            <li className="nav-item vas-home-nav-item">
                <a className="nav-link vas-nav-link" id="completed-tab" data-toggle="tab" href="#completed" role="tab" aria-controls="completed" aria-selected="false" onClick={e=>{this.getCompletedCalls()}}>Complete</a>
            </li>
            <li className="nav-item vas-home-nav-item">
                <a className="nav-link vas-nav-link" id="open-tab" data-toggle="tab" href="#open" role="tab" aria-controls="open" aria-selected="false" onClick={e=>{this.getOpenCalls()}}>Open</a>
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
                <col span="1" style={{width: '15%'}}></col>
                <col span="1" style={{width: '55%'}}></col>
                <col span="1" style={{width: '15%'}}></col>
                <col span="1" style={{width: '15%'}}></col>
              </colgroup>
                <thead className="vas-queue-thead">
                  <tr>
                    <th>Room</th>
                    <th>Job</th>
                    <th>Contact</th>
                    <th>Call Time</th>
                  </tr>
                </thead>
                <tbody>
                  {!this.state.queueItems.length &&
                    <tr><td></td><td className="vas-queue-no-items">There are no items currently in the queue</td></tr>
                  }
                  {this.state.queueItems.map((item, index)=>{
                    return(
                      !item.isOpen ?
                        <tr key={index} className="vas-home-table-tr vas-table-tr" onClick={(e)=>{this.selectJob(item)}}>
                          <th>{item.room}</th>
                          <td><i className='vas-table-job-name'>{item.job}</i>{item.job === 'Custom' && ' - ' + item.comment}</td>
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
              <table className="vas-home-table vas-queue-table table">
                <colgroup>
                  <col span="1" style={{width: '15%'}}></col>
                  <col span="1" style={{width: '50%'}}></col>
                  <col span="1" style={{width: '10%'}}></col>
                  <col span="1" style={{width: '15%'}}></col>
                  <col span="1" style={{width: '10%'}}></col>
                </colgroup>
                <thead className="vas-queue-thead">
                  <tr>
                    <th>Room</th>
                    <th>Job Requested</th>
                    <th>Completion Time</th>
                    <th>Completed By</th>
                  </tr>
                </thead>
                <tbody>
                  {!this.state.completedCalls.length &&
                    <tr><td></td><td className="vas-queue-no-items">There are no items completed</td></tr>
                  }
                  {this.state.completedCalls.map((item, index)=>{
                    let startTime = moment(item.createdAt);
                    let endTime = moment(item.completedAt);
                    let hours = endTime.diff(startTime, 'hours');
                    let minutes = endTime.diff(startTime, 'minutes');
                    return(
                      <tr key={index} className="vas-home-table-tr">
                        <th scope="row">{item.room}</th>
                        <td><i className='vas-table-job-name'>{item.job}</i>{item.job === 'Custom' && ' - ' + item.comment}</td>
                        <td>{hours > 0 ? `${hours} Hr` : ''} {minutes} Min</td>
                        <td>{item.completedBy}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="tab-pane fade" id="open" role="tabpanel" aria-labelledby="open-tab">
              <table className="vas-home-table vas-queue-table table">
                <thead className="vas-queue-thead">
                  <tr>
                    <th>Room</th>
                    <th>Job Requested</th>
                    <th>Contact</th>
                    <th>Call Start</th>
                    <th>Return To Queue</th>
                  </tr>
                </thead>
                <tbody>
                  {!this.state.openCalls.length &&
                    <tr><td></td><td className="vas-queue-no-items">There are no items open procedures</td></tr>
                  }
                  {this.state.openCalls.map((item, index)=>{
                    return(
                      <tr key={index} className="vas-home-table-tr" 
                        onTouchStart={this.handleOpenRecordPress} 
                        onTouchEnd={this.handleOpenRecordRelease} 
                        onMouseDown={this.handleOpenRecordPress} 
                        onMouseUp={this.handleOpenRecordRelease} 
                        onMouseLeave={this.handleOpenRecordRelease}>
                        <td>{item.room}</td>
                        <td><i className='vas-table-job-name'>{item.job}</i>{item.job === 'Custom' && ' - ' + item.comment}</td>
                        <td>{item.contact}</td>
                        <td><Moment format='HH:mm'>{item.createdAt}</Moment></td>
                        <td>&times;</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {this.state.activeRecord &&
              <div className="tab-pane fade show" id="home" role="tabpanel" aria-labelledby="active-tab">
                <header className="vas-home-header">
                  <p className="vas-home-header-text">Room: <b>{this.state.activeRecord.room}</b></p>
                  <button className="vas-home-header-btn" onClick={this.resetPage}>Reset Form</button>
                  <button className="vas-home-header-btn" onClick={e=>{this.returnToQueue()}}>Return To Queue</button>
                </header>
                {this.state.activeRecord.comment &&
                  <div className="vas-home-inner-container vas-home-inner-container-main-comment">
                    <header className="vas-home-inner-container-header">
                      <p>Comments</p>
                    </header>
                    <div className="vas-home-inner-container-main">
                      <div className="vas-home-inner-container-row">
                        <p className='vas-home-comment'>{this.state.activeRecord.comment}</p>
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
                                            <input type={group.selectType === 'single' ? 'radio' : 'checkbox'} className={"vas-home-select-input vas-"+ group.selectType +"-select"} id={option.taskId} name={procedure.name.replace(/\s+/g, '') +"_"+ group.groupName.replace(/\s+/g, '')}/>
                                            <label className="vas-btn" htmlFor={option.taskId} onClick={e=>{this.selectButton(e, procedure.name, group.groupName)}}>{option.value}</label>
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
                <div className="vas-home-inner-container vas-home-inner-container-final">
                  <header className="vas-home-inner-container-header vas-home-inner-container-final-header">
                    <p>Complete Task</p>
                  </header>
                  <div className='vas-home-final-container'>
                    <label>Please enter your contact ID:</label>
                    <input
                      type="text"
                      className='vas-home-contact-id'
                      value={this.state.userId}
                      onChange={this.userIdChange} />
                      {this.state.currentUser &&
                        <p className='vas-home-found-user'>{displayName}</p>
                      }
                    {this.state.currentUser &&
                      <div>
                        <p>Slide To Submit Task</p>
                        <input type="range" min="0" max="100" step="1" defaultValue={this.state.endTaskSliderValue} onChange={this.sliderChange} onMouseUp={this.sliderEnd} className="pullee" />
                      </div>
                    }
                  </div>
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