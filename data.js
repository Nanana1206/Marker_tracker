// Предустановленные данные о маркерах пользователя
// Данные генерируются программatically из компактных описаний

// ==================== УТИЛИТЫ ГЕНЕРАЦИИ ====================

// Сгенерировать маркеры для числового диапазона (GuangNa)
function generateNumericRange(brand, start, end) {
    const result = {};
    for (let i = start; i <= end; i++) {
        const code = String(i);
        result[`${brand}_${code}`] = { brand, code, quantity: 1 };
    }
    return result;
}

// Сгенерировать маркеры из массива кодов
function generateFromCodes(brand, codes) {
    const result = {};
    for (const code of codes) {
        result[`${brand}_${code}`] = { brand, code, quantity: 1 };
    }
    return result;
}

// Сгенерировать маркеры для группы с префиксом и диапазоном номеров
function generatePrefixedGroup(brand, prefix, start, end) {
    const result = {};
    for (let i = start; i <= end; i++) {
        const code = `${prefix}${i}`;
        result[`${brand}_${code}`] = { brand, code, quantity: 1 };
    }
    return result;
}

// ==================== ОПИСАНИЯ НАБОРОВ ====================

// GuangNa: числовой диапазон 600-887 (288 цветов)
const GUANGNA_RANGE = { start: 600, end: 887 };

// GuangNa: дополнительные маркеры (увеличенное количество)
const GUANGNA_EXTRA = {
    "601": 2, "610": 2, "612": 2, "624": 2, "626": 2,
    "643": 2, "650": 3, "658": 2, "667": 2, "672": 2,
    "683": 2, "701": 2, "704": 2, "719": 2, "723": 2,
    "769": 2, "779": 3, "780": 2, "791": 3, "806": 2
};

// Languo: группы цветов с префиксами
const LANGUO_GROUPS = [
    { prefix: "RY", start: 1, end: 15 },
    { prefix: "GR", start: 101, end: 115 },
    { prefix: "GR", start: 1010, end: 1013 },
    { prefix: "BL", start: 201, end: 215 },
    { prefix: "PU", start: 301, end: 321 },
    { prefix: "GB", start: 401, end: 412 },
    { prefix: "CS", start: 501, end: 511 },
    { prefix: "CS", start: 141, end: 149 },
    { prefix: "HC", start: 601, end: 609 },
    { prefix: "HC", start: 131, end: 139 },
    { prefix: "BR", start: 701, end: 715 },
    { prefix: "PC", start: 801, end: 818 },
    { prefix: "CB", start: 901, end: 910 },
    { prefix: "LC", start: 111, end: 119 },
    { prefix: "YE", start: 121, end: 136 },
    { prefix: "YE", start: 1210, end: 1212 },
    { prefix: "SG", start: 151, end: 159 },
    { prefix: "DB", start: 161, end: 169 },
    { prefix: "DB", start: 1610, end: 1612 },
    { prefix: "LC", start: 191, end: 199 },
    { prefix: "LC", start: 1110, end: 1110 },
    { prefix: "DS", start: 181, end: 189 },
    { prefix: "AG", start: 171, end: 179 }
];

// Grasp: массив кодов (не поддаются генерации по шаблону)
const GRASP_CODES = [
    "W01", "B117", "B815", "Y906", "R109", "R218", "R848", "B028",
    "G227", "R605", "R835", "Y128", "B215", "B118", "Y713", "R238",
    "R144", "Y145", "Y146", "R149", "R765", "B153", "R260", "G202",
    "B119", "P345", "Y788", "P445", "R128", "R698", "P290", "Y792",
    "G687", "B688", "B689", "B690", "R691", "NG693", "G694", "G695",
    "G697", "R158", "R701", "F702", "F703", "R704", "W706", "R707",
    "O548", "R207", "Y320", "Y791", "F08", "P207", "R150", "R201",
    "Y206", "R269", "F01", "B781", "Y276", "R761", "Y771", "R789",
    "R790", "B207", "Y123", "Y415", "Y762", "F07", "R548", "BR764",
    "O5115", "O299", "M04", "M09", "Y210", "R211", "Y416", "F786",
    "F04", "R787", "F06", "R692", "R754", "R755", "R784", "R760",
    "R759", "R151", "R766", "Y209", "R758", "Y208", "BR763", "BR762",
    "G774", "G279", "G776", "G281", "G770", "G519", "G275", "G154",
    "G772", "G152", "G777", "G775", "G147", "B148", "B793", "B778",
    "G773", "B782", "B779", "B780", "G699", "B278", "NG767", "R705",
    "R783", "R757", "R785", "R714", "BR756", "NG274", "NG769", "NG270",
    "NG768", "NG272", "NG212", "NG271", "G183", "R344", "GY376", "Y408",
    "GY404", "BG148", "B166", "GY209", "P5115", "Y160", "G250", "R146",
    "P520", "BG344", "FP03", "GY504", "Y507", "P588", "Y405", "M01",
    "M02", "M03", "M05", "M06", "M07", "M08", "M10", "M11", "M12"
];

// ==================== УТИЛИТЫ РАСПАКОВКИ НАБОРОВ ====================

// Распаковать массив диапазонов чисел в массив строковых кодов
// Формат: [[600,620], [622,630], 658] → ["600","601",...,"620","622",...,"630","658"]
function expandRanges(ranges) {
    const codes = [];
    for (const r of ranges) {
        if (Array.isArray(r)) {
            for (let i = r[0]; i <= r[1]; i++) codes.push(String(i));
        } else {
            codes.push(String(r));
        }
    }
    return codes;
}

// Распаковать массив диапазонов Languo с префиксами
// Формат: [["RY",1,9], ["GR",101,109]] → ["RY01","RY02",...,"RY09","GR101",...,"GR109"]
function expandLanguoRanges(ranges) {
    const codes = [];
    for (const r of ranges) {
        const prefix = r[0];
        const start = r[1];
        const end = r[2];
        for (let i = start; i <= end; i++) codes.push(`${prefix}${i}`);
    }
    return codes;
}

// ==================== НАБОРЫ МАРКЕРОВ (для быстрого добавления) ====================

const MARKER_SETS = {
    GuangNa: [
        {
            name: "GuangNa 120",
            count: 120,
            ranges: [[600,620],[622,630],[633,635],[637,639],[643,646],[648,652],[654,656],658,[663,676],[678,691],[693,697],[700,704],[706,707],717,719,723,725,[727,745],802,819,820,[822,824],832,853]
        },
        {
            name: "GuangNa 168",
            count: 168,
            ranges: [[600,620],[622,630],[633,635],[637,639],[643,646],[648,652],[654,656],658,659,[663,676],[678,691],[693,697],[700,704],[706,707],712,717,719,723,725,[727,745],[767,800],802,809,[818,824],832,833,836,[853,856],859,869,872,873]
        },
        {
            name: "GuangNa 200",
            count: 200,
            ranges: [[600,620],[622,635],[637,639],[643,646],[648,652],[654,656],658,[659,661],[663,704],[706,710],[712,717],719,720,723,725,[727,745],753,759,760,762,763,[765,802],805,808,809,813,[816,824],826,828,832,833,836,[853,856],859,869,872,873]
        },
        {
            name: "GuangNa 240",
            count: 240,
            ranges: [[600,717],[719,828],832,833,836,837,[853,856],859,869,872,873]
        },
        {
            name: "GuangNa 288",
            count: 288,
            ranges: [[600,887]]
        },
        {
            name: "GuangNa 360",
            count: 360,
            ranges: [[600,959]]
        },
        {
            name: "GuangNa 366",
            count: 366,
            ranges: [[600,965]]
        }
    ],
    Languo: [
        // === Пачки по 9 маркеров (23 набора) ===
        {
            name: "Red Yellow (9шт)",
            count: 9,
            codes: ["RY01","RY02","RY03","RY04","RY05","RY06","RY07","RY08","RY09"]
        },
        {
            name: "Green (9шт)",
            count: 9,
            codes: ["GR101","GR102","GR103","GR104","GR105","GR106","GR107","GR108","GR109"]
        },
        {
            name: "Blue (9шт)",
            count: 9,
            codes: ["BL201","BL202","BL203","BL204","BL205","BL206","BL207","BL208","BL209"]
        },
        {
            name: "Purple (9шт)",
            count: 9,
            codes: ["PU301","PU302","PU303","PU304","PU305","PU306","PU307","PU308","PU309"]
        },
        {
            name: "Gray Brown (9шт)",
            count: 9,
            codes: ["GB401","GB402","GB403","GB404","GB405","GB406","GB407","GB408","GB409"]
        },
        {
            name: "Colour of Skin (9шт)",
            count: 9,
            codes: ["CS501","CS502","CS503","CS504","CS505","CS506","CS507","CS508","CS509"]
        },
        {
            name: "Dopamine (9шт)",
            count: 9,
            codes: ["HC601","HC602","HC603","HC604","HC605","HC606","HC607","HC608","HC609"]
        },
        {
            name: "Maillard (9шт)",
            count: 9,
            codes: ["BR701","BR702","BR703","BR704","BR705","BR706","BR707","BR708","BR709"]
        },
        {
            name: "Sweet Pink (9шт)",
            count: 9,
            codes: ["PC801","PC802","PC803","PC804","PC805","PC806","PC807","PC808","PC809"]
        },
        {
            name: "Colorful Black (9шт)",
            count: 9,
            codes: ["CB901","CB902","CB903","CB904","CB905","CB906","CB907","CB908","CB909"]
        },
        {
            name: "Lip Gloss Red (9шт)",
            count: 9,
            codes: ["LC111","LC112","LC113","LC114","LC115","LC116","LC117","LC118","LC119"]
        },
        {
            name: "Warm Yellow (9шт)",
            count: 9,
            codes: ["YE121","YE122","YE123","YE124","YE125","YE126","YE127","YE128","YE129"]
        },
        {
            name: "Dopamine 2.0 (9шт)",
            count: 9,
            codes: ["HC131","HC132","HC133","HC134","HC135","HC136","HC137","HC138","HC139"]
        },
        {
            name: "Colour of Skin 2.0 (9шт)",
            count: 9,
            codes: ["CS141","CS142","CS143","CS144","CS145","CS146","CS147","CS148","CS149"]
        },
        {
            name: "Sage Green series (9шт)",
            count: 9,
            codes: ["SG151","SG152","SG153","SG154","SG155","SG156","SG157","SG158","SG159"]
        },
        {
            name: "Dusty Blue series (9шт)",
            count: 9,
            codes: ["DB161","DB162","DB163","DB164","DB165","DB166","DB167","DB168","DB169"]
        },
        {
            name: "Advanced Grey series (9шт)",
            count: 9,
            codes: ["AG171","AG172","AG173","AG174","AG175","AG176","AG177","AG178","AG179"]
        },
        {
            name: "Dark Skin series (9шт)",
            count: 9,
            codes: ["DS181","DS182","DS183","DS184","DS185","DS186","DS187","DS188","DS189"]
        },
        {
            name: "Light Color series (9шт)",
            count: 9,
            codes: ["LC191","LC192","LC193","LC194","LC195","LC196","LC197","LC198","LC199"]
        },
        {
            name: "Cocoa Brown series (9шт)",
            count: 9,
            codes: ["AG245","AG246","AG247","AG248","AG249","AG250","AG253","AG254","AG256"]
        },
        {
            name: "Forest Green series (9шт)",
            count: 9,
            codes: ["SG221","SG222","SG224","SG225","SG226","SG228","SG230","SG231","SG232"]
        },
        {
            name: "Barbie Pink series (9шт)",
            count: 9,
            codes: ["PC233","PC235","PC237","PC238","PC239","PC240","PC242","PC243","PC244"]
        },
        {
            name: "Galaxy Purple series (9шт)",
            count: 9,
            codes: ["BL257","BL259","BL260","BL261","BL264","BL265","BL266","BL267","BL268"]
        },
        // === Большие наборы ===
        {
            name: "Languo 96",
            count: 96,
            codes: [
                "RY01","RY02","RY03","RY04","RY05","RY06","RY07","RY08","RY09",
                "GR101","GR102","GR103","GR104","GR105","GR106","GR107","GR108","GR109",
                "BL201","BL202","BL203","BL204","BL205","BL206","BL207","BL208","BL209",
                "PU301","PU302","PU303","PU304","PU305","PU306","PU307","PU308",
                "GB401","GB402","GB403","GB404","GB405","GB406",
                "CS501","CS503","CS506","CS507","CS508","CS509","CS141","CS143","CS145","CS147","CS149",
                "HC603","HC607","HC608","HC609","HC131","HC134","HC135","HC136","HC139",
                "BR702","BR704","BR705","BR706","BR707","BR709",
                "PC802","PC804","PC805","PC806","PC807","PC809",
                "CB901","CB902","CB903","CB904","CB905","CB906","CB908","CB909",
                "LC111","LC112","LC113","LC114","LC116","LC118","LC119",
                "YE121","YE122","YE124","YE125","YE126","YE127","YE128","YE129"
            ]
        },
        {
            name: "Languo 192",
            count: 192,
            ranges: [["RY",1,14],["GR",101,115],["BL",201,214],["PU",301,315],["GB",401,412],["CS",501,511],["CS",141,149],["HC",601,609],["HC",131,139],["BR",701,715],["PC",801,816],["CB",901,910],["LC",111,119],["YE",121,136],["SG",151,159],["DB",161,169]]
        },
        {
            name: "Languo 240",
            count: 240,
            ranges: [["RY",1,15],["GR",101,115],["GR",1010,1013],["BL",201,215],["PU",301,321],["GB",401,412],["CS",501,511],["CS",141,149],["HC",601,609],["HC",131,139],["BR",701,715],["PC",801,818],["CB",901,910],["LC",111,119],["YE",121,136],["YE",1210,1212],["SG",151,159],["DB",161,169],["DB",1610,1612],["LC",191,199],["LC",1110,1110],["DS",181,189],["AG",171,179]]
        },
        {
            name: "Languo 288",
            count: 288,
            ranges: [["RY",1,15],["GR",101,115],["GR",1010,1013],["BL",201,215],["BL",257,268],["PU",301,321],["GB",401,412],["CS",501,511],["CS",141,149],["HC",601,609],["HC",131,139],["BR",701,715],["PC",801,818],["PC",233,244],["CB",901,910],["LC",111,119],["YE",121,136],["YE",1210,1212],["SG",151,159],["SG",221,232],["DB",161,169],["DB",1610,1612],["LC",191,199],["LC",1110,1110],["DS",181,189],["AG",171,179],["AG",245,256]]
        }
    ],
    Grasp: [
        {
            name: "Grasp 120",
            count: 120,
            codes: [
                "B028","B117","B118","B119","B148","B153","B207","B215","B278","B688",
                "B689","B690","B708","B778","B779","B780","B781","B782","B793","B815",
                "BG148","BR756","BR762","BR763","BR764","F01","F04","F06","F07","F702",
                "F703","F786","G147","G152","G154","G202","G227","G275","G277","G279",
                "G281","G519","G687","G694","G695","G697","G699","G770","G772","G773",
                "G774","G775","G776","G777","GY209","NG212","NG270","NG271","NG272","NG274",
                "NG693","NG767","NG768","NG769","P207","R109","R128","R144","R146","R149",
                "R150","R151","R158","R201","R211","R218","R238","R260","R269","R605",
                "R691","R692","R698","R701","R704","R705","R707","R714","R754","R755",
                "R757","R758","R759","R760","R761","R765","R766","R783","R784","R785",
                "R787","R789","R790","R835","R848","S","W01","W706","Y123","Y128",
                "Y145","Y146","Y206","Y208","Y209","Y210","Y276","Y416","Y713","Y762",
                "Y771","Y788","Y791","Y792","Y906"
            ]
        },
        {
            name: "Grasp 168 (165 цветов)",
            count: 168,
            codes: [
                "W01","B117","B815","Y906","R109","R218","R848","B028",
                "G227","S","R605","R835","Y128","B215","B118","Y713",
                "R238","R144","Y145","Y146","R149","R765","B153","G202",
                "R260","B119","P345","Y788","G277","P445","R128","R698",
                "P290","Y792","G687","B688","B689","B690","R691","NG693",
                "G694","G695","G697","R158","R701","F702","F703","R704",
                "W706","R707","O548","R207","Y320","Y791","F08","P207",
                "R150","R201","Y206","R269","F01","B781","B708","Y276",
                "FP01","Y762","R761","Y771","R789","R790","B207","Y123",
                "Y415","F07","R548","BR764","O5115","O299","M04","M09",
                "Y210","R211","Y416","F786","F04","R787","F06","R692",
                "R754","R755","R784","R760","R759","R151","R766","Y209",
                "R758","Y208","BR763","BR762","G774","G279","G776","G281",
                "G770","G519","G275","G154","G772","G152","G777","G775",
                "G147","B148","B793","B778","G773","B782","B779","B780",
                "G699","B278","NG767","R705","R783","R757","R785","R714",
                "BR756","NG274","NG769","NG270","NG768","NG272","NG212","NG271",
                "G183","R344","GY376","Y408","GY404","BG148","B166","GY209",
                "P5115","Y160","G250","R146","P520","BG344","FP03","GY504",
                "Y507","P588","Y405","M01","M02","M03","M05","M06",
                "M07","M08","M10","M11","M12"
            ]
        }
    ]
};

// Получить коды маркеров из набора
function getSetCodes(set) {
    let codes = [];
    if (set.codes && set.codes.length > 0) {
        codes = codes.concat(set.codes);
    }
    if (set.ranges && set.ranges.length > 0) {
        // Определяем формат: GuangNa (числовые пары) или Languo (тройки с префиксом)
        const first = set.ranges[0];
        if (first.length === 2) {
            // GuangNa: [[600,620], 658, ...]
            codes = codes.concat(expandRanges(set.ranges));
        } else if (first.length === 3) {
            // Languo: [["RY",1,15], ...]
            codes = codes.concat(expandLanguoRanges(set.ranges));
        }
    }
    return codes;
}

// ==================== ГЕНЕРАЦИЯ INITIAL_INVENTORY ====================

function buildInitialInventory() {
    const inventory = {};

    // GuangNa: диапазон 600-887
    Object.assign(inventory, generateNumericRange("GuangNa", GUANGNA_RANGE.start, GUANGNA_RANGE.end));

    // GuangNa: дополнительные маркеры (увеличиваем quantity)
    for (const [code, qty] of Object.entries(GUANGNA_EXTRA)) {
        const key = `GuangNa_${code}`;
        if (inventory[key]) {
            inventory[key].quantity = qty;
        }
    }

    // Languo: все группы
    for (const group of LANGUO_GROUPS) {
        Object.assign(inventory, generatePrefixedGroup("Languo", group.prefix, group.start, group.end));
    }

    // Grasp: массив кодов
    Object.assign(inventory, generateFromCodes("Grasp", GRASP_CODES));

    return inventory;
}

const INITIAL_INVENTORY = buildInitialInventory();

// ==================== ЗАКОНЧИВШИЕСЯ МАРКЕРЫ ====================
// Маркеры, которые закончились (quantity будет установлен в 0)
const EMPTY_MARKERS_LIST = {
    "GuangNa": [
        "786", "601", "821", "784", "680", "806", "687", "689", "779", "676",
        "602", "697", "703", "654", "639", "650", "791", "869", "684", "600",
        "785", "664", "768", "644", "781", "618"
    ],
    "Grasp": ["R755", "B117"],
    "Languo": [
        "GB404", "DS186", "CS509", "GR103", "BL208", "BL204", "LC199",
        "BL205", "CS145", "GR109", "HC604", "CS506", "DS183", "PC806",
        "PU306", "RY06", "CS504", "DS182", "BL209", "CS144"
    ]
};

// Построить EMPTY_MARKERS из списка
function buildEmptyMarkers() {
    const result = {};
    for (const [brand, codes] of Object.entries(EMPTY_MARKERS_LIST)) {
        for (const code of codes) {
            result[`${brand}_${code}`] = { brand, code };
        }
    }
    return result;
}

const EMPTY_MARKERS = buildEmptyMarkers();

// ==================== ФУНКЦИИ ИНИЦИАЛИЗАЦИИ ====================

// Функция для инициализации данных при первом запуске
function initializeData() {
    // Проверяем, есть ли уже данные в localStorage
    const existingData = localStorage.getItem('markerInventory');
    
    if (!existingData || existingData === '{}') {
        // Если данных нет, загружаем начальные
        console.log('Загрузка начальных данных о маркерах...');
        
        // Объединяем базовый и дополнительный наборы GuangNa
        const mergedInventory = {};
        
        for (const [key, item] of Object.entries(INITIAL_INVENTORY)) {
            const brandCode = `${item.brand}_${item.code}`;
            
            if (mergedInventory[brandCode]) {
                // Если маркер уже есть, увеличиваем количество
                mergedInventory[brandCode].quantity += item.quantity;
            } else {
                // Иначе создаем новую запись
                mergedInventory[brandCode] = { ...item, timesEmptied: 0 };
            }
        }
        
        // Применяем закончившиеся маркеры (устанавливаем quantity = 0, timesEmptied = 1)
        for (const [key, item] of Object.entries(EMPTY_MARKERS)) {
            const brandCode = `${item.brand}_${item.code}`;
            if (mergedInventory[brandCode]) {
                mergedInventory[brandCode].quantity = 0;
                mergedInventory[brandCode].timesEmptied = 1;
            } else {
                // Если маркера нет в инвентаре, добавляем с quantity = 0
                mergedInventory[brandCode] = { brand: item.brand, code: item.code, quantity: 0, timesEmptied: 1 };
            }
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('markerInventory', JSON.stringify(mergedInventory));
        
        // Добавляем запись в историю
        const history = [{
            date: new Date().toISOString(),
            action: 'initial_load',
            brand: 'All',
            code: 'N/A',
            quantity: Object.keys(mergedInventory).length,
            description: 'Загружены начальные данные о маркерах'
        }];
        
        localStorage.setItem('markerHistory', JSON.stringify(history));
        
        console.log(`Загружено ${Object.keys(mergedInventory).length} маркеров`);
        
        return true; // Данные были загружены
    }
    
    return false; // Данные уже существуют
}

// Функция для применения пустых маркеров (вызывается при каждом запуске)
function applyEmptyMarkers() {
    const data = localStorage.getItem('markerInventory');
    if (!data || data === '{}') return;
    
    const inventory = JSON.parse(data);
    let changed = false;
    
    for (const [key, item] of Object.entries(EMPTY_MARKERS)) {
        const brandCode = `${item.brand}_${item.code}`;
        if (inventory[brandCode] && inventory[brandCode].quantity > 0) {
            inventory[brandCode].quantity = 0;
            if (!inventory[brandCode].timesEmptied) {
                inventory[brandCode].timesEmptied = 1;
            }
            changed = true;
        } else if (inventory[brandCode] && !inventory[brandCode].timesEmptied) {
            // Маркер уже 0, но нет счётчика — инициализируем
            inventory[brandCode].timesEmptied = 1;
            changed = true;
        }
    }
    
    if (changed) {
        localStorage.setItem('markerInventory', JSON.stringify(inventory));
        console.log('Применены пустые маркеры');
    }
}

// Миграция: добавить timesEmptied к существующим маркерам, у которых его нет
function migrateTimesEmptied() {
    const data = localStorage.getItem('markerInventory');
    if (!data || data === '{}') return;
    
    const inventory = JSON.parse(data);
    let changed = false;
    
    for (const [key, item] of Object.entries(inventory)) {
        if (item.timesEmptied === undefined) {
            item.timesEmptied = 0;
            changed = true;
        }
    }
    
    if (changed) {
        localStorage.setItem('markerInventory', JSON.stringify(inventory));
        console.log('Миграция timesEmptied выполнена');
    }
}

// Автоматическая инициализация при загрузке скрипта
initializeData();
migrateTimesEmptied();
