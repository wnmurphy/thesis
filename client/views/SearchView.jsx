/** @jsx React.DOM */

/*

User enters a string and hits search.
AJAX call to api/search
Return to client.
Client updates state with results.
React updates DOM elements.


*/

var SearchView = React.createClass({
  
  getInitialState: function () {
    return {
      query: ""
    };
  },

  handleChange: function(event) {
    this.setState({query: event.target.value});
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var context = this;
    $.ajax({
      method: 'POST',
      url: '/api/search',
      dataType: 'json',
      data: {
        search: context.state.query 
      },
      success: function (data) {
        console.log("SUCCESS: ", data);
      },
      error: function (error) {
        console.log(error);
      }
    });
  },

  render: function() {
    console.log("Rendering SearchView");
    return (
      <div className="search-view">
        <form id="searchForm" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Search" value={this.state.query} onChange={this.handleChange} />
          <input type="submit" value="Search" />
        </form>
      </div>
    );
  }
});