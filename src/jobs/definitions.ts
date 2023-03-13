import type Agenda from 'agenda';
import { type Payload } from 'payload';

const publishPostDefinition = (agenda: Agenda, payload: Payload) => {
    agenda.define('publish-post', {shouldSaveResult: true}, async (job) => {
        payload.logger.info(job.attrs, 'agenda.define publish-post job');
        const { attrs: { data: { id } } } = job;
        let post = await payload.findByID({collection: 'posts', id, depth: 2});
        payload.logger.info({post}, 'agenda.define publish-post Post');
        if (post?.status === 'draft') {
            await payload.update({collection: 'posts', id, data: {status: 'published'}, depth: 2});
        }
    })
}

const allDefinitions = [publishPostDefinition];

export function allJobs(agenda: Agenda, payload: Payload) {
    allDefinitions.forEach(function(definition) {
        definition(agenda, payload);
    })
}