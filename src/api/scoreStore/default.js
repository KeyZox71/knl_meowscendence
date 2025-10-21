import { getTx } from './getTx.js';
import { addTx } from './addTx.js';
import scoreDB from '../../utils/scoreDB.js';

scoreDB.prepareDB();

/**
 * @param {import('fastify').FastifyInstance}		fastify
 * @param {import('fastify').FastifyPluginOptions}	options
 */
export default async function(fastify, options) {
	fastify.get("/:id", async (request, reply) => {
		return getTx(request, reply, fastify);
	});

	fastify.post("/", {
		schema: {
			body: {
				type: 'object',
				required: ['p1', 'p2', 'p1Score', 'p2Score'],
				properties: {
					p1: { type: 'string', minLength: 1 },
					p2: { type: 'string', minLength: 0 },
					p1Score: { type: 'integer', minimum: 0 },
					p2Score: { type: 'integer', minimum: 0 },
				}
			}
		}
	}, async (request, reply) => {
		return addTx(request, reply, fastify);
	});
}
