import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PopupComponent from '../PopupComponent/PopupComponent';
import OptionsComponent from '../OptionsComponent/OptionsComponent';
import React from 'react';

const AppRouter = () => {
  return (
    <div style={style}>
      <Router>
        <Switch>
          <Route path='/' exact component={PopupComponent} />
          <Route path='/options.html' exact component={OptionsComponent} />
        </Switch>
      </Router>
    </div>
  );
};

const style = {
  marginTop: '20px'
};

export default AppRouter;
