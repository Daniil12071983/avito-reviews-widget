import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// Проверочная главная страница
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><meta charset="UTF-8"><title>Avito Reviews Widget</title></head>
      <body style="background:#000;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;">
        <h2>✅ Сервер работает!</h2>
        <p>Попробуй открыть <a href="/reviews" style="color:#4af;">/reviews</a></p>
      </body>
    </html>
  `);
});

// Основной маршрут отзывов
app.get("/reviews", async (req, res) => {
  try {
    const targetUrl =
      "https://m.avito.ru/brands/i88501117/all?sellerId=f84f45596f4cf92e6a47d398d0bb22ee#open-reviews-list";

    const { data } = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "ru,en;q=0.9"
      },
      timeout: 10000
    });

    const match = data.match(/<div[^>]+data-marker="reviews-list"[\s\S]+?<\/div><\/div>/);
    const reviewsHtml = match
      ? match[0]
      : "<p>Отзывы не найдены — возможно, Авито временно ограничил доступ.</p>";

    res.send(`
      <html lang="ru">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Отзывы с Авито</title>
          <style>
            body {
              margin: 0;
              background: transparent;
              color: white;
              font-family: system-ui, sans-serif;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
              overflow-x: hidden;
            }
            .reviews-wrapper {
              width: 100%;
              max-width: 720px;
              padding: 20px;
              box-sizing: border-box;
            }
            a, span, div, p {
              color: white !important;
              background: transparent !important;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="reviews-wrapper">${reviewsHtml}</div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Ошибка при получении отзывов:", error.message);
    res.status(200).send(`
      <html><body style="background:#000;color:#fff;font-family:sans-serif;padding:40px;">
      <h3>⚠️ Ошибка загрузки отзывов с Авито</h3>
      <p>Возможные причины:</p>
      <ul>
        <li>Авито временно ограничил доступ по IP Render</li>
        <li>Страница продавца изменилась</li>
      </ul>
      <p>Сам сервер работает — проверь адрес /</p>
      </body></html>
    `);
  }
});

app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
