const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

process.on('uncaughtException', function (err) {
  console.log(err);
});

class Book {
  constructor() {
    this.url = '';
    this.image = '';
    this.author = '';
    this.name = '';
    this.price = '';
  }

  toString() {
    return `{
  "url": "${this.url}",
  "image": "${this.image}",
  "author": "${this.author}",
  "name": "${this.name}",
  "price": "${this.price}"
}`;
  }
}

async function scrapeProductPage(books, pagesDiscovered, pagesToScrape) {
  const url = pagesToScrape.shift();

  pagesDiscovered.add(url);

  let doc;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept-Language': '*',
      },
    });
    const html = await response.text();
    doc = cheerio.load(html);
  } catch (error) {
    throw new Error(error);
  }

  const products = doc('div.gridItem');

  products.each((index, element) => {
    const product = doc(element);
    const book = new Book();
    const imageElement = product.find('img');
    const imageUrl = imageElement.attr('data-original') || imageElement.attr('src');


    book.url = 'https://www.wob.com' + product.find('a').attr('href');
    book.image = imageUrl ? 'https://www.wob.com' + imageUrl : '';
    book.name = product.find('span.title').text();
    book.author = product.find('span.author').text();
    book.price = product.find('div.itemPrice').text().trim();

    // Verificar si el libro ya existe en el conjunto antes de agregarlo
    const isBookDuplicate = books.some((existingBook) => existingBook.url === book.url);

    if (!isBookDuplicate) {
      books.push(book);
    }
  });

  const paginationElements = doc('a.page-link');

  paginationElements.each((index, element) => {
    const pageUrl = new URL(doc(element).attr('href'), url).toString();

    if (!pagesDiscovered.has(pageUrl) && !pagesToScrape.includes(pageUrl)) {
      pagesToScrape.push(pageUrl);
    }

    pagesDiscovered.add(pageUrl);
  });
}


async function main() {
  const books = [];
  const pageDiscovered = new Set();
  const pagesToScrape = ['https://www.wob.com/en-gb/category/fiction-books'];
  const limit = 6;
  let i = 0;

  while (pagesToScrape.length > 0 && i < limit) {
    await scrapeProductPage(books, pageDiscovered, pagesToScrape);
    i++;
  }

  console.log(books.length);

  const json = JSON.stringify(books, null, 2);
  const filePath = 'data/output.json';

  try {
    fs.writeFileSync(filePath, json);
    console.log('Archivo JSON creado exitosamente.');
  } catch (error) {
    console.log('Error al crear el archivo JSON:', error.message);
  }
}

main();
