import React, {Component} from 'react';
import './Filters.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import axios from 'axios';
import {DebounceInput} from 'react-debounce-input';

export default class Filters extends Component {
  constructor(props){
    super(props);
    this.state = {
      startDate:moment(),
      endDate:moment(),
      activeFilters:[],
      filterFields:[
        {fieldName:'completedBy', text:'Nurse'},
        {fieldName:'hospital', text:'Hospital'},
        {fieldName:'mrn', text:'MRN'},
        {fieldName:'provider', text:'Provider'},
        {fieldName:'room', text:'Room'},
        {fieldName:'procedureId', text:'Procedure'},
        {fieldName:'insertionType', text:'Insertion Type'},
        {fieldName:'orderChange', text:'Order Change'},
        {fieldName:'responseTime', text:'Response Time'},
        {fieldName:'procedureTime', text:'Procedure Time'}
      ]    
    }
    this.childFilterOnChange = this.childFilterOnChange.bind(this);
    this.startDateChange = this.startDateChange.bind(this);
    this.endDateChange = this.endDateChange.bind(this);
    this.submitQuery = this.submitQuery.bind(this);
    this.selectFilter = this.selectFilter.bind(this);
  }

  componentDidMount(){
    setTimeout(()=>{
      console.log(this.state)
    },1000)
  }
  
  componentWillMount(){
    let userOptions = [];
    let users = this.props.allUsers;
    users.sort((a,b)=>{
      if(a.fullname > b.fullname) return 1;
      if(a.fullname < b.fullname) return -1;
      return 0;
    });
    for(let i = 0; i < users.length; i++){
      userOptions.push({
        value:users[i].userId,
        text:users[i].fullname
      })
    }

    let hospitalOptions = [];
    for(let i = 0; i < this.props.hospitals.length; i++){
      hospitalOptions.push({
        value:this.props.hospitals[i].id,
        text:this.props.hospitals[i].name
      })
    }

    let procedureOptions = [];
    for(let i = 0; i < this.props.procedures.length; i++){
      procedureOptions.push({
        value:this.props.procedures[i].procedureId,
        text:this.props.procedures[i].name
      })
    }
    let insertionTypeOptions = [];
    Object.keys(this.props.itemsById).forEach(itemId=>{
      if(this.props.itemsById[itemId].groupName === 'Insertion Type'){
        insertionTypeOptions.push({
          value:itemId,
          text:this.props.itemsById[itemId].value
        })
      }
    })

    let orderChangeOptions = [];
    for(let i = 0; i < this.props.orderChanges.length; i++){
      orderChangeOptions.push({
        value:this.props.orderChanges[i].id,
        text:this.props.orderChanges[i].name
      })
    }

    this.setState({
      filterFields:[
        {fieldName:'completedBy', text:'Nurse', options:userOptions},
        {fieldName:'hospital', text:'Hospital', options:hospitalOptions},
        {fieldName:'mrn', text:'MRN'},
        {fieldName:'provider', text:'Provider'},
        {fieldName:'room', text:'Room'},
        {fieldName:'procedureId', text:'Procedure', options:procedureOptions},
        {fieldName:'insertionType', text:'Insertion Type', options:insertionTypeOptions},
        {fieldName:'orderChange', text:'Order Change', options:orderChangeOptions},
        {fieldName:'responseTime', text:'Response Time'},
        {fieldName:'procedureTime', text:'Procedure Time'}
      ].sort((a,b)=>{
        if(a.text > b.text) return 1;
        if(a.text < b.text) return -1;
        return 0;
      })
    })
  }

  selectFilter(){
    let filterFields = this.state.filterFields;
    let activeFilters = this.state.activeFilters;
    for (let i = filterFields.length - 1; i >= 0; i--) {
      if(filterFields[i].fieldName === this.mainFilterSelect.value){
        activeFilters.push(filterFields.splice(i, 1)[0])
        break;
      }
    }
    this.setState({
      filterFields,
      activeFilters
    })
  }

  childFilterOnChange(e, filterIndex, isCustom){
    let activeFilters = this.state.activeFilters;
    if(e.target.value === '' && !isCustom){
      this.deleteFilter(filterIndex)
    } else {
      activeFilters.forEach((filter, idx)=>{
        if(idx === filterIndex){
          activeFilters[idx].value = e.target.value;
        }
      })
    }
    this.setState({activeFilters})
  }

  deleteFilter(filterIndex){
    let activeFilters = this.state.activeFilters;
    let filterFields = this.state.filterFields;
    filterFields.push(activeFilters.splice(filterIndex, 1)[0])
    filterFields.sort((a,b)=>{
      if(a.text > b.text) return 1;
      if(a.text < b.text) return -1;
      return 0;
    })
    this.setState({
      activeFilters,
      filterFields
    });
  }

  submitQuery(){
    let queryObject = {
      completedAt: {
        $gte: moment(this.state.startDate).startOf('day').toISOString(),
        $lt: moment(this.state.endDate).endOf('day').toISOString()
      }
    };

    this.state.activeFilters.forEach(filter=>{
      if(filter.value && filter.value.length){
        switch(filter.fieldName){
          case "insertionType":
            queryObject['proceduresDone.itemIds'] = {$in:[Number(filter.value)]}
            break;
          case "procedureId":
            queryObject['proceduresDone.procedureId'] = Number(filter.value)
            break;
          default:
            queryObject[filter.fieldName] = filter.value;
        }
      }
    })

    console.log(queryObject);
    this.setState({isLoading:true});
    axios.post('/get-calls-by-query', queryObject).then(resp=>{
      if(!resp.data.length){
        alert('no calls returned for that specific query')
      } else {
        this.props.returnedCalls(resp.data);
      }
    }).catch(err=>{
      console.log(err);
    }).finally(()=>{
      this.setState({isLoading:false});
    })
  }

  startDateChange(date){
    this.setState({
      startDate: date
    });
  }
  
  endDateChange(date){
    this.setState({
      endDate: date
    });
  }

  render(){
    return(
      <div className='vas-filters'>
        <div className='vas-filters-date-range-container'>
          <div className='vas-filters-date-range-inner'>
            <p className='vas-filters-date-label'>From:</p>
            <DatePicker className='vas-filters-datepicker' selected={this.state.startDate} onChange={this.startDateChange} />
          </div>  
          <div className='vas-filters-date-range-inner'>
            <p className='vas-filters-date-label'>To:</p>
            <DatePicker className='vas-filters-datepicker' selected={this.state.endDate} onChange={this.endDateChange} />
          </div>
        </div>
        <div className='vas-filters-filters-container'>
          {this.state.activeFilters.map((filter, idx)=>{
            return(
              <div key={filter.fieldName + idx} className='vas-filters-outer-filter-container'>
                <div className='vas-inline-block'>
                  <div className='vas-filters-delete-filter' onClick={e=>{this.deleteFilter(idx)}}><p>&times;</p></div>
                </div>
                <div className='vas-inline-block'>
                  <div className='vas-filters-filter-container-inner'>
                    <p className='vas-filters-filter-title'>{filter.text}</p>
                  </div>
                  <div className='vas-filters-filter-container-inner'>
                    {filter.options &&
                      <select className='vas-select vas-filters-child-filter' onChange={e=>{this.childFilterOnChange(e, idx, false)}}>
                        <option value=''>Select An Option</option>
                        {filter.options && filter.options.map((option, idx)=>{
                          return <option key={option.text + idx} value={option.value}>{option.text}</option>
                        })}
                      </select>
                    }
                    {!filter.options && filter.fieldName &&
                      <DebounceInput
                        className="vas-input vas-filters-child-filter"
                        minLength={1}
                        debounceTimeout={300}
                        onChange={e=>{this.childFilterOnChange(e, idx, true)}} />
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className='vas-filters-add-filter-container'>
          <select ref={(ref)=>{this.mainFilterSelect = ref}} className='vas-select vas-filters-main-filter-select' onChange={this.selectFilter}>
            <option value=''>Add Filter</option>
            {this.state.filterFields.map((filterField)=>{
              return <option key={filterField.fieldName} value={filterField.fieldName}>{filterField.text}</option>
            })}
          </select>
          {/* <div className='vas-filters-add-filter' onClick={this.addFilter}>+</div> */}
        </div>
        <button className='vas-filters-submit-query' onClick={this.submitQuery}>Submit</button>
      </div>
    )
  }
}