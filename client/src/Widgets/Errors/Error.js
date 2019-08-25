import React, {Component} from 'react';
import axios from 'axios';

export default class Home extends Component{
  constructor(props){
    super(props);
    this.state = {
      errors:[]
    }
  }

  componentWillMount(){
    axios.get('/get-errors-json')
    .then(resp=>{
      console.log(resp.data);
      this.setState({errors:resp.data});
    })
    .catch(err=>{
      console.log(err);
    })
  }

  render(){
    return(
      <div>
        <h1>Errors Page</h1>
        <div style={{"overflow-wrap":"break-word"}}>{JSON.stringify(this.state.errors)}</div>
      </div>
    )
  }
}