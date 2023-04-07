const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const ObjectsToCsv = require("objects-to-csv");

const csvData = [];

async function getHtml (stallion, url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content(); 
  await browser.close();
  console.log((html === "") ? `${stallion} getHTML failed` : `${stallion} getHTML successful`); 
  return html;
};

async function getNewUrls(html){
  const $ = cheerio.load(html, null, false);
  const rowsContainer = $('rows').children('row');
  const rowValues = [];
  const urlObj = {};
  rowsContainer.each((index, row) => {
    const cells= $(row).find('cell'); 
    const cellValues = [];
    const firstElement = $(cells[0]).text().trim();
    const stallion = firstElement.substring(0, firstElement.indexOf('^'));
    const userData = $(row).find('userdata').text();
    urlObj[stallion] = `http://www.trot-pedigree.net/js/app/gridqual.php?lagen='2020'&etal='${userData}'`;
  });
  return urlObj;
}

async function parseHtmlSaveData(stallion, html) {
  const $ = cheerio.load(html, null, false);
  const rowsContainer = $('rows').children('row');
  const rowValues = [];
  rowsContainer.each((index, row) => {
    const cells= $(row).find('cell'); 
    const firstElement = $(cells[0]).text().trim();
    csvData.push({
      'Stallion name': stallion,
      'Nom': firstElement.substring(0, firstElement.indexOf('^')),
      'Sexe': $(cells[1]).text(),
      'Mere': $(cells[2]).text(),
      'Pere de Mere': $(cells[3]).text(),
      'Date Qualif': $(cells[4]).text(),
      'Lieu de Qualif': $(cells[5]).text(),
      'Temps de Qualif': $(cells[6]).text(),
      'Spec.': $(cells[7]).text(),
      'Gains': $(cells[8]).text(),
    });
  });
  console.log("Stallion Name: ", stallion, " Number of corresponding Entries: ", rowsContainer.length);
  const csv = new ObjectsToCsv(csvData);
  await csv.toDisk('./trotpedigree2.csv')
}

async function main(){
  console.log("Script Started: ", new Date());
  const parentHtml = await getHtml("HOMEPAGE", "http://www.trot-pedigree.net/js/app/gridsynthe.php?lagen=2020");
  const urlArrObj = await getNewUrls(parentHtml);
  for(let key in urlArrObj){
    const childHtml = await getHtml(key, urlArrObj[key]);
    await parseHtmlSaveData(key, childHtml);
  }
  console.log("Script Ended: ", new Date());
}

main();
