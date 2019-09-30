import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function QandA() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}><b>首次连接未成功</b></Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography >
            1、检查登录密钥是否正确<br /><br />
            2、登录用户名不对<br />
            &nbsp;- 若为AWS官方默认AMI，则默认用户名称为：<br />
            &nbsp;&nbsp;&nbsp;对于 Amazon Linux 2 或 Amazon Linux AMI，用户名称是 ec2-user.<br />
            &nbsp;&nbsp;&nbsp;对于 Centos AMI，用户名称是 centos。<br />
            &nbsp;&nbsp;&nbsp;对于 Debian AMI，用户名称是 admin 或 root。<br />
            &nbsp;&nbsp;&nbsp;对于 Fedora AMI，用户名为 ec2-user 或 fedora。<br />
            &nbsp;&nbsp;&nbsp;对于 RHEL AMI，用户名称是 ec2-user 或 root。<br />
            &nbsp;&nbsp;&nbsp;对于 SUSE AMI，用户名称是 ec2-user 或 root。<br />
            &nbsp;&nbsp;&nbsp;对于 Ubuntu AMI，用户名称是 ubuntu。<br />
            &nbsp;&nbsp;&nbsp;详情参见：<a target="_blank" href="https://docs.aws.amazon.com/zh_cn/AWSEC2/latest/UserGuide/connection-prereqs.html#connection-prereqs-get-info-about-instance">获取有关您的实例的信息</a><br />
            &nbsp;- 若为非官方默认AMI，请参考文档或联系负责人。<br /><br />
            3、EC2暂时处于pending状态还未启动完成。<br /><br />
            4、目前您处于酒店等公共WIFI区域，该公共网络封禁了22端口。<br /><br />
            5、您EC2的IP被国内墙了。<br /><br />
            若以上均不符合您的情况，请联系我们的工程师帮助您进行问题排查
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography className={classes.heading}><b>曾经登录成功过，现在无法连接了</b></Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography>
            以下几条可能的情况或有助于您进行问题的排查: <br /><br />
            1、报错提示：shell request failed on channel 0 <br />
            &nbsp;&nbsp;&nbsp;- 系统进程数小了，需要修改/etc/security/limits.d/20-nproc.conf文件中的值 <br /><br />
            2、内存不够，导致sshd服务无法正常工作。 <br /><br />
            3、频繁登录或者连接数过多达到上限 <br />
            &nbsp;&nbsp;&nbsp;- 查看一下/var/log/secure 文件，看是否有频繁登录的情况。 <br />
            &nbsp;&nbsp;&nbsp;- 查看一下/etc/ssh/sshd_config中的MaxStartups设置，增大最大连接数并重启sshd服务，并在每次登录之后exit登出。 <br /><br />
            4、目前您处于酒店等公共WIFI区域，该公共网络封禁了22端口。<br /><br />
            5、您EC2的IP被国内墙了。<br /><br />
            若以上均不符合您的情况，请联系我们的工程师帮助您进行问题排查
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}