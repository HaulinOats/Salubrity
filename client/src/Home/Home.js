import React, {Component} from 'react';
import Modal from '../Components/Modal/Modal';
import Login from '../Components/Login/Login';
import EditProcedure from '../Components/EditProcedure/EditProcedure';
import ReturnedProcedures from '../Components/ReturnedProcedures/ReturnedProcedures';
import helpers from '../helpers';
import axios from 'axios';
import Moment from 'react-moment';
import ls from 'local-storage';
import './Home.css';
import loadingGif from '../../public/loading.gif';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.state = {
      currentUser:null,
      errorArr:[],
      activeHomeTab:'queue',
      isLoading:false,
      modalIsOpen:false,
      modalTitle:'',
      modalMessage:'',
      modalConfirmation:false,
      confirmationType:null,
      activeRecord:null,
      queueItems:[],
      completedCalls:[],
      procedures:[],
      allOptions:[],
      allUsers:[],
      usersById:null,
      itemsById:null,
      hospitals:[],
      hospitalsById:null,
      statusById:null,
      orderChanges:[],
      orderChangeById:null,
      proceduresById:null,
      selectedProcedures:[],
      lastUpdate:0,
      lastUpdateHide:false
    };
    this.toggleHandler = this.toggleHandler.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.addCall = this.addCall.bind(this);
    this.loginCallback = this.loginCallback.bind(this);
    this.refreshUserSession = this.refreshUserSession.bind(this);
    this.logout = this.logout.bind(this);
    this.reverseCompletedSort = this.reverseCompletedSort.bind(this);
    this.stateLoadCalls = this.stateLoadCalls.bind(this);
    this.addToErrorArray = this.addToErrorArray.bind(this);
    this.sendErrorsToAdmin = this.sendErrorsToAdmin.bind(this);
    this.checkActiveRecordExists = this.checkActiveRecordExists.bind(this);
    this.visibilityChange = this.visibilityChange.bind(this);
    this.editCompletedCall = this.editCompletedCall.bind(this);
    this.timerTick = this.timerTick.bind(this);
    this.resetState = this.resetState.bind(this);
    this.closeRecordCallback = this.closeRecordCallback.bind(this);
    this.getCompletedCalls = this.getCompletedCalls.bind(this);
    this.getOptionsData = this.getOptionsData.bind(this);
    this.getModalConfirmation = this.getModalConfirmation.bind(this);
  }

  resetState(){
    this.setState({
      errorArr:[],
      activeHomeTab:'queue',
      modalIsOpen:false,
      modalTitle:'',
      modalMessage:'',
      modalConfirmation:false,
      confirmationType:null,
      activeRecord:null,
      selectedProcedures:[],
      procedureVerified:false,
      insertionTypeSelected:false,
      insertionLength:''
    });
  }
  
  componentWillMount() {
    if(ls('currentUser')){
      this.setState({
        currentUser:ls('currentUser')
      }, ()=>{
        this.refreshUserSession();
        this.stateLoadCalls();
      });
    }

    if(ls('activeHomeTab')){
      this.setState({activeHomeTab:ls('activeHomeTab')}, ()=>{
        this.setTab(this.state.activeHomeTab)
      });
    }

    // Set the name of the hidden property and the change event for visibility
    this.documentProps = {
      hidden:null,
      visibilityChange:null
    }

    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
      this.documentProps.hidden = "hidden";
      this.documentProps.visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.documentProps.hidden = "msHidden";
      this.documentProps.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.documentProps.hidden = "webkitHidden";
      this.documentProps.visibilityChange = "webkitvisibilitychange";
    }

    document.addEventListener("visibilitychange", this.visibilityChange);
  }

  visibilityChange(){
    if(document[this.documentProps.hidden]){
      this.stopUpdateTimer();
    } else {
      if(this.state.activeHomeTab === 'queue'){
        this.getActiveCalls();
      }
      if(this.state.activeHomeTab === 'complete'){
        this.getCompletedCalls();
      }
    }
  }

  getModalConfirmation(){
    this.resetModal();
  }

  editCompletedCall(callId, callCompletedBy){
    let isAdmin = this.state.currentUser.role === 'admin' || this.state.currentUser.role === 'super';
    if(isAdmin || this.state.currentUser.userId === callCompletedBy){
      helpers.getCallById(callId).then(resp=>{
        this.setTab('active');
        this.setState({
          activeRecord:resp
        })
      }).catch(err=>{
        console.log(err);
      })
    } else {
      this.setState({
        modalTitle:"Not Allowed To Edit",
        modalMessage:"You cannot edit someone else's completed record",
        modalIsOpen:true
      })
    }
  }

  componentDidMount(){
    this.startSessionInterval();
    setTimeout(()=>{
      console.log(this.state);
    }, 1000);
  }

  startSessionInterval(){
    console.log('starting intervals...');
    this.sessionInterval = setInterval(()=>{
      if(this.state.currentUser){
        this.checkUserSession();
      }
    }, 180000);//check session every 3 minutes (180000)ms
  }

  stopSessionInterval(){
    clearInterval(this.sessionInterval);
  }

  stopUpdateTimer(){
    clearInterval(this.updateTimer);
  }

  componentWillUnmount(){
    this.stopUpdateTimer();
  }

  closeRecordCallback(type){
    switch(type){
      case 'delete':
        let queueItems = this.state.queueItems;
        for(var i = queueItems.length -1; i >= 0 ; i--){
          if(queueItems[i]._id === this.state.activeRecord._id){
            queueItems.splice(i, 1);
          }
        }
        this.setState({queueItems});
        break;
      default:
        break;
    }
    this.setTab('queue');
    this.setState({
      activeRecord:null
    })
  }

  checkUserSession(){
    let currentTime = Math.floor(Date.now() / 1000);
    let timeDiff = currentTime - this.state.currentUser.lastLogin;
    console.log(`${Math.floor(timeDiff/60)} minutes inactive (ends session at 60)`);
    if(timeDiff > 3419){
      this.setState({
        modalTitle:'Session Is About To End',
        modalMessage:'You are about to be logged out due to inactivity. Click "OK" to continue session.',
        modalIsOpen:true,
        modalConfirmation:true
      })
    }
    if(timeDiff > 3600){
      console.log('Logging user out due to inactivity');
      this.logout();
    }
  }

  refreshUserSession(){
    let currentUser = this.state.currentUser;
    currentUser.lastLogin = Math.floor(Date.now() / 1000);
    this.setState({currentUser}, ()=>{
      ls('currentUser', this.state.currentUser);
    });
  }

  loginCallback(user){
    if(user.isActive){
      this.setState({
        currentUser:user
      }, ()=>{
        this.startSessionInterval();
        this.refreshUserSession();
        this.stateLoadCalls();
      });
    } else {
      alert('You are no longer an active user. Please contact admin.');
    }
  }

  logout(){
    this.stopUpdateTimer();
    this.stopSessionInterval();
    this.setState({currentUser:null}, this.resetState);
    ls.clear();
  }

  stateLoadCalls(){
    helpers.getAllUsers().then(data=>{
      this.setState({
        allUsers:data.usersArr,
        usersById:data.usersById
      }, this.getOptionsData)
    }).catch(err=>{
      this.addToErrorArray(err);
    });

    helpers.getProcedureData().then(data=>{
      let proceduresById = {};
      for(let i = 0; i < data.procedures.length; i++){
        proceduresById[data.procedures[i].procedureId] = data.procedures[i];
      }
      this.setState({
        proceduresById,
        procedures:data.procedures
      })
    }).catch(err=>{
      this.addToErrorArray(err);
    })

    helpers.getItemsData().then(data=>{
      this.setState({itemsById:data});
    }).catch(err=>{
      this.addToErrorArray(err);
    })

    this.getActiveCalls();
  }

  getOptionsData(){
    helpers.getOptionsData().then(data=>{
      this.setState({
        allOptions:data.options,
        hospitals:data.hospitals,
        hospitalsById:data.hospitalsById,
        orderChanges:data.orderChanges,
        orderChangeById:data.orderChangeById,
        statusById:data.statuses
      }, this.getCompletedCalls)
    }).catch(err=>{
      this.addToErrorArray()
    })
  }

  setTab(tab, event){
    if(event){
      let tabElement = event.currentTarget.querySelector('.vas-home-nav-item-refresh-bar');
      tabElement.classList.add('vas-home-refresh-bar-activate');
      setTimeout(()=>{
        tabElement.classList.remove('vas-home-refresh-bar-activate');
      }, 1000);
    }
    this.setState({activeHomeTab:tab}, ()=>{
      window.scrollTo(0,0);
      ls('activeHomeTab', this.state.activeHomeTab);
      if(this.state.activeHomeTab === 'queue'){
        this.setState({lastUpdateHide:false});
        this.getActiveCalls();
      }
      if(this.state.activeHomeTab === 'complete'){
        this.setState({
          lastUpdateHide:false
        }, ()=>{
          this.getCompletedCalls();
        });
      }
      if(this.state.activeHomeTab === 'active'){
        this.setState({lastUpdateHide:true});
        clearInterval(this.updateTimer);
      }
      this.refreshUserSession();
    });
  }

  timerTick(){
    this.setState({lastUpdate:this.state.lastUpdate + 1});
  }

  addCall(){
    this.setState({
      modalTitle:'Add Call',
      modalIsOpen:true
    })
    this.refreshUserSession();
  }

  getActiveCalls(){
    helpers.getActiveCalls().then(data=>{
      this.setState({queueItems:data}, this.checkActiveRecordExists);
    }).catch(err=>{
      this.addToErrorArray(err);
    }).finally(()=>{
      clearInterval(this.updateTimer);
      this.setState({lastUpdate:0}, ()=>{
        this.updateTimer = setInterval(this.timerTick, 1000);
      })
    })
  }

  getCompletedCalls(){
    helpers.getCompletedCalls().then(data=>{
      let calls = data;
      for(let i = 0; i < calls.length; i++){
        //add nurse name to call for sorting
        if(calls[i].completedBy !== null){
          calls[i].completedByName = this.state.usersById[calls[i].completedBy].fullname;
        } else {
          calls[i].completedByName = null;
        }
        //add hospital name to call for sorting
        if(calls[i].hospital !== null){
          calls[i].hospitalName = this.state.hospitalsById[calls[i].hospital].name;
        } else {
          calls[i].hospitalName = null;
        }
      }
      this.setState({completedCalls:calls});
    }).catch((err)=>{
      this.addToErrorArray(err);
    }).finally(()=>{
      clearInterval(this.updateTimer);
      this.setState({lastUpdate:0}, ()=>{
        this.updateTimer = setInterval(this.timerTick, 1000);
      })
    });
  }


  checkActiveRecordExists(){
    if(!this.state.activeRecord){
      let activeRecordExists = false;
      for(let i = 0; i < this.state.queueItems.length; i++){
        if(this.state.queueItems[i].openBy && this.state.queueItems[i].openBy === this.state.currentUser.userId){
          activeRecordExists = true;
          this.setState({activeRecord:this.state.queueItems[i]});
          break;
        }
      }
      if(!activeRecordExists){
        this.setState({activeHomeTab:'queue'});
      }
    }
  }

  addToErrorArray(err){
    let errArr = this.state.errorArr;
    errArr.push(err);
    this.setState({errorArr:errArr});
  }

  sendErrorsToAdmin(){
    this.setState({isLoading:true});
    axios.post('/send-errors-to-admin', this.state.errorArr)
    .then(resp=>{
      alert('Errors sent to admin');
    })
    .catch(err=>{
      alert('Error sending errors to Admin (the irony)');
    })
    .finally(()=>{
      this.setState({isLoading:false});
    })
  }

  reverseCompletedSort(){
    let items = this.state.completedCalls;
    this.setState({completedCalls:items.reverse()});
    this.refreshUserSession();
  }

  toggleHandler() {
    this.setState({
      modalIsOpen: !this.state.modalIsOpen
    });
    this.refreshUserSession();
  }

  closeModal(callData){
    if(callData){
      let queueItems = this.state.queueItems;
      queueItems.push(callData);
      this.setState({
        queueItems,
        modalTitle:'Call Was Added',
        modalMessage:'Your call was added to the queue!'
      }, ()=>{
        setTimeout(()=>{
          this.resetModal();
        }, 2000);
      });
    } else {
      this.resetModal();
    }
  }

  resetModal(){
    this.setState({
      modalIsOpen:false,
      modalMessage:'',
      modalTitle:'',
      modalConfirmation:false,
      confirmationType:null
    });
  }

  selectJob(job){
    console.log(job);
    if(!this.state.activeRecord){
      if(job.openBy){
        this.setState({
          modalIsOpen:true,
          modalTitle:'Record Already Open',
          modalMessage:'This record is currently opened by someone else'
        });
      } else {
        this.setState({isLoading:true});
        axios.post('/set-call-as-open', {
          _id:job._id,
          userId:this.state.currentUser.userId
        })
        .then((resp)=>{
          if(resp.data.error || resp.data._message){
            console.log(resp.data);
          } else {
            this.setState({
              activeRecord:resp.data
            }, ()=>{
              this.setTab('active');
            });
          }
        })
        .catch((err)=>{
          console.log(err);
          this.addToErrorArray(err);
        })
        .finally(()=>{
          this.setState({isLoading:false});
        })
      }
    } else {
      if(job._id !== this.state.activeRecord._id){
        this.setState({
          modalIsOpen:true,
          modalTitle:'You Have An Open Record',
          modalMessage:'You already have a record open. Complete it or "Return To Queue" to select a different one.'
        });
      }
      this.setTab('active');
    }
    this.refreshUserSession();
  }

  procedureOptionCustomChange(e, field){
    this.setState({[field]:e.target.value});
    this.refreshUserSession();
  }

  render(){
    return(
      <div>
        {!this.state.currentUser &&
          <Login loginType={'user'} loginCallback={this.loginCallback}/>
        }
        {this.state.currentUser && this.state.usersById &&
          <div className="vas-container-fluid vas-home-container">
            <header className='vas-main-header'>
              <div className='vas-header-left-container'>
                <h1 className='vas-home-header-title vas-pointer' onClick={e=>{window.location.reload()}}>Salubrity</h1>
                <button className='vas-button vas-home-add-call' onClick={this.addCall}>Add Call</button>
              </div>
              <div className='vas-header-right-container'>
                <span className={"vas-status-dot"} onClick={this.sendErrorsToAdmin}></span>
                <p className='vas-home-main-header-user vas-nowrap'>{this.state.currentUser.fullname}</p>
                <button className='vas-home-main-header-logout' onClick={this.logout}>Logout</button>
              </div>
            </header>
            <ul className='vas-home-nav-tabs'>
              <li className='vas-home-nav-item' data-isactive={this.state.activeHomeTab === 'queue' ? true : false} onClick={e=>{this.setTab('queue', e)}}>
                <p className='vas-home-nav-item-text'>Queue</p>
                <div className='vas-home-nav-item-refresh-bar'></div>
              </li>
              <li className='vas-home-nav-item' data-isactive={this.state.activeHomeTab === 'complete' ? true : false} onClick={e=>{this.setTab('complete', e)}}>
                <p className='vas-home-nav-item-text'>Completed</p>
                <div className='vas-home-nav-item-refresh-bar'></div>
              </li>
              {this.state.activeRecord &&
                <li className={'vas-home-nav-item vas-status-' + this.state.activeRecord.status} data-isactive={this.state.activeHomeTab === 'active' ? true : false} onClick={e=>{this.setTab('active', e)}}>
                  <p className='vas-home-nav-item-text'>Open</p>
                  <div className='vas-home-nav-item-refresh-bar'></div>
                </li>
              }
              {!this.state.lastUpdateHide &&
                <div className='vas-home-last-update-container'>
                  <p className='vas-home-last-update-label'>Last Update:</p>
                  <p className='vas-home-last-update-timer'>{(Math.floor(this.state.lastUpdate/60)) > 0 ? (Math.floor(this.state.lastUpdate/60)) : '0'}:{(this.state.lastUpdate - (Math.floor(this.state.lastUpdate/60) * 60)) < 10 ? '0' + (this.state.lastUpdate - (Math.floor(this.state.lastUpdate/60) * 60)) : (this.state.lastUpdate - (Math.floor(this.state.lastUpdate/60) * 60))}</p>
                </div>
              }
            </ul>
            <div className="vas-home-tabContent">
              <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'queue' ? true : false}>
                <div className="vas-home-table vas-table">
                  <div className='vas-table-thead-row'></div>
                  <div className='vas-home-table-body'>
                    {this.state.queueItems.length > 0 && this.state.hospitalsById && this.state.queueItems.map((item, idx)=>{
                      return(
                        <div key={item._id} className={'vas-home-table-tr vas-status-' + item.status + (item.openBy ? ' vas-home-table-row-is-open' : '')} onClick={(e)=>{this.selectJob(item)}}>
                          <div className='vas-home-table-time vas-width-10'>
                            <Moment format='HH:mm'>{helpers.getDateFromObjectId(item._id)}</Moment>
                            <Moment className='vas-home-table-time-date' format='M/D'>{helpers.getDateFromObjectId(item._id)}</Moment>
                          </div>
                          <div className='vas-width-90'>
                            <p className='vas-home-table-job-name'>{item.job}{item.customJob ? ' - ' + item.customJob : ''}<b className={'vas-home-table-open-status ' + (item.openBy ? 'vas-home-open-label-blink' : '' )}>{item.openBy ? 'OPEN' : ''}</b></p>
                            <div className='vas-home-table-tr-inner'>
                              <p><b>Room:</b><i className='vas-uppercase'>{item.room}</i></p>
                              <p><b>Hospital:</b><i className='vas-capitalize'>{this.state.hospitalsById[item.hospital] ? this.state.hospitalsById[item.hospital].name : 'N/A'}</i></p>
                              <p><b>Contact:</b><i>{item.contact ? item.contact : 'N/A'}</i></p>
                              <p><b>Nurse:</b><i className='vas-capitalize'>{this.state.usersById[item.openBy] ? this.state.usersById[item.openBy].fullname : (item.openBy ? item.openBy : 'N/A')}</i></p>
                            </div>
                          </div>
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
                <ReturnedProcedures 
                  queriedProcedures={this.state.completedCalls}
                  hospitalsById={this.state.hospitalsById}
                  usersById={this.state.usersById}
                  itemsById={this.state.itemsById}
                  proceduresById={this.state.proceduresById}
                  editCompletedCall={this.editCompletedCall} 
                  orderChangeById={this.state.orderChangeById}/>
              </div>
              <div className='vas-home-page-container' data-isactive={this.state.activeHomeTab === 'active' ? true : false}>
                {this.state.activeRecord && this.state.procedures && this.state.itemsById && this.state.allOptions.length > 0 &&
                  <EditProcedure 
                    activeRecord={this.state.activeRecord}
                    allOptions={this.state.allOptions}
                    procedures={this.state.procedures}
                    usersById={this.state.usersById}
                    itemsById={this.state.itemsById}
                    refreshUserSession={this.refreshUserSession}
                    closeRecordCallback={this.closeRecordCallback}
                    currentUser={this.state.currentUser}/>
                }
              </div>
            </div>
            {this.state.modalIsOpen && 
              <Modal 
                getConfirmation={this.state.getModalConfirmation}
                isConfirmation={this.state.modalConfirmation}
                currentUser={this.state.currentUser}
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