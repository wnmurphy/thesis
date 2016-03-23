var aws = require('aws-sdk');
var db = require('../db/db.js');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');


var dbSchema = new aws.DynamoDB.DocumentClient();

var secret = process.env.secret || "dummySecretToKeepOurRealSecretActuallyASecret";


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
            if(spot.name && spot.creator && spot.creatorId && spot.category && spot.location && spot.description && spot.start) {
              params = {
              TableName: 'Spots',
              Item: {
                "spotId": spot.spotId,
                "name": spot.name,
                "creator": spot.creator,
                "creatorId": spot.creatorId,
                "category": spot.category,
                "location": spot.location,
                "address": spot.address,
                "description": spot.description,
                "start": spot.start,
                "end": spot.end,
                "messages": []
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

    // Make incoming search string lowercase to make search case-insensitive.
    search = search.toLowerCase();

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
    var params = {
      TableName : "Spots"
    };
    var context = this;
    var filteredDistSpots = [];
    //find all spots
    dbSchema.scan(params, function(err, data) {
      if (err) {
        console.error("Unable to query get spots. Error:", JSON.stringify(err, null, 2));
        fail(err);
      } else {
        data.Items.forEach(function(result) {
          if(result.location && result.location.constructor === Object) {
            if(context.distanceBetween(location, result.location) < 50) {
              filteredDistSpots.push(result);
            }
          }
        });
        success(filteredDistSpots);
      }
    });
  },

  signup: function(info, success, fail) {
    
    // Make incoming username string lowercase to prevent username collisions.
    info.username = info.username.toLowerCase();
  
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
        fail("Internal server error. Please try again.");
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
            fail("Internal server error. Please try again.");
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
                  email: info.email,
                  following: [],
                  savedSpots: []
                }
              };

              dbSchema.put(params, function(err, data) {
                if(err) {
                  console.error("Error creating new user", err);
                  fail("Internal server error. Please try again.");
                }
                else {
                  module.exports.signin(info, success, fail);
                }
              });
            });
          }
        });
      }
      else {
        fail("Username taken");
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
      console.log("Found user: ", user.Items);
      if(err) {
        console.error('Error handling user sign in', err);
        fail(err);
      }
      else if(user.Count === 0) {
        fail('Incorrect username');
      }
      else if(user.Count === 1) {
        compare(info.password, user.Items[0].password, function (err, correct) {
          if(err) {
            console.log("failed encryption test");
            fail('encryption error');
          } else {
            if(correct) {
              console.log("passed encryption test");
              success({
                userId: user.Items[0].userId,
                username: user.Items[0].username,
                token: tokenizer({
                          userId: user.Items[0].userId,
                          username: user.Items[0].username
                        })
              });
            }
            else {
              fail('Incorrect password');
            }
          }
        });

      }
      else {
        fail('multiple users with username');
      }
    });
  },

  getProfile: function(id, success, fail) {
    console.log('id: ', id);
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
        console.log('1. Error handling getting spot', err);
        fail(err);
      }
      else if(spot.Count === 0) {
        console.log('2. spot does not exist');
        fail('spot does not exist');
      }
      else if(spot.Count === 1) {
        success(spot.Items[0]);
      }
      else {
        console.log('3. have more than one same spot');
        fail('have more than one same spot');
      }
    });
  },

  postMessageToDatabase: function(spotId, user, message, timeStamp){
    // Writes message to spots.spotId.messages
    // Called by socket event

    // Identify the correct spot in database.
    var params = {
      TableName: "Spots",
      
      Key: {
        spotId: spotId
      },
      
      UpdateExpression: "SET #messages = list_append (#messages, :text)",
      
      ExpressionAttributeNames: {
        "#messages": "messages"
      },

      ExpressionAttributeValues: {
        ":text": [{username: user, text: message, timeStamp: timeStamp}]
      }
    };

    // Push a new message to the messages array for that spot.
    dbSchema.update(params, function(err, data) {
      if(err) {
        return console.error('Error writing message to spot', err);
      }
      else {
        console.log("POST MESSAGE TO DATABASE ==================>", data);
        return data;
      } 
    });
  },

  getMessagesFromDatabase: function(spotId, callback){
    // Retrieves all messages in spots.spotId
    // Called by AJAX call to server
    
    // Identify the correct spot in database.
    var params = {
      TableName: "Spots",
      FilterExpression: "#spotname = (:id)",
      ExpressionAttributeNames:{
        "#spotname": "spotId"
      },
      ExpressionAttributeValues: {
        ":id": spotId
      }
    };

    // Retrieve and return all messages for that spot.
    dbSchema.scan(params, function(err, spot) {
      if(err) {
        return console.error('Error getting messages for spot', err);
      } else if(spot.Count === 0) {
        return console.error('spot does not exist', err);
      } else if(spot.Count === 1) {
        console.log(spot);
        callback(spot.Items[0].messages);
      } else {
        return console.error('Multiple spots for same id', err);
      }
    });
  },

  distanceBetween: function(point1, point2){

    // Polyfill radian conversion if not present.
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      };
    }

    // Earth's radius in meters.
    var R = 6371000;

    // Make names shorter.
    var lat1 = Number(point1.latitude);
    var lng1 = Number(point1.longitude);
    var lat2 = Number(point2.latitude);
    var lng2 = Number(point2.longitude);

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
    console.log('distance between', distance);
    return distance;
  },

  checkToken: function (token, success, fail) {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        fail("invalid token");
      } else {
        success(decoded);
      }
    });
  },

  spotCleaner: function() {
    //date is current time 
    var date = new Date() - 24*60*60;

    var params = {
      TableName: 'Spots',
      FilterExpression: "#start <= (:currentHour)",
      ExpressionAttributeNames:{
          "#start": "start"
      },
      ExpressionAttributeValues: {
          ":currentHour": date
      }
    };
    dbSchema.scan(params, function(err, spots) {
      if (err) {console.error(err);}
      var deleteSpot = function(list) {
        var params = {
          TableName: "Spots",
          FilterExpression: "#spotId = (:spotId)",
          ExpressionAttributeNames: {
            "#spotId": "spotId"
          },
          ExpressionAttributeValues: {
            ":spotId": list[0].spotId
          }
        };
        dbSchema.delete(params, function(err, data) {
          list.shift();
          if (list.length) {
            deleteSpot(list);
          } else {
            console.log("Database has been cleaned");
          }
        });
      };
      if (spots.Items.length) {
        deleteSpots(spots.Items);
      } else {
        console.log("Database has been cleaned");
      }
    });
  },
  saveSpot: function(userId, spotId, success, fail) {
    //get user
    var params = {
      TableName: "Users",
      FilterExpression: "#userId = (:userId)",
      ExpressionAttributeNames: {
        "#userId": "userId"
      },
      ExpressionAttributeValues: {
        ":userId": parseInt(userId)
      }
    };
    dbSchema.scan(params, function(err, user) {
      if (err) {
        console.error(err);
        fail('error getting user');
      //should only find 1 user
      } else if (user.Count === 1) {
        //if user has not already saved that spot
        if (user.Items[0].savedSpots.indexOf(spotId) === -1) {
          params = {
            TableName: 'Users',
            Key: { userId: user.Items[0].userId },
            UpdateExpression: 'SET savedSpots = list_append(savedSpots, :spotId)',
            ExpressionAttributeValues: {
              ':spotId': [parseInt(spotId)]
            }
          };
          //update user's 'savedSpots' array to include this new spotId
          dbSchema.update(params, function(err, data) {
            if (err) {
              console.error(err);
              fail('error saving spot');
            } else {
              success('successfully saved spot');
            }
          });
        } else {
          fail('user has already saved this spot');
        }
      } else {
        fail('failed to get correct user');
      }
    });

      
  },
  followUser: function(userId, followUser, success, fail) {
    console.log("Follow user: ", followUser);
    var params = {
      TableName: "Users",
      FilterExpression: "#userId = (:userId)",
      ExpressionAttributeNames: {
        "#userId": "userId"
      },
      ExpressionAttributeValues: {
        ":userId": parseInt(userId)
      }
    };
    //find user
    dbSchema.scan(params, function (err, user) {
      if (err) {
        console.error(err);
        fail('error getting user');
      //should only find 1 user
      } else if (user.Count === 1) {
        //if user has not already followed that user
        if (user.Items[0].following.indexOf(followUser) === -1) {
          params = {
            TableName: 'Users',
            Key: { userId: user.Items[0].userId },
            UpdateExpression: 'SET following = list_append(following, :followUser)',
            ExpressionAttributeValues: {
              ':followUser': [followUser]
            }
          };
          //update user's 'following' array to include this new user
          dbSchema.update(params, function(err, data) {
            if (err) {
              console.error(err);
              fail('error following user');
            } else {
              success('successfully followed user');
            }
          });
        } else {
          fail('user has already followed this user');
        }
      } else {
        fail('failed to get correct user');
      }
    });
  },
  getFeed: function(id, success, fail) {
    var results = {savedSpots: [], followedUsersSpots: []};
    var params = {
      TableName: 'Users',
      FilterExpression: '#userId = (:userId)',
      ExpressionAttributeNames: {
        '#userId': 'userId'
      },
      ExpressionAttributeValues: {
        ':userId': id
      }
    };
    //get user
    dbSchema.scan(params, function(err, user) {
      if (err) {console.error(err);}
      if (user.Count === 1) {
        //if user has any saved spotId's, call function to find the spots and save them to results
        if (user.Items[0].savedSpots && user.Items[0].savedSpots.length > 0) {
          getSavedSpots(user.Items[0].savedSpots, user.Items[0], results, success);
        } else {
          //if not, move on to finding followed user's spots
          if (user.Items[0].followedUsers && user.Items[0].followedUsers.length) {
            //if user is following any other users, call function to find all their spots and save them to results
            getFollowedUserSpots(user.Items[0].following, results, success);
          } else {
            //if user is not following anyone, send back results
            success(results);
          }
        }
      //error handling
      } else if (user.Count === 0) {
        fail('no user found');
      //error handling
      } else {
        fail('server error, too many users found');
      }
    });
  }
};

var getSavedSpots = function(savedIds, user, results, success) {
  var params = {
    TableName: "Spots",
    FilterExpression: "#spotId = (:spotId)",
    ExpressionAttributeNames: {
      "#spotId": "spotId"
    },
    ExpressionAttributeValues: {
      ":spotId": parseInt(savedIds[0])
    }
  };
  dbSchema.scan(params, function(err, spot) {
    if (spot.Items[0]) {
      results.savedSpots.push(spot.Items[0]);
    }
    savedIds.shift();
    if (savedIds.length) {
      getSavedSpots(savedIds, user, results, success);
    } else {
      //find followed users spots
      if (user.following && user.following.length) {
        console.log('1');
        getFollowedUserSpots(user.following, results, success);
      } else {
        success(results);
      }
    }
  });
};
var getFollowedUserSpots = function(users, results, success) {
  var params = {
    TableName: 'Spots',
    FilterExpression: '#creator = (:creator)',
    ExpressionAttributeNames: {
      '#creator': 'creator'
    },
    ExpressionAttributeValues: {
      ':creator': users[0]
    }
  };
  dbSchema.scan(params, function(err, spots) {
    console.log('user: ', users[0]);
    console.log('spots: ', spots.Items);
    if (err) {console.error(err);}
    if (spots.Items.length) {
      results.followedUsersSpots = results.followedUsersSpots.concat(spots.Items);
    }
    users.shift();
    if (users.length) {
      getFollowedUserSpots(users, results, success);
    } else {
      success(results);
    }
  });
};

var hash = function (password, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, null, callback);
  });
};

var compare = bcrypt.compare;

var tokenizer = function (user) {
  return jwt.sign(user, secret, { expiresInMinutes: 525600 });
};
