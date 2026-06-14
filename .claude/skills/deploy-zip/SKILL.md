---
name: deploy-zip
description: Собрать ZIP с файлами сайта FISH COLLECTOR для drag-and-drop деплоя на Netlify. Использовать, когда нужно «собрать zip», «подготовить деплой», «выкатить на нетлифи».
---

# Сборка ZIP для Netlify (drag-and-drop)

Собирает архив только с нужными статическими файлами сайта (без `.claude`, `.git`, README).

## Шаги
1. Перед сборкой бампнуть версию (скил `bump-version`) и прогнать `node --check` по `<script>` из `index.html`.
2. Собрать архив в корне проекта:
   - PowerShell:
     ```powershell
     Compress-Archive -Path index.html,manifest.json,sw.js,icon.svg,netlify.toml -DestinationPath fish-collector.zip -Force
     ```
   - bash/zip:
     ```bash
     zip -j fish-collector.zip index.html manifest.json sw.js icon.svg netlify.toml
     ```
3. Сообщить пользователю путь к `fish-collector.zip` и напомнить:
   «Открой Netlify → Deploys → перетащи `fish-collector.zip`».

## Заметки
- В архив кладём ТОЛЬКО: `index.html`, `manifest.json`, `sw.js`, `icon.svg`, `netlify.toml`.
- Если добавились новые ассеты — внести их в команду и в `ASSETS` в `sw.js`.
- `fish-collector.zip` в `.gitignore` — в репозиторий не коммитим.
- Альтернатива: git-push в репозиторий, подключённый к Netlify (`netlify.toml` уже в корне).
