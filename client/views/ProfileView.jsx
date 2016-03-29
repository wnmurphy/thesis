// This component renders a user profile.
var ProfileView = React.createClass({

  getInitialState: function () {
    return this.updateState();
  },

  // Retrieves profile information from server and stores in state.
  updateState: function () {
    var state = {
      userId: window.location.hash.substring(10) || globalState.userId,
      shareClass: "share-card-container",
      buttonIcon: "fa fa-share-alt",
      sharing: false,
      editing: false,
      requireAuth: !window.location.hash.substring(10)
    };

    var context = this;
    ProfileController.getProfile(state.userId, function (profile) {
      context.setState(profile);
      if (profile.username) {
        MetaController.setOGP({
          title: profile.username + ' on irl',
          description: profile.bio,
          image: profile.img,
          url: 'http://app.irl.events/#/profile/' + profile.userId
        });
      }
      context.setState({shareProps: {
                          contents: 'Check out ' + profile.username + ' on irl! app.irl.events/#/profile/' + profile.userId,
                          subject: 'Check out ' + profile.username,
                          url: 'app.irl.events/#/profile/' + profile.userId
                        }});
    }, function (message) {console.log(message)});

    return state;
  },

  // If user is not logged in, this saves the function in progress to run after login prompt.
  post: function () {
    this.setState({userId: globalState.userId}, function () {
      this.setState(this.updateState());
    });
  },

  // Toggles visibility of shareCard.
  toggleShare: function () {
    var sharing = !this.state.sharing;
    var newState = {sharing: sharing};
    if (sharing) {
      newState.buttonIcon = "fa fa-times",
      newState.shareClass = "share-card-container show-share-card"
    } else {
      newState.buttonIcon = "fa fa-share-alt",
      newState.shareClass = "share-card-container"
    }

    this.setState(newState);
  },

  // Add the userId of the currently displayed profile to current user's follow list.
  followUser: function() {
    var context = this;
    ProfileController.followUser(this.state.userId, function (data) {
      context.setState({toastMessage: 'Following User'});
      console.log(data);
    }, function (err) {
      context.setState({toastMessage: 'Already Following'});
      console.error(err);
    });
    setTimeout(function() {
      context.setState({toastMessage: ''}, function() {
        console.log('toastMessage changed');
      });
    }, 5000);
  },

  // Opens option to edit user profile photo and bio.
  toggleEdit: function () {
    var editing = !this.state.editing;
    this.setState({
      editing: editing
    });
  },

  // Turn off editing mode and send updated profile info to the server.
  handleSubmit: function () {
    this.toggleEdit();
    ProfileController.updateProfile({bio: this.state.bio});
  },

  // If profile photo is changed, convert it and send the file to the server.
  handleChange: function (event) {
    var context = this;
    var newState = {};

    if (event.target.id === 'img') {
      ProfileController.sendImage(event.target.files[0], function (image) {
        context.setState({img: image});
      });
    } else {
      newState[event.target.id] = event.target.value;
      this.setState(newState);
    }
  },

  // Enables opening the file upload dialog by clicking on the image.
  handleFileInput: function () {
    $('#img').click();
  },

  // Retrieves user information from server after successful login.
  handleLogin: function () {
    this.setState(this.updateState());
  },

  render: function() {

    // Check whether you're on someone else's profile or your own.
    if (!window.location.hash.substring(10) !== this.state.requireAuth) {
      this.setState(this.updateState());
    }

    // Open loginCard if you go to your own profile and aren't logged in.
    var login = null;
    if (this.state.requireAuth) {
      login = <LoginRequired parent={this} />;
    }

    // Display edit button if current profile is your own.
    if (globalState.userId === this.state.userId) {
      var editButton = <div id="edit-button" />;
    } else {
      var editButton = null
    }

    // Create share button for sharing a profile.
    var shareButton =  (<div>
                    <div className={this.state.shareClass} onClick={this.toggleShare}>
                      <ShareCard shareProps={this.state.shareProps}/>
                    </div>
                    <div className="share-button-container">
                      <a onClick={this.toggleShare} className="circle">
                        <i className={this.state.buttonIcon}></i>
                      </a>
                    </div>
                  </div>);

    // Handle conditional display of subscriptions, image, and bio if current profile is your own.
    var checkFollowers = 'followers-container hide';
    var checkFollowing = 'following-container hide';
    var followingList = null;
    var followersList = null;

    if (this.state.signedIn) {
      var followButton = (<div className="follow-button" onClick={AuthController.signOut}>Sign Out</div>);
      if (this.state.followersList && this.state.followersList.length > 0) {
        checkFollowers ='followers-container';
      }
      if (this.state.followingList && this.state.followingList.length > 0) {
        checkFollowing = 'following-container';
      }

      // Define list of users you're subscribed to.
      followingList = this.state.followingList.map(function (user) {
        var curUrl = '/#/profile' + user.userId;
        return (
            <div><a href={curUrl} className="following">{user.username}</a></div>
          );
      });

      // Define list of users subscribed to you.
      followersList = this.state.followersList.map(function (user) {
        var curUrl = '/#/profile' + user.userId;
        return (
            <div><a href={curUrl} className="follower">{user.username}</a></div>
          );
      });
      var followButton = null;

      // Retrieve user's profile image, otherwise render default.
      if(this.state.img) {
        var style = {
          'background-image': 'url(' + this.state.img + ')'
        };

        var profileImage = <div className="profile-picture add clickable" style={style} onClick={this.handleFileInput} >
                            <input type="file" id="img" className="hide" onChange={this.handleChange} accept="image/*"/>
                            <div className="change-image-message">Change image</div>
                           </div>
      } else {
        var profileImage = (<div className="no-profile-picture add clickable" onClick={this.handleFileInput}>
                              <div>
                                <i className="fa fa-plus" /><br />Add an image
                              </div>
                              <input type="file" id="img" className="hide" onChange={this.handleChange} accept="image/*"/>
                            </div>);
      }
    } else {
      var followButton = (<div className="follow-button" onClick={this.followUser}>Follow {this.state.username}</div>);
      if(this.state.img) {
        var profileImage = <div className="profile-picture" style={style} />
      } else {
        var profileImage = (<div className="no-profile-picture">
                              <p>No image</p>
                            </div>);
      }
    }

    // Handles editing mode for user bio.
    if (this.state.editing) {
      var bio =
        <div className="bio-input-container">
          <input type="textbox" id='bio' className="bio-input" defaultValue={this.state.bio} onChange={this.handleChange}></input>
          <div className="save-button" onClick={this.handleSubmit}>Save changes</div>
        </div>
    } else {
      if (this.state.signedIn) {
        var editable = this.toggleEdit;
        var bioClass = "profile-bio clickable";
        var editMsg = <span className="edit-message"> tap to edit</span>;
      } else {
        var editable = null;
        var bioClass = "profile-bio";
        var editMsg = null;
      }
      var bio = <h3 className={bioClass} onClick={editable}>{this.state.bio}{editMsg}</h3>
    }

    return (
      <div className="profile-view">
        {this.state.toastMessage ? <Toast message={this.state.toastMessage} /> : null}
        <div className="profile-header">
          {profileImage}
          <div>
            <div className="profile-name">
              <h1>{this.state.username}</h1>
            </div>
            {followButton}
          </div>
        </div>
        {bio}
        <table className="profile-stats">
          <tr>
            <td className="stat">{this.state.spotCount}</td>
            <td className="divider" />
            <td className="stat">{this.state.followers}</td>
          </tr>
          <tr>
            <td className="label">Spots<br />Created</td>
            <td className="divider" />
            <td className="label">Followers</td>
          </tr>
        </table>
        {login}
        {shareButton}
        {editButton}
        <div className={checkFollowing}>
          <h3 className='following-header'>Following: </h3>
          <div>{followingList}</div>
        </div>
        <div className={checkFollowers}>
          <h3 className='followers-header'>Followers: </h3>
          <div>{followersList}</div>
        </div>
      </div>
    );
  }
});
