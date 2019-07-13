import React, {Component} from 'react';
import Modal from '../Widgets/Modal';
import './Home.css';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.state = {
      modalOpen:false,
      openItems:[
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

  closeModal(){
    console.log('close modal');
    this.setState({ open: false })
  }

  render(){
    return(
      <div>
        <div className="container-fluid vas-app-container">
          <ul className="nav nav-tabs vas-home-nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a className="nav-link vas-nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Queue</a>
            </li>
            <li className="nav-item">
                <a className="nav-link vas-nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Completed</a>
            </li>
            <button type="button" className="btn btn-primary vas-home-addCall">Add Call</button>
            <Modal/>
          </ul>
          <div className="tab-content vas-home-tabContent" id="myTabContent">
            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
              <table className="table vas-home-table">
                <thead className="vas-home-thead">
                  <tr>
                    <th scope="col">Room #</th>
                    <th scope="col">Job Requested</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Call Time</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.openItems.map((item, index)=>{
                    return(
                      <tr key={index} className="vas-home-tr">
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
            <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
              Hi
            </div>
          </div>
        </div>
      </div>
    )
  }
}
