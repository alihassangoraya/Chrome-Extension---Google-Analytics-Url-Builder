import React from 'react';
import ReactDOM from 'react-dom';

class ConfigForm extends React.Component {
  render() {
    return (
      <div className='form'>
        <div className='form-header'>
          <span>Fill Form:</span>
        </div>
        <div className='form-body'>
          <div className='field'>
            <img
              src='images/allow.png'
              className='success-icon'
              id='source-success'
              alt='Allow'
            />
            <label>
              <span className='label'>Source</span>
              <span className='input-wrap'>
                <input type='text' id='utm_source' name='utm_source' />
              </span>
            </label>
            <span className='description'>
              Referrer: i.e. Google, Newsletter, Facebook, Twitter
            </span>
          </div>
          <div className='field'>
            <img
              src='images/allow.png'
              className='success-icon'
              id='medium-success'
              alt='Allow'
            />
            <label>
              <span className='label'>Medium</span>
              <span className='input-wrap'>
                <input type='text' id='utm_medium' name='utm_medium' />
              </span>
            </label>
            <span className='description'>
              Marketing Medium: cpc, banner, email, QR
            </span>
          </div>
          <div className='field'>
            <img
              src='images/allow.png'
              className='success-icon'
              id='term-success'
              alt='Allow'
            />
            <label>
              <span className='label'>Keyword</span>
              <span className='input-wrap'>
                <input type='text' id='utm_term' name='utm_term' />
              </span>
            </label>
            <span className='description'>
              Identify the paid keywords or other value
            </span>
          </div>
          <div className='field'>
            <img
              src='images/allow.png'
              className='success-icon'
              id='content-success'
              alt='Allow'
            />
            <label>
              <span className='label'>Content</span>
              <span className='input-wrap'>
                <input type='text' id='utm_content' name='utm_content' />
              </span>
            </label>
            <span className='description'>Use to differentiate ads</span>
          </div>
          <div className='field'>
            <img
              src='images/allow.png'
              className='success-icon'
              id='campaign-success'
              alt='Allow'
            />
            <label>
              <span className='label'>Campaign</span>
              <span className='input-wrap'>
                <input type='text' id='utm_campaign' name='utm_campaign' />
              </span>
            </label>
            <span className='description'>Product, Promo code or slogan</span>
          </div>
        </div>
        <div className='final'>
          <h4 style={{ marginBottom: 5 }}>Final url</h4>
          <span className='input-wrap'>
            <input type='text' name='result' id='result' />
          </span>
          <input
            type='text'
            style={{ position: 'absolute', left: '-1000px', bottom: '-1000px' }}
            name='bitResult'
            id='bitResult'
          />
          <div className='button-group'>
            <div className='img-btn'>
              <a href='#' className='btn btn__green btn__small copyClipboard'>
                Copy URL
              </a>
            </div>
            <div className='img-btn'>
              <a
                href='#'
                className='btn btn__dark btn__small copyClipboard copyParameters'
              >
                Copy Parameters
              </a>
            </div>
            <div className='img-btn'>
              <a
                href='#'
                className='btn btn__light btn__small copyClipboard bitlyGenerate'
              >
                Shorten & Copy
              </a>
              <a
                href='#shortening-section'
                className='extra-url optionsLink'
                style={{ color: 'red' }}
              >
                Click here to Activate Shortening
              </a>
            </div>
            <div id='shortening-result' style={{ display: 'none' }}>
              <img
                src='images/allow.png'
                className='success-icon'
                id='shortening-success'
                alt='Allow'
              />
              <span id='short-result-paragraph'></span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ConfigForm;
