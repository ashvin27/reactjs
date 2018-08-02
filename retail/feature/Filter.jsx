import React, {Component,PureComponent} from 'react';
import update from 'immutability-helper';

class Filter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount(){
    $('#filter-row-' + this.props.filter.filter_id + ' .tags-input')
      .tagsinput();
    $('#filter-row-' + this.props.filter.filter_id + ' .tags-input')
      .on('itemAdded', function(event) {
      $(event.target).valid();
    });
    $('#filter-row-' + this.props.filter.filter_id + ' .tags-input')
      .on('itemRemoved', function(event) {
      $(event.target).valid();
    });
  }

  render() {
    return (<div className="form-group"
      id={"filter-row-" + this.props.filter.filter_id}>
      <div className="col-lg-4">
        <label className="control-label">
          Filter Name<span className="text-danger">*</span>
        </label>
        <input type="text" required="required"
          name={"filters[" + this.props.index + "][name]"}
          className="form-control" defaultValue={this.props.filter.name}
        data-msg="Please enter filter name"/>
      </div>
      <div className="col-lg-7">
        <label className="control-label">
          Filter Values<span className="text-danger">*</span>
        </label>
        <input type="text" required="required"
          className="form-control tags-input"
          name={"filters[" + this.props.index + "][value]"}
          defaultValue={this.props.filter.value}
        data-msg="Please enter filter values"/>
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
