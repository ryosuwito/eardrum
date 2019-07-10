import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
// import CssBaseline from '@material-ui/core/CssBaseline';
// import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';


const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  appBar: {
    position: 'relative',
  },
  toolbarTitle: {
    flex: 1,
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
  cardHeader: {
    backgroundColor: theme.palette.grey[200],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing.unit * 2,
  },
  cardActions: {
    [theme.breakpoints.up('sm')]: {
      paddingBottom: theme.spacing.unit * 2,
    },
  },
  footer: {
    marginTop: theme.spacing.unit * 8,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit * 6}px 0`,
  },
});


class Home extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div>
        <main className={classes.layout}>
          {/* Hero unit */}
          <div className={classes.heroContent}>
            <Typography variant="h6" align="justify" color="textPrimary" gutterBottom>
              Concepts
            </Typography>
            <Typography variant="body1" align="justify" color="textPrimary" gutterBottom>
              <ul>
                <li>
                  A <b>Request</b> will contain a reviewer, a reviewee, a specific list of question and a point of time when the request will be closed (could be empty). The reviewer will give the review to the reviewee by complete all the questions in the list. The request will be closed automatically after the defined point of time or 3 days after the request created by default.
                </li>
                <li>
                  A <b>Bucket</b> is a list of relevant questions for reviewing.
                </li>
                <li>
                  A <b>Reviewer</b> can see all the request where they are the reviewer.
                </li>
                <li>
                  An <b>Editor</b> is a user who can create and edit questions and buckets.
                </li>
                <li>
                  An <b>Administrator</b> is a user who has all the permissions.
                </li>
              </ul>
            </Typography>

            <Typography variant="h6" align="justify" color="textPrimary" gutterBottom>
              Use Cases
            </Typography>
            <Typography variant="body1" align="justify" color="textPrimary" gutterBottom>
            <ul>
              <li>
                Reviewer
                <ul>
                  <li>
                    Can review a reviewee as a request defined by giving the answer to all questions in the list
                  </li>
                  <li>
                    Can see all requests where they are the reviewer.
                  </li>
                </ul>
              </li>
              <li>
                Administrator
                <ul>
                  <li>
                    Can see all requests.
                  </li>
                  <li>
                    Can create a request.
                  </li>
                </ul>
              </li>
              <li>
                Editor
                <ul>
                  <li>
                    Can see and edit all questions and buckets.
                  </li>
                </ul>
              </li>
            </ul>
            </Typography>
            <Typography variant='h6' gutterBottom align='justify' color='textPrimary'>
              Review System
            </Typography>
            <Typography variant='body1' gutterBottom align='justify' color='textPrimary'>
              <ul>
                <li>
                  Each question in a bucket has a specified score.
                </li>
                <li>
                  Grade: A question can be graded A, B, C, D or F correspond to 1, 0.75, 0.5, 0.25 or 0. It could be with + or - to indicate that the question is graded more or less than an amount of 0.05 to the original point of grade (i.e: A+ is 1.05 while A- is 0.95). The score of a question in a request is the product by multiplying its own score by grade.
                </li>
                <li>
                  Comment: Reviewer can give a comment to a question besides the grade.
                </li>
              </ul>
            </Typography>
          </div>
          {/* End hero unit */}
        </main>
        {/* Footer */}
        <footer className={classNames(classes.footer, classes.layout)}>
        </footer>
        {/* End footer */}
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(Home);
