import React, {Component} from 'react';
import Modal from '../Widgets/Modal/Modal';
import Login from '../Widgets/Login/Login';
import axios from 'axios';
import Moment from 'react-moment';
import moment from 'moment';
import './Home.css';
import refreshImg from '../../public/refresh.png';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.state = {
      activeHomeTab:'queue',
      modalIsOpen:false,
      endTaskSliderValue:0,
      userId:'',
      modalTitle:'',
      modalMessage:'',
      modalConfirmation:false,
      confirmationType:null,
      activeRecord:null,
      queueItems:[],
      openCalls:[],
      completedCalls:[],
      procedures:[],
      allOptions:[],
      allItems:[],
      selectedProcedures:[],
      currentUser:null,
      procedureVerified:false,
      addComments:'',
      hospital:'',
      insertionTypeSelected:false,
      insertionLength:'',
      circumference:'',
      customFields:[],
      mrn:'',
      provider:''
      
    }
    this.toggleHandler = this.toggleHandler.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderEnd = this.sliderEnd.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getConfirmation = this.getConfirmation.bind(this);
    this.getAddedCall = this.getAddedCall.bind(this);
    this.handleWindowBeforeUnload = this.handleWindowBeforeUnload.bind(this);
    this.handleOpenRecordPress = this.handleOpenRecordPress.bind(this);
    this.handleOpenRecordRelease = this.handleOpenRecordRelease.bind(this);
    this.getDateFromObjectId = this.getDateFromObjectId.bind(this);
    this.addCall = this.addCall.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
    this.logout = this.logout.bind(this);
  }
  
  componentWillMount(){
    const storagecurrentUser = localStorage.getItem('currentUser');
    const storageActiveTab = localStorage.getItem('activeHomeTab');
    if(this.isValidStorageItem(storagecurrentUser)){
      this.setState({currentUser:JSON.parse(storagecurrentUser)});
    }
    if(this.isValidStorageItem(storageActiveTab)){
      this.setState({activeHomeTab:JSON.parse(storageActiveTab)});
    }
    setTimeout(()=>{this.stateLoadCalls()}, 0);
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.handleWindowBeforeUnload);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleWindowBeforeUnload);
  }

  handleWindowBeforeUnload(){
    localStorage.setItem('currentUser', JSON.stringify(this.state.currentUser));
    localStorage.setItem('activeHomeTab', JSON.stringify(this.state.activeHomeTab));
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
      this.getItemsData();
      this.getOpenCalls();
      setTimeout(()=>{
        console.log(this.state);
      }, 250);
    }
  }

  getDateFromObjectId(objId){
    if(objId){
      return new Date(parseInt(objId.substring(0, 8), 16) * 1000);
    }
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

  getOpenCalls(){
    axios.get('/get-open-calls')
    .then((resp)=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({openCalls:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  getProcedureData(){
    axios.get('/get-procedures')
    .then((resp)=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({procedures:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  getOptionsData(){
    axios.get('/get-options')
    .then((resp)=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({allOptions:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  getItemsData(){
    axios.get('/get-items')
    .then((resp)=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        let items = {};
        resp.data.forEach(item=>{
          items[item.itemId] = item;
        })
        this.setState({allItems:items});
      }
    })
    .catch((err)=>{
      console.log(err);
    })
  }

  getCompletedCalls(){
    axios.get('/get-completed-calls')
    .then((resp)=>{
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
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
      console.log(resp.data);
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
        this.setState({queueItems:[]});
      } else {
        this.setState({queueItems:resp.data}, ()=>{
          let activeRecordExists = false;
          for(let i = 0; i < this.state.queueItems.length; i++){
            if(this.state.queueItems[i].openBy && this.state.queueItems[i].openBy === this.state.currentUser.userId){
              this.setState({activeRecord:this.state.queueItems[i]});
              activeRecordExists = true;
              break;
            }
          }
          if(!activeRecordExists){
            this.setState({activeHomeTab:'queue'});
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
      let proceduresArr = this.createProcedureObject();
      if(this.procedureVerified(proceduresArr)){
        // grab custom input values if a procedure was selected that has them
        //check if any procedures have required fields
        for(let i = 0; i < proceduresArr.length; i++){
          //Insertion Procedure
          if(proceduresArr[i].procedureId === 8){
            proceduresArr[i].itemIds.push(54, 55);
            proceduresArr[i].customValues = {
              '54': Number(this.state.insertionLength),
              '55': Number(this.state.circumference)
            }
          }
        }

        let completionTime = new Date();
        let callTime = this.getDateFromObjectId(this.state.activeRecord._id);
        let startTime = new Date(this.state.activeRecord.startTime);

        axios.post('/procedure-completed', {
          _id:this.state.activeRecord._id,
          proceduresDone:proceduresArr,
          completedBy:Number(this.state.currentUser.userId),
          completedAt:completionTime.toISOString(),
          addComments:this.state.addComments.length ? this.state.addComments : null,
          hospital:Number(this.state.hospital),
          mrn:Number(this.state.mrn),
          provider:this.state.provider,
          procedureTime:completionTime - startTime,
          responseTime:startTime - callTime
        })
        .then(resp=>{
          if(resp.data.error || resp.data._message){
            console.log(resp.data);
          } else {
            this.setState({
              activeRecord:null,
              modalTitle:'Task Complete',
              modalMessage:'Procedure was completed. Returning to queue.',
              modalIsOpen:true,
              activeHomeTab:'queue'
            }, ()=>{
              setTimeout(()=>{
                window.location.reload();
              }, 2000);
            });
          }
        })
        .catch((err)=>{
          console.log(err);
        })
      }
    }
  }

  createProcedureObject(){
    let procedureObj = {};
    let selectedTasks = document.querySelectorAll('.vas-home-select-input:checked');
    selectedTasks.forEach((el)=>{
      let itemId = Number(el.id);
      let procedureId = Number(el.getAttribute('data-procedureid'));
      if(!procedureObj.hasOwnProperty(procedureId)){
        procedureObj[procedureId] = []
      }
      procedureObj[procedureId].push(itemId);
    });

    let procedureArr = [];
    let procedureObjKeys = Object.keys(procedureObj);
    for(let key of procedureObjKeys){
      procedureArr.push({
        procedureId:Number(key),
        itemIds:procedureObj[key]
      })
    }

    return procedureArr
  }

  procedureVerified(proceduresList){
    let errors = '';
    if(!proceduresList.length){
      errors += '- You must select at least 1 procedure\n';
    }
    if(!this.state.hospital.length || this.state.hospital === 'default'){
      errors += '- You must select a hospital\n';
    }
    if(this.state.insertionTypeSelected && (!this.state.insertionLength.length || !this.state.circumference.length)){
      errors += '- You must enter values for Insertion Length and Circumference\n';
    }
    if(this.state.mrn.length !== 7){
      errors += '- Medical Record Number must be 7 digits long\n';
    }
    if(!this.state.provider.length){
      errors += '- You must enter a provider name\n';
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

  closeModal(){
    this.setState({
      modalIsOpen:false,
      modalMessage:'',
      modalTitle:'',
      modalConfirmation:false,
      confirmationType:null
    });
  }

  clickQueueTab(){
    this.setState({activeHomeTab:'queue'}, this.getActiveCalls());
    document.querySelector('.vas-home-refresh').classList.toggle('vas-refresh-animate');
  }

  getConfirmation(isConfirmed){
    if(isConfirmed){
      if(this.state.confirmationType){
        if(this.state.confirmationType === 'delete-call'){
          axios.post('/delete-call', {
            _id:this.state.activeRecord._id
          })
          .then(resp=>{
            if(resp.data){
              this.setState({activeRecord:null, activeHomeTab:'queue'}, ()=>{
                window.location.reload();
              });
            }
          })
          .catch(err=>{
            console.log(err);
            alert('error deleting record');
          })
        }
        if(this.state.confirmationType === 'reset-page'){
          window.location.reload();
        }
      }
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
        if(resp.data.error || resp.data._message){
          console.log(resp.data);
        } else {
          this.setState({activeRecord:resp.data, activeHomeTab:'active'});
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
      if(resp.data.error || resp.data._message){
        console.log(resp.data.error)
      } else {
        this.setState({activeRecord:null, activeHomeTab:'queue'}, this.getActiveCalls());
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
        checkSiblings();
      }
    }
    if(procedureName === 'Lab Draw'){
      if(groupName === 'Draw Type'){
        checkSiblings();
      }
    }
    if(procedureName === 'Dressing Change'){
      if(groupName === 'What'){
        checkSiblings();
      }
    }
    if(procedureName === 'Insertion Procedure'){
      if(groupName === 'Insertion Type'){
        this.setState({insertionTypeSelected:true});
        document.querySelectorAll('.vas-home-inner-span[data-procedure="InsertionProcedure"]').forEach((el)=>{
          el.style.display = 'inline';
        })
        checkSiblings();
      }
    }

    function checkSiblings(){
      let groupContainer = e.target.closest('.vas-home-inner-span');
      while(groupContainer.nextSibling){
        groupContainer.nextSibling.querySelector('.vas-home-select-input').checked = true;
        groupContainer = groupContainer.nextSibling;
      }
    }
  }

  changeCustomInput(e, fieldName){
    console.log(e);
    console.log(fieldName);
    this.setState({[fieldName]:e.target.value}, ()=>{
      console.log(this.state);
    });
  }

  resetForm(){
    this.setState({
      modalTitle:'Reset Form?',
      modalMessage:'Are you sure you want to reset the current form?',
      modalIsOpen:true,
      modalConfirmation:true,
      confirmationType:'reset-page'
    });
  }

  deleteCall(){
    this.setState({
      modalTitle:'Delete Active Record?',
      modalMessage:'Are you sure you want to delete the currently active record?',
      modalIsOpen:true,
      modalConfirmation:true,
      confirmationType:'delete-call'
    });
  }

  hospitalChange(e){
    if(e.target.value !== 'default'){
      this.setState({hospital:e.target.value});
    } else {
      this.setState({hospital:null});
    }
  }

  procedureOptionCustomChange(e, field){
    this.setState({[field]:e.target.value});
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
            <ul className='vas-home-nav-tabs'>
              <li className='vas-home-nav-item' data-isactive={this.state.activeHomeTab === 'queue' ? true : false} onClick={e=>{this.clickQueueTab()}}>Queue <img className='vas-home-refresh' src={refreshImg} alt="refresh" onClick={e=>{this.animateRefresh(e)}}/></li>
              <li className='vas-home-nav-item' data-isactive={this.state.activeHomeTab === 'complete' ? true : false} onClick={e=>{this.setState({activeHomeTab:'complete'})}}>Completed</li>
              {this.state.activeRecord &&
                <li className='vas-home-nav-item' data-isactive={this.state.activeHomeTab === 'active' ? true : false} onClick={e=>{this.setState({activeHomeTab:'active'})}}>Active/Open</li>
              }
            </ul>
            <div className="vas-home-tabContent">
              <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'queue' ? true : false}>
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
                          <td><i className='vas-table-job-name'>{item.job}</i>{item.job === 'Custom' && ' - ' + item.jobComments}</td>
                          <td>{item.contact}</td>
                          <td><Moment format='HH:mm'>{this.getDateFromObjectId(item._id)}</Moment></td>
                          <td>{item.openBy ? item.openBy : ''}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'complete' ? true : false}>
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
                      let responseMinutes = responseTime.diff(startTime, 'minutes') % 60;
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
              {this.state.activeRecord && Object.keys(this.state.allItems).length &&
                <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'active' ? true : false}>
                  <header className="vas-home-record-header">
                    <p className="vas-home-record-header-text"><b>{this.state.activeRecord.job}</b></p>
                    <p className="vas-home-record-header-subtext">Room: <b>{this.state.activeRecord.room}</b></p>
                    <button className="vas-home-record-header-btn" onClick={e=>{this.resetForm()}}>Reset Form</button>
                    <button className="vas-home-record-header-btn" onClick={e=>{this.returnToQueue()}}>Return To Queue</button>
                    <button className='vas-home-record-header-btn vas-warn-btn' onClick={e=>{this.deleteCall()}}>Delete Call</button>
                  </header>
                  <div className='vas-home-options-container'>
                    {this.state.allOptions.map((option, idx)=>{
                      let isCustomInput = (option.inputType === 'number' || option.inputType === 'text') ? true : false;
                      return(
                        <div className='vas-home-option-inner' key={idx}>
                          <label>{option.name}:</label>
                          {option.callFieldName === 'hospital' &&
                            <select value={this.state.hospital} onChange={e=>{this.hospitalChange(e)}}>
                              <option value='default'>Select A Hospital</option>
                              {option.options.map((subOption, idx2)=>{
                                return <option key={idx2}value={subOption.id}>{subOption.name}</option>
                              })}
                            </select>
                          }
                          {isCustomInput &&
                            <input className='vas-custom-input' type={option.inputType} value={this.state[option.callFieldName]} onChange={e=>{this.procedureOptionCustomChange(e, option.callFieldName)}} />
                          }
                        </div>
                      )})
                    }  
                  </div>
                  {this.state.activeRecord.jobComments &&
                    <div className="vas-home-inner-container vas-home-inner-container-main-comment">
                      <header className="vas-home-inner-container-header">
                        <p>Procedure Comments</p>
                      </header>
                      <div className="vas-home-inner-container-main">
                        <div className="vas-home-inner-container-row">
                          <p className='vas-home-comment'>{this.state.activeRecord.jobComments}</p>
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
                                  <span className='vas-home-inner-span' data-procedure={procedure.name.replace(/\s+/g, '')} data-idx={idx2} key={idx2}>
                                    {group.groupName === 'Cathflow' &&
                                      <button className='vas-home-cathflow-btn' onClick={e=>{this.showHiddenButtons(procedure.name.replace(/\s+/g, ''), group.groupName.replace(/\s+/g, ''), 'vas-home-important-hide')}}>{group.groupName}</button>
                                    }
                                    {group.groupName !== 'Cathflow' &&
                                      <h3>{group.groupName}</h3>
                                    }
                                    <div className={group.groupName === 'Cathflow' ? 'vas-home-inner-container-row vas-home-important-hide vas-home-' + procedure.name.replace(/\s+/g, '') + '-' + group.groupName.replace(/\s+/g, '')  : 'vas-home-inner-container-row'}>
                                      {group.groupItems.map((itemId, idx3)=>{
                                          let customInput = (group.inputType === 'number' || group.inputType === 'text') ? true : false;
                                          return(
                                            <span key={idx3}>
                                              {!customInput &&
                                                <span>
                                                  <input type={group.inputType} className={"vas-home-select-input vas-"+ group.inputType +"-select"} data-procedureid={procedure.procedureId} data-procedurename={procedure.name} data-groupname={group.groupName} data-value={this.state.allItems[itemId].value} id={itemId} name={procedure.name.replace(/\s+/g, '') +"_"+ group.groupName.replace(/\s+/g, '')}/>
                                                  <label className="vas-btn" htmlFor={itemId} onClick={e=>{this.selectButton(e, procedure.name, group.groupName)}}>{this.state.allItems[itemId].value}</label>
                                                </span>
                                              }
                                              {customInput &&
                                                <span>
                                                  <input type={group.inputType} onChange={e=>{this.changeCustomInput(e, group.fieldName)}} placeholder={this.state.allItems[itemId].value} className={"vas-custom-input vas-home-select-input vas-"+ group.inputType +"-select"} id={itemId} />
                                                </span>
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
                      <textarea className='vas-home-post-comments' value={this.state.addComments} onChange={e=>{this.setState({addComments:e.target.value})}}></textarea>
                    </div>
                  </div>
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