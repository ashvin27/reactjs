import React, {Component,PureComponent} from 'react';
import update from 'immutability-helper';
import AttrValue from './AttrValue.jsx';

class AttributeForm extends PureComponent {

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.addAttrValue = this.addAttrValue.bind(this);
    this.removeAttrValue = this.removeAttrValue.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.getChild = this.getChild.bind(this);
    this.state = this.getInitialState();
  }

  getInitialState(){
    let valueId = new Date().valueOf();
    return {
      display_name: "",
      description: "",
      condition_bw_filters: 'OR',
      attribute_values: [{
        attribute_id: valueId,
        display_name: "",
        is_quantity_required: 0,
        is_new: true
      }],
      child_loaded: true
    }
  }

  componentDidMount() {
    let windowHeight = $(window).height(),
    actualHeight = windowHeight - 280;
    $(".modal-lg .modal-body").css('height', actualHeight);
    $('#' + this.props.formId + ' .select-search').select2();
    $('#' + this.props.formId + ' .select-search').change((e) => {
      $(e.target).valid();
      this.handleInputChange(e);
    });
    this.form = window.formValidation('#' + this.props.formId);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isEdit === true){
      if(this.props.attribute != nextProps.attribute){
        this.setState({
          display_name: nextProps.attribute.display_name,
          description: nextProps.attribute.description,
          condition_bw_filters: nextProps.attribute.condition_bw_filters,
          child_loaded: false
        }, () => {
          $('#input-condition_bw_filters').select2();
          this.getChild();
        });
      }
    }else{
      if(this.state != this.getInitialState()){
        this.setState(this.getInitialState());
      }
    }
  }

  getChild(){
    $.ajax({
      url: SITE_URL + "request/api/retailAttrList",
      type: 'GET',
      data: {
        postedData: {
          hotel_id: this.props.attribute.hotel_id,
          lang_code: this.props.langCode,
          attribute_parent_id: this.props.attribute.attribute_id
        }
      },
      dataType: 'json',
      success: ({data, message, response_tag, status}, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect({response_tag:response_tag});
        if (status){
          let childs = data[this.props.attribute.hotel_id][this.props.langCode];
          this.setState({
            child_loaded: true,
            attribute_values: childs
          });
        }else{
          this.setState({
            child_loaded: true
          });
        }
      },
      error: (jqXHR) => {
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  addAttrValue(){
    let valueId = new Date().valueOf(),
    attrValue = {
      attribute_id: valueId,
      display_name: "",
      is_quantity_required: 0,
      is_new: true
    };
    this.setState({
      attribute_values: update(this.state.attribute_values, {
        $push: [attrValue]
      })
    });
  }

  removeAttrValue(index){
    this.setState({
      attribute_values: update(this.state.attribute_values, {
        $splice: [[index, 1]]
      })
    });
  }

  handleInputChange(event) {
    const target = event.target,
      type = target.type,
      name = target.name;
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
    } else if (type == "checkbox") {
      value = (target.checked) ? value : 0;
    }
    this.setState({
      [name]: value
    });
  }

  onCancel(){
    this.props.onCancel();
    try{
      this.form.resetForm();
    }catch(e){
      console.log(e);
    }
  }

  render() {
    return (<div id="retail-attribute-modal" className="modal fade"
            data-backdrop="false" data-keyboard="false">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form id={this.props.formId} action="#" onSubmit={this.props.onSave}
            className="form-validation form-validate" method="post"
          encType="multipart/form-data">
            <fieldset className="step no-padding" id="step1">
              <div className="UploadStep">
                <div className="modal-header">
                  <button type="button" className="close"
                    data-dismiss="modal" onClick={this.onCancel}>
                    &times;
                  </button>
                  <h4 className="modal-title pull-left">
                    {(this.props.isEdit) ? 'Edit' : 'Add'} Attribute
                  </h4>
                </div>
                <div className="modal-body form-horizontal">
                  <div className="form-group">
                    <label className="col-lg-4 control-label">
                      Property Name<span className="text-danger">*</span>
                    </label>
                    <div className="col-lg-8">
                      <span>{allHotels[this.props.hotelId]}</span>
                      <input type='hidden' name='hotel_id'
                        value={this.props.hotelId}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label">
                      Attribute Name<span className="text-danger">*</span>
                    </label>
                    <div className="col-lg-8">
                      <input className="form-control" type="text"
                        required="required" name="display_name"
                        value={this.state.display_name}
                        data-msg="Please enter attribute name"
                        onChange={this.handleInputChange}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label">
                      Description
                    </label>
                    <div className="col-lg-8">
                      <textarea className="form-control" name="description"
                        value={this.state.description}
                        onChange={this.handleInputChange}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label"
                    htmlFor="input-condition_bw_filters">
                      Condition B/W Filters
                    </label>
                    <div className="col-lg-8">
                      <select className="form-control select-search"
                        id="input-condition_bw_filters"
                        name="condition_bw_filters"
                        data-placeholder="Select condition"
                        value={this.state.condition_bw_filters}
                        onChange={this.handleInputChange}>
                        <option>OR</option>
                        <option>AND</option>
                      </select>
                    </div>
                  </div>
                  <div className="attribute-value-box">
                    <div className="row">
                      <div className="pull-left col-sm-6">
                        <h5>Attribute Values</h5>
                      </div>
                      <div className="pull-right col-sm-6 text-right mt-50">
                        <a className="btn dv-custom-btn btn-xs"
                          href="javascript:void(0);"
                          onClick={this.addAttrValue.bind(this)}>
                          <i className="icon-plus2"></i>
                        </a>
                      </div>
                    </div>
                    <div className="row">
                      {this.state.attribute_values.map((attribute_value, index) => {
                        return (<AttrValue
                          key={attribute_value.attribute_id}
                          attribute_value={attribute_value}
                          index={index}
                          onRemove={this.removeAttrValue}/>)
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
            <div className="form-wizard-actions clearfix">
              <div className="pull-left">
                <button type="button" data-dismiss="modal"
                  className="btn btn-flat btn-border pull-left btn-xs"
                  onClick={this.onCancel}>
                  Cancel
                </button>
              </div>
              <div className="pull-right">
                <button type="submit" id="save-attribute"
                  className="btn btn-themeClr btn-xs"
                  disabled={(this.state.child_loaded) ? false : true}>
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>);
  }
}

export default AttributeForm;
