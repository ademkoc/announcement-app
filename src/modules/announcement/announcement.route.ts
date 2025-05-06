import type { FastifyPluginCallback } from 'fastify';
import type { AnnouncementService } from './announcement.service.ts';

interface AnnouncementRouteOptions {
  announcementService: AnnouncementService;
}

export const announcementRoutePlugin: FastifyPluginCallback<AnnouncementRouteOptions> = function (fastify, opts, done) {
  fastify.route<{ Querystring: { offset: number, limit: number } }>(
    {
      method: 'GET',
      url: '/',
      schema: {
        querystring: {
          type: 'object',
          properties: {
            offset: { type: 'number', default: 0 },
            limit: { type: 'number', default: 10 },
            additionalProperties: false,
          }
        }
      },
      handler: async function getAnnouncementsRouteHandler(req, res) {
        const [data, total] = await opts.announcementService.getAll(req.query);

        return {
          data,
          total,
          offset: req.query.offset,
          count: data.length,
        }
      }
    }
  );

  done();
}
