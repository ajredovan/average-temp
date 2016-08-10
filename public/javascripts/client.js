/* STYLES */
const boxStyle = {
  padding: '10px',
  width: '100%',
  border: 'solid 2px #D3D3D3'
};

const buttonStyle = {
  width: '100%',
  margin: '4%',
  height: '40px'
}

const response = {
  margin: '0 50%'
}


/* CLASSES */
const Weather = React.createClass({
  handleWeatherForm: function(weatherForm, message) {
    console.log(weatherForm);
    this.setState({averageTemp: message});
    if (weatherForm) {
      $.ajax({
        url:this.state.url,
        dataType: 'json',
        type: 'POST',
        data: weatherForm,
        success: function(data){
          console.log(data);
          this.setState({averageTemp: data});
        }.bind(this),
        error: function(xhr, status, err){
          console.log(err);
        }.bind(this)
      });
    }
  },
  getInitialState: function() {
    return {
      averageTemp: '',
      url: "/getAverageTemp"
    }
  },
  render: function() {
    return (
      <div>
        <WeatherForm getAverageTemp={this.handleWeatherForm}/>
        <WeatherAverage averageTemp={this.state.averageTemp}/>
      </div>
    )
  }
});

const WeatherForm = React.createClass({
  render: function() {
    return (
      <form onSubmit={this.generate}>
        <input style={boxStyle} placeholder="Enter Address or Location" ref="location" />
        <input style={boxStyle} placeholder="01/01/2016" ref="sDate" />
        <input style={boxStyle} placeholder="01/20/2016" ref="eDate" />
        <button style={buttonStyle} type="submit">Submit</button>
      </form>
    )
  },
  generate: function(e) {
    e.preventDefault();
    let weatherForm = {
      location: encodeURIComponent(this.refs.location.value.trim()),
      sD: this.refs.sDate.value.trim(),
      eD: this.refs.eDate.value.trim()
    }

    if (isValidDate(weatherForm.sD) && isValidDate(weatherForm.eD) && isCorrectOrder(weatherForm.sD, weatherForm.eD)) {
      this.props.getAverageTemp(weatherForm, "Getting temp...");
    } else {
      this.props.getAverageTemp(false, "Invalid Date");
    }
  }
});

const WeatherAverage = React.createClass({
  render: function() {
    return (
      <div style={response} ref="aveTemp">
        {this.props.averageTemp}
      </div>
    )
  }
});

let isValidDate = (date) => {
  console.log(date);
  return moment(date, "MM/DD/YYYY", true).isValid();
}

let isCorrectOrder = (start, end) => {
  return moment(start).isBefore(moment(end));
}

ReactDOM.render(
  <Weather />,
  document.getElementById('weather')
)
