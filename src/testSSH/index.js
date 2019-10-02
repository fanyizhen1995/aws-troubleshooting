import React from 'react';
import CheckEC2Status from './CheckEC2Status';
import QandA from './QandA';
//import FindKeySecret from './FindKeySecret'
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';


const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',

  },
  container: {
    marginTop: theme.spacing(3),
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    marginTop: theme.spacing(6),
    [theme.breakpoints.up('sm')]: {
      marginLeft: drawerWidth,
    },
  },
}));

export default function TestSSH() {
  const classes = useStyles();

    return(
      <div className={classes.root}>
        <div className={classes.content}>
          <CssBaseline />
          <Container maxWidth="lg" className={classes.container}>
            <Typography component="div" >
              <h1>测试SSH连接</h1>
              <div>本网站通过调用aws的API获取您EC2的配置信息，以此来检验是否存在导致无法进行SSH登录的配置信息。</div>
              <div>本网站同样列举了其他的一些可能的故障原因，在下方“其他可能的问题原因Q&A中”。</div>
              <div>若本网站的功能无法解决您的问题，请联系我们的工程师进行排查。</div><br />
              <b>声明：</b>本网站为GitHub Pages托管的静态页面。纯开源，源代码在https://github.com/lab798/aws-troubleshooting。不存储缓存，不保留任何Access Key ID/Access Key Secret信息。
            </Typography>
          </Container>
          {/*<Container maxWidth="lg" className={classes.container}> 
            <FindKeySecret />
          </Container>
          */}
          <Container maxWidth="lg" className={classes.container}>
            <Typography component="div" style={{ backgroundColor: '#cfe8fc' }} >
              <CheckEC2Status />
            </Typography>
          </Container>
          <Container maxWidth="lg" className={classes.container}>
            <h1>其他可能的问题原因Q&A：</h1>
            <QandA />
          </Container>
        </div>
      </div>
    )
}