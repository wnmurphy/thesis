/* You'll need to have your Node server and DynamoDB running
for these tests to pass */

var aws = require('aws-sdk');
var helpers = require('../server/helpers.js');
var routes = require('../server/routes.js');
var expect = require('chai').expect;
var request = require('request');
var db = new aws.DynamoDB();
var dbSchema = new aws.DynamoDB.DocumentClient();

aws.config.update({
      accessKeyId: "fakeAccessKey",
      secretAccessKey: "fakeSecretAccessKey",
      region: "fakeRegion",
      endpoint: new aws.Endpoint('http://localhost:8000')
    });

describe("Persistent Spot and User Server", function() {
  
  beforeEach(function(done) {
    
    //delete previous testing spot(s) and seed a test spot
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
      //if any spots were found with name of 'test1', delete each of them
      if (data.Count > 0) {
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
            //create a new spot "test1" for testing
            params = {
              TableName: 'Spots',
              Item: {
                spotId: 999999999999,
                name: "test1", 
                creator: 'Johnny', 
                category: 'entertainment',
                location: 'Arizona',
                description: 'test createSpot',
                start: '10'
              }
            };
            dbSchema.put(params, function(err, data) {
              if (err) {console.error("Error creating Johnny's spot", err);}
            });
          });
        });
      } else {
        //if none were found, just add the test spot
        params = {
          TableName: 'Spots',
          Item: {
            spotId: 999999999999,
            name: "test1", 
            creator: 'Johnny', 
            category: 'entertainment',
            location: 'Arizona',
            description: 'test createSpot',
            start: '10'
          }
        };
        dbSchema.put(params, function(err, data) {
          if (err) {console.error("Error creating Johnny's spot", err);}
        });
      }
    });
    //delete previously signed up test user and seed a test user
    var seedUser = function() {
      params = {
        TableName: 'Users',
        FilterExpression: "#email = (:email)",
        ExpressionAttributeNames:{
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": 'test@gmail.com'
        }
      };
      dbSchema.scan(params, function(err, data) {
        if (data.Count > 0) {
          data.Items.forEach(function(user) {
            var id = user.userId;
            params = {
              TableName: 'Users',
              Key: {
                userId: id
              }
            };
            dbSchema.delete(params, function(err, data) {
              if (err) {console.error("Error deleting test users ", err);}
              //create a new user "Johnny for testing"
              params = {
                TableName: 'Users',
                Item: {
                  userId: 999999999999,
                  username: 'Johnny',
                  password: 'password',
                  email: 'test@gmail.com'
                }
              };
              dbSchema.put(params, function(err, data) {
                if (err) {console.error("Error creating Johnny", err);}
                done();
              });
            });
          });
        } else {
          params = {
            TableName: 'Users',
            Item: {
              userId: 999999999999,
              username: 'Johnny',
              password: 'password',
              email: 'test@gmail.com'
            }
          };
          dbSchema.put(params, function(err, data) {
            if (err) {console.error("Error creating Johnny", err);}
            done();
          });
        }
      });
    };
    
  });
  describe("Helper Functions", function() {
    it("should create spots and be able to search for spots", function(done){
      helpers.createSpot({
        name: "test1", 
        creator: 'Bob', 
        category: 'entertainment',
        location: 'Minnesota',
        description: 'test createSpot',
        start: '10'
      }, function(){
        params = {
          TableName: "Spots",
          FilterExpression: "#location = (:location)",
          ExpressionAttributeNames:{
              "#location": "location"
          },
          ExpressionAttributeValues: {
              ":location": 'Minnesota'
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
            expect(spot.creator).to.equal('Bob');
            expect(spot.location).to.equal('Minnesota');
            helpers.search('Bo', function(results){
              expect(results.length).to.be.above(0);
              expect(results[0].creator).to.contain('Bo');
              done();
            }, function(err){
              console.error("Failed to search for spot", err);
              done();
            });
          }
        });
      }, function(err){
        console.error("Error: ", err);
        done();
      });
    });
    it('should sign users up and be able to search for users', function(done) {
      helpers.signup({
        username: 'Bob',
        password: 'password',
        email: 'test@gmail.com'
      }, 
      function(user){
        helpers.search('Bob', function(users) {
          expect(users.length).to.be.above(0);
          expect(users[0].username).to.contain('Bob');
          done();
        }, 
        function(err) {
          console.error('Failed in search for Bob', err);
          done();
        });
      }, function(err){
        console.error("Bob's Error: ", err);
        done();
      });
    });
    it('should be able to get spots', function(done) {
      helpers.getSpots(null, function(array){
        expect(array).to.be.an('array');
        expect(array.length).to.be.above(0);
        done();
      }, function(err){
        console.error('Error getting spots', err);
        done();
      });
    });
    it('should sign in a user', function(done) {
      helpers.signin({
        username: 'Johnny',
        password: 'password',
      }, function(user){
        expect(user.Items[0].password).to.equal('password');
        expect(user.Items[0].username).to.equal('Johnny');
        done();
      }, function(err){
        console.error("Error signing in Johnny", err);
        done();
      });
    });
    it('should get user\' profile', function(done) {
      helpers.getProfile('Johnny', function(profile){
        expect(profile.userId).to.exist;
        expect(profile.username).to.equal('Johnny');
        expect(profile.email).to.equal('test@gmail.com');
        done();
      }, function(err){
        console.error("Error getting Johnny\'s profile", err);
        done();
      });
    });
    it('should get a spot', function(done) {
      params = {
        TableName: 'Spots'
      };
      dbSchema.scan(params, function(err, spots) {
        if (err) {
          console.error(err);
        }
        console.log("All spots: ", spots.Items);
      });
      params = {
        TableName: 'Spots',
        FilterExpression: "#name = (:name)",
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ":name": 'test1'
        }
      };
      dbSchema.scan(params, function(err, spots) {
        console.log("spots: ", spots.Items);
        if (err) {
          console.error("error creating Johnny's spot", err);
          done();
        }
        var spot = spots.Items[0];
        helpers.getSpot(spot.spotId, function(found){
                  console.log("in here");

          expect(found.spotId).to.equal(spot.spotId);
          expect(found.name).to.equal('test1');
          expect(found.category).to.equal('entertainment');
          done();
        }, function(err) {
          console.error("error getting Johnny's spot", err);
          done();
        });
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
        location: 'Montana',
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
  it('should return a 200 when searching', function(done) {
    request({
      method: "POST",
      uri: "http://localhost:8080/api/search",
      json: {
        search: "test"
      }
    }, function(err, res, body) {
      if (err) {
        console.error("Error creating new spot ", err);
        done();
      }
      expect(res.statusCode).to.equal(200);
      expect(body).to.be.not.empty;
      done();
    });
  });
});

