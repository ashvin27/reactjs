import React, {Component, PureComponent} from 'react';
import update from 'immutability-helper';
import FeatureTab from './FeatureTab.jsx';

class CategoryList extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount(){
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = SITE_URL + 'assets/dist/js/view-scripts/webpacked/publish_box.bundle.js';
    document.body.appendChild(script);
  }

  componentDidUpdate(prevProps, prevState) {
    if($('#retail-category-box .nav-tabs-component li.active').length == 0){
      $('#retail-category-box .nav-tabs-component li:eq(0) a').trigger('click');
    }
  }

  render() {
    let featureTabs = [];
    return (<div className="tabbable">
      <ul className="nav nav-tabs nav-tabs-solid nav-tabs-component">
        {this.props.features.map((feature, index) => {
          if(feature.is_active == 0) return null;
          featureTabs.push(<FeatureTab
            hotelId={this.props.hotel_id}
            formId={this.props.formId}
            key={feature.feature_id + feature.hotel_id}
            index={index}
            feature={feature}
            resetForm={this.props.resetForm}
            onEdit={this.props.onEdit}
            viewItems={this.props.viewItems}
            updateCatList={this.props.updateCatList}/>);
          return (<li key={feature.feature_id}
            className={(index == 0) ? 'active' : ''}>
            <a href={"#tab-feature-" + index} data-toggle="tab"
              data-id={feature.feature_id} index={index}>
              {feature.display_name.capitalize()}
            </a>
          </li>)
        })}
      </ul>
      <div className="tab-content">
        {(featureTabs.length) ? featureTabs
        : (<div className="text-center">There is no data available.</div>)}
      </div>
    </div>);
  }
}

export default CategoryList;
