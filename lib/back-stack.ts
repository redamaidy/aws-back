import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
export class BackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    let corsEnvironment = {
      CORS_ORIGIN: "*"
    };

    // reusable RESTful API CORS options object
    let corsOptions = {
      allowOrigins: [ "*" ], // array containing an origin, or Cors.ALL_ORIGINS
      allowMethods: Cors.ALL_METHODS, // array of methods eg. [ 'OPTIONS', 'GET', 'POST', 'PUT', 'DELETE' ]
    };
    const dynamodbTable = new Table(this, 'dynamodb-table-ejmplo', {
      partitionKey: { name: 'username', type: AttributeType.STRING },
      sortKey: { name: 'id', type: AttributeType.NUMBER },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiration',
      tableName:'tablaXD'
    });
    dynamodbTable.addGlobalSecondaryIndex({
      indexName: 'dynamodb-table-index',
      projectionType: ProjectionType.KEYS_ONLY,
      partitionKey: { name: 'id', type: AttributeType.NUMBER },
    });

    const first_function = new Function(this, 'first-function', {
      runtime: Runtime.NODEJS_16_X,
      handler: 'lambda.handler',
      code: Code.fromAsset('./src'),
      environment: {
        ...corsEnvironment,
        TABLE_NAME: dynamodbTable.tableName
      }
    });
    dynamodbTable.grantWriteData(first_function);
    dynamodbTable.grantReadData(first_function);
    new apigateway.LambdaRestApi(this, 'api-rest', {
      handler: first_function,
      defaultCorsPreflightOptions: corsOptions
    });
  }
}
