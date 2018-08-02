import React, {Component,PureComponent} from 'react';
import update from 'immutability-helper';

class Filter extends PureComponent {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateSelect2 = false;

    this.state = this.getInitialState();
  }

  getInitialState(){
    let filterOptions = [], selectedOptions = [];
    if(this.props.filter.type){
        filterOptions = _.findWhere(this.props.filters, { 'name': this.props.filter.type});
        filterOptions = (filterOptions) ? (filterOptions.value).split(',') : [];

        selectedOptions = this.props.filter.options;
        selectedOptions = (selectedOptions) ? selectedOptions.split(',') : [];
    }
    return {
      type: this.props.filter.type,
      options: selectedOptions,
      filter_options: filterOptions
    }
  }

  handleInputChange(e) {
    const target = e.target,
    name = target.getAttribute('data-name'),
    type  = target.type;
    let value = target.value;
    if(type == "select-multiple"){
      $(target).valid();
      let options = target.options;
      let selectValue = [];
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          selectValue.push(options[i].value);
        }
      }
      value = selectValue;
    }
    let stData = {
      [name]: value
    }
    if(name == "type"){
      let options1 = e.target[e.target.selectedIndex].getAttribute('data-options');
      stData['filter_options'] = (options1) ? options1.split(',') : [];
      this.updateSelect2 = true;
    }
    this.setState(stData);
  }

  componentDidMount(){
    let _this = this;
    $('#filter-row-' + this.props.filter.filter_id + ' .select-search').select2();

    $('#filter-row-' + this.props.filter.filter_id + ' .select-search').change((e) => {
      $(e.target).valid();
      _this.handleInputChange(e);
    });
  }

  componentDidUpdate(){
    if(this.updateSelect2){
      this.updateSelect2 = false;
      $("#option-" + this.props.filter.filter_id).select2();
    }
  }

  render() {
    return (<div className="form-group" id={"filter-row-" + this.props.filter.filter_id}>
      <div className="col-lg-4">
        <label className="control-label">
          Filter Type<span className="text-danger">*</span>
        </label>
        <select required="required" className="form-control select-search"
          name={"filters[" + this.props.index + "][type]"} data-name="type"
          value={this.state.type}
          data-msg="Please select filter type" onChange={this.handleInputChange}>
          <option value="">Select filter type</option>
          {this.props.filters.map((filter, index) => {
            return (<option key={index} value={filter.name}
              data-options={filter.value}>{filter.name}</option>)
          })}
        </select>
      </div>
      <div className="col-lg-7">
        <label className="control-label">
          Filter Option<span className="text-danger">*</span>
        </label>
        <select className="form-control select-search" required="required"
          name={"filters[" + this.props.index + "][options]"}
          id={"option-" + this.props.filter.filter_id}
          data-msg="Please select filter options" multiple="multiple"
          data-placeholder="Select filter options" data-name="options"
          value={this.state.options} onChange={this.handleInputChange}>
          {this.state.filter_options.map((option, index) => {
            return (<option key={index} value={option}>{option}</option>)
          })}
        </select>
      </div>
      <div className="col-lg-1">
        <label className="control-label">&nbsp;</label>
        <a className="btn dv-custom-btn btn-xs"
          href="javascript:void(0);"
          onClick={() => {this.props.onRemove(this.props.index)}}>
          <i className="icon-trash"></i>
        </a>
      </div>
    </div>);
  }
}
export default Filter;
