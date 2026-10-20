const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('crypto');

// GODT: I bruger path.join, så stien virker på forskellige operativsystemer.
const tasksData = path.join(__dirname, 'data/tasks.json');

const app = express();
const PORT = process.env.PORT || 3000;

// GODT: Denne middleware gør JSON fra en POST-request tilgængelig i req.body.
app.use(express.json());

// NYT: Express skal også kunne levere jeres HTML-side.
// Når I åbner http://localhost:3000, finder Express public/index.html.
app.use(express.static(path.join(__dirname, 'public')));

// GODT: async/await og try/catch er relevante til asynkron filhåndtering.
app.get('/api/tasks', async (req, res) => {
    try {
        const taskData = await fs.readFile(tasksData, 'utf8');
        const tasks = JSON.parse(taskData);

        // RETTET: res.json() er tydeligere end res.send() til et JSON-API.
        // I skal IKKE selv kalde JSON.stringify her; Express klarer det.
        return res.status(200).json(tasks);
    } catch (error) {
        console.error('Kunne ikke hente opgaver:', error);
        return res.status(500).json({ error: 'Kunne ikke hente opgaver' });
    }
});

// FEJL RETTET: I skrev 'api/tasks' uden den første skråstreg.
// En Express-route skal her være '/api/tasks'.
app.post('/api/tasks', async (req, res) => {
    // FEJL RETTET: Det er ikke nok at undersøge, om req.body mangler.
    // Kontroller også, om text findes og er en ikke-tom tekststreng.
    const text = req.body?.text;
    if (typeof text !== 'string' || text.trim() === '') {
        // VIGTIGT: return stopper funktionen efter fejlbeskeden.
        // Uden return risikerer I at fortsætte og bruge ugyldige data.
        return res.status(400).json({ error: 'Feltet text skal indeholde tekst' });
    }

    try {
        const taskData = await fs.readFile(tasksData, 'utf8');
        const tasks = JSON.parse(taskData);

        // GODT: I havde allerede valgt crypto.randomUUID() til unikke ID'er.
        // Her opretter vi et helt opgaveobjekt i stedet for kun et ID.
        const newTask = {
            id: crypto.randomUUID(),
            text: text.trim()
        };

        // MANGLENDE DEL: Tilføj opgaven og gem hele listen i JSON-filen.
        tasks.push(newTask);
        await fs.writeFile(tasksData, JSON.stringify(tasks, null, 2), 'utf8');

        // MANGLENDE DEL: Klienten SKAL have et svar.
        // 201 betyder, at en ny ressource er oprettet.
        return res.status(201).json(newTask);
    } catch (error) {
        // FEJL RETTET: Jeres catch-blok var tom.
        // Uden et svar kan Postman eller fetch() blive ved med at vente.
        console.error('Kunne ikke oprette opgave:', error);
        return res.status(500).json({ error: 'Kunne ikke gemme opgaven' });
    }
});

// NYT: Mulighed for at slette en opgave ud fra dens ID.
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskData = await fs.readFile(tasksData, 'utf8');
        const tasks = JSON.parse(taskData);
        const remainingTasks = tasks.filter(task => task.id !== req.params.id);

        // Hvis længden er uændret, fandtes opgaven ikke.
        if (remainingTasks.length === tasks.length) {
            return res.status(404).json({ error: 'Opgaven findes ikke' });
        }

        await fs.writeFile(tasksData, JSON.stringify(remainingTasks, null, 2), 'utf8');
        return res.status(200).json({ message: 'Opgaven er slettet' });
    } catch (error) {
        console.error('Kunne ikke slette opgave:', error);
        return res.status(500).json({ error: 'Kunne ikke slette opgaven' });
    }
});

// OBS: Denne enkle løsning kan miste opdateringer, hvis flere requests
// læser og skriver JSON-filen samtidigt. Det undersøger vi senere.
app.listen(PORT, () => {
    console.log(`Serveren kører på http://localhost:${PORT}`);
});
