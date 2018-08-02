import React, {Component,PureComponent} from 'react';
import update from 'immutability-helper';
import FeatureList from './FeatureList.jsx';
import FeatureForm from './FeatureForm.jsx';

class RetailFeature extends PureComponent {

  constructor(props) {
    super(props);
    this.resetForm = this.resetForm.bind(this);
    this.formId = "retail-feature-form";
    this.featureIndex = null;
    this.featureId = null;
    this.state = {
      hotel_id: $('#global-hotel-ddl').val(),
      feature: {},
      features: [],
      is_loading: true,
      is_edit: false
    }
  }

  componentDidMount() {
    this.initialJS(this);
  }

  handleForm(e){
    e.preventDefault();
    let _this = this, url, hotel_id;
    if($('#' + this.formId).valid()){
      let postedData = $('#' + this.formId).serializeArray();
      postedData = serializeToJson(postedData);
      hotel_id = postedData['hotel_id'];

      if(this.state.is_edit){
        postedData['feature_id'] = this.state.feature.feature_id;
        url = SITE_URL + "request/api/updateRetailFeature";
      }else{
        url = SITE_URL + "request/api/addRetailFeature";
      }
      postedData[CSRF_TOK_NAME] = getCSRFToken();
      postedData['postedData'] = true;
      $.ajax({
        url: url,
        type: 'POST',
        data: postedData,
        dataType: 'json',
        beforeSend: () => {
          $('#save-feature').button('loading');
        },
        complete: () => {
          $('#save-feature').button('reset');
        },
        success: ({data, message, response_tag, status}, textStatus, xhr) => {
          // check for auth expiry
          expTokenRedirect({response_tag:response_tag});
          if (status) {
            formReset(this.formId);
            $('#retail-feature-modal').modal('hide');
            notificationHandler('success', message);
            if(_this.state.is_edit)
              _this.props.onUpdate(data[hotel_id][this.props.lang_code], _this.featureIndex);
            else
              _this.props.onAdd(data[hotel_id][this.props.lang_code]);
            _this.resetForm();
          }else{
            notificationHandler('error', message);
          }
        },
        error: (jqXHR) => {
          $('#save-feature').button('reset');
          ajaxErrorHandling(jqXHR);
        }
      });
    }
  }

  resetForm(){
    this.featureId = null;
    this.featureIndex = null;
    this.setState({
      is_edit: false,
      feature: {}
    }, () => {
      $('#' + this.formId + ' .modal-body').scrollTop(0);
    });
  }

  initialJS(_this) {
    $('#global-hotel-ddl').change((e)=>{
      hotelId = $(e.target).val();
      _this.setState({
        hotel_id: hotelId
      });
    });
    /**Change Status of Feature**/
    let callFromUI = true;
    $(document).on('change', '.btn-status-change-Feature', (e) => {
      const target = e.target,
        eleID = target.id,
        featureId = $(target).closest('tr').attr('data-id'),
        featureIndex = $(target).closest('tr').attr('data-index');
      if (callFromUI) {
        let fnResponse = confirmAction('confirm', eleID);
        fnResponse.then((status) => {
          if (status === true) {
            let isActive = ($('#' + eleID).prop("checked")) ? 1 : 0;
            let postedData = {
              hotel_id: _this.state.hotel_id,
              feature_id: featureId,
              is_active: isActive
            };
            $.ajax({
              type: 'post',
              url: SITE_URL + 'request/api/changeStatusRetailFeature',
              data: {
                postedData: postedData,
                [CSRF_TOK_NAME]: getCSRFToken()
              },
              success: ({data, message, response_tag, status}, textStatus, xhr) => {
                // check for auth expiry
                expTokenRedirect({response_tag:response_tag});
                if (status) {
                  let msg = (isActive == 1)
                    ? 'Retail feature activated successfully.'
                      : 'Retail feature deactivated successfully.';
                  notificationHandler('success', msg);
                  _this.props.onUpdate(data[_this.state.hotel_id][this.props.lang_code], featureIndex);
                } else {
                  // there is some problem while updating record into database
                  callFromUI = false;
                  $('#rs-' + featureId).click();
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
    /**Edit Retail Feature**/
    $(document).on('click', '.btn-edit-Feature', (e) => {
      const target = e.target,
        featureId = $(target).closest('tr').attr('data-id'),
        featureIndex = $(target).closest('tr').attr('data-index'),
        feature = _this.props.features[featureIndex];
      _this.featureId = featureId;
      _this.featureIndex = featureIndex;
      _this.setState({
        is_edit: true,
        feature: feature
      }, () => {
        $('#retail-feature-modal').modal('show');
      });
    })
    /**Delete Retail Feature**/
    $(document).on('click', '.btn-delete-Feature', (e) => {
      const target = e.target,
        featureId = $(target).closest('tr').attr('data-id'),
        featureIndex = $(target).closest('tr').attr('data-index'),
        fnResponse = confirmAction('delete');
        let actionType = target.getAttribute('data-action');
      fnResponse.then((status) => {
        if (status === true) {
          // specify default value for actionType
          actionType = actionType || 'soft';
          // declare json object
          let postedData = {
            hotel_id: _this.state.hotel_id,
            feature_id: featureId
          };
          // prepare ajax post URL based on actionType
          let ajaxFnName = (actionType === 'soft') ? 'delete' : 'deleteP';
          $.ajax({
            type: 'post',
            url: SITE_URL + 'request/api/' + ajaxFnName + 'RetailFeature',
            data: {
              postedData: postedData,
              [CSRF_TOK_NAME]: getCSRFToken()
            },
            success: ({data, message, response_tag, status}, textStatus, xhr) => {
              // check for auth expiry
              expTokenRedirect({response_tag:response_tag});
              if (status) {
                notificationHandler('success', message);
                _this.props.onDelete(featureIndex);
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
    return (<div id="retail-feature-box" style={{display:"none"}}>
      {(this.props.is_loading) ? (<div className="col-sm-12 text-center mt-20">
        <i className="icon-spinner2 spinner data_loader"></i>
      </div>) : (<FeatureList features={this.props.features}/>)}
      <FeatureForm
        hotelId={this.state.hotel_id}
        formId={this.formId}
        isEdit={this.state.is_edit}
        feature={this.state.feature}
        attributes={this.props.attributes}
        onSave={this.handleForm.bind(this)}
        onCancel={this.resetForm}/>
    </div>);
  }
}

export default RetailFeature;
