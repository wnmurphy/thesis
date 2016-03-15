/* You'll need to have your Node server and DynamoDB running
for these tests to pass */

var aws = require('aws-sdk');
var helpers = require('../server/helpers.js');
var expect = require('chai').expect;
var db = new aws.DynamoDB();
var dbSchema = new aws.DynamoDB.DocumentClient();

describe("Persistent Spot and User Server", function() {
  
  beforeEach(function(done) {
    aws.config.update({
      accessKeyId: "fakeAccessKey",
      secretAccessKey: "fakeSecretAccessKey",
      region: "fakeRegion",
      endpoint: new aws.Endpoint('http://localhost:8000')
    });

    
    //delete previous testing tables
    var params = {
      TableName: 'Spots',
      FilterExpression: "#name = (:name)",
      ExpressionAttributeNames:{
          "#name": "name"
      },
      ExpressionAttributeValues: {
          ":name": 'test1'
      }
    };
    dbSchema.scan(params, function(err, data) {
      console.log("Data: ", data);
      data.Items.forEach(function(spot) {
        var id = spot.spotId;
        params = {
          TableName: 'Spots',
          Key: {
            spotId: id
          }
        };
        dbSchema.delete(params, function(err, data) {
          if (err) {console.error("Error deleting Johnny's spot ", err);}
          else {console.log("deleted Johnny's spot");}
        });
      });
    });
    

    done();
  });
  describe("Helper Functions", function() {
    it("should create spots", function(done){
      helpers.createSpot({
        name: "test1", 
        creator: 'Johnny', 
        category: 'entertainment',
        location: 'Arizona',
        description: 'test createSpot',
        start: '10'
      }, function(){
        params = {
          TableName: "Spots",
          FilterExpression: "#name = (:name)",
          ExpressionAttributeNames:{
              "#name": "name"
          },
          ExpressionAttributeValues: {
              ":name": 'test1'
          }
        };
        dbSchema.scan(params, function(err, data){
          if (err) {
            console.error("Error: ", err);
            done();
          }
          else {
            var spot = data.Items[0];
            console.log('spot', spot);
            expect(spot.name).to.equal('test1');
            expect(spot.creator).to.equal('Johnny');
            expect(spot.location).to.equal('Arizona');
            done();
          }
        });
        
      }, function(err){
        console.error("Error: ", err);
        done();
      });
    });
  });

});

