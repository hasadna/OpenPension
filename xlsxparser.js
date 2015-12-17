var XLSX = require('./xlsx');
var XLS = require('xlsjs');
var path = require('path');
var Promise =require('bluebird');
var _ = require('underscore');

var trim = function (s) {
  if (s == undefined) return "";
  if (_.isBoolean(s)) return s.toString();
  s = s.replace(/(^\s*)|(\s*$)/gi, "");
  s = s.replace(/[ ]{2,}/gi, " ");
  s = s.replace(/\n /, "\n");
  return s;
}

var cellIdToCellIdx = function(cellId) {

  var i, col = 0;

  //calc column from letters
  var letters = cellId.replace(/[0-9]/g, '');
  for ( i = 0; i < letters.length; i++) {    
      col += (letters.charCodeAt(i) - 64) * Math.pow(26, i);
  }

  col--;//zero based

  // col can not be larger then 50
  // thats silly
  if (col > 50)
    col = 50;

  //calc row from numbers
  var row = parseInt(cellId.substr(i), 10) - 1;  // the row number the user is looking for (zero-based)

  return {
    row : row,
    col : col
  };
}



exports.getSheets = function(filename){

    var reader;

    return new Promise(function(resolve, reject){
      try{
        if (path.extname(filename).toLowerCase() == ".xls"){
          reader = XLS;
        }
        else if (path.extname(filename).toLowerCase() == ".xlsx"){
          reader = XLSX;
        }

        if (reader == undefined){
          console.log("No reader found for: "+ filename)
        }


      
        var workbook = reader.readFile(filename);
      }
      catch(ex){
        console.log(ex);
        console.log(ex.stack);
        reject("xlsparser.js: error parsing file: " + filename + ", "+ex);
      }

      resolve(workbook);

    });

}


exports.getDimension = function(workbook, sheetName) {
  var splt;

  if (workbook.Sheets[sheetName]['!ref'] == undefined){
    splt = "A1:A1".split(":");
  }
  else{
    splt = workbook.Sheets[sheetName]['!ref'].split(":")
  }

  return {
    min : cellIdToCellIdx(splt[0] || 'A1'),
    max : cellIdToCellIdx(splt[1] || 'A1')
  };
};
 
exports.readCell = function(workbook, sheetName, cellId){
      var cellContent;

      if (workbook.Sheets[sheetName][cellId] == undefined){
        cellContent = "";
      }
      else{
        cellContent = workbook.Sheets[sheetName][cellId].v;
        
        //number is in percent form
        if ( workbook.Sheets[sheetName][cellId].w &&
          workbook.Sheets[sheetName][cellId].w.indexOf("%") > -1 &&
            (
              Number(workbook.Sheets[sheetName][cellId].w.replace(/[^\d.-]/g, '')) == 0 ||
              Number(workbook.Sheets[sheetName][cellId].w.replace(/[^\d.-]/g, '')) / cellContent > 10
            )
          ){
            cellContent = cellContent * 100;
        }

      }

      if (typeof cellContent === "number") {
        cellContent = cellContent.toString();
      }

      return trim(cellContent);
}

