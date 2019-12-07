import React from 'react';
import ReactDOM from 'react-dom';
import TopBar from '../TopBarComponent/TopBarComponent';
import Config from '../ConfigComponent/ConfigComponent';
import ConfigForm from '../ConfigFormComponent/ConfigFormComponent';

class PopupComponent extends React.Component {
  render() {
    return (
      <div className='extension'>
        <TopBar />
        <Config />
        <ConfigForm />
      </div>
    );
  }
}

export default PopupComponent;
