import axios, {
    AxiosResponse,
    AxiosError
} from "../../node_modules/axios/index";

interface IWeather {
    id: number;
    raspberryId: string;
    temperature: string;
    humidity: string;
    timeStamp: string;
}

let baseUri: string = "https://weatherstationrest2019.azurewebsites.net/api/WeatherInformations";

let outputElement: HTMLDivElement = <HTMLDivElement>document.getElementById("outputElement");


let showAllButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("showAllButton");
showAllButton.addEventListener("click", showAll);

let showOneButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("showOneButton");
showOneButton.addEventListener("click", showOne);

let deleteButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("deleteButton");
deleteButton.addEventListener("click", deleteOne)

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
        });
}

function showOne(): void{
    let output: HTMLDivElement = <HTMLDivElement>document.getElementById("StatusCode");
    let inputOneElement: HTMLInputElement = <HTMLInputElement>document.getElementById("GetOneInput")
    let id: string = inputOneElement.value;
    let uri: string = baseUri + "/" + id;
    axios.get<IWeather>(uri)
    .then(function (response: AxiosResponse<IWeather>): void{
        let result: string = "ID: " + response.data.id + ". RaspId: " + response.data.raspberryId + ". Temperatur: " + response.data.temperature + ". Luftfugtighed: " + response.data.humidity + ". TimeStamp: " + response.data.timeStamp + ".";
        outputElement.innerHTML = result;
    })
    .catch(function (error: AxiosError): void { // error in GET or in generateSuccess?
        if (error.response) {
            // the request was made and the server responded with a status code
            // that falls out of the range of 2xx
            // https://kapeli.com/cheat_sheets/Axios.docset/Contents/Resources/Documents/index
            output.innerHTML = error.message;
        } else { // something went wrong in the .then block?
            output.innerHTML = error.message;
        }
    });
}

function deleteOne(): void {
    let output: HTMLDivElement = <HTMLDivElement>document.getElementById("contentDelete");
    let inputElement: HTMLInputElement = <HTMLInputElement>document.getElementById("deleteInput");
    let id: string = inputElement.value;
    let uri: string = baseUri + "/" + id;
    axios.delete<IWeather>(uri)
        .then(function (response: AxiosResponse<IWeather>): void {
            // element.innerHTML = generateSuccessHTMLOutput(response);
            // outputHtmlElement.innerHTML = generateHtmlTable(response.data);
            console.log(JSON.stringify(response));
            output.innerHTML = response.status + " " + response.statusText;
        })
        .catch(function (error: AxiosError): void { // error in GET or in generateSuccess?
            if (error.response) {
                // the request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // https://kapeli.com/cheat_sheets/Axios.docset/Contents/Resources/Documents/index
                output.innerHTML = error.message;
            } else { // something went wrong in the .then block?
                output.innerHTML = error.message;
            }
        });
}