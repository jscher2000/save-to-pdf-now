/* 
	Save to PDF now
	Copyright 2023. Jefferson "jscher2000" Scher. License: MPL-2.0.
	Contains some code from Printable - The Print Doctor © 2021
	version 0.5 - initial design
	version 0.7 - long page initial design
*/

/**** Retrieve Preferences from Storage and Initialize Form ****/

// Default starting values
let oPDFPrefs = {
	override: false,				// Use current default values for everything
	orientation: 0,					// 0 = portrait, 1 = landscape
	paperSize: 'L',					// L = Letter, A4 = A4, L100 = 8.5" x 100"
	paperLength: 100,				// L100 custom paper length (width TODO)
	shrinkToFit: true,				// shrinkToFit
	scaling: 1.0,					// scaling
	bgcolor: true,					// showBackgroundColors
	bgimages: true,					// showBackgroundImages
	headerLeftOverride: false,		// use current default left header
	headerLeftText: '&T',			// left header = title
	headerCenterOverride: false,	// use current default center header
	headerCenterText: '',			// center header = blank
	headerRightOverride: false,		// use current default right header
	headerRightText: '&U',			// right header = URL
	footerLeftOverride: false,		// use current default left footer
	footerLeftText: '&PT',			// left footer = page x of y
	footerCenterOverride: false,	// use current default center footer
	footerCenterText: '',			// center footer = blank
	footerRightOverride: false,		// use current default right footer
	footerRightText: '&D',			// right footer = date
	edgeOverride: false,			// use current default edge values
	edgeDistance: 0.2, 				// custom edge value in inches (applied to all 4 edges)
	marginOverride: false,			// current default edge values
	marginTop: 0.5, 				// top margin in inches
	marginRight: 0.5, 				// right margin in inches
	marginBottom: 0.5, 				// bottom margin in inches
	marginLeft: 0.5, 				// left margin in inches
	shiftToPrint: true				// whether Shift+clicking toolbar button prints (or shows the popup)
}
// Update oPDFPrefs from storage
var updtPrefs = browser.storage.local.get("PDFprefs").then((results) => {
	if (results.PDFprefs != undefined){
		if (JSON.stringify(results.PDFprefs) != '{}'){
			var arrSavedPrefs = Object.keys(results.PDFprefs)
			for (var j=0; j<arrSavedPrefs.length; j++){
				oPDFPrefs[arrSavedPrefs[j]] = results.PDFprefs[arrSavedPrefs[j]];
			}
		} else {
			window.alert('Unable to read saved preferences!');
		}
	}
}).catch((err) => {console.log('Error retrieving "PDFprefs" from storage: '+err.message);});

// Fix up form starting values
updtPrefs.then(() => {
	var frm = document.querySelector('form[name="pdf"]');
	// Overrider
	frm.override.value = oPDFPrefs.override; 
	if (oPDFPrefs.override == true){
		var customs = document.querySelectorAll('.customsettings'), i;
		for (i=0; i<customs.length; i++){
			customs[i].classList.remove('disabled');
		}
	}
	// Basic settings
	frm.orientation.value = oPDFPrefs.orientation;
	frm.paper.value = oPDFPrefs.paperSize;
	frm.paperlength.value = parseInt(oPDFPrefs.paperLength);
	if (oPDFPrefs.shrinkToFit == true){
		frm.scale.value = 'shrinkToFit';
	} else {
		frm.scale.value = oPDFPrefs.scaling;
	}
	frm.showBackgroundColors.checked = oPDFPrefs.bgcolor;
	frm.showBackgroundImages.checked = oPDFPrefs.bgimages;
	// Margins
	frm.marginOverride.value = oPDFPrefs.marginOverride;
	frm.marginTop.value = oPDFPrefs.marginTop;
	frm.marginBottom.value = oPDFPrefs.marginBottom;
	frm.marginLeft.value = oPDFPrefs.marginLeft;
	frm.marginRight.value = oPDFPrefs.marginRight;
	if (oPDFPrefs.marginOverride == true){
		frm.marginTop.removeAttribute('disabled');
		frm.marginBottom.removeAttribute('disabled');
		frm.marginLeft.removeAttribute('disabled');
		frm.marginRight.removeAttribute('disabled');
	}
	frm.edgeOverride.value = oPDFPrefs.edgeOverride;
	frm.edgeDistance.value = oPDFPrefs.edgeDistance;
	if (oPDFPrefs.edgeOverride == true) frm.edgeDistance.removeAttribute('disabled');
	// Headers and Footers
	if (oPDFPrefs.headerLeftOverride == false){
		frm.headerLeft.value = '-1';
	} else {
		if (oPDFPrefs.headerLeftText == ''){
			frm.headerLeft.value = '0';
		} else {
			frm.headerLeft.value = oPDFPrefs.headerLeftText;
		}
	}
	if (oPDFPrefs.headerCenterOverride == false){
		frm.headerCenter.value = '-1';
	} else {
		if (oPDFPrefs.headerCenterText == ''){
			frm.headerCenter.value = '0';
		} else {
			frm.headerCenter.value = oPDFPrefs.headerCenterText;
		}
	}
	if (oPDFPrefs.headerRightOverride == false){
		frm.headerRight.value = '-1';
	} else {
		if (oPDFPrefs.headerRightText == ''){
			frm.headerRight.value = '0';
		} else {
			frm.headerRight.value = oPDFPrefs.headerRightText;
		}
	}
	if (oPDFPrefs.footerLeftOverride == false){
		frm.footerLeft.value = '-1';
	} else {
		if (oPDFPrefs.footerLeftText == ''){
			frm.footerLeft.value = '0';
		} else {
			frm.footerLeft.value = oPDFPrefs.footerLeftText;
		}
	}
	if (oPDFPrefs.footerCenterOverride == false){
		frm.footerCenter.value = '-1';
	} else {
		if (oPDFPrefs.footerCenterText == ''){
			frm.footerCenter.value = '0';
		} else {
			frm.footerCenter.value = oPDFPrefs.footerCenterText;
		}
	}
	if (oPDFPrefs.footerRightOverride == false){
		frm.footerRight.value = '-1';
	} else {
		if (oPDFPrefs.footerRightText == ''){
			frm.footerRight.value = '0';
		} else {
			frm.footerRight.value = oPDFPrefs.footerRightText;
		}
	}
	// Toolbar button preference
	frm.shiftToPrint.value = oPDFPrefs.shiftToPrint; // boolean to string works?
});

/**** Set up Event Handlers ****/

// Button functions
function saveAsPDF(evt){
	// Update PDF prefs and keep track of changes for potential saving to storage
	var frm = evt.target.form;
	var changed = false;
	// Overrider
	if (frm.override.value == 'true' && oPDFPrefs.override == false) {
		changed = true;
		oPDFPrefs.override = true;
	} else if (frm.override.value == 'false' && oPDFPrefs.override == true) {
		changed = true;
		oPDFPrefs.override = false;
	}
	// Basic settings
	if (oPDFPrefs.orientation !== parseInt(frm.orientation.value)){
		changed = true;
		oPDFPrefs.orientation = parseInt(frm.orientation.value);
	}
	if (oPDFPrefs.paperSize !== frm.paper.value){
		changed = true;
		oPDFPrefs.paperSize = frm.paper.value;
	}
	if (oPDFPrefs.paperLength !== parseInt(frm.paperlength.value)){
		changed = true;
		oPDFPrefs.paperLength = parseInt(frm.paperlength.value);
	}
	if (frm.scale.value == 'shrinkToFit'){
		if (oPDFPrefs.shrinkToFit !== true){
			changed = true;
			oPDFPrefs.shrinkToFit = true;
		}
	} else {
		if (oPDFPrefs.shrinkToFit !== false){
			changed = true;
			oPDFPrefs.shrinkToFit = false;
		}
		if (oPDFPrefs.scaling !== parseFloat(frm.scale.value)){
			changed = true;
			oPDFPrefs.scaling = parseFloat(frm.scale.value);
		}
	}
	if (oPDFPrefs.bgcolor !== frm.showBackgroundColors.checked){
		changed = true;
		oPDFPrefs.bgcolor = frm.showBackgroundColors.checked;
	}
	if (oPDFPrefs.bgimages !== frm.showBackgroundImages.checked){
		changed = true;
		oPDFPrefs.bgimages = frm.showBackgroundImages.checked;
	}

	// Margins
	if (frm.marginOverride.value == 'true' && oPDFPrefs.marginOverride == false) {
		changed = true;
		oPDFPrefs.marginOverride = true;
	} else if (frm.marginOverride.value == 'false' && oPDFPrefs.marginOverride == true) {
		changed = true;
		oPDFPrefs.marginOverride = false;
	}
	if (oPDFPrefs.marginTop !== parseFloat(frm.marginTop.value)){
		if (parseFloat(frm.marginTop.value) >= 0.01 && parseFloat(frm.marginTop.value) <= 1.50){
			changed = true;
			oPDFPrefs.marginTop = parseFloat(frm.marginTop.value);
		} else { // it's not valid but somehow wasn't fixed; reset the form
			frm.marginTop.value = oPDFPrefs.marginBottom;
		}
	}
	if (oPDFPrefs.marginBottom !== parseFloat(frm.marginBottom.value)){
		if (parseFloat(frm.marginBottom.value) >= 0.01 && parseFloat(frm.marginBottom.value) <= 1.50){
			changed = true;
			oPDFPrefs.marginBottom = parseFloat(frm.marginBottom.value);
		} else { // it's not valid but somehow wasn't fixed; reset the form
			frm.marginBottom.value = oPDFPrefs.marginBottom;
		}
	}
	if (oPDFPrefs.marginLeft !== parseFloat(frm.marginLeft.value)){
		if (parseFloat(frm.marginLeft.value) >= 0.01 && parseFloat(frm.marginLeft.value) <= 1.50){
			changed = true;
			oPDFPrefs.marginLeft = parseFloat(frm.marginLeft.value);
		} else { // it's not valid but somehow wasn't fixed; reset the form
			frm.marginLeft.value = oPDFPrefs.marginLeft;
		}
	}
	if (oPDFPrefs.marginRight !== parseFloat(frm.marginRight.value)){
		if (parseFloat(frm.marginRight.value) >= 0.01 && parseFloat(frm.marginRight.value) <= 1.50){
			changed = true;
			oPDFPrefs.marginRight = parseFloat(frm.marginRight.value);
		} else { // it's not valid but somehow wasn't fixed; reset the form
			frm.marginRight.value = oPDFPrefs.marginRight;
		}
	}
	if (frm.edgeOverride.value == 'true' && oPDFPrefs.edgeOverride == false) {
		changed = true;
		oPDFPrefs.edgeOverride = true;
	} else if (frm.edgeOverride.value == 'false' && oPDFPrefs.edgeOverride == true) {
		changed = true;
		oPDFPrefs.edgeOverride = false;
	}
	if (oPDFPrefs.edgeDistance !== parseFloat(frm.edgeDistance.value)){
		if (parseFloat(frm.edgeDistance.value) >= 0.01 && parseFloat(frm.edgeDistance.value) <= 0.50){
			changed = true;
			oPDFPrefs.edgeDistance = parseFloat(frm.edgeDistance.value);
		} else { // it's not valid but somehow wasn't fixed; reset the form
			frm.edgeDistance.value = oPDFPrefs.edgeDistance;
		}
	}

	// Headers and Footers
	if (frm.headerLeft.value == '-1'){
		if (oPDFPrefs.headerLeftOverride == true){
			changed = true;
			oPDFPrefs.headerLeftOverride = false;
		}
	} else {
		if (oPDFPrefs.headerLeftOverride == false){
			changed = true;
			oPDFPrefs.headerLeftOverride = true;
		}
		if (frm.headerLeft.value == '0' && oPDFPrefs.headerLeftText != ''){
			changed = true;
			oPDFPrefs.headerLeftText = '';
		} else if (oPDFPrefs.headerLeftText != frm.headerLeft.value){
			changed = true;
			oPDFPrefs.headerLeftText = frm.headerLeft.value;
		}
	}
	if (frm.headerCenter.value == '-1'){
		if (oPDFPrefs.headerCenterOverride == true){
			changed = true;
			oPDFPrefs.headerCenterOverride = false;
		}
	} else {
		if (oPDFPrefs.headerCenterOverride == false){
			changed = true;
			oPDFPrefs.headerCenterOverride = true;
		}
		if (frm.headerCenter.value == '0' && oPDFPrefs.headerCenterText != ''){
			changed = true;
			oPDFPrefs.headerCenterText = '';
		} else if (oPDFPrefs.headerCenterText != frm.headerCenter.value){
			changed = true;
			oPDFPrefs.headerCenterText = frm.headerCenter.value;
		}
	}
	if (frm.headerRight.value == '-1'){
		if (oPDFPrefs.headerRightOverride == true){
			changed = true;
			oPDFPrefs.headerRightOverride = false;
		}
	} else {
		if (oPDFPrefs.headerRightOverride == false){
			changed = true;
			oPDFPrefs.headerRightOverride = true;
		}
		if (frm.headerRight.value == '0' && oPDFPrefs.headerRightText != ''){
			changed = true;
			oPDFPrefs.headerRightText = '';
		} else if (oPDFPrefs.headerRightText != frm.headerRight.value){
			changed = true;
			oPDFPrefs.headerRightText = frm.headerRight.value;
		}
	}
	if (frm.footerLeft.value == '-1'){
		if (oPDFPrefs.footerLeftOverride == true){
			changed = true;
			oPDFPrefs.footerLeftOverride = false;
		}
	} else {
		if (oPDFPrefs.footerLeftOverride == false){
			changed = true;
			oPDFPrefs.footerLeftOverride = true;
		}
		if (frm.footerLeft.value == '0' && oPDFPrefs.footerLeftText != ''){
			changed = true;
			oPDFPrefs.footerLeftText = '';
		} else if (oPDFPrefs.footerLeftText != frm.footerLeft.value){
			changed = true;
			oPDFPrefs.footerLeftText = frm.footerLeft.value;
		}
	}
	if (frm.footerCenter.value == '-1'){
		if (oPDFPrefs.footerCenterOverride == true){
			changed = true;
			oPDFPrefs.footerCenterOverride = false;
		}
	} else {
		if (oPDFPrefs.footerCenterOverride == false){
			changed = true;
			oPDFPrefs.footerCenterOverride = true;
		}
		if (frm.footerCenter.value == '0' && oPDFPrefs.footerCenterText != ''){
			changed = true;
			oPDFPrefs.footerCenterText = '';
		} else if (oPDFPrefs.footerCenterText != frm.footerCenter.value){
			changed = true;
			oPDFPrefs.footerCenterText = frm.footerCenter.value;
		}
	}
	if (frm.footerRight.value == '-1'){
		if (oPDFPrefs.footerRightOverride == true){
			changed = true;
			oPDFPrefs.footerRightOverride = false;
		}
	} else {
		if (oPDFPrefs.footerRightOverride == false){
			changed = true;
			oPDFPrefs.footerRightOverride = true;
		}
		if (frm.footerRight.value == '0' && oPDFPrefs.footerRightText != ''){
			changed = true;
			oPDFPrefs.footerRightText = '';
		} else if (oPDFPrefs.footerRightText != frm.footerRight.value){
			changed = true;
			oPDFPrefs.footerRightText = frm.footerRight.value;
		}
	}

	// Toolbar button preference
	if (frm.shiftToPrint.value == 'true' && oPDFPrefs.shiftToPrint == false) {
		changed = true;
		oPDFPrefs.shiftToPrint = true;
	} else if (frm.shiftToPrint.value == 'false' && oPDFPrefs.shiftToPrint == true) {
		changed = true;
		oPDFPrefs.shiftToPrint = false;
	}

	// Save IF requested and IF changed
	if (evt.target.id == 'btnSaveGo' && changed){
		browser.storage.local.set({PDFprefs: oPDFPrefs})
			.catch((err) => {console.log('Error on browser.storage.local.set(): '+err.message);});
	}

	// Make that PDF
	if (oPDFPrefs.override == false){
		browser.tabs.saveAsPDF({});
	} else {
		// Set up the pageSettings object for PDF'ing
		var pageSettings = {};
		console.log(oPDFPrefs);
		// Basic settings
		pageSettings.orientation = oPDFPrefs.orientation
		if (oPDFPrefs.paperSize == 'A4'){
			pageSettings.paperSizeUnit = 1;
			pageSettings.paperHeight = 297;
			pageSettings.paperWidth = 210;
		} else if (oPDFPrefs.paperSize == 'L100'){
				pageSettings.paperSizeUnit = 0;
				pageSettings.paperHeight = oPDFPrefs.paperLength;
				pageSettings.paperWidth = 8.5;
		} else {
				// browser defaults to letter dimensions, so nothing to set here
		}
		if (oPDFPrefs.shrinkToFit == false){
			pageSettings.shrinkToFit = false;
			pageSettings.scaling = oPDFPrefs.scaling;
		} else {
			// browser default to shrinkToFit = true, so nothing to set here
		}
		pageSettings.showBackgroundColors = oPDFPrefs.bgcolor;
		pageSettings.showBackgroundImages = oPDFPrefs.bgimages;
		// Margins
		if (oPDFPrefs.marginOverride == true){
			pageSettings.marginTop = oPDFPrefs.marginTop;
			pageSettings.marginBottom = oPDFPrefs.marginBottom;
			pageSettings.marginLeft = oPDFPrefs.marginLeft;
			pageSettings.marginRight = oPDFPrefs.marginRight;
		}
		if (oPDFPrefs.edgeOverride == true){
			pageSettings.edgeTop = oPDFPrefs.edgeDistance;
			pageSettings.edgeBottom = oPDFPrefs.edgeDistance;
			pageSettings.edgeLeft = oPDFPrefs.edgeDistance;
			pageSettings.edgeRight = oPDFPrefs.edgeDistance;
		}
		// Headers and Footers
		if (oPDFPrefs.headerLeftOverride == true){
			pageSettings.headerLeft = oPDFPrefs.headerLeftText;
		}
		if (oPDFPrefs.headerCenterOverride == true){
			pageSettings.headerCenter = oPDFPrefs.headerCenterText;
		}
		if (oPDFPrefs.headerRightOverride == true){
			pageSettings.headerRight = oPDFPrefs.headerRightText;
		}
		if (oPDFPrefs.footerLeftOverride == true){
			pageSettings.footerLeft = oPDFPrefs.footerLeftText;
		}
		if (oPDFPrefs.footerCenterOverride == true){
			pageSettings.footerCenter = oPDFPrefs.footerCenterText;
		}
		if (oPDFPrefs.footerRightOverride == true){
			pageSettings.footerRight = oPDFPrefs.footerRightText;
		}
		// We're ready to go!
		console.log(pageSettings);				
		browser.tabs.saveAsPDF(pageSettings);
	}
}
document.getElementById('btnSaveGo').addEventListener('click', saveAsPDF, false);
document.getElementById('btnGo').addEventListener('click', saveAsPDF, false);
document.querySelector('input[name="paperlength"]').addEventListener('click', function(evt){
	// transfer this click to the radio button
	var brad = evt.target.previousElementSibling;
	if (brad.checked != true) brad.checked = true;
}, false);

// Toggle opacity of form controls
document.getElementById('overrider').addEventListener('change', function(evt){
	// Get radio value
	var frm = evt.target.form, customs = document.querySelectorAll('.customsettings'), i;
	if (frm.override.value == 'true'){
		for (i=0; i<customs.length; i++){
			customs[i].classList.remove('disabled');
		}
	} else {
		for (i=0; i<customs.length; i++){
			customs[i].classList.add('disabled');
		}
	}
}, false);

// Correct floating values if in excess of parameters
document.getElementById('floatValidation').addEventListener('change', function(evt){
	console.log(evt);
	var tgt = evt.target;
	if (tgt.type == 'text'){
		var user = parseFloat(tgt.value);
		if (tgt.getAttribute('name') == 'edgeDistance'){
			var max = 0.50;
		} else {
			max = 1.50;
		}
		if (user < 0.01){
			tgt.value = 0.01;
			window.setTimeout(function(){tgt.focus()}, 25);
		} 
		if (user > max){
			tgt.value = max;
			window.setTimeout(function(){tgt.focus()}, 25);
		}
	} else if (tgt.type == 'radio'){
		var frm = tgt.form;
		if (tgt.value == 'true'){
			// Enable relevant text inputs
			if (tgt.name == 'marginOverride'){
				frm.marginTop.removeAttribute('disabled');
				frm.marginBottom.removeAttribute('disabled');
				frm.marginLeft.removeAttribute('disabled');
				frm.marginRight.removeAttribute('disabled');
			} else if (tgt.name == 'edgeOverride'){
				frm.edgeDistance.removeAttribute('disabled');
			}
		} else {
			// Disable relevant text inputs
			if (tgt.name == 'marginOverride'){
				frm.marginTop.setAttribute('disabled', 'disabled');
				frm.marginBottom.setAttribute('disabled', 'disabled');
				frm.marginLeft.setAttribute('disabled', 'disabled');
				frm.marginRight.setAttribute('disabled', 'disabled');
			} else if (tgt.name == 'edgeOverride'){
				frm.edgeDistance.setAttribute('disabled', 'disabled');
			}
		}
	}
}, false);

// Don't submit form
document.querySelector('form[name="pdf"]').addEventListener('submit', function(){return false;}, false);
