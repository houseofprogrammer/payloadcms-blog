import Agenda from 'agenda';
import express from 'express';
import payload from 'payload';

import { allJobs } from './jobs/definitions';

require('dotenv').config();
const app = express();

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin');
});

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    mongoURL: process.env.MONGODB_URI,
    express: app,
    onInit: async (p) => {
      p.logger.info(`Payload Admin URL: ${p.getAdminURL()}`)
      const agenda = new Agenda({
        db: {
          address: p.mongoURL as string,
          collection: 'agenda_jobs',
        },
        maxConcurrency: 8,
      })
      agenda.on('ready', async () => {
        allJobs(agenda, p)
        await agenda.start();
        p.logger.info('Agenda has been Started')
      })
      .on('error', (err) => {
        p.logger.info(err, "Agenda connection error")
      })
      app.set('agenda', agenda)
    },
  })

  // Add your own express routes here

  app.listen(3000);
}

start();
