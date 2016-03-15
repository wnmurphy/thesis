/* You'll need to have your Node server and DynamoDB running
for these tests to pass */

var aws = require('aws-sdk');
var helpers = require('../server/helpers.js');
var routes = require('../server/routes.js');
var expect = require('chai').expect;
var request = require('request');
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

    
    //delete previous testing spot
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
        });
      });
    });
    //delete previously signed up test user
    params = {
      TableName: 'Users',
      FilterExpression: "#name = (:name)",
      ExpressionAttributeNames:{
          "#name": "username"
      },
      ExpressionAttributeValues: {
          ":name": 'Johnny'
      }
    };
    dbSchema.scan(params, function(err, data) {
      if (data.Count > 0) {
        var id = data.Items[0].userId;
        params = {
          TableName: 'Users',
          Key: {
            userId: id
          }
        };
        dbSchema.delete(params, function(err, data) {
          if (err) {console.error("Error deleting Johnny ", err);}
        });
      }
    });
    
    done();
  });
  describe("Helper Functions", function() {
    it("should create spots and be able to search for spots", function(done){
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
            expect(spot.name).to.equal('test1');
            expect(spot.creator).to.equal('Johnny');
            expect(spot.location).to.equal('Arizona');
            done();
          }
        });
        helpers.search('test', function(results){
          expect(results.length).to.be.above(0);
          expect(results[0].name).to.contain('test');
          done();
        }, function(err){
          console.error("Failed to search for spot", err);
          done();
        });
      }, function(err){
        console.error("Error: ", err);
        done();
      });
    });
    it('should sign users up and be able to search for users', function(done) {
      helpers.signup({
        username: 'Johnny',
        password: 'password',
        email: 'test@gmail.com'
      }, 
      function(user){
        helpers.search('John', function(users) {
          expect(users.length).to.be.above(0);
          expect(users[0].username).to.contain('John');
          done();
        }, 
        function(err) {
          console.error('Failed in search for John', err);
          done();
        });
      }, function(err){
        console.error("John's Error: ", err);
        done();
      });
    });
    it('should be able to get spots', function(done) {
      helpers.createSpot({
          name: "test1", 
          creator: 'Johnny', 
          category: 'entertainment',
          location: 'Arizona',
          description: 'test createSpot',
          start: '10'
        }, function(data){
          helpers.getSpots(null, function(array){
            console.log("Array: ", array);
            expect(array).to.be.an('array');
            expect(array.length).to.be.above(0);
            done();
          }, function(err){
            console.error('Error getting spots', err);
            done();
          });
        }, function(err){
          console.error("Error populating spot", err);
          done();
        });
    });
    it('should sign in a user', function(done) {
      helpers.signup({
        username: 'Johnny',
        password: 'password',
        email: 'test@gmail.com'
      }, function(data){
        helpers.signin({
          username: 'Johnny',
          password: 'password',
        }, function(user){
          //expects
          expect(user.Items[0].password).to.equal('password');
          expect(user.Items[0].username).to.equal('Johnny');
          done();
        }, function(err){
          console.error("Error signing in Johnny", err);
          done();
        });
      }, function(err) {
        console.error("Error signing up Johnny", err);
        done();
      });
    });
    it('should get user\' profile', function(done) {
      helpers.signup({
        username: 'Johnny',
        password: 'password',
        email: 'test@gmail.com'
      }, function(data){
        helpers.getProfile('Johnny', function(profile){
          expect(profile.userId).to.exist();
          expect(profile.username).to.equal('Johnny');
          expect(profile.email).to.equal('test@gmail.com');
          done();
        }, function(err){
          console.error("Error getting Johnny\'s profile", err);
          done();
        });
      }, function(err) {
        console.error("Error signing up Johnny", err);
        done();
      });
    });
    it('should get a spot', function(done) {
      helpers.createSpot({
        name: "test1", 
        creator: 'Johnny', 
        category: 'entertainment',
        location: 'Arizona',
        description: 'test createSpot',
        start: '10'
      }, function(spot){
        params = {
          TableName: 'Spots',
          FilterExpression: "#name = (:name)",
          ExpressionAttributeNames:{
              "#name": "name"
          },
          ExpressionAttributeValues: {
              ":name": 'test1'
          }
        };
        dbSchema.scan(params, function(err, spots) {
          if (err) {
            console.error("error creating Johnny's spot", err);
            done();
          } else {
            var spot = spots.Items[0];
            helpers.getSpot(spot.spotId, function(found){
              expect(found.spotId).to.equal(spot.spotId);
              expect(found.name).to.equal('test1');
              expect(found.category).to.equal('entertainment');
              done();
            }, function(err) {
              console.error("error getting Johnny's spot", err);
              done();
            });
          }

        });
      }, function(err) {
        console.error("error creating Johnny's spot", err);
        done();
      });
    });
    //need to write tests for helper function distanceBetween
  });
});
describe("Server routes", function() {
  it('should be able to serve the main page', function(done) {
    request({
      method: "GET",
      uri: "http://localhost:8080/"
    }, function (err, res, body){
      if (err) {
        console.error("Error getting main page ", err);
        done();
      }
      expect(res.statusCode).to.equal(200);
      expect(body).to.be.not.empty;
      expect(body).to.contain('<div');
      done();
    });
  });
  it('should return a 200 when creating a new spot', function(done) {
    request({
      method: "POST",
      uri: "http://localhost:8080/api/create",
      json: {
        name: "test1", 
        creator: 'Johnny', 
        category: 'entertainment',
        location: 'Arizona',
        description: 'test createSpot',
        start: '10'
      }
    }, function(err, res, body){
      if (err) {
        console.error("Error creating new spot ", err);
        done();
      }
      expect(res.statusCode).to.equal(200);
      expect(body).to.be.empty;
      done();
    });
  });
});

