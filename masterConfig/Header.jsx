import React, { Component } from 'react';

class Header extends Component{
  render(){
    return (<div className="row">
      <div className="dv-custom-breadcum clearfix">
        <div className="col-lg-12 col-sm-12 col-xs-12">
          <div className="pull-left">
            <ol className="breadcrumb">
              <li>
                <a href={SITE_URL + "dashboard"}>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <span>Administrator Setting</span>
              </li>
              <li className="active">
                <span>Master Configuration</span>
              </li>
            </ol>
          </div>
          <div className="pull-right">
            <button className="btn btn-warning btn-xs" data-toggle="modal"
              data-target="#helpme-modal"
              style={{"border":"none"}}>help</button>
          </div>
        </div>
      </div>
    </div>)
  }
}

export default Header;
