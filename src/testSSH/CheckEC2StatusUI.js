import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import ReactLoading from 'react-loading';


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  button: {
    margin: theme.spacing(1),
  },
  div: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
}));

const regions = [
  {
    value: 'cn-north-1',
    label: 'China (Beijing)',
  },
  {
    value: 'cn-northwest-1',
    label: 'China (Ningxia)',
  },
  {
    value: 'us-east-1',
    label: 'US East (N. Virginia)',
  },
  {
    value: 'us-east-2',
    label: 'US East (Ohio)',
  },
  {
    value: 'us-west-1',
    label: 'US West (N. California)',
  },
  {
    value: 'us-west-2',
    label: 'US West (Oregon)',
  },
  {
    value: 'ap-east-1',
    label: 'Asia Pacific (Hong Kong)',
  },
  {
    value: 'ap-south-1',
    label: 'Asia Pacific (Mumbai)',
  },
  {
    value: 'ap-northeast-2',
    label: 'Asia Pacific (Seoul)',
  },
  {
    value: 'ap-southeast-1',
    label: 'Asia Pacific (Singapore)',
  },
  {
    value: 'ap-southeast-2',
    label: 'Asia Pacific (Sydney)',
  },
  {
    value: 'ap-northeast-1',
    label: 'Asia Pacific (Tokyo)',
  },
  {
    value: 'ca-central-1',
    label: 'Canada (Central)',
  },
  {
    value: 'eu-central-1',
    label: 'EU (Frankfurt)',
  },
  {
    value: 'eu-west-1',
    label: 'EU (Ireland)',
  },
  {
    value: 'eu-west-2',
    label: 'EU (London)',
  },
  {
    value: 'eu-west-3',
    label: 'EU (Paris)',
  },
  {
    value: 'eu-north-1',
    label: 'EU (Stockholm)',
  },
  {
    value: 'me-south-1',
    label: 'Middle East (Bahrain)',
  },
  {
    value: 'sa-east-1',
    label: 'South America (Sao Paulo)',
  },
];

export default function CheckEC2StatusUI(props) {
  const classes = useStyles();

  return (
    <Fragment>
      <form className={classes.container} noValidate autoComplete="off">
        <TextField
          id="standard-ipaddress"
          label="Public IP Address"
          placeholder="192.168.1.1"
          className={classes.textField}
          value={props.values.ip}
          onChange={props.handleChange('ip')}
          margin="normal"
        />
        <TextField
          id="standard-select-region"
          select
          label="Region"
          className={classes.textField}
          value={props.values.region}
          onChange={props.handleChange('region')}
          SelectProps={{
            MenuProps: {
              className: classes.menu,
            },
          }}
          margin="normal"
        >
          {regions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          value={props.values.accessKeyId}
          id="standard-access-key-id"
          label="Access Key Id"
          style={{ margin: 8 }}
          //helperText=""
          fullWidth
          margin="normal"
          onChange={props.handleChange('accessKeyId')}
        />
        <TextField
          value={props.values.accessSecret}
          id="standard-access-key-secret"
          label="Access Key Secret"
          style={{ margin: 8 }}
          type="password"
          fullWidth
          margin="normal"
          onChange={props.handleChange('accessSecret')}
        />
        <Button variant="contained" color="primary" className={classes.button} onClick={props.handleClick}>
          Start
        </Button>
        <div 
          className={classes.div} 
          style={{
            display: props.values.spin,
          }}>
            <ReactLoading 
              type="spin"
              height={'36.5px'}
              width={'36.5px'}
            />
        </div>
        <div className={classes.div}>
          <a target="_blank" 
              href="https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey"
          >找不到您的Access Key ID/Access Key Secret？
          </a>
        </div>
      </form>
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>检查项</TableCell>
              <TableCell >检查结果</TableCell>
              <TableCell>原因</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.values.rows.map(row => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Fragment>
  );
}