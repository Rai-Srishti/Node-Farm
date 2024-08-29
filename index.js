const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

////////////////////////////////// SERVER

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data); //dataObj is an array form of data. it is an array of objects

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true })); //slugs will be an array of slug strings corresponding to each product.
//console.log(slugs);
dataObj.forEach((el, i) => (el['slug'] = slugs[i])); //Adds a new property slug to each product object. The value of slug is taken from the slugs array at the same index i.

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // OVERVIEW PAGE
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join(''); //we are using join function to convert array to string.
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);
  }

  //PRODUCT PAGE
  else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    /*
        console.log(query);
        const product = dataObj[query.id] //dataObj is an array and product is an object
        const output = replaceTemplate(tempProduct, product)
        res.end(output)
    */
    const index = dataObj.findIndex((el) => el.slug === query.name);
    const product = dataObj[index];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }

  //API
  else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);
  }

  //NOT FOUND
  else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'HELLO WORLD',
    });
    res.end('<h1>Page not found!<h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000 !');
});
