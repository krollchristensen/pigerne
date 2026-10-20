# Taskmaster – kommenteret lærerversion

Denne version bygger på The Semicolons' egen `server.js`. Rettelser og tilføjelser er forklaret med kommentarer direkte i koden.

## Sådan starter I

1. Åbn projektmappen i VS Code.
2. Kør `npm install`.
3. Kør `npm start`.
4. Åbn `http://localhost:3000` i browseren – **ikke** HTML-filen direkte.

## Test først i Postman

- `GET http://localhost:3000/api/tasks` – forvent `200` og en liste.
- `POST http://localhost:3000/api/tasks` med JSON `{"text":"Køb mælk"}` – forvent `201`.
- `POST` med JSON `{"text":""}` – forvent `400`.
- `DELETE http://localhost:3000/api/tasks/<id>` – forvent `200` ved kendt ID og `404` ved ukendt ID.

## Undersøg selv

- Hvad er forskellen på `JSON.stringify()` i frontend og `res.json()` i backend?
- Hvorfor bruger vi `event.preventDefault()`?
- Hvad sker der, hvis `return` fjernes fra valideringen?
- Hvad kan gå galt, hvis to POST-requests opdaterer filen på samme tid?
