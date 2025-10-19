import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Основной маршрут для JSON
app.get("/reviews.json", async (req, res) => {
  try {
    const targetUrl = "https://m.avito.ru/brands/i88501117/all?sellerId=f84f45596f4cf92e6a47d398d0bb22ee";

    const { data } = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "ru"
      },
      timeout: 10000
    });

    // Выбираем только текстовые отзывы через регулярку
    const reviewMatches = [...data.matchAll(/<div[^>]+data-marker="review-item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g)];
    const reviews = reviewMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(r => r);

    res.json({ reviews });
  } catch (err) {
    console.error("Ошибка при получении отзывов:", err.message);
    res.json({ reviews: ["Отзывы временно недоступны"] });
  }
});

// HTML для iframe
app.get("/reviews", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin:0; padding:10px; background:transparent; color:white; font-family:sans-serif; }
          .review { padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.2); }
        </style>
      </head>
      <body>
        <div id="reviews">Загрузка отзывов...</div>
        <script>
          fetch('/reviews.json')
            .then(res => res.json())
            .then(data => {
              const container = document.getElementById('reviews');
              container.innerHTML = '';
              data.reviews.forEach(r => {
                const div = document.createElement('div');
                div.className = 'review';
                div.textContent = r;
                container.appendChild(div);
              });
              // Авто-подгонка высоты iframe
              if (window.parentIFrame) {
                window.parentIFrame.sendHeight();
              }
            });
        </script>
      </body>
    </html>
  `;
  res.send(html);
});

app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
