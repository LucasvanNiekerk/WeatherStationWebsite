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
// Browser data
//

let temperatureAnnotation: string = "celsius";
let raspberryId: string = "";



window.onload = function(){
    setTimeout(function(){ 
        browserStorage(); 
        getLatestWeatherInformation(internalTemperatureOutputElement, "Temperature");
        getLatestWeatherInformation(internalHumidityOutputElement, "Humidity");
        getLatestWeatherInformation(externalTemperatureOutputElement, "Temperature");
        getLatestWeatherInformation(externalHumidityOutputElement, "Humidity");

        getAPIWeatherInformation("roskilde");
    }, 100);
}

function browserStorage(): void{
    if (typeof(Storage) !== "undefined") {
        // Store
        if(localStorage.getItem("raspId") != null){
            console.log(localStorage.getItem("raspId"));
            raspberryId = localStorage.getItem("raspId");
        }
        else{
            popupElement.style.display = "block";
        }  
    } 
    else {
        NoLocalStorageOutputElement.innerHTML = "Your browser does not support local storage."
        console.log("Webstorage is supported by (minimun version): Google Chrome v4.0, Microsoft Edge v8.0, Firefox v3.5, Safari v4.0 and Opera v11.5")
    }
}


let baseUri: string = "https://weatherstationrest2019.azurewebsites.net/api/wi/";

//
// Diverse elemenets
//

let internalTemperatureOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("internalTemperature");
let internalHumidityOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("internalHumidity");

let externalTemperatureOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("externalTemperature");
let externalHumidityOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("externalHumidity");

let externalAPITemperatureOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("externalAPITemperature");
let externalAPIHumidityOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("externalAPIHumidity");

let prognosisTemperatureOutputElement1: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisTemperature1");
let prognosisHumidityOutputElement1: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisHumidity1");
let prognosisTemperatureOutputElement2: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisTemperature2");
let prognosisHumidityOutputElement2: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisHumidity2");
let prognosisTemperatureOutputElement3: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisTemperature3");
let prognosisHumidityOutputElement3: HTMLDivElement = <HTMLDivElement>document.getElementById("prognosisHumidity3");

let NoLocalStorageOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("NoLocalStorage");

let outputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("outputElement");

let popupElement: HTMLDivElement = <HTMLDivElement>document.getElementById("raspberryIdPopup");

let raspberryIdErrorDivOutputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("raspberryIdErrorOutput");

//
// Buttons
//
let rasberryIdSubmitButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("rasberryIdSubmitButton");
rasberryIdSubmitButton.addEventListener("click", sumbitRaspberryId);

//
// Functions
//

function showAll(): void {
    axios.get<IWeather[]>(baseUri)
        .then(function (response: AxiosResponse<IWeather[]>): void {
            // element.innerHTML = generateSuccessHTMLOutput(response);
            // outputHtmlElement.innerHTML = generateHtmlTable(response.data);
            // outputHtmlElement.innerHTML = JSON.stringify(response.data);
            let result: string = "<ul>";
            response.data.forEach((weather: IWeather) => {
                result += "<li>" + weather.id + " " + weather.raspberryId + " " + weather.temperature + weather.humidity + " " + weather.timeStamp + "</li>";
            });
            result += "</ul>";
            outputElement.innerHTML = result;
            console.log("Success");
        })
        .catch(function (error: AxiosError): void { // error in GET or in generateSuccess?
            if (error.response) {
                // the request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // https://kapeli.com/cheat_sheets/Axios.docset/Contents/Resources/Documents/index
                outputElement.innerHTML = error.message;
            } else { // something went wrong in the .then block?
                outputElement.innerHTML = error.message;
            }
            console.log("Failure");
        });
}

function getLatestWeatherInformation(d: HTMLDivElement, info: string): void{
    let Url: string = baseUri + "latest/" + raspberryId;
    
    console.log("Get latest");
    axios.get<IWeather>(Url)
    .then((response: AxiosResponse<IWeather>) =>{
        if(info === "Temperature") d.innerHTML = response.data.temperature;
        else if(info === "Humidity") d.innerHTML = response.data.humidity;
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