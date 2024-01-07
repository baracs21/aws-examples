# Nuke AWS Account

In this section, you find a solution to nuke your aws account.

## Prerequisites

- Linux based OS
- Task installed (https://taskfile.dev/#/)
- environment variable AWS_ACCOUNT set
- environment variable AWS_PROFILE set
- environment variable AWS_ALIAS set, needed for the nuke tool

## Description

Before you start the aws nuke tool, configure the nuke-config-template file. The documentation you can find in the official github repository https://github.com/rebuy-de/aws-nuke. 

After you fulfilled all prerequisites, you can use the Taskfile to install the nuke tool and to nuke your account.

### Installation

```shell
task install-aws-nuke
```

### Nuke AWS Account

```shell
task nuke-aws-account
```

The result should be something like:

```shell
global - IAMPolicy - arn:aws:iam::501015370583:policy/daily-admin-policy - [ARN: "arn:aws:iam::501015370583:policy/daily-admin-policy", Name: "daily-admin-policy", Path: "/", PolicyID: "ANPAXJJWX3NL7IKU4IQCH"] - filtered by config
global - IAMUserAccessKey - daily-admin -> AKIAXJJWX3NL67KXYVMK - [AccessKeyID: "AKIAXJJWX3NL67KXYVMK", UserName: "daily-admin"] - filtered by config
global - IAMRole - AWSServiceRoleForSupport - [Name: "AWSServiceRoleForSupport", Path: "/aws-service-role/support.amazonaws.com/"] - cannot delete service roles
global - IAMRole - AWSServiceRoleForTrustedAdvisor - [Name: "AWSServiceRoleForTrustedAdvisor", Path: "/aws-service-role/trustedadvisor.amazonaws.com/"] - cannot delete service roles
global - IAMRole - daily-admin-role - [Name: "daily-admin-role", Path: "/"] - filtered by config
global - IAMRolePolicyAttachment - AWSServiceRoleForSupport -> AWSSupportServiceRolePolicy - [PolicyArn: "arn:aws:iam::aws:policy/aws-service-role/AWSSupportServiceRolePolicy", PolicyName: "AWSSupportServiceRolePolicy", RoleName: "AWSServiceRoleForSupport"] - cannot detach from service roles
global - IAMRolePolicyAttachment - AWSServiceRoleForTrustedAdvisor -> AWSTrustedAdvisorServiceRolePolicy - [PolicyArn: "arn:aws:iam::aws:policy/aws-service-role/AWSTrustedAdvisorServiceRolePolicy", PolicyName: "AWSTrustedAdvisorServiceRolePolicy", RoleName: "AWSServiceRoleForTrustedAdvisor"] - cannot detach from service roles
global - IAMRolePolicyAttachment - daily-admin-role -> AdministratorAccess - [PolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess", PolicyName: "AdministratorAccess", RoleName: "daily-admin-role"] - filtered by config
Scan complete: 80 total, 14 nukeable, 66 filtered.

The above resources would be deleted with the supplied configuration. Provide --no-dry-run to actually destroy resources.
Continue (y/n)? 
```

## References

- https://github.com/rebuy-de/aws-nuke
- https://taskfile.dev/#/