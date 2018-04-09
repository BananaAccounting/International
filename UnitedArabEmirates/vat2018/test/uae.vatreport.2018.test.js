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
// @pubdate = 2018-04-09
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

ReportVatUAE2018.prototype.testReport = function() {
   
  Test.logger.addComment("Test UAE VAT report 2018");

  var fileAC2 = "file:script/../test/testcases/UAE-Multicurrency-VAT.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {return;}

  Test.logger.addSection("Actual");

  //Test year
  Test.logger.addSubSection("Whole year report");
  aggiungiReport(banDoc, "2018-01-01", "2018-12-31", "Whole year report");

  //Test 1. semester
  Test.logger.addSubSection("First semester report");
  aggiungiReport(banDoc, "2018-01-01", "2018-06-30", "First semester report");

  //Test 2. semester
  Test.logger.addSubSection("Second semester report");
  aggiungiReport(banDoc, "2018-07-01", "2018-12-31", "Second semester report");

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
}

//Function that create the report for the test
function aggiungiReport(banDoc, startDate, endDate, reportName) {
  var vatReport = createVatReport(banDoc, startDate, endDate);
  Test.logger.addReport(reportName, vatReport);
}

