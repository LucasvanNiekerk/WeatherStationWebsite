using System;
using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
// NuGet packages must be updated to 3.141

namespace UiTestWeatherStation
{
    [TestClass]
    public class UnitTest1
    {
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
            
            IWebElement showAllButton = _driver.FindElement(By.Id("showAllButton"));
            showAllButton.Click();

            IWebElement showOneButton = _driver.FindElement(By.Id("showOneButton"));
            showOneButton.Click();

            IWebElement postButton = _driver.FindElement(By.Id("postButton"));
            postButton.Click();

            IWebElement deleteButton = _driver.FindElement(By.Id("deleteButton"));
            deleteButton.Click();

            IWebElement getRangeButton = _driver.FindElement(By.Id("getRangeButton"));
            getRangeButton.Click();

            IWebElement outputElement = _driver.FindElement(By.Id("outputField"));
            string text = outputElement.Text;

            Assert.AreEqual("hej", text);


        }
    }
}
