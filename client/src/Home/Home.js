import React, {Component} from 'react';
import './Home.css';
import axios from 'axios';

export default class App extends Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }
  
  callHome(){
    console.log('callHome');
    axios.get('/home').then((resp)=>{
      console.log(resp.data);
    }).catch((err)=>{
      console.log(err);
    });
  }

  render(){
    return(
      <div>
        <h1>Home Page</h1>
        <button onClick={(e)=>{this.callHome()}}>Call Home Route</button>
        <div className="float-right">
          <label className="vas-checkbox">
            <input type="checkbox"/>
            <span className="vas-checkmark vas-right" data-size="lg"></span>
          </label>
        </div>
      </div>
    )
  }
}
