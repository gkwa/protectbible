import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';

export class CdkTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create new VPC with 2 Subnets
    const vpc = new ec2.Vpc(this, 'VPC', {
      natGateways: 0,
      subnetConfiguration: [{
        cidrMask: 24,
        name: "myvpc",
        subnetType: ec2.SubnetType.PUBLIC
      }]
    });

    const subnet1 = vpc.selectSubnets({subnetType: ec2.SubnetType.PUBLIC})

    const cfnNetworkInterface = new ec2.CfnNetworkInterface(this, 'MyCfnNetworkInterface', {
      subnetId: subnet1.subnetIds[0],
      interfaceType: 'efa',
    });
  }
}
