const util = {};

util.random = function(min, max) {
	return min + (Math.random() * (max - min));
}

util.getShader = function (gl, elementId, type) {

	const shaderSource = document.getElementById(elementId);

	const shader = gl.createShader(type);

	gl.shaderSource(shader, shaderSource.text);

	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

	const message = gl.getShaderInfoLog(shader);

	gl.deleteShader(shader);

	throw message;
}

util.getProgram = function (gl, vertexShaderId, fragmentShaderId) {

	const vertexShader = util.getShader(gl, vertexShaderId, gl.VERTEX_SHADER);

	const fragmentShader = util.getShader(gl, fragmentShaderId, gl.FRAGMENT_SHADER);

	const program = gl.createProgram();

	gl.attachShader(program, vertexShader);

	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);

	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
		return program;
	}

	const message = gl.getProgramInfoLog(program);

	gl.deleteShader(vertexShader);

	gl.deleteShader(fragmentShader);

	gl.deleteProgram(program);

	throw message;

}