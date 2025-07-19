import { randomBytes, createHmac } from 'crypto';
import base32 from 'base32.js';
const { Decoder, Encoder } = base32;

const timeStep = 30;
const T0 = 0;

export function generateRandomSecret() {
	const buf = randomBytes(20);
	return new Encoder().write(buf).finalize();
}

export function getTimeCounter() {
	return Math.floor((Date.now() / 1000 - T0) / timeStep);
}

export function verifyTOTP(base32Secret, userToken) {
	const window = 1;
	const decoder = new Decoder();
	const key = decoder.write(base32Secret).finalize();

	const currentCounter = getTimeCounter();

	for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
		const counter = currentCounter + errorWindow;
		const generated = generateTOTP(key, counter);
		if (generated === userToken) return true;
	}
	return false;
}

function generateTOTP(key, counter) {
	const buf = Buffer.alloc(8);
	buf.writeUInt32BE(0, 0);
	buf.writeUInt32BE(counter, 4);

	const hmac = createHmac('sha1', key).update(buf).digest();

	const offset = hmac[hmac.length - 1] & 0xf;
	const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;

	return code.toString().padStart(6, '0');
}
