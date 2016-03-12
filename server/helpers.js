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
          console.error('on item put', err);
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
    success(3);
  },
  signup: function(info, success, fail) {
    success(4);
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