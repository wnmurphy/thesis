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
      query: "",
      results: []
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
        context.setState({results: data});
      },
      error: function (error) {
        console.log(error);
      }
    });
  },

  render: function() {
    var results = this.state.results.map(function(result){
      if(result.email){
          return (
            <div>
              <span>{result.userid}</span>
              <span>{result.username}</span>
              <span>{result.email}</span>
            </div>
        );
      }else{
        return (
          <div>
            <span>{result.category}</span>
            <span>{result.name}</span>
            <span>{result.start}</span>
          </div>
          );
      }
    }, this);

    return (
      <div className="search-view">
        <form id="search-form" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Search" value={this.state.query} onChange={this.handleChange} />
          <input type="submit" value="Search" />
        </form>
        <div className="search-results-container">
          {results}
        </div>
      </div>
    );
  }
});