import React, { Component } from 'react';
import { connect } from "react-redux";
import { addRecord } from "./actions/mConfigActions";
import Header from './Header.jsx';
import MasterconfigList from './MasterconfigList.jsx';

class Masterconfig extends Component {

  constructor(props) {
    super(props);
  }

  addRecord = e => {
    this.props.dispatch(addRecord({
      config_key: "",
      config_val: "",
      description: "",
      mconfig_id: "",
      val_type: "text",
      id: new Date().getTime()
    }));
  }

  render() {
    return (<div className="container-fluid">
      <Header/>
      <div className="row">
        <div className="col-sm-12 pa-0">
          <div className="panel panel-default card-view">
            <div className="panel-heading">
              <div className="pull-left mt-5">
                <h6 className="panel-title txt-dark">MASTER CONFIGURATION DETAILS</h6>
              </div>
              {(false) ? (<div className="pull-right">
                <button type="button"
                  className="btn btn-primary btn-sm add-custom-btn"
                  onClick={this.addRecord}>
                  <span className="btn-text">Add</span>
                </button>
              </div>) : ""}
              <div className="clearfix"></div>
            </div>
            <MasterconfigList />
          </div>
        </div>
      </div>
    </div>)
  }
}

export default connect()(Masterconfig)
