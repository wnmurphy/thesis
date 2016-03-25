/** @jsx React.DOM */

var ProfileView = React.createClass({
  getDefaultProps: function () {
    return {
      requireAuth: !window.location.hash.substring(10)
    };
  },

  getInitialState: function () {
    var state = {
      userId: window.location.hash.substring(10) || globalState.userId,
      shareClass: "share-card-container",
      buttonIcon: "fa fa-share-alt",
      sharing: false,
      editting: false,
    };

    var context = this;
    ProfileController.getProfile(state.userId, function (profile) {
      context.setState(profile);
      if(profile.username) {
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

  componentDidMount: function () {

  },

  post: function () {
    console.log("signIn triggered");
    this.setState({userId: globalState.userId}, function () {
      console.log("callback triggered");
      this.componentDidMount();
    });
  },

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

  followUser: function() {
    console.log('1');
    FollowController.followUser(this.state.userId, function (data) {
      console.log(data);
    }, function (err) {
      console.error(err);
    });
  },

  toggleEdit: function () {
    var editting = !this.state.editting;
    console.log('toggled editting to', editting);
    this.setState({
      editting: editting
    });
  },

  handleSubmit: function () {
    this.toggleEdit();
    ProfileController.updateProfile({bio: this.state.bio});
  },

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

  handleFileInput: function () {
    $('#img').click();
  },

  render: function() {

    console.log("Rendering ProfileView");
    if (this.props.requireAuth) {
      var login = <LoginRequired parent={this} />;
    } else {
      var login = null;
    }

    // shows only when signed in
    if (globalState.userId === this.state.userId) {
      var editButton = <div id="edit-button" />;
    } else {
      var editButton = null
    }

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
    if (this.state.signedIn) {
      var followButton = null;
      if(this.state.img) {
        var profileImage = <div>
                            <img className="profile-picture add" src={this.state.img} onClick={this.handleFileInput}/>
                            <input type="file" id="img" className="hide" onChange={this.handleChange} accept="image/*"/>
                           </div>
      } else {
        var profileImage = (<div className="no-profile-picture add" onClick={this.handleFileInput}>
                              <div>
                                <i className="fa fa-plus" /><br />Add an image
                              </div>
                              <input type="file" id="img" className="hide" onChange={this.handleChange} accept="image/*"/>
                            </div>);
      }
    } else {
      var followButton = (<div className="follow-button" onClick={this.followUser}>Follow {this.state.username}</div>);
      if(this.state.img) {
        var profileImage = <img className="profile-picture" src={this.state.img} />
      } else {
        var profileImage = (<div className="no-profile-picture">
                              <p>No image</p>
                            </div>);
      }
    }

    if (this.state.editting) {
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
            <td className="stat">{this.state.followerCount}</td>
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
      </div>
    );
  }
});
