import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// Проксируем страницу отзывов Авито через сервер (чтобы не было блокировки по IP)
app.get("/reviews", async (req, res) => {
  try {
    const targetUrl =
      "https://m.avito.ru/brands/i88501117/all?sellerId=f84f45596f4cf92e6a47d398d0bb22ee#open-reviews-list";

    const { data } = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "ru,en;q=0.9"
      }
    });

    // Упрощённый фильтр: вытаскиваем только блок отзывов
    const match = data.match(/<div[^>]+data-marker="reviews-list"[\s\S]+?<\/div><\/div>/);
    const reviewsHtml = match ? match[0] : "<p>Отзывы временно недоступны.</p>";

    const html = `
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
              overflow-y: auto;
              overflow-x: hidden;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
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
    `;

    res.send(html);
  } catch (error) {
    console.error("Ошибка при получении отзывов:", error.message);
    res.status(500).send("<p style='color:white'>Ошибка загрузки отзывов с Авито.</p>");
  }
});

app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
