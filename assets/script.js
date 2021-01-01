let cities = JSON.parse(localStorage.getItem("city"));

if (cities === null) {
  cities = [];
}

const apiKey = "92554cbde6d54e5152a98d286b1f0de4";

//clear history
$("#clear").on("click", function () {
  cities = [];
  render();
  storeCities();
});

//render array
function render(x) {
  const nav = $("#nav");
  nav.html("");
  for (let i = 0; i < cities.length; i++) {
    let a = $("<a>");
    a.text(cities[i]);
    a.attr("value", cities[i]);
    a.attr("class", "nav-link");
    a.attr("role", "tab");
    a.attr("data-bs-toggle", "pill");
    a.prependTo(nav);
    weatherApi(cities[i]);
  }
  let a = $("a");
  for (let i = 0; i < a.length; i++) {
    a[0].click();
  }
  $("a").on("click", function () {
    let newVal = $(this).text();

    cities.sort(function (a, b) {
      return a == newVal ? -1 : b == newVal ? 1 : 0;
    });
    weatherApi(newVal);
  });

  if (cities.length === 0) {
    $(".mainScrn").css("display", "none");
  } else {
    $(".mainScrn").css("display", "block");
  }
}
//store array
function storeCities() {
  localStorage.setItem("city", JSON.stringify(cities));
}

//Search Input
let searchCity = $("#search");

searchCity.on("keydown", function (e) {
  //capitalize first letter
  let input = $(this).val();
  input = input.toLowerCase().replace(/\b[a-z]/g, function (c) {
    return c.toUpperCase();
  });
  $(this).val(input);
  //if enter is pressed
  let target = e.key;
  if (target === "Enter") {
    let val = $(this).val().trim();
    //if input is empty
    if (val.length === 0) {
      alert("Please enter city name!").$(this).val("");
      $(this).blur();
    }
    //else if value already exist in array
    else if (cities.includes(val)) {
      cities.splice(cities.indexOf(val), 1);
      cities.push(val);
      $(this).val("");
      $(this).blur();
      storeCities();
      weatherApi(val);
      render();
    }
    //else
    else {
      cities.push(val);
      storeCities();
      render();
      $(this).val("");
      $(this).blur();
    }

    if (cities.length === 10) {
      cities.shift();
    }
  }
});

//OpenWeatherAPI
function weatherApi(target) {
  let current =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    target +
    "&appid=" +
    apiKey;

  $.ajax({
    url: current,
    method: "GET",
  })
    .catch(function () {
      alert("City not found");
      cities.pop();
      storeCities();
      location.reload();
    })
    .then(function (response) {
      forecast(target, response.coord.lat, response.coord.lon);
      //display date with moment.js l
      $("#currentDate").text("(" + moment().format("L") + ")");
      //get city name
      $("#cityTitle").text(response.name);

      //get temp data
      let tempContent = response.main.temp;
      //convert to int
      tempContent = parseFloat(tempContent);
      //convert from kelvin to fahrenheit
      tempContent = ((tempContent - 273.15) * 9) / 5 + 32;
      tempContent = tempContent.toFixed(0);
      //display temp in DOM
      $("#temp").text(tempContent + " °F");

      //humid
      $("#humid").text(response.main.humidity + "%");

      //wind
      $("#wind").text(response.wind.speed + " MPH");

      //Icon
      let icon = response.weather[0].icon;
      let iconUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
      $("#mainIcon").attr("src", iconUrl);

      //get UV
      let uvIndexUrl =
        "https://api.openweathermap.org/data/2.5/uvi?lat=" +
        response.coord.lat +
        "&lon=" +
        response.coord.lon +
        "&appid=" +
        apiKey;
      $.ajax({
        url: uvIndexUrl,
        method: "GET",
      }).then(function (data) {
        //display text
        $("#index").text(data.value);
        //get uv index num
        let uvIndex = data.value;
        uvIndex = parseInt(uvIndex);
        //uvindex val is less than 3
        if (uvIndex < 3) {
          //change text color to green
          $("#index").attr("class", "text-success");
          //else change color to yellow
        } else if (uvIndex > 2 && uvIndex < 8) {
          $("#index").attr("class", "text-warning");
          //else red text
        } else {
          $("#index").attr("class", "danger");
        }
      });
    });
}

function forecast(target, lat, lon) {
  //get forecast data
  let url =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&exclude=current,minutely,hourly&appid=" +
    apiKey;
  $.ajax({
    url: url,
    method: "GET",
  }).then(function (response) {
    let forecastBlock = $("#forecast");
    forecastBlock.html("");
    for (let i = 1; i < response.daily.length && i < 6; i++) {
      let time = response.daily[i].dt;
      let secs = time * 1000;
      let date = new Date(secs);
      date = date.toLocaleString();
      date = date.substring(0, 8);
      let h5 = $("<small>");
      h5.attr("class", "text-muted");
      h5.text("(" + date + ")");

      let card = $("<div>");
      let cardBody = $("<div>");
      card.attr("class", "card me-3 p-2");
      cardBody.attr("class", "card-body");
      let temp = response.daily[i].temp.max;
      temp = ((temp - 273.15) * 9) / 5 + 32;
      temp = temp.toFixed(0);
      let humid = response.daily[i].humidity;
      let icon = response.daily[i].weather[0].icon;
      let iconUrlForecast =
        "https://openweathermap.org/img/wn/" + icon + "@2x.png";
      let img = $("<img>");
      img.attr("src", iconUrlForecast);
      cardBody.append(h5);
      cardBody.append(img);
      card.append(cardBody);
      forecastBlock.append(card);
      let p = $("<p>");
      p.html("<b>Temp: </b><span>" + temp + " °F</span>");
      cardBody.append(p);
      let humidP = $("<p>");
      humidP.html("<b>Humidity: </b><span>" + humid + "%</span>");
      cardBody.append(humidP);
    }
  });
}

render();
