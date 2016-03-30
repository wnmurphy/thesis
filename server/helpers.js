var aws = require('aws-sdk');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var env = require('node-env-file');
var pe, accessKeyId, secretAccessKey, region, endpoint;

// Set environment depending on whether we're using Travis.
if(!process.env.TRAVIS) {
  pe = env(__dirname + '../../.env');
}

// Set up authentication basics, depending on whether we're in production or deployment.
if(process.env.accessKeyId) {
  accessKeyId = pe.accessKeyId;
  secretAccessKey = pe.secretAccessKey;
  endpoint = "dynamodb.us-east-1.amazonaws.com";
  region = "us-east-1";
}
else {
  accessKeyId = "fakeAccessKey";
  secretAccessKey = "fakeSecretAccessKey";
  endpoint = "http://localhost:8000";
  region = "fakeRegion";
}

aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
  endpoint: new aws.Endpoint(endpoint)
});


var dbSchema = new aws.DynamoDB.DocumentClient();

var secret = process.env.secret || "dummySecretToKeepOurRealSecretActuallyASecret";

module.exports = {

  // Create a new spot in the db.
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

            // If we have all the info we need, create the new spot.
            if(spot.name && spot.creator && spot.creatorId && spot.category && spot.location && spot.description && spot.start) {
              params = {
              TableName: 'Spots',
              Item: {
                "spotId": spot.spotId,
                "name": spot.name,
                "name_lc": spot.name.toLowerCase(),
                "creator": spot.creator,
                "creatorId": spot.creatorId,
                "category": spot.category,
                "location": spot.location,
                "address": spot.address,
                "description": spot.description,
                "description_lc": spot.description.toLowerCase(),
                "start": spot.start,
                "end": spot.end,
                "messages": []
                },
              };

              var newSpot = params.Item;

              dbSchema.put(params, function(err, data) {
                if (err) {
                  console.error('error on item put', err);
                  fail(err);
                }
                else {

                  // If write to db is successful, increment user's spotCount.
                  var params = {
                    TableName: 'Users',
                    Key: {
                      userId: spot.creatorId
                    },
                    UpdateExpression: 'ADD #field :value',
                    ExpressionAttributeNames: {
                      '#field': 'spotCount'
                    },
                    ExpressionAttributeValues: {
                      ':value': 1
                    }
                  };
                  dbSchema.update(params, function(err, data) {
                    console.log('spot creator id', spot.creatorId);
                    if (err) {
                      console.error('error updating user\'s spotCount', err);
                      fail(err);
                    } else {
                      var userParams = {
                        TableName: 'Users',
                        FilterExpression: "#username in (:userid)",
                        ExpressionAttributeNames:{
                            "#username": "userId"

                        },
                        ExpressionAttributeValues: {
                            ":userid": spot.creatorId
                        }
                      };

                      dbSchema.scan(userParams, function(err, data) {
                        if(err) {
                          console.error('error finding user id when creating spot', err);
                        } else {
                          newSpot.followers = data.Items[0].followers;
                          success(newSpot);
                        }
                      });
                    }
                  });
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

  // Search takes a string and two callbacks.
  // Search string: username, user email, name, creator, description.
  search: function(search, success, fail) {

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
            "#name": "name_lc",
            "#creator": "creator",
            "#description": "description_lc"
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

    // Find all spots in db.
    dbSchema.scan(params, function(err, data) {
      if (err) {
        console.error("Unable to query get spots. Error:", JSON.stringify(err, null, 2));
        fail(err);
      } else {
        data.Items.forEach(function(result) {
          if(result.location && result.location.constructor === Object) {
            if(context.distanceBetween(location, result.location) < 25) {
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

      // If user does not exist, increment user lastId.
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
                  savedSpots: [],
                  followers: [],
                  spotCount: 0,
                  socketId: 'socketId'
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

  // Retrieve a user profile from db.
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
        fail(err);
      }
      else if(user.Count === 0) {
        fail('user does not exist');
      }
      else if(user.Count === 1) {
        success({
          userId: user.Items[0].userId,
          username: user.Items[0].username,
          bio: user.Items[0].bio || "This user has not created a bio yet.",
          spotCount: user.Items[0].spotCount || 0,
          followers: user.Items[0].followers.length || 0,
          followersList: user.Items[0].followers || [],
          img: user.Items[0].img,
          followingList: user.Items[0].following || []
        });
      }
      else {
        fail('same user exists');
      }
    });
  },

  // Update information in the user's profile.
  updateProfile: function (userId, update, success, fail) {
    var field, value;
    for (var key in update) {
      field = key;
      value = update[key];
    }
    var params = {
      TableName: 'Users',
      Key: {
        userId: Number(userId)
      },
      UpdateExpression: 'SET #field =(:value)',
      ExpressionAttributeNames: {
        '#field': field
      },
      ExpressionAttributeValues: {
        ':value': value
      }
    };

    dbSchema.update(params, function(err, data) {
      if (err) {
        fail();
      } else {
        success();
      }
    });
  },

  // Retrieve information for a single spot.
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

  // Writes a new message to spots.spotId.messages
  // Called by socket event.
  postMessageToDatabase: function(spotId, user, message, timeStamp){

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

    // Pushes a new message to the messages array for that spot.
    dbSchema.update(params, function(err, data) {
      if(err) {
        return console.error('Error writing message to spot', err);
      }
      else {
        return data;
      }
    });
  },

  // Retrieves all messages in spots.spotId.
  // Called by AJAX call to server.
  getMessagesFromDatabase: function(spotId, callback){

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
        callback(spot.Items[0].messages);
      } else {
        return console.error('Multiple spots for same id', err);
      }
    });
  },

  // Calculates the distance between two sets of GPS coordinates.
  distanceBetween: function(point1, point2){

    // Polyfill radian conversion if not present.
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      };
    }

    // Earth's radius in meters.
    var R = 6371000;

    // Make names shorter and coerce to numbers.
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

  // Removes spots from database on server load.
  spotCleaner: function() {

    var date = String(new Date() - 24 * 60 * 60);

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
          Key: {spotId: list[0].spotId}
        };
        dbSchema.delete(params, function(err, data) {
          list.shift();
          if (list.length) {
            deleteSpot(list);
          } else {
            console.log("Spots deleted. Database has been cleaned");
          }
        });
      };
      if (spots.Items.length) {
        deleteSpot(spots.Items);
      } else {
        console.log("Database has been cleaned");
      }
    });
  },

  // Add a spot to the user's saved spot list.
  saveSpot: function(userId, spotId, success, fail) {
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
      } else if (user.Count === 1) {

        // If user has not already saved that spot
        if (user.Items[0].savedSpots.indexOf(Number(spotId)) === -1) {
          params = {
            TableName: 'Users',
            Key: { userId: user.Items[0].userId },
            UpdateExpression: 'SET savedSpots = list_append(savedSpots, :spotId)',
            ExpressionAttributeValues: {
              ':spotId': [parseInt(spotId)]
            }
          };

          // Update user's 'savedSpots' array to include this new spotId.
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

  // Add user to your follow list in db.
  followUser: function(userId, followUser, success, fail) {
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
    // Find the current user.
    dbSchema.scan(params, function (err, user) {
      if (err) {
        console.error(err);
        fail('error getting user');
      } else if (user.Count === 1) {
        var params = {
          TableName: "Users",
          FilterExpression: "#userId = (:userId)",
          ExpressionAttributeNames: {
            "#userId": "userId"
          },
          ExpressionAttributeValues: {
            ":userId": parseInt(followUser)
          }
        };

        // Find user that the user wants to follow.
        dbSchema.scan(params, function (err, follow) {

          // If user has not already followed that user
          console.log("Should be Bell: ", user.Items[0].username);
          console.log("Should be Michelle : ", follow.Items[0].username);
          console.log("Bell is following: ", user.Items[0].following);
          var found = false;
          for (var i = 0; i < user.Items[0].following.length; i++) {
            console.log(user.Items[0].following[i].userId, ' = ', follow.Items[0].userId);
            if (user.Items[0].following[i].userId == follow.Items[0].userId) {
              console.log("switch found");
              found = true;
              break;
            }
          }
          console.log("found? ", found);
          if (!found) {
            params = {
              TableName: 'Users',
              Key: { userId: user.Items[0].userId },
              UpdateExpression: 'SET following = list_append(following, :followUser)',
              ExpressionAttributeValues: {
                ':followUser': [{'userId': followUser, 'username': follow.Items[0].username}]
              }
            };

            // Update user's 'following' array to include this new user.
            dbSchema.update(params, function(err, data) {
              if (err) {
                console.error(err);
                fail('error following user');
              } else {
                params = {
                  TableName: 'Users',
                  Key: {
                    userId: parseInt(followUser)
                  },
                  UpdateExpression: 'SET #followers = list_append(followers, :followers)',
                  ExpressionAttributeNames: {
                    '#followers': 'followers'
                  },
                  ExpressionAttributeValues: {
                    ':followers': [{'userId': user.Items[0].userId, 'username': user.Items[0].username, 'socketId': user.Items[0].socketId}]
                  }
                };

                // Update 'followers' property for the followed user.
                dbSchema.update(params, function(err, follower) {
                  if (err) {
                    console.error(err);
                    fail('error updating followers property of user being followed');
                  } else {
                    success('successfully followed user');
                  }
                });
              }
            });
          } else {
            fail('user has already followed this user');
          }
        });
      } else {
        fail('failed to get correct user');
      }
    });
  },

  // Loads feed information from db.
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

    // Find current user.
    dbSchema.scan(params, function(err, user) {
      if (err) {console.error(err);}
      if (user.Count === 1) {
        // If user has any saved spotIds, find the spots and save them to results.
        if (user.Items[0].savedSpots && user.Items[0].savedSpots.length > 0) {
          getSavedSpots(user.Items[0].savedSpots, user.Items[0], results, success);
        } else {
          // If not, move on to finding followed user's spots.
          if (user.Items[0].following && user.Items[0].following.length) {
            // If user is following any other users, find all their spots and save them to results.
            getFollowedUserSpots(user.Items[0].following, results, success);
          } else {
            // If user is not following anyone, send back results.
            success(results);
          }
        }
      } else if (user.Count === 0) {
        fail('no user found');
      } else {
        fail('server error, too many users found');
      }
    });
  },

  addSocketId: function(data, callback) {
    var params = {
      TableName: 'Users',
      Key: {
        userId: Number(data.userid)
      },
      UpdateExpression: 'SET #field =(:value)',
      ExpressionAttributeNames: {
        '#field': 'socketId'
      },
      ExpressionAttributeValues: {
        ':value': data.socket_id
      }
    };

    dbSchema.update(params, function(err, data) {
      console.log('data after updating socketid', data);
      if (err) {
        console.error('error updating user socket id ', err);
      } else {
        callback(data);
      }
    });
  },

  getFollowers: function(data, callback) {
    var params = {
      TableName: "Users"
    };

    dbSchema.scan(params, function(err, data) {
      if(err) {
        console.error(err);
      } else {
        callback(data);
      }
    });
  }
};

// Retrieve any spots the user has saved.
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
      if (user.following && user.following.length) {
        getFollowedUserSpots(user.following, results, success);
      } else {
        success(results);
      }
    }
  });
};

// Retrieve any spots from user's subscriptions.
var getFollowedUserSpots = function(users, results, success) {
  var params = {
    TableName: 'Spots',
    FilterExpression: '#creator = (:creator)',
    ExpressionAttributeNames: {
      '#creator': 'creator'
    },
    ExpressionAttributeValues: {
      ':creator': users[0].username
    }
  };
  dbSchema.scan(params, function(err, spots) {
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

/* Encryption and token helpers. */

var hash = function (password, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, null, callback);
  });
};

var compare = bcrypt.compare;

var tokenizer = function (user) {
  return jwt.sign(user, secret, { expiresInMinutes: 525600 });
};
