import React, {Component, PureComponent} from 'react';
import update from 'immutability-helper';

class FeatureList extends PureComponent {

  constructor(props) {
    super(props);
    this.setTableData = this.setTableData.bind(this);
    this.tableId = 'tbl_feature';
    this.fileName = 'retail-feature-list';
    this.actionBtns = {
      'enableSwitch': true,
      'enableEdit': true,
      'enableDelete': true,
      'enableInfo': false
    };
    this.state = {}
  }

  componentDidMount() {
    window.featureTblO = createDataTable(this.tableId, this.fileName, 25, [0, "desc"], [5]);
    this.setTableData(this.props.features, []);
    $('#' + this.tableId + ' [data-toggle="tooltip"]').click(e => {
      $(e.currentTarget).tooltip('hide');
    })
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.features != this.props.features){
      this.setTableData(nextProps.features, this.props.features);
      if(nextProps.features.length < this.props.features.length){
        let diffFeatures = diffJSONArry(this.props.features,
          nextProps.features);
        for(let feature of diffFeatures){
          window.featureTblO.fnDeleteRow(
            document.getElementById('feature_' + feature.feature_id),
            null, true);
        }
      }
    }
  }

  setTableData(features, oldfeatures){
    let i = 0,
        colLength = $('#' + this.tableId + ' > tbody > tr:first > td').length;
    for(let feature of features){
      let oldfeature = _.findWhere(oldfeatures, {
        feature_id: feature.feature_id
      }),
      featureData = update(feature, {
        is_cart_enabled: {$set: (features[i].is_cart_enabled == 1)  ? 'Yes' : 'No'},
        is_reservation: {$set: (features[i].is_reservation == 1)  ? 'Yes' : 'No'},
        $unset: ['created_by', 'created_on', 'modified_by', 'modified_on']
      });
      if(oldfeature){
        if(oldfeature != feature){
          updateDataIntoTable(featureData.feature_id, featureData,
            {
              'display_name': 1,
              'description': 2,
              'is_cart_enabled': 3,
              'is_reservation': 4
            }, window.featureTblO, 'feature');
        }
      }else{
        let newRow = addDataIntoTable2(featureData, [
          'feature_id', 'display_name', 'description', 'is_cart_enabled',
          'is_reservation'], 'Feature', 'feature', colLength, 'feature_id',
          'feature', this.actionBtns, window.featureTblO, false,
          '', true, true);
        $(newRow).attr('data-index', i);
      }
      i++;
    }
  }

  render() {
    return (<div className="manage-feature-view">
      <ul className="breadcrumb">
        <li>
          <a href="javascript:void(0);" className="backtoCategory">
            <i className="icon-arrow-left8 position-left"></i>
            Retail management
          </a>
        </li>
        <li className="active">Features Detail</li>
      </ul>
      <div className="table-responsive position-relative">
        <table className="table alternate-color full-width panel"
          id={this.tableId}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Display Name</th>
              <th>Description</th>
              <th>Cart Enabled</th>
              <th>Reservation Enabled</th>
              <th className="text-right action-column"></th>
            </tr>
          </thead>
          <tbody className="dv-customScroll"></tbody>
        </table>
      </div>
    </div>);
  }
}

export default FeatureList;
