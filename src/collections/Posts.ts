import type Agenda from 'agenda';
import dayjs from 'dayjs';
import { Post } from 'payload/generated-types';
import {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload/types';

const afterChangeHook: CollectionAfterChangeHook<Post> = async ({req, operation, doc, previousDoc}) => {
  switch (operation) {
    case 'create':
    if (doc.status === 'draft' && doc.publishedSchedule && dayjs(doc.publishedSchedule).format() > dayjs().format()) {
        const agenda = req.app.get('agenda') as Agenda;
        await agenda.schedule(dayjs(doc.publishedSchedule).format(), 'publish-post', {
          id: doc.id,
          title: doc.title
        })
      }
      break;
      case 'update':
      if (doc.status === 'draft' && doc.publishedSchedule && dayjs(doc.publishedSchedule).format() > dayjs().format()) {
        const agenda = req.app.get('agenda') as Agenda;
        let agendaJobs = await agenda.jobs({
          name: 'publish-post',
          'data.id': doc.id,
        }, {_id: 1}, 1);
        if (agendaJobs.length === 1) {
          await agendaJobs[0].remove();
        }
        await agenda.schedule(dayjs(doc.publishedSchedule).format(), 'publish-post', {
          id: doc.id,
          title: doc.title
        })
      }
      break;
  
    default:
      break;
  }
  return doc;
}

const beforeChangeHook: CollectionBeforeChangeHook<Post> = async ({data, req, operation, originalDoc}) => {
  if (data.status === 'published') {
    data.publishedDate = dayjs().format();
  }
  return data;
}

const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    defaultColumns: ['title', 'author', 'category', 'tags', 'status'],
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [beforeChangeHook],
    afterChange: [afterChangeHook]
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        hidden: true,
      }
    },
    {
      name: 'publishedSchedule',
      type: 'date',
      required: false,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: "dayAndTime",
          timeIntervals: 5,
        }
      }
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories'
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'content',
      type: 'richText'
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          value: 'draft',
          label: 'Draft',
        },
        {
          value: 'published',
          label: 'Published',
        },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      }
    }
  ],
}

export default Posts;