import React, {Component, PureComponent, Fragment} from 'react';
import update from 'immutability-helper';

class AttrValue extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount(){
    let elem = document.getElementById("is_quantity_required-" + this.props.attribute_value.attribute_id);
    try{
      this.switchery = new Switchery(elem, {color: '#64bd63', size: 'small'});
    }catch(e){
      console.log("Switchery", e);
    }
  }

  render() {
    let isQuantity = this.props.attribute_value.is_quantity_required;
    isQuantity = (isQuantity == 1) ? true : false;
    return (<div className="col-md-6 attribute-value-row clearfix">
      <div className="form-group"
        id={"attrvalue-row-" + this.props.attribute_value.attribute_id}>
        <div className="col-lg-7">
          <label className="control-label">
            Value<span className="text-danger">*</span>
          </label>
          <input type="text" required="required"
            className="form-control"
            name={"attribute_values[" + this.props.index + "][display_name]"}
            defaultValue={this.props.attribute_value.display_name}
          data-msg="Please enter value"/>
          {(!this.props.attribute_value.is_new
            && <input type="hidden"
              name={"attribute_values[" + this.props.index + "][attribute_id]"}
              defaultValue={this.props.attribute_value.attribute_id}/>)}
        </div>
        <div className="col-lg-3">
          <label className="control-label">
            Is Quantity
          </label>
          <div className="checkbox checkbox-switchery">
            <label data-toggle="tooltip" title="No/Yes">
              <input type="checkbox" className="switchery" value="1"
                name={"attribute_values[" + this.props.index + "][is_quantity_required]"}
                defaultChecked={isQuantity}
                id={"is_quantity_required-" + this.props.attribute_value.attribute_id}/>
            </label>
          </div>
        </div>
        <div className="col-lg-2">
          {(this.props.index > 0 && <Fragment>
            <label className="control-label"
              style={{display: "block"}}>&nbsp;</label>
            <a className="btn dv-custom-btn btn-xs"
              href="javascript:void(0);"
              onClick={() => {this.props.onRemove(this.props.index)}}>
              <i className="icon-trash"></i>
            </a>
          </Fragment>)}
        </div>
      </div>
    </div>);
  }
}
export default AttrValue;
