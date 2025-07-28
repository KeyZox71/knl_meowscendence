import { evm } from '@avalabs/avalanchejs';
import scoreDB from '../../utils/scoreDB.js';
import { getTx } from './getTx.js';

/**
 * @param {import('fastify').FastifyInstance}		fastify
 * @param {import('fastify').FastifyPluginOptions}	options
 */
export default async function(fastify, options) {
	fastify.get("/:id", async (request, reply) => {
		return getTx(request, reply, fastify);
	});
}
