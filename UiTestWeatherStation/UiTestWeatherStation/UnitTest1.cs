using System;
using System.Collections.Generic;
using System.ComponentModel;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using ModelLibrary;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using RestConsumer;
// NuGet packages must be updated to 3.141

namespace UiTestWeatherStation
{
    [TestClass]
    public class UnitTest1
    {
        private Worker worker;
        private static readonly string DriverDirectory = "C:\\Users\\Bruger\\Desktop\\Skole\\Drivers";
        private static IWebDriver _driver;

        [ClassInitialize]
        public static void Setup(TestContext context)
        {
            _driver = new ChromeDriver(DriverDirectory);
        }

        [ClassCleanup]
        public static void TearDown()
        {
            _driver.Dispose();
        }

        [TestMethod]
        public void TestGetAll()
        {
            _driver.Navigate().GoToUrl("http://localhost:3000/");

            IWebElement tidligereDataButton = _driver.FindElement(By.Id("tidligereDataButton"));
            tidligereDataButton.Click();
            Assert.AreEqual(_driver.Title, "Tidligere Data");

            IWebElement forsideButton = _driver.FindElement(By.Id("forsideButton"));
            forsideButton.Click();
            Assert.AreEqual(_driver.Title, "Forside");

            IWebElement kontoButton = _driver.FindElement(By.Id("kontoButton"));
            kontoButton.Click();
            Assert.AreEqual(_driver.Title, "Konto");

            IWebElement internalTemperature= _driver.FindElement(By.Id("internalTemperature"));
            WeatherInformation interalTemplastData = worker.GetLast();
            Assert.AreEqual(interalTemplastData.Temperature, internalTemperature.Text);

            IWebElement internalHumidity = _driver.FindElement(By.Id("internalHumidity"));
            WeatherInformation internalHumlastData = worker.GetLast();
            Assert.AreEqual(internalHumlastData.Humidity, internalHumidity.Text);

            IWebElement externalTemperature= _driver.FindElement(By.Id("externalTemperature"));
            WeatherInformation externalTempData = worker.GetLast();
            Assert.AreEqual(externalTempData.Temperature, externalTemperature.Text);

            //IWebElement externalApiTemperature = _driver.FindElement(By.Id("externalApiTemperature"));
            //WeatherInformation externalApiTempData = worker.GetLast();
            //Assert.AreEqual(externalApiTempData.Temperature, externalApiTemperature.Text);

            IWebElement externalHumidity = _driver.FindElement(By.Id("externalHumidity"));
            WeatherInformation externalHumData = worker.GetLast();
            Assert.AreEqual(externalHumData.Humidity, externalHumidity.Text);

            //IWebElement externalApiHumidity = _driver.FindElement(By.Id("externalApiHumidity"));
            //WeatherInformation externalApiHumData = worker.GetLast();
            //Assert.AreEqual(externalApiHumData.Humidity, externalApiHumidity.Text);

            IWebElement outputElement = _driver.FindElement(By.Id("outputField"));
            string text = outputElement.Text;

            Assert.AreEqual("hej", text);


        }
    }
}
