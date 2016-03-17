var aws = require('aws-sdk');

aws.config.update({
  accessKeyId: "fakeAccessKey",
  secretAccessKey: "fakeSecretAccessKey",
  region: "fakeRegion",
  endpoint: new aws.Endpoint('http://localhost:8000')
});

var db = new aws.DynamoDB();
var dbSchema = new aws.DynamoDB.DocumentClient();

var userTableParams = {
  TableName: "Users",
  KeySchema: [
    {AttributeName: "userId", KeyType: "HASH"},
  ],
  AttributeDefinitions: [
    {AttributeName: "userId", AttributeType: "N"},
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};

var spotTableParams = {
  TableName: "Spots",
  KeySchema: [
    {AttributeName: "spotId", KeyType: "HASH"}
  ],
  AttributeDefinitions: [
    {AttributeName: "spotId", AttributeType: "N"}
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 2,
    WriteCapacityUnits: 2
  }
};

db.createTable(userTableParams, function (err, data) {
  if (err) {
    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
  }
});

db.createTable(spotTableParams, function (err, data) {
  if (err) {
    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
  }
});

  var params = {
    TableName: "Users",
    Item: {
      userId: 0,
      lastId: 0
    },
    ConditionExpression: 'attribute_not_exists(userId)'
  };

  dbSchema.put(params, function(err, data) {
    if (err) {
      console.error('Users: on item put', err);
    }
    else {
      console.log('data', data);
    }
  });


  params = {
    TableName: "Spots",
    Item: {
      spotId: 0,
      lastId: 0
    },
    ConditionExpression: 'attribute_not_exists(spotId)'
  };

  dbSchema.put(params, function(err, data) {
    if (err) {
      console.error('on item put', err);
    }
    else {
      console.log('data', data);
    }
  });


db.listTables(function(err, data) {
  console.log(data);
});

module.exports.db = db;
