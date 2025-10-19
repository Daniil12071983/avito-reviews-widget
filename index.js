const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/', async (req, res) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 800 });

  await page.goto('https://m.avito.ru/brands/i88501117/all?sellerId=f84f45596f4cf92e6a47d398d0bb22ee#open-reviews-list', {
    waitUntil: 'networkidle2'
  });

  const reviewsHTML = await page.evaluate(() => {
    const reviewsBlock = document.querySelector('[data-marker="user-reviews/list"]');
    return reviewsBlock ? reviewsBlock.outerHTML : '<p>Отзывы не найдены</p>';
  });

  await browser.close();

  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin:0; padding:0; background: transparent; color: white; font-family: Arial, sans-serif; }
        a { color: white; }
        * { background: transparent !important; }
      </style>
    </head>
    <body>
      ${reviewsHTML}
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
