/**
 * This is the React started for ipadprofiling module
 *
 * @package        DVS/MasterConfig
 * @author         Ashvin Patel
 * @date           3 July, 2018
 */


import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import Masterconfig from './Masterconfig.jsx';

render(
  <Provider store={store}>
    <Masterconfig />
  </Provider>,
  document.getElementById('app')
);
