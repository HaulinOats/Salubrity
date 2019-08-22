import React, {Component} from 'react';
import Modal from '../Widgets/Modal/Modal';
import Login from '../Widgets/Login/Login';
import axios from 'axios';
import Moment from 'react-moment';
import './Home.css';
import loadingGif from '../../public/loading.gif';
import refreshImg from '../../public/refresh.png';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.state = {
      activeHomeTab:'queue',
      isLoading:false,
      modalIsOpen:false,
      userId:'',
      modalTitle:'',
      modalMessage:'',
      modalConfirmation:false,
      confirmationType:null,
      activeRecord:null,
      queueItems:[],
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
      customFields:[],
      mrn:'',
      provider:'',
      orderChanged:false,
      orderSelected:''
    }
    this.toggleHandler = this.toggleHandler.bind(this);
    this.completeProcedure = this.completeProcedure.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getConfirmation = this.getConfirmation.bind(this);
    this.getAddedCall = this.getAddedCall.bind(this);
    this.handleWindowBeforeUnload = this.handleWindowBeforeUnload.bind(this);
    this.getDateFromObjectId = this.getDateFromObjectId.bind(this);
    this.addCall = this.addCall.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
    this.handleUserSessionData = this.handleUserSessionData.bind(this);
    this.logout = this.logout.bind(this);
  }
  
  componentWillMount(){
    const storagecurrentUser = localStorage.getItem('currentUser');
    const storageActiveTab = localStorage.getItem('activeHomeTab');
    if(this.isValidStorageItem(storagecurrentUser)){
      this.setState({currentUser:JSON.parse(storagecurrentUser)}, this.handleUserSessionData);
    } else {
      this.handleUserSessionData();
    }
    if(this.isValidStorageItem(storageActiveTab)){
      this.setState({activeHomeTab:JSON.parse(storageActiveTab)});
    }
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
      if((Math.floor(Date.now() / 1000) - this.state.currentUser.lastLogin) > 1800){
        this.logout();
      } else {
        //if user has refreshed at any point and it's been less than 30 minutes, refresh session
        let currentUser = {...this.state.currentUser};
        currentUser.lastLogin = Math.floor(Date.now() / 1000);
        this.setState({currentUser}, ()=>{
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
    localStorage.clear();
  }

  stateLoadCalls(){
    if(this.state.currentUser){
      this.getActiveCalls();
      this.getCompletedCalls();
      this.getProcedureData();
      this.getOptionsData();
      this.getItemsData();
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

  addCall(){
    this.setState({
      modalTitle:'Add Call',
      modalIsOpen:true
    })
  }

  getProcedureData(){
    this.setState({isLoading:true});
    axios.get('/get-procedures')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({procedures:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  getOptionsData(){
    this.setState({isLoading:true});
    axios.get('/get-options')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({allOptions:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  getItemsData(){
    this.setState({isLoading:true});
    axios.get('/get-items')
    .then((resp)=>{
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
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  getCompletedCalls(){
    this.setState({isLoading:true});
    axios.get('/get-completed-calls')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data);
      } else {
        this.setState({completedCalls:resp.data});
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  getActiveCalls(){
    this.setState({isLoading:true});
    axios.get('/get-active-calls')
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
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
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  toggleHandler() {
    this.setState({
      modalIsOpen: !this.state.modalIsOpen
    });
  }

  completeProcedure(){
    let proceduresArr = this.createProcedureObject();
    if(this.procedureVerified(proceduresArr)){
      // grab custom input values if a procedure was selected that has them
      //check if any procedures have required fields
      for(let i = 0; i < proceduresArr.length; i++){
        //Insertion Procedure
        if(proceduresArr[i].procedureId === 8){
          proceduresArr[i].itemIds.push(54);
          proceduresArr[i].customValues = {
            '54': Number(this.state.insertionLength)
          }
        }
      }

      let completionTime = new Date();
      let callTime = this.getDateFromObjectId(this.state.activeRecord._id);
      let startTime = new Date(this.state.activeRecord.startTime);

      this.setState({isLoading:true});
      axios.post('/procedure-completed', {
        _id:this.state.activeRecord._id,
        proceduresDone:proceduresArr,
        completedBy:Number(this.state.currentUser.userId),
        completedAt:completionTime.toISOString(),
        addComments:this.state.addComments.length ? this.state.addComments : null,
        hospital:this.state.hospital ? Number(this.state.hospital) : null,
        mrn:Number(this.state.mrn),
        provider:this.state.provider,
        procedureTime:completionTime - startTime,
        responseTime:startTime - callTime,
        orderChange: this.state.orderChanged ? Number(this.state.orderSelected) : null
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
      .finally(()=>{
        this.setState({isLoading:false});
      })
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

    if(this.state.orderChanged){
      if(!this.state.orderSelected.length){
        errors += '- You must select an order change option\n';
      }
    }

    if(this.state.insertionTypeSelected){
      if(!this.state.insertionLength.length){
        errors += '- You must enter an insertion length\n';
      }
      if(!this.state.hospital.length || this.state.hospital === 'default'){
        errors += '- You must select a hospital\n';
      }
      if(this.state.mrn.length !== 7){
        errors += '- Medical Record Number must be 7 digits long\n';
      }
      if(!this.state.provider.length){
        errors += '- You must enter a provider name\n';
      }
    }

    if(errors.length){
      this.setState({
        modalIsOpen:true, 
        modalTitle:'Cannot Submit Procedure',
        modalMessage:errors
      });
      return false;
    }
    return true;
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
    this.setState({activeHomeTab:'queue'}, this.getActiveCalls);
    document.querySelector('.vas-home-refresh').classList.toggle('vas-refresh-animate');
  }

  getConfirmation(isConfirmed){
    if(isConfirmed){
      if(this.state.confirmationType){
        if(this.state.confirmationType === 'delete-call'){
          this.setState({isLoading:true});
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
          .finally(()=>{
            this.setState({isLoading:false});
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
      this.setState({isLoading:true});
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
      .finally(()=>{
        this.setState({isLoading:false});
      })
    } else {
      if(this.state.activeRecord._id === job._id){
        this.setState({activeHomeTab:'active'});
      } else {
        this.setState({
          modalIsOpen:true,
          modalTitle:'Record Already Open',
          modalMessage:'Please complete open task or return it to the queue'
        })
      }
    }
  }

  returnToQueue(){
    this.setState({isLoading:true});
    axios.post('/set-call-as-unopen', {
      _id:this.state.activeRecord._id
    })
    .then((resp)=>{
      if(resp.data.error || resp.data._message){
        console.log(resp.data.error)
      } else {
        this.setState({activeRecord:null, activeHomeTab:'queue'}, this.getActiveCalls);
      }
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      this.setState({isLoading:false});
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
      if(groupName === 'Size'){
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
        let nextSib =  groupContainer.nextSibling.querySelector('.vas-home-select-input');
        if(nextSib.id === '7' || nextSib.id === '12'){
          nextSib.checked = false;
        } else {
          nextSib.checked = true;
        }
        groupContainer = groupContainer.nextSibling;
      }
    }
  }

  changeCustomInput(e, fieldName){
    this.setState({[fieldName]:e.target.value});
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
      this.setState({hospital:''});
    }
  }

  procedureOptionCustomChange(e, field){
    this.setState({[field]:e.target.value});
  }

  orderSelect(e){
    if(e.target.value === 'default'){
      this.setState({orderSelected:''});
    } else {
      this.setState({orderSelected:e.target.value});
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
              <div className='vas-home-main-header-left'>
                <h1 className='vas-home-header-title'>VAS Tracker</h1>
                <button className='vas-button vas-home-add-call' onClick={this.addCall}>Add Call</button>
              </div>
              <div className='vas-home-main-header-right'>
                <p className='vas-home-main-header-user vas-nowrap'>{this.state.currentUser.fullname}</p>
                <button className='vas-home-main-header-logout' onClick={this.logout}>Logout</button>
              </div>
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
                <div className="vas-home-table vas-table">
                  <div className='vas-table-thead-row'>
                    <div className='vas-width-15'>Room</div>
                    <div className='vas-width-35'>Job</div>
                    <div className='vas-width-15'>Contact</div>
                    <div className='vas-width-15'>Open By</div>
                    <div className='vas-width-20'>Call Time</div>
                  </div>
                  <div className='vas-home-table-body'>
                    {this.state.queueItems.length > 0 && this.state.queueItems.map((item, idx)=>{
                      return(
                        <div key={item._id} className={'vas-home-table-tr ' + (item.openBy ? 'vas-home-table-row-is-open' : '')} onClick={(e)=>{this.selectJob(item)}}>
                          <div className='vas-width-15 vas-nowrap vas-uppercase'>{item.room}</div>
                          <div className='vas-width-35'><i className='vas-table-job-name'>{item.job}</i>{item.job === 'Custom' && ' - ' + item.jobComments}</div>
                          <div className='vas-width-15'>{item.contact}</div>
                          <div className='vas-width-15'>{item.openBy ? item.openBy : ''}</div>
                          <div className='vas-width-20'><Moment format='HH:mm'>{this.getDateFromObjectId(item._id)}</Moment></div>
                        </div>
                      )
                    })}
                    {this.state.queueItems.length < 1 &&
                      <div><p className='vas-queue-no-items'>There are no items currently in the queue</p></div>
                    }
                  </div>
                </div>
              </div>
              <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'complete' ? true : false}>
                <div className="vas-home-table vas-table">
                    <div className='vas-table-thead-row'>
                      <div className='vas-width-15'>Room</div>
                      <div className='vas-width-45'>Job Requested</div>
                      {/* <div className='vas-width-10'>Done By</div> */}
                      <div className='vas-width-10'>Call Time</div>
                      <div className='vas-width-15'>Response Time</div>
                      <div className='vas-width-15'>Procedure Time</div>
                    </div>
                    <div className='vas-home-table-body'>
                      {this.state.completedCalls.length < 1 &&
                        <div><p className='vas-queue-no-items'>There are no completed items yet for today</p></div>
                      }
                      {this.state.completedCalls.map((item, idx)=>{
                        let responseTimeHr = Math.floor(item.responseTime/3600000) % 24;
                        let responseTimeMin = Math.floor(item.responseTime/60000) % 60;
                        let procedureTimeHr = Math.floor(item.procedureTime/3600000) % 24;
                        let procedureTimeMin = Math.floor(item.procedureTime/60000) % 60;
                        return(
                          <div key={item._id} className='vas-home-table-tr'>
                            <div className='vas-width-15 vas-nowrap vas-uppercase'>{item.room}</div>
                            <div className='vas-width-45'><i className='vas-table-job-name'>{item.job} {item.jobComments ? ' - ' + item.jobComments : ''}</i></div>
                            {/* <div className='vas-width-10'>{item.completedBy}</div> */}
                            <div className='vas-width-10'><Moment format='HH:mm'>{this.getDateFromObjectId(item._id)}</Moment></div>
                            <div className='vas-width-15'>{responseTimeHr > 0 ? responseTimeHr + ' Hr ' : ''}<span className='vas-nowrap'>{responseTimeMin + ' Min'}</span></div>
                            <div className='vas-width-15'>{procedureTimeHr > 0 ? procedureTimeHr + ' Hr ' : ''}<span className='vas-nowrap'>{procedureTimeMin + ' Min'}</span></div>
                          </div>
                        )
                      })}
                    </div>
                </div>
              </div>
              {this.state.activeRecord && Object.keys(this.state.allItems).length > 0 &&
                <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'active' ? true : false}>
                  <header className="vas-home-record-header">
                    <p className="vas-home-record-header-text"><b>{this.state.activeRecord.job}</b></p>
                    <p className="vas-home-record-header-subtext vas-uppercase">Room: <b>{this.state.activeRecord.room}</b></p>
                    <button className="vas-home-record-header-btn" onClick={e=>{this.resetForm()}}>Reset Form</button>
                    <button className="vas-home-record-header-btn" onClick={e=>{this.returnToQueue()}}>Return To Queue</button>
                    <button className='vas-home-record-header-btn vas-warn-btn' onClick={e=>{this.deleteCall()}}>Delete Call</button>
                  </header>
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
                  {this.state.procedures.map((procedure, idx)=>{
                      return (
                        <div className="vas-home-inner-container" key={procedure._id}>
                          <header className="vas-home-inner-container-header">
                            <p>{procedure.name}</p>
                          </header>
                          <div className="vas-home-inner-container-main">
                            {procedure.groups.map((group, idx2)=>{
                              return(
                                <span className='vas-home-inner-span' data-procedure={procedure.name.replace(/\s+/g, '')} data-idx={idx2} key={idx+group.groupName}>
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
                                          <span key={itemId}>
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
                              )})
                            }
                            </div>
                        </div>
                      )
                    })
                  }
                  {this.state.insertionTypeSelected &&
                    <div className='vas-home-options-container'>
                      <div className='vas-home-option-inner'>
                        <label>{this.state.allOptions[0].name}:</label>
                        <select value={this.state.hospital} onChange={e=>{this.hospitalChange(e)}}>
                          <option value='default'>Select A Hospital</option>
                          {this.state.allOptions[0].options.map((subOption, idx2)=>{
                            return <option key={subOption.id}value={subOption.id}>{subOption.name}</option>
                          })}
                        </select>
                      </div>
                      <div className='vas-home-option-inner'>
                        <label>{this.state.allOptions[1].name}:</label>{/* Medical Record Number */}
                        <input className='vas-custom-input' type={this.state.allOptions[1].inputType} value={this.state[this.state.allOptions[1].callFieldName]} onChange={e=>{this.procedureOptionCustomChange(e, this.state.allOptions[1].callFieldName)}} />
                      </div>
                      <div className='vas-home-option-inner'>
                        <label>{this.state.allOptions[2].name}:</label>{/* Provider */}
                        <input className='vas-custom-input' type={this.state.allOptions[2].inputType} value={this.state[this.state.allOptions[2].callFieldName]} onChange={e=>{this.procedureOptionCustomChange(e, this.state.allOptions[2].callFieldName)}} />
                      </div>
                    </div>
                  }
                  <div className='vas-home-inner-container vas-home-order-change'>
                    <header className='vas-home-inner-container-header'>
                      <p>MD Order Change</p>
                    </header>
                    <div className='vas-home-inner-container-main'>
                      <button className={'vas-button ' + (this.state.orderChanged ? 'vas-button-pressed' : '')} onClick={e=>{this.setState({orderChanged:true})}}>Order Was Changed</button>
                      {this.state.orderChanged &&
                        <select className='vas-select' value={this.state.orderSelected} onChange={e=>{this.orderSelect(e)}}>
                          <option value="default">Select An Order</option>
                          {this.state.allOptions[3].options.map((option, idx)=>{
                            return <option key={option.id} value={option.id}>{option.name}</option>
                          })}
                        </select>
                      }
                    </div>
                  </div>
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
                        <button className='vas-button vas-home-complete-procedure-btn' onClick={this.completeProcedure}>Submit Procedure</button>
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
        {this.state.isLoading && 
          <div className='vas-loading-container'>
            <img className='vas-loading-img' src={loadingGif} alt='loading'/>
            <p className='vas-loading-text'>Loading...</p>
          </div>
        }
      </div>
    )
  }
}