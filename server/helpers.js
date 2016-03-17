var aws = require('aws-sdk');

var db = require('../db/db.js');

var bcrypt = require('bcrypt-nodejs');

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
            if(spot.name && spot.creator && spot.category && spot.location && spot.description && spot.start) {
              params = {
              TableName: 'Spots',
              Item: {
                "spotId": spot.spotId,
                "name": spot.name,
                "creator": spot.creator,
                "category": spot.category,
                "location": spot.location,
                "address": spot.address,
                "description": spot.description,
                "start": spot.start,
                "end": spot.end
                },
              };
              dbSchema.put(params, function(err, data) {
                if (err) {
                  console.error('error on item put', err);
                  fail(err);
                }
                else {
                  success(data);
                }
              });
            }
            else {
              fail('Missing Fields when creating a spot');
            }
          }
        });
      }
    });
  },

  search: function(search, success, fail) {
    //search is a string
    //username, user email
    //name, creator, description
    var queriedArr = [];
    var params = {
      TableName: 'Users',
      FilterExpression: "contains (#username, :search) OR #useremail = (:search)",
      ExpressionAttributeNames:{
          "#username": "username",
          "#useremail": "email"
      },
      ExpressionAttributeValues: {
          ":search": search
      }
    };

    dbSchema.scan(params, function(err, data) {
      if(err) {
        console.error('Error searching for criteria in user table',err);
        fail(error);
      }
      else {
        data.Items.forEach(function(item) {
          queriedArr.push(item);
        });

        params = {
          TableName: 'Spots',
          FilterExpression: "contains (#name, :search) OR contains (#creator, :search) OR contains (#description, :search)",
          ExpressionAttributeNames:{
            "#name": "name",
            "#creator": "creator",
            "#description": "description"
          },
          ExpressionAttributeValues: {
            ":search": search
          }
        };
        dbSchema.scan(params, function(err, data) {
          if(err) {
            console.error('Error searching for criteria in spots table',err);
            fail(error);
          }
          else {
            data.Items.forEach(function(item) {
              queriedArr.push(item);
            });
            success(queriedArr);
          }
        });
      }
    });



  },

  getSpots: function(location, success, fail) {
    //location
    var params = {
      TableName : "Spots"
      // FilterExpression: 'asdfsadf'
    };

    //  Include logic to return only points within 3 miles of center of screen?

    //find all spots
    dbSchema.scan(params, function(err, data) {
      if (err) {
        console.error("Unable to query get spots. Error:", JSON.stringify(err, null, 2));
        fail(err);
      } else {
        success(data.Items);
      }
    });
  },

  signup: function(info, success, fail) {
    var params = {
      TableName: "Users",
      FilterExpression: "#username in (:userid)",
      ExpressionAttributeNames: {
          "#username": "username"
      },
      ExpressionAttributeValues: {
          ":userid": info.username
      }
    };
    dbSchema.scan(params, function(err, data) {

      if(err) {
        console.error('Error signing up user', err);
        fail(err);
      }
      //if user does not exist, increment user lastId
      else if(data.Count === 0) {
        var params = {
          TableName : "Users",
          Key: {userId: 0}
        };

        dbSchema.get(params, function(err, data) {
          if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            fail(err);
          }
          else {
            info.userId = data.Item.lastId + 1;

            params = {
              TableName: "Users",
              Item: {
                userId: 0,
                lastId: info.userId
              }
            };
            dbSchema.put(params, function(err, data) {
              if(err) {
                console.error('Error updating data item', err);
                fail(error);
              }
              else {
                console.log('Updated data item successfully');
              }
            });

            hash(info.password, function (err, hash) {
              params = {
                TableName: "Users",
                Item: {
                  userId: info.userId,
                  username: info.username,
                  password: hash,
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
            });
          }
        });
      }
      else {
        fail("user already exists");
      }
    });
  },

  signin: function(info, success, fail) {
    var params = {
      TableName: "Users",
      FilterExpression: "#username = (:userid)",
      ExpressionAttributeNames:{
        "#username": "username"
      },
      ExpressionAttributeValues: {
         ":userid": info.username
      }
    };

    dbSchema.scan(params, function(err, user) {
      if(err) {
        console.error('Error handling user sign in', err);
        fail(err);
      }
      else if(user.Count === 0) {
        fail('user does not exist');
      }
      else if(user.Count === 1) {
        compare(info.password, user.Items[0].password, function (err, correct) {
          if(err) {
            fail('encryption error')
          } else {
            if(correct) {
              success({
                userId: user.Items[0].userId
              });
            }
            else {
              fail('incorrect password');
            }
          }
        })

      }
      else {
        fail('multiple users with username');
      }
    });
  },

  getProfile: function(id, success, fail) {
    var params = {
      TableName: "Users",
      FilterExpression: "#userId = (:userId)",
      ExpressionAttributeNames:{
        "#userId": "userId"
      },
      ExpressionAttributeValues: {
        ":userId": (Number(id))
      }
    };

    dbSchema.scan(params, function(err, user) {
      if(err) {
        console.error('Error handling user sign in', err);
        fail(err);
      }
      else if(user.Count === 0) {
        fail('user does not exist');
      }
      else if(user.Count === 1) {
        success({
          userId: user.Items[0].userId,
          email: user.Items[0].email,
          username: user.Items[0].username
        });
      }
      else {
        fail('same user exists');
      }
    });
  },

  getSpot: function(id, success, fail) {

    var params = {
      TableName: "Spots",
      FilterExpression: "#spotname = (:id)",
      ExpressionAttributeNames:{
        "#spotname": "spotId"
      },
      ExpressionAttributeValues: {
        ":id": id
      }
    };

    dbSchema.scan(params, function(err, spot) {
      if(err) {
        console.error('Error handling getting spot', err);
        fail(err);
      }
      else if(spot.Count === 0) {
        fail('spot does not exist');
      }
      else if(spot.Count === 1) {
        success(spot.Items[0]);
      }
      else {
        fail('have more than one same spot');
      }
    });
  },

  distanceBetween: function(point1, point2){

    // Polyfill radian conversion if not present.
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
    }

    // Earth's radius in meters.
    var R = 6371000;

    // Make names shorter.
    var lat1 = point1.latitude;
    var lng1 = point1.longitude;
    var lat2 = point2.latitude;
    var lng2 = point2.longitude;

    // Do maths. Convert degrees to radians.
    var radLat1 = lat1.toRad();
    var radLat2 = lat2.toRad();
    var radDeltaLat = (lat2-lat1).toRad();
    var radDeltaLng = (lng2-lng1).toRad();

    // Find area.
    var a = Math.sin(radDeltaLat/2) * Math.sin(radDeltaLat/2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(radDeltaLng/2) * Math.sin(radDeltaLng/2);

    // Find circumference.
    var c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1-a) );

    var distance = R * c;

    // Convert distance (m) to distance (mi).
    distance = distance * 0.000621371;

    return distance;
  }

};

var hash = function (password, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, null, callback);
  });
};

var compare = bcrypt.compare;
