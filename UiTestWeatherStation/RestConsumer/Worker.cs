using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using ModelLibrary;
using Newtonsoft.Json;

namespace RestConsumer
{
    public class Worker
    {
        public WeatherInformation GetLast()
        {
            WeatherInformation latestData = new WeatherInformation();
            using (HttpClient client = new HttpClient())
            {
                Task<string> getTask = client.GetStringAsync("https://weatherstationrest2019.azurewebsites.net/api/wi/latest/TestData22");
                string jsonStr = getTask.Result;
                latestData = JsonConvert.DeserializeObject<WeatherInformation>(jsonStr);
            }

            return latestData;
        }
    }
}
