var aws = require('aws-sdk');

var db = require('../db/db.js');

var dbSchema = new aws.DynamoDB.DocumentClient();



module.exports = {
  //creating a new spot
  //update users number of spot created
  createSpot: function(spot, success, fail) {

    var params = {
      TableName : "Spots",
      Key: {spotId: 0}
    };
    //see if spot already exists
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
        //if user does not exist, increment lastId for spot id
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
    //if relevant information is present, we create new spot
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
    //search is a string
    //username, user email
    //name, creator, description 
    console.log('search', search);
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
        console.error('Error seraching for criteria in user table',err);
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
            console.error('Error seraching for criteria in user table',err);
          }
          else {
            data.Items.forEach(function(item) {
              queriedArr.push(item);
            });
            console.log('queriedArr', queriedArr);
            success(queriedArr);
          }
        });

      }
      
    });

    
  },
  getSpots: function(location, success, fail) {
    
    var params = {
      TableName : "Spots"
      //FilterExpression: 'asdfsadf' //this will eventually be used to filter lat and long ranges
    };
    //find all spots 
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
    //check if username already exists
    dbSchema.scan(params, function(err, data) {
      if(err) {
        console.error('Error signing up user', err);
        fail(err);
      }
      //if user does not exist, increment user lastId
      else if(data.Count === 0) {
        console.log('err', err);
        var params = {
          TableName : "Users",
          Key: {userId: 0}
        };
        //get the data pre-existed for user 0, which is only reference for userId and lastId
        dbSchema.get(params, function(err, data) {
          if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
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
            //increment new userId to use to create new user
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
            //add new user to db
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
      //returns this if user already exists
      else {
        console.log('data', data);
        fail("user already exists");
      }
    });



  },
  signin: function(info, success, fail) {
    console.log('info', info);
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
        if(user.Items[0].password === info.password) {
          success(user);
        }
        else {
          fail('user input wrong password');
        }
      }
      else {
        fail('same user exists');
      }
    });

  },
  getProfile: function(username, success, fail) {
    
    var params = {
    TableName: "Users",
      FilterExpression: "#username = (:userid)",
      ExpressionAttributeNames:{
          "#username": "username"
      },
      ExpressionAttributeValues: {
          ":userid": username //<-- check to see if url sends username or userid
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
  }

};