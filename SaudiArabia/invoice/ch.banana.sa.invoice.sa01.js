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
// @id = ch.banana.sa.invoice.sa01
// @api = 1.0
// @pubdate = 2018-04-30
// @publisher = Banana.ch SA
// @description = [SA01] Saudi Arabia Tax Invoice (BETA)
// @description.en = [SA01] Saudi Arabia Tax Invoice (BETA)
// @doctype = *
// @task = report.customer.invoice

/**
   SUMMARY
   =======
   Invoice template for the Saudi Arabia
*/

var rowNumber = 0;
var pageNr = 1;
var repTableObj = "";
var max_items_per_page = "";
var isFirstPage = true;
var invoiceTotalWritten = false;


/*Update script's parameters*/
function settingsDialog() {

   var param = initParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      param = JSON.parse(savedParam);
   }
   param = verifyParam(param);

   if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
      param = Banana.Ui.openPropertyEditor('Settings', convertParam(param));
      if (!param)
         return;
   } 
   else {
   	  var texts = setInvoiceTexts(param.language); //default 'en'
      param.language = Banana.Ui.getText('Settings', texts.param_language, param.language);
      if (param.language === undefined)
         return;
      texts = setInvoiceTexts(param.language);
	  
      param.print_header = Banana.Ui.getInt('Settings', texts.param_print_header, param.print_header);
      if (param.print_header === undefined)
         return;

      var logoFound = findLogo();
      if (!logoFound) {
         param.image_height = Banana.Ui.getInt('Settings', texts.param_image_height, param.image_height);
         if (param.image_height === undefined)
            return;
      }

      param.color_1 = Banana.Ui.getText('Settings', texts.param_color_1, param.color_1);
      if (param.color_1 === undefined)
         return;

      param.color_2 = Banana.Ui.getText('Settings', texts.param_color_2, param.color_2);
      if (param.color_2 === undefined)
         return;
   }

   var paramToString = JSON.stringify(param);
   var value = Banana.document.setScriptSettings(paramToString);
}

function convertParam(param) {
   var texts = setInvoiceTexts(param.language);

   var convertedParam = {};
   convertedParam.version = '1.0';
   convertedParam.data = []; /*array dei parametri dello script*/

   currentParam = {};
   currentParam.name = 'language';
   currentParam.title = texts.param_language;
   currentParam.type = 'string';
   currentParam.value = '';
   if (param.language === 'en') {
      currentParam.value = 'en';
   } else {
   	  currentParam.value = 'ar';
   }
   var paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);
   //texts = setInvoiceTexts(currentParam.value);

   currentParam = {};
   currentParam.name = 'print_header';
   currentParam.title = texts.param_print_header;
   currentParam.type = 'bool';
   currentParam.value = false;
   if (param.print_header)
      currentParam.value = true;
   var paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);

   currentParam = {};
   currentParam.name = 'font_family';
   currentParam.title = texts.param_font_family;
   currentParam.type = 'string';
   currentParam.value = '';
   if (param.font_family)
      currentParam.value = param.font_family;
   paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);

   currentParam = {};
   currentParam.name = 'color_1';
   currentParam.title = texts.param_color_1;
   currentParam.type = 'string';
   currentParam.value = '#0066CC';
   if (param.color_1)
      currentParam.value = param.color_1;
   paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);

   currentParam = {};
   currentParam.name = 'color_2';
   currentParam.title = texts.param_color_2;
   currentParam.type = 'string';
   currentParam.value = '#F0F8FF';
   if (param.color_2)
      currentParam.value = param.color_2;
   paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);

   currentParam = {};
   currentParam.name = 'image_height';
   currentParam.title = texts.param_image_height;
   currentParam.type = 'number';
   currentParam.value = '20';
   if (param.image_height)
      currentParam.value = param.image_height;
   paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);

   return convertedParam;
}

function initParam() {
   var param = {};
   param.language = 'en';
   param.print_header = true;
   param.font_family = '';
   param.color_1 = '#0066CC';
   param.color_2 = '#F0F8FF';
   param.color_3 = '';
   param.color_4 = '';
   param.color_5 = '';
   param.image_height = '20';
   return param;
}

function verifyParam(param) {
   if (!param.language)
      param.language = 'en';
   if (!param.print_header)
      param.print_header = false;
   if (!param.font_family)
      param.font_family = '';
   if (!param.color_1)
      param.color_1 = '#0066CC';
   if (!param.color_2)
      param.color_2 = '#F0F8FF';
   if (!param.color_3)
      param.color_3 = '';
   if (!param.color_4)
      param.color_4 = '';
   if (!param.color_5)
      param.color_5 = '';
   if (!param.image_height)
      param.image_height = '20';

   return param;
}

function printDocument(jsonInvoice, repDocObj, repStyleObj) {
   var param = initParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      param = JSON.parse(savedParam);
      param = verifyParam(param);
   }
   repDocObj = printInvoice(jsonInvoice, repDocObj, param, repStyleObj);
   setInvoiceStyle(repDocObj, repStyleObj, param);
}

function findLogo() {
   //Return true if there is a defined logo (not in table documents)
   var requiredVersion = "9.0.3";
   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0 && Banana.Report.logoFormat("Logo")) { // Banana version >= 9.0.3 and there is a defined logo
      return true;   
   }
   else {
      return false;
   }
}

function printInvoice(jsonInvoice, repDocObj, param, repStyleObj) {
   // jsonInvoice can be a json string or a js object
   var invoiceObj = null;
   if (typeof(jsonInvoice) === 'object') {
      invoiceObj = jsonInvoice;
   } else if (typeof(jsonInvoice) === 'string') {
      invoiceObj = JSON.parse(jsonInvoice)
   }

   // Invoice texts which need translation
   var langDoc = param.language;
   var texts = setInvoiceTexts(langDoc);  //Default texts

   // Invoice document
   var reportObj = Banana.Report;

   if (!repDocObj) {
      repDocObj = reportObj.newReport(getTitle(invoiceObj, texts) + ": " + invoiceObj.document_info.number);
   } else {
      var pageBreak = repDocObj.addPageBreak();
      pageBreak.addClass("pageReset");
   }


   /**********************
    1. HEADER
   **********************/
   var tab = repDocObj.addTable("header_table");
   var col1 = tab.addColumn("headerCol1");
   var col2 = tab.addColumn("headerCol2");
   var headerLogoSection = repDocObj.addSection("");

   if (param.print_header) {

      var logoFound = findLogo();
      if (logoFound) { //A logo is defined: we use it as default
         var logoFormat = Banana.Report.logoFormat("Logo");
         var logoElement = logoFormat.createDocNode(headerLogoSection, repStyleObj, "logo");
         repDocObj.getHeader().addChild(logoElement);
      }
      else { //No logo defined or Banana version older than 9.0.3: we use logo of the Documents table
         repDocObj.addImage("documents:logo", "logoStyle");
      }

      tableRow = tab.addRow();
      var cell1 = tableRow.addCell("", "");
      var cell2 = tableRow.addCell("", "amount");

      cell2.addParagraph(" ", "");
      var business_name = '';
      if (invoiceObj.supplier_info.business_name) {
         business_name = invoiceObj.supplier_info.business_name;
      }
      if (business_name.length <= 0) {
         if (invoiceObj.supplier_info.first_name) {
            business_name = invoiceObj.supplier_info.first_name + " ";
         }
         if (invoiceObj.supplier_info.last_name) {
            business_name += invoiceObj.supplier_info.last_name;
         }
      }
      cell2.addParagraph(business_name, "bigLogo timeNewRoman", 1);
      cell2.addParagraph(" ", "");

      var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info, texts, langDoc).split('\n');
      for (var i = 0; i < supplierLines.length; i++) {
         var t = tab.getHeader().addRow();
         cell2.addParagraph(supplierLines[i], "company_name", 2);
      }
   } else {
      tableRow = tab.addRow();
      var cell1 = tableRow.addCell("", "");
      var cell2 = tableRow.addCell("", "");
      cell1.addParagraph(" ", "");
      cell2.addParagraph(" ", "");
   }


   /**********************
     2. INVOICE TEXTS INFO
   **********************/
   var infoTable = repDocObj.addTable("info_table");
   var col1 = infoTable.addColumn("infoCol1");
   var col2 = infoTable.addColumn("infoCol2");

   tableRow = infoTable.addRow();
   tableRow.addCell(getTitle(invoiceObj, texts), "", 1);
   tableRow.addCell(invoiceObj.document_info.number, "", 1);

   tableRow = infoTable.addRow();
   var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);
   tableRow.addCell(texts.date, "", 1);
   tableRow.addCell(invoiceDate, "", 1);

   tableRow = infoTable.addRow();
   tableRow.addCell(texts.customer, "", 1);
   tableRow.addCell(invoiceObj.customer_info.number, "", 1);
   //Payment Terms
   var payment_terms_label = texts.payment_terms_label;
   var payment_terms = '';
   if (invoiceObj.billing_info.payment_term) {
     payment_terms = invoiceObj.billing_info.payment_term;
   } else if (invoiceObj.payment_info.due_date) {
     payment_terms_label = texts.payment_due_date_label
     payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
   }
   tableRow = infoTable.addRow();
   tableRow.addCell(payment_terms_label, "", 1);
   tableRow.addCell(payment_terms, "", 1);

   tableRow = infoTable.addRow();
   tableRow.addCell(texts.vat_number, "", 1);
   tableRow.addCell(invoiceObj.supplier_info.vat_number, "", 1);

   tableRow = infoTable.addRow();
   tableRow.addCell(texts.page, "", 1);
   tableRow.addCell(pageNr, "", 1);



   /**********************
     3. ADDRESS
   **********************/
   //shipping address
   var addressLines = getInvoiceAddress(invoiceObj.customer_info).split('\n');
   var repShippingObj = repDocObj.addSection("address_shipping");
   if (invoiceObj.shipping_info && invoiceObj.shipping_info.different_shipping_address == true)
      addressLines = getInvoiceAddress(invoiceObj.shipping_info).split('\n');
   for (var i = 0; i < addressLines.length; i++) {
      repShippingObj.addParagraph(addressLines[i], "");
   }


   /********************** 
    4. TEXT BEGIN
   **********************/
   if (invoiceObj.document_info.text_begin) {
      repDocObj.addParagraph(invoiceObj.document_info.text_begin, "begin_text");
   }


   /**********************
     5. TABLE ITEMS
   **********************/
   repTableObj = repDocObj.addTable("doc_table");

   var repTableCol1 = repTableObj.addColumn("repTableCol1"); /* description */
   var repTableCol2 = repTableObj.addColumn("repTableCol2"); /* quantity */
   var repTableCol3 = repTableObj.addColumn("repTableCol3"); /* currency */
   var repTableCol4 = repTableObj.addColumn("repTableCol4"); /* unit price */
   var repTableCol5 = repTableObj.addColumn("repTableCol5"); /* amount */

   rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, langDoc);
   var dd = repTableObj.getHeader().addRow();
   dd.addCell(texts.description, "bold border-top-black border-bottom-black padding-top padding-bottom padding-left", 1);
   dd.addCell(texts.qty, "bold border-top-black border-bottom-black padding-top padding-bottom padding-right amount", 1);
   dd.addCell(texts.currency, "bold border-top-black border-bottom-black padding-top padding-bottom padding-right center", 1);
   dd.addCell(texts.unit_price, "bold  border-top-black border-bottom-black amount padding-top padding-bottom padding-right", 1);
   dd.addCell(texts.amount, "bold border-top-black border-bottom-black amount padding-top padding-bottom padding-right", 1);


   //ITEMS
   for (var i = 0; i < invoiceObj.items.length; i++) {
      var item = invoiceObj.items[i];

      var className = "item_cell";
      if (item.item_type && item.item_type.indexOf("total") === 0) {
         className = "subtotal_cell";
      }
      if (item.item_type && item.item_type.indexOf("note") === 0) {
         className = "note_cell";
      }

      var classNameEvenRow = "";
      if (i % 2 == 0) {
         classNameEvenRow = "evenRowsBackgroundColor";
      }

      rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, langDoc);
      tableRow = repTableObj.addRow();

      var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left " + className, 1);
      descriptionCell.addParagraph(item.description);
      descriptionCell.addParagraph(item.description2);
      if (className == "note_cell") {
         tableRow.addCell("", classNameEvenRow + " padding-left padding-right thin-border-top " + className, 3);
      } else if (className == "subtotal_cell") {
         tableRow.addCell("", classNameEvenRow + " amount padding-right " + className, 2);
         tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), classNameEvenRow + " amount padding-right " + className, 1);
      } else {
         tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity), classNameEvenRow + " amount padding-right " + className, 1);
         tableRow.addCell(invoiceObj.document_info.currency, classNameEvenRow + " center", 1);
         tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive), classNameEvenRow + " amount padding-right " + className, 1);
         tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), classNameEvenRow + " amount padding-right " + className, 1);
      }
   }


   //TOTAL NET
   if (invoiceObj.billing_info.total_vat_rates.length > 0) {

      rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, langDoc);
      tableRow = repTableObj.addRow();
      tableRow.addCell("", "horizontalLine-black", 1)
      tableRow.addCell(texts.totalnet, "horizontalLine-black", 2);
      tableRow.addCell(invoiceObj.document_info.currency, "horizontalLine-black center", 1)
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "horizontalLine-black amount padding-right", 1);

      for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {

         rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, langDoc);
         tableRow = repTableObj.addRow();
         tableRow.addCell("", "", 1);
         tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%", " padding-right", 2);
         tableRow.addCell(invoiceObj.document_info.currency, "center", 1);
         tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount), "amount vat_amount padding-right", 1);
      }
   }


   //TOTAL ROUNDING DIFFERENCE
   if (invoiceObj.billing_info.total_rounding_difference.length) {
      rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, langDoc);
      tableRow = repTableObj.addRow();
      tableRow.addCell(" ", "", 1);
      tableRow.addCell(texts.rounding, "padding-right", 1);
      tableRow.addCell(invoiceObj.document_info.currency, "center", 1)
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "amount padding-right", 1);
   }


   //FINAL TOTAL
   rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, langDoc);
   tableRow = repTableObj.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell(texts.totalamount, "bold horizontalLine-black horizontalLineTotal-black ", 2);
   tableRow.addCell(invoiceObj.document_info.currency, "bold horizontalLine-black horizontalLineTotal-black center", 1);
   tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "bold amount horizontalLine-black horizontalLineTotal-black padding-right", 1);
   invoiceTotalWritten = true;

   

   /**********************
    6. NOTES
   **********************/
   for (var i = 0; i < invoiceObj.note.length; i++) {
      if (invoiceObj.note[i].description) {
         rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, langDoc);
         tableRow = repTableObj.addRow();
         tableRow.addCell(invoiceObj.note[i].description, "", 5);
      }
   }

   /**********************
    7. GREETINGS
   **********************/
   if (invoiceObj.document_info.greetings) {
      rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, langDoc);
      tableRow = repTableObj.addRow();
      tableRow.addCell(invoiceObj.document_info.greetings, "", 5);
   }

   /**********************
    8. TEMPLATE PARAMS
   **********************/
   //Default text starts with "(" and ends with ")" (default), (Vorderfiniert)
   if (invoiceObj.template_parameters && invoiceObj.template_parameters.footer_texts) {
      var lang = '';

      /* If any language is specified on the "Language" cell of the Account-Address table
      we use the final text contained in the "(default)"*/
      if (invoiceObj.customer_info.lang) {
      	lang = 'ar';
      }
      /* If any language is specified in the "Language" cell of the Account-Address table
      we use the final text contained in the "en" */
      else {
      	lang = 'en';
      }

      var textDefault = [];
      var text = [];
      for (var i = 0; i < invoiceObj.template_parameters.footer_texts.length; i++) {
         var textLang = invoiceObj.template_parameters.footer_texts[i].lang;
         if (textLang.indexOf('(') === 0 && textLang.indexOf(')') === textLang.length - 1) {
            textDefault = invoiceObj.template_parameters.footer_texts[i].text;
         } else if (textLang == lang) {
            text = invoiceObj.template_parameters.footer_texts[i].text;
         }
      }
      if (text.join().length <= 0)
         text = textDefault;
      for (var i = 0; i < text.length; i++) {
         rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, langDoc);
         tableRow = repTableObj.addRow();
         if (lang === 'ar') {
            tableRow.addCell(text[i], "", 5); // align right?
     	 }
     	 else {
     	 	tableRow.addCell(text[i], "", 5);
     	 }
      }
   }

   return repDocObj;
}

function toInvoiceAmountFormat(invoice, value) {

   return Banana.Converter.toLocaleNumberFormat(value, invoice.document_info.decimals_amounts, true);
}

function getInvoiceAddress(invoiceAddress) {

   var address = "";

   if (invoiceAddress.courtesy) {
      address = invoiceAddress.courtesy + "\n";
   }

   if (invoiceAddress.first_name || invoiceAddress.last_name) {
      if (invoiceAddress.first_name) {
         address = address + invoiceAddress.first_name + " ";
      }
      if (invoiceAddress.last_name) {
         address = address + invoiceAddress.last_name;
      }
      address = address + "\n";
   }

   if (invoiceAddress.business_name) {
      address = address + invoiceAddress.business_name + "\n";
   }

   if (invoiceAddress.address1) {
      address = address + invoiceAddress.address1 + "\n";
   }

   if (invoiceAddress.address2) {
      address = address + invoiceAddress.address2 + "\n";
   }

   if (invoiceAddress.address3) {
      address = address + invoiceAddress.address3 + "\n";
   }

   if (invoiceAddress.postal_code) {
      address = address + invoiceAddress.postal_code + " ";
   }

   if (invoiceAddress.city) {
      address = address + invoiceAddress.city + "\n";
   }

   if (invoiceAddress.country) {
      address = address + invoiceAddress.country + "\n";
   }

   if (invoiceAddress.phone) {
      address = address + invoiceAddress.phone + "\n";
   }

   if (invoiceAddress.email) {
      address = address + invoiceAddress.email;
   }

   return address;
}

function getInvoiceSupplier(invoiceSupplier, texts, language) {
   
   /* 
      Pinco Pallino, Via Trevano 7a, Tel: 1234567890, Fax: 1234567890, Email: abc@abc.com
   */

	var supplierAddressRow1 = "";
	var supplierAddress = "";

	if (invoiceSupplier.first_name) {
		supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.first_name + " ";
	}

	if (invoiceSupplier.last_name) {
		supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.last_name + ", ";
	}

	// if (supplierAddressRow1.length <= 0) {
	//    if (invoiceSupplier.business_name) {
	//       supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.business_name + ", ";
	//    }
	// }

	if (invoiceSupplier.address1) {
		supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.address1 + ", ";
	}

	if (invoiceSupplier.address2) {
		supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.address2 + ", ";
	}

	// if (invoiceSupplier.postal_code) {
	//    supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.postal_code + " ";
	// }

	// if (invoiceSupplier.city) {
	//    supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.city + ", ";
	// }

	// if (invoiceSupplier.country) {
	//    supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.country + ", ";
	// }

	if (invoiceSupplier.phone) {
		supplierAddressRow1 = supplierAddressRow1 + texts.phone + ": " + invoiceSupplier.phone + ", ";
	}

	if (invoiceSupplier.fax) {
		supplierAddressRow1 = supplierAddressRow1 + texts.fax + ": " + invoiceSupplier.fax + ", ";
	}

	if (invoiceSupplier.email) {
		supplierAddressRow1 = supplierAddressRow1 + texts.email + ": " + invoiceSupplier.email;
	}
	
	//Remove last character if it is a ","
	var str = supplierAddressRow1.trim();
	var lastChar = str[str.length - 1];
	if (lastChar === ",") {
		supplierAddressRow1 = str.slice(0, -1);
	}

	//Final address (row1 + row2 + row3)
	supplierAddress = supplierAddress + supplierAddressRow1; // + "\n" + supplierAddressRow3;
	return supplierAddress;
}

function getTitle(invoiceObj, texts) {
   var documentTitle = texts.invoice;
   if (invoiceObj.document_info.title) {
      documentTitle = invoiceObj.document_info.title;
   }
   return documentTitle;
}

function checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber, language) {

   if (isFirstPage) { // page 1

      max_items_per_page = 25;

      if (rowNumber <= max_items_per_page) {
         rowNumber++;
         return rowNumber;
      } else {
         repDocObj.addPageBreak();
         pageNr++;

         printInvoiceDetails(invoiceObj, repDocObj, param, texts, rowNumber, language);
         printItemsHeader(invoiceObj, repDocObj, param, texts, rowNumber, language);

         isFirstPage = false;
         return 0; //row counter = 0
      }
   } else { // page 2+

      max_items_per_page = 35;

      if (rowNumber <= max_items_per_page) {
         rowNumber++;
         return rowNumber;
      } else {
         repDocObj.addPageBreak();
         pageNr++;

         printInvoiceDetails(invoiceObj, repDocObj, param, texts, rowNumber, language);
         printItemsHeader(invoiceObj, repDocObj, param, texts, rowNumber, language);

         isFirstPage = false;
         return 0; //row counter = 0
      }
   }
}

function printInvoiceDetails(invoiceObj, repDocObj, param, texts, rowNumber, language) {
	//
	// INVOICE DETAILS
	//
	var infoTable = repDocObj.addTable("info_table_row0");
	var col1 = infoTable.addColumn("infoCol1");
	var col2 = infoTable.addColumn("infoCol2");

	tableRow = infoTable.addRow();
	tableRow.addCell(getTitle(invoiceObj, texts), "", 1);
	tableRow.addCell(invoiceObj.document_info.number, "", 1);

	tableRow = infoTable.addRow();
	var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);
	tableRow.addCell(texts.date, "", 1);
	tableRow.addCell(invoiceDate, "", 1);

	tableRow = infoTable.addRow();
	tableRow.addCell(texts.customer, "", 1);
	tableRow.addCell(invoiceObj.customer_info.number, "", 1);
	//Payment Terms
	var payment_terms_label = texts.payment_terms_label;
	var payment_terms = '';
	if (invoiceObj.billing_info.payment_term) {
	  payment_terms = invoiceObj.billing_info.payment_term;
	} else if (invoiceObj.payment_info.due_date) {
	  payment_terms_label = texts.payment_due_date_label
	  payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
	}
	tableRow = infoTable.addRow();
	tableRow.addCell(payment_terms_label, "", 1);
	tableRow.addCell(payment_terms, "", 1);

	tableRow = infoTable.addRow();
	tableRow.addCell(texts.vat_number, "", 1);
	tableRow.addCell(invoiceObj.supplier_info.vat_number, "", 1);

	tableRow = infoTable.addRow();
	tableRow.addCell(texts.page, "", 1);
	tableRow.addCell(pageNr, "", 1);
}

function printItemsHeader(invoiceObj, repDocObj, param, texts, rowNumber, language) {
	//
	// ITEMS TABLE
	//
	repTableObj = repDocObj.addTable("doc_table_row0");
	
	var repTableCol1 = repTableObj.addColumn("repTableCol1"); /* description */
	var repTableCol2 = repTableObj.addColumn("repTableCol2"); /* quantity */
	var repTableCol3 = repTableObj.addColumn("repTableCol3"); /* currency */
	var repTableCol4 = repTableObj.addColumn("repTableCol4"); /* unit price */
	var repTableCol5 = repTableObj.addColumn("repTableCol5"); /* amount */

	/* If the invoice total has not yet been written, we add the table header
	   If the invoice total has already been written, we do not add the table header */
	if (!invoiceTotalWritten) {
		var dd = repTableObj.getHeader().addRow();
		dd.addCell(texts.description, "bold border-top-black border-bottom-black padding-top padding-bottom padding-left", 1);
		dd.addCell(texts.qty, "bold border-top-black border-bottom-black padding-top padding-bottom padding-right amount", 1);
		dd.addCell(texts.currency, "bold border-top-black border-bottom-black padding-top padding-bottom padding-right center", 1);
		dd.addCell(texts.unit_price, "bold  border-top-black border-bottom-black amount padding-top padding-bottom padding-right", 1);
		dd.addCell(texts.amount, "bold border-top-black border-bottom-black amount padding-top padding-bottom padding-right", 1);
	}
}

//====================================================================//
// STYLES
//====================================================================//
function setInvoiceStyle(reportObj, repStyleObj, param) {

   if (!repStyleObj) {
      repStyleObj = reportObj.newStyleSheet();
   }

   //Set default values
   if (!param.font_family) {
      param.font_family = "Helvetica";
   }

   if (!param.color_1) {
      param.color_1 = "#0066CC";
   }

   if (!param.color_2) {
      param.color_2 = "#FFD100";
   }

   if (!param.color_2) {
      param.color_2 = "#F0F8FF";
   }

   if (!param.color_4) {
      param.color_4 = "";
   }

   if (!param.color_5) {
      param.color_5 = "";
   }

   if (!param.image_height) {
      param.image_height = "20";
   }

   //====================================================================//
   // GENERAL
   //====================================================================//
   repStyleObj.addStyle(".pageReset", "counter-reset: page");
   repStyleObj.addStyle("body", "font-size: 12pt; font-family:" + param.font_family);
   repStyleObj.addStyle(".logo", "font-size: 24pt");
   repStyleObj.addStyle(".bigLogo", "font-size: 32pt; color:" + param.color_1);
   repStyleObj.addStyle(".company_name", "font-size: 9pt");
   repStyleObj.addStyle(".info", "font-size: 10pt");
   repStyleObj.addStyle(".bold", "font-weight: bold");

   repStyleObj.addStyle(".horizontalLine-black", "border-top : thin solid #000000");
   repStyleObj.addStyle(".horizontalLineTotal-black", "border-bottom : 1px double #000000; padding-bottom:5px");

   repStyleObj.addStyle(".center", "text-align:center");
   repStyleObj.addStyle(".amount", "text-align:right");
   repStyleObj.addStyle(".description2", "font-size: 8pt;");
   repStyleObj.addStyle(".subtotal_cell", "font-weight:bold;");

   repStyleObj.addStyle(".border-left-black", "border-left:thin solid #000000");
   repStyleObj.addStyle(".border-right-black", "border-right:thin solid #000000");
   repStyleObj.addStyle(".border-top-black", "border-top:thin solid #000000");
   repStyleObj.addStyle(".border-bottom-black", "border-bottom:thin solid #000000");

   repStyleObj.addStyle(".fontSize17", "font-size:17pt");
   repStyleObj.addStyle(".padding-top", "padding-top:5px");
   repStyleObj.addStyle(".padding-right", "padding-right:5px");
   repStyleObj.addStyle(".padding-bottom", "padding-bottom:5px");
   repStyleObj.addStyle(".padding-left", "padding-left:5px");
   repStyleObj.addStyle(".timeNewRoman", "font-family:Times New Roman");
   repStyleObj.addStyle(".headerCol1", "width:30pt");
   repStyleObj.addStyle(".headerCol2", "width:70pt");
   repStyleObj.addStyle(".infoCol1", "width:129pt");
   repStyleObj.addStyle(".infoCol2", "width:129pt");
   repStyleObj.addStyle(".evenRowsBackgroundColor", "background-color: " + param.color_2);

   repStyleObj.addStyle(".repTableCol1", "width:45%");
   repStyleObj.addStyle(".repTableCol2", "width:10%");
   repStyleObj.addStyle(".repTableCol3", "width:10%");
   repStyleObj.addStyle(".repTableCol4", "width:15%");
   repStyleObj.addStyle(".repTableCol5", "width:20%");

   var resetCounterStyle = repStyleObj.addStyle(".reset-counter-page");
   resetCounterStyle.setAttribute("counter-reset", "page");

   var symbolStyle = repStyleObj.addStyle(".symbol")
   symbolStyle.setAttribute("font-size", "50pt");
   symbolStyle.setAttribute("font-family", "Californian FB");
   symbolStyle.setAttribute("text-align", "left");
   symbolStyle.setAttribute("color", param.color_1);
   symbolStyle.setAttribute("background-color", param.color_2);
   symbolStyle.setAttribute("font-weight", "bold");

   //Greetings 
   var bottomStyle = repStyleObj.addStyle(".bottom");
   bottomStyle.setAttribute("padding-top", "2em");

   //Signature
   var signatureStyle = repStyleObj.addStyle(".signature");
   signatureStyle.setAttribute("padding-top", "1.5em");


   //====================================================================//
   // 3. ADDRESS
   //====================================================================//

   /* Address */
   var addressStyle2 = repStyleObj.addStyle(".address_shipping");
   addressStyle2.setAttribute("position", "absolute");
   addressStyle2.setAttribute("top", "50mm");
   addressStyle2.setAttribute("left", "20mm");
   addressStyle2.setAttribute("width", "80mm");
   addressStyle2.setAttribute("height", "30mm");
   addressStyle2.setAttribute("font-size", "10px");

   /* Text begin */
   var beginStyle = repStyleObj.addStyle(".begin_text");
   beginStyle.setAttribute("position", "absolute");
   beginStyle.setAttribute("top", "100mm");
   beginStyle.setAttribute("left", "20mm");
   beginStyle.setAttribute("right", "10mm");
   beginStyle.setAttribute("font-size", "10px");


   //====================================================================//
   // LOGO
   //====================================================================//
   var logoStyle = repStyleObj.addStyle(".logoStyle");
   logoStyle.setAttribute("position", "absolute");
   logoStyle.setAttribute("margin-top", "10mm");
   logoStyle.setAttribute("margin-left", "20mm");
   logoStyle.setAttribute("height", param.image_height + "mm");

   var logoStyle = repStyleObj.addStyle(".logo");
   logoStyle.setAttribute("position", "absolute");
   logoStyle.setAttribute("margin-top", "10mm");
   logoStyle.setAttribute("margin-left", "20mm");

   //====================================================================//
   // 4. TABLE ITEMS
   //====================================================================//

   /* Table header */
   var headerStyle = repStyleObj.addStyle(".header_table");
   headerStyle.setAttribute("position", "absolute");
   headerStyle.setAttribute("margin-top", "5mm"); //106
   headerStyle.setAttribute("margin-left", "22mm"); //20
   headerStyle.setAttribute("margin-right", "10mm");
   //repStyleObj.addStyle("table.header_table td", "border: thin solid black");
   headerStyle.setAttribute("width", "100%");

   /* Table info invoice */
   var infoStyle = repStyleObj.addStyle(".info_table");
   infoStyle.setAttribute("position", "absolute");
   infoStyle.setAttribute("margin-top", "50mm");
   infoStyle.setAttribute("margin-left", "110mm");
   infoStyle.setAttribute("margin-right", "10mm");
   repStyleObj.addStyle("table.info_table td", "border: thin solid black");
   infoStyle.setAttribute("font-size", "10pt");

   var infoStyle = repStyleObj.addStyle(".info_table_row0");
   infoStyle.setAttribute("position", "absolute");
   infoStyle.setAttribute("margin-top", "10mm");
   infoStyle.setAttribute("margin-left", "110mm");
   infoStyle.setAttribute("margin-right", "10mm");
   repStyleObj.addStyle("table.info_table_row0 td", "border: thin solid black");
   infoStyle.setAttribute("font-size", "10pt");

   /* Table 1: */
   var itemsStyle = repStyleObj.addStyle(".doc_table");
   //itemsStyle.setAttribute("position", "absolute");
   itemsStyle.setAttribute("margin-top", "135mm"); //106
   itemsStyle.setAttribute("margin-left", "23mm"); //20
   itemsStyle.setAttribute("margin-right", "10mm");
   //itemsStyle.setAttribute("page-break-before", "avoid");
   //repStyleObj.addStyle("table.doc_table td", "padding: 3px;");
   //repStyleObj.addStyle("table.doc_table td", "border: thin solid black");
   itemsStyle.setAttribute("width", "100%");
   //itemsStyle.setAttribute("page-break-inside", "auto");

   var itemsStyle = repStyleObj.addStyle(".doc_table_row0");
   itemsStyle.setAttribute("margin-top", "60mm"); //106
   itemsStyle.setAttribute("margin-left", "23mm"); //20
   itemsStyle.setAttribute("margin-right", "10mm");
   //repStyleObj.addStyle("table.doc_table td", "border: thin solid black; padding: 3px;");
   itemsStyle.setAttribute("width", "100%");
}

function setInvoiceTexts(language) {
   var texts = {};
   if (language === "ar") {
      texts.param_language = "اللغة (en = الانجليزيه ، ar = العربية)";
      texts.customer = "رقم العميل";
      texts.date = "تاريخ";
      texts.description = "وصف";
      texts.invoice = "فاتورة الضريبة";
      texts.page = "صفحه";
      texts.rounding = "التقريب";
      texts.amount = "المبلغ";
      texts.totalnet = "المجموع الفرعي";
      texts.totalamount = "المبلغ الإجمالي";
      texts.vat = "ضريبه القيمه المضافه";
      texts.qty = "كميه";
      texts.currency = "العمله";
      texts.unit_price = "سعر الوحدة";
      texts.vat_number = "رقم ضريبة القيمة المضافة";
      texts.param_color_1 = "لون نص الراس";
      texts.param_color_2 = "لون خلفيه الصفوف";
      texts.param_image_height = "ارتفاع الصورة (مم)";
      texts.param_font_family = "نوع الخط";
      texts.param_print_header = "تضمين راس الصفحة (1 = نعم ، 0 = لا)";
      texts.payment_due_date_label = "تاريخ الاستحقاق";
      texts.payment_terms_label = "الدفع";
      texts.phone = "الهاتف";
      texts.fax = "فاكس";
      texts.email = "البريد الالكتروني";
   } else {
      texts.param_language = "Language (en = English, ar = Arabic)";
      texts.customer = "Customer No";
      texts.date = "Date";
      texts.description = "Description";
      texts.invoice = "TAX Invoice";
      texts.page = "Page";
      texts.rounding = "Rounding";
      texts.amount = "Amount";
      texts.totalnet = "Subtotal";
      texts.totalamount = "Total amount";
      texts.vat = "VAT";
      texts.qty = "Quantity";
      texts.currency = "Currency";
      texts.unit_price = "Unit price";
      texts.vat_number = "VAT Number";
      texts.param_color_1 = "Header text color";
      texts.param_color_2 = "Rows background color";
      texts.param_image_height = "Image height (mm)";
      texts.param_font_family = "Font type";
      texts.param_print_header = "Include page header (1=yes, 0=no)";
      texts.payment_due_date_label = "Due date";
      texts.payment_terms_label = "Payment";
      texts.phone = "Phone";
      texts.fax = "Fax";
      texts.email = "Email";
   }
   return texts;
}

