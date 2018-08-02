import React, {Component,PureComponent} from 'react';
import update from 'immutability-helper';

class CategoryForm extends PureComponent {

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.width = 508;
    this.height = 444;
    this.allowed_file_type = ["image/png", "image/jpeg"];
    this.state = this.getInitialState();
  }

  getInitialState(){
    return {
      form_data: {
        display_name: "",
        description: "",
        assets: "",
        cat_image: IMG + "default-image.png"
      }
    }
  }

  componentDidMount() {
    this.initialJS(this);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isEdit === true){
      let catImg = IMG + "default-image.png";
      try {
        let assets = (nextProps.category.assets)
          ? JSON.parse(nextProps.category.assets)
          : [];
        catImg = (assets[0] != undefined) ? assets[0]['file_path'] : IMG + "default-image.png";
      } catch (e) {}
      let formData = nextProps.category;
      formData.cat_image = catImg;
      formData.assets = (nextProps.category.assets)
        ? (nextProps.category.assets) : "";
      this.setState({
        form_data: formData
      });
    }else{
      if(this.state != this.getInitialState()){
        this.setState(this.getInitialState());
      }
    }
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
    actualHeight = windowHeight - 280, inputImage = $('#inputImage');
    $(".modal-lg .modal-body").css('height', actualHeight);
    $('#' + _this.props.formId + ' .imgUploadSec').hide();
    this.form = window.formValidation('#' + _this.props.formId);
    $('#' + _this.props.formId + ' .imgUpload').on('click', (e) => {
      _this.selectImage = true;
      inputImage.trigger('click');
    });
    $('#catAssets').unbind('change').change((e) => {
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
        $("#" + _this.props.formId + " .imgUploadSec").show();
        $("#" + _this.props.formId + " .form-wizard-actions").hide();
        $("#" + _this.props.formId + " .UploadStep").hide();
      }
      /**Get crooper image object**/
      if(!image){
        image = $('#catCropImage');
      }
      let oFReader = new FileReader();
      oFReader.readAsDataURL(file);
      $('#' + _this.props.formId + ' .crop-img-loader').show();
      oFReader.onload = (event) => {
        image.off('load');
        image.attr('src', event.target.result).on('load', (e) => {
          $('#' + _this.props.formId + ' .crop-img-loader').hide();
          inputImage.val('');
        });
        dvcropper = $('#catCropImage').dvcropper({
          form_id: _this.props.formId,
          module_name: "retail",
          hotel_id: _this.props.hotelId,
          input_img: "inputImage",
          save_btn: "cropImageDone",
          width: _this.width,
          height: _this.height,
          file: file,
          file_type: "image\/png|image\/jpeg|image\/jpg|png|jpg|jpeg",
          beforeStart: () => {
            $('#cropImageDone').button('loading');
          },success: ({data, message, response_tag, status}) => {
            $('#cropImageDone').button('reset');
            if(status){
              let fileData = data[_this.props.hotelId],
              oldAssetValue = $('#catAssets').val(),
              assetValue = [{
                type: 'image',
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
              $('#catAssets').val(JSON.stringify(assetValue)).trigger('change').trigger('keyup');
              $('#categoryImg' ).attr('src', fileData.fileBasePath + fileData.full_path[0]);
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

    $('#' + _this.props.formId + ' .photoBackBtn').click((e) => {
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
    return (<div id="retail-category-modal" className="modal fade"
            data-backdrop="false" data-keyboard="false">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form id={this.props.formId} action="#" method="post"
            className="form-validation form-validate"
          encType="multipart/form-data">
            <fieldset className="step no-padding" id="step1">
              <div className="UploadStep">
                <div className="modal-header">
                  <button type="button" className="close"
                    data-dismiss="modal" onClick={this.onCancel}>
                    &times;
                  </button>
                  <h4 className="modal-title pull-left">
                    {(this.props.isEdit) ? 'Edit' : 'Add'} Category
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
                      Category Name<span className="text-danger">*</span>
                    </label>
                    <div className="col-lg-8">
                      <input className="form-control" type="text"
                        required="required" name="display_name"
                        value={this.state.form_data.display_name}
                        data-msg="Please enter category name"
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
                          <img src={this.state.form_data.cat_image}
                            id="categoryImg"
                          className="img-responsive dv-upload-img"/>
                        </div>
                        <div className="col-sm-6 dv-upoad-btn">
                          <button type="button" className="btn btn-default
                            dv-custom-btn btn-xs imgHolder imgUpload"
                          data-holder="ipad">Upload Image</button>
                          {(this.props.isEdit) ? (
                            <input type="text" name="assets" id="catAssets"
                              className="hidden"
                              value={this.state.form_data.assets}
                              onChange={this.handleInputChange}/>
                          ) : (
                            <input type="text" name="assets" id="catAssets"
                              className="hidden" required="required"
                              data-msg="Please upload image"
                              value={this.state.form_data.assets}
                              onChange={this.handleInputChange}/>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="no-padding imgUploadSec"
                style={{display: "none"}}>
                <div className="modal-header">
                  <button type="button" className="close back photoBackBtn">
                    <i className="icon-arrow-left8"></i>
                  </button>
                  <h4 className="modal-title pull-left">Category Image</h4>
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
                                    btn-upload" htmlFor="inputImage"
                                  title="Upload image file">
                                    <input type="file" className="sr-only"
                                      id="inputImage" name="file"
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
                                id="catCropImage"/>
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
                    btn-xs photoBackBtn">
                      Cancel
                    </button>
                  </div>
                  <button type="button"
                    className="btn btn-themeClr confirm-btn
                  ui-wizard-content btn-xs" id="cropImageDone">
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
                <button type="submit" id="save-category"
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

export default CategoryForm;
