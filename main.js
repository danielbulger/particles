import * as GLUtil from './modules/gl.js';
import * as Particle from './modules/particle.js';

async function getRenderProgram(gl, width, height, particleIndex, particleData) {

	const texture = await GLUtil.makeTexture(gl, 'assets/circle_05.png');

	const program = GLUtil.getProgram(gl, 'render-vertex-shader', 'render-fragment-shader');

	const indexAttr = gl.getAttribLocation(program, 'a_index');

	gl.enableVertexAttribArray(indexAttr);

	return {

		program: program,
		width: width,
		height: height,

		buffers: {
			index: particleIndex
		},

		attributes: {
			index: indexAttr
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

function getPhysicsProgram(gl, particleData, blackhole) {

	const program = GLUtil.getProgram(gl, 'physics-vertex-shader', 'physics-fragment-shader');

	const positionAttr = gl.getAttribLocation(program, 'a_positions');
	gl.enableVertexAttribArray(positionAttr);

	return {

		program: program,
		width: Particle.NUM_PARTICLES_SQRT,
		height: Particle.NUM_PARTICLES_SQRT,
		blackhole: blackhole,

		buffers: {
			positions: GLUtil.getQuadBuffer(gl),
			frame: gl.createFramebuffer()
		},

		attributes: {
			positions: positionAttr
		},

		textures: {
			particles: particleData,
			output: GLUtil.makeDataTexture(gl, Particle.NUM_PARTICLES_SQRT, null)
		},

		uniforms: {
			resolution: gl.getUniformLocation(program, "u_resolution"),
			particles: gl.getUniformLocation(program, 'u_particles'),
			blackhole1: gl.getUniformLocation(program, 'u_blackhole1'),
			blackhole2: gl.getUniformLocation(program, 'u_blackhole2'),
			blackhole3: gl.getUniformLocation(program, 'u_blackhole3')
		}
	};
}

function getCopyProgram(gl) {

	const program = GLUtil.getProgram(
		gl, 'copy-vertex-shader', 'copy-fragment-shader'
	);

	const positionAttr = gl.getAttribLocation(program, 'a_positions');
	gl.enableVertexAttribArray(positionAttr);

	return {

		program: program,
		width: Particle.NUM_PARTICLES_SQRT,
		height: Particle.NUM_PARTICLES_SQRT,

		buffers: {
			positions: GLUtil.getQuadBuffer(gl),
			frame: gl.createFramebuffer()
		},

		attributes: {
			positions: positionAttr
		},

		uniforms: {
			particles: gl.getUniformLocation(program, 'u_particles')
		}
	};
}

function copy(gl, copyProgram, renderProgram, physicsProgram) {

	gl.viewport(0, 0, copyProgram.width, copyProgram.height);

	gl.disable(gl.BLEND);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(copyProgram.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, copyProgram.buffers.positions);
	gl.vertexAttribPointer(
		copyProgram.attributes.positions,
		2,
		gl.FLOAT,
		false,
		0,
		0
	);

	// The input to the copy shader is the output of the physics shader.
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, physicsProgram.textures.output);
	gl.uniform1i(copyProgram.uniforms.particles, 0);

	// The output of the copy shader is the render texture.
	gl.bindFramebuffer(gl.FRAMEBUFFER, copyProgram.buffers.frame);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		renderProgram.textures.particles,
		0
	);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	gl.flush();

	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		null,
		0
	);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function update(gl, physicsProgram) {

	gl.viewport(0, 0, physicsProgram.width, physicsProgram.height);

	gl.disable(gl.BLEND);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(physicsProgram.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, physicsProgram.buffers.positions);
	gl.vertexAttribPointer(
		physicsProgram.attributes.positions,
		2,
		gl.FLOAT,
		false,
		0,
		0
	);

	gl.uniform2f(
		physicsProgram.uniforms.resolution, physicsProgram.width, physicsProgram.height
	);

	gl.uniform2fv(physicsProgram.uniforms.blackhole1, physicsProgram.blackhole[0]);
	gl.uniform2fv(physicsProgram.uniforms.blackhole2, physicsProgram.blackhole[1]);
	gl.uniform2fv(physicsProgram.uniforms.blackhole3, physicsProgram.blackhole[2]);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, physicsProgram.textures.particles);
	gl.uniform1i(physicsProgram.uniforms.particles, 0);

	gl.bindFramebuffer(gl.FRAMEBUFFER, physicsProgram.buffers.frame);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		physicsProgram.textures.output,
		0
	);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	gl.flush();

	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		null,
		0
	);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function render(gl, renderProgram) {

	gl.viewport(0, 0, renderProgram.width, renderProgram.height);

	gl.enable(gl.BLEND);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(renderProgram.program);

	gl.uniform2f(
		renderProgram.uniforms.resolution, renderProgram.width, renderProgram.height
	);

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

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

async function main() {

	const [gl, width, height] = GLUtil.makeGL('canvas');

	const particleIndex = Particle.generateParticleIndex(gl);

	const particleData = Particle.generateParticleDataTexture(gl, width, height);

	const blackhole = Array(
		new Float32Array([
			Math.random() * width,
			Math.random() * height
		]),

		new Float32Array([
			Math.random() * width,
			Math.random() * height
		]),

		new Float32Array([
			Math.random() * width,
			Math.random() * height
		])
	);

	const renderProgram = await getRenderProgram(
		gl, width, height, particleIndex, particleData
	);

	const physicsProgram = getPhysicsProgram(gl, particleData, blackhole);

	const copyProgram = getCopyProgram(gl);

	gl.disable(gl.DEPTH_TEST);

	gl.clearColor(0, 0, 0, 1);

	renderLoop(gl, renderProgram, physicsProgram, copyProgram);
}

function renderLoop(gl, renderProgram, physicsProgram, copyProgram) {

	update(gl, physicsProgram);

	copy(gl, copyProgram, renderProgram, physicsProgram);

	render(gl, renderProgram);

	gl.finish();

	requestAnimationFrame(function () {
		renderLoop(gl, renderProgram, physicsProgram, copyProgram);
	});
}

window.onload = main;