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
// @pubdate = 2017-12-27
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
  Javascript test

  virtual void addTestBegin(const QString& key, const QString& comment = QString());
  virtual void addTestEnd();

  virtual void addSection(const QString& key);
  virtual void addSubSection(const QString& key);
  virtual void addSubSubSection(const QString& key);

  virtual void addComment(const QString& comment);
  virtual void addInfo(const QString& key, const QString& value1, const QString& value2 = QString(), const QString& value3 = QString());
  virtual void addFatalError(const QString& error);
  virtual void addKeyValue(const QString& key, const QString& value, const QString& comment = QString());
  virtual void addReport(const QString& key, QJSValue report, const QString& comment = QString());
  virtual void addTable(const QString& key, QJSValue table, QStringList colXmlNames = QStringList(), const QString& comment = QString());

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

// All methods starting wiht 'test' will be executed
ReportSAVAT2018Test.prototype.testIncomeExpenses = function() {
	Test.logger.addComment("Test vatreport_ef1q2018_incomeexpenses");

  var fileAC2 = "file:script/../test/testcases/vat-income-expenses.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  //Banana.console.log("bandoc : " + banDoc);
  if (!banDoc) {return;}

  Test.logger.addSection("Actual");

  //Test year
  Test.logger.addSubSection("Whole year report");
  aggiungiReport(banDoc, "2018-01-01", "2018-12-31", "Whole year report");

  //Test 1. quarter
  Test.logger.addSubSection("First quarter report");
  aggiungiReport(banDoc, "2018-01-01", "2018-03-31", "First quarter report");

  //Test 2. quarter
  Test.logger.addSubSection("Second quarter report");
  aggiungiReport(banDoc, "2018-04-01", "2018-06-30", "Second quarter report");

  //Test 3. quarter
  Test.logger.addSubSection("Third quarter report");
  aggiungiReport(banDoc, "2018-07-01", "2018-09-30", "Third quarter report");

  //Test 4. quarter
  Test.logger.addSubSection("Fourth quarter report");
  aggiungiReport(banDoc, "2018-10-01", "2018-12-31", "Fourth quarter report");
  
  //Test January
  Test.logger.addSubSection("January report");
  aggiungiReport(banDoc, "2018-01-01", "2018-01-31", "January report");
  }

ReportSAVAT2018Test.prototype.testDoubleEntry = function() {
   
  Test.logger.addComment("Test vatreport_ef1q2018_doubleentry");

  var fileAC2 = "file:script/../test/testcases/vat-double-accrual.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  Banana.console.log("bandoc : " + banDoc);
  if (!banDoc) {return;}

  Test.logger.addSection("Actual");

  //Test year
  Test.logger.addSubSection("Whole year report");
  aggiungiReport(banDoc, "2018-01-01", "2018-12-31", "Whole year report");

  //Test 1. quarter
  Test.logger.addSubSection("First quarter report");
  aggiungiReport(banDoc, "2018-01-01", "2018-03-31", "First quarter report");

  //Test 2. quarter
  Test.logger.addSubSection("Second quarter report");
  aggiungiReport(banDoc, "2018-04-01", "2018-06-30", "Second quarter report");

  //Test 3. quarter
  Test.logger.addSubSection("Third quarter report");
  aggiungiReport(banDoc, "2018-07-01", "2018-09-30", "Third quarter report");

  //Test 4. quarter
  Test.logger.addSubSection("Fourth quarter report");
  aggiungiReport(banDoc, "2018-10-01", "2018-12-31", "Fourth quarter report");
  
  //Test January
  Test.logger.addSubSection("January report");
  aggiungiReport(banDoc, "2018-01-01", "2018-01-31", "January report");
  
}

//Function that create the report for the test
function aggiungiReport(banDoc, startDate, endDate, reportName) {
	var param = {};
  var vatReport = createVatReport(param, banDoc, startDate, endDate);
  Test.logger.addReport(reportName, vatReport);
}

