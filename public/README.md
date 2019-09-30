
网址：[https://fanyizhe.github.io/aws-troubleshooting/](https://fanyizhe.github.io/aws-troubleshooting/)

## 背景

通过 SSH 登录 AWS 上的 EC2 可能会因为各种原因而导致 SSH 连接不上，可能的原因包括 EC2 配置问题，网络问题， 操作系统层面的问题等等。其中 EC2 配置问题是比较常见的问题，比如安全组没开放 22 端口等。对于这部分的问题的排查我们可以将其自动化。

## 网站功能

- 本网站通过调用 AWS 的 API 获取用户所需要检查的 EC2 的配置信息，以此来检验是否存在导致无法进行 SSH 登录的配置信息。

- 本网站同样列举了一些其他可能的故障原因，在 “其他可能的问题原因Q&A” 栏中。

**声明：**本网站为Github Pages 托管的静态页面，不存储缓存，不保留任何Access Key ID/Access Key Secret信息。
