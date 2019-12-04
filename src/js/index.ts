import axios, { AxiosResponse, AxiosError } from "../../node_modules/axios/index";
import { BorderWidth, Chart, Point, ChartColor } from '../../node_modules/chart.js';

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

//
// Browser data / local storage.
//

// Determines whether celcius or fahrenheit is used. This information is saved in localStorage with the key "temperatureType".
let temperatureAnnotation: string;

// The raspberryPi where the data is comming from. Raspberry id is a string and has to be exactly 10 characters long.
//This information is saved in localStorage with the key "raspId".
let raspberryId: string = "";

// The City for the external temeperature. This information is saved in localStorage with the key "currentCity".
let currentCity: string = "";

// This is run after the page has loaded. Here we get the data to show and load localStorage.
window.onload = onloadMethods;

// Runs following functions 10 milliseconds after the page / window has loaded.
// We run browserstorage to find raspberry id, prefered tempeture annotion and which city data to show.
// We fill our dropdown dynamically.
// We get the data from our api and openweathermap api.
function onloadMethods(): void {
    setTimeout(() => {
        browserStorage();
        fillDropDown();
        loadData();

    }, 10)
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

        // Tjek if temperature annotion preference is saved, otherwise we assume it's celcius.
        if (localStorage.getItem("temperatureType") != null) {
            temperatureAnnotation = localStorage.getItem("temperatureType");
        }
        else {
            temperatureAnnotation = "Celsius";
            localStorage.setItem("temperatureType", temperatureAnnotation);
        }

        //To check what city the user wants to see information from.
        if (localStorage.getItem("currentCity") != null) {
            currentCity = localStorage.getItem("currentCity");

        }
        else {
            currentCity = "Roskilde";
            localStorage.setItem("currentCity", currentCity)
        }

        console.log("RaspberryId: " + raspberryId);
        console.log("Temperature annotion: " + temperatureAnnotation);
        console.log("current city:" + currentCity);

        console.log("Local storage raspberry id: " + localStorage.getItem("raspId"));
        console.log("Local storage temperature annotation: " + localStorage.getItem("temperatureType"));
        console.log("Local storage current city: " + localStorage.getItem("currentCity"));

    }
    //If localStorage is not supported we tell the client. 
    else {
        NoLocalStorageOutputElement.innerHTML = "Your browser does not support local storage (inspect page for more information).";
        console.log("Webstorage is supported by (minimun version): Google Chrome v4.0, Microsoft Edge v8.0, Firefox v3.5, Safari v4.0 and Opera v11.5")
    }
}

// The baseUri for our web Api. For more information regarding the Api visit "https://weatherstationrest2019.azurewebsites.net/api/help/index.html".
let baseUri: string = "https://weatherstationrest2019.azurewebsites.net/api/wi/";

// The baseUri for the third parti web api we use. For more information regarding the Api visit "https://openweathermap.org/api".
let thirdPartApiBaseUri: string = "http://api.openweathermap.org/data/2.5/";

//
// Diverse elemenets
//

let internalTemperatureOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("internalTemperature");
let internalHumidityOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("internalHumidity");

let externalAPITemperatureOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("externalAPITemperature");
let externalAPIHumidityOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("externalAPIHumidity");

let prognosisTemperatureOutputElement1: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisTemperature1");
let prognosisHumidityOutputElement1: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisHumidity1");
let prognosisTemperatureOutputElement2: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisTemperature2");
let prognosisHumidityOutputElement2: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisHumidity2");
let prognosisTemperatureOutputElement3: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisTemperature3");
let prognosisHumidityOutputElement3: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisHumidity3");

let NoLocalStorageOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("NoLocalStorage");

let popupElement: HTMLDivElement = <HTMLDivElement>document.getElementById("raspberryIdPopup");

let raspberryIdErrorDivOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("raspberryIdErrorOutput");

let raspberryIdInputElement: HTMLInputElement = <HTMLInputElement>document.getElementById("raspberryIdInput");
raspberryIdInputElement.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        rasberryIdSubmitButton.click();
    }
});

let frontpageDivElement: HTMLDivElement = <HTMLDivElement>document.getElementById("Frontpage");
let olderDataDivElement: HTMLDivElement = <HTMLDivElement>document.getElementById("OlderData");

let cityDropDownElement: HTMLSelectElement = <HTMLSelectElement>document.getElementById("cityDropDown");
cityDropDownElement.addEventListener("change", () => {
    currentCity = cityDropDownElement.value;
    localStorage.setItem("currentCity", currentCity);
    console.log(localStorage.getItem("currentCity"));
    loadApiData();
});


//
// Chart
//

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
            text: 'Tidligere data'
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

let inputButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("inputButton")
inputButton.addEventListener("click", get7Days)



function getRangeOfDay(date: Date): void {
    let i: number = 0;
    let resultTemperature: number = 0;
    let resultHumidity: number = 0;
    let avgTemperature: number = 0;
    let avgHumidity: number = 0;
    let Url: string = baseUri + "date/" + raspberryId + "/" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    axios.get<IWeather[]>(Url)
        .then(function (response: AxiosResponse<IWeather[]>): void {

            console.log(response.data);
            response.data.forEach((weatherInfo: IWeather) => {
                i++;
                resultTemperature += Number(weatherInfo.temperature);
                resultHumidity += Number(weatherInfo.humidity);
            });
            if (i > 0) {
                avgTemperature = resultTemperature / i;
                avgHumidity = resultHumidity / i;

            }
            console.log("temp: " + avgTemperature);
            console.log("hum: " + avgHumidity);

        });
}

function get7Days(): void {
    let dayInputField: HTMLInputElement = <HTMLInputElement>document.getElementById("dayInputField");
    let date: Date = new Date(dayInputField.value);

    for (let i = 0; i < 7; i++) {
        getRangeOfDay(date);
        date.setDate(date.getDate() - 1);
    }
}


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

let frontpageButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("FrontpageButton");
frontpageButton.addEventListener("click", displayFrontpage);

let olderDataButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("OlderDataButton");
olderDataButton.addEventListener("click", displayOlderData);


//
// Functions
//

function displayFrontpage(): void {
    frontpageDivElement.style.display = "block";
    olderDataDivElement.style.display = "none";
}

function displayOlderData(): void {
    frontpageDivElement.style.display = "none";
    olderDataDivElement.style.display = "block";
}

function changeTemperatureAnnotation(): void {
    if (annotationOption2.checked) {
        temperatureAnnotation = "Fahrenheit";
    }
    else if (annotationOption1.checked) {
        temperatureAnnotation = "Celsius";
    }
    localStorage.setItem("temperatureType", temperatureAnnotation);

    loadData();
}

// Takes a div element to fillout and which type of information it uses (temperature og humidity (since it only uses 1 type of information)).
function getLatestWeatherInformation(divElement: HTMLDivElement, typeOfInfo: string): void {
    // eg. https://weatherstationrest2019.azurewebsites.net/api/wi/latest/78ANBj918k
    let Url: string = baseUri + "latest/" + raspberryId;

    axios.get<IWeather>(Url)
        .then((response: AxiosResponse<IWeather>) => {
            if (typeOfInfo === "Temperature") {
                if (temperatureAnnotation === "Celsius") {
                    divElement.innerHTML = response.data.temperature + "<sup>°C</sup>";
                }
                else if(temperatureAnnotation === "Fahrenheit"){
                    divElement.innerHTML = convertToFahrenheit(response.data.temperature) + "<sup>°F</sup>";
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

    axios.get(Url)
        .then((response: AxiosResponse) => {

            let responseData: string = JSON.stringify(response.data);

            let temperature: string = responseData.match('"temp":(\\d+(?:\\.\\d+)?)')[1];
            let humidity: string = responseData.match('"humidity":(\\d+(?:\\.\\d+)?)')[1];

            if (temperatureAnnotation === "Celsius") {
                externalAPITemperatureOutputElement.innerHTML = Number(temperature).toFixed(1) + "<sup>°C</sup>";
            }
            else if (temperatureAnnotation === "Fahrenheit") {
                externalAPITemperatureOutputElement.innerHTML = Number(temperature).toFixed(1) + "<sup>°F</sup>";
            }
            externalAPIHumidityOutputElement.innerHTML = Number(humidity).toFixed(1) + "%";
        })
        .catch(errorMessage);
}


function getApiPrognosisWeatherInformation(): void {
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
        let ar: string[] = [];
        let temp: string[] = [];
        let tempary: number[] = [];
        let humary: number[] = [];

            responseData.list.forEach(weatherinfo => {
                if (dateIndex < 4) {
                    let currentDate: Date = new Date(weatherinfo.dt_txt);

                    if (compareDates(currentDate, date)) {
                        tempary.push(weatherinfo.main.temp);
                        humary.push(weatherinfo.main.humidity);
                    }
                    else {
                        ar.push(Math.min.apply(null, tempary));
                        ar.push(Math.max.apply(null, tempary));
                        ar.push(Math.min.apply(null, humary));
                        ar.push(Math.max.apply(null, humary));

                date.setDate(new Date().getDate() + dateIndex);
                dateIndex++;
                tempary = [];
                humary = [];
            }
        }

            for (let i = 0; i < ar.length; i++) {
                temp[i] = toNumberToFixed(ar[i]);
            }

//
// Helper functions
//
            ar = temp;

            prognosisHumidityOutputElement1.innerHTML = ar[2] + "% | " + ar[3] + "%";
            prognosisHumidityOutputElement2.innerHTML = ar[6] + "% | " + ar[7] + "%";
            prognosisHumidityOutputElement3.innerHTML = ar[10] + "% | " + ar[11] + "%";

function generateUrl(method: string): string {
            var annotation: String;

    let Url: string = thirdPartApiBaseUri;
    Url += method;
    Url += "?q=";
    Url += cityDropDownElement.value;
    Url += ",DK";
    Url += temperatureAnnotation === "Celsius" ? "&units=metric" : "&units=imperial";
    Url += "&APPID=bc20a2ede929b0617feebeb4be3f9efd";
            if (temperatureAnnotation === "Celsius") annotation = "<sup>°C</sup>";
            else if (temperatureAnnotation === "Fahrenheit") annotation = "<sup>°F</sup>";

    return Url;
            prognosisTemperatureOutputElement1.innerHTML = toNumberToFixed(ar[0]) + " " + annotation + " | " + ar[1] + " " + annotation;
            prognosisTemperatureOutputElement2.innerHTML = ar[4] + " " + annotation + " | " + ar[5] + " " + annotation;
            prognosisTemperatureOutputElement3.innerHTML = ar[8] + " " + annotation + " | " + ar[9] + " " + annotation;
        });
    })
    .catch((error: AxiosError) =>{
        console.log(error.message);
        console.log(error.code);
        console.log(error.response);
    });
}

function toNumberToFixed(num: string): string {
    return Number(num).toFixed(1);
}

function compareDates(firstDate: Date, secondDate: Date): boolean{
    return firstDate.getFullYear() == secondDate.getFullYear() 
        && firstDate.getMonth() == secondDate.getMonth() 
        && firstDate.getDate() == secondDate.getDate();
}

function errorMessage(error: AxiosError) {
    console.log(error.message);
    console.log(error.code);
    console.log(error.response);
}

//Converts from celcius to fahrenheit. Takes a string (temperature from our web api is a string) and converts it to fahrenheit and returns it as a string.
function convertToFahrenheit(temp: string): string {
    // tF = tC * 9/5 + 32
    return (Number(temp) * (9 / 5) + 32).toFixed(1);
}

function convertToCelcius(temp: string): string {
    return ((Number(temp) - 32) / (9 / 5)).toFixed(1);
}

function loadApiData(): void {
    getAPIWeatherInformation();
    getApiPrognosisWeatherInformation();
}

function openRaspberryIdPopup() {
    popupElement.style.display = "block";
}

function closeRaspberryIdPopup(){
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
