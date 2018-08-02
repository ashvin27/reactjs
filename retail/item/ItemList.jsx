import React, {Component,PureComponent} from 'react';
import update from 'immutability-helper';

class ItemList extends PureComponent {

  constructor(props) {
    super(props);
    this.handleSortable = this.handleSortable.bind(this);
    this.handleReorder = this.handleReorder.bind(this);
    this.setTableData = this.setTableData.bind(this);
    this.tableId = 'tbl_item';
    this.fileName = 'retail-item-list';
    this.sortItems = false;
    this.itemIds = [];
    this.actionBtns = {
      'enableSwitch': true,
      'enableEdit': true,
      'enableDelete': true,
      'enableInfo': false
    };
    this.state = {}
  }

  componentWillUnmount(){
    window.itemTblO.destroy();
  }

  componentDidMount() {
    window.itemTblO = createDataTableN(this.tableId, {
      filePrefix: this.fileName,
      rowReorder: true,
      disableSorting: [6],
      createdRow: (row, data, dataIndex) => {
        $(row).attr('id', 'item-row-' + dataIndex);
      },
      drawCallback: (settings) => {
        $('.checkbox-switchery').tooltip({
          trigger: "hover"
        });
        $('.checkbox-switchery').on('click', (e) => {
          $(e.currentTarget).tooltip('hide');
        });
        $('.dataTables_length select').select2({
          minimumResultsForSearch: Infinity,
          width: 'auto'
        });
      },
      reorderCallback: this.handleReorder
    });

    //this.setTableData(this.props.items, []);
    $('#' + this.tableId + ' [data-toggle="tooltip"]').click(e => {
      $(e.currentTarget).tooltip('hide');
    });
    this.populateItemList(this.props.items);
  }

  componentWillUpdate(){
     window.itemTblO.clear();
  }

  componentWillReceiveProps(nextProps){
    /*if(nextProps.items != this.props.items){
      this.setTableData(nextProps.items, this.props.items);
      if(nextProps.items.length < this.props.items.length){
        let diffItems = diffJSONArry(this.props.items,
          nextProps.items);
        for(let item of diffItems){
          window.itemTblO.fnDeleteRow(
            document.getElementById('item_' + item.item_id),
            null, true);
        }
      }
    }*/
  }

  setTableData(items, olditems){
    let i = 0,
        colCount = $('#' + this.tableId + ' > tbody > tr:first > td').length;
    for(let item of items){
      let olditem = _.findWhere(olditems, {
        item_id: item.item_id
      }),
      itemData = update(item, {
        is_reservation: {$set: (items[i].is_reservation == 1)  ? 'Yes' : 'No'},
        $unset: ['created_by', 'created_on', 'modified_by', 'modified_on']
      }),
      itemImg = IMG + "default-image.png";
      try{
        let assets = (itemData.assets) ? JSON.parse(itemData.assets) : '';
        itemImg = (typeof assets[0] != "undefined") ? assets[0]['file_path'] : IMG + "default-image.png";
      }catch(e){}
      itemData['image'] = '<img src="' + itemImg + '" alt="' + item.display_name + '" class="img-rounded img-preview">';
      itemData.position = parseInt(i) + 1;

      if(olditem){
        if(olditem != item){
          console.log("itemData", itemData);
          updateDataIntoTableN(window.itemTblO, {
            rowId: '#item-row-' + i,
            id: itemData.item_id,
            dataObj: itemData,
            dataSequence: {
              'image': 1,
              'display_name': 2,
              'description': 3,
              'price': 4,
              'is_reservation': 5
            },
            fnPostfix: "Item",
            idPrefix: "item",
          });
        }
      }else{
        let newRow = addDataIntoTableN(window.itemTblO, {
          dataObj: itemData,
          dataSequence: ['item_id', 'image', 'display_name', 'description', 'price', 'is_reservation'],
          fnPostfix: "Item",
          btnTitlePostfix: "item",
          colCount: colCount,
          idCol: "item_id",
          idPrefix: "item",
          actionBtns: this.actionBtns,
          movable: true,
          isReact: true
        });
        $(newRow).attr('data-index', i);
      }
      i++;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.populateItemList(this.props.items);
    if(this.sortItems && this.itemIds.length > 0){
      this.sortItems = false;
      this.handleSortable();
    }
  }

  populateItemList(items){
    let actionBtns = {
      'enableSwitch': true,
      'enableEdit': true,
      'enableDelete': true,
      'enableInfo': false
    };
    for (let i in items) {
      let item = update(items[i], {
        is_reservation: {$set: (items[i].is_reservation == 1)  ? 'Yes' : 'No'},
        $unset: ['created_by', 'created_on', 'modified_by', 'modified_on']
      }),
      isLast = (items.length == (parseInt(i) + 1)) ? true : false,
      itemImg = IMG + "default-image.png";
      try{
        let assets = (item.assets) ? JSON.parse(item.assets) : '';
        itemImg = (typeof assets[0] != "undefined") ? assets[0]['file_path'] : IMG + "default-image.png";
      }catch(e){}
      item['image'] = '<img src="' + itemImg + '" alt="' + item.display_name + '" class="img-rounded img-preview">';

      item.position = parseInt(i) + 1;
      let colCount = $('#' + this.tableId + ' > tbody > tr:first > td').length,
      newRow = addDataIntoTableN(window.itemTblO, {
        dataObj: item,
        dataSequence: ['item_id', 'image', 'display_name', 'description', 'price', 'is_reservation'],
        fnPostfix: "Item",
        btnTitlePostfix: "item",
        colCount: colCount,
        idCol: "item_id",
        idPrefix: "item",
        actionBtns: actionBtns,
        movable: true,
        isReact: true
      });
      $(newRow).attr('data-index', i);
    }
  }

  handleReorder(e, diff, edit){
    if(diff.length < 1) return;
    setTimeout(() => {
      let items = this.props.items, itemIds = [];
      window.itemTblO.rows().every( rowIndex => {
        let node = window.itemTblO.row(rowIndex).node(),
        itemId = $(node).attr("data-id"),
        itemIndex = $(node).attr("data-index"),
        position = parseInt($(node).find("td:first-child").text());
        try{
          items = update(items, {
            [itemIndex]: {position: {$set: position}}
          });
        }catch(e){
          console.log("Exception", e);
        }
        itemIds.push({item_id: itemId, position: position});
      });
      this.sortItems = true;
      this.itemIds = itemIds
      this.props.onSort(items);
    }, 100);
  }

  handleSortable(){
    let postedData = {
      item_ids: this.itemIds,
      hotel_id: this.props.hotelId
    };
    $.ajax({
      type: 'POST',
      url: SITE_URL + 'request/api/sortItems',
      data: {
        postedData: postedData,
        [CSRF_TOK_NAME]: getCSRFToken()
      },
      beforeSend: () => {
        this.itemIds = [];
      },
      success: ({
        data,
        message,
        response_tag,
        status
      }, textStatus, xhr) => {
        // check for auth expiry
        expTokenRedirect({response_tag: response_tag});
        if (status) {
          notificationHandler('success', message);
        } else {
          notificationHandler('error', message);
        }
      },
      error: (jqXHR) => {
        // error/exception handling
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  render() {
    return (<div className="item-view">
      <ul className="breadcrumb">
        <li>
          <a href="javascript:void(0);" className="backtoCategory"
            onClick={this.props.onBack}>
            <i className="icon-arrow-left8 position-left"></i>
            {this.props.feature.display_name.capitalize()}
          </a>
        </li>
        <li className="active">{this.props.category.display_name.capitalize()}</li>
      </ul>
      <div className="table-responsive position-relative">
        <table className="table alternate-color panel retail-item-tbl"
          id={this.tableId}>
          <thead>
            <tr>
              <th></th>
              <th>Image</th>
              <th>Display Name</th>
              <th>Description</th>
              <th>Price</th>
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

export default ItemList;
