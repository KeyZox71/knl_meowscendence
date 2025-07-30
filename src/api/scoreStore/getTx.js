import scoreDB from "../../utils/scoreDB.js";
import { callGetScore } from "../../utils/scoreStore_contract.js";

/**
 *	@async
 *	@param {import("fastify".FastifyRequest)} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 *
 *	@returns {import('fastify').FastifyReply}
 */
export async function getTx(request, reply, fastify) {
	try {
		const tx = scoreDB.getTx(request.params.id);

		const score = await callGetScore(request.params.id);

		return reply.code(200).send({
			score: {
				p1: score.p1,
				p2: score.p2,
				p1Score: Number(score.p1Score),
				p2Score: Number(score.p2Score)
			},
			tx: tx?.txHash ?? null
		});
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
