import React, {Component, PureComponent, Fragment} from 'react';
import update from 'immutability-helper';
import isJSON from 'is-json';
import CategoryList from './CategoryList.jsx';
import CategoryForm from './CategoryForm.jsx';
import RetailItem from '../item/RetailItem.jsx';
import ItemForm from '../item/ItemForm.jsx';

class RetailCategory extends PureComponent {

  constructor(props) {
    super(props);
    this.resetForm = this.resetForm.bind(this);
    this.setFeature = this.setFeature.bind(this);
    this.formId = 'retail-category-form';
    this.itemFormId = 'retail-item-form';
    this.categoryId = null;
    this.categoryIndex = null;
    this.upFeature = false;
    this.state = {
      hotel_id: $('#global-hotel-ddl').val(),
      lang_code: 'en',
      is_edit: false,
      view_item: false,
      feature: {},
      ifeature: false,
      category: {},
      updateCatList: {}
    }
  }

  componentDidMount() {
    this.loadConfiguration();
    this.initialJS(this);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.features != this.props.features){
      this.upFeature = true;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.upFeature == true){
      this.upFeature = false;
      let featureId = $('#retail-category-box .nav-tabs li.active a').attr('data-id');
      this.setFeature(featureId);
    }

    if (prevState.hotel_id != this.state.hotel_id) {
      this.loadConfiguration();
    }
  }

  resetForm() {
    this.categoryId = null;
    this.categoryIndex = null;
    this.setState({
      is_edit: false,
      category: {}
    }, () => {
      $('.dv-upload-img').attr('src', IMG + 'default-image.png');
      $('#' + this.formId + ' select.select-search').val('').change();
      $('#' + this.formId + ' .modal-body').scrollTop(0);
      try {
        image.cropper("destroy");
      } catch (e) {}
    });
  }

  editCategory(index, category) {
    this.categoryId = category.cat_id;
    this.categoryIndex = index;
    this.setState({
      is_edit: true,
      category: category
    }, () => {
      $('#retail-category-modal').modal('show');
    });
  }

  viewItems(feature, category){
    this.setState({
      view_item: true,
      feature: feature,
      category: category
    })
  }

  backItems(){
    this.setState({
      view_item: false,
      feature: {},
      category: {}
    })
  }

  handleItemForm(e){
    e.preventDefault();
    let _this = this, url, hotel_id;
    if($('#' + this.itemFormId).valid()){
      let postedData = $('#' + this.itemFormId).serializeArray();
      postedData = serializeToJson(postedData);
      hotel_id = postedData['hotel_id'];
      url = SITE_URL + "request/api/addRetailItem";
      postedData['cat_id'] = this.categoryId;
      postedData[CSRF_TOK_NAME] = getCSRFToken();
      postedData['postedData'] = true;
      $.ajax({
        url: url,
        type: 'POST',
        data: postedData,
        dataType: 'json',
        beforeSend: () => {
          $('#save-item').button('loading');
        },
        complete: () => {
          $('#save-item').button('reset');
        },
        success: ({data, message, response_tag, status}, textStatus, xhr) => {
          // check for auth expiry
          expTokenRedirect({response_tag:response_tag});
          if (status) {
            if(!updateCatList.hasOwnProperty(_this.state.ifeature.feature_id))
              updateCatList[_this.state.ifeature.feature_id] = _this.categoryId;
            formReset(_this.itemFormId);
            $('#retail-item-modal').modal('hide');
            notificationHandler('success', message);
            _this.resetItemForm();
            $('#retail-item-box .backtoCategory').trigger('click');
          }else{
            notificationHandler('error', message);
          }
        },
        error: (jqXHR) => {
          $('#save-item').button('reset');
          ajaxErrorHandling(jqXHR);
        }
      });
    }
  }

  resetItemForm(){
    this.categoryId = null;
    this.categoryIndex = null;
    this.setState({
      is_edit: false,
      category: {},
      ifeature: false,
      updateCatList: updateCatList
    }, () => {
      $('.dv-upload-img').attr('src', IMG + 'default-image.png');
      $('#' + this.itemFormId + ' select.select-search').val('').change();
      $('#' + this.formId + ' .modal-body').scrollTop(0);
      try {
        itemImage.cropper("destroy");
      } catch (e) {}
      this.setState({updateCatList: {}}, () => {
        window.updateCatList = {};
      });
    });
  }

  setFeature(featureId){
    let feature = _.findWhere(this.props.features, {'feature_id': featureId});
    feature = (feature) ? feature : {is_reservation:false};
    this.setState({
      feature: feature
    });
  }

  loadConfiguration(){
    let _this = this;
    $.ajax({
      url: SITE_URL + "retail/getConfiguration",
      type: 'GET',
      dataType: 'json',
      data: {
        hotel_id: this.state.hotel_id
      },
      success: ({data, message, response_tag, status}, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect({response_tag:response_tag});
        if(status){
          let nData = {};
          for(let key in data){
            nData[key] = (isJSON(data[key])) ? JSON.parse(data[key]) : data[key];
          }
          _this.setState({
            config: nData
          });
        }
      }
    });
  }

  initialJS(_this) {
    $('#global-hotel-ddl').change((e)=>{
      hotelId = $(e.target).val();
      _this.setState({
        hotel_id: hotelId,
        view_item: false
      });
    });
    $(document).on('click', '.add-category-item', (e) => {
      let categoryId = $(e.target).attr('data-cat_id'),
      catIndex = $(e.target).attr('data-cat_index'),
      featureIndex = $(e.target).attr('data-feature_index');
      _this.categoryId = categoryId;
      featureIndex = parseInt(featureIndex);
      _this.setState({
        ifeature: _this.props.features[featureIndex]
      }, () => {
        $('#retail-item-modal').modal('show');
      });
    });
  }

  render() {
    let catItemForm = (this.state.ifeature) ? (<ItemForm
      formId={this.itemFormId}
      hotelId={this.state.hotel_id}
      isEdit={false}
      config={this.state.config}
      feature={this.state.ifeature}
      attributes={this.props.attributes}
      item={""}
      langCode={this.state.lang_code}
      onSave={this.handleItemForm.bind(this)}
      onCancel={this.resetItemForm.bind(this)}/>) : '';
    return (<Fragment>
      <div id="retail-category-box">
        {(this.props.is_loading) ? (<div className="col-sm-12 text-center mt-20">
          <i className="icon-spinner2 spinner data_loader"></i>
        </div>) : (<Fragment>
          <CategoryList
            hotelId={this.state.hotel_id}
            formId={this.formId}
            features={this.props.features}
            resetForm={this.resetForm}
            onEdit={this.editCategory.bind(this)}
            viewItems={this.viewItems.bind(this)}
            updateCatList={this.state.updateCatList}/>
          {(this.props.features.length) ? (<CategoryForm
            hotelId={this.state.hotel_id}
            formId={this.formId}
            isEdit={this.state.is_edit}
            category={this.state.category}
            onCancel={this.resetForm}/>) : ''}
        </Fragment>)}
      </div>
      {(this.state.view_item) ? (<RetailItem
        category={this.state.category}
        feature={this.state.feature}
        attributes={this.props.attributes}
        config={this.state.config}
        onBack={this.backItems.bind(this)}/>) : catItemForm}
    </Fragment>);
  }
}

export default RetailCategory;
