import axios, { AxiosResponse, AxiosError } from "../../node_modules/axios/index";
import { BorderWidth, Chart, Point, ChartColor } from '../../node_modules/chart.js'; //Ignore me I do work

//
// Interfaces 
//

interface IWeather {
    id: number;
    raspberryId: string;
    temperature: string;
    humidity: string;
    timeStamp: string;
}

interface bulkResonse {
    list: Ilist[];
}

interface Ilist {
    dt: number;
    main: Main;
    dt_txt: string;
}

interface Main {
    temp: number;
    pressure: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
}

interface gridLines{
    width: string;
    height: string;
    x: string;
    y: string;
}

setInterval(() => { updateTemperature() }, 10 * 1000);

function updateTemperature(): void {
    let Url: string = baseUri + "latest/" + raspberryId + "/" + temperatureAnnotation;

    axios.get<IWeather>(Url)
        .then((response: AxiosResponse<IWeather>) => {
            if (response.data.temperature === internalTemperatureOutputElement.innerHTML.split("<sup>")[0] &&
                response.data.humidity === internalHumidityOutputElement.innerHTML.replace("%", "")) {
                console.log("Still the same!");
            }
            else {
                console.log("Update");
                if (temperatureAnnotation === "celsius") {
                    internalTemperatureOutputElement.innerHTML = response.data.temperature + "<sup>°C</sup>";
                }
                else if (temperatureAnnotation === "fahrenheit") {
                    internalTemperatureOutputElement.innerHTML = response.data.temperature + "<sup>°F</sup>";
                }
                internalHumidityOutputElement.innerHTML = response.data.humidity + "%"; 
            }
        })
        .catch(errorMessage);
}

//
// Browser data / local storage.
//

// Determines whether celsius or fahrenheit is used. This information is saved in localStorage with the key "temperatureType".
let temperatureAnnotation: string;

// The raspberryPi where the data is comming from. Raspberry id is a string and has to be exactly 10 characters long.
//This information is saved in localStorage with the key "raspId".
let raspberryId: string = "";

// The City for the external temeperature. This information is saved in localStorage with the key "currentCity".
let currentCity: string = "";


// This is run after the page has loaded. Here we get the data to show and load localStorage.
window.onload = onloadMethods;

// The baseUri for our web Api. For more information regarding the Api visit "https://weatherstationrest2019.azurewebsites.net/api/help/index.html".
let baseUri: string = "https://weatherstationrest2019.azurewebsites.net/api/wi/";

// The baseUri for the third parti web api we use. For more information regarding the Api visit "https://openweathermap.org/api".
let thirdPartApiBaseUri: string = "http://api.openweathermap.org/data/2.5/";

//
// Diverse elemenets
//

//Div elements to display the data from our own api.
let internalTemperatureOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("internalTemperature");
let internalHumidityOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("internalHumidity");

//Div elements to display the data from the third party api we use.
let externalAPITemperatureOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("externalAPITemperature");
let externalAPIHumidityOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("externalAPIHumidity");

let prognosisTemperatureOutputElement1: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisTemperature1");
let prognosisHumidityOutputElement1: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisHumidity1");
let prognosisTemperatureOutputElement2: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisTemperature2");
let prognosisHumidityOutputElement2: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisHumidity2");
let prognosisTemperatureOutputElement3: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisTemperature3");
let prognosisHumidityOutputElement3: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisHumidity3");

//Div element to display an error if the browser does not support local storage.
let NoLocalStorageOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("NoLocalStorage");

//Div element that pops up on first time launch to request an raspberry id.
let popupElement: HTMLDivElement = <HTMLDivElement>document.getElementById("raspberryIdPopup");

//Div element inside the popup element that displays error messages.
let raspberryIdErrorDivOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("raspberryIdErrorOutput");

//Input element inside the popup element that takes the users raspberry id.
let raspberryIdInputElement: HTMLInputElement = <HTMLInputElement>document.getElementById("raspberryIdInput");
raspberryIdInputElement.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {  //keyCode 13 = Enter.
        event.preventDefault();
        rasberryIdSubmitButton.click();
    }
});

//Div element that contains everything from the frontpage. (We use this to hide and show it depending on which "page" the user is on).
let frontpageDivElement: HTMLDivElement = <HTMLDivElement>document.getElementById("Frontpage");

//Div element that contains everything from the older data page. (We use this to hide and show it depending on which "page" the user is on).
let olderDataDivElement: HTMLDivElement = <HTMLDivElement>document.getElementById("OlderData");

//Select element to pick which city that data displayed should come from.
let cityDropDownElement: HTMLSelectElement = <HTMLSelectElement>document.getElementById("cityDropDown");
cityDropDownElement.addEventListener("change", changeCity);

//Div elements to display a 3 day prognosis from the third parti api we use.
let prognosisday1: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisDay1");
let prognosisday2: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisDay2");
let prognosisday3: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisDay3");

//Label elements to highlight the selected temperature annotation.
let label1: HTMLLabelElement = <HTMLLabelElement>document.getElementById("label1");
let label2: HTMLLabelElement = <HTMLLabelElement>document.getElementById("label2");


let getAllOutputTable: HTMLTableElement = <HTMLTableElement>document.getElementById("getAllOutputTable");


//
// Chart
//

//Canvas element to display a chart of the last seven days of weather information from our own api.
let chart: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("chart");
var myChart = new Chart(chart, {
    type: 'line',
    scaleFontColor: 'rgba(255,255,255,1)',
    data: {
        labels: ['27. nov', '28. nov', '29. nov', '30. nov', '1. dec', '2. dec', '3. dec'],
        datasets: [{
            label: 'Temperatur',
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            data: [23.4, 25.1, 22.4, 21.1, 29.6, 22.3, 28.1],
            borderWidth: 1

        },
        {
            label: 'Luftfugtighed',
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            data: [48, 46.3, 48.2, 43.1, 49, 42.5, 42.3],
            borderWidth: 1

        }]
    },
    options: {
        title: {
            display: true,
            text: 'Tidligere data (Indendørs)'
        },
        scaleLabel: {
            display: true,
            labelString: 'hej'
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                },
                gridLines: {
                    display: true,
                    color: 'rgba(255,255,255,0.5)'
                }
            }],
            xAxes: [{
                gridLines: {
                    display: true,
                    color: 'rgba(255,255,255,0.5)'
                }
            }]
        }
    }
});

Chart.defaults.global.defaultFontColor = "#fff";


//
// Buttons
//

let rasberryIdSubmitButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("rasberryIdSubmitButton");
rasberryIdSubmitButton.addEventListener("click", sumbitRaspberryId);

let changeRaspberryIdButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("resetRaspberryId");
changeRaspberryIdButton.addEventListener("click", openRaspberryIdPopup);

let annotationOption1: HTMLInputElement = <HTMLInputElement>document.getElementById("annotationOption1");
annotationOption1.onchange = changeTemperatureAnnotation;

let annotationOption2: HTMLInputElement = <HTMLInputElement>document.getElementById("annotationOption2");
annotationOption2.onchange = changeTemperatureAnnotation;

let themeOptionDay: HTMLInputElement = <HTMLInputElement>document.getElementById("themeOptionDay");
themeOptionDay.onchange = setDayTheme;

let themeOptionNight: HTMLInputElement = <HTMLInputElement>document.getElementById("themeOptionNight");
themeOptionNight.onchange = setNightTheme;


let frontpageButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("FrontpageButton");
frontpageButton.addEventListener("click", displayFrontpage);

let olderDataButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("OlderDataButton");
olderDataButton.addEventListener("click", displayOlderData);



//
// Global variables
//

// Whether or not it is day or night, used for website theme.
let isDay: boolean = true;

// Sunrise time saved in unix utc. Used for determening whether it's day or night.
let sunrise: Date;

// Sunset time saved in unix utc. Used for determening whether it's day or night.
let sunset: Date;


let dayInputField: HTMLInputElement = <HTMLInputElement>document.getElementById("dayInputField");
dayInputField.addEventListener("change", get7Days);

let tableStringArray: string[] = ["", "", "", "", "", "", "", "", ""];

let arrayIndex: number = 0;

//
// Functions 
//

// Runs following functions 10 milliseconds after the page / window has loaded.
// We run browserstorage to find raspberry id, prefered tempeture annotion and which city data to show.
// We fill our dropdown dynamically.
// We get the data from our api and openweathermap api.
function onloadMethods(): void {
    setTimeout(() => {
        //localStorage.clear();
        browserStorage();

        fillDropDown();

        if (localStorage.getItem("raspId") != null) loadData();

        setDayInputValue();

        setTheme();

        get7Days();
        
        tester();
    }, 10);
}

function browserStorage(): void {
    //Tjek if localStorage is supported.
    if (typeof (Storage) !== "undefined") {
        // Tjek if there is a raspberry id saved, otherwise we ask the client to enter one.
        if (localStorage.getItem("raspId") != null) {
            raspberryId = localStorage.getItem("raspId");
        }
        else {
            openRaspberryIdPopup();
        }


        // Tjek if temperature annotion preference is saved, otherwise we assume it's celsius.
        if (localStorage.getItem("temperatureType") != null) {
            temperatureAnnotation = localStorage.getItem("temperatureType");
        }
        else {
            temperatureAnnotation = "celsius";
            localStorage.setItem("temperatureType", temperatureAnnotation);
        }

        //Shows which button is selected in radio buttons for temperature annotion.
        displaySelectedRadioButton();

        //To check what city the user wants to see information from.
        if (localStorage.getItem("currentCity") != null) {
            currentCity = localStorage.getItem("currentCity");

        }
        else {
            currentCity = "Roskilde%20Kommune";
            localStorage.setItem("currentCity", currentCity)
        }
    }
    //If localStorage is not supported we tell the client. 
    else {
        NoLocalStorageOutputElement.innerHTML = "Your browser does not support local storage (inspect page for more information).";
        console.log("Webstorage is supported by (minimun version): Google Chrome v4.0, Microsoft Edge v8.0, Firefox v3.5, Safari v4.0 and Opera v11.5")
    }
}

function displaySelectedRadioButton() {
    if (temperatureAnnotation === "celsius") {
        label1.className += " active";
        label2.className = label2.className.replace(/(?:^|\s)active(?!\S)/g, '');
    }
    else if (temperatureAnnotation === "fahrenheit") {
        label2.className += " active";
        label1.className = label1.className.replace(/(?:^|\s)active(?!\S)/g, '');
    }
}

function displayFrontpage(): void {
    frontpageDivElement.style.display = "block";
    olderDataDivElement.style.display = "none";
    document.title = "Hjem ( ͡° ͜ʖ ͡°)";
}

function displayOlderData(): void {
    frontpageDivElement.style.display = "none";
    olderDataDivElement.style.display = "block";
    document.title = "Ældre data"
}

function changeTemperatureAnnotation(): void {
    if (annotationOption2.checked) {
        temperatureAnnotation = "fahrenheit";
    }
    else if (annotationOption1.checked) {
        temperatureAnnotation = "celsius";
    }
    localStorage.setItem("temperatureType", temperatureAnnotation);
    get7Days();
    loadData();
}

// Takes a div element to fillout and which type of information it uses (temperature og humidity (since it only uses 1 type of information)).
function getLatestWeatherInformation(divElement: HTMLDivElement, typeOfInfo: string): void {
    // eg. https://weatherstationrest2019.azurewebsites.net/api/wi/latest/78ANBj918k
    let Url: string = baseUri + "latest/" + raspberryId + "/" + temperatureAnnotation;

    axios.get<IWeather>(Url)
        .then((response: AxiosResponse<IWeather>) => {
            if (typeOfInfo === "Temperature") {
                if (temperatureAnnotation === "celsius") {
                    divElement.innerHTML = response.data.temperature + "<sup>°C</sup>";
                }
                else if (temperatureAnnotation === "fahrenheit") {
                    divElement.innerHTML = response.data.temperature + "<sup>°F</sup>";
                }
            }
            else if (typeOfInfo === "Humidity") {
                divElement.innerHTML = response.data.humidity + "%";
            }
        })
        .catch(errorMessage);
}

function sumbitRaspberryId(): void {
    //We save the raspberry Id from our user input as a temp string.
    let tempId: string = raspberryIdInputElement.value;

    //We check if it has the required length, otherwise there is no point in checking if it exists(since it wont).
    if (tempId.length == 10) {
        // eg. https://weatherstationrest2019.azurewebsites.net/api/wi/checkRaspberryId/78ANBj918k
        let Url: string = baseUri + "checkRaspberryId/" + tempId;

        //We tjek our database to see if the raspberry id exists.
        axios.get<IWeather>(Url)
            .then((response: AxiosResponse) => {
                if (response.data) {
                    // Since we now know that the id is valid we save it.
                    raspberryId = tempId;

                    // We save the id in local storage, so the user does not have to enter it everytime they visit the website. Afterwards we close the popup.
                    localStorage.setItem("raspId", raspberryId);
                    // Reload the data so the correct data is shown.
                    loadData();
                    // Close the popup.
                    closeRaspberryIdPopup();
                    //Since we now know that the id is valid we save it.
                    raspberryId = tempId;
                }
                else {
                    raspberryIdErrorDivOutputElement.innerHTML = "RaspberryPi id does not exist.";
                }
            })
            .catch(errorMessage);
    }
    else {
        raspberryIdErrorDivOutputElement.innerHTML = "Not a valid raspberryPi id (Raspberry id must be 10 characters long).";
    }
}


function getAPIWeatherInformation(): void {
    let Url: string = generateUrl("weather");
    console.log("Api Url: " + Url);

    axios.get(Url)
        .then((response: AxiosResponse) => {
            //Since we did not need to use all the information given, we choose to use regex to isolate the data we need.
            //Therefore we use a json string instead of an object.
            let responseData: string = JSON.stringify(response.data);

            let temperature: string = responseData.match('"temp":(\\d+(?:\\.\\d+)?)')[1];
            let humidity: string = responseData.match('"humidity":(\\d+(?:\\.\\d+)?)')[1];
            let sunriseString: string = responseData.match('"sunrise":(\\d+)')[1];
            let sunsetString: string = responseData.match('"sunset":(\\d+)')[1];

            if (temperatureAnnotation === "celsius") {
                externalAPITemperatureOutputElement.innerHTML = Number(temperature).toFixed(1) + "<sup>°C</sup>";
            }
            else if (temperatureAnnotation === "fahrenheit") {
                externalAPITemperatureOutputElement.innerHTML = Number(temperature).toFixed(1) + "<sup>°F</sup>";
            }
            externalAPIHumidityOutputElement.innerHTML = Number(humidity).toFixed(1) + "%";

            sunrise = new Date(Number(sunriseString) * 1000);
            sunset = new Date(Number(sunsetString) * 1000);

            console.log(sunset);
            console.log(sunrise);
        })
        .catch(errorMessage);
}


function getApiPrognosisWeatherInformation(daysToGet: number): void {
    let Url: string = generateUrl("forecast");

    axios.get<bulkResonse>(Url)
        .then((response: AxiosResponse<bulkResonse>) => {
            // Current date used to compare to data from 3rd parti api.
            let date: Date = new Date();

            // The data we got from 3rd parti api.
            let responseData: bulkResonse = response.data;
            let dateIndex: number = 1;

            // [min temperature1, max temperature1, min humidity1, max humidity1, 
            //  min temperature2, max temperature2, min humidity2, max humidity2, 
            //  min temperature3, max temperature3, min humidity3, max humidity3]
            let dataArray: string[] = [];
            let tempary: number[] = [];
            let humary: number[] = [];
            let dates: Date[] = [];

            responseData.list.forEach(weatherinfo => {
                if (dateIndex <= daysToGet) {
                    let currentDate: Date = new Date(weatherinfo.dt_txt);

                    if (compareDates(currentDate, date)) {
                        tempary.push(weatherinfo.main.temp);
                        humary.push(weatherinfo.main.humidity);
                    }
                    else {
                        if (tempary.length > 0) {
                            dataArray.push(Math.min.apply(null, tempary));
                            dataArray.push(Math.max.apply(null, tempary));
                            dataArray.push(Math.min.apply(null, humary));
                            dataArray.push(Math.max.apply(null, humary));
                            dates.push(currentDate);

                            date.setDate(new Date().getDate() + dateIndex);
                            dateIndex++;
                            tempary = [];
                            humary = [];

                            if (compareDates(currentDate, date)) {
                                tempary.push(weatherinfo.main.temp);
                                humary.push(weatherinfo.main.humidity);
                            }
                        }
                    }
                }
            });

            fillPrognosisElements(dataArray, dates);
        })
        .catch(errorMessage);
}

function fillPrognosisElements(dataArray: string[], dates: Date[]) {
    //Change all the information to 1 decimal.
    for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = toNumberToFixed(dataArray[i], 1);
    }

    prognosisHumidityOutputElement1.innerHTML = dataArray[2] + "% | " + dataArray[3] + "%";
    prognosisHumidityOutputElement2.innerHTML = dataArray[6] + "% | " + dataArray[7] + "%";
    prognosisHumidityOutputElement3.innerHTML = dataArray[10] + "% | " + dataArray[11] + "%";

    let annotation: string = getAnnotion();

    prognosisTemperatureOutputElement1.innerHTML = dataArray[0] + annotation + " | " + dataArray[1] + annotation;
    prognosisTemperatureOutputElement2.innerHTML = dataArray[4] + annotation + " | " + dataArray[5] + annotation;
    prognosisTemperatureOutputElement3.innerHTML = dataArray[8] + annotation + " | " + dataArray[9] + annotation;

    prognosisday1.innerHTML = formatDate(dates[0]);
    prognosisday2.innerHTML = formatDate(dates[1]);
    prognosisday3.innerHTML = formatDate(dates[2]);
}

function fillDropDown() {
    //The names of the cities avaible in openweathermap.
    let cities: string[] = ["Roskilde", "Taastrup", "Vordingborg", "Aarhus"]
    //The names of the cities in the api and the ones we use to GET the information. 
    let apiNames: string[] = ["Roskilde%20Kommune", "Taastrup", "Vordingborg", "Århus%20Kommune"]

    //We will our dropdown with the cities, since it's easier and faster than to manually add them.
    for (let index = 0; index < cities.length; index++) {
        let option: HTMLOptionElement = document.createElement('option');
        option.value = apiNames[index];
        option.text = cities[index];

        cityDropDownElement.add(option);
    }

    // We find out which city the user has last used and set the current selected one to the one saved.    
    for (let index = 0; index < apiNames.length; index++) {
        if (apiNames[index] === currentCity) {
            cityDropDownElement.selectedIndex = index;
        }
    }
}

function loadData(): void {
    getLatestWeatherInformation(internalTemperatureOutputElement, "Temperature");
    getLatestWeatherInformation(internalHumidityOutputElement, "Humidity");
    loadApiData();
}

function changeCity() {
    currentCity = cityDropDownElement.value;
    localStorage.setItem("currentCity", currentCity);
    console.log(localStorage.getItem("currentCity"));
    loadApiData();
}

//sets the input Date field to have a start
function setDayInputValue(): void {
    let startDate: Date = new Date();
    let dateString: string = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + ("0" + startDate.getDate()).slice(-2);
    dayInputField.value = dateString;
}

//runs a get method with a date 7 times for the week.
function get7Days(): void {
    tableStringArray[0] = "<thead> <tr> <th>Dato</th> <th>Temperatur</th> <th>Luftfugt</th> </tr> </thead> <tbody>";
    arrayIndex = 0;
    let nonAsyncIndex: number = 0; //It just works ehh
    let date: Date = new Date(dayInputField.value);

    for (let i = 6; i >= 0; i--) {
        getRangeOfDay(date, i, nonAsyncIndex);
        console.log(i);
        nonAsyncIndex++;
        date.setDate(date.getDate() - 1);
    }
}

//Gets all the data from a specific date and updates the chart and table.
//The reason for multiple indexes are because the methos is running async.
function getRangeOfDay(date: Date, index: number, nonAsyncIndex: number): void {
    let i: number = 0;
    var options = { year: 'numeric', month: 'short', day: '2-digit' };
    //Have to use a string as date, because a date updates globally and would change while i use it.
    let tempDate: string = date.toLocaleString('da-DK', options);
    let resultTemperature: number = 0;
    let resultHumidity: number = 0;
    let avgTemperature: number = 0;
    let avgHumidity: number = 0;
    //We use this URI to get the right data. api/wi/date/TestData22/2019-12-20/celsius
    let Url: string = baseUri + "date/" + raspberryId + "/" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + ("0" + date.getDate()).slice(-2) + "/" + temperatureAnnotation;
    console.log(Url);
    axios.get<IWeather[]>(Url)
        .then(function (response: AxiosResponse<IWeather[]>): void {
            response.data.forEach((weatherInfo: IWeather) => {
                //For each data at this date, we count the data and creates a sum of the temperature and humidity.
                i++;
                resultTemperature += Number(weatherInfo.temperature);
                resultHumidity += Number(weatherInfo.humidity);
            });
            if (i > 0) {
                //we get the average of the data for the date.
                avgTemperature = resultTemperature / i;
                avgHumidity = resultHumidity / i;
            }
            //Checks if celsius or Farenheit is selected.
            let tType: string = temperatureAnnotation === "celsius" ? " °C" : " °F";
            //Inserts the data in the table in the right order using a different index.
            tableStringArray[nonAsyncIndex + 1] = "<tr> <th>" + tempDate + "</th><td>" + avgTemperature.toFixed(1) + tType + "</td><td>" + avgHumidity.toFixed(1) + "%" + "</td> </tr>";

            //arrayIndex keeps track of how many table elements have been inserted.
            arrayIndex += 1;
            if (arrayIndex > 5) {
                //inserts end table code and sets the innerHTML.
                tableStringArray[8] = "</tbody>";
                getAllOutputTable.innerHTML = tableStringArray.join("");
            }

            //Inserts data in chart.
            myChart.data.datasets[0].data[index] = Number(avgTemperature.toFixed(1));
            myChart.data.datasets[1].data[index] = Number(avgHumidity.toFixed(1));
            myChart.update();


        }).catch(errorMessage);
    //Inserts dates in chart (can't run async)
    myChart.data.labels[index] = date.toLocaleString('da-DK', options);
    myChart.update();
}


function setTheme(): void {
    let now: Date = new Date();
    let nowMill: number = now.getTime();

    let sunriseMill: number;
    let sunsetMill: number;
    
    try {
        sunriseMill = sunrise.getTime();
        sunsetMill = sunset.getTime();
        
    } catch (error) {
        setTimeout(setTheme, 50);
    }
    if (nowMill > sunriseMill && nowMill < sunsetMill) {
        setDayTheme();
        console.log(sunsetMill - nowMill);
        setTimeout(setNightTheme, (sunsetMill - nowMill));
    }
    else if (nowMill < sunriseMill || nowMill > sunsetMill) {
        setNightTheme();
        setTimeout(setDayTheme, (nowMill - sunriseMill));
    }
}

function setDayTheme(): void {
    document.documentElement.style.setProperty("--background-col", "#ff7d8d", "important");
    document.documentElement.style.setProperty("--div-col", "#0000002d"); //Might need important
    document.documentElement.style.setProperty("--background-img", "linear-gradient(to top right, #ffa873, #ff7d8d)", "important");
}

function setNightTheme(): void {
    document.documentElement.style.setProperty("--background-col", "#00558d", "important");
    document.documentElement.style.setProperty("--div-col", "#0000005e"); //Might need important
    document.documentElement.style.setProperty("--background-img", "linear-gradient(to top right, #00558d, #00856f)", "important");
}




//
// Helper functions
//

function getAnnotion(): string {
    if (temperatureAnnotation === "celsius") {
        return "<sup3days>°C</sup3days>";
    }
    else if (temperatureAnnotation === "fahrenheit") {
        return "<sup3days>°F</sup3days>";
    }
}

function formatDate(date: Date): string {
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Okt",
        "Nov", "Dec"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + '. ' + monthNames[monthIndex] + ' ' + year;
}


function generateUrl(method: string): string {

    let Url: string = thirdPartApiBaseUri;
    Url += method;
    Url += "?q=";
    Url += cityDropDownElement.value;
    Url += ",DK";
    Url += temperatureAnnotation === "celsius" ? "&units=metric" : "&units=imperial";
    Url += "&APPID=bc20a2ede929b0617feebeb4be3f9efd"; //abab15aaae04e0bfba24f744cc047dd1 //bc20a2ede929b0617feebeb4be3f9efd

    return Url;
}

function toNumberToFixed(num: string, amountOfDecimals: number): string {
    return Number(num).toFixed(amountOfDecimals);
}

function compareDates(firstDate: Date, secondDate: Date): boolean {
    return firstDate.getFullYear() === secondDate.getFullYear()
        && firstDate.getMonth() === secondDate.getMonth()
        && firstDate.getDate() === secondDate.getDate();
}

function errorMessage(error: AxiosError): void {
    console.log(error.message);
    console.log(error.code);
}

function loadApiData(): void {
    getAPIWeatherInformation();
    getApiPrognosisWeatherInformation(3);
}

function openRaspberryIdPopup(): void {
    popupElement.style.display = "block";
}

function closeRaspberryIdPopup(): void {
    popupElement.style.display = "none";
}

//
// OpenWeatherMap API models. (We only use small part).
//

/*
interface Coord
{
    lon: number;
    lat: number;
}
interface Weather {
    id: number;
    main: string;s
    description: string;
    icon: string;
}
interface Main {
    temp: number;
    pressure: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
}
interface Wind {
    speed: number;
    deg: number;
}
interface Clouds {
    all: number;
}
interface Sys {
    type: number;
    id: number;
    message: number;
    country: string;
    sunrise: number;
    sunset: number;
}
interface ResponseWeather
{
    coord: Coord;
    weather: Weather[];
    base: string;
    main: Main;
    visibility: number;
    wind: Wind;
    clouds: Clouds;
    dt: number;
    sys: Sys;
    id: number;
    name: string;
    cod: number;
}
*/

//test moveable

let frontpage: HTMLDivElement = <HTMLDivElement>document.getElementById('Frontpage')
let TreDagsPrognongse : HTMLDivElement = <HTMLDivElement>document.getElementById('3dagsPronogse')
let DagsPrognongse : HTMLDivElement = <HTMLDivElement>document.getElementById('DagsPrognongse')
let IndendørsData: HTMLDivElement = <HTMLDivElement>document.getElementById('IndendørsData')
let UdendørsData: HTMLDivElement = <HTMLDivElement>document.getElementById('UdendørsData')
let hr : HTMLDivElement = <HTMLDivElement>document.getElementById('hr')
let oneDagProg : HTMLDivElement = <HTMLDivElement>document.getElementById('oneDagProg')
let toDagProg : HTMLDivElement = <HTMLDivElement>document.getElementById('toDagProg')
let treDagProg : HTMLDivElement = <HTMLDivElement>document.getElementById('treDagProg')
let collaspe : HTMLButtonElement = <HTMLButtonElement>document.getElementById('collapseButton');
let settingMode : boolean = false;
collaspe.addEventListener('click', SetingsMode)
function tester() {
     frontpage.classList.remove('grid-stack-one-column-mode') 
     //console.log(screen.width)
     if(screen.width < 780){
        // console.log('check')
        TreDagsPrognongse.classList.remove('grid-stack-one-column-mode')
        IndendørsData.setAttribute('data-gs-width', '4')
        IndendørsData.setAttribute('data-gs-height', '3')
        IndendørsData.setAttribute('data-gs-x', '2')
        UdendørsData.setAttribute('data-gs-width', '4')
        UdendørsData.setAttribute('data-gs-height', '3')
        DagsPrognongse.setAttribute('data-gs-width', '12')
        DagsPrognongse.setAttribute('data-gs-y', '3')
        DagsPrognongse.setAttribute('data-gs-x', '0')
        hr.setAttribute('data-gs-y', '3')
        oneDagProg.setAttribute('data-gs-height', '2')
        toDagProg.setAttribute('data-gs-height', '2')
        treDagProg.setAttribute('data-gs-height', '2')
     }
     else{
            GetOneSetting(IndendørsData, 'indendata')
            GetOneSetting(UdendørsData, 'udendata') 
            GetOneSetting(hr, 'hrdata') 
            GetOneSetting(DagsPrognongse, 'DagsPrognongse')
            GetOneSetting(oneDagProg, 'oneDagProg')
            GetOneSetting(toDagProg, 'toDagProg')
            GetOneSetting(treDagProg, 'treDagProg')
         
     }
     //console.log(test2.getAttribute('data-gs-width')) 
}
function SetingsMode(){
    if(screen.width > 779){
    if ( settingMode === true){
        console.log("is on, turning off")
        //turnOffMove(IndendørsData)
        SaveAll();
        settingMode = false;
    }
    else{
       // turnOnMove(IndendørsData)
        console.log("is off, turning on")
        settingMode = true;
    }}
}

/*function turnOnMove(element: HTMLDivElement){
    console.log("remove")
    element.removeAttribute('data-gs-no-move')
    element.removeAttribute('data-gs-no-resize')
    element.removeAttribute('data-gs-locked')
    element.classList.remove('ui-draggable-disabled', 'ui-resizable-disabled', 'ui-resizable-autohide')
    /*element.setAttribute('movable', 'true')
    element.setAttribute('resizable', 'true')
    let handel: HTMLDivElement = <HTMLDivElement>element.lastElementChild;
    handel.style.display = 'block'
}

function turnOffMove(element: HTMLDivElement){
    element.setAttribute('data-gs-no-move', 'yes')
    element.setAttribute('data-gs-no-resize','yes')
    element.setAttribute('data-gs-locked', 'yes')
    //element.setAttribute('movable', 'false')
    //element.setAttribute('resizable', 'false')
    
}*/


function SaveAll(){
    saveOneSetting(IndendørsData, 'indendata')
    saveOneSetting(UdendørsData, 'udendata') 
    saveOneSetting(hr, 'hrdata') 
    saveOneSetting(DagsPrognongse, 'DagsPrognongse')
    saveOneSetting(oneDagProg, 'oneDagProg')
    saveOneSetting(toDagProg, 'toDagProg')
    saveOneSetting(treDagProg, 'treDagProg')
}

function saveOneSetting(element: HTMLDivElement, str : string){
    //console.log(str)
    let temp: gridLines=  {width: '0', height : '0', x : '0', y: '0'}
    temp.width = element.getAttribute('data-gs-width')
    temp.height = element.getAttribute('data-gs-height')
    temp.x = element.getAttribute('data-gs-x')
    temp.y = element.getAttribute('data-gs-y')
    //console.log(JSON.stringify(temp))
    localStorage.setItem(str, JSON.stringify(temp))
}

function GetOneSetting(element: HTMLDivElement, str : string){
    if (localStorage.getItem(str) != null){
        let temp: gridLines=  {width: '0', height : '0', x : '0', y: '0'}
    //console.log("str  " + str)
    temp = <gridLines>JSON.parse(localStorage.getItem(str))
    //console.log(JSON.parse(localStorage.getItem(str)));
    //console.log("temp  " + temp)
    element.setAttribute('data-gs-width', temp.width)
    element.setAttribute('data-gs-height', temp.height)
    element.setAttribute('data-gs-x', temp.x)
    element.setAttribute('data-gs-y', temp.y)
    }
}