const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const ObjectsToCsv = require("objects-to-csv");

const csvData = [];

async function getHtml () {
  console.log(new Date());
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'http://www.trot-pedigree.net/js/app/gridsynthe.php?lagen=&dhxr1680023949380=1';
  await page.goto(url);
  const html = await page.content(); 
  await browser.close();
  console.log((html === "") ? "getHTML failed" : "getHTML successful"); 
  parseHtml(html);
};


async function parseHtml(html) {
  const $ = cheerio.load(html, null, false);
  const rowsContainer = $('rows').children('row');
  const rowValues = [];
  rowsContainer.each((index, row) => {
    const cells= $(row).find('cell'); 
    const cellValues = [];
    const firstElement = $(cells[0]).text();
    csvData.push({
      'Etalon': firstElement.substring(0, firstElement.indexOf('^')),
      'Gener': $(cells[1]).text(),
      'Nb. Produits': $(cells[2]).text(),
      'Nb. Qualifies': $(cells[3]).text(),
      '% qualifies': $(cells[4]).text(),
      'M & H': $(cells[5]).text(),
      'Fem.': $(cells[6]).text(),
      'a 2 ans': $(cells[7]).text(),
      'a 3 ans': $(cells[8]).text(),
      'apres 3 ans': $(cells[9]).text(),
      'Gains totaux': $(cells[10]).text(),
      'Gains moy./prod.': $(cells[11]).text(),
      'Gains moy./qual.': $(cells[12]).text(),
      'Gains maxi': $(cells[13]).text()
    });
  });
  console.log("CSV Size: ", csvData.length);
  const csv = new ObjectsToCsv(csvData  );
  await csv.toDisk('./trotpedigree.csv')
}

getHtml() ;