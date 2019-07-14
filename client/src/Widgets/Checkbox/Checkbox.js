import React, {Component} from 'react';
import '../Widgets/Checkbox.css';

export default class Checkbox extends Component{
  constructor(props){
    super(props);
    this.state = {}
  }

  render(){
    return(
      <div>
        <div className="vas-checkbox">
          <label className="vas-checkbox-label">
            <input type="checkbox"/>
            <span className="vas-checkbox-checkmark" data-size="lg"></span>
          </label>
        </div>
      </div>
    )
  }
}