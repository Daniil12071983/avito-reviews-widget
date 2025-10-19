import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ========================
// Главная страница
// ========================
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

// ========================
// JSON с отзывами из кэша
// ========================
app.get("/reviews.json", (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "cached-reviews.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const reviews = JSON.parse(raw).reviews || [];
    res.json({ reviews });
  } catch (err) {
    console.error("Ошибка при чтении кэша:", err.message);
    res.json({ reviews: ["Отзывы временно недоступны"] });
  }
});

// ========================
// HTML для iframe на Тильде
// ========================
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
