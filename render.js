const XLSX = require("xlsx");
const pokemonNames = require("./pokemonNames.js");
const pokemonMoves = require("./pokemonMoves.js");
const shell = require("shelljs");

module.exports = function (data) {
    const sheet = {};
    const workBook = {
        SheetNames: ["Data"],
        Sheets: { Data: sheet }
    };
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
        "Caught/Hatched",
        "Att",
        "Def",
        "Sta"
    ];
    renderRow(sheet, 0, header);

    for (let i = 0; i < data.length; i++) {
        const p = data[i];
        const localTimeStamp = p.timestamp;
        localTimeStamp.setUTCMinutes(localTimeStamp.getUTCMinutes() - localTimeStamp.getTimezoneOffset());

        renderRow(sheet, i + 1, [
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
    }

    const range = { s: { r: 0, c: 0 }, e: { r: data.length, c: header.length - 1 } };
    sheet["!ref"] = XLSX.utils.encode_range(range);

    const fileName = "result.xlsx";
    XLSX.writeFile(workBook, fileName);
    shell.exec(fileName);
};

function renderRow(sheet, rowNum, data) {
    for (let i = 0; i < data.length; i++) {
        const cellAddr = XLSX.utils.encode_cell({ r: rowNum, c: i });
        sheet[cellAddr] = createCell(data[i]);
    }
}

function createCell(value) {
    const cell = { v: value };
    if (cell.v !== null) {
        if (typeof cell.v === 'number') {
            cell.t = 'n';
        } else if (typeof cell.v === 'boolean') {
            cell.t = 'b';
        } else if (cell.v instanceof Date) {
            cell.t = 'd';            
        }
        else cell.t = 's';
    }
    return cell;
}