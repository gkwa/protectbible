import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export class CdkTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // // Create new VPC with 2 Subnets
    // const vpc = new ec2.Vpc(this, 'VPC', {
    //   natGateways: 0,
    //   subnetConfiguration: [{
    //     cidrMask: 24,
    //     name: "myvpc",
    //     subnetType: ec2.SubnetType.PUBLIC
    //   }]
    // });

    const vpc = new ec2.Vpc(this, 'my-cdk-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
        {
          name: 'public-subnet-1',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'isolated-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 28,
        },
      ],
    });

    // const subnet1 = vpc.selectSubnets({subnetType: ec2.SubnetType.PUBLIC})

    // const cfnNetworkInterface = new ec2.CfnNetworkInterface(this, 'MyCfnNetworkInterface', {
    //   subnetId: subnet1.subnetIds[0],
    //   interfaceType: 'efa',
    // });

    const subnetId = vpc.privateSubnets[0].subnetId;

    const eni = new ec2.CfnNetworkInterface(this, 'ENI', {
      subnetId,
      interfaceType: 'efa',
    })

    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      vpcSubnets: {
        subnets: [ec2.Subnet.fromSubnetAttributes(this, 'Subnet', {
          subnetId,
          availabilityZone: vpc.privateSubnets[0].availabilityZone,
        })]
      },
      instanceType: new ec2.InstanceType('t3.micro'),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
    })

    // attachment
    new ec2.CfnNetworkInterfaceAttachment(this, 'Attach', {
      instanceId: instance.instanceId,
      deviceIndex: '1',
      networkInterfaceId: eni.ref,
    })

    new cdk.CfnOutput(this, 'IP', { value: eni.attrPrimaryPrivateIpAddress })

  }
}
