import React, {Component, Fragment} from 'react';
import { connect } from "react-redux";
import {
  addRecord,
  updateRecord,
  deleteRecord
} from "./actions/mConfigActions";

import JsonEditor from './JsonEditor.jsx';

class Configrow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config_key: props.record.config_key,
      config_val: props.record.config_val,
      created_by: props.record.created_by,
      created_on: props.record.created_on,
      description: props.record.description,
      is_active: props.record.is_active,
      is_deleted: props.record.is_deleted,
      mconfig_id: props.record.mconfig_id,
      modified_by: props.record.modified_by,
      modified_on: props.record.modified_on,
      val_type: props.record.val_type,
      is_deletable: props.record.is_deletable,
      status_change_support: props.record.status_change_support,
      edit_json: false
    }
    this.formId = "mconfig-" + props.id;
  }

  componentDidMount() {
    //this.formObj = formValidation('#' + this.formId);
    let jSwitch = document.getElementById("jswitch-" + this.props.id);
    if(jSwitch){
      this.switchery(jSwitch);
    }
  }

  componentDidUpdate(){
    if(!this.switchery){
      let jSwitch = document.getElementById("jswitch-" + this.props.id);
      this.switchery(jSwitch);
    }
  }

  switchery = jSwitch => {
    this.switchery = new Switchery(jSwitch, {color: '#FAAB15', size: 'small'});
    let callFromUI = true,
        eleID = "jswitch-" + this.props.id;
    $(document).off('change', "#" + eleID);
    $(document).on('change', "#" + eleID, (e) => {
      if (callFromUI) {
        var fnResponse = confirmAction('confirm', eleID);
        fnResponse.then((status) => {
          if (status === true) {
            $.ajax({
              type: 'post',
              url: SITE_URL + 'admin/masterConfig/changeStatus',
              data: {
                mconfig_id: this.state.mconfig_id,
                is_active: ($('#' + eleID).prop("checked")) ? 1 : 0,
                [CSRF_TOK_NAME]: getCSRFToken()
              },
              success: ({data, message, response_tag, status}) => {
                expTokenRedirect({response_tag:response_tag});
                if (status) {
                  toasterNotification('success', message);
                  this.props.dispatch(updateRecord({record: data, index: this.props.index}));
                } else {
                  callFromUI = false;
                  $('#' + eleID).click();
                  toasterNotification('error', message);
                }
              },
              error: (jqXHR) => {
                ajaxErrorHandling(jqXHR);
              }
            });
          }
        });
      } else
        callFromUI = true;
    });
  }

  componentWillUnmount(){
    console.log("component unmount", this.props.id);
  }

  handleSubmit = e => {
    e.preventDefault();
    let postedData = new FormData();
    postedData.append(CSRF_TOK_NAME, getCSRFToken());
    postedData.append('mconfig_id', this.state.mconfig_id);
    postedData.append('val_type', this.state.val_type);
    postedData.append('config_key', this.state.config_key);
    postedData.append('config_val', this.state.config_val);
    postedData.append('description', this.state.description);
    $.ajax({
      url: SITE_URL + "admin/masterConfig/save",
      type: 'POST',
      data: postedData,
      processData: false,
      contentType: false,
      dataType: 'json',
      beforeSend: () => {
        $('#' + this.formId + ' .save-mconfig').button('loading');
      },
      complete: () => {
        $('#' + this.formId + ' .save-mconfig').button('reset');
      },
      success: ({data, message, response_tag, status}, textStatus, xhr) => {
        expTokenRedirect({response_tag:response_tag});
        if (status) {
          toasterNotification('success', message);
          this.props.dispatch(updateRecord({record: data, index: this.props.index}));
        }else{
          toasterNotification('error', message);
        }
      },
      error: (jqXHR) => {
        $('#' + this.formId + ' .save-mconfig').button('reset');
        ajaxErrorHandling(jqXHR);
      }
    });
  }

  deleteRecord = e => {
    let fnResponse = confirmAction('delete'),
    actionType = 'soft',
    ajaxFnName = (actionType === 'soft') ? 'delete' : 'deleteP';
    fnResponse.then((status) => {
      if (status === true) {
        if(!this.state.mconfig_id){
          this.props.dispatch(deleteRecord(this.props.index));
        }else{
          $.ajax({
            type: 'post',
            url: SITE_URL + 'admin/masterConfig/' + ajaxFnName,
            data: {
              mconfig_id: this.state.mconfig_id,
              [CSRF_TOK_NAME]: getCSRFToken()
            },
            success: (responseData) => {
              expTokenRedirect(responseData);
              if (responseData.status) {
                toasterNotification('success', responseData.message);
                this.props.dispatch(deleteRecord(this.props.index));
              } else {
                if (typeof(responseData.data['dependency-count']) != "undefined") {
                  dependencyCheckHandler(responseData);
                  toasterNotification('warning', responseData.message);
                } else
                  toasterNotification('error', responseData.message);
                }
              },
            error: (jqXHR) => {
              ajaxErrorHandling(jqXHR);
            }
          });
        }
      }
    });
  }

  handleInputChange = e => {
    const target = e.target,
    name = target.name,
    type  = target.type;
    let value = target.value;
    if(type == "select-multiple"){
      $(target).valid();
      let options = target.options;
      let selectValue = [];
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          selectValue.push(options[i].value);
        }
      }
      value = selectValue;
    }else if(type == "checkbox"){
      value = (target.checked) ? true : false;
    }
    this.setState({
      [name]: value
    });
  }

  changeJson = json => {
    this.setState({
      config_val: json,
      edit_json: false
    });
  }

  editJson = e => {
    this.setState({
      edit_json: true
    }, () => {
      $("#" + this.props.id + "-json-modal").modal('show');
    });
  }

  closeEditor = e => {
    this.setState({
      edit_json: false
    });
  }

  render() {
    return (<tr id={"mconfig-" + this.props.id}>
      <td className="text-center">
        <select className="form-control select2" name="val_type"
          value={this.state.val_type} onChange={this.handleInputChange}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="json">JSON</option>
        </select>
      </td>
      <td className="text-center">
        <input type="text" className="form-control"
          value={this.state.config_key} readOnly={(this.state.mconfig_id) ? true : false}
          onChange={this.handleInputChange} name="config_key"/>
      </td>
      <td className="text-center">
        {(this.state.val_type == 'json') ? (
          <Fragment>
            <span className="edit-json-icon">
              <a href="javascript:void(0);" onClick={this.editJson}>
                <i className="fa fa-edit" data-toggle="tooltip"
                title="Click to edit Json"></i>
              </a>
            </span>
            <pre className="text-left json-box">
              {(this.state.config_val)
                ? JSON.stringify(JSON.parse(this.state.config_val), null, 2) : ''}
            </pre>
            <input type="hidden" value={this.state.config_val}
            name="config_val"/>
            {(this.state.edit_json) ? (
              <JsonEditor
                id={this.props.id}
                content={this.state.config_val}
                onSave={this.changeJson}
                onCancel={this.closeEditor}
              />) : ''}
          </Fragment>) : (
            <input type={this.state.val_type} className="form-control"
              value={this.state.config_val} name="config_val"
              onChange={this.handleInputChange}/>
          )}
      </td>
      <td className="text-center">
        <textarea className="form-control" value={this.state.description}
          onChange={this.handleInputChange} name="description"/>
      </td>
      <td className="text-center actions-td">
        <span>
          {(this.state.mconfig_id && this.state.status_change_support == 1) ? (
            <a className="custom-switch" data-toggle="tooltip"
            title="Inactive/Active">
              <input type="checkbox" className="js-switch" data-confirm=""
                data-color="#FAAB15" data-size="small"
                id={"jswitch-" + this.props.id}
                defaultChecked={(this.state.is_active == 1) ? true : false}/>
            </a>) : ""}
          {(this.state.is_deletable == 1) ? (<button
            className="btn btn-primary btn-sm ml-5"
              data-toggle="tooltip" title="Delete" type="button"
              onClick={this.deleteRecord}>
              <i className="fa fa-trash"></i>
            </button>) : ""}
          <button className="btn btn-primary btn-sm ml-5 save-mconfig"
            type="button" data-toggle="tooltip" title="Save/Update"
            onClick={this.handleSubmit}>
            <i className="fa fa-save"></i>
          </button>
        </span>
      </td>
    </tr>);
  }
}

export default connect()(Configrow)
