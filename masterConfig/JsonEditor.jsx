import React, {Component, Fragment} from 'react';

class JsonEditor extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){
    this.editor = ace.edit(this.props.id + '-json-editor', {
        behavioursEnabled: true,
        wrapBehavioursEnabled: true,
        showLineNumbers: true,
        displayIndentGuides: true,
        fontSize: 12,
        printMargin: false,
        selectionStyle: "text"
    });
    let content = (this.props.content) ? JSON.parse(this.props.content) : '';
    if(content){
      content = JSON.stringify(content, null, 2);
    }
    this.editor.setValue(content, -1);
    this.editor.clearSelection();
    this.editor.session.setUseWrapMode(true);
    this.editor.session.setMode("ace/mode/json");
  }

  componentWillUnmount(){
    this.editor.destroy();
  }

  componentWillReceiveProps(nextProps){
    let content = (nextProps.content) ? JSON.parse(nextProps.content) : '';
    if(content){
      content = JSON.stringify(content, null, 2);
    }
    this.editor.setValue(content, -1);
    this.editor.clearSelection();
  }

  getValue = e => {
    let annotations = this.editor.getSession().getAnnotations();
    if(annotations.length <= 0){
      let content = this.editor.getValue();
      if(content){
        content = JSON.stringify(JSON.parse(content))
      }
      this.props.onSave(content);
      $('#' + this.props.id + '-json-modal').modal('hide');
    }
  }

  render() {
    return (<div id={this.props.id + '-json-modal'} className="modal fade in"
            tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal"
              aria-hidden="true" onClick={this.props.onCancel}>
              ×
            </button>
            <h5 className="modal-title">
              <i className="fa fa-edit mr-10"></i>
              Json Editor
            </h5>
          </div>
          <div className="modal-body pa-0">
            <div className="form-body">
              <pre rows="30" id={this.props.id + '-json-editor'}
                className="json-editor"
                style={{height: "440px"}}></pre>
            </div>
          </div>
          <div className="modal-footer">
            <div className="form-actions text-right">
              <button type="button"
                className="btn btn-primary btn-sm update-form-btn"
                onClick={this.getValue}>
                Update
              </button>
              <button type="button" aria-hidden="true"
                className="btn btn-sm btn-default cancel-reset-btn"
                data-dismiss="modal" onClick={this.props.onCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}

export default JsonEditor;
