import * as GLUtil from './gl.js';

export const NUM_PARTICLES = 2048 ** 2;

export const NUM_PARTICLES_SQRT = Math.sqrt(NUM_PARTICLES);

export function generateParticleDataTexture(gl, width, height) {
	return GLUtil.makeDataTexture(
		gl,
		NUM_PARTICLES_SQRT,
		generateParticleData(width, height)
	);
}

/**
 * Generates a WebGLBuffer that contains the index positions of the particles.
 * These indexes are used to lookup the particle data within the textures.
 * @param gl The WebGL context.
 * @returns {WebGLBuffer} A WebGLBuffer that contains the x/y texture position of each particle
 */
export function generateParticleIndex(gl) {

	const data = new Float32Array(NUM_PARTICLES * 2);

	const rowLength = NUM_PARTICLES_SQRT;

	const step = 1 / rowLength;

	for (let i = 0; i < NUM_PARTICLES; ++i) {

		const block = i * 2;

		data[block] = step * Math.floor(i % rowLength);

		data[block + 1] = step * (Math.floor(i / rowLength));
	}

	const buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return buffer;
}

/**
 * Generates the particle x position, y position.
 * @param width The width of the grid.
 * @param height The height of the grid.
 * @returns {Float32Array} An array containing the particle data.
 */
export function generateParticleData(width, height) {

	const buffer = new Float32Array(NUM_PARTICLES * 4);

	for (let i = 0; i < NUM_PARTICLES; ++i) {
		const block = i * 4;

		// The particle x position
		buffer[block] = Math.random() * width;

		// The particle y position
		buffer[block + 1] = Math.random() * height;

		// The particle x velocity
		buffer[block + 2] = 0;

		// The particle y velocity
		buffer[block + 3] = 0;
	}

	return buffer;
}
