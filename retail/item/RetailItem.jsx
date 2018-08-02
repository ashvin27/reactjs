import React, {Component, PureComponent} from 'react';
import isJSON from 'is-json';
import update from 'immutability-helper';
import ItemList from './ItemList.jsx';
import ItemForm from './ItemForm.jsx';

class RetailItem extends PureComponent {

  constructor(props) {
    super(props);
    this.resetForm = this.resetForm.bind(this);
    this.formId = 'retail-item-form';
    this.itemId = null;
    this.itemIndex = null;
    this.state = {
      hotel_id: $('#global-hotel-ddl').val(),
      is_loading: true,
      lang_code: 'en',
      is_edit: false,
      item: {},
      items: [],
      config: {}
    }
  }

  componentWillUnmount(){
    $(document).off('change', '.btn-status-change-Item');
    $(document).off('click', '.btn-edit-Item');
    $(document).off('click', '.btn-delete-Item');
  }

  componentDidMount() {
    if(window.rti)
      this.getItems(this);
    this.initialJS(this);
  }

  getItems(_this){
    $.ajax({
      url: SITE_URL + "request/api/itemlist",
      type: 'GET',
      data: {
        postedData: {
          hotel_id: this.state.hotel_id,
          lang_code: this.state.lang_code,
          cat_id: this.props.category.cat_id
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
        let items = [];
        if (response.status)
          items = response.data[this.state.hotel_id][this.state.lang_code];
        _this.setState({
          is_loading: false,
          items: items
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

  handleForm(e){
    e.preventDefault();
    let _this = this, url, hotel_id;
    if($('#' + this.formId).valid()){
      let postedData = $('#' + this.formId).serializeArray();
      postedData = serializeToJson(postedData);
      hotel_id = postedData['hotel_id'];

      if(this.state.is_edit){
        postedData['item_id'] = this.state.item.item_id;
        url = SITE_URL + "request/api/updateRetailItem";
      }else{
        url = SITE_URL + "request/api/addRetailItem";
      }
      postedData['cat_id'] = this.props.category.cat_id;
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
            formReset(_this.formId);
            $('#retail-item-modal').modal('hide');
            notificationHandler('success', message);
            if(_this.state.is_edit){
              _this.setState({
                is_edit: false,
                items: update(_this.state.items, {
                  [_this.itemIndex]: {$set: data[_this.state.hotel_id][_this.state.lang_code]}
                })
              }, () => {
                _this.resetForm();
              });
            }else{
              _this.setState({
                is_edit: false,
                items: update(_this.state.items, {
                  $push: [data[_this.state.hotel_id][_this.state.lang_code]]
                })
              }, () => {
                if(!updateCatList.hasOwnProperty(_this.props.feature.feature_id))
                  updateCatList[_this.props.feature.feature_id] = _this.props.category.cat_id;
                _this.resetForm();
              });
            }
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

  resetForm(){
    this.itemId = null;
    this.itemIndex = null;
    this.setState({
      is_edit: false,
      item: {}
    }, () => {
      $('#' + this.formId + ' .dv-upload-img').attr('src', IMG + 'default-image.png');
      $('#' + this.formId + ' select.select-search').val('').change();
      $('#' + this.formId + ' .modal-body').scrollTop(0);
      try {
        itemImage.cropper("destroy");
      } catch (e) {}
    });
  }

  sortItems(items){
    items = _.sortBy(items, 'position');
    this.setState({
      items: items
    });
  }

  initialJS(_this) {
    $('#retail-item-box').show();
    $('#retail-feature-box').hide();
    $('#retail-category-box').hide();

    $('#global-hotel-ddl').change((e)=>{
      hotelId = $(e.target).val();
      _this.setState({
        hotel_id: hotelId
      });
    });

    /**Change Status of Item**/
    let callFromUI = true;
    $(document).on('change', '.btn-status-change-Item', (e) => {
      const target = e.target,
        eleID = target.id,
        itemId = $(target).closest('tr').attr('data-id'),
        itemIndex = $(target).closest('tr').attr('data-index');
      if (callFromUI) {
        let fnResponse = confirmAction('confirm', eleID);
        fnResponse.then((status) => {
          if (status === true) {
            let isActive = ($('#' + eleID).prop("checked")) ? 1 : 0;
            let postedData = {
              hotel_id: _this.state.hotel_id,
              item_id: itemId,
              is_active: isActive
            };
            $.ajax({
              type: 'POST',
              url: SITE_URL + 'request/api/changeStatusRetailItem',
              data: {
                postedData: postedData,
                [CSRF_TOK_NAME]: getCSRFToken()
              },
              success: ({data, message, response_tag, status}, textStatus, xhr) => {
                // check for auth expiry
                expTokenRedirect({response_tag:response_tag});
                if (status) {
                  let msg = (isActive == 1)
                    ? 'Retail item activated successfully.'
                      : 'Retail item deactivated successfully.';
                  notificationHandler('success', msg);
                  _this.setState({
                    items: update(_this.state.items, {
                      [itemIndex]: {$set: data[_this.state.hotel_id][_this.state.lang_code]}
                    })
                  });
                } else {
                  // there is some problem while updating record into database
                  callFromUI = false;
                  $('#rs-' + itemId).click();
                  notificationHandler('error', message);
                }
              },
              error: (jqXHR) => {
                // error/exception handling
                ajaxErrorHandling(jqXHR);
              }
            });
          }
        });
      } else
        callFromUI = true;
      }
    );
    /**Edit Retail Item**/
    $(document).on('click', '.btn-edit-Item', (e) => {
      const target = e.target,
        itemId = $(target).closest('tr').attr('data-id'),
        itemIndex = $(target).closest('tr').attr('data-index'),
        item = _this.state.items[itemIndex];
      _this.itemId = itemId;
      _this.itemIndex = itemIndex;
      _this.setState({
        is_edit: true,
        item: item
      }, () => {
        $('#retail-item-modal').modal('show');
      });
    })
    /**Delete Retail Item**/
    $(document).on('click', '.btn-delete-Item', (e) => {
      const target = e.target,
        itemId = $(target).closest('tr').attr('data-id'),
        itemIndex = $(target).closest('tr').attr('data-index'),
        fnResponse = confirmAction('delete');
        let actionType = target.getAttribute('data-action');
      fnResponse.then((status) => {
        if (status === true) {
          // specify default value for actionType
          actionType = actionType || 'soft';
          // declare json object
          let postedData = {
            hotel_id: _this.state.hotel_id,
            item_id: itemId
          };
          // prepare ajax post URL based on actionType
          let ajaxFnName = (actionType === 'soft') ? 'delete' : 'deleteP';
          $.ajax({
            type: 'post',
            url: SITE_URL + 'request/api/' + ajaxFnName + 'RetailItem',
            data: {
              postedData: postedData,
              [CSRF_TOK_NAME]: getCSRFToken()
            },
            success: ({data, message, response_tag, status}, textStatus, xhr) => {
              // check for auth expiry
              expTokenRedirect({response_tag:response_tag});
              if (status) {
                notificationHandler('success', message);
                _this.setState({
                  items: update(_this.state.items, {
                    $splice: [[itemIndex, 1]]
                  })
                }, () => {
                  if(!updateCatList.hasOwnProperty(_this.props.feature.feature_id))
                    updateCatList[_this.props.feature.feature_id] = _this.props.category.cat_id;
                });
              } else {
                // there is some problem while deleting the record from database
                if (typeof(data['dependency-count']) != "undefined") {
                  notificationHandler('warning', message);
                } else
                  notificationHandler('error', message);
                }
              },
            error: (jqXHR) => {
              // error/exception handling
              ajaxErrorHandling(jqXHR);
            }
          });
        }
      });
    });
  }

  render() {
    return (<div id="retail-item-box" style={{display:"none"}}>
      {(this.state.is_loading) ? (<div className="col-sm-12 text-center mt-20">
        <i className="icon-spinner2 spinner data_loader"></i>
      </div>) : (<ItemList
        hotelId={this.state.hotel_id}
        feature={this.props.feature}
        category={this.props.category}
        items={this.state.items}
        onSort={this.sortItems.bind(this)}
        onBack={this.props.onBack}/>)}
      <ItemForm
        formId={this.formId}
        hotelId={this.state.hotel_id}
        isEdit={this.state.is_edit}
        config={this.props.config}
        feature={this.props.feature}
        attributes={this.props.attributes}
        item={this.state.item}
        langCode={this.state.lang_code}
        onSave={this.handleForm.bind(this)}
        onCancel={this.resetForm}/>
    </div>);
  }
}

export default RetailItem;
