// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//


// @id = ch.banana.uae.app.vatreport.2018.test
// @api = 1.0
// @pubdate = 2018-04-11
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uae.app.vatreport.2018.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../uae.vatreport.2018.js
// @timeout = -1


/*

  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report

**/

// Register test case to be executed
Test.registerTestCase(new ReportVatUAE2018());

// Here we define the class, the name of the class is not important
function ReportVatUAE2018() {

}

// This method will be called at the beginning of the test case
ReportVatUAE2018.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportVatUAE2018.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportVatUAE2018.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportVatUAE2018.prototype.cleanup = function() {

}

// Generate the expected (correct) file
ReportVatUAE2018.prototype.testBananaApp = function() {
  //Open the banana document
  var banDoc = Banana.application.openDocument("file:script/../test/testcases/UAE-Multicurrency-VAT.ac2");
  if (!banDoc) {return;}
  Test.assert(banDoc);

  this.report_test(banDoc, "2018-01-01", "2018-12-31", "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", "First semester report");
  this.report_test(banDoc, "2018-07-01", "2018-12-31", "Second semester report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", "First quarter report");
  this.report_test(banDoc, "2018-04-01", "2018-06-30", "Second quarter report");
  this.report_test(banDoc, "2018-07-01", "2018-09-30", "Third quarter report");
  this.report_test(banDoc, "2018-10-01", "2018-12-31", "Fourth quarter report");
  this.table_test(banDoc, "Vat codes table");
}

//Function that create the report for the test
ReportVatUAE2018.prototype.report_test = function(banDoc, startDate, endDate, reportName) {
  var vatReport = createVatReport(banDoc, startDate, endDate);
  Test.logger.addReport(reportName, vatReport);
}

//Function that create the table for the test
ReportVatUAE2018.prototype.table_test = function(banDoc, tableName) {
  if (banDoc) {
    var table = banDoc.table("VatCodes");
    Test.logger.addTable(tableName, table, ["Group","VatCode","Description","Gr","Gr1","IsDue","AmountType","VatRate","VatRateOnGross","VatAccount"]);
  }
}

