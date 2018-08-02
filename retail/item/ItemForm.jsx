import React, {Component,PureComponent} from 'react';
import update from 'immutability-helper';
import Filter from './Filter.jsx';
import Detail from './Detail.jsx';

class ItemForm extends PureComponent {

  constructor(props) {
    super(props);
    this.getInitialState = this.getInitialState.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getDetails = this.getDetails.bind(this);
    this.removeDetail = this.removeDetail.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.getDetail = false;
    this.detailLoaded = true;
    this.width = 708;
    this.height = 970;
    this.allowed_file_type = ["image/png", "image/jpeg"];
    this.state = this.getInitialState();
  }

  getInitialState(){
    let attributes = [], nAttr = [], i = 0;
    try {
      attributes = (this.props.feature.attributes)
        ? JSON.parse(this.props.feature.attributes)
        : [];
    } catch (e) {}

    return {
      detail_loaded: true,
      form_data: {
        display_name: "",
        description: "",
        assets: "",
        item_image: IMG + "default-image.png",
        price: "",
        res_confirmation_text: "",
        is_reservation: (this.props.feature.is_reservation == 1) ? true : false,
        details: []
      },
      attributes: attributes
    }
  }

  componentWillUnmount(){
    $('#' + this.props.formId + ' .photoBackBtn').unbind('click');
    $('#' + this.props.formId + ' .imgUpload').off('click');
    itemImage = null;
  }

  componentDidMount() {
    this.initialJS(this);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isEdit === true){
      if(nextProps != this.props){
        let itemImg = IMG + "default-image.png", details = [];
        try {
          let assets = (nextProps.item.assets)
            ? JSON.parse(nextProps.item.assets)
            : [];
          itemImg = (assets[0] != undefined) ? assets[0]['file_path'] : IMG + "default-image.png";
        } catch (e) {
          console.log("e", e);
        }
        let item = nextProps.item;
        let formData = update(item, {
          item_image: {$set: itemImg},
          is_reservation: {$set: (item.is_reservation == 1)  ? true : false},
          assets: {$set: (item.assets)  ? item.assets : ''},
          price: {$set: (item.price)  ? item.price : ''},
          details: {$set: []}
        });
        this.getDetail = true;
        this.setState({
          detail_loaded: false,
          form_data: formData
        });
      }
    }else{
      this.setState(this.getInitialState());
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let isReservation = (this.state.form_data.is_reservation == 1
      || this.state.form_data.is_reservation == true) ? true : false;
    refreshSwitchery(
      $('#' + this.props.formId + ' input[name="is_reservation"]')[0],
      isReservation);

    if(this.getDetail){
      this.getDetail = false;
      this.getDetails();
    }
  }

  getDetails(){
    let _this = this;
    $.ajax({
      url: SITE_URL + "request/api/retailItemDetail",
      type: 'GET',
      data: {
        postedData: {
          hotel_id: this.props.item.hotel_id,
          lang_code: this.props.langCode,
          item_id: this.props.item.item_id
        }
      },
      dataType: 'json',
      success: ({data, message, response_tag, status}, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect({response_tag:response_tag});
        if (status){
          let details = data[_this.props.item.hotel_id][_this.props.langCode];
          _this.setState({
            detail_loaded: true,
            form_data: update(_this.state.form_data, {
              details: {$set: details}
            })
          });
        }else{
          this.setState({
            detail_loaded: true
          });
        }
      },
      error: (jqXHR) => {
        _this.setState({
          is_loading: false
        })
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  addDetail(){
    let detailId = new Date().valueOf(),
    detail = {
      detail_id: detailId,
      title: "",
      type: "",
      type_value: "",
      file_path: ""
    };
    this.setState({
      form_data: update(this.state.form_data, {
        details: {$push: [detail]}
      })
    });
  }

  removeDetail(index){
    this.setState({
      form_data: update(this.state.form_data, {
        details: {$splice: [[index, 1]]}
      })
    });
  }

  handleInputChange(event) {
    const target = event.target,
      type = target.type,
      name = target.name;
    let value = target.value;
    if (type == "checkbox") {
      value = (target.checked) ? value : 0;
    }
    this.setState({
      form_data: update(this.state.form_data, {
        [name]: {$set: value}
      })
    });
  }

  initialJS(_this) {
    let windowHeight = $(window).height(), dvcropper,
    actualHeight = windowHeight - 280, inputImage = $('#inputImageItem');
    $(".modal-lg .modal-body").css('height', actualHeight);
    let elems = Array.prototype.slice.call(document.querySelectorAll('#' + _this.props.formId + ' .switchery'));
    elems.forEach(html => {
      let switchery = new Switchery(html, {color: '#64bd63', size: 'small'});
    });
    $('#' + _this.props.formId + ' .imgUploadSec').hide();
    this.form = window.formValidation('#' + _this.props.formId);
    $('#' + _this.props.formId + ' .imgUpload').on('click', (e) => {
      _this.selectImage = true;
      inputImage.trigger('click');
    });
    $('#itemAssets').unbind('change').change((e) => {
      _this.handleInputChange(e);
    });
    inputImage.change((e) => {
      let files = e.target.files, file = files[0];
      /**keep it out when no file selected first time**/
      if(!files || !files.length) return;
      if (_this.allowed_file_type.indexOf(file.type) == -1) {
        notificationHandler('error', "This file type is not allowed. Only jpg, jpeg, png are supported.");
        return ;
      }
      /**Display Cropper prepare initilization data**/
      if(_this.selectImage){
        _this.selectImage = false;
        $('#' + _this.props.formId + ' .imgUploadSec').show();
        $('#' + _this.props.formId + ' .form-wizard-actions').hide();
        $('#' + _this.props.formId + ' .UploadStep').hide();
      }
      /**Get crooper image object**/
      if(!itemImage){
        itemImage = $('#itemCropImage');
      }
      let oFReader = new FileReader();
      oFReader.readAsDataURL(file);
      $('#' + _this.props.formId + ' .crop-img-loader').show();
      oFReader.onload = (oFREvent) => {
        itemImage.off('load');
        itemImage.attr('src', event.target.result).on('load', (e) => {
          $('#' + _this.props.formId + ' .crop-img-loader').hide();
          inputImage.val('');
        });
        dvcropper = $('#itemCropImage').dvcropper({
          form_id: _this.props.formId,
          module_name: "retail",
          hotel_id: _this.props.hotelId,
          input_img: "inputImageItem",
          save_btn: "cropImageDoneItem",
          width: _this.width,
          height: _this.height,
          file: file,
          file_type: "image\/png|image\/jpeg|image\/jpg|png|jpg|jpeg",
          beforeStart: () => {
            $('#cropImageDoneItem').button('loading');
          },success: ({data, message, response_tag, status}) => {
            $('#cropImageDoneItem').button('reset');
            if(status){
              let fileData = data[_this.props.hotelId],
              oldAssetValue = $('#itemAssets').val(),
              assetValue = [{
                type: 'large_image',
                file_path: fileData.file_name[0],
                description: fileData.file_name[0],
                position: 1
              }];
              if (oldAssetValue) {
                oldAssetValue = JSON.parse(oldAssetValue);
                if(typeof oldAssetValue[0]['asset_id'] != "undefined"){
                  assetValue[0]['asset_id'] = oldAssetValue[0]['asset_id']
                }
              }
              $('#itemAssets').val(JSON.stringify(assetValue)).trigger('change').trigger('keyup');
              $('#itemImg' ).attr('src', fileData.fileBasePath + fileData.full_path[0]);
              $('#' + _this.props.formId + ' .photoBackBtn').trigger('click');
              dvcropper.destroy();
            }else{
              notificationHandler('error', message);
            }
          },error: (jqXHR) => {
            // error/exception handling
            console.log(jqXHR);
          }
        });
      }
    });

    $('#' + _this.props.formId + ' .photoBackBtnItem').click((e) => {
      $('#' + _this.props.formId + ' .UploadStep').show();
      $('#' + _this.props.formId + ' .form-wizard-actions').show();
      $('#' + _this.props.formId + ' .imgUploadSec').hide();
      $('#' + _this.props.formId + ' .bulkupload').hide();
      dvcropper.destroy();
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
    return (<div id="retail-item-modal" className="modal fade"
            data-backdrop="false" data-keyboard="false">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form id={this.props.formId} action="#" onSubmit={this.props.onSave}
          className="form-validation form-validate">
            <fieldset className="step no-padding" id="step1">
              <div className="UploadStep">
                <div className="modal-header">
                  <button type="button" className="close"
                    data-dismiss="modal" onClick={this.onCancel}>
                    &times;
                  </button>
                  <h4 className="modal-title pull-left">
                    {(this.props.isEdit)  ? 'Edit' : 'Add'} Item
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
                      Item Name<span className="text-danger">*</span>
                    </label>
                    <div className="col-lg-8">
                      <input className="form-control" type="text"
                        name="display_name" required="required"
                        value={this.state.form_data.display_name}
                        data-msg="Please enter item name"
                        onChange={this.handleInputChange}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label">
                      Description
                    </label>
                    <div className="col-lg-8">
                      <textarea className="form-control" name="description"
                        onChange={this.handleInputChange}
                        value={this.state.form_data.description}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label">
                      Image<span className="text-danger">*</span>
                    </label>
                    <div className="col-lg-8">
                      <div className="row">
                        <div className="col-sm-6">
                          <img src={this.state.form_data.item_image}
                            id="itemImg"
                          className="img-responsive dv-upload-img"/>
                        </div>
                        <div className="col-sm-6 dv-upoad-btn">
                          <button type="button" className="btn btn-default
                            dv-custom-btn btn-xs imgHolder imgUpload"
                          data-holder="ipad">Upload Image</button>
                          {(this.props.isEdit) ? (
                            <input type="text" name="assets" id="itemAssets"
                              className="hidden"
                              value={this.state.form_data.assets}
                              onChange={this.handleInputChange}/>
                          ) : (
                            <input type="text" name="assets" id="itemAssets"
                              className="hidden" required="required"
                              data-msg="Please upload image"
                              value={this.state.form_data.assets}
                              onChange={this.handleInputChange}/>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label">
                      Price
                    </label>
                    <div className="col-lg-8">
                      <input className="form-control" type="number"
                        name="price" value={this.state.form_data.price}
                        onChange={this.handleInputChange}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label">
                      Confirmation Text<span className="text-danger">*</span>
                    </label>
                    <div className="col-lg-8">
                      <textarea className="form-control"
                        name="res_confirmation_text" required="required"
                        data-msg="Please enter confirmation text"
                        value={this.state.form_data.res_confirmation_text}
                        onChange={this.handleInputChange}/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-lg-4 control-label">
                      Reservation Enabled
                    </label>
                    <div className="col-lg-8">
                      <div className="checkbox checkbox-switchery">
                        <label data-toggle="tooltip" title="No/Yes">
                          <input type="checkbox" className="switchery"
                            name="is_reservation" value="1"
                            checked={this.state.form_data.is_reservation}
                            onChange={this.handleInputChange}/>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="item-detail-box">
                    <div className="row">
                      <div className="pull-left col-sm-6">
                        <h5>Item Details</h5>
                      </div>
                      <div className="pull-right col-sm-6 text-right mt-50">
                        <a className="btn dv-custom-btn btn-xs"
                          href="javascript:void(0);"
                          onClick={this.addDetail.bind(this)}>
                          <i className="icon-plus2"></i>
                        </a>
                      </div>
                    </div>
                    {this.state.form_data.details.map((detail, index) => {
                      return (<Detail
                        key={detail.detail_id}
                        hotelId={this.props.hotelId}
                        formId={this.props.formId}
                        config={this.props.config}
                        detail={detail}
                        attributes={this.state.attributes}
                        allAttr={this.props.attributes}
                        index={index}
                        langCode={this.props.langCode}
                        onRemove={this.removeDetail}/>)
                    })}
                  </div>
                </div>
              </div>
              <div className="no-padding imgUploadSec">
                <div className="modal-header">
                  <button type="button" className="close back photoBackBtn photoBackBtnItem">
                    <i className="icon-arrow-left8"></i>
                  </button>
                  <h4 className="modal-title pull-left">Photo</h4>
                </div>
                <div className="modal-body form-horizontal no-padding">
                  <div className="col-md-12">
                    <div className="tabbable">
                      <ul className="nav nav-tabs nav-tabs-bottom">
                        <li className="active">
                          <a href="#bottom-tab4" data-toggle="tab">Upload</a>
                        </li>
                      </ul>
                      <div className="tab-content">
                        <div className="tab-pane active" id="bottom-tab4">
                          <div className="panel-flat">
                            <div className="panel-body">
                              <div className="form-group cropTools">
                                <div className="btn-group">
                                  <label className="btn btn-xs dv-custom-btn
                                    btn-upload" htmlFor="inputImageItem"
                                  title="Upload image file">
                                    <input type="file" name="file"
                                      className="sr-only" id="inputImageItem"
                                    accept=".jpg,.jpeg,.png"/>
                                    <span className="docs-tooltip"
                                    title="Upload Image">
                                      <span className="fa fa-upload"></span>
                                    </span>
                                  </label>
                                  <div className="btn-group">
                                    <button type="button"
                                      className="btn btn-xs dv-custom-btn"
                                      data-method="zoom" data-option="0.1"
                                    title="Zoom In">
                                      <span className="docs-tooltip"
                                      data-toggle="tooltip" title="">
                                        <span
                                        className="fa fa-search-plus"></span>
                                      </span>
                                    </button>
                                  </div>
                                  <div className="btn-group">
                                    <button type="button"
                                      className="btn btn-xs dv-custom-btn"
                                      data-method="zoom" data-option="-0.1"
                                    title="Zoom Out">
                                      <span className="docs-tooltip"
                                      data-toggle="tooltip" title="">
                                        <span
                                        className="fa fa-search-minus"></span>
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="content-group cropImage
                                overflow-hidden"
                                style={{height: "300px",position: "relative"}}>
                                <div className="col-sm-12 text-center
                                crop-img-loader">
                                  <i className="icon-spinner2 spinner
                                  data_loader"></i>
                                </div>
                                <img src={IMG + "default-image.png"}
                                id="itemCropImage"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="pull-left">
                    <button type="button"
                      className="btn btn-flat btn-border pull-left
                    btn-xs photoBackBtnItem">
                      Cancel
                    </button>
                  </div>
                  <button type="button"
                    className="btn btn-themeClr confirm-btn
                  ui-wizard-content btn-xs" id="cropImageDoneItem">
                    Save
                  </button>
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
                <button type="submit" id="save-item"
                  className="btn btn-themeClr btn-xs"
                  disabled={(this.state.detail_loaded) ? false : true}>
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

export default ItemForm;
