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
  //display date with moment.js l
  $("#currentDate").text(moment().format("L"));
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
      console.log(iconUrl);
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

      forecast(target);
    });
    

  
}

function forecast(target){
//get forecast
let forecastUrl =
"https://api.openweathermap.org/data/2.5/forecast?q=" +
target +
"&appid=" +
apiKey;
$.ajax({
url: forecastUrl,
method: "GET",
}).then(function (res) {
let forecastBlock = $("#forecast");
forecastBlock.html("");
for (let i = 0; i < res.list.length && i < 5; i++) {
  let card = $("<div>");
  let cardBody = $("<div>");
  card.attr("class", "card me-3 p-3 h-50");
  cardBody.attr("class", "card-body");
  let temp = res.list[i].main.temp;
  temp = ((temp - 273.15) * 9) / 5 + 32;
  temp = temp.toFixed(0);
  let humid = res.list[i].main.humidity;
  let date = res.list[i].dt_txt;
  date = date.substr(0, 10);
  let h5 = $("<h5>");
  h5.text("(" + date + ")");
  card.append(h5);
  let forecastIcon = res.list[i].weather[0].icon;
  let p = $("<p>");
  let iconUrlForecast =
    "https://openweathermap.org/img/wn/" + forecastIcon + "@2x.png";
  let img = $("<img>");
  card.append(img);
  img.attr("src", iconUrlForecast);
  p.html("<b>Temp: </b><span>" + temp + " °F</span>");
  card.append(p);
  let humidP = $("<p>");
  humidP.html("<b>Humidity: </b><span>" + humid + "%</span>");
  card.append(humidP);
  $(".w-icon").attr("src", forecastIcon);
  console.log(temp);
  card.append(cardBody);
  forecastBlock.append(card);
}
});
}

render();
