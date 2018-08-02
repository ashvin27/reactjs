import React, {Component,PureComponent} from 'react';
import update from 'immutability-helper';
import Filter from './Filter.jsx';

class FeatureForm extends PureComponent {

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.state = this.getInitialState();
  }

  getInitialState(){
    return {
      form_data: {
        feature_code: "",
        display_name: "",
        description: "",
        attributes: [],
        is_cart_enabled: 0,
        is_reservation: 0,
      }
    }
  }

  componentDidMount() {
    this.initialJS(this);
    $('#' + this.props.formId + '  #input-attributes').select2();
    $('#' + this.props.formId + '  #input-attributes').change(e => {
      setTimeout(() => {
        $(e.target).valid();
        this.handleInputChange(e);
      })
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isEdit === true){
      let attributes = [], nAttr = [];
      try {
        attributes = (nextProps.feature.attributes)
          ? JSON.parse(nextProps.feature.attributes)
          : [];
      } catch (e) {}
      for(let attribute of attributes){
        nAttr.push(attribute.attribute_id);
      }
      let feature = update(nextProps.feature, {
        attributes: {$set: nAttr},
      });
      this.setState({
        form_data: feature
      });
    }else{
      if(this.state != this.getInitialState()){
        this.setState(this.getInitialState());
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let isCartEnabled = (this.state.form_data.is_cart_enabled == 1) ? true : false;
    refreshSwitchery($('#' + this.props.formId + ' input[name="is_cart_enabled"]')[0], isCartEnabled);
    let isReservation = (this.state.form_data.is_reservation == 1) ? true : false;
    refreshSwitchery($('#' + this.props.formId + ' input[name="is_reservation"]')[0], isReservation);
    let elem = $('#' + this.props.formId + ' #input-attributes');
    if(elem.data('select2')){
      elem.select2('destroy');
    }
    elem.select2();
  }

  addFilter(){
    let filterId = new Date().valueOf(),
    filter = {
      filter_id: filterId,
      name: "",
      value: "",
    };
    this.setState({
      form_data: update(this.state.form_data, {
        filters: {$push: [filter]}
      })
    });
  }

  removeFilter(index){
    this.setState({
      form_data: update(this.state.form_data, {
        filters: {$splice: [[index, 1]]}
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
      form_data: update(this.state.form_data, {
        [name]: {$set: value},
      })
    });
  }

  initialJS(_this) {
    let windowHeight = $(window).height(),
    actualHeight = windowHeight - 280;
    $(".modal-lg .modal-body").css('height', actualHeight);
    var elems = Array.prototype.slice.call(document.querySelectorAll('#' + this.props.formId + ' .switchery'));
    elems.forEach(function (html) {
      var switchery = new Switchery(html, {color: '#64bd63', size: 'small'});
    });
    this.form = window.formValidation('#' + _this.props.formId);
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
    let formData = this.state.form_data;
    return (<div id="retail-feature-modal" className="modal fade"
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
                    {(this.props.isEdit) ? 'Edit' : 'Add'} Feature
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
                      Feature Name<span className="text-danger">*</span>
                    </label>
                    <div className="col-lg-8">
                      <input className="form-control" type="text"
                        required="required" name="display_name"
                        value={formData.display_name}
                        data-msg="Please enter feature name"
                        onChange={this.handleInputChange}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label">
                      Description
                    </label>
                    <div className="col-lg-8">
                      <textarea className="form-control" name="description"
                        value={formData.description}
                        onChange={this.handleInputChange}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label
                    retail-feature-swichery-label">
                      Cart Enabled
                    </label>
                    <div className="col-lg-8">
                      <div className="checkbox checkbox-switchery">
                        <label data-toggle="tooltip" title="No/Yes">
                          <input type="checkbox" className="switchery"
                            name="is_cart_enabled" value="1"
                            checked={formData.is_cart_enabled}
                            onChange={this.handleInputChange}/>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label
                    retail-feature-swichery-label">
                      Reservation Enabled
                    </label>
                    <div className="col-lg-8">
                      <div className="checkbox checkbox-switchery">
                        <label data-toggle="tooltip" title="No/Yes">
                          <input type="checkbox" className="switchery"
                            name="is_reservation" value="1"
                            checked={formData.is_reservation}
                            onChange={this.handleInputChange}/>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label"
                    htmlFor="input-attributes">
                      Attributes
                    </label>
                    <div className="col-lg-8">
                      <select className="form-control" multiple={true}
                        id="input-attributes" name="attributes"
                        data-placeholder="Select attributes"
                        value={this.state.form_data.attributes}
                        onChange={this.handleInputChange}>
                        {this.props.attributes.map((attribute, index) => {
                          return <option key={attribute.attribute_id} value={attribute.attribute_id}>{attribute.display_name}</option>
                        })}
                      </select>
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
                <button type="submit" id="save-feature"
                className="btn btn-themeClr btn-xs">
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

export default FeatureForm;
