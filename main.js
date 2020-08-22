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

	const particles = 1024;

	const [positionData, positionBuffer] =  makePositionBuffer(gl, particles, width, height);

	const [colourData, colourBuffer] = makeColourBuffer(gl, particles);

	const renderContext = {
		width: width,

		height: height,

		particles: particles,

		program: util.getProgram(gl, 'vertex-shader', 'fragment-shader'),

		positionBuffer: positionBuffer,

		positionData: positionData,

		colourData: colourData,

		colourBuffer: colourBuffer
	};

	gl.disable(gl.DEPTH_TEST);

	gl.enable(gl.BLEND);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	gl.clearColor(0, 0, 0, 1);

	gl.viewport(0, 0, width, height);

	update(gl, renderContext);

}

function makeColourBuffer(gl, count) {

	const data = new Float32Array(count * 4);

	for(let i = 0; i < data.length; ++i) {
		data[i] = Math.random();
	}

	const buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

	return [data, buffer];

}

function makePositionBuffer(gl, count, width, height) {

	// * 2 as we store the x/y positions.
	const data = new Float32Array(count * 2);

	for (let i = 0; i < data.length; i += 1) {
		data[i] = Math.floor(Math.random() * width);

		data[i + 1] = Math.floor(Math.random() * height);
	}

	const buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

	return [data, buffer];

}

function render(gl, renderContext) {

	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(renderContext.program);

	const resolutionUniform = gl.getUniformLocation(renderContext.program, 'u_resolution');

	gl.uniform2f(resolutionUniform, renderContext.width, renderContext.height);

	const positionAttribute = gl.getAttribLocation(renderContext.program, 'a_position');

	gl.enableVertexAttribArray(positionAttribute);

	for (let i = 0; i < renderContext.positionData.length; ++i) {
		renderContext.positionData[i] = (2 * Math.random()) - 1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, renderContext.positionBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, renderContext.positionData, gl.DYNAMIC_DRAW);

	gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

	const colourAttribute = gl.getAttribLocation(renderContext.program, 'a_colour');

	for (let i = 0; i < renderContext.colourBuffer.length; ++i) {
		renderContext.colourData[i] = Math.random();
	}

	gl.enableVertexAttribArray(colourAttribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, renderContext.colourBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, renderContext.colourData, gl.DYNAMIC_DRAW);

	gl.vertexAttribPointer(colourAttribute, 4, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.POINTS, 0, renderContext.particles);
}

function update(gl, renderContext) {
	render(gl, renderContext);

	gl.flush();

	requestAnimationFrame(function () {
		update(gl, renderContext);
	});
}

window.onload = main;