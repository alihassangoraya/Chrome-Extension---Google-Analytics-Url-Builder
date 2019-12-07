import React from 'react';
import ReactDOM from 'react-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SettingsIcon from '@material-ui/icons/Settings';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';

import './TopBarComponent.css';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

function TopBar() {
  const classes = useStyles();
  return (
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' className={classes.title}>
            Google Analytics URL Builder
          </Typography>
          <Button color='inherit'>Support</Button>
          <Button color='inherit'>
            <ZoomOutMapIcon />
          </Button>
          <Button color='inherit'>
            <SettingsIcon />
          </Button>
        </Toolbar>
      </AppBar>
  );
}

export default TopBar;
