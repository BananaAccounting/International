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
// @id = ch.banana.ca.invoice.canada01
// @api = 1.0
// @pubdate = 2018-04-06
// @publisher = Banana.ch SA
// @description = Style 1: Canada invoice 01
// @description.en = Style 1: Canada invoice 01
// @doctype = *
// @task = report.customer.invoice

var rowNumber = 0;
var pageNr = 1;
var repTableObj = "";
var max_items_per_page = 20;

/*Update script's parameters*/
function settingsDialog() {
	var param = initParam();
	var savedParam = Banana.document.getScriptSettings();
	if (savedParam.length > 0) {
	  param = JSON.parse(savedParam);
	}
	param = verifyParam(param);

   if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
      param = Banana.Ui.openPropertyEditor('Settings', convertParam(param));
      if (!param)
         return;
   }
   else {
	var lang = Banana.document.locale;
	if (lang.length > 2)
	  lang = lang.substr(0, 2);
	var texts = setInvoiceTexts(lang);

	param.print_header = Banana.Ui.getInt('Settings', texts.param_print_header, param.print_header);
	if (param.print_header === undefined)
	  return;
	param.print_paymentslip = Banana.Ui.getInt('Settings', texts.param_print_paymentslip, param.print_paymentslip);
	if (param.print_paymentslip === undefined)
	  return;

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
   var lang = 'en';
   if (Banana.document.locale)
     lang = Banana.document.locale;
   if (lang.length > 2)
      lang = lang.substr(0, 2);
   var texts = setInvoiceTexts(lang);

   var convertedParam = {};
   convertedParam.version = '1.0';
   /*array dei parametri dello script*/
   convertedParam.data = [];
   
   var currentParam = {};
   currentParam.name = 'print_header';
   currentParam.title = texts.param_print_header;
   currentParam.type = 'bool';
   currentParam.value = false;
   if (param.print_header)
     currentParam.value = true;
   var paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);

   var currentParam = {};
   currentParam.name = 'print_paymentslip';
   currentParam.title = texts.param_print_paymentslip;
   currentParam.type = 'bool';
   currentParam.value = false;
   if (param.print_paymentslip)
     currentParam.value = true;
   var paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);

   currentParam = {};
   currentParam.name = 'color_1';
   currentParam.title = texts.param_color_1;
   currentParam.type = 'string';
   currentParam.value = '#d8e4e8';
   if (param.color_1)
     currentParam.value = param.color_1;
   paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);

   currentParam = {};
   currentParam.name = 'color_2';
   currentParam.title = texts.param_color_2;
   currentParam.type = 'string';
   currentParam.value = '#000000';
   if (param.color_2)
     currentParam.value = param.color_2;
   paramToString = JSON.stringify(currentParam);
   convertedParam.data.push(paramToString);

   return convertedParam;
}

function initParam() {
	var param = {};
	param.print_header = true;
	param.print_paymentslip = false;
	param.font_family = ' Arial ';
	param.color_1 = '#d8e4e8';
	param.color_2 = '#000000';
	param.color_3 = '';
	param.color_4 = '';
	param.color_5 = '';
	return param;
}

function verifyParam(param) {
	if (!param.print_header)
	  param.print_header = false;
	if (!param.print_paymentslip)
	  param.print_paymentslip = false;
	if (!param.font_family)
	  param.font_family = '';
	if (!param.color_1)
	  param.color_1 = '#005392';
	if (!param.color_2)
	  param.color_2 = '#ffffff';
	if (!param.color_3)
	  param.color_3 = '';
	if (!param.color_4)
	  param.color_4 = '';
	if (!param.color_5)
	  param.color_5 = '';

	return param;
}

function printDocument(jsonInvoice, repDocObj, repStyleObj) {
	var param = initParam();
	var savedParam = Banana.document.getScriptSettings();
	if (savedParam.length > 0) {
	  param = JSON.parse(savedParam);
	  param = verifyParam(param);
	}
	repDocObj = printInvoice(jsonInvoice, repDocObj, param);
	setInvoiceStyle(repDocObj, repStyleObj, param);
}

function printInvoice(jsonInvoice, repDocObj, param) {
	// jsonInvoice can be a json string or a js object

	var invoiceObj = null;
	if (typeof(jsonInvoice) === 'object') {
		invoiceObj = jsonInvoice;
	} else if (typeof(jsonInvoice) === 'string') {
		invoiceObj = JSON.parse(jsonInvoice)
	}

	// Invoice texts which need translation
	var langDoc = '';
	if (invoiceObj.customer_info.lang)
		langDoc = invoiceObj.customer_info.lang;
	if (langDoc.length <= 0)
		langDoc = invoiceObj.document_info.locale;
	var texts = setInvoiceTexts(langDoc);

	// Invoice document
	var reportObj = Banana.Report;

	if (!repDocObj) {
		repDocObj = reportObj.newReport(getTitle(invoiceObj, texts) + ": " + invoiceObj.document_info.number);
	} else {
		var pageBreak = repDocObj.addPageBreak();
		pageBreak.addClass("pageReset");
	}


	/***********
	 1. HEADER
	***********/
	if (param.print_header) {
		var tab = repDocObj.addTable("header_table");

		tableRow = tab.addRow();
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
		tableRow.addCell(business_name, "bold businessname", 1);
		tableRow.addCell("INVOICE", "right bold logo",1);
	}




	/**********************
	 3. ADDRESSES
	**********************/
	
	/**********************
	 3.1. First row
	**********************/
	var addressTable = repDocObj.addTable("address_table");
	var addressCol1 = addressTable.addColumn("addressCol1");
	var addressCol2 = addressTable.addColumn("addressCol2");
	var addressCol3 = addressTable.addColumn("addressCol3");

	tableRow = addressTable.addRow();

	var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
	var cell = tableRow.addCell("", "", 1);
	for (var i = 0; i < supplierLines.length; i++) {
		cell.addParagraph(supplierLines[i], "");
	}
	var cell2 = tableRow.addCell("", "", 1);
	cell2.addParagraph(texts.date.toUpperCase()+":","bold right");
	cell2.addParagraph(texts.invoice.toUpperCase()+" #:","bold right");
	cell2.addParagraph(texts.payment_terms_label.toUpperCase()+":","bold right");

	var cell3 = tableRow.addCell("", "", 1);
	cell3.addParagraph(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date), 'right');
	cell3.addParagraph(invoiceObj.document_info.number, 'right');
	//Payment Terms
	if (invoiceObj.billing_info.payment_term) {
	  cell3.addParagraph(invoiceObj.billing_info.payment_term, 'right');
	} else if (invoiceObj.payment_info.due_date) {
	  var payment_terms_label = texts.payment_due_date_label;
	  payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
	  cell3.addParagraph(payment_terms, 'right');
	}
	/**********************
	 3.2. Separation
	**********************/
	var addressTable = repDocObj.addTable("address_table2");
	var addressCol1 = addressTable.addColumn("addressCol21");
	var addressCol2 = addressTable.addColumn("addressCol22");
	var addressCol3 = addressTable.addColumn("addressCol23");
	tableRow = addressTable.addRow();
	cell1 = tableRow.addCell("", "", 3);
	cell1.addParagraph(" ");
	cell1.addParagraph(texts.bill_to+":", "bold")
	cell1.addParagraph(" ", "");
	
	/**********************
	 3.3. Second row
	**********************/
	
	tableRow = addressTable.addRow();
	cell1 = tableRow.addCell("", "", 1);
	var addressLines = getInvoiceAddress(invoiceObj.customer_info).split('\n');
	for (var i = 0; i < addressLines.length; i++) {
		cell1.addParagraph(addressLines[i], "");
	}

	cell2 = tableRow.addCell("", "", 1);
	cell2.addParagraph(texts.phone+":", "right");
	cell2.addParagraph(texts.fax+":", "right");
	cell2.addParagraph(texts.email+":", "right");
	cell2.addParagraph(texts.website+":", "right");   


	cell3 = tableRow.addCell("", "", 1);
	cell3.addParagraph(invoiceObj.supplier_info.phone, "right");
	cell3.addParagraph(invoiceObj.supplier_info.fax, "right");
	cell3.addParagraph(invoiceObj.supplier_info.email, "right");
	cell3.addParagraph(invoiceObj.supplier_info.web, "right");

	//Text begin
	var titleTable = "";
	if (invoiceObj.document_info.text_begin) {
	  titleTable = repDocObj.addTable("title_table1");
	  repDocObj.addParagraph(invoiceObj.document_info.text_begin, "begin_text");
	  repTableObj = repDocObj.addTable("doc_table1");
	}
	else {
	  titleTable = repDocObj.addTable("title_table");
	  repTableObj = repDocObj.addTable("doc_table");
	}

	/***************
	  4. TABLE ITEMS
	***************/
	// var titleTable = repDocObj.addTable("title_table");
	//tableRow = titleTable.addRow();
	//tableRow.addCell(getTitle(invoiceObj, texts) + " " + invoiceObj.document_info.number, "bold title");

	/***************
	  4. TABLE ITEMS
	***************/
	var repTableCol1 = repTableObj.addColumn("repTableCol1");
	var repTableCol2 = repTableObj.addColumn("repTableCol2");
	var repTableCol3 = repTableObj.addColumn("repTableCol3");



	rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
	var dd = repTableObj.getHeader().addRow();
	dd.addCell(texts.description.toUpperCase(), "padding-left items_table_header border2", 1);
	dd.addCell(texts.amount.toUpperCase(), "padding-right items_table_header amount  border2", 2);



	//ITEMS
	var lines = 0;
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
	  if (i % 2 == 1) {
		 classNameEvenRow = "evenRowsBackgroundColor";
	  }

	  rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
	  tableRow = repTableObj.addRow();

	  var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left border-left " + className, 1);
	  descriptionCell.addParagraph(item.description);
	  if(item.description.length>91){
		  lines+=Math.floor(item.description.length/91);
	  }
	  descriptionCell.addParagraph(item.description2);
	  if(item.total_amount_vat_exclusive==="")
		  tableRow.addCell("",classNameEvenRow+" border-left padding-left",1);
	  else
		  tableRow.addCell("$",classNameEvenRow+" border-left padding-left",1);
	  if (className == "note_cell") {
		 tableRow.addCell("", classNameEvenRow + " padding-left padding-right thin-border-top " + className, 1);
	  } else {
		 tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), classNameEvenRow + " padding-right amount " + className, 1);
	  }
	}
	rowNumber+=Math.floor(lines/2);
	while(rowNumber<8){
		tableRow = repTableObj.addRow();
		var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left border-left border-right" + className, 1);
		tableRow.addCell("",classNameEvenRow+" border-left padding-left",2);
		rowNumber++;
	}

	//FINAL TOTAL


	rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
	tableRow = repTableObj.addRow();
	tableRow.addCell(texts.subtotal.toUpperCase() , "padding-left right border-top ", 1);
	tableRow.addCell("$", " border-left padding-left border-top evenRowsBackgroundColor", 1);
	tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "padding-right right border-top evenRowsBackgroundColor", 1);
	rowNumber++;
	
	tableRow = repTableObj.addRow();
	tableRow.addCell(texts.HST.toUpperCase() + " # " + invoiceObj.supplier_info.vat_number, "padding-left right ", 1);
	tableRow.addCell("$", " border-left padding-left border-top evenRowsBackgroundColor", 1);
	tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_amount), "padding-right right border-top evenRowsBackgroundColor", 1);
	rowNumber++;
	
	tableRow = repTableObj.addRow();
	tableRow.addCell(texts.total.toUpperCase(), "padding-left right bold ", 1);
	tableRow.addCell("$", " border-left padding-left border-top evenRowsBackgroundColor", 1);
	tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_inclusive), "padding-right right border-top evenRowsBackgroundColor", 1);
	rowNumber++;
	
	tableRow = repTableObj.addRow();
	tableRow.addCell(texts.lessreceived.toUpperCase(), "padding-left right", 1);
	tableRow.addCell("", "border-left padding-left border-top ", 1);
	tableRow.addCell("", "padding-right right border-top ", 1);
	rowNumber++;
	
	tableRow = repTableObj.addRow();
	tableRow.addCell(texts.balancedue.toUpperCase(), "padding-left right bold ", 1);
	tableRow.addCell("$", " border-left border-bottom padding-left border-top evenRowsBackgroundColor", 1);
	tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "padding-right right bold border-bottom  border-top evenRowsBackgroundColor", 1);
	rowNumber++;
	
	/**********************
	 5. Payment slip
	**********************/
	if(param.print_paymentslip){
		max_items_per_page =15;
		rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
		
		var addressTable = repDocObj.addTable("address_table_paymentslip");
		var addressCol1 = addressTable.addColumn("addressCol1p");
		var addressCol2 = addressTable.addColumn("addressCol2p");
		var addressCol3 = addressTable.addColumn("addressCol3p");

		tableRow = addressTable.addRow();
		var cell = tableRow.addCell("REMITTANCE ADVICE", "border-top-dashed right", 4);
		tableRow = addressTable.addRow();

		
		var cell = tableRow.addCell("", "", 1);
		var addressLines = getInvoiceAddress(invoiceObj.customer_info).split('\n');
		for (var i = 0; i < addressLines.length; i++) {
			cell.addParagraph(addressLines[i], "");
		} 
		
		var cell2 = tableRow.addCell("", "", 1);
		cell2.addParagraph(" ");
		cell2.addParagraph(texts.date.toUpperCase()+":"," right");
		cell2.addParagraph(texts.invoice.toUpperCase()+" #:"," right");
		cell2.addParagraph(texts.total.toUpperCase()+":"," right");
		cell2.addParagraph(texts.balancedue.toUpperCase()+":"," right");
		tableRow.addCell(" ", "", 1);
		var cell3 = tableRow.addCell("", "", 1);
		cell3.addParagraph(" ");
		cell3.addParagraph(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date), 'right');
		cell3.addParagraph(invoiceObj.document_info.number, 'right');
		cell3.addParagraph(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_inclusive), 'right');
		cell3.addParagraph(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), 'right');
		//Payment Terms
		
		/**********************
		 3.2. Separation
		**********************/
		tableRow = addressTable.addRow();
		cell1 = tableRow.addCell("", "", 4);
		cell1.addParagraph(" ");
		cell1.addParagraph(" ");
		cell1.addParagraph(" ");
		
		/**********************
		 3.3. Second row
		**********************/
		tableRow = addressTable.addRow();
		cell1 = tableRow.addCell("", "", 4);
		var supplierLines = getInvoiceSupplierWithName(invoiceObj.supplier_info).split('\n');
		for (var i = 0; i < supplierLines.length; i++) {
			cell1.addParagraph(supplierLines[i], "");
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

	if (invoiceAddress.city) {
	  address = address + invoiceAddress.city + ", ";
	}
	
	if (invoiceAddress.state) {
	  address = address + invoiceAddress.state + " ";
	}
	
	if (invoiceAddress.postal_code) {
	  address = address + invoiceAddress.postal_code + "\n";
	}


	if (invoiceAddress.country) {
	  address = address + invoiceAddress.country;
	}

	return address;
	}

	function getInvoiceSupplier(invoiceSupplier) {

	var supplierAddress = "";

	if (invoiceSupplier.address1) {
	  supplierAddress = supplierAddress + invoiceSupplier.address1 + " \n";
	}

	if (invoiceSupplier.address2) {
	  supplierAddress = supplierAddress + invoiceSupplier.address2 + " \n";
	}
	
	if (invoiceSupplier.city) {
	  supplierAddress = supplierAddress + invoiceSupplier.city + ", ";
	}
	
	if (invoiceSupplier.state) {
	  supplierAddress = supplierAddress + invoiceSupplier.state + " ";
	}

	if (invoiceSupplier.postal_code) {
	  supplierAddress = supplierAddress + invoiceSupplier.postal_code + " ";
	}

	

	if (invoiceSupplier.country) {
	  supplierAddress = supplierAddress + invoiceSupplier.country + "  ";
	}


	return supplierAddress;
	}

	function getInvoiceSupplierWithName(invoiceSupplier) {

		var supplierAddress = "";
		if (invoiceSupplier.first_name || invoiceSupplier.last_name) {
			if (invoiceSupplier.first_name) {
				address = address + invoiceSupplier.first_name + " ";
			}
			if (invoiceSupplier.last_name) {
				address = address + invoiceSupplier.last_name;
			}
			address = address + "\n";
		}
		
		if (invoiceSupplier.business_name) {
		  supplierAddress = supplierAddress + invoiceSupplier.business_name + " \n";
		}

		if (invoiceSupplier.address1) {
		  supplierAddress = supplierAddress + invoiceSupplier.address1 + " \n";
		}

		if (invoiceSupplier.address2) {
		  supplierAddress = supplierAddress + invoiceSupplier.address2 + " \n";
		}

		if (invoiceSupplier.city) {
		  supplierAddress = supplierAddress + invoiceSupplier.city + ", ";
		}
		
		if (invoiceSupplier.state) {
		  supplierAddress = supplierAddress + invoiceSupplier.state + " ";
		}
		
		if (invoiceSupplier.postal_code) {
		  supplierAddress = supplierAddress + invoiceSupplier.postal_code + " ";
		}

		

		if (invoiceSupplier.country) {
		  supplierAddress = supplierAddress + invoiceSupplier.country + " ";
		}


		return supplierAddress;
	}

	
	//The purpose of this function is return a complete address
	function getAddressLines(jsonAddress, fullAddress) {

	var address = [];
	address.push(jsonAddress["business_name"]);

	var addressName = [jsonAddress["first_name"], jsonAddress["last_name"]];
	addressName = addressName.filter(function(n) {
		return n
	}); // remove empty items
	address.push(addressName.join(" "));

	address.push(jsonAddress["address1"]);
	if (fullAddress) {
		address.push(jsonAddress["address2"]);
		address.push(jsonAddress["address3"]);
	}

	var addressCity = [jsonAddress["postal_code"], jsonAddress["city"]].join(" ");
	if (jsonAddress["country_code"] && jsonAddress["country_code"] !== "CH")
		addressCity = [jsonAddress["country_code"], addressCity].join(" - ");
		address.push(addressCity);

		address = address.filter(function(n) {
		return n
	}); // remove empty items

	return address;
	}

	function getTitle(invoiceObj, texts) {
		var documentTitle = texts.invoice;
		if (invoiceObj.document_info.title) {
			documentTitle = invoiceObj.document_info.title;
		}
		return documentTitle;
	}

	function checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber) {
		if (rowNumber >= max_items_per_page) {
			
			repDocObj.addPageBreak();
			pageNr++;

			printInvoiceDetails(invoiceObj, repDocObj, param, texts, rowNumber);
			printItemsHeader(invoiceObj, repDocObj, param, texts, rowNumber);

			return 0;
		}

		rowNumber++;
		return rowNumber;
	}

	function printInvoiceDetails(invoiceObj, repDocObj, param, texts, rowNumber) {
		if (param.print_header) {
			var tab = repDocObj.addTable("header_table");

			tableRow = tab.addRow();
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
			tableRow.addCell(business_name, "bold businessname", 1);
			tableRow.addCell("INVOICE", "right bold logo",1);
		}
		var addressTable = repDocObj.addTable("address_table");
		var addressCol1 = addressTable.addColumn("addressCol1");
		var addressCol2 = addressTable.addColumn("addressCol2");
		var addressCol3 = addressTable.addColumn("addressCol3");

		tableRow = addressTable.addRow();

		var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
		var cell = tableRow.addCell("", "", 1);
		for (var i = 0; i < supplierLines.length; i++) {
			cell.addParagraph(supplierLines[i], "");
		}
		tableRow.addCell("", "", 1);
		var cell2 = tableRow.addCell("", "", 1);
		cell2.addParagraph(texts.date.toUpperCase()+":","bold right");
		cell2.addParagraph(texts.invoice.toUpperCase()+" #:","bold right");
		cell2.addParagraph(texts.payment_terms_label.toUpperCase()+":","bold right");

		var cell3 = tableRow.addCell("", "", 1);
		cell3.addParagraph(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date), 'right');
		cell3.addParagraph(invoiceObj.document_info.number, 'right');
		//Payment Terms
		if (invoiceObj.billing_info.payment_term) {
		  cell3.addParagraph(invoiceObj.billing_info.payment_term, 'right');
		} else if (invoiceObj.payment_info.due_date) {
		  var payment_terms_label = texts.payment_due_date_label;
		  payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
		  cell3.addParagraph(payment_terms, 'right');
		}
	}

	function printItemsHeader(invoiceObj, repDocObj, param, texts, rowNumber) {
		//
		// ITEMS TABLE
		//
		repTableObj = repDocObj.addTable("doc_table_row0");
		var repTableCol1 = repTableObj.addColumn("repTableCol1");
		var repTableCol2 = repTableObj.addColumn("repTableCol2");
		var repTableCol3 = repTableObj.addColumn("repTableCol3");
		var repTableCol4 = repTableObj.addColumn("repTableCol4");

		var dd = repTableObj.getHeader().addRow();
		dd.addCell(texts.description, "padding-left items_table_header", 1);
		dd.addCell("", "items_table_header", 1)
		dd.addCell(texts.amount, "padding-right items_table_header amount", 1);
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
			param.font_family = "Calibri";
		}

		if (!param.color_1) {
			param.color_1 = "#005392";
		}

		if (!param.color_2) {
			param.color_2 = "#ffffff";
		}

		if (!param.color_3) {
			param.color_3 = "";
		}

		if (!param.color_4) {
			param.color_4 = "";
		}

		if (!param.color_5) {
			param.color_5 = "";
		}

		//====================================================================//
		// GENERAL
		//====================================================================//
		var pageStyle = repStyleObj.addStyle("@page");
		pageStyle.setAttribute("size", "A4 portrait");
		repStyleObj.addStyle(".pageReset", "counter-reset: page");
		repStyleObj.addStyle("body", "font-size: 14pt; font-family:" + param.font_family);
		repStyleObj.addStyle(".businessname", "font-size: 16pt; font-family:"+param.font_family);
		repStyleObj.addStyle(".logo", "font-size: 32pt; font-family:'Arial Black',"+param.font_family+"; color:" + param.color_1);
		repStyleObj.addStyle(".headerAddress", "font-size:9pt");
		repStyleObj.addStyle(".amount", "text-align:right");
		repStyleObj.addStyle(".subtotal_cell", "font-weight:bold;");
		repStyleObj.addStyle(".center", "text-align:center");
		repStyleObj.addStyle(".left", "text-align:left");
		repStyleObj.addStyle(".right", "text-align:right");
		repStyleObj.addStyle(".bold", "font-weight: bold");
		repStyleObj.addStyle(".title", "font-size:18pt; color:" + param.color_1);
		repStyleObj.addStyle(".items_table_header", "font-weight:bold; background-color:" + param.color_1 + "; color:" + param.color_2);
		repStyleObj.addStyle(".items_table_header td", "padding-top:5px; padding-bottom:5px");
		repStyleObj.addStyle(".total", "font-size:16pt; color: " + param.color_1);
		repStyleObj.addStyle(".evenRowsBackgroundColor", "background-color:#f2f2f2");
		repStyleObj.addStyle(".border-bottom", "border-bottom:thin solid black");
		repStyleObj.addStyle(".border-top", "border-top:thin solid black");
		repStyleObj.addStyle(".border-top-dashed", "border-top:1px dashed black");
		repStyleObj.addStyle(".border-left", "border-left:thin solid black");
		repStyleObj.addStyle(".border-right", "border-right:thin solid black");
		repStyleObj.addStyle(".no-border-left", "border-left:none");
		repStyleObj.addStyle(".border2", "border:1px solid black");
		repStyleObj.addStyle(".padding-right", "padding-right:5px");
		repStyleObj.addStyle(".padding-left", "padding-left:5px");
		repStyleObj.addStyle(".vatInfo", "font-size: 12pt;vertical-align:top;");
		
		repStyleObj.addStyle(".addressCol1", "width:25mm");
		repStyleObj.addStyle(".addressCol2", "width:5mm");
		repStyleObj.addStyle(".addressCol3", "width:5mm");


		
		
		var beginStyle = repStyleObj.addStyle(".begin_text");
		beginStyle.setAttribute("position", "absolute");
		beginStyle.setAttribute("top", "90mm");
		beginStyle.setAttribute("left", "20mm");
		beginStyle.setAttribute("right", "10mm");
		beginStyle.setAttribute("font-size", "10px");

		//====================================================================//
		// TABLES
		//====================================================================//
		var headerStyle = repStyleObj.addStyle(".header_table");
		headerStyle.setAttribute("position", "absolute");
		headerStyle.setAttribute("margin-top", "0mm"); //106
		headerStyle.setAttribute("margin-left", "15mm"); //20
		headerStyle.setAttribute("margin-right", "10mm");
		headerStyle.setAttribute("width", "100%");
		//repStyleObj.addStyle("table.header_table td", "border: thin solid black");


		var addressStyle = repStyleObj.addStyle(".address_table");
		addressStyle.setAttribute("position", "absolute");
		addressStyle.setAttribute("margin-top", "20mm");
		addressStyle.setAttribute("margin-left", "15mm");
		addressStyle.setAttribute("margin-right", "10mm");
		//repStyleObj.addStyle("table.address_table td", "border: thin solid black");
		addressStyle.setAttribute("width", "100%");
		
		var addressStyle2 = repStyleObj.addStyle(".address_table2");
		addressStyle2.setAttribute("position", "absolute");
		addressStyle2.setAttribute("margin-top", "40mm");
		addressStyle2.setAttribute("margin-left", "15mm");
		addressStyle2.setAttribute("margin-right", "10mm");
		//repStyleObj.addStyle("table.address_table2 td", "border: thin solid black");
		addressStyle2.setAttribute("width", "100%");

		var addressStyle = repStyleObj.addStyle(".address_table_row0");
		addressStyle.setAttribute("position", "absolute");
		addressStyle.setAttribute("margin-top", "10mm");
		addressStyle.setAttribute("margin-left", "19mm");
		addressStyle.setAttribute("margin-right", "10mm");
		//repStyleObj.addStyle("table.address_table_row0 td", "border: thin solid #6959CD");
		addressStyle.setAttribute("width", "100%");


		var itemsStyle = repStyleObj.addStyle(".doc_table");
		itemsStyle.setAttribute("margin-top", "90mm"); //106
		itemsStyle.setAttribute("margin-left", "15mm"); //20
		itemsStyle.setAttribute("margin-right", "10mm");
		//repStyleObj.addStyle("table.doc_table td", "border: thin solid black;");
		repStyleObj.addStyle("table.doc_table", "border-right: thin solid black;");
		itemsStyle.setAttribute("width", "100%");

		var itemsStyle = repStyleObj.addStyle(".doc_table1");
		itemsStyle.setAttribute("margin-top", "130mm"); 
		itemsStyle.setAttribute("margin-left", "23mm");
		itemsStyle.setAttribute("margin-right", "10mm");
		itemsStyle.setAttribute("width", "100%");
		//repStyleObj.addStyle("table.doc_table1 td", "border: thin solid #6959CD;");

		var itemsStyle = repStyleObj.addStyle(".doc_table_row0");
		itemsStyle.setAttribute("margin-top", "90mm"); //106
		itemsStyle.setAttribute("margin-left", "23mm"); //20
		itemsStyle.setAttribute("margin-right", "10mm");
		//repStyleObj.addStyle("table.doc_table td", "border: thin solid #282828; padding: 3px;");
		itemsStyle.setAttribute("width", "100%");

		var infoStyle = repStyleObj.addStyle(".title_table");
		infoStyle.setAttribute("position", "absolute");
		infoStyle.setAttribute("margin-top", "90mm");
		infoStyle.setAttribute("margin-left", "22mm");
		infoStyle.setAttribute("margin-right", "10mm");
		//repStyleObj.addStyle("table.info_table td", "border: thin solid black");
		infoStyle.setAttribute("width", "100%");

		var infoStyle = repStyleObj.addStyle(".title_table1");
		infoStyle.setAttribute("position", "absolute");
		infoStyle.setAttribute("margin-top", "115mm");
		infoStyle.setAttribute("margin-left", "22mm");
		infoStyle.setAttribute("margin-right", "10mm");
		infoStyle.setAttribute("width", "100%");
		
		var addressStyle = repStyleObj.addStyle(".address_table_paymentslip");
		addressStyle.setAttribute("position", "absolute");
		addressStyle.setAttribute("margin-top", "202mm");
		addressStyle.setAttribute("margin-left", "15mm");
		addressStyle.setAttribute("margin-right", "10mm");
		//repStyleObj.addStyle("table.address_table_paymentslip td", "border: thin solid black");
		addressStyle.setAttribute("width", "100%");

	}

	function setInvoiceTexts(language) {
		var texts = {};
		if (language == 'fr') {
			texts.customer = 'No Client';
			texts.date = 'Date';
			texts.description = 'Description';
			texts.invoice = 'Facture';
			texts.page = 'Page';
			texts.rounding = 'Arrondi';
			texts.balancedue = 'Balance due';
			texts.total = 'Total';
			texts.totalnet = 'Total net';
			texts.subtotal = 'Subtotal';
			texts.amount = 'Amount';
			texts.lessreceived = "Less received on account";
			texts.vat = 'TVA';
			texts.HST = 'HST';
			texts.qty = 'Quantité';
			texts.unit_ref = 'Unité';
			texts.unit_price = 'Prix unité';
			texts.vat_number = 'Numéro de TVA: ';
			texts.bill_to = 'Adresse de facturation';
			texts.shipping_to = 'Adresse de livraison';
			texts.from = 'DE';
			texts.to = 'À';
			texts.param_color_1 = 'Couleur de fond';
			texts.param_color_2 = 'Couleur du texte';
			texts.param_font_family = 'Type caractère';
			texts.param_print_header = 'Inclure en-tête de page (1=oui, 0=non)';
			texts.param_print_paymentslip = 'Include payment slip (1=oui, 0=non)';
			texts.payment_due_date_label = 'Echéance';
			texts.payment_terms_label = 'Paiement';
			texts.phone = 'Phone';
			texts.fax = 'Fax';
			texts.email = 'Email';
			texts.website = 'Website';
		} else {
			texts.customer = 'Customer No';
			texts.date = 'Date';
			texts.description = 'for the following professional services rendered';
			texts.invoice = 'Invoice';
			texts.page = 'Page';
			texts.rounding = 'Rounding';
			texts.balancedue = 'Balance due';
			texts.total = 'Invoice total';
			texts.subtotal = 'Subtotal';
			texts.amount = 'Amount';
			texts.totalnet = 'Total net';
			texts.lessreceived = "Less received on account";
			texts.vat = 'VAT';
			texts.HST = 'HST';
			texts.qty = 'Quantity';
			texts.unit_ref = 'Unit';
			texts.unit_price = 'Unit price';
			texts.vat_number = 'VAT Number: ';
			texts.bill_to = 'Bill To';
			texts.shipping_to = 'Shipping address';
			texts.from = 'FROM';
			texts.to = 'TO';
			texts.param_color_1 = 'Background Color';
			texts.param_color_2 = 'Text Color';
			texts.param_font_family = 'Font type';
			texts.param_print_header = 'Include page header (1=yes, 0=no)';
			texts.param_print_paymentslip = 'Include payment slip (1=yes, 0=no)';
			texts.payment_due_date_label = 'Due date';
			texts.payment_terms_label = 'Payment';
			texts.phone = 'Phone';
			texts.fax = 'Fax';
			texts.email = 'Email';
			texts.website = 'Website';
		}
		return texts;
	}