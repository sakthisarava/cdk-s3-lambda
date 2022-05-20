import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import * as eventsources from '@aws-cdk/aws-lambda-event-sources';
import * as kms from '@aws-cdk/aws-kms';
import * as assert from 'assert';

export class CdkLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // BUCKET ENCRYPTION
    // const key = new kms.Key(this, 'my-kms-key', {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   pendingWindow: cdk.Duration.days(7),
    //   alias: 'alias/myKey',
    //   enableKeyRotation: false,
    // })

    // CREATE S3 BUCKET
    const bucket = new s3.Bucket(this, 'MyFirstBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.KMS,
    });
    assert(bucket.encryptionKey instanceof kms.Key);

    // IAM ROLE
    const myRole = new iam.Role(this, 'MyRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    })

    // const role = new s3.(this, 'MyEncryptedObject', {
    //   encryption: s3.BucketEncryption.KMS,
    // })

    // role.(myRole)

    // myRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaS3AccessExecutionRole'))

    // CREATE A LAMBDA FUNCTION
    const fn = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src'),
      role: myRole,
    });

      fn.addEventSource(new eventsources.S3EventSource(bucket, {
        events: [ s3.EventType.OBJECT_CREATED ],
        filters: [ { prefix: 'subdir/' } ] // OPTIONAL
      }))

      bucket.grantReadWrite(fn)

  }
}
