import React, {Component, PureComponent} from 'react';
import update from 'immutability-helper';

class AttributeList extends PureComponent {

  constructor(props) {
    super(props);
    this.setTableData = this.setTableData.bind(this);
    this.tableId = 'tbl_attribute';
    this.fileName = 'retail-attribute-list';
    this.actionBtns = {
      'enableSwitch': true,
      'enableEdit': true,
      'enableDelete': true,
      'enableInfo': false
    };
    this.state = {}
  }

  componentDidMount() {
    window.attributeTblO = createDataTable(this.tableId, this.fileName, 25, [0, "desc"], [4]);
    this.setTableData(this.props.attributes, []);
    $('#' + this.tableId + ' [data-toggle="tooltip"]').click(e => {
      $(e.currentTarget).tooltip('hide');
    })
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.attributes != this.props.attributes){
      this.setTableData(nextProps.attributes, this.props.attributes);
      if(nextProps.attributes.length < this.props.attributes.length){
        let diffAttributes = diffJSONArry(this.props.attributes,
          nextProps.attributes);
        for(let attribute of diffAttributes){
          window.attributeTblO.fnDeleteRow(
            document.getElementById('attribute_' + attribute.attribute_id),
            null, true);
        }
      }
    }
  }

  setTableData(attributes, oldAttributes){
    let i = 0,
        colLength = $('#' + this.tableId + ' > tbody > tr:first > td').length;
    for(let attribute of attributes){
      let oldAttribute = _.findWhere(oldAttributes, {
        attribute_id: attribute.attribute_id
      }),
      attributeData = update(attribute, {
        $unset: ['created_by', 'created_on', 'modified_by', 'modified_on']
      });
      if(oldAttribute){
        if(oldAttribute != attribute){
          updateDataIntoTable(attributeData.attribute_id, attributeData,
            {
              'display_name': 1,
              'description': 2,
              'condition_bw_filters': 3
            }, window.attributeTblO, 'attribute');
        }
      }else{
        let newRow = addDataIntoTable2(attributeData, ['attribute_id',
        'display_name', 'description', 'condition_bw_filters'], 'Attribute',
        'attribute', colLength,
          'attribute_id', 'attribute', this.actionBtns, window.attributeTblO, false,
          '', true, true);
        $(newRow).attr('data-index', i);
      }
      i++;
    }
  }

  render() {
    return (<div className="manage-attribute-view">
      <ul className="breadcrumb">
        <li>
          <a href="javascript:void(0);" className="backtoCategory">
            <i className="icon-arrow-left8 position-left"></i>
            Retail management
          </a>
        </li>
        <li className="active">Attributes Detail</li>
      </ul>
      <div className="table-responsive position-relative">
        <table className="table alternate-color full-width panel"
          id={this.tableId}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Display Name</th>
              <th>Description</th>
              <th>Condition B/W Filters</th>
              <th className="text-right action-column"></th>
            </tr>
          </thead>
          <tbody className="dv-customScroll"></tbody>
        </table>
      </div>
    </div>);
  }
}

export default AttributeList;
