/**
 * Make a texture from the given data.
 * @param gl The WebGL context
 * @param dimension The power of 2 dimension for the texture.
 * @param data The data to pack into the texture.
 * @returns {WebGLTexture} The created texture.
 */
function makeDataTexture(gl, dimension, data) {
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

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
}

async function makeTexture(gl, url) {
    return new Promise(function (resolve, reject) {

        const image = new Image();

        image.onload = function () {

            const texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.generateMipmap(gl.TEXTURE_2D);

            resolve(texture);
        }

        image.onerror = function () {
            reject();
        }

        image.src = url;
    });
}

/**
 * Generates a WebGLBuffer that contains the index positions of the particles.
 * These indexes are used to lookup the particle data within the textures.
 * @param gl The WebGL context.
 * @param count The total number of particles
 * @returns {WebGLBuffer} A WebGLBuffer that contains the x/y texture position of each particle
 */
function generateParticleIndex(gl, count) {

    const data = new Float32Array(count * 2);

    const rowLength = Math.sqrt(count);

    const step = 1 / rowLength;

    for (let i = 0; i < count; ++i) {

        const block = i * 2;

        data[block] = step * Math.floor(i % rowLength);

        data[block + 1] = step * (Math.floor(i / rowLength));
    }

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer;
}

/**
 * Generates the particle x position, y position and point size.
 * @param count The number of particles to generate the data for.
 * @param width The width of the grid.
 * @param height The height of the grid.
 * @returns {Float32Array} An array containing the particle data.
 */
function generateParticleData(count, width, height) {

    const buffer = new Float32Array(count * 4);

    for (let i = 0; i < count; ++i) {
        const block = i * 4;

        // The particle x position
        buffer[block] = Math.random() * width;

        // The particle y position
        buffer[block + 1] = Math.random() * height;

        // The particle point size
        buffer[block + 2] = 2 ** (Math.floor(Math.random() * 4) + 1);

        // dummy for now
        buffer[block + 3] = 0;
    }

    return buffer;
}

function render(gl, renderInfo) {

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(renderInfo.program);

    gl.uniform2f(
        renderInfo.uniforms.resolution,
        renderInfo.width,
        renderInfo.height
    );

    gl.enableVertexAttribArray(renderInfo.attributes.index);

    gl.bindBuffer(gl.ARRAY_BUFFER, renderInfo.buffers.index);

    gl.vertexAttribPointer(
        renderInfo.attributes.index,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, renderInfo.textures.particles);

    gl.uniform1i(renderInfo.uniforms.particles, 0);

    gl.activeTexture(gl.TEXTURE1);

    gl.bindTexture(gl.TEXTURE_2D, renderInfo.textures.texture);

    gl.uniform1i(renderInfo.uniforms.texture, 1);

    gl.drawArrays(gl.POINTS, 0, renderInfo.particles);

    gl.flush();
}

async function main() {

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

    const texture = await makeTexture(gl, 'assets/circle_05.png');

    const program = util.getProgram(gl, 'vertex-shader', 'fragment-shader');

    const particles = 1024;

    const renderInfo = {

        program: program,

        width: width,

        height: height,

        particles: particles,

        buffers: {

            index: generateParticleIndex(gl, particles)
        },

        attributes: {

            index: gl.getAttribLocation(program, 'a_index')
        },

        textures: {

            particles: makeDataTexture(
                gl,
                Math.sqrt(particles),
                generateParticleData(particles, width, height)
            ),

            texture: texture
        },

        uniforms: {

            resolution: gl.getUniformLocation(program, 'u_resolution'),

            particles: gl.getUniformLocation(program, 'u_particles'),

            texture: gl.getUniformLocation(program, 'u_texture')
        }
    };

    gl.disable(gl.DEPTH_TEST);

    gl.enable(gl.BLEND);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.clearColor(0, 0, 0, 1);

    gl.viewport(0, 0, width, height);

    render(gl, renderInfo);
}


window.onload = main;