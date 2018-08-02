import React, {Component, Fragment} from 'react';
import { connect } from "react-redux";
import { fetchRecords } from "./actions/mConfigActions";

import Configrow from './Configrow.jsx';

class MasterconfigList extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(fetchRecords());
  }

  componentDidUpdate(){ }

  render() {
    return (<div className="panel-wrapper collapse in">
      <div className="panel-body">
        <div className="table-wrap">
          <div className="table-responsive">
            <table className="table table-bordered mb-30" id="supplier_tbl1">
              <thead>
                <tr>
                  <th className="text-center">Type</th>
                  <th className="text-center">Key</th>
                  <th className="text-center">Value</th>
                  <th className="text-center">Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.props.records.map((record, index) => {
                  return (<Configrow
                    key={record.id}
                    id={record.id}
                    index={index}
                    record={record}/>);
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>)
  }
}

const mapStateToProps = state => ({
  records: state.records,
  loading: state.loading,
  error: state.error
})

// const mapDispatchToProps = dispatch => bindActionCreators({
//   increment,
//   incrementAsync,
//   decrement,
//   decrementAsync,
//   changePage: () => push('/about-us')
// }, dispatch)

export default connect(
  mapStateToProps
)(MasterconfigList)

//export default MasterconfigList;
