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


// @id = ch.banana.sa.invoice.sa01.test
// @api = 1.0
// @pubdate = 2018-04-30
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.sa.invoice.sa01.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.sa.invoice.sa01.js
// @timeout = -1


// Register test case to be executed
Test.registerTestCase(new ReportInvoiceSA01());

// Here we define the class, the name of the class is not important
function ReportInvoiceSA01() {

}

// This method will be called at the beginning of the test case
ReportInvoiceSA01.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportInvoiceSA01.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportInvoiceSA01.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportInvoiceSA01.prototype.cleanup = function() {

}

// Generate the expected (correct) file
ReportInvoiceSA01.prototype.testBananaApp = function() {

  //Open the banana document
  var banDoc = Banana.application.openDocument("file:script/../test/testcases/invoice_saudi_arabia.ac2");
  Test.assert(banDoc);

  this.report_test("50", "Test Invoice 50", "en");
  this.report_test("55", "Test Invoice 55", "ar");
  this.json_test("50");
  this.json_test("55");
}

//Function that creates the report for the test
ReportInvoiceSA01.prototype.report_test = function(invoiceNumber, reportName, language) {
  
  //Set params (normally are taken from settings)
  var param = {};
  param.language = language;
  param.print_header = true;
  param.font_family = '';
  param.color_1 = '';
  param.color_2 = '';

  var jsonInvoice = this.get_json_invoice(invoiceNumber);
  var invoiceReport = printInvoice(jsonInvoice, invoiceReport, param);

  Test.logger.addReport(reportName, invoiceReport);
}


ReportInvoiceSA01.prototype.get_json_invoice = function(invoiceNumber) {
  var file;
  var parsedfile;
  var jsonInvoice;
  
  if (invoiceNumber === "50") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_50.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
  }
  else if (invoiceNumber === "55") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_55.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
  }

  return jsonInvoice;
}

// This add a json value
ReportInvoiceSA01.prototype.json_test = function(invoiceNumber) {
  var obj = this.get_json_invoice(invoiceNumber);
  Test.logger.addJson("JSON of invoice " + invoiceNumber, JSON.stringify(obj));
}
