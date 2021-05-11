import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
// import CssBaseline from '@material-ui/core/CssBaseline';
// import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { message, Spin } from 'antd';
import ReactMarkdown from 'react-markdown';
import routes from './routes'

const styles = (theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  heroContent: {
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`,
  },
  footer: {
    marginTop: theme.spacing.unit * 8,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit * 6}px 0`,
  },
});

const FAQ = ({ classes }) => {
  const [content, setContent] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    axios
      .get(routes.api.userGuideline())
      .then((res) => {
        setContent(res.data.content);
      })
      .catch((err) => {
        setError(err);
        message.error('Errors ocurred while fetching data');
      });
  }, []);

  if (error) {
    return <p>{error.toString()}</p>;
  }

  if (!content) {
    return <Spin size='large' />;
  }

  return (
    <div>
      <main className={classes.layout}>
        <div className={classes.heroContent}>
          <ReactMarkdown children={content} />
        </div>
      </main>
      <footer className={classNames(classes.footer, classes.layout)} />
    </div>
  );
};

export default withStyles(styles)(FAQ);
