import React, {Component,PureComponent,Fragment} from 'react';

class Switchery extends PureComponent {
  constructor(props) {
    super(props);
    this.switchery = null;
  }

  componentWillUnmount(){
    console.log("switchery unmount");
    try {
      this.switchery.destroy();
    } catch (e) {

    }
  }

  componentDidMount(){
    console.log("this.refs.switchery", this.refs.switchery);
    this.switchery = new window.Switchery(this.refs.switchery, {
      color: this.props.color,
      size: this.props.size
    });
    console.log("this.switchery", this.switchery);
    this.refs.switchery.onchange = (e) => {
      if(typeof this.props.onChange == "function")
        this.props.onChange(e);
    };
  }

  componentDidUpdate(){
    console.log("switchery updated");
  }

  render() {
    return (<input type="checkbox" id={this.props.id}
      ref="switchery"
      className={this.props.className}
      defaultChecked={this.props.checked}/>);
  }
}

export default Switchery;
