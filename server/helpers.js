var aws = require('aws-sdk');

var db = require('../db/db.js');

var dbSchema = new aws.DynamoDB.DocumentClient();



module.exports = {

  createSpot: function(spot, success, fail) {

    var params = {
      TableName : "Spots",
      Key: {spotId: 0}
    };

    dbSchema.get(params, function(err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
        spot.spotId = data.Item.lastId + 1;

        params = {
          TableName: "Spots",
          Item: {
            spotId: 0,
            lastId: spot.spotId
          }
        };

        dbSchema.put(params, function(err, data) {
          if(err) {
            console.error('Error updating data item', err);
          }
          else {
            console.log('Updated data item successfully');
          }
        });
      }
    });

    if(spot.name && spot.creator && spot.category && spot.location && spot.description && spot.start_time) {
      params = {
      TableName: 'Spots',
      Item: {
        "spotId": spot.spotId,
        "name": spot.name,
        "creator": spot.creator,
        "category": spot.category,
        "location": spot.location,
        "description": spot.description,
        "start_time": spot.start_time,
        "end_time": spot.end_time
        },
      };
      dbSchema.put(params, function(err, data) {
        if (err) {
          console.error('error on item put', err);
          fail(error);
        }  
        else {
          success(data);
        } 
      });
    }
    else {
      fail('Missing Fields when creating a spot');
    }
  },
  search: function(search, success, fail) {
    success(2);

  },
  getSpots: function(location, success, fail) {
    //location
    var params = {
      TableName : "Spots"
      //FilterExpression: 'asdfsadf' //this will eventually be used to filter lat and long ranges
    };

    dbSchema.query(params, function(err, data) {
      if (err) {
        console.error("Unable to query get spots. Error:", JSON.stringify(err, null, 2));
        fail(err);
      } else {
        success(data);
      }
    });
  },
  signup: function(info, success, fail) {
    console.log('info', info);
    var params = {
    TableName: "Users",
      FilterExpression: "#username in (:userid)",
      ExpressionAttributeNames:{
          "#username": "username"
      },
      ExpressionAttributeValues: {
          ":userid": info.username
      }
    };

    dbSchema.scan(params, function(err, data) {
      
      if(data.Count === 0) {
        console.log('err', err);
        var params = {
          TableName : "Users",
          Key: {userId: 0}
        };
       
        dbSchema.get(params, function(err, data) {
          if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
          } 
          else {
            console.log('incrementing');
            info.userId = data.Item.lastId + 1;

            params = {
              TableName: "Users",
              Item: {
                userId: 0,
                lastId: info.userId
              }
            };
            console.log('params', params);
            dbSchema.put(params, function(err, data) {
              if(err) {
                console.error('Error updating data item', err);
              }
              else {
                console.log('Updated data item successfully');
              }
            });

            params = {
              TableName: "Users",
              Item: {
                userId: info.userId,
                username: info.username,
                password: info.password, //<-- need to hash/salt
                email: info.email
              }
            };

            dbSchema.put(params, function(err, data) {
              if(err) {
                console.error("Error creating new user", err);
                fail(err);
              }
              else {
                success(data);
              }
            });
          }
        });
      }
      else {
        console.log('data', data);
        fail("user already exists");
      }
    });



  },
  signin: function(info, success, fail) {
    success(5);
  },
  getProfile: function(username, success, fail) {
    success(6);
  },
  getSpot: function(id, success, fail) {
    success(7);
  }

};