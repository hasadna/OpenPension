var program = require('commander');
var xlsx = require('./xlsxparser.js');
var db = require('./db.js');


var importers = {
	"migdal" : "./migdalImporter.js",
	"fenix" : "./fenixImporter.js",
	"migdal11" : "./migdalImporter.js"
};
program
	.command("get-cell")
	.description("Get data from a cell")
	.option("-f, --file <path>","file nane")
	.option("-c, --cell <cell>","cell in Excell format: D6 or BA90")
	.option("-s, --sheet <sheet>","sheet name")
	.action(function(args){
  xlsx.getCellValue(args.file, args.sheet, args.cell, function(err, result) {
    console.log("Cell value:", result);
  });
});

program
	.command("list-sheets")
	.description("List available sheets for file")
	.option("-f, --file <path>","file nane")
	.action(function(args){
  xlsx.getFileSheetsNames(args.file, function(err, sheets) {
    console.log("Sheet names:", sheets.join(","));
  });
});

program
	.command("get-dim")
	.description("List dimentions of given sheet")
	.option("-f, --file <path>","file nane")
	.option("-s, --sheet <sheet>","sheet name")
	.action(function(args){
  xlsx.getDimensions(args.file, args.sheet, function(err, dim) {
    console.log(dim);
    // console.log("Sheet names:",sheets.join(","));
  });
});


program
	.command("extract-file")
	.option("-f, --file <name>","file name")
	.action(function(args){
		var name = require('path').basename(args.file).split(".");
		var fund = parseInt(name[2]);
		var year = parseInt("20" + name[3].substr(2,2));
		var q = Math.floor((parseInt(name[3].substr(0,2)) -1) / 3);
		console.log("working on:" + name[0] + " " + year + " " + q);
		require('./genericImporter').parseXls(args.file,name[0],year,q+1, fund);
	});

program
	.command('import')
	.option("-f, --file <name>","file name")
	.option("-y, --year <year>", "year")
	.option("-q, --quarter <quarter>", "quarter")
	.option("-b, --body <body>", "body")
	.option("-m, --monkey <monkey>", "monkey")
	.action(function(args){
		require('./genericImporter').parseXls(args.file, args.body, args.year, args.quarter, parseInt(args.monkey));
	});



program
	.command("ronit")
	.action(function(){
		
		require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.mashlima.659.1211.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.mashlima.659.0912.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.mashlima.659.0613.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.mashlima.659.0612.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.mashlima.659.0313.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.mashlima.659.0312.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.Ishit.162.1212.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.Ishit.162.1211.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.Ishit.162.0912.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.Ishit.162.0613.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.Ishit.162.0612.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.Ishit.162.0313.xlsx", function(){ console.log("done") });
		// require("child_process").exec("node index extract-file -f res/ronit/MigdalMakefet.Ishit.162.0312.xlsx", function(){ console.log("done") });
	});



program
	.command("db")
	.action(function(){
		var map = [
			{ columnName: "instrument_id" },
			{ columnName: "date_of_purchase" }
		];
		var db = require('./db').open(true);
		var tableWriter = db.openTable(map);
		tableWriter("migdal", 2013, 1, "in_id", "in_sub_id", [
			["inst1", "1/10/2004"],
			["inst2", "2/10/2004 x"]
		]);
	});

program
	.command("fetch")
	.action(function(){
		require('./fetcher').fetchAll();
	});

program
	.command("fetch-harel")
	.action(function(){
		require('./fetcher').fetchHarel();
	});

program
	.command("to-csv")
	.description("Convert sheets in file to CSV")
	.option("-f, --file <path>", "file name")
	.option("-t, --type <type>", "file type")
	.option("-s, --sheet <sheet name>", "sheet name")
	.action(function(args) {

				// var sheetName = "מזומנים ושווי מזומנים";
				var sheetName = args.sheet;
				var type = args.type;
				console.log("importers[type]"+importers[type]);
				var importer = require(importers[type]);

					xlsx.openSheet(args.file, sheetName,
						function(err, getCell, dim){
							var result = importer.convert(err, getCell, dim);
							var outputFileName = "output.csv";
							if (result === undefined ){
								return;
							}
							var jsonRows = result.rows;
							var type = result.type;
							if (jsonRows === undefined){
								return;
							}

							// console.log("got result size: " + jsonRows.length);
							var dbwriter = db.open(outputFileName);
							for (var j = 0; j < jsonRows.length; j++){
								err = dbwriter.writeRecord(type, jsonRows[j]);
								if (err) {
									console.log(err);
								// return;
								}
							}
							dbwriter.close();
						}
			);
});

program.parse(process.argv);
