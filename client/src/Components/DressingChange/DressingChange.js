import React, {Component} from 'react';
import './DressingChange.css';

export default class DressingChange extends Component {
  constructor(props){
    super(props);
    this.state = {

    }
  };
  
  componentWillReceiveProps(nextProps){
    // this.setState({
    //   currentRecord:nextProps.activeRecord,
    // })
  }

  render(){
    return(
      <div className='vas-dressing-change'>

      </div>
    )
  }
}