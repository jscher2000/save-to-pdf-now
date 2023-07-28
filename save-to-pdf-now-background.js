/* 
	Save to PDF now
	Copyright 2023. Jefferson "jscher2000" Scher. License: MPL-2.0.
	Contains some code from Printable - The Print Doctor © 2021
	version 0.5 - initial design
	version 0.6 - keyboard shortcut
	version 0.7 - long page initial design
*/

/**** Set up/retrieve PDF Preferences ****/

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
browser.storage.local.get("PDFprefs").then((results) => {
	if (results.PDFprefs != undefined){		
		var arrSavedPrefs = Object.keys(results.PDFprefs)
		for (var j=0; j<arrSavedPrefs.length; j++){
			oPDFPrefs[arrSavedPrefs[j]] = results.PDFprefs[arrSavedPrefs[j]];
		}
	} else {
		// first run? TODO: error handling?
		browser.storage.local.set({PDFprefs: oPDFPrefs});
	}
});

// Bulk update if storage changes in the popup
browser.storage.onChanged.addListener((changes, areaName) => {
	browser.storage.local.get("PDFprefs").then((results) => {
		if (results.PDFprefs != undefined){
			if (JSON.stringify(results.PDFprefs) != '{}'){
				oPDFPrefs = results.PDFprefs;
			}
		}
	});
});

/**** Set up toolbar button listener ****/

// Listen for button click and show popup
browser.browserAction.onClicked.addListener((currTab, clickData) => {
	// Check for Shift key to modify preferences
	if (oPDFPrefs.shiftToPrint == true){
		if (clickData.modifiers.includes('Shift')){
			// Make the PDF
			makePDF();
		} else {
			// Open popup
			browser.browserAction.setPopup({popup: browser.runtime.getURL('save-to-pdf-now-popup.html')})
			.then(browser.browserAction.openPopup())
			.then(browser.browserAction.setPopup({popup: ''}));
		}
	} else {
		if (clickData.modifiers.includes('Shift')){
			// Open popup
			browser.browserAction.setPopup({popup: browser.runtime.getURL('save-to-pdf-now-popup.html')})
			.then(browser.browserAction.openPopup())
			.then(browser.browserAction.setPopup({popup: ''}));
		} else {
			// Make the PDF
			makePDF();
		}
	}
});

function makePDF() {
	// Make that PDF
	if (oPDFPrefs.override == false){
		// Do not send custom settings
		browser.tabs.saveAsPDF({});
	} else {
		// Set up the pageSettings object for PDF'ing
		var pageSettings = {};
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
		browser.tabs.saveAsPDF(pageSettings);
	}
}

/**** Set up Right-click context menu integration ****/

browser.menus.create({
  id: "context_save_to_pdf_now",
  title: "Save to PDF now (Shift+click for options)",
  contexts: ["page", "frame", "audio", "image", "link", "selection", "video"],
  icons: {
	"64": "icons/save-pdf-256-light.png"
  }
})
browser.menus.onClicked.addListener((menuInfo, currTab) => {
	// Check for Shift key to modify preferences
	if (menuInfo.modifiers.includes('Shift')){
		// Open popup - TODO doesn't work in popup window, need to launch a window for this
		browser.browserAction.setPopup({popup: browser.runtime.getURL('save-to-pdf-now-popup.html')})
		.then(browser.browserAction.openPopup())
		.then(browser.browserAction.setPopup({popup: ''}));
	} else {
		// Make the PDF
		makePDF();
	}
});

/**** Set up keyboard shortcut handler ****/
browser.commands.onCommand.addListener((strName) => {
	if (strName == 'save-to-pdf-now') makePDF();
});