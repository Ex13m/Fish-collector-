# FISH COLLECTOR — передаточный файл проекта

Главный технический документ. Всё для развития веб-версии или нативной пересборки.

- **Репозиторий:** https://github.com/Ex13m/Fish-collector-
- **Веб-деплой:** статика на Netlify (drag-and-drop ZIP или git). Без бэкенда, без ключей.
- **Версия:** `APP_VERSION` в `index.html` и `V` в `sw.js` (синхронно). Сейчас 2.0.0.

---

## 1. Что это
PWA для коллекционирования **личных поимок любой рыбы** в виде die-cut стикеров. Поток:
фото → вырезка фона → белая обводка → ввод данных (имя/размер/дата/место) → стикер в коллекцию.
Самостоятельный проект (НЕ связан с Dolmsundet), для любых вод и видов. Языки RU/EN/NO.

## 2. Архитектура (веб)
- **Один файл** `index.html` (vanilla JS, без сборки).
- Внешка: Google Fonts (CDN) + `@imgly/background-removal` (ESM по CDN, lazy-import при первой вырезке).
- PWA: `manifest.json` + `sw.js` (офлайн-кэш статики; HTML — network-first; кросс-домен статика/модель кэшируется).
- Дизайн `:root`: фон-градиент `--b0..--b3`, `--ink #f2f6f8`, `--gold #d8c9a8`; анимации `--spring`/`--ease`.
- Шрифты: Anton (мега), Oswald (лейблы), Archivo (текст), Space Mono (данные/бирки).

## 3. Хранилище
- **localStorage** `fishcollector_catches_v2` — массив метаданных:
  `[{id, name, lang, L(см), qty, ts(мс), place, lat?, lon?, method, note, hasPhoto}]`.
- **IndexedDB** `fishcollector` → store `img` (ключ→dataURL): `stk_<id>` (стикер PNG, прозрачный, вырезка+обводка),
  `org_<id>` (оригинал JPEG ~1000px). Картинки в IDB, т.к. localStorage мал для фото.
- `fishcollector_lang` — выбранный язык.
- Память: `IMG[id] = {stk, org}` — кэш dataURL, чтобы не дёргать IDB на каждый рендер (`prefetchImages` при старте).

## 4. Обработка фото (ядро)
- `loadBitmap(src)` — File/Blob/dataURL → bitmap (учёт EXIF-ориентации через createImageBitmap).
- `aiRemove(file,onP)` — динамический `import()` `@imgly/background-removal` по CDN, `removeBackground` с прогрессом → bitmap без фона. Модель ~40 МБ, грузится один раз, кэшируется SW.
- `floodRemove(bmp,tol)` — офлайн-фолбэк: заливка от 4 углов по цвету фона (порог tol), делает прозрачным похожий фон.
- `makeSticker(src,outline)` — белая die-cut обводка: силуэт раздувается по кольцу (36 шагов ×2 радиуса), `source-in` заливка белым → подложка; сверху вырезка. Возврат canvas (прозрачный).
- `processSticker(input,mode,bmp)` — оркестратор: `ai` → при ошибке `simple` → крайний фолбэк «оригинал».
- Кнопки студии: Заменить фото · Простая вырезка · Без вырезки.

## 5. Экраны / функции
- **Splash** (~2 c) → `#app.in`.
- **Topbar**: бренд, переключатель языка `#langSel` (RU/EN/NO, `applyLang`), кнопка заказа.
- **Hero**: editorial-заголовок + `.feat` (всего стикеров, виды, рекорд см, места, трофеи).
- **Tools**: сортировка `size/new/name/trophy` (`sortedCatches`).
- **Grid** (`renderGrid`/`itemEl`): стикеры с обводкой + подпись (имя; размер·место·дата); пусто → `.empty` с CTA.
- **Card** (`openCard`): 3D-tilt стикер, спек-сетка, фото оригинала, кнопки ещё/скачать/заказать/удалить.
- **Form** (`openForm`): студия фото + поля + GPS (`getGeo`) + datalist имён `NAMES[LANG]`. `saveCatch` → IDB + LS → `celebrate`.
- **Download** (`downloadSticker`): стикер + впечатанная подпись (имя + размер, белый текст с тёмной обводкой) → PNG.
- **Order** (`openOrder`/`sendOrder`): количества по стикерам → письмо `mailto:ex333m@gmail.com` (сервис владельца).
- **FX**: `celebrate` (кольца+конфетти+vibrate), `burstConfetti`, `toast`, пузыри.

## 6. i18n
`I18N[ru|en|no]` — словарь строк; `t(key)`; статика через `[data-i18n]` + ручной набор в `applyLang`.
`NAMES[lang]` — автоподсказки названий рыбы. Имя рыбы вводится свободно на выбранном языке.

## 7. Версионирование / деплой
- Бампать `APP_VERSION` + `V` синхронно (скил `bump-version`). `scripts/check.mjs` проверяет JS и совпадение версий (SessionStart-хук).
- Дизайн-скилы (в `.claude/skills/`, и глобально): `frontend-design` (anthropics/skills) — принципы; `ui-ux-pro-max` — БД стилей/палитр/шрифтов + `scripts/search.py`. Палитра холодная по брифу (дефолтные палитры скила НЕ применять). Применены: сигнатурный стикер-герой, SVG-иконки (без эмодзи), `:focus-visible` + клавиатура, честная нумерация (`c.no`), сдержанная анимация.
- ZIP: `index.html, manifest.json, sw.js, icon.svg, netlify.toml` (скил `deploy-zip`).
- Камера/GPS → нужен HTTPS (Netlify даёт).

## 8. Для нативной версии
- Вырезка фона — нативные SDK (iOS Vision / VNGenerateForegroundInstanceMask, Android ML Kit Subject Segmentation).
- Хранилище — SQLite/файлы; структура из §3. Заказ — нативный share / API печати.

## 9. Идеи развития
- Шеринг карточки/стикера, лист стикеров для печати (A4), экспорт/импорт коллекции (JSON+изображения),
  ручной ластик для доводки вырезки, карта мест, достижения, облачная синхронизация (опционально).
