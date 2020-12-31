import * as GLUtil from './modules/gl.js';
import * as Particle from './modules/particle.js';

async function getRenderProgram(gl, width, height, particleIndex, particleData) {

	const texture = await GLUtil.makeTexture(gl, 'assets/circle_05.png');

	const program = GLUtil.getProgram(gl, 'render-vertex-shader', 'render-fragment-shader');

	return {

		program: program,
		width: width,
		height: height,

		buffers: {
			index: particleIndex
		},

		attributes: {
			index: gl.getAttribLocation(program, 'a_index')
		},

		textures: {
			particles: particleData,
			texture: texture
		},

		uniforms: {

			resolution: gl.getUniformLocation(program, 'u_resolution'),
			particles: gl.getUniformLocation(program, 'u_particles'),
			texture: gl.getUniformLocation(program, 'u_texture')
		}
	};
}

function render(gl, renderProgram) {

	gl.viewport(0, 0, renderProgram.width, renderProgram.height);

	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(renderProgram.program);

	gl.uniform2f(
		renderProgram.uniforms.resolution, renderProgram.width, renderProgram.height
	);

	gl.enableVertexAttribArray(renderProgram.attributes.index);
	gl.bindBuffer(gl.ARRAY_BUFFER, renderProgram.buffers.index);
	gl.vertexAttribPointer(
		renderProgram.attributes.index,
		2,
		gl.FLOAT,
		false,
		0,
		0
	);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, renderProgram.textures.particles);
	gl.uniform1i(renderProgram.uniforms.particles, 0);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, renderProgram.textures.texture);
	gl.uniform1i(renderProgram.uniforms.texture, 1);

	gl.drawArrays(gl.POINTS, 0, Particle.NUM_PARTICLES);

	gl.flush();
}

async function main() {

	const [gl, width, height] = GLUtil.makeGL('canvas');

	const particleIndex = Particle.generateParticleIndex(gl);

	const particleData = Particle.generateParticleDataTexture(gl, width, height);

	const renderProgram = await getRenderProgram(
		gl, width, height, particleIndex, particleData
	);
	gl.disable(gl.DEPTH_TEST);

	gl.enable(gl.BLEND);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	gl.clearColor(0, 0, 0, 1);

	renderLoop(gl, renderProgram);
}

function renderLoop(gl, renderProgram) {

	render(gl, renderProgram);

	gl.finish();

	// requestAnimationFrame(function () {
	// 	renderLoop(gl, renderProgram, physicsProgram);
	// });
}


window.onload = main;