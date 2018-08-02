import React, {Component,PureComponent} from 'react';
import update from 'immutability-helper';
import AttributeList from './AttributeList.jsx';
import AttributeForm from './AttributeForm.jsx';

class RetailAttribute extends PureComponent {

  constructor(props) {
    super(props);
    this.resetForm = this.resetForm.bind(this);
    this.initialJS = this.initialJS.bind(this);
    this.handleForm
    this.formId = "retail-attribute-form";
    this.attributeIndex = null;
    this.attributeId = null;
    this.state = {
      hotel_id: $('#global-hotel-ddl').val(),
      attribute: {},
      attributes: [],
      is_loading: true,
      is_edit: false
    }
  }

  componentDidMount() {
    this.initialJS(this);
  }

  handleForm(e){
    e.preventDefault();
    let url, hotel_id;
    if($('#' + this.formId).valid()){
      let postedData = $('#' + this.formId).serializeArray();
      postedData = serializeToJson(postedData);
      hotel_id = postedData['hotel_id'];

      if(this.state.is_edit){
        postedData['attribute_id'] = this.state.attribute.attribute_id;
        url = SITE_URL + "request/api/updateRetailAttribute";
      }else{
        url = SITE_URL + "request/api/addRetailAttribute";
      }
      postedData[CSRF_TOK_NAME] = getCSRFToken();
      postedData['postedData'] = true;
      $.ajax({
        url: url,
        type: 'POST',
        data: postedData,
        dataType: 'json',
        beforeSend: () => {
          $('#save-attribute').button('loading');
        },
        complete: () => {
          $('#save-attribute').button('reset');
        },
        success: ({data, message, response_tag, status}, textStatus, xhr) => {
          // check for auth expiry
          expTokenRedirect({response_tag:response_tag});
          if (status) {
            formReset(this.formId);
            $('#retail-attribute-modal').modal('hide');
            notificationHandler('success', message);
            if(this.state.is_edit)
              this.props.onUpdate(data[hotel_id][this.props.lang_code], this.attributeIndex);
            else
              this.props.onAdd(data[hotel_id][this.props.lang_code]);
            this.resetForm();
          }else{
            notificationHandler('error', message);
          }
        },
        error: (jqXHR) => {
          $('#save-attribute').button('reset');
          ajaxErrorHandling(jqXHR);
        }
      });
    }
  }

  resetForm(){
    this.attributeId = null;
    this.attributeIndex = null;
    this.setState({
      is_edit: false,
      attribute: {}
    }, () => {
      $('#' + this.formId + ' .modal-body').scrollTop(0);
    });
  }

  initialJS() {
    $('#global-hotel-ddl').change((e)=>{
      hotelId = $(e.target).val();
      this.setState({
        hotel_id: hotelId
      });
    });
    /**Change Status of Attribute**/
    let callFromUI = true;
    $(document).on('change', '.btn-status-change-Attribute', (e) => {
      const target = e.target,
        eleID = target.id,
        attributeId = $(target).closest('tr').attr('data-id'),
        attributeIndex = $(target).closest('tr').attr('data-index');
      if (callFromUI) {
        let fnResponse = confirmAction('confirm', eleID);
        fnResponse.then((status) => {
          if (status === true) {
            let isActive = ($('#' + eleID).prop("checked")) ? 1 : 0;
            let postedData = {
              hotel_id: this.state.hotel_id,
              attribute_id: attributeId,
              is_active: isActive
            };
            $.ajax({
              type: 'post',
              url: SITE_URL + 'request/api/changeStatusRetailAttribute',
              data: {
                postedData: postedData,
                [CSRF_TOK_NAME]: getCSRFToken()
              },
              success: ({data, message, response_tag, status}, textStatus, xhr) => {
                // check for auth expiry
                expTokenRedirect({response_tag:response_tag});
                if (status) {
                  let msg = (isActive == 1)
                    ? 'Retail attribute activated successfully.'
                      : 'Retail attribute deactivated successfully.';
                  notificationHandler('success', msg);
                  this.props.onUpdate(data[this.state.hotel_id][this.props.lang_code], attributeIndex);
                } else {
                  // there is some problem while updating record into database
                  callFromUI = false;
                  $('#rs-' + attributeId).click();
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
    /**Edit Retail Attribute**/
    $(document).on('click', '.btn-edit-Attribute', (e) => {
      const target = e.target,
        attributeId = $(target).closest('tr').attr('data-id'),
        attributeIndex = $(target).closest('tr').attr('data-index'),
        attribute = this.props.attributes[attributeIndex];
      this.attributeId = attributeId;
      this.attributeIndex = attributeIndex;
      this.setState({
        is_edit: true,
        attribute: attribute
      }, () => {
        $('#retail-attribute-modal').modal('show');
      });
    })
    /**Delete Retail Attribute**/
    $(document).on('click', '.btn-delete-Attribute', (e) => {
      const target = e.target,
        attributeId = $(target).closest('tr').attr('data-id'),
        attributeIndex = $(target).closest('tr').attr('data-index'),
        fnResponse = confirmAction('delete');
        let actionType = target.getAttribute('data-action');
      fnResponse.then((status) => {
        if (status === true) {
          // specify default value for actionType
          actionType = actionType || 'soft';
          // declare json object
          let postedData = {
            hotel_id: this.state.hotel_id,
            attribute_id: attributeId
          };
          // prepare ajax post URL based on actionType
          let ajaxFnName = (actionType === 'soft') ? 'delete' : 'deleteP';
          $.ajax({
            type: 'post',
            url: SITE_URL + 'request/api/' + ajaxFnName + 'RetailAttribute',
            data: {
              postedData: postedData,
              [CSRF_TOK_NAME]: getCSRFToken()
            },
            success: ({data, message, response_tag, status}, textStatus, xhr) => {
              // check for auth expiry
              expTokenRedirect({response_tag:response_tag});
              if (status) {
                notificationHandler('success', message);
                this.props.onDelete(attributeIndex);
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
    return (<div id="retail-attribute-box" style={{display:"none"}}>
      {(this.props.is_loading) ? (<div className="col-sm-12 text-center mt-20">
        <i className="icon-spinner2 spinner data_loader"></i>
      </div>) : (<AttributeList attributes={this.props.attributes}/>)}
      <AttributeForm
        hotelId={this.state.hotel_id}
        formId={this.formId}
        isEdit={this.state.is_edit}
        langCode={this.props.lang_code}
        attribute={this.state.attribute}
        attributes={this.props.attributes}
        onSave={this.handleForm.bind(this)}
        onCancel={this.resetForm}/>
    </div>);
  }
}

export default RetailAttribute;
