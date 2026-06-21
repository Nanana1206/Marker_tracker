// Таблица соответствий цветов между брендами
// Источник: новая_Палитра_GuangNa-Languo-Grasp.xlsx
// Формат: { номер: { guangNa: код, languo: код, grasp: код } }
// null означает отсутствие цвета в данной палитре

const COLOR_MAPPING = {
    "600": { guangNa: "600", languo: "GB401", grasp: "W01" },
    "601": { guangNa: "601", languo: "BL210", grasp: "B117" },
    "602": { guangNa: "602", languo: "HC131", grasp: "B815" },
    "603": { guangNa: "603", languo: "YE123", grasp: null },
    "604": { guangNa: "604", languo: null, grasp: "Y906" },
    "605": { guangNa: "605", languo: "LC116", grasp: "R109" },
    "606": { guangNa: "606", languo: "PC812", grasp: "R218" },
    "607": { guangNa: "607", languo: "BL262", grasp: "R848" },
    "608": { guangNa: "608", languo: null, grasp: "B028" },
    "609": { guangNa: "609", languo: "GR115", grasp: "G227" },
    "610": { guangNa: "610", languo: "GB411", grasp: null },
    "611": { guangNa: "611", languo: "GB405", grasp: "S" },
    "612": { guangNa: "612", languo: null, grasp: "R605" },
    "613": { guangNa: "613", languo: "BL264", grasp: "R835" },
    "614": { guangNa: "614", languo: null, grasp: null },
    "615": { guangNa: "615", languo: "YE124", grasp: "Y128" },
    "616": { guangNa: "616", languo: "BL213", grasp: "B215" },
    "617": { guangNa: "617", languo: null, grasp: "B118" },
    "618": { guangNa: "618", languo: "YE136", grasp: "Y713" },
    "619": { guangNa: "619", languo: null, grasp: "R238" },
    "620": { guangNa: "620", languo: null, grasp: null },
    "621": { guangNa: "621", languo: "BL215", grasp: null },
    "622": { guangNa: "622", languo: "SG155", grasp: null },
    "623": { guangNa: "623", languo: "PU303", grasp: null },
    "624": { guangNa: "624", languo: "PC235", grasp: "R144" },
    "625": { guangNa: "625", languo: null, grasp: "Y145" },
    "626": { guangNa: "626", languo: "YE130", grasp: "Y146" },
    "627": { guangNa: "627", languo: "GR102", grasp: null },
    "628": { guangNa: "628", languo: null, grasp: null },
    "629": { guangNa: "629", languo: "PU312", grasp: "R149" },
    "630": { guangNa: "630", languo: null, grasp: "R765" },
    "631": { guangNa: "631", languo: "RY15", grasp: null },
    "632": { guangNa: "632", languo: "PC243", grasp: null },
    "633": { guangNa: "633", languo: "DB163", grasp: "B153" },
    "634": { guangNa: "634", languo: null, grasp: null },
    "635": { guangNa: "635", languo: "BL260", grasp: null },
    "636": { guangNa: "636", languo: "BL268", grasp: null },
    "637": { guangNa: "637", languo: "AG254", grasp: "G202" },
    "638": { guangNa: "638", languo: "BR711", grasp: null },
    "639": { guangNa: "639", languo: null, grasp: "R260" },
    "640": { guangNa: "640", languo: "GR1012", grasp: null },
    "641": { guangNa: "641", languo: "GR1013", grasp: null },
    "642": { guangNa: "642", languo: null, grasp: null },
    "643": { guangNa: "643", languo: "BR715", grasp: null },
    "644": { guangNa: "644", languo: "BR713", grasp: null },
    "645": { guangNa: "645", languo: "AG249", grasp: null },
    "646": { guangNa: "646", languo: "BR710", grasp: null },
    "647": { guangNa: "647", languo: null, grasp: null },
    "648": { guangNa: "648", languo: "SG225", grasp: null },
    "649": { guangNa: "649", languo: "CS511", grasp: null },
    "650": { guangNa: "650", languo: "BL211", grasp: "B119" },
    "651": { guangNa: "651", languo: "BL261", grasp: "P345" },
    "652": { guangNa: "652", languo: null, grasp: null },
    "653": { guangNa: "653", languo: "GR1010", grasp: null },
    "654": { guangNa: "654", languo: null, grasp: null },
    "655": { guangNa: "655", languo: "PC811", grasp: null },
    "656": { guangNa: "656", languo: "YE134", grasp: "Y788" },
    "657": { guangNa: "657", languo: "GR1011", grasp: null },
    "658": { guangNa: "658", languo: null, grasp: null },
    "659": { guangNa: "659", languo: "BL212", grasp: null },
    "660": { guangNa: "660", languo: "HC139", grasp: null },
    "661": { guangNa: "661", languo: null, grasp: null },
    "662": { guangNa: "662", languo: null, grasp: null },
    "663": { guangNa: "663", languo: "RY10", grasp: null },
    "664": { guangNa: "664", languo: null, grasp: null },
    "665": { guangNa: "665", languo: "SG230", grasp: null },
    "666": { guangNa: "666", languo: "PC241", grasp: null },
    "667": { guangNa: "667", languo: null, grasp: null },
    "668": { guangNa: "668", languo: "SG228", grasp: "G277" },
    "669": { guangNa: "669", languo: "GR111", grasp: null },
    "670": { guangNa: "670", languo: null, grasp: "P445" },
    "671": { guangNa: "671", languo: "PC813", grasp: null },
    "672": { guangNa: "672", languo: "RY07", grasp: "R128" },
    "673": { guangNa: "673", languo: "BL266", grasp: null },
    "674": { guangNa: "674", languo: "PC242", grasp: "R698" },
    "675": { guangNa: "675", languo: "BL263", grasp: null },
    "676": { guangNa: "676", languo: null, grasp: null },
    "677": { guangNa: "677", languo: "LC111", grasp: null },
    "678": { guangNa: "678", languo: "BL265", grasp: "P290" },
    "679": { guangNa: "679", languo: null, grasp: null },
    "680": { guangNa: "680", languo: "GB412", grasp: null },
    "681": { guangNa: "681", languo: "DB162", grasp: null },
    "682": { guangNa: "682", languo: "GR112", grasp: null },
    "683": { guangNa: "683", languo: null, grasp: "Y792" },
    "684": { guangNa: "684", languo: "YE135", grasp: null },
    "685": { guangNa: "685", languo: "SG227", grasp: null },
    "686": { guangNa: "686", languo: "GB410", grasp: null },
    "687": { guangNa: "687", languo: "GR105", grasp: "G687" },
    "688": { guangNa: "688", languo: null, grasp: "B688" },
    "689": { guangNa: "689", languo: null, grasp: "B689" },
    "690": { guangNa: "690", languo: "DB164", grasp: "B690" },
    "691": { guangNa: "691", languo: null, grasp: "R691" },
    "692": { guangNa: "692", languo: "LC115", grasp: null },
    "693": { guangNa: "693", languo: null, grasp: "NG693" },
    "694": { guangNa: "694", languo: "DB167", grasp: "G694" },
    "695": { guangNa: "695", languo: "DB166", grasp: "G695" },
    "696": { guangNa: "696", languo: "SG153", grasp: null },
    "697": { guangNa: "697", languo: "SG158", grasp: "G697" },
    "698": { guangNa: "698", languo: "PU301", grasp: "R158" },
    "699": { guangNa: "699", languo: null, grasp: null },
    "700": { guangNa: "700", languo: null, grasp: null },
    "701": { guangNa: "701", languo: null, grasp: "R701" },
    "702": { guangNa: "702", languo: null, grasp: "F702" },
    "703": { guangNa: "703", languo: null, grasp: "F703" },
    "704": { guangNa: "704", languo: "PC244", grasp: "R704" },
    "705": { guangNa: "705", languo: "PC809", grasp: null },
    "706": { guangNa: "706", languo: null, grasp: "W706" },
    "707": { guangNa: "707", languo: "SG151", grasp: "R707" },
    "708": { guangNa: "708", languo: null, grasp: null },
    "709": { guangNa: "709", languo: null, grasp: null },
    "710": { guangNa: "710", languo: null, grasp: null },
    "711": { guangNa: "711", languo: "PC239", grasp: null },
    "712": { guangNa: "712", languo: "PC238", grasp: null },
    "713": { guangNa: "713", languo: null, grasp: null },
    "714": { guangNa: "714", languo: "PC818", grasp: null },
    "715": { guangNa: "715", languo: null, grasp: "O548" },
    "716": { guangNa: "716", languo: null, grasp: "R207" },
    "717": { guangNa: "717", languo: null, grasp: null },
    "718": { guangNa: "718", languo: null, grasp: null },
    "719": { guangNa: "719", languo: "CS510", grasp: "Y320" },
    "720": { guangNa: "720", languo: "YE131", grasp: null },
    "721": { guangNa: "721", languo: null, grasp: null },
    "722": { guangNa: "722", languo: null, grasp: null },
    "723": { guangNa: "723", languo: "PC810", grasp: null },
    "724": { guangNa: "724", languo: null, grasp: null },
    "725": { guangNa: "725", languo: "YE126", grasp: null },
    "726": { guangNa: "726", languo: "PU319", grasp: null },
    "727": { guangNa: "727", languo: null, grasp: null },
    "728": { guangNa: "728", languo: "GR113", grasp: null },
    "729": { guangNa: "729", languo: "YE132", grasp: null },
    "730": { guangNa: "730", languo: "GR110", grasp: null },
    "731": { guangNa: "731", languo: "AG250", grasp: null },
    "732": { guangNa: "732", languo: null, grasp: null },
    "733": { guangNa: "733", languo: null, grasp: "Y791" },
    "734": { guangNa: "734", languo: "PU310", grasp: null },
    "735": { guangNa: "735", languo: null, grasp: null },
    "736": { guangNa: "736", languo: "BL257", grasp: null },
    "737": { guangNa: "737", languo: "SG222", grasp: null },
    "738": { guangNa: "738", languo: "AG246", grasp: null },
    "739": { guangNa: "739", languo: "PC815", grasp: null },
    "740": { guangNa: "740", languo: null, grasp: null },
    "741": { guangNa: "741", languo: "SG154", grasp: null },
    "742": { guangNa: "742", languo: null, grasp: null },
    "743": { guangNa: "743", languo: "PU314", grasp: "F08" },
    "744": { guangNa: "744", languo: "PU311", grasp: "P207" },
    "745": { guangNa: "745", languo: null, grasp: null },
    "746": { guangNa: "746", languo: "PU320", grasp: null },
    "747": { guangNa: "747", languo: "PU318", grasp: null },
    "748": { guangNa: "748", languo: "DB1612", grasp: null },
    "749": { guangNa: "749", languo: "DB1610", grasp: null },
    "750": { guangNa: "750", languo: "DB1611", grasp: null },
    "751": { guangNa: "751", languo: null, grasp: null },
    "752": { guangNa: "752", languo: "LC1110", grasp: "R150" },
    "753": { guangNa: "753", languo: "BR703", grasp: "R201" },
    "754": { guangNa: "754", languo: "AG247", grasp: null },
    "755": { guangNa: "755", languo: "CS509", grasp: null },
    "756": { guangNa: "756", languo: "CS149", grasp: null },
    "757": { guangNa: "757", languo: "YE1212", grasp: null },
    "758": { guangNa: "758", languo: "AG179", grasp: "Y206" },
    "759": { guangNa: "759", languo: "GB406", grasp: null },
    "760": { guangNa: "760", languo: "LC114", grasp: "R269" },
    "761": { guangNa: "761", languo: "PC240", grasp: null },
    "762": { guangNa: "762", languo: "PC817", grasp: null },
    "763": { guangNa: "763", languo: "CB908", grasp: null },
    "764": { guangNa: "764", languo: "CB904", grasp: null },
    "765": { guangNa: "765", languo: "YE122", grasp: "F01" },
    "766": { guangNa: "766", languo: "YE121", grasp: null },
    "767": { guangNa: "767", languo: "DB165", grasp: null },
    "768": { guangNa: "768", languo: "DB161", grasp: "B781" },
    "769": { guangNa: "769", languo: null, grasp: null },
    "770": { guangNa: "770", languo: "PC816", grasp: null },
    "771": { guangNa: "771", languo: "BR712", grasp: null },
    "772": { guangNa: "772", languo: "PC814", grasp: null },
    "773": { guangNa: "773", languo: "PU313", grasp: null },
    "774": { guangNa: "774", languo: "DB168", grasp: null },
    "775": { guangNa: "775", languo: "SG152", grasp: null },
    "776": { guangNa: "776", languo: "BR709", grasp: null },
    "777": { guangNa: "777", languo: "RY02", grasp: null },
    "778": { guangNa: "778", languo: "PU315", grasp: null },
    "779": { guangNa: "779", languo: null, grasp: null },
    "780": { guangNa: "780", languo: null, grasp: null },
    "781": { guangNa: "781", languo: "RY14", grasp: null },
    "782": { guangNa: "782", languo: "RY11", grasp: null },
    "783": { guangNa: "783", languo: null, grasp: null },
    "784": { guangNa: "784", languo: "RY13", grasp: null },
    "785": { guangNa: "785", languo: "RY12", grasp: null },
    "786": { guangNa: "786", languo: null, grasp: null },
    "787": { guangNa: "787", languo: "YE133", grasp: null },
    "788": { guangNa: "788", languo: "AG251", grasp: null },
    "789": { guangNa: "789", languo: "CB910", grasp: null },
    "790": { guangNa: "790", languo: "SG157", grasp: null },
    "791": { guangNa: "791", languo: "CB903", grasp: null },
    "792": { guangNa: "792", languo: "SG156", grasp: null },
    "793": { guangNa: "793", languo: "AG252", grasp: null },
    "794": { guangNa: "794", languo: "SG231", grasp: null },
    "795": { guangNa: "795", languo: "SG159", grasp: null },
    "796": { guangNa: "796", languo: null, grasp: null },
    "797": { guangNa: "797", languo: null, grasp: null },
    "798": { guangNa: "798", languo: "BL214", grasp: null },
    "799": { guangNa: "799", languo: "GR114", grasp: null },
    "800": { guangNa: "800", languo: null, grasp: null },
    "801": { guangNa: "801", languo: null, grasp: null },
    "802": { guangNa: "802", languo: "RY03", grasp: null },
    "803": { guangNa: "803", languo: "BL258", grasp: null },
    "804": { guangNa: "804", languo: "GB402", grasp: null },
    "805": { guangNa: "805", languo: null, grasp: null },
    "806": { guangNa: "806", languo: "CB909", grasp: null },
    "807": { guangNa: "807", languo: "CB907", grasp: null },
    "808": { guangNa: "808", languo: "CB905", grasp: null },
    "809": { guangNa: "809", languo: "GR101", grasp: null },
    "810": { guangNa: "810", languo: "YE1210", grasp: null },
    "811": { guangNa: "811", languo: null, grasp: null },
    "812": { guangNa: "812", languo: "YE1211", grasp: null },
    "813": { guangNa: "813", languo: "YE129", grasp: null },
    "814": { guangNa: "814", languo: null, grasp: null },
    "815": { guangNa: "815", languo: null, grasp: null },
    "816": { guangNa: "816", languo: "AG253", grasp: null },
    "817": { guangNa: "817", languo: "YE127", grasp: null },
    "818": { guangNa: "818", languo: "BL201", grasp: "B708" },
    "819": { guangNa: "819", languo: "BL202", grasp: null },
    "820": { guangNa: "820", languo: "BL203", grasp: null },
    "821": { guangNa: "821", languo: "BL204", grasp: null },
    "822": { guangNa: "822", languo: "BL205", grasp: null },
    "823": { guangNa: "823", languo: "BL206", grasp: null },
    "824": { guangNa: "824", languo: "BL207", grasp: null },
    "825": { guangNa: "825", languo: "PU316", grasp: null },
    "826": { guangNa: "826", languo: "PU317", grasp: null },
    "827": { guangNa: "827", languo: "PU321", grasp: null },
    "828": { guangNa: "828", languo: null, grasp: null },
    "829": { guangNa: "829", languo: "AG245", grasp: null },
    "830": { guangNa: "830", languo: "BL259", grasp: null },
    "831": { guangNa: "831", languo: null, grasp: null },
    "832": { guangNa: "832", languo: "PU306", grasp: null },
    "833": { guangNa: "833", languo: "PU307", grasp: null },
    "834": { guangNa: "834", languo: null, grasp: null },
    "835": { guangNa: "835", languo: null, grasp: null },
    "836": { guangNa: "836", languo: "CS501", grasp: null },
    "837": { guangNa: "837", languo: "CS502", grasp: null },
    "838": { guangNa: "838", languo: "PC233", grasp: null },
    "839": { guangNa: "839", languo: "PC237", grasp: null },
    "840": { guangNa: "840", languo: null, grasp: null },
    "841": { guangNa: "841", languo: null, grasp: null },
    "842": { guangNa: "842", languo: "SG221", grasp: null },
    "843": { guangNa: "843", languo: null, grasp: null },
    "844": { guangNa: "844", languo: null, grasp: null },
    "845": { guangNa: "845", languo: "SG226", grasp: null },
    "846": { guangNa: "846", languo: null, grasp: null },
    "847": { guangNa: "847", languo: "SG224", grasp: "Y276" },
    "848": { guangNa: "848", languo: null, grasp: null },
    "849": { guangNa: "849", languo: null, grasp: null },
    "850": { guangNa: "850", languo: null, grasp: null },
    "851": { guangNa: "851", languo: null, grasp: null },
    "852": { guangNa: "852", languo: null, grasp: null },
    "853": { guangNa: "853", languo: "BR702", grasp: null },
    "854": { guangNa: "854", languo: null, grasp: null },
    "855": { guangNa: "855", languo: "HC602", grasp: null },
    "856": { guangNa: "856", languo: "HC603", grasp: "FP01" },
    "857": { guangNa: "857", languo: null, grasp: null },
    "858": { guangNa: "858", languo: null, grasp: null },
    "859": { guangNa: "859", languo: "HC606", grasp: null },
    "860": { guangNa: "860", languo: null, grasp: null },
    "861": { guangNa: "861", languo: null, grasp: null },
    "862": { guangNa: "862", languo: null, grasp: null },
    "863": { guangNa: "863", languo: "BR714", grasp: null },
    "864": { guangNa: "864", languo: null, grasp: null },
    "865": { guangNa: "865", languo: null, grasp: null },
    "866": { guangNa: "866", languo: null, grasp: null },
    "867": { guangNa: "867", languo: null, grasp: null },
    "868": { guangNa: "868", languo: null, grasp: null },
    "869": { guangNa: "869", languo: "BR707", grasp: "Y762" },
    "870": { guangNa: "870", languo: null, grasp: null },
    "871": { guangNa: "871", languo: "CS142", grasp: null },
    "872": { guangNa: "872", languo: "PC801", grasp: null },
    "873": { guangNa: "873", languo: "PC802", grasp: null },
    "874": { guangNa: "874", languo: null, grasp: "R761" },
    "875": { guangNa: "875", languo: null, grasp: null },
    "876": { guangNa: "876", languo: null, grasp: "Y771" },
    "877": { guangNa: "877", languo: "LC191", grasp: "R789" },
    "878": { guangNa: "878", languo: "LC193", grasp: null },
    "879": { guangNa: "879", languo: "LC194", grasp: null },
    "880": { guangNa: "880", languo: "LC195", grasp: null },
    "881": { guangNa: "881", languo: "LC196", grasp: null },
    "882": { guangNa: "882", languo: "LC197", grasp: null },
    "883": { guangNa: "883", languo: "LC198", grasp: null },
    "884": { guangNa: "884", languo: null, grasp: null },
    "885": { guangNa: "885", languo: null, grasp: null },
    "886": { guangNa: "886", languo: null, grasp: null },
    "887": { guangNa: "887", languo: null, grasp: "R790" },
    "888": { guangNa: "888", languo: null, grasp: null },
    "889": { guangNa: "889", languo: null, grasp: null },
    "890": { guangNa: "890", languo: null, grasp: null },
    "891": { guangNa: "891", languo: null, grasp: null },
    "892": { guangNa: "892", languo: null, grasp: null },
    "893": { guangNa: "893", languo: null, grasp: null },
    "894": { guangNa: "894", languo: null, grasp: null },
    "895": { guangNa: "895", languo: null, grasp: null },
    "896": { guangNa: "896", languo: "BL267", grasp: "B207" },
    "897": { guangNa: "897", languo: null, grasp: null },
    "898": { guangNa: "898", languo: null, grasp: null },
    "899": { guangNa: "899", languo: null, grasp: null },
    "900": { guangNa: "900", languo: null, grasp: null },
    "901": { guangNa: "901", languo: "PU305", grasp: null },
    "902": { guangNa: "902", languo: null, grasp: null },
    "903": { guangNa: "903", languo: null, grasp: null },
    "904": { guangNa: "904", languo: null, grasp: null },
    "905": { guangNa: "905", languo: null, grasp: null },
    "906": { guangNa: "906", languo: null, grasp: null },
    "907": { guangNa: "907", languo: null, grasp: null },
    "908": { guangNa: "908", languo: null, grasp: null },
    "909": { guangNa: "909", languo: "PU308", grasp: null },
    "910": { guangNa: "910", languo: null, grasp: null },
    "911": { guangNa: "911", languo: null, grasp: null },
    "912": { guangNa: "912", languo: null, grasp: null },
    "913": { guangNa: "913", languo: null, grasp: null },
    "914": { guangNa: "914", languo: null, grasp: null },
    "915": { guangNa: "915", languo: null, grasp: null },
    "916": { guangNa: "916", languo: null, grasp: null },
    "917": { guangNa: "917", languo: "CS144", grasp: null },
    "918": { guangNa: "918", languo: null, grasp: null },
    "919": { guangNa: "919", languo: null, grasp: null },
    "920": { guangNa: "920", languo: "LC117", grasp: null },
    "921": { guangNa: "921", languo: "LC118", grasp: null },
    "922": { guangNa: "922", languo: "LC119", grasp: null },
    "923": { guangNa: "923", languo: null, grasp: null },
    "924": { guangNa: "924", languo: "CS141", grasp: null },
    "925": { guangNa: "925", languo: null, grasp: "Y123" },
    "926": { guangNa: "926", languo: null, grasp: null },
    "927": { guangNa: "927", languo: null, grasp: null },
    "928": { guangNa: "928", languo: null, grasp: null },
    "929": { guangNa: "929", languo: null, grasp: null },
    "930": { guangNa: "930", languo: null, grasp: "Y415" },
    "931": { guangNa: "931", languo: null, grasp: null },
    "932": { guangNa: "932", languo: null, grasp: null },
    "933": { guangNa: "933", languo: "RY01", grasp: null },
    "934": { guangNa: "934", languo: "YE125", grasp: null },
    "935": { guangNa: "935", languo: null, grasp: null },
    "936": { guangNa: "936", languo: null, grasp: null },
    "937": { guangNa: "937", languo: null, grasp: null },
    "938": { guangNa: "938", languo: null, grasp: null },
    "939": { guangNa: "939", languo: null, grasp: null },
    "940": { guangNa: "940", languo: null, grasp: null },
    "941": { guangNa: "941", languo: null, grasp: null },
    "942": { guangNa: "942", languo: "GR108", grasp: null },
    "943": { guangNa: "943", languo: null, grasp: null },
    "944": { guangNa: "944", languo: null, grasp: null },
    "945": { guangNa: "945", languo: null, grasp: null },
    "946": { guangNa: "946", languo: null, grasp: null },
    "947": { guangNa: "947", languo: null, grasp: null },
    "948": { guangNa: "948", languo: null, grasp: null },
    "949": { guangNa: "949", languo: "LC199", grasp: null },
    "950": { guangNa: "950", languo: null, grasp: null },
    "951": { guangNa: "951", languo: "AG172", grasp: null },
    "952": { guangNa: "952", languo: null, grasp: null },
    "953": { guangNa: "953", languo: null, grasp: null },
    "954": { guangNa: "954", languo: null, grasp: null },
    "955": { guangNa: "955", languo: null, grasp: null },
    "956": { guangNa: "956", languo: null, grasp: null },
    "957": { guangNa: "957", languo: null, grasp: null },
    "958": { guangNa: "958", languo: null, grasp: null },
    "959": { guangNa: "959", languo: null, grasp: null },

    // === Пары Languo-Grasp без маркера GuangNa ===
    "Languo_RY05": { guangNa: null, languo: "RY05", grasp: "F07" },
    "Languo_PC805": { guangNa: null, languo: "PC805", grasp: "R548" },
    "Languo_AG248": { guangNa: null, languo: "AG248", grasp: "BR764" },
    "Languo_DS187": { guangNa: null, languo: "DS187", grasp: "O5115" },
    "Languo_DS188": { guangNa: null, languo: "DS188", grasp: "O299" },
    "Languo_HC608": { guangNa: null, languo: "HC608", grasp: "M04" },
    "Languo_HC609": { guangNa: null, languo: "HC609", grasp: "M09" }
};

// ==================== ПОЛЬЗОВАТЕЛЬСКИЕ БРЕНДЫ И МАППИНГИ ====================

// Получить список пользовательских брендов из localStorage
function getCustomBrands() {
    return JSON.parse(localStorage.getItem((typeof LS_PREFIX !== 'undefined' ? LS_PREFIX : '') + 'customBrands')) || [];
}

// Сохранить список пользовательских брендов
function saveCustomBrands(brands) {
    localStorage.setItem((typeof LS_PREFIX !== 'undefined' ? LS_PREFIX : '') + 'customBrands', JSON.stringify(brands));
}

// Получить пользовательские маппинги из localStorage
function getCustomMappings() {
    return JSON.parse(localStorage.getItem((typeof LS_PREFIX !== 'undefined' ? LS_PREFIX : '') + 'customMappings')) || {};
}

// Сохранить пользовательские маппинги
function saveCustomMappings(mappings) {
    localStorage.setItem((typeof LS_PREFIX !== 'undefined' ? LS_PREFIX : '') + 'customMappings', JSON.stringify(mappings));
}

// Встроенные бренды (единый источник истины)
const BUILTIN_BRANDS = ['GuangNa', 'Languo', 'Grasp'];

// Получить объединённый список всех брендов (встроенные + пользовательские)
function getAllBrands() {
    const builtIn = BUILTIN_BRANDS;
    const custom = getCustomBrands().map(b => b.name);
    return [...builtIn, ...custom];
}

// Получить цвет badge для бренда
function getBrandBadgeColor(brandName) {
    const customBrands = getCustomBrands();
    const found = customBrands.find(b => b.name === brandName);
    if (found) return found.color;
    return null; // встроенные бренды используют CSS-классы
}

// Предопределённые цвета для badge пользовательских брендов
const CUSTOM_BRAND_COLORS = [
    '#fd79a8', '#e17055', '#00cec9', '#0984e3', '#6c5ce7',
    '#fdcb6e', '#e84393', '#00b894', '#d63031', '#2d3436',
    '#636e72', '#b2bec3', '#fab1a0', '#81ecec', '#a29bfe',
    '#ffeaa7', '#55efc4', '#74b9ff', '#ff7675', '#fd79a8'
];

// ==================== ОБРАТНЫЙ ИНДЕКС ====================

// Обратный индекс для поиска по коду бренда
// Формат: { "Бренд_Код": { universalCode, guangNa, languo, grasp, ...customBrands } }
const REVERSE_INDEX = {};

// Построение обратного индекса (только встроенные бренды)
function buildReverseIndex() {
    // Очистить индекс
    for (const key of Object.keys(REVERSE_INDEX)) {
        delete REVERSE_INDEX[key];
    }
    
    for (const [universalCode, mapping] of Object.entries(COLOR_MAPPING)) {
        if (mapping.guangNa) {
            REVERSE_INDEX[`GuangNa_${mapping.guangNa}`] = {
                universalCode,
                ...mapping
            };
        }
        if (mapping.languo) {
            REVERSE_INDEX[`Languo_${mapping.languo}`] = {
                universalCode,
                ...mapping
            };
        }
        if (mapping.grasp) {
            REVERSE_INDEX[`Grasp_${mapping.grasp}`] = {
                universalCode,
                ...mapping
            };
        }
    }
}

// Добавить пользовательские маппинги в обратный индекс
function mergeCustomMappingsIntoReverseIndex() {
    const customMappings = getCustomMappings();
    
    for (const [sourceKey, targets] of Object.entries(customMappings)) {
        // sourceKey = "BrandA_CodeA"
        // targets = { "BrandB": "CodeB", "BrandC": "CodeC" }
        
        if (!REVERSE_INDEX[sourceKey]) {
            // Создаём новую запись
            const [sourceBrand, sourceCode] = sourceKey.split('_');
            const brandKey = sourceBrand.charAt(0).toLowerCase() + sourceBrand.slice(1);
            const entry = {
                universalCode: `custom_${sourceCode}`,
            };
            entry[brandKey] = sourceCode;
            for (const [targetBrand, targetCode] of Object.entries(targets)) {
                const tBrandKey = targetBrand.charAt(0).toLowerCase() + targetBrand.slice(1);
                entry[tBrandKey] = targetCode;
            }
            REVERSE_INDEX[sourceKey] = entry;
        } else {
            // Дополняем существующую запись
            for (const [targetBrand, targetCode] of Object.entries(targets)) {
                const tBrandKey = targetBrand.charAt(0).toLowerCase() + targetBrand.slice(1);
                REVERSE_INDEX[sourceKey][tBrandKey] = targetCode;
            }
        }
        
        // Обратная связь: для каждого целевого бренда создаём запись
        for (const [targetBrand, targetCode] of Object.entries(targets)) {
            const targetKey = `${targetBrand}_${targetCode}`;
            const tBrandKey = targetBrand.charAt(0).toLowerCase() + targetBrand.slice(1);
            
            if (!REVERSE_INDEX[targetKey]) {
                const [sourceBrand, sourceCode] = sourceKey.split('_');
                const sBrandKey = sourceBrand.charAt(0).toLowerCase() + sourceBrand.slice(1);
                const entry = {
                    universalCode: REVERSE_INDEX[sourceKey] ? REVERSE_INDEX[sourceKey].universalCode : `custom_${sourceCode}`,
                };
                entry[tBrandKey] = targetCode;
                entry[sBrandKey] = sourceCode;
                // Копируем остальные ссылки из source
                for (const [otherBrand, otherCode] of Object.entries(targets)) {
                    if (otherBrand !== targetBrand) {
                        const oBrandKey = otherBrand.charAt(0).toLowerCase() + otherBrand.slice(1);
                        entry[oBrandKey] = otherCode;
                    }
                }
                REVERSE_INDEX[targetKey] = entry;
            } else {
                // Дополняем
                const [sourceBrand, sourceCode] = sourceKey.split('_');
                const sBrandKey = sourceBrand.charAt(0).toLowerCase() + sourceBrand.slice(1);
                REVERSE_INDEX[targetKey][sBrandKey] = sourceCode;
                for (const [otherBrand, otherCode] of Object.entries(targets)) {
                    if (otherBrand !== targetBrand) {
                        const oBrandKey = otherBrand.charAt(0).toLowerCase() + otherBrand.slice(1);
                        REVERSE_INDEX[targetKey][oBrandKey] = otherCode;
                    }
                }
            }
        }
    }
}

// Инициализация обратного индекса
buildReverseIndex();
mergeCustomMappingsIntoReverseIndex();

// Функция поиска замен (с учётом пользовательских брендов)
function findReplacements(brand, code) {
    const key = `${brand}_${code}`;
    const entry = REVERSE_INDEX[key];
    
    if (!entry) {
        return null;
    }
    
    const result = {
        universalCode: entry.universalCode,
        guangNa: entry.guangNa,
        languo: entry.languo,
        grasp: entry.grasp
    };
    
    // Добавляем пользовательские бренды из записи
    const customBrands = getCustomBrands();
    for (const cb of customBrands) {
        const cbKey = cb.name.charAt(0).toLowerCase() + cb.name.slice(1);
        if (entry[cbKey]) {
            result[cbKey] = entry[cbKey];
        }
    }
    
    // Убираем исходный бренд из результатов
    delete result[brand.charAt(0).toLowerCase() + brand.slice(1)];
    
    return result;
}

// Функция поиска по числовой части кода
function findByNumber(brand, number) {
    const numStr = String(number);
    const results = [];
    
    for (const [universalCode, mapping] of Object.entries(COLOR_MAPPING)) {
        const brandKey = brand.charAt(0).toLowerCase() + brand.slice(1);
        const brandCode = mapping[brandKey];
        
        if (brandCode) {
            // Извлекаем числовую часть из кода
            const digits = brandCode.replace(/[^0-9]/g, '');
            if (digits === numStr) {
                results.push({
                    universalCode,
                    brandCode,
                    ...mapping
                });
            }
        }
    }
    
    return results.length > 0 ? results : null;
}

// Функция для получения всех цветов бренда (с учётом пользовательских)
function getBrandColors(brand) {
    const colors = [];
    const brandKey = brand.charAt(0).toLowerCase() + brand.slice(1);
    
    // Встроенные бренды — из COLOR_MAPPING
    for (const [universalCode, mapping] of Object.entries(COLOR_MAPPING)) {
        if (mapping[brandKey]) {
            colors.push({
                universalCode,
                brandCode: mapping[brandKey],
                ...mapping
            });
        }
    }
    
    // Пользовательские бренды — из inventory (все маркеры этого бренда)
    const customBrands = getCustomBrands();
    const isCustom = customBrands.some(b => b.name === brand);
    if (isCustom) {
        const inv = JSON.parse(localStorage.getItem((typeof LS_PREFIX !== 'undefined' ? LS_PREFIX : '') + 'inventory')) || {};
        for (const [key, item] of Object.entries(inv)) {
            if (item.brand === brand) {
                // Проверяем, не дублирует ли уже из COLOR_MAPPING
                const alreadyExists = colors.some(c => c.brandCode === item.code);
                if (!alreadyExists) {
                    colors.push({
                        universalCode: `custom_${item.code}`,
                        brandCode: item.code
                    });
                }
            }
        }
    }
    
    return colors;
}

// Получить все бренды из записей REVERSE_INDEX для данного кода
function getAllBrandsForEntry(entry) {
    const allBrands = getAllBrands();
    const result = [];
    for (const brand of allBrands) {
        const brandKey = brand.charAt(0).toLowerCase() + brand.slice(1);
        if (entry[brandKey]) {
            result.push({ name: brand, code: entry[brandKey] });
        }
    }
    return result;
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { COLOR_MAPPING, REVERSE_INDEX, findReplacements, getBrandColors };
}
