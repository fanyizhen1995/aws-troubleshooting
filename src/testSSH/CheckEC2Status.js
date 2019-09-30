import React from 'react';
import CheckEC2StatusUI from './CheckEC2StatusUI';
import AWS from 'aws-sdk';
import Matcher from 'cidr-matcher';


function updateData(valueRows, name, status, reason) {
  return valueRows.map( row => {
    if (row.name === name) {
      row.status = status;
      row.reason = reason;
      return row;
    }
    return row;
  });
}

const rows = [
  {name:"该账号下是否存在该EC2",status:"",reason:""},
  {name:"本机公网IP",status:"",reason:""},
  {name:"默认登录用户名( 适用部分官方AMI )",status:"",reason:""},
  {name:"ACL检查",status:"",reason:""},
  {name:"路由表配置检查",status:"",reason:""},
  {name:"EC2安全组检查",status:"",reason:""},
  {name:"EC2运行状态检查",status:"",reason:""},
  
]

export default function CheckEC2Status() {
  const [values, setValues] = React.useState({
    ip: '',
    accessKeyId: '',
    accessSecret: '',
    region: '',
    loading: 0,
    spin: "none",
    rows: JSON.parse(JSON.stringify(rows))
  });
  

  var ec2 = new AWS.EC2({
    apiVersion: '2016-11-15',
    accessKeyId: values.accessKeyId,
    secretAccessKey:values.accessSecret,
    region: values.region
  });

  const checkEC2UsernameAndSystem = (ec2InstanceId) => {
    let params = {
      InstanceId: ec2InstanceId
     };
    ec2.getConsoleOutput(params, function(err, data) {
      if (err){
        updateData(values.rows, "默认登录用户名( 适用部分官方AMI )", "FAILED", "无法调用API( 网络或权限问题 )");
      }
      else {
        if (data.Output !== undefined) {
          let commonContent = data.Output.replace(/\s/g, '+');
          commonContent = Buffer.from(commonContent, 'base64').toString();
          const username = commonContent.match(/for user ([a-zA-Z0-9-]*)/)
          if (username !== null) {
            updateData(values.rows, "默认登录用户名( 适用部分官方AMI )", username[1], "");
          } else {
            updateData(values.rows, "默认登录用户名( 适用部分官方AMI )", "", "无法通过EC2日志找到系统默认用户名，请参阅下方文档“首次登录未成功”");
          }
        } else {
          updateData(values.rows, "默认登录用户名( 适用部分官方AMI )", "", "无法读取系统日志,系统日志还未准备好");
        }
        
      }
      values.loading -= 1;
      setValues({ ...values, 'loading': values.loading, 'rows': values.rows,'spin': "" }); 
      if (values.loading === 0) {
        setValues({ ...values,'spin': "none"});
      }    
    });
  }

  //Check EC2's running status and 2 health status 
  const checkEC2Status = (ec2InstanceId) => {

    let params = {
      InstanceIds: [
        ec2InstanceId
      ]
     };
    ec2.describeInstanceStatus(params, function(err, data) {
      if (err) {
        updateData(values.rows, "EC2运行状态检查", "FAILED", "无法调用API( 网络或权限问题 )");

      }
      else {
        const instanceState = data.InstanceStatuses[0].InstanceState.Name;
        const instanceStatus = data.InstanceStatuses[0].InstanceStatus.Status;
        const systemStatus = data.InstanceStatuses[0].SystemStatus.Status;
        if (instanceState !== 'running') {
          updateData(values.rows, "EC2运行状态检查", "FAILED", "该EC2不在running状态中");
        } else if (instanceStatus !== 'ok') {
          updateData(values.rows, "EC2运行状态检查", "FAILED", "Instance Status检查失败");
        } else if (systemStatus !== 'ok') {
          updateData(values.rows, "EC2运行状态检查", "FAILED", "System Status检查失败");
        } else {
          updateData(values.rows, "EC2运行状态检查", "SUCCESS", "EC2状态正常");
        }
      };  
      values.loading -= 1;
      setValues({ ...values, 'loading': values.loading, 'rows': values.rows,'spin': "" });
      if (values.loading === 0) {
        setValues({ ...values,'spin': "none"});
      }
    });
  }

  //Check the security groups 
  const checkEC2SecurityGroups = (securityGroups, currentIp) => {

    var flag = "FAILED";
    var countTotal = securityGroups.length;
    for (let securityGroup of securityGroups) {
      
      let paramsSG = {
        GroupIds:[
          securityGroup.GroupId
        ],
      }
      ec2.describeSecurityGroups(paramsSG, function(err, data) {
        if (err) {  
          updateData(values.rows, "EC2安全组检查", "FAILED", "无法调用API( 网络或权限问题 )");

        } else {
          let inbound_rules = data.SecurityGroups[0].IpPermissions;
          for (let inbound_rule of inbound_rules) {
            if (inbound_rule.IpProtocol === '-1') {
              for (let ipRange of inbound_rule.IpRanges) {
                let matcher = new Matcher([ipRange.CidrIp]);
                if(matcher.contains(currentIp)) {
                  flag = "SUCCESS";
                  break;
                }
              }
            }
            else if (
              inbound_rule.IpProtocol === 'tcp' & 
              inbound_rule.FromPort <= 22 & 
              inbound_rule.ToPort >= 22
            ){
              for (let ipRange of inbound_rule.IpRanges) {
                let matcher = new Matcher([ipRange.CidrIp]);
                if(matcher.contains(currentIp)) {
                  flag = "SUCCESS";
                  break;
                }
              }
              
            }
          }
          countTotal--;
          if (countTotal === 0){
            if( flag === "FAILED") {
              updateData(values.rows, "EC2安全组检查", "FAILED", "检查安全组规则中是否包含22端口，或CIDR范围不包含当前IP");
            } else{
              updateData(values.rows, "EC2安全组检查", "SUCCESS", "安全组中22端口已打开");
            }
          }
        }
        values.loading -= 1;
        setValues({ ...values, 'loading': values.loading, 'rows': values.rows,'spin': "" });
        if (values.loading === 0) {
          setValues({ ...values,'spin': "none"});
        }
      });
    }
  };

  //Check the network ACL
  const checkVPCACL = (subnetId, currentIp) => {
    let paramsACL = {
      Filters: [
        {
            'Name': 'association.subnet-id',
            'Values': [subnetId]
        },
      ],
    }
    ec2.describeNetworkAcls(paramsACL, function(err, data) {
      if (err) {
        updateData(values.rows, "ACL检查", "FAILED", "无法调用API( 网络或权限问题 )");

      } else {
        let aclRules = data.NetworkAcls[0].Entries;
        let ingressACLs = [], engressACLs = [];
        for (let aclRule of aclRules) {
          aclRule.Egress ? engressACLs.push(aclRule) : ingressACLs.push(aclRule);
        }
        let isAllow = "init";
        for (let ingressACL of ingressACLs) {

          if (isAllow === "init") {
            if (ingressACL.Protocol === '-1') {
              let matcher = new Matcher([ingressACL.CidrBlock]);
              if(!matcher.contains(currentIp)) {
                break;
              }
              isAllow = ingressACL.RuleAction;
            } 
            else if (
              ingressACL.Protocol === '6' & 
              ingressACL.PortRange.From <= 22 & 
              ingressACL.PortRange.To >= 22)
            {
              let matcher = new Matcher([ingressACL.CidrBlock]);
              if(!matcher.contains(currentIp)) {
                break;
              }
              isAllow = ingressACL.RuleAction;
            }
          } else {
            break;
          }
        } //for
        if (isAllow === 'allow') {
          updateData(values.rows, "ACL检查", "SUCCESS", "NETWORK ACL未禁止22端口");
        } else {
          updateData(values.rows, "ACL检查", "FAILED", "该EC2所处VPCSubnet的NETWORK ACL禁止22端口, 或CIDR范围不包含当前IP");
        }
      }
      values.loading -= 1;
      setValues({ ...values, 'loading': values.loading, 'rows': values.rows,'spin': "" });
      if (values.loading === 0) {
        setValues({ ...values,'spin': "none"});
      }
    })
  };

  //Check whether the route table contains Internet Gateway or not.
  const checkIGW = (ec2VpcId,ec2SubnetId, currentIp) => {

    let paramsVPCMainRtb = {
      Filters:[
        {
            'Name': 'vpc-id',
            'Values': [ec2VpcId]
        },
        {
            'Name': 'association.main',
            'Values': ['true']
        }
      ],
    }
    let paramsSubnetRtb = {
      Filters:[
        {
            'Name': 'association.subnet-id',
            'Values': [ec2SubnetId]
        },
      ],
    }
    ec2.describeRouteTables(paramsSubnetRtb, function(err, data) {
      if (err) {
        updateData(values.rows, "路由表配置检查", "FAILED", "无法调用API( 网络或权限问题 )");
      } else {
        if (data.RouteTables.length === 0) {
          //如果没找到该子网关联的路由表，则去寻找该VPC的主路由表
          ec2.describeRouteTables(paramsVPCMainRtb, function(err, data) {
            values.loading += 1;
            setValues({ ...values, 'loading': values.loading});
            let routeTable = data.RouteTables;
            let routes = routeTable[0].Routes;
            let flag = "FAILED";
            for (let route of routes) {
              if (route.GatewayId.match("igw")) {
                let matcher = new Matcher([route.DestinationCidrBlock]);
                if(!matcher.contains(currentIp)) break;
                flag = "SUCCESS";
                break;
              }
            }
            if (flag === "FAILED") {
              updateData(values.rows, "路由表配置检查", "FAILED", "该EC2所使用的路由表不存在Internet Gateway, 或CIDR范围不包含当前IP");
            } else {
              updateData(values.rows, "路由表配置检查", "SUCCESS", "该EC2所使用的路由表存在Internet Gateway");
            }
            values.loading -= 1;
            setValues({ ...values, 'loading': values.loading, 'rows': values.rows,'spin': "" });
            if (values.loading === 0) {
              setValues({ ...values,'spin': "none"});
            }
          })
        }
        else {
          let routeTable = data.RouteTables;
          let routes = routeTable[0].Routes;
          let flag = "FAILED";
          for (let route of routes) {
            if (route.GatewayId.match("igw")) {
              let matcher = new Matcher([route.DestinationCidrBlock]);
              if(!matcher.contains(currentIp)) break;
              flag = "SUCCESS";
              break;
            }
          }
          if (flag === "FAILED") {
            updateData(values.rows, "路由表配置检查", "FAILED", "该EC2所使用的路由表不存在Internet Gateway, 或CIDR范围不包含当前IP");
          } else {
            updateData(values.rows, "路由表配置检查", "SUCCESS", "该EC2所使用的路由表存在Internet Gateway");
          }
          //setValues({ ...values, 'rows': values.rows });
        }
      } 
      values.loading -= 1;
      setValues({ ...values, 'loading': values.loading, 'rows': values.rows,'spin': "" });
      if (values.loading === 0) {
        setValues({ ...values,'spin': "none"});
      }
    })
  };

  const handleChange = (value) => event => {
    setValues({ ...values, [value]: event.target.value });
  };
  
  //Main function of ec2 check
  const handleClick = () => {
    values.loading =2 ;
    values.rows = JSON.parse(JSON.stringify(rows));
    setValues({ ...values,'rows': values.rows, 'spin': "", 'loading': values.loading });
    let params = {
      Filters: [
        {
          'Name': 'ip-address',
          'Values': [values.ip]
        }
      ]
    }


    ec2.describeInstances(params, function(err, data) {
      if (err) {
        updateData(values.rows, "该账号下是否存在该EC2", "FAILED", "输入的Region或者Access Key相关信息有误，或者是无法调用API( 网络或权限问题 )");
        //setValues({ ...values, 'rows': values.rows });
      } else {

        if (data.Reservations.length !== 0) {          
          const ec2InstanceId = data.Reservations[0].Instances[0].InstanceId;
          const ec2SubnetId = data.Reservations[0].Instances[0].SubnetId;
          const ec2SecurityGroups = data.Reservations[0].Instances[0].SecurityGroups;
          const ec2VpcId = data.Reservations[0].Instances[0].VpcId;
          updateData(values.rows, "该账号下是否存在该EC2", "SUCCESS", "");
          values.loading += (ec2SecurityGroups.length + 4);
          setValues({ ...values, 'loading': values.loading});
          window.fetch("https://api.ipify.org?format=json").then(res => res.json()).then((result) => {
            const currentIp = result.ip;
            updateData(values.rows, "本机公网IP", currentIp, "");
            checkEC2SecurityGroups(ec2SecurityGroups, currentIp);
            checkVPCACL(ec2SubnetId, currentIp);
            checkIGW(ec2VpcId,ec2SubnetId, currentIp);
          })
          checkEC2Status(ec2InstanceId);
          checkEC2UsernameAndSystem(ec2InstanceId);
        }
        else {
          let params2 = {}
          ec2.describeInstances(params2, function(err, data){
            if (err) {
              updateData(values.rows, "该账号下是否存在该EC2", "FAILED", "输入的Region或者Access Key相关信息有误，或者是无法调用API( 网络或权限问题 )");
            } else {
              let EC2Exist = false
              for (let instance of data.Reservations) {
                if (instance.Instances[0].PublicIpAddress === values.ip) {
                  updateData(values.rows, "该账号下是否存在该EC2", "FAILED", "该区域内存在该EC2，但该EC2无法被外网访问到。");
                  EC2Exist = true
                  break;
                }
              }
              if (!EC2Exist){ updateData(values.rows, "该账号下是否存在该EC2", "FAILED", "输入的IP地址有误，该区域不存在该EC2")};
            }
            setValues({ ...values, 'loading': values.loading, 'rows': values.rows });
          })     
        }
      }
      values.loading -= 2;
      setValues({ ...values, 'loading': values.loading, 'rows': values.rows });
      

    });

  };

  return (
      <CheckEC2StatusUI 
        values = {values}
        handleChange = {handleChange}
        handleClick = {handleClick}
      />
    
  );
}