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


// @id = sa.app.vatreport.2018.test
// @api = 1.0
// @pubdate = 2018-04-23
// @publisher = Banana.ch SA
// @description = <TEST sa.vatreport.2018.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../sa.vatreport.2018.js
// @timeout = -1


/*
  SUMMARY
  -------
  Javascript test for the "sa.vatreport.2018.js" BananaApp
**/

// Register test case to be executed
Test.registerTestCase(new ReportSAVAT2018Test());

// Here we define the class, the name of the class is not important
function ReportSAVAT2018Test() {

}

// This method will be called at the beginning of the test case
ReportSAVAT2018Test.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportSAVAT2018Test.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportSAVAT2018Test.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportSAVAT2018Test.prototype.cleanup = function() {

}

//Income & Expenses accounting test
ReportSAVAT2018Test.prototype.testIncomeExpenses = function() {

  var banDoc = Banana.application.openDocument("file:script/../test/testcases/vat-income-expenses.ac2");
  Test.assert(banDoc);

  this.report_test(banDoc, "2018-01-01", "2018-12-31", "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", "First quarter report");
  this.report_test(banDoc, "2018-04-01", "2018-06-30", "Second quarter report");
  this.report_test(banDoc, "2018-07-01", "2018-09-30", "Third quarter report");
  this.report_test(banDoc, "2018-10-01", "2018-12-31", "Fourth quarter report");
  this.report_test(banDoc, "2018-01-01", "2018-01-31", "January report");

}

//Double entry accounting test
ReportSAVAT2018Test.prototype.testDoubleEntry = function() {
   
  var banDoc = Banana.application.openDocument("file:script/../test/testcases/vat-double-accrual.ac2");
  Test.assert(banDoc);

  this.report_test(banDoc, "2018-01-01", "2018-12-31", "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", "First quarter report");
  this.report_test(banDoc, "2018-04-01", "2018-06-30", "Second quarter report");
  this.report_test(banDoc, "2018-07-01", "2018-09-30", "Third quarter report");
  this.report_test(banDoc, "2018-10-01", "2018-12-31", "Fourth quarter report");
  this.report_test(banDoc, "2018-01-01", "2018-01-31", "January report");
 
}

//Function that create the report for the test
ReportSAVAT2018Test.prototype.report_test = function(banDoc, startDate, endDate, reportName) {
	var param = {};
	param.startDate = startDate;
	param.endDate = endDate;
	var vatReport = createVatReport(param, banDoc);
	Test.logger.addReport(reportName, vatReport);
}

