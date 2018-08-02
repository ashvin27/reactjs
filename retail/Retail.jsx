import React, {Component, PureComponent} from 'react';
import isJSON from 'is-json';
import update from 'immutability-helper';
import RetailCategory from './category/RetailCategory.jsx';
import RetailFeature from './feature/RetailFeature.jsx';
import RetailAttribute from './attribute/RetailAttribute.jsx';

class Retail extends PureComponent {

  constructor(props) {
    super(props);
    this.getFeatures = this.getFeatures.bind(this);
    this.getAttributes = this.getAttributes.bind(this);
    this.modelToDisplay = '#retail-category-modal';
    this.state = {
      hotel_id: $('#global-hotel-ddl').val(),
      is_loading: true,
      features: [],
      attributes: [],
      lang_code: 'en'
    }
  }

  componentDidMount() {
    $('.inner-loader').hide();
    this.getFeatures();
    this.getAttributes();
    //this.loadConfiguration();
    this.initialJS(this);
  }

  componentDidUpdate(prevProps, prevState) {
    //this.filterSearch();
    if (prevState.hotel_id != this.state.hotel_id) {
      this.getFeatures();
      this.getAttributes();
    }
  }

  getFeatures(){
    let _this = this;
    $.ajax({
      url: SITE_URL + "request/api/featurelist",
      type: 'GET',
      data: {
        postedData: {
          hotel_id: this.state.hotel_id,
          lang_code: this.state.lang_code
        }
      },
      dataType: 'json',
      beforeSend: () => {
        if(!_this.state.is_loading){
          _this.setState({
            is_loading: true,
          });
        }
      },
      complete: () => {},
      success: (response, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect(response);
        let features = [];
        if (response.status)
          features = response.data[this.state.hotel_id][this.state.lang_code];
        _this.setState({
          is_loading: false,
          features: features
        })
      },
      error: (jqXHR) => {
        _this.setState({
          is_loading: false
        })
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  addFeature(feature){
    this.setState({
      features: update(this.state.features, {
        $push: [feature]
      })
    });
  }

  updateFeature(feature, featureIndex){
    this.setState({
      features: update(this.state.features, {
        [featureIndex]: {$set: feature}
      })
    });
  }

  deleteFeature(featureIndex){
    this.setState({
      features: update(this.state.features, {
        $splice: [[featureIndex, 1]]
      })
    });
  }

  addAttribute(attribute){
    this.setState({
      attributes: update(this.state.attributes, {
        $push: [attribute]
      })
    });
  }

  updateAttribute(attribute, attributeIndex){
    this.setState({
      attributes: update(this.state.attributes, {
        [attributeIndex]: {$set: attribute}
      })
    });
  }

  deleteAttribute(attributeIndex){
    this.setState({
      attributes: update(this.state.attributes, {
        $splice: [[attributeIndex, 1]]
      })
    });
  }

  getAttributes(){
    $.ajax({
      url: SITE_URL + "request/api/retailAttrList",
      type: 'GET',
      data: {
        postedData: {
          hotel_id: this.state.hotel_id,
          lang_code: this.state.lang_code
        }
      },
      dataType: 'json',
      success: (response, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect(response);
        let attributes = [];
        if (response.status)
          attributes = response.data[this.state.hotel_id][this.state.lang_code];
        this.setState({
          attributes: attributes
        })
      },
      error: (jqXHR) => {
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  initialJS(_this) {
    $('#global-hotel-ddl').change((e)=>{
      hotelId = $(e.target).val();
      _this.setState({
        hotel_id: hotelId
      }, () => {
        $('#retail-category-box').show();
        $('#retail-feature-box').hide();
        $('#retail-item-box').hide();
        _this.modelToDisplay = '#retail-category-modal';
      });
    });
    // show features screen, hide attributes, category & items screen
    $('.manageFeatureBtn').click(() => {
      $('#retail-feature-box').show();
      $('#retail-attribute-box, #retail-category-box, #retail-item-box').hide();
      _this.modelToDisplay = '#retail-feature-modal';
    });
    // show attributes screen, hide feature, category & items screen
    $('.manageAttributeBtn').click(() => {
      $('#retail-attribute-box').show();
      $('#retail-feature-box, #retail-category-box, #retail-item-box').hide();
      _this.modelToDisplay = '#retail-attribute-modal';
    });
    // show categories screen, hide features, attributes & items screen
    $(document).on('click', '.backtoCategory', () => {
      $('#retail-category-box').show();
      $('#retail-feature-box, #retail-attribute-box, #retail-item-box').hide();
      _this.modelToDisplay = '#retail-category-modal';
    });
    // show items screen, hide features, attributes & category screen
    $(document).on('click', '.show-item', () => {
      $('#retail-item-box').show();
      $('#retail-feature-box, #retail-attribute-box, #retail-category-box').hide();
      _this.modelToDisplay = '#retail-item-modal';
    });

    // display add form according to visible screen
    $('.btn-add').click(() => {
      $(_this.modelToDisplay).modal('show');
    })
  }

  render() {
    return (<React.Fragment>
      <RetailCategory
        features={this.state.features}
        attributes={this.state.attributes}
        is_loading={this.state.is_loading}/>
      <RetailFeature
        lang_code={this.state.lang_code}
        features={this.state.features}
        attributes={this.state.attributes}
        is_loading={this.state.is_loading}
        onAdd={this.addFeature.bind(this)}
        onUpdate={this.updateFeature.bind(this)}
        onDelete={this.deleteFeature.bind(this)}/>
      <RetailAttribute
        lang_code={this.state.lang_code}
        features={this.state.features}
        attributes={this.state.attributes}
        is_loading={this.state.is_loading}
        onAdd={this.addAttribute.bind(this)}
        onUpdate={this.updateAttribute.bind(this)}
        onDelete={this.deleteAttribute.bind(this)}/>
    </React.Fragment>);
  }
}

export default Retail;
