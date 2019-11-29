import axios, {
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index";


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

interface IApiWeather{
    temperature: number;
    skyText: string;
    humidity: number;
    windText: string;
}

//
// Browser data / local storage.
//

// Determines whether celcius or fahrenheit is used. This information is saved in localStorage with the key "temperatureType".
let temperatureAnnotation: string;

// The raspberryPi where the data is comming from. Raspberry id is a string and has to be exactly 10 characters long.
//This information is saved in localStorage with the key "raspId".
let raspberryId: string;

// This is run after the page has loaded. Here we get the data to show and load localStorage.
window.onload = onloadMethods;

function onloadMethods(): void{
    setTimeout(()=>{
        browserStorage(); 
        getLatestWeatherInformation(internalTemperatureOutputElement, "Temperature");
        getLatestWeatherInformation(internalHumidityOutputElement, "Humidity");

        //getAPIWeatherInformation("roskilde");
    }, 10)
}

function browserStorage(): void{
    //Tjek if localStorage is supported.
    if (typeof(Storage) !== "undefined") {
        // Tjek if there is a raspberry id saved, otherwise we ask the client to enter one.
        if(localStorage.getItem("raspId") != null){
            raspberryId = localStorage.getItem("raspId");
        }
        else{
            popupElement.style.display = "block";
        }
        
        // Tjek if temperature annotion preference is saved, otherwise we assume it's celcius.
        if(localStorage.getItem("temperatureType") != null){
            temperatureAnnotation = localStorage.getItem("temperatureType");
        }
        else{
            temperatureAnnotation = "Celsius";
        }
        //Change the name of the button to the annotion currently shown.
        changeTemperatureAnnotationButton.innerHTML = temperatureAnnotation;
    }
    //If localStorage is not supported we tell the client. 
    else {
        NoLocalStorageOutputElement.innerHTML = "Your browser does not support local storage (inspect page for more information)."
        console.log("Webstorage is supported by (minimun version): Google Chrome v4.0, Microsoft Edge v8.0, Firefox v3.5, Safari v4.0 and Opera v11.5")
    }
}

// The baseUri for our web Api. For more information regarding Api visit "https://weatherstationrest2019.azurewebsites.net/api/help/index.html";
let baseUri: string = "https://weatherstationrest2019.azurewebsites.net/api/wi/";

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

//
// Buttons
//

let rasberryIdSubmitButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("rasberryIdSubmitButton");
rasberryIdSubmitButton.addEventListener("click", sumbitRaspberryId);

let changeTemperatureAnnotationButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("changeTemperatureAnnotation");
changeTemperatureAnnotationButton.addEventListener("click", changeTemperatureAnnotation);

//
// Functions
//

function changeTemperatureAnnotation(): void{
    if(temperatureAnnotation === "Celsius"){
        temperatureAnnotation = "Fahrenheit";
        changeTemperatureAnnotationButton.innerHTML = temperatureAnnotation;
        localStorage.setItem("temperatureType", temperatureAnnotation);
    }
    else if(temperatureAnnotation === "Fahrenheit"){
        temperatureAnnotation = "Celsius";
        changeTemperatureAnnotationButton.innerHTML = temperatureAnnotation;
        localStorage.setItem("temperatureType", temperatureAnnotation);
    }
    getLatestWeatherInformation(internalTemperatureOutputElement, "Temperature");
    getLatestWeatherInformation(internalHumidityOutputElement, "Humidity");
}

function getLatestWeatherInformation(d: HTMLDivElement, info: string): void{
    // eg. 
    let Url: string = baseUri + "latest/" + raspberryId;
    
    axios.get<IWeather>(Url)
    .then((response: AxiosResponse<IWeather>) =>{
        if(info === "Temperature"){
            if(temperatureAnnotation === "Celsius"){
                d.innerHTML = response.data.temperature + "°";
            }
            else if(temperatureAnnotation === "Fahrenheit"){
                d.innerHTML = convertToFahrenheit(response.data.temperature) + "°";
            }
        } 
        else if(info === "Humidity"){
         d.innerHTML = response.data.humidity + "%";
        }   
    })
    .catch((error: AxiosError) =>{
        console.log(error.message);
    });
}

function sumbitRaspberryId(): void{
    let Url: string = baseUri + "checkRaspberryId/" + raspberryId;

    console.log("Hello");
    //popupElement.style.display = "None";
    localStorage.setItem("raspId", "TestData22");
    popupElement.style.display = "None";
    /*
    axios.get<IWeather>(Url)
    .then((response: AxiosResponse) =>{
        if(response.data){
            popupElement.style.display = "None";
        }
        else{
            raspberryIdErrorDivOutputElement.innerHTML = "Not a valid RaspberryPi Id";
        }
    })
    .catch((error: AxiosError) =>{
        console.log(error.message);
        
    });
    */
}

function convertToFahrenheit(temp: string): string{
    return  (Number(temp) * (9/5) + 32).toFixed(1);
}


/*
function getAPIWeatherInformation(location: string): void{
    let Url: string = "https://vejr.eu/api.php?location=" + location + "&degree=C";

    axios.get(Url)
    .then((response: AxiosResponse) =>{
        console.log(response.data);
    })
    .catch((error: AxiosError) =>{
        console.log(error.message);
        console.log(error.code);
        console.log(error.response);
    });
}
*/