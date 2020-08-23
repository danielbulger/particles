class Physics {

	constructor(gravity, drag) {
		this.gravity = gravity;

		this.drag = drag;
	}

	getGravity() {
		return this.gravity;
	}

	getDrag() {
		return this.drag;
	}
}

class Particles {

	constructor(count, width, height) {

		this.positions = new Float32Array(count * 2);

		this.colours = new Float32Array(count * 4);

		this.velocity = new Float32Array(count * 2);

		this.mass = new Float32Array(count);

		this.forces = new Float32Array(count * 2);

		this.count = count;

		this.width = width;

		this.height = height;

		this.initialise();
	}

	initialise() {

		for (let i = 0; i < this.count; ++i) {

			this.mass[i] = Math.random();

			this.positions[i * 2] = Math.random() * this.width;

			this.positions[(i * 2) + 1] = Math.random() * this.height;

			for (let k = 0; k < 4; ++k) {
				this.colours[(i * 4) + k] = Math.random();
			}

			this.velocity[i * 2] = 2 * Math.random();

			this.velocity[(i * 2) + 1] = 2 * Math.random();
		}
	}

	update(physics) {

		const step = 1 / 33;

		for (let i = 0; i < this.count; ++i) {
			this.forces[(i * 2)] = 0;

			this.forces[(i * 2) + 1] = (physics.getGravity() * this.mass[i]);
		}

		for (let i = 0; i < this.positions.length; ++i) {

			this.velocity[i] += this.forces[i];

			this.positions[i] += (step * (this.velocity[i] * physics.getDrag()));

		}

	}

	getPositions() {
		return this.positions;
	}

	getColours() {
		return this.colours;
	}

}

function main() {

	const canvas = document.getElementById('canvas');

	const gl = canvas.getContext('webgl');

	if (!gl) {
		throw 'No WebGL';
	}

	if (!gl.getExtension('OES_texture_float')) {
		throw 'No OES_texture_float';
	}

	const width = canvas.width = window.innerWidth;

	const height = canvas.height = window.innerHeight;

	const particleCount = 1024 ** 2;

	const particles = new Particles(particleCount, width, height);

	const physics = new Physics(-9.6, 0.5);

	const renderContext = {
		width: width,

		height: height,

		particles: particleCount,

		program: util.getProgram(gl, 'vertex-shader', 'fragment-shader'),

		buffers: {
			position: gl.createBuffer(),

			colour: gl.createBuffer()
		}
	};

	gl.disable(gl.DEPTH_TEST);

	gl.enable(gl.BLEND);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	gl.clearColor(0, 0, 0, 1);

	gl.viewport(0, 0, width, height);

	update(particles, physics, gl, renderContext);

}

function render(particles, gl, renderContext) {

	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(renderContext.program);

	const resolutionUniform = gl.getUniformLocation(renderContext.program, 'u_resolution');

	gl.uniform2f(resolutionUniform, renderContext.width, renderContext.height);

	const positionAttribute = gl.getAttribLocation(renderContext.program, 'a_position');

	gl.enableVertexAttribArray(positionAttribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, renderContext.buffers.position);

	gl.bufferData(gl.ARRAY_BUFFER, particles.getPositions(), gl.DYNAMIC_DRAW);

	gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

	const colourAttribute = gl.getAttribLocation(renderContext.program, 'a_colour');

	gl.enableVertexAttribArray(colourAttribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, renderContext.buffers.colour);

	gl.bufferData(gl.ARRAY_BUFFER, particles.getColours(), gl.DYNAMIC_DRAW);

	gl.vertexAttribPointer(colourAttribute, 4, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.POINTS, 0, renderContext.particles);
}

function update(particles, physics, gl, renderContext) {

	particles.update(physics);

	render(particles, gl, renderContext);

	gl.flush();

	requestAnimationFrame(function () {
		update(particles, physics, gl, renderContext);
	});
}

window.onload = main;