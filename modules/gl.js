export function getQuadBuffer(gl) {

	const buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
		gl.STATIC_DRAW
	);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return buffer;
}

/**
 * Make a texture from the given data.
 * @param gl The WebGL context
 * @param dimension The power of 2 dimension for the texture.
 * @param data The data to pack into the texture.
 * @returns {WebGLTexture} The created texture.
 */
export function makeDataTexture(gl, dimension, data) {
	const texture = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		dimension,
		dimension,
		0,
		gl.RGBA,
		gl.FLOAT,
		data
	);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.bindTexture(gl.TEXTURE_2D, null);

	return texture;
}

export async function makeTexture(gl, url) {
	return new Promise(function (resolve, reject) {

		const image = new Image();

		image.onload = function () {

			const texture = gl.createTexture();

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);

			gl.bindTexture(gl.TEXTURE_2D, null);

			resolve(texture);
		}

		image.onerror = function () {
			reject();
		}

		image.src = url;
	});
}


export function getShader(gl, shaderId, type) {

	const shaderSource = document.getElementById(shaderId).text;

	const shader = gl.createShader(type);

	gl.shaderSource(shader, shaderSource);

	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

	const message = gl.getShaderInfoLog(shader);

	gl.deleteShader(shader);

	throw message;
}

export function getProgram(gl, vertexShaderId, fragmentShaderId) {

	const vertexShader = getShader(gl, vertexShaderId, gl.VERTEX_SHADER);

	const fragmentShader = getShader(gl, fragmentShaderId, gl.FRAGMENT_SHADER);

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

export function makeGL(canvasId) {

	const canvas = document.getElementById(canvasId);

	const gl = canvas.getContext('webgl');

	if (!gl) {
		throw 'No WebGL';
	}

	if (!gl.getExtension('OES_texture_float')) {
		throw 'No OES_texture_float';
	}

	gl.getExtension('EXT_color_buffer_float');
	gl.getExtension('EXT_float_blend');

	const width = canvas.width = window.innerWidth;

	const height = canvas.height = window.innerHeight;

	return [gl, width, height];
}

