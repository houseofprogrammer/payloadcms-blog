import type Agenda from 'agenda';
import { type Payload } from 'payload';

const publishPostDefinition = (agenda: Agenda, payload: Payload) => {
    agenda.define('publish-post', {shouldSaveResult: true}, async (job) => {
        payload.logger.info(job.attrs, 'agenda.define publish-post job');
        // TODO: extract data & update post status from `draft` to `published`
    })
}

const allDefinitions = [publishPostDefinition];

export function allJobs(agenda: Agenda, payload: Payload) {
    allDefinitions.forEach(function(definition) {
        definition(agenda, payload);
    })
}