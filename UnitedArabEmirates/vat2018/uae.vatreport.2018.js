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
// @id = ch.banana.uae.app.vatreport.2018
// @api = 1.0
// @pubdate = 2018-04-03
// @publisher = Banana.ch SA
// @description = UAE: VAT return 2018 (Beta)
// @task = app.command
// @doctype = 100.110;110.110;130.110;100.130
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1


/*
	SUMMARY
	-------
	Saudi Arabia  VAT report
 **/

var param = {};

/* Function that loads some parameters */
function loadParam(banDoc) {
}

/* Function that loads all the description texts */
function loadText(banDoc) {
	var lan = banDoc.info("Base", "Language");
	param.text = {};
	param.text.reportName = "VAT Report United Arab Emirates";
	param.text.title = "VAT Return";
	param.text.version = "Version " + Banana.script.getParamLocaleValue('pubdate') + " (BETA)";
	param.text.period = "Report Period: ";
	param.text.vatNumber = "VAT identification number: ";
	param.text.headerAmount = "Amount";
	param.text.headerVat = "VAT amount";
	param.text.headerRecoverableVat = "Recoverable VAT amount";
	param.text.headerAdjustments = "Adjustment";

	param.text.title1 = "VAT on Sales and All Other Outputs";
	param.text.description1a = "Standard rated supplies in Abu Dhabi";
	param.text.description1b = "Standard rated supplies in Dubai";
	param.text.description1c = "Standard rated supplies in Sharjah";
	param.text.description1d = "Standard rated supplies in Ajman";
	param.text.description1e = "Standard rated supplies in Umm Al Quwain";
	param.text.description1f = "Standard rated supplies in Ras Al Khaimah";
	param.text.description1g = "Standard rated supplies in Fujairah";
	param.text.description2 = "Tax Refunds provided to Tourists under the Tax Refunds for Tourists Scheme";
	param.text.description3 = "Supplies subject to the reverse charge provisions";
	param.text.description4 = "Zero-rated supplies";
	param.text.description5 = "Exempt supplies";
	param.text.description6 = "Goods imported into the UAE";
	param.text.description7 = "Adjustments to goods imported into the UAE";
	param.text.description8 = "Totals";
	
	param.text.title2 = "VAT on Expenses and All Other Inputs";
	param.text.description9 = "Standard rated expenses";
	param.text.description10 = "Supplies subject to the reverse charge provisions";
	param.text.description11 = "Totals";
	
	param.text.title3 = "Net VAT due";
	param.text.description12 = "Total value of due tax for the period";
	param.text.description13 = "Total value of recoverable tax for the period";
	param.text.description14 = "Payable tax for the period";
	param.text.description15 = "Recoverable tax for the period";
}

/* Main function */
function exec() {

	//Check the version of Banana. If < than 9.0.0.171128 the script does not start
	var requiredVersion = "9.0.2";
	if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {

		var dateform = getPeriodSettings(param);
		if (!dateform) {
			return;
		}

		//Check if we are on an opened document
		if (!Banana.document) {
			return;
		}

		//Create the VAT report		
		var report = createVatReport(Banana.document, dateform.selectionStartDate, dateform.selectionEndDate);

		//Add styles and print the report
		var stylesheet = createStyleSheet();
		Banana.Report.preview(report, stylesheet);

	} else {
		return;
	}
}

/* Function that creates and prints the report */
function createVatReport(banDoc, startDate, endDate) {

	/* Load all the texts */
	loadText(banDoc);

	/* Extract data from journal */
	var transactions = getJournal(banDoc, startDate, endDate);

	/* Create the report */
	var report = Banana.Report.newReport(param.reportName);

	var headerLeft = banDoc.info("Base", "HeaderLeft");
	var vatNumber = banDoc.info("AccountingDataBase", "VatNumber");
	var basicCurrency  = banDoc.info("AccountingDataBase", "BasicCurrency");

	if (headerLeft) {
		report.addParagraph(headerLeft, "heading2");
	}
	if (vatNumber) {
		report.addParagraph(param.text.vatNumber + " " + vatNumber, "heading3");
	}

	checkUsedVatCodes(param, banDoc, report);
	checkUsedVatCodesHaveGr1(banDoc, report);

	report.addParagraph(" ", "");
	report.addParagraph(param.text.title, "heading1");
	report.addParagraph(param.text.period + Banana.Converter.toLocaleDateFormat(startDate) + " - " + Banana.Converter.toLocaleDateFormat(endDate), "bold");
	report.addParagraph(" ", "");
	report.addParagraph(" ", "");
	report.addParagraph(" ", "");
	
	/************************************************************************
		TABLE I
	************************************************************************/
	var table = report.addTable("tableI");
	var col0 = table.addColumn("col0");  /* number */
	var col1 = table.addColumn("col1");  /* description */
	var col2 = table.addColumn("col2");  /* space */
	var col3 = table.addColumn("col3");  /* amount taxable */
	var col4 = table.addColumn("col4");  /* space */
	var col5 = table.addColumn("col5");  /* adjustment */
	var col6 = table.addColumn("col6");  /* space */
	var col7 = table.addColumn("col7");  /* vat amount */

	var amount = "";
	var amountTot = "";
	var taxable = "";
	var adjustment = "";
	var posted = "";
	var postedTot = "";
	var taxableTot = "";
	var adjustmentTot = "";
	var amountTot2 = "";
	var taxableTot2 = "";
	var postedTot2 = "";
	var adjustmentTot2 = "";
	var postedTotDue = "";
	var postedTotRecoverable = "";
	var netDueOrClaim = "";

	/* Header  */
	table.getCaption().addText(param.text.title1, "bold orange");
	tableRow = table.addRow();
	tableRow.addCell("", "borderTop", 3);
	var cellAmount = tableRow.addCell("", "borderTop bold center"); //Taxable
	cellAmount.addParagraph(param.text.headerAmount, ""); 
	cellAmount.addParagraph("(" + basicCurrency + ")", "");
	tableRow.addCell("","borderTop");
	var cellVatAmount = tableRow.addCell("", "borderTop bold center"); //Posted
	cellVatAmount.addParagraph(param.text.headerVat, ""); 
	cellVatAmount.addParagraph("(" + basicCurrency + ")", "");
	tableRow.addCell("","borderTop");
	var cellAdjustment = tableRow.addCell("", "borderTop bold center"); //Adjustment
	cellAdjustment.addParagraph(param.text.headerAdjustments, ""); 
	cellAdjustment.addParagraph("(" + basicCurrency + ")", "");

	/* 1A - Standard rated sales */
	tableRow = table.addRow();
	tableRow.addCell("1a", "");
	tableRow.addCell(param.text.description1a, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "1a", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "1a", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	adjustment = getGr1VatBalance(banDoc, transactions, "1a", 3, "ADJ", startDate, endDate);
	tableRow.addCell(formatNumber(adjustment, true), "right dataCell");
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);
	adjustmentTot = Banana.SDecimal.add(adjustmentTot, adjustment);

	/* 1B - Standard rated sales */
	tableRow = table.addRow();
	tableRow.addCell("1b", "");
	tableRow.addCell(param.text.description1b, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "1b", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "1b", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	adjustment = getGr1VatBalance(banDoc, transactions, "1b", 3, "ADJ", startDate, endDate);
	tableRow.addCell(formatNumber(adjustment, true), "right dataCell");
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);
	adjustmentTot = Banana.SDecimal.add(adjustmentTot, adjustment);

	/* 1C - Standard rated sales */
	tableRow = table.addRow();
	tableRow.addCell("1c", "");
	tableRow.addCell(param.text.description1c, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "1c", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "1c", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	adjustment = getGr1VatBalance(banDoc, transactions, "1c", 3, "ADJ", startDate, endDate);
	tableRow.addCell(formatNumber(adjustment, true), "right dataCell");
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);
	adjustmentTot = Banana.SDecimal.add(adjustmentTot, adjustment);

	/* 1D - Standard rated sales */
	tableRow = table.addRow();
	tableRow.addCell("1d", "");
	tableRow.addCell(param.text.description1d, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "1d", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "1d", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	adjustment = getGr1VatBalance(banDoc, transactions, "1d", 3, "ADJ", startDate, endDate);
	tableRow.addCell(formatNumber(adjustment, true), "right dataCell");
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);
	adjustmentTot = Banana.SDecimal.add(adjustmentTot, adjustment);

	/* 1E - Standard rated sales */
	tableRow = table.addRow();
	tableRow.addCell("1e", "");
	tableRow.addCell(param.text.description1e, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "1e", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "1e", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	adjustment = getGr1VatBalance(banDoc, transactions, "1e", 3, "ADJ", startDate, endDate);
	tableRow.addCell(formatNumber(adjustment, true), "right dataCell");
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);
	adjustmentTot = Banana.SDecimal.add(adjustmentTot, adjustment);

	/* 1F - Standard rated sales */
	tableRow = table.addRow();
	tableRow.addCell("1f", "");
	tableRow.addCell(param.text.description1f, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "1f", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "1f", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	adjustment = getGr1VatBalance(banDoc, transactions, "1f", 3, "ADJ", startDate, endDate);
	tableRow.addCell(formatNumber(adjustment, true), "right dataCell");
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);
	adjustmentTot = Banana.SDecimal.add(adjustmentTot, adjustment);

	/* 1G - Standard rated sales */
	tableRow = table.addRow();
	tableRow.addCell("1g", "");
	tableRow.addCell(param.text.description1g, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "1g", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "1g", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	adjustment = getGr1VatBalance(banDoc, transactions, "1g", 3, "ADJ", startDate, endDate);
	tableRow.addCell(formatNumber(adjustment, true), "right dataCell");
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);
	adjustmentTot = Banana.SDecimal.add(adjustmentTot, adjustment);

	/* 2 - Tax Refunds provided to Tourists under the Tax Refunds for Tourists Scheme */
	tableRow = table.addRow();
	tableRow.addCell("2","");
	tableRow.addCell(param.text.description2, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "2", 2, "", startDate, endDate);
	posted = getGr1VatBalance(banDoc, transactions, "2", 4, "", startDate, endDate);
	if (!Banana.SDecimal.isZero(taxable) && !Banana.SDecimal.isZero(posted)) {
		tableRow.addCell(formatNumber(taxable, true), "right dataCell");
		tableRow.addCell();
		tableRow.addCell(formatNumber(posted, true), "right dataCell");
		taxableTot = Banana.SDecimal.add(taxableTot, taxable);
		postedTot = Banana.SDecimal.add(postedTot, posted);
	} else {
		tableRow.addCell("-" + formatNumber(taxable, true), "right dataCell");
		tableRow.addCell();
		tableRow.addCell("-" + formatNumber(posted, true), "right dataCell");
	}
	tableRow.addCell();
	tableRow.addCell();
	
	/* 3 - Supplies subject to the reverse charge provisions */
	tableRow = table.addRow();
	tableRow.addCell("3","");
	tableRow.addCell(param.text.description3, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "3", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "3", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	tableRow.addCell();
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);

	/* 4 - Zero-rated supplies (net value of supply, VAT is calculated as nil)*/
	tableRow = table.addRow();
	tableRow.addCell("4","");
	tableRow.addCell(param.text.description4, "");
	tableRow.addCell();
	amount = getGr1VatBalance(banDoc, transactions, "4", 1, "", startDate, endDate);
	tableRow.addCell(formatNumber(amount, true), "right dataCell");
	tableRow.addCell();
	tableRow.addCell();
	tableRow.addCell();
	tableRow.addCell();
	taxableTot = Banana.SDecimal.add(taxableTot, amount);

	/* 5 - Exempt supplies (no VAT on the supply)*/
	tableRow = table.addRow();
	tableRow.addCell("5","");
	tableRow.addCell(param.text.description5, "");
	tableRow.addCell();
	amount = getGr1VatBalance(banDoc, transactions, "5", 1, "", startDate, endDate);
	tableRow.addCell(formatNumber(amount, true), "right dataCell");
	tableRow.addCell();
	tableRow.addCell();
	tableRow.addCell();
	tableRow.addCell();
	taxableTot = Banana.SDecimal.add(taxableTot, amount);

	/* 6 - Goods imported into the UAE (net value and vat amount (5% VAT on the net value amount))*/
	tableRow = table.addRow();
	tableRow.addCell("6","");
	tableRow.addCell(param.text.description6, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "6", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right totalCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "6", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right totalCell");
	tableRow.addCell();
	tableRow.addCell();
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);

	/* 7 - Adjustments to goods imported into the UAE (use only if in information in pos. 6 are incomplete/incorrect)*/
	tableRow = table.addRow();
	tableRow.addCell("7","");
	tableRow.addCell(param.text.description7, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "7", 2, "", startDate, endDate);
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "7", 4, "", startDate, endDate);
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	tableRow.addCell();
	taxableTot = Banana.SDecimal.add(taxableTot, taxable);
	postedTot = Banana.SDecimal.add(postedTot, posted);

	/* 8 - Totals */
	tableRow = table.addRow();
	tableRow.addCell("8","");
	tableRow.addCell(param.text.description8, "");
	tableRow.addCell();
	tableRow.addCell(formatNumber(taxableTot, true), "right totalCell");
	tableRow.addCell();
	tableRow.addCell(formatNumber(postedTot, true), "right totalCell");
	tableRow.addCell();
	tableRow.addCell(formatNumber(adjustmentTot, true), "right totalCell");

	report.addParagraph(" ", "");
	report.addParagraph(" ", "");
	report.addParagraph(" ", "");

	/************************************************************************
		TABLE II
	************************************************************************/
	var table = report.addTable("tableII");
	var col0 = table.addColumn("col0");  /* number */
	var col1 = table.addColumn("col1");  /* description */
	var col2 = table.addColumn("col2");  /* space */
	var col3 = table.addColumn("col3");  /* amount taxable */
	var col4 = table.addColumn("col4");  /* space */
	var col5 = table.addColumn("col5");  /* adjustment */
	var col6 = table.addColumn("col6");  /* space */
	var col7 = table.addColumn("col7");  /* vat amount */
	
	/* Header  */
	table.getCaption().addText(param.text.title2, "bold orange");
	tableRow = table.addRow();
	tableRow.addCell("", "borderTop", 3);
	var cellAmount = tableRow.addCell("", "borderTop bold center"); //Taxable
	cellAmount.addParagraph(param.text.headerAmount, ""); 
	cellAmount.addParagraph("(" + basicCurrency + ")", "");
	tableRow.addCell("","borderTop");
	var cellVatAmount = tableRow.addCell("", "borderTop bold center"); //Posted
	cellVatAmount.addParagraph(param.text.headerRecoverableVat, ""); 
	cellVatAmount.addParagraph("(" + basicCurrency + ")", "");
	tableRow.addCell("","borderTop");
	var cellAdjustment = tableRow.addCell("", "borderTop bold center"); //Adjustment
	cellAdjustment.addParagraph(param.text.headerAdjustments, ""); 
	cellAdjustment.addParagraph("(" + basicCurrency + ")", "");

	/* 9 - Standard rated expenses */
	tableRow = table.addRow();
	tableRow.addCell("9","");
	tableRow.addCell(param.text.description9, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "9", 1, "", startDate, endDate); //no invert
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "9", 3, "", startDate, endDate); //no invert
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	adjustment = getGr1VatBalance(banDoc, transactions, "9", 3, "ADJ", startDate, endDate);
	tableRow.addCell(formatNumber(adjustment, true), "right dataCell");
	taxableTot2 = Banana.SDecimal.add(taxableTot2, taxable);
	postedTot2 = Banana.SDecimal.add(postedTot2, posted);
	adjustmentTot2 = Banana.SDecimal.add(adjustmentTot2, adjustment);

	/* 10 - Supplies subject to the reverse charge provisions */
	tableRow = table.addRow();
	tableRow.addCell("10","");
	tableRow.addCell(param.text.description10, "");
	tableRow.addCell();
	taxable = getGr1VatBalance(banDoc, transactions, "10", 1, "", startDate, endDate); //no invert
	tableRow.addCell(formatNumber(taxable, true), "right dataCell");
	tableRow.addCell();
	posted = getGr1VatBalance(banDoc, transactions, "10", 3, "", startDate, endDate); //no invert
	tableRow.addCell(formatNumber(posted, true), "right dataCell");
	tableRow.addCell();
	adjustment = getGr1VatBalance(banDoc, transactions, "10", 3, "ADJ", startDate, endDate);
	tableRow.addCell(formatNumber(adjustment, true), "right dataCell");
	taxableTot2 = Banana.SDecimal.add(taxableTot2, taxable);
	postedTot2 = Banana.SDecimal.add(postedTot2, posted);
	adjustmentTot2 = Banana.SDecimal.add(adjustmentTot2, adjustment);

	/* 11 - Totals */
	tableRow = table.addRow();
	tableRow.addCell("11","");
	tableRow.addCell(param.text.description11, "");
	tableRow.addCell();
	tableRow.addCell(formatNumber(taxableTot2, true), "right totalCell");
	tableRow.addCell();
	tableRow.addCell(formatNumber(postedTot2, true), "right totalCell");
	tableRow.addCell();
	tableRow.addCell(formatNumber(adjustmentTot2, true), "right totalCell");

	report.addParagraph(" ", "");
	report.addParagraph(" ", "");
	report.addParagraph(" ", "");

	/************************************************************************
		TABLE III
	************************************************************************/
	var table = report.addTable("tableIII");
	var col0 = table.addColumn("col0");
	var col1 = table.addColumn("col1");

	/* Header  */
	table.getCaption().addText(param.text.title3, "bold orange");
	tableRow = table.addRow();
	tableRow.addCell("", "borderTop", 2);

	/* 12 - Total value of due tax for the period (sum of the VAT and Adjustment columns)*/
	postedTotDue = Banana.SDecimal.add(postedTot, adjustmentTot);
	tableRow = table.addRow();
	tableRow.addCell("12","");
	tableRow.addCell(param.text.description12, "");
	tableRow = table.addRow();
	tableRow.addCell();
	tableRow.addCell(formatNumber(postedTotDue, true), "right totalCell");

	/* 13 - Total value of recoverable tax for the period */
	postedTotRecoverable = Banana.SDecimal.add(postedTot2, adjustmentTot2);
	tableRow = table.addRow();
	tableRow.addCell("13","");
	tableRow.addCell(param.text.description13, "");
	tableRow = table.addRow();
	tableRow.addCell();
	tableRow.addCell(formatNumber(postedTotRecoverable, true), "right totalCell");

	/* 14 - Payable/Recoverable tax for the period */
	if (Banana.SDecimal.compare(postedTotDue, postedTotRecoverable) >= 0) { //postedTotDue > postedTotRecoverable : VAT to pay
		netDueOrClaim = Banana.SDecimal.subtract(postedTotDue, postedTotRecoverable);
		var text = param.text.description14;
	}
	else { //postedTotDue < postedTotRecoverable : VAT that can be refunded
		netDueOrClaim = Banana.SDecimal.subtract(postedTotRecoverable, postedTotDue);
		var text = param.text.description15;
	}

	tableRow = table.addRow();
	tableRow.addCell("14","");
	tableRow.addCell(text, "");
	tableRow = table.addRow();
	tableRow.addCell();
	tableRow.addCell(formatNumber(netDueOrClaim, true), "right totalCell");

    report.addParagraph(" ","");
    report.addParagraph(" ","");
    report.addParagraph(" ","");

    /***********************************
        TABLE IV - Check results
    ***********************************/
    var totalFromBanana = getTotalFromBanana(banDoc, startDate, endDate);
    var totalFromReport = netDueOrClaim;

	var table = report.addTable("tableIV");
	table.getCaption().addText("Check results", "bold orange");
	tableRow = table.addRow();
	tableRow.addCell("", "borderTop", 2);

    tableRow = table.addRow();
    tableRow.addCell("Total from Banana: ", "", 1);
    tableRow.addCell(formatNumber(totalFromBanana, true), "right", 1);
    tableRow.addCell(basicCurrency, "", 1);
    
    tableRow = table.addRow();
    tableRow.addCell("Total from Report:", "", 1);
    tableRow.addCell(formatNumber(totalFromReport, true), "right", 1);
    tableRow.addCell(basicCurrency, "", 1);

    //checkSum has to be 0
    var checkSum = Banana.SDecimal.add(totalFromBanana, totalFromReport);
    if (checkSum > -0.01 && 0.01 > checkSum) {   
        tableRow = table.addRow();
        tableRow.addCell("Checksum must be equal to 0: ", "", 1);
        tableRow.addCell(formatNumber(checkSum, true),"right", 1);
        tableRow.addCell(basicCurrency, "", 1);
    } else {
    	tableRow = table.addRow();
        tableRow.addCell("Checksum must be equal to 0: ", "red", 1);
        tableRow.addCell(formatNumber(checkSum, true),"right red", 1);
        tableRow.addCell(basicCurrency, "red", 1);
    }
    // if (Banana.SDecimal.compare(totalFromBanana, totalFromReport) = 0) {}

	//Add Header and footer
	addHeader(param, report);
	addFooter(param, report);

	return report;
}

function formatNumber(amount, convZero) {

	return Banana.Converter.toLocaleNumberFormat(amount, 2, convZero);
}

/* Function that checks for all the used vat codes without Gr1 and prints a warning message */
function checkUsedVatCodesHaveGr1(banDoc, report) {

	// Get all the vat codes used on the Transactions table
	var usedVatCodes = getVatCodesUsed(banDoc);

	// For each code checks if on the VatCodes table there is a Gr1
	// Shows a warning message in red for all the vat codes without the Gr1
	var codesWithoutGr1 = [];

	// Save all the vat codes without Gr1 into an array
	for (var i = 0; i < usedVatCodes.length; i++) {
		var gr1 = getVatCodeGr1(banDoc, usedVatCodes[i]);
		if (!gr1) {
			codesWithoutGr1.push(usedVatCodes[i]);
		}
	}

	// Print all the warning messages
	for (var i = 0; i < codesWithoutGr1.length; i++) {
		report.addParagraph(param.checkVatCode4 + codesWithoutGr1[i] + param.checkVatCode5, "red");
	}
}

/* Function that retrieves the total vat from Banana */
function getTotalFromBanana(banDoc, startDate, endDate) {
	var vatReportTable = banDoc.vatReport(startDate, endDate);
	var res = "";

	for (var i = 0; i < vatReportTable.rowCount; i++) {
		var tRow = vatReportTable.row(i);
		var group = tRow.value("Group");

		//The balance is summed in group named "_tot_"
		if (group === "_tot_") {
			res = tRow.value("VatBalance"); //VatAmount VatBalance

			// //In order to compare correctly the values we have to invert the sign of the result from Banana (if negative)
			// if (Banana.SDecimal.sign(totalFromBanana) == -1) {
			//     totalFromBanana = Banana.SDecimal.invert(totalFromBanana);
			// }
		}
	}
	return res;
}

/* Function that checks all the vat/gr1 codes used in the transactions.
It returns a warning message (red) if wrong codes are used. */
function checkUsedVatCodes(param, banDoc, report) {
	var usedGr1Codes = [];
	var vatCodes = getVatCodesUsed(banDoc);
	for (var i = 0; i < vatCodes.length; i++) {
		var gr1Codes = getVatCodeGr1(banDoc, vatCodes[i]);
		for (var j = 0; j < gr1Codes.length; j++) {
			usedGr1Codes.push(gr1Codes[j]);
		}
	}

	//Removing duplicates
	for (var i = 0; i < usedGr1Codes.length; i++) {
		for (var x = i + 1; x < usedGr1Codes.length; x++) {
			if (usedGr1Codes[x] === usedGr1Codes[i]) {
				usedGr1Codes.splice(x, 1);
				--x;
			}
		}
	}

	for (var j = 0; j < usedGr1Codes.length; j++) {
		if (usedGr1Codes[j] !== "1" &&
			usedGr1Codes[j] !== "1a" &&
			usedGr1Codes[j] !== "1b" &&
			usedGr1Codes[j] !== "1c" &&
			usedGr1Codes[j] !== "1d" &&
			usedGr1Codes[j] !== "1e" &&
			usedGr1Codes[j] !== "1f" &&
			usedGr1Codes[j] !== "1g" &&
			usedGr1Codes[j] !== "2" &&
			usedGr1Codes[j] !== "3" &&
			usedGr1Codes[j] !== "4" &&
			usedGr1Codes[j] !== "5" &&
			usedGr1Codes[j] !== "6" &&
			usedGr1Codes[j] !== "7" &&
			usedGr1Codes[j] !== "8" &&
			usedGr1Codes[j] !== "9" &&
			usedGr1Codes[j] !== "10" &&
			usedGr1Codes[j] !== "11" &&
			usedGr1Codes[j] !== "12" &&
			usedGr1Codes[j] !== "13" &&
			usedGr1Codes[j] !== "14" &&
			usedGr1Codes[j] !== "xxx" &&
			usedGr1Codes[j] !== "") {
			report.addParagraph("VAT code " + " '" + usedGr1Codes[j] + "' " + " invalid", "red");
		}
	}
}

/* Function that returns an array with all the gr1 codes for the given vat code */
function getVatCodeGr1(banDoc, vatCode) {
	var str = [];
	var table = banDoc.table("VatCodes");
	if (table === undefined || !table) {
		return str;
	}
	//Loop to take the values of each rows of the table
	for (var i = 0; i < table.rowCount; i++) {
		var tRow = table.row(i);
		var gr1 = tRow.value("Gr1");
		var vatcode = tRow.value("VatCode");

		if (gr1 && vatcode === vatCode) {
			var code = gr1.split(";");
			for (var j = 0; j < code.length; j++) {
				if (code[j]) {
					str.push(code[j]);
				}
			}
		}
	}
	return str;
}

/* Function that returns all the vat codes used in the transactions table */
function getVatCodesUsed(banDoc) {
	var str = [];
	var table = banDoc.table("Transactions");
	if (table === undefined || !table) {
		return str;
	}
	//Loop to take the values of each rows of the table
	for (var i = 0; i < table.rowCount; i++) {
		var tRow = table.row(i);
		var vatRow = tRow.value("VatCode");

		if (vatRow) {
			var code = vatRow.split(";");
			for (var j = 0; j < code.length; j++) {
				if (code[j]) {
					str.push(code[j]);
				}
			}
		}
	}
	//Removing duplicates
	for (var i = 0; i < str.length; i++) {
		for (var x = i + 1; x < str.length; x++) {
			if (str[x] === str[i]) {
				str.splice(x, 1);
				--x;
			}
		}
	}
	//Return the array
	return str;
}

/* Function that returns the lines from the journal and converts some values from base currency to CHF */
function getJournal(banDoc, startDate, endDate) {

	var journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NORMAL);
	var len = journal.rowCount;
	var transactions = []; //Array that will contain all the lines of the transactions

	for (var i = 0; i < len; i++) {

		var line = {};
		var tRow = journal.row(i);

		if (tRow.value("JDate") >= startDate && tRow.value("JDate") <= endDate) {

			line.date = tRow.value("JDate");
			line.account = tRow.value("JAccount");
			line.vatcode = tRow.value("JVatCodeWithoutSign");
			line.exchangerate = banDoc.exchangeRate("CHF", line.date);
			line.doc = tRow.value("Doc");
			line.description = tRow.value("Description");
			line.isvatoperation = tRow.value("JVatIsVatOperation");
			

			//We take only the rows with a VAT code and then we convert values from base currency to CHF
			if (line.isvatoperation) {

				line.vattaxable = tRow.value("JVatTaxable");
				line.vatamount = tRow.value("VatAmount");
				line.vatposted = tRow.value("VatPosted");
				line.amount = tRow.value("JAmount");
				line.vatextrainfo = tRow.value("VatExtraInfo");

				transactions.push(line);
			}
		}
	}
	return transactions;
}

/* This function sums the vat amounts for the specified vat code and period retrieved from transactions (converted journal's lines)
Returns an object containing {vatTaxable, vatPosted} */
function getVatCodesBalance(transactions, vatCodes, extraInfo, startDate, endDate) {

	var sDate = Banana.Converter.toDate(startDate);
	var eDate = Banana.Converter.toDate(endDate);
	var vattaxable = "";
	var vatposted = "";
	var vatamount = "";
	var currentBal = {};

	for (var j = 0; j < vatCodes.length; j++) {
		for (var i = 0; i < transactions.length; i++) {

			var tDate = Banana.Converter.toDate(transactions[i].date);
			if (tDate >= sDate && tDate <= eDate) {

				if (vatCodes[j] === transactions[i].vatcode) {

					if (!extraInfo && !transactions[i].vatextrainfo) { // The VatExtraInfo column is not used
						vattaxable = Banana.SDecimal.add(vattaxable, transactions[i].vattaxable);
						vatposted = Banana.SDecimal.add(vatposted, transactions[i].vatposted);
						vatamount = Banana.SDecimal.add(vatamount, transactions[i].vatamount);

						currentBal.vatTaxable = vattaxable;
						currentBal.vatPosted = vatposted;
						currentBal.vatAmount = vatamount;
					}
					else if (extraInfo && transactions[i].vatextrainfo === extraInfo) { // The VatExtraInfo column is used
						vatposted = Banana.SDecimal.add(vatposted, transactions[i].vatposted);
						currentBal.vatPosted = vatposted;
					}
				}
			}
		}
	}
	return currentBal;
}

/* The purpose of this function is to calculate all the VAT balances of the accounts belonging to the same group (grText) */
function getGr1VatBalance(banDoc, transactions, grCodes, vatClass, extraInfo, startDate, endDate) {

	var vatCodes = getVatCodeForGr(banDoc, grCodes, 'Gr1');

	//Sum the vat amounts for the specified vat code and period
	var currentBal = getVatCodesBalance(transactions, vatCodes, extraInfo, startDate, endDate);

	//The "vatClass" decides which value to use
	if (vatClass == "1") {
		return currentBal.vatTaxable;
	} else if (vatClass == "2") {
		return Banana.SDecimal.invert(currentBal.vatTaxable);
	} else if (vatClass == "3") {
		return currentBal.vatPosted;
	} else if (vatClass == "4") {
		return Banana.SDecimal.invert(currentBal.vatPosted);
	} else if (vatClass == "5") {
		return Banana.SDecimal.add(currentBal.vatTaxable, currentBal.vatAmount);
	} else if (vatClass == "6") {
		return Banana.SDecimal.invert(Banana.SDecimal.add(currentBal.vatTaxable, currentBal.vatAmount));
	}
}

/* The main purpose of this function is to create an array with all the values of a given column of the table (codeColumn) belonging to the same group (grText) */
function getVatCodeForGr(banDoc, grText, grColumn) {

	var str = [];
	if (!banDoc || !banDoc.table("VatCodes")) {
		return str;
	}
	var table = banDoc.table("VatCodes");

	if (!grColumn) {
		grColumn = "Gr1";
	}

	/* Can have multiple values */
	var arrayGrText = grText.split(';');

	//Loop to take the values of each rows of the table
	for (var i = 0; i < table.rowCount; i++) {
		var tRow = table.row(i);

		//If Gr1 column contains other characters (in this case ";") we know there are more values
		//We have to split them and take all values separately
		//If there are only alphanumeric characters in Gr1 column we know there is only one value
		var arrCodeString = tRow.value(grColumn).split(";");
		for (var j = 0; j < arrayGrText.length; j++) {
			if (arrayContains(arrCodeString, arrayGrText[j])) {
				var vatCode = tRow.value('VatCode');
				if (!arrayContains(str, vatCode)) {
					str.push(vatCode);
				}
			}
		}
	}

	//Return the array
	return str;
}

function arrayContains(array, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === value) {
			return true;
		}
	}
	return false;
}

/* The main purpose of this function is to allow the user to enter the accounting period desired and saving it for the next time the script is run
Every time the user runs of the script he has the possibility to change the date of the accounting period */
function getPeriodSettings(param) {

	//The formeters of the period that we need
	var scriptform = {
		"selectionStartDate": "",
		"selectionEndDate": "",
		"selectionChecked": "false"
	};

	//Read script settings
	var data = Banana.document.getScriptSettings();

	//Check if there are previously saved settings and read them
	if (data.length > 0) {
		try {
			var readSettings = JSON.parse(data);

			//We check if "readSettings" is not null, then we fill the formeters with the values just read
			if (readSettings) {
				scriptform = readSettings;
			}
		} catch (e) {}
	}

	//We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
	var docStartDate = Banana.document.startPeriod();
	var docEndDate = Banana.document.endPeriod();

	//A dialog window is opened asking the user to insert the desired period. By default is the accounting period
	var selectedDates = Banana.Ui.getPeriod(param.reportName, docStartDate, docEndDate,
			scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);

	//We take the values entered by the user and save them as "new default" values.
	//This because the next time the script will be executed, the dialog window will contains the new values.
	if (selectedDates) {
		scriptform["selectionStartDate"] = selectedDates.startDate;
		scriptform["selectionEndDate"] = selectedDates.endDate;
		scriptform["selectionChecked"] = selectedDates.hasSelection;

		//Save script settings
		var formToString = JSON.stringify(scriptform);
		var value = Banana.document.setScriptSettings(formToString);
	} else {
		//User clicked cancel
		return;
	}
	return scriptform;
}

/* This function adds a Footer to the report */
function addFooter(param, report) {
	var date = new Date();
	var d = Banana.Converter.toLocaleDateFormat(date);
	report.getFooter().addClass("footer");
	var textfield = report.getFooter().addText(d);
	if (textfield.excludeFromTest) {
		textfield.excludeFromTest();
	}
	// report.getFooter().addFieldPageNr();
}

/* This function adds an Header to the report */
function addHeader(param, report) {
	var pageHeader = report.getHeader();
	pageHeader.addClass("header");
	//pageHeader.addParagraph(param.text.title, "heading");
	//pageHeader.addParagraph(param.version, "");
	//pageHeader.addParagraph(" ", "");
}

/* Function that creates all the styles used to print the report */
function createStyleSheet() {
	var stylesheet = Banana.Report.newStyleSheet();
	//CSS 
	stylesheet.addStyle("@page", "margin:20mm 10mm 10mm 10mm;")
	stylesheet.addStyle("body", "font-family:Helvetica; font-size:9pt");
	stylesheet.addStyle(".headerStyle", "background-color:#E0EFF6; text-align:center; font-weight:bold;");
	stylesheet.addStyle(".bold", "font-weight:bold;");
	stylesheet.addStyle(".right", "text-align:right;");
	stylesheet.addStyle(".center", "text-align:center;");
	stylesheet.addStyle(".heading1", "font-weight:bold; font-size:16pt; text-align:left");
	stylesheet.addStyle(".heading2", "font-weight:bold; font-size:12pt; text-align:left");
	stylesheet.addStyle(".heading3", "font-weight:bold; font-size:10pt; text-align:left");
	stylesheet.addStyle(".footer", "text-align:center; font-size:8px; font-family:Courier New;");
	stylesheet.addStyle(".horizontalLine", "border-top:1px solid orange");
	stylesheet.addStyle(".borderLeft", "border-left:1px solid orange");
	stylesheet.addStyle(".borderTop", "border-top:1px solid orange");
	stylesheet.addStyle(".borderRight", "border-right:1px solid orange");
	stylesheet.addStyle(".borderBottom", "border-bottom:1px solid orange");
	stylesheet.addStyle(".textDue", "color:green; background-color:#cbd7d8");
	stylesheet.addStyle(".textRecoverable", "color:green; background-color:#FFEFDB");
	stylesheet.addStyle(".dataCell", "padding-left:0.5em ;padding-right:0.5em;");
	stylesheet.addStyle(".totalCell", "font-weight:bold; color:black; background-color:#eeeeee; padding-left:0.5em ;padding-right:0.5em;"); //#DDA930
	stylesheet.addStyle(".textGreen", "color:#0a5a4a;");
	stylesheet.addStyle(".orange", "color:orange;");
	stylesheet.addStyle(".red", "color:red;");
	stylesheet.addStyle(".underline", "text-decoration:underline;");
	stylesheet.addStyle(".instructions", "background-color:#eeeeee");
	stylesheet.addStyle(".italic", "font-style:italic;");

	/* TableI */
	var tableStyle = stylesheet.addStyle("tableI");
	tableStyle.setAttribute("width", "100%");
	stylesheet.addStyle("table.tableI td", "padding-bottom: 2px; padding-top: 3px");
	//stylesheet.addStyle("table.tableI td", "border:thin solid black");
	stylesheet.addStyle(".col0", "width:4%");
	stylesheet.addStyle(".col1", "width:58%");
	stylesheet.addStyle(".col2", "");
	stylesheet.addStyle(".col3", "width:12%");
	stylesheet.addStyle(".col4", "");
	stylesheet.addStyle(".col5", "width:12%");
	stylesheet.addStyle(".col6", "");
	stylesheet.addStyle(".col7", "width:12%");

	/* TableII */
	var tableStyle = stylesheet.addStyle("tableII");
	tableStyle.setAttribute("width", "100%");
	stylesheet.addStyle("table.tableII td", "padding-bottom: 2px; padding-top: 3px");
	//stylesheet.addStyle("table.tableII td", "border:thin solid black");
	stylesheet.addStyle(".col0", "width:4%");
	stylesheet.addStyle(".col1", "width:58%");
	stylesheet.addStyle(".col2", "");
	stylesheet.addStyle(".col3", "width:12%");
	stylesheet.addStyle(".col4", "");
	stylesheet.addStyle(".col5", "width:12%");
	stylesheet.addStyle(".col6", "");
	stylesheet.addStyle(".col7", "width:12%");

	/* TableIII */
	var tableStyle = stylesheet.addStyle("tableIII");
	tableStyle.setAttribute("width", "100%");
	stylesheet.addStyle("table.tableIII td", "padding-bottom: 2px; padding-top: 3px");
	//stylesheet.addStyle("table.tableIII td", "border:thin solid black");
	stylesheet.addStyle(".col0", "width:4%");
	stylesheet.addStyle(".col1", "");

	/* TableIV */
	var tableStyle = stylesheet.addStyle("tableIV");
	tableStyle.setAttribute("width", "100%");
	stylesheet.addStyle("table.tableIV td", "padding-bottom: 2px; padding-top: 3px");
	//stylesheet.addStyle("table.tableIII td", "border:thin solid black");
	return stylesheet;
}
