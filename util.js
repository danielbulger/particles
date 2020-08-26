const util = {};

util.wrap = function(val, min, max) {
	if(val < min) {
		return max;
	} else if(val > max) {
		return min;
	} else {
		return val;
	}
}

util.toUnitVector = function (x, y) {
	const magnitude = Math.hypot(
		Math.pow(x, 2),
		Math.pow(y, 2)
	);

	return [
		x / magnitude,

		y / magnitude
	];
}

util.multiply = function (vector, value) {

	if (value instanceof Array) {
		vector[0] *= value[0];
		vector[1] *= value[1];
	} else {
		vector[0] *= value;
		vector[1] *= value;
	}
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