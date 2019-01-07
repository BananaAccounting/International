// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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


// @id = sa.app.vatreport.2019.test
// @api = 1.0
// @pubdate = 2019-04-23
// @publisher = Banana.ch SA
// @description = <TEST sa.vatreport.2019.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../sa.vatreport.2019.js
// @timeout = -1


/*
  SUMMARY
  -------
  Javascript test for the "sa.vatreport.2019.js" BananaApp
**/

// Register test case to be executed
Test.registerTestCase(new ReportSAVAT2019Test());

// Here we define the class, the name of the class is not important
function ReportSAVAT2019Test() {

}

// This method will be called at the beginning of the test case
ReportSAVAT2019Test.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportSAVAT2019Test.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportSAVAT2019Test.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportSAVAT2019Test.prototype.cleanup = function() {

}

//Income & Expenses accounting test
ReportSAVAT2019Test.prototype.testIncomeExpenses = function() {

  var banDoc = Banana.application.openDocument("file:script/../test/testcases/vat-income-expenses.ac2");
  Test.assert(banDoc);

  this.report_test(banDoc, "2019-01-01", "2019-12-31", "Whole year report");
  this.report_test(banDoc, "2019-01-01", "2019-03-31", "First quarter report");
  this.report_test(banDoc, "2019-04-01", "2019-06-30", "Second quarter report");
  this.report_test(banDoc, "2019-07-01", "2019-09-30", "Third quarter report");
  this.report_test(banDoc, "2019-10-01", "2019-12-31", "Fourth quarter report");
  this.report_test(banDoc, "2019-01-01", "2019-01-31", "January report");

}

//Double entry accounting test
ReportSAVAT2019Test.prototype.testDoubleEntry = function() {
   
  var banDoc = Banana.application.openDocument("file:script/../test/testcases/vat-double-accrual.ac2");
  Test.assert(banDoc);

  this.report_test(banDoc, "2019-01-01", "2019-12-31", "Whole year report");
  this.report_test(banDoc, "2019-01-01", "2019-03-31", "First quarter report");
  this.report_test(banDoc, "2019-04-01", "2019-06-30", "Second quarter report");
  this.report_test(banDoc, "2019-07-01", "2019-09-30", "Third quarter report");
  this.report_test(banDoc, "2019-10-01", "2019-12-31", "Fourth quarter report");
  this.report_test(banDoc, "2019-01-01", "2019-01-31", "January report");
 
}

//Function that create the report for the test
ReportSAVAT2019Test.prototype.report_test = function(banDoc, startDate, endDate, reportName) {
	var param = {};
	param.startDate = startDate;
	param.endDate = endDate;
	var vatReport = createVatReport(param, banDoc);
	Test.logger.addReport(reportName, vatReport);
}

