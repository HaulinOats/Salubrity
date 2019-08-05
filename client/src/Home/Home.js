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
    this.handleWindowBeforeUnload = this.handleWindowBeforeUnload.bind(this);
    this.state = {
      modalIsOpen:false,
      endTaskSliderValue:0,
      pivSelected:false,
      labSelected:false,
      activeBoxesArr:[],
      contactId:'',
      modalTitle:'',
      activeRecord:null,
      queueItems:[],
      completedCalls:[],
      procedures:[],
      proceduresDone:[]
    }
  }

  componentWillMount(){
    const storageState = localStorage.getItem('homeState');
    if(storageState !== 'undefined'){
      this.setState(JSON.parse(storageState), this.stateLoadCalls);
    } else {
      this.stateLoadCalls();
    }
  }

  stateLoadCalls(){
    this.getActiveCalls();
    
    axios.get('/get-procedures')
    .then((resp)=>{
      this.setState({procedures:resp.data});
      console.log(resp.data);
    })
    .catch((err)=>{
      console.log(err);
    })

    axios.get('/get-completed-calls')
    .then((resp)=>{
      console.log(resp.data);
      this.setState({completedCalls:resp.data});
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.handleWindowBeforeUnload);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleWindowBeforeUnload);
  }

  handleWindowBeforeUnload(){
    localStorage.setItem('homeState', JSON.stringify(this.state));
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
      let selectedTasks = document.querySelectorAll('.vas-main-select-input:checked');
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
          completedBy:this.state.contactId
        })
        .then((resp)=>{
          let completedCalls = this.state.completedCalls;
          completedCalls.push(resp.data);
          document.getElementById('queue-tab').click();
          this.setState({
            activeRecord:null,
            completedCalls
          }, ()=>{
            this.setStorageItem(true, 'activeRecord');
            document.getElementById('queue-tab').click();
          });
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
        if(resp.data === 'open'){
          this.setState({
            modalIsOpen:true,
            modalTitle:'Record was recently opened by someone else. Please select another queue item. Refreshing queue...'
          }, this.getActiveCalls);
        } else {
          this.setState({activeRecord:job}, ()=>{
            this.setStorageItem(false, 'activeRecord', this.state.activeRecord);
          });
          setTimeout(()=>{
            document.getElementById('open-tab').click();
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

  setStorageItem(isRemove, name, data){
    if(isRemove){
      localStorage.removeItem(name)
    } else {
      localStorage.setItem(name, JSON.stringify(data));
    }
  }

  returnToQueue(){
    axios.post('/set-call-as-unopen', {_id:this.state.activeRecord._id})
    .then((resp)=>{
      console.log(resp.data);
      this.setState({activeRecord:null}, ()=>{
        this.setStorageItem(true, 'activeRecord');
        document.getElementById('queue-tab').click();
      });
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  showHiddenButtons(procedureName, groupName, elClass){
    let className = `.vas-main-${procedureName}-${groupName}`;
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
      let nextGroupContainer = e.target.closest('.vas-main-inner-span').nextSibling;
      nextGroupContainer.querySelector('.vas-main-select-input').checked = true;
    }
  }

  render(){
    return(
        <div className="container-fluid vas-main-container">
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
                    <th>Room</th>
                    <th>Job</th>
                    <th>Contact #</th>
                    <th>Call Time</th>
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
                          <th>{item.room}</th>
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
                    <th>Room</th>
                    <th>Job Requested</th>
                    <th>Contact #</th>
                    <th>Call Start</th>
                    <th>Call End</th>
                    <th>Completed By</th>
                  </tr>
                </thead>
                <tbody>
                  {!this.state.completedCalls.length &&
                    <tr><td className="vas-queue-no-items">There are no items completed</td></tr>
                  }
                  {this.state.completedCalls.map((item, index)=>{
                    return(
                      <tr key={index} className="vas-queue-tr">
                        <th scope="row">{item.room}</th>
                        <td>{item.job}</td>
                        <td>{item.contact}</td>
                        <td><Moment format='HH:mm'>{item.createdAt}</Moment></td>
                        <td><Moment format='HH:mm'>{item.completedAt}</Moment></td>
                        <td>{item.completedBy}</td>
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
                {this.state.activeRecord.comment &&
                  <div className="vas-main-inner-container vas-main-inner-container-main-comment">
                    <header className="vas-main-inner-container-header">
                      <p>Comments</p>
                    </header>
                    <div className="vas-main-inner-container-main">
                      <div className="vas-main-inner-container-row">
                        <p className='vas-main-comment'>{this.state.activeRecord.comment}</p>
                      </div>
                    </div>
                  </div>
                }
                {
                  this.state.procedures.map((procedure, idx)=>{
                    return (
                      <div className="vas-main-inner-container" key={idx}>
                        <header className="vas-main-inner-container-header">
                          <p>{procedure.name}</p>
                        </header>
                        <div className="vas-main-inner-container-main">
                          {
                            procedure.groups.map((group, idx2)=>{
                              return(
                                <span className='vas-main-inner-span' key={idx2}>
                                  {group.groupName === 'Cathflow' &&
                                    <button className='vas-main-cathflow-btn' onClick={e=>{this.showHiddenButtons(procedure.name.replace(/\s+/g, ''), group.groupName.replace(/\s+/g, ''), 'vas-main-important-hide')}}>{group.groupName}</button>
                                  }
                                  {group.groupName !== 'Cathflow' &&
                                    <h3>{group.groupName}</h3>
                                  }
                                  <div className={group.groupName === 'Cathflow' ? 'vas-main-inner-container-row vas-main-important-hide vas-main-' + procedure.name.replace(/\s+/g, '') + '-' + group.groupName.replace(/\s+/g, '')  : 'vas-main-inner-container-row'}>
                                    {
                                      group.groupOptions.map((option, idx3)=>{
                                        return(
                                          <span key={idx3}>
                                            <input type={group.selectType === 'single' ? 'radio' : 'checkbox'} className={"vas-main-select-input vas-"+ group.selectType +"-select"} id={option.taskId} name={procedure.name.replace(/\s+/g, '') +"_"+ group.groupName.replace(/\s+/g, '')}/>
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
                <div className="vas-main-inner-container vas-main-inner-container-final">
                  <header className="vas-main-inner-container-header vas-main-inner-container-final-header">
                    <p>Complete Task</p>
                  </header>
                  <div className='vas-main-final-container'>
                    <label>Please enter your contact ID:</label>
                    <input type="text" className="vas-main-contact-id" value={this.state.contactId} onChange={e => {this.setState({contactId: e.target.value}, ()=>{window.scrollTo(0,document.body.scrollHeight);})}}/>
                    {this.state.contactId.length > 3 &&
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