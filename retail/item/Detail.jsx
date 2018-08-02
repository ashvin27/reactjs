import React, {Component,PureComponent,Fragment} from 'react';
import update from 'immutability-helper';

class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getAttributes = this.getAttributes.bind(this);
    this.updateSelect2 = false;
    this.dvcropper = null;
    this.uploadOptions = ['pdf', 'video'];
    this.files = [];
    this.state = this.getInitialState();
  }

  getInitialState(){
    let typeValue = this.props.detail.type_value, type = "quantity",
    detailValues = [], attribute_id = parseInt(this.props.detail.attribute_id);
    if(!isNaN(attribute_id) && attribute_id > 0){
      type = attribute_id
    }else{
      type = this.props.detail.type
    }
    if(!isNaN(attribute_id) && attribute_id > 0){
      try{
        detailValues = (this.props.detail.detail_values) ?
          JSON.parse(this.props.detail.detail_values) : [];
      }catch(e){
        console.log(e);
      }
      typeValue = [];
      for(let detailValue of detailValues){
        typeValue.push(detailValue.attribute_id);
      }
    }

    let stateData = {
      type: type,
      title: (this.props.detail.title) ? this.props.detail.title : "",
      type_value: typeValue,
      file_path: (this.props.detail.file_path) ? this.props.detail.file_path : "",
      attributes: [],
      detail_values: detailValues
    }
    for(let detailValue of detailValues){
      stateData['detail_' + detailValue.attribute_id + '_value_price'] = detailValue.price;
    }
    return stateData;
  }

  handleInputChange(e) {
    const target = e.target,
          pname = target.getAttribute('data-pname'),
          index = target.getAttribute('data-index'),
          id = target.getAttribute('data-id'),
          type  = target.type;
    let name = target.getAttribute('data-name'),
        value = target.value;
    if(type == "select-multiple"){
      $(target).valid();
      let options = target.options,
          selectValue = [];
      for (let i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          selectValue.push(options[i].value);
        }
      }
      value = selectValue;
    }

    if(pname == 'detail_values'){
      name = 'detail_' + id + '_value_price';
    }
    let state = {
      [name]: value
    };

    if(name == 'type'){
      state['title'] = '';
      state['type_value'] = '';
      state['file_path'] = '';
      if(!isNaN(parseInt(value))){
        let title = $(target).find('option[value="' + value + '"]').text();
        state.title = title;
        state['type_value'] = [];
      }else{
        try{
          $('#detail-row-' + this.props.detail.detail_id + ' select[data-name="type_value"]').select2('destroy');
        }catch(e){}
      }
    }

    this.setState(state, () => {
      if(this.state.type == 'pdf'){
        this.dvcropper.option('destination', "assets/pdf");
        this.dvcropper.option('file_type', "pdf");
      }else if(this.state.type == 'video'){
        this.dvcropper.option('destination', "assets/video");
        this.dvcropper.option('file_type', "mp4|3gp|mkv|webm|video\/3gpp|video\/mp4|video\/mkv|video\/x-matroska|video\/webm");
      } else if(!isNaN(parseInt(this.state.type)) && name == 'type'){
        let elem = $('#detail-row-' + this.props.detail.detail_id + ' #' + this.props.detail.detail_id + "_type_value");
        if(elem.data('select2')){
          elem.select2('destroy');
        }
        elem.select2();
        elem.unbind('change');
        elem.change((e) => {
          setTimeout(() => {
            $(e.target).valid();
            this.handleInputChange(e);
          });
        });
        this.getAttributes(this.state.type);
      }

      if(name == 'type_value' && type == "select-multiple"){
        let elem = $('#detail-row-' + this.props.detail.detail_id + ' #' + this.props.detail.detail_id + "_type_value");
        if(elem.data('select2')){
          elem.select2('destroy');
        }
        elem.select2();
      }
    });

  }

  getAttributes(parentId){
    $.ajax({
      url: SITE_URL + "request/api/retailAttrList",
      type: 'GET',
      data: {
        postedData: {
          attribute_parent_id: parentId,
          hotel_id: this.props.hotelId,
          lang_code: this.props.langCode
        }
      },
      dataType: 'json',
      success: (response, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect(response);
        let attributes = [];
        if (response.status)
          attributes = response.data[this.props.hotelId][this.props.langCode];
        this.setState({
          attributes: attributes
        }, () => {
          let elem = $('#detail-row-' + this.props.detail.detail_id + ' #' + this.props.detail.detail_id + "_type_value");
          if(elem.data('select2')){
            elem.select2('destroy');
          }
          elem.select2();
        })
      },
      error: (jqXHR) => {
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  componentDidMount(){
    $('#detail-row-' + this.props.detail.detail_id + ' .select-search').select2({
      minimumResultsForSearch: -1
    });
    $('#detail-row-' + this.props.detail.detail_id + ' .select-search').change((e) => {
      setTimeout(() => {
        $(e.target).valid();
        this.handleInputChange(e);
      })
    });
    this.initialJS(this);
    if(!isNaN(this.state.type) && this.state.type > 0){
      this.getAttributes(this.state.type);
    }
  }

  componentWillUnmount(){
    try{
      this.dvcropper.destroy();
    }catch(e){}
    $(document).off('click', "#detail-row-" + this.props.detail.detail_id + " .custom-file-upload");
    $(document).off('change', "#file_path_" + this.props.detail.detail_id);
  }

  initialJS(_this){
    $(document).on('change', "#file_path_" + this.props.detail.detail_id, (e) => {
      $(e.target).valid();
      _this.handleInputChange(e);
    });
    let destination, file_type;
    if(this.state.type == 'pdf'){
      destination = "assets/pdf";
      file_type = "pdf";
    }else if(this.state.type == 'video'){
      destination = "assets/video";
      file_type = "mp4|3gp|mkv|webm|video\/3gpp|video\/mp4|video\/mkv|video\/x-matroska|video\/webm";
    }
    _this.dvcropper = $("#file_path_" + this.props.detail.detail_id + "fileupload").dvcropper({
      cropper: false,
      form_id: _this.props.formId,
      module_name: "retail",
      file_type: file_type,
      overwrite_name: false,
      destination: destination,
      hotel_id: _this.props.hotelId,
      input_img: "file_path_" + this.props.detail.detail_id + "fileupload",
      beforeStart: () => {
        $("#detail-row-" + _this.props.detail.detail_id + " .detail_upload_loader").show();
      },success: ({data, message, response_tag, status}) => {
        $("#detail-row-" + _this.props.detail.detail_id + " .detail_upload_loader").hide();
        // check for auth expiry
        expTokenRedirect({response_tag:response_tag});
        if (status) {
          let fileData = data[_this.props.hotelId],
          filePath = fileData.fileBasePath + fileData.full_path[0];
          $("#file_path_" + this.props.detail.detail_id).val(filePath).change();
        }else{
          notificationHandler('error', message);
        }
      },error: (jqXHR) => {
        $("#detail-row-" + _this.props.detail.detail_id + " .detail_upload_loader").hide();
        // error/exception handling
        console.log(jqXHR);
      }
    });
  }

  render() {
    let detailTypes = (this.props.config
      && this.props.config.retail_item_detail_types)
      ? this.props.config.retail_item_detail_types : {};

    let typeValue = this.state.type_value;
    return (<div className="form-group"
      id={"detail-row-" + this.props.detail.detail_id}>
      <div className="col-lg-3">
        <select className="select rest_select_type_default select-search"
          data-name="type" defaultValue={(this.state.type)
            ? this.state.type : "dropdown"}
          name={"details[" + this.props.index + "][type]"}>
          {Object.keys(detailTypes).map((key, i) => {
            return (<option key={key}
              value={key}>{detailTypes[key]}</option>);
          })}
          {this.props.attributes.map((attribute, i) => {
            let attDetail = _.findWhere(this.props.allAttr, { 'attribute_id': attribute.attribute_id})
            return (<option key={attribute.attribute_id}
              value={attribute.attribute_id}>{attDetail.display_name}</option>);
          })}
        </select>
        <input type="hidden" readOnly={true}
          name={"details[" + this.props.index + "][position]"}
          value={this.props.index} />
      </div>
      <div className="col-lg-3">
        <input className="form-control" type="text" data-name="title"
          placeholder="Title*" value={this.state.title}
          required="required" data-msg="Please enter title"
          name={"details[" + this.props.index + "][title]"}
          onChange={this.handleInputChange}/>
      </div>
      {(isNaN(parseInt(this.state.type))) ? (<div
        className={(this.uploadOptions.indexOf(this.state.type) == -1
        && this.state.type != 'html') ? "col-lg-5": "col-lg-3"}>
        <input className="form-control" type="text" placeholder="Value*"
          data-name="type_value" value={typeValue}
          required="required" data-msg="Please enter value"
          name={"details[" + this.props.index + "][type_value]"}
          onChange={this.handleInputChange}/>
      </div>) : (<div className={"col-lg-5"}>
        <input type="hidden" readOnly={true}
          name={"details[" + this.props.index + "][attribute_id]"}
          value={this.state.type}/>
        <select className="form-control select-search" multiple={true}
          required="required" data-msg="Please select value"
          data-placeholder="select values"
          onChange={this.handleInputChange} data-name="type_value"
          value={this.state.type_value} style={{height: "50px"}}
          id={this.props.detail.detail_id + "_type_value"}>
          {this.state.attributes.map((attribute, index) => {
            return (<option key={attribute.attribute_id}
              value={attribute.attribute_id}>
              {attribute.display_name}
            </option>);
          })}
        </select>
      </div>)}
      <div className={"col-lg-2 " +
        ((this.uploadOptions.indexOf(this.state.type) == -1) ? 'hidden' : '')}>
        <div className="restaurantdetail_file_upload_btn clearfix">
          <div className="clearfix rest_upload_input_div
          retail_upload_input_div">
            <div className="detail_upload_loader text-center">
              <i className="icon-spinner2 spinner"></i>
            </div>
            <label htmlFor={"file_path_" +
            this.props.detail.detail_id + "fileupload"}
              className="custom-file-upload"
              title={this.state.file_path.replace(/^.*[\\\/]/, '')}>
              <i className="icon-upload7"></i>
              &nbsp; {(this.state.file_path)
                ? this.state.file_path.replace(/^.*[\\\/]/, '') : 'Upload'}
            </label>
            <input type="file" name="file" className="hidden"
              id={"file_path_" + this.props.detail.detail_id + "fileupload"}/>
            {(this.uploadOptions.indexOf(this.state.type) != -1) ? (
              <input type="text" value={this.state.file_path}
                name={"details[" + this.props.index + "][file_path]"}
                data-name="file_path" id={"file_path_" +
                this.props.detail.detail_id} onChange={this.handleInputChange}
                className="hidden" required="required"
              data-msg="Please select a file"/>) : ''}
          </div>
        </div>
      </div>
      {(this.state.type == 'html') ? (
        <div className={"col-lg-2"} >
          <input type="text" value={this.state.file_path}
            name={"details[" + this.props.index + "][file_path]"}
            data-name="file_path" placeholder="URL/Path*"
            className="form-control" required="required"
            data-msg="Please enter URL/Path"
            onChange={this.handleInputChange}/>
        </div>) : ''}
      <div className="col-lg-1 text-right">
        <a className="btn dv-custom-btn btn-xs"
          href="javascript:void(0);"
          onClick={() => {this.props.onRemove(this.props.index)}}>
          <i className="icon-trash"></i>
        </a>
      </div>

      {(!isNaN(parseInt(this.state.type)) && this.state.type_value) ? (
        this.state.type_value.map((value, index) => {
          let attr = _.findWhere(this.state.attributes, { 'attribute_id': value }),
          text = (attr) ? attr.display_name : '';
          return (<div className="col-sm-12 pull-right mt-10"
            key={value.toString()}>
            <div className="row">
              <div className="col-sm-3"></div>
              <div className="col-sm-3 mt-6 pl-30">
                {text}
                <input type="hidden"
                  name={"details[" + this.props.index + "][values][" + index + "][attribute_id]"}
                  defaultValue={value}/>
              </div>
              <div className="col-sm-5">
                <input type="number" className="form-control"
                  data-index={index} data-id={value} data-name="price" data-pname="detail_values"
                  placeholder="Price" onChange={this.handleInputChange}
                  value={this.state['detail_' + value + '_value_price']}
                  name={"details[" + this.props.index + "][values][" + index + "][price]"}/>
              </div>
            </div>
          </div>);
        })
      ) : null}

    </div>);
  }
}
export default Detail;
