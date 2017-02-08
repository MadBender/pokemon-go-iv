const pokemonNames = require("./pokemonNames.js");
const pokemonMoves = require("./pokemonMoves.js");
const shell = require("shelljs");
const xl = require('excel4node');

module.exports = function (data) {
    const wb = new xl.Workbook();
    const sheet = wb.addWorksheet("Data");    

    const dateStyle = wb.createStyle({
        numberFormat: "yyyy-mm-dd hh:mm:ss"
    });

    const header = [
        "Number",
        "Specie",
        "Name",        
        "CP",
        "IV",
        "Level",
        "HP",
        "Max HP",
        "Quick Move",
        "Charge Move",
        "Obtained",
        "Att",
        "Def",
        "Sta"
    ];
        
    renderRow(sheet, 1, header);

    for (let i = 0; i < data.length; i++) {
        const p = data[i];
        const localTimeStamp = p.timestamp;
        const rowNumber = i + 2;
        localTimeStamp.setUTCMinutes(localTimeStamp.getUTCMinutes() - localTimeStamp.getTimezoneOffset());

        renderRow(sheet, rowNumber, [
            p.pokemonId,
            pokemonNames[p.pokemonId],
            p.name,
            p.cp,
            Math.round(p.iv),
            p.level,
            p.hp,
            p.maxHp,
            pokemonMoves[p.quickMove] || p.quickMove,
            pokemonMoves[p.chargeMove] || p.chargeMove,
            localTimeStamp,
            p.attack,
            p.defence,
            p.stamina
        ]);
        sheet.cell(rowNumber, 11).style(dateStyle);
    }
        
    sheet.row(1).freeze();
    sheet.row(1).filter({});
    setColumnWidths(sheet, [9, 11, 14, 7, 7, 7, 7, 7, 14, 14, 20, 7, 7, 7]);

    //saving
    const fileName = "result.xlsx";
    wb.write(fileName, function () {
        shell.exec(fileName);
    });
};

function renderRow(sheet, rowNum, data) {
    for (let i = 0; i < data.length; i++) {
        const cell = sheet.cell(rowNum, i + 1);
        const d = data[i];
        if (typeof (d) == "string") {
            cell.string(d);
        } else if (typeof (d) == "number") {
            cell.number(d);
        } else if (d instanceof Date) {
            cell.date(d);
        }
    }
}

function setColumnWidths(sheet, widths) {
    for (let i = 0; i < widths.length; i++) {
        sheet.column(i + 1).setWidth(widths[i]);
    }
}