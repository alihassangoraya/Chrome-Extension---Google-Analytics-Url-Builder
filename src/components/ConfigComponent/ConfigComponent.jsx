import React from 'react';
import ReactDOM from 'react-dom';

class Config extends React.Component {
  render() {
    return (
      <div className='config'>
        <img
          src='images/allow.png'
          className='success-icon'
          id='url-success'
          alt='Allow'
        />
        <h2>URL added successfully:</h2>
        <div className='url'>
          <span className='input-wrap'>
            <input type='text' id='url' name='url' />
          </span>
        </div>
        <div className='dropdown'>
          <a href='#' className='btn btn__blue btn__ddown'>
            <span className='presetlist_chosen'>Choose Preset</span>
            <img src='images/arrow-down.svg' alt='ArrowDown' />
          </a>
          <div className='dropdown-list'>
            <span>Preset List</span>
            <a href='#preset-section' className='optionsLink'>
              Edit List
            </a>
            <ul id='savedCombinations'></ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Config;
