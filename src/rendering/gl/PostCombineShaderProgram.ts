import { gl } from "../../globals";
import ShaderProgram, { Shader } from "./ShaderProgram";

class PostCombineShaderProgram extends ShaderProgram {
    unifColorTex1: WebGLUniformLocation;
    unifColorTex2: WebGLUniformLocation;
    unifDepthTex1: WebGLUniformLocation;
    unifDepthTex2: WebGLUniformLocation;

    constructor(uniforms: Array<string>) {
        super([
            new Shader(gl.VERTEX_SHADER, require('../../shaders/post/passthrough.vert.glsl')),
            new Shader(gl.FRAGMENT_SHADER, require('../../shaders/post/combine.frag.glsl'))
        ], uniforms);

        this.unifColorTex1 = gl.getUniformLocation(this.prog, 'u_ColorTex1');
        this.unifColorTex2 = gl.getUniformLocation(this.prog, 'u_ColorTex2');
        this.unifDepthTex1 = gl.getUniformLocation(this.prog, 'u_DepthTex1');
        this.unifDepthTex2 = gl.getUniformLocation(this.prog, 'u_DepthTex2');
    }

    setTextures(
        colTex1: WebGLTexture, colTex2: WebGLTexture,
        depthTex1: WebGLTexture, depthTex2: WebGLTexture) {
        if (this.unifColorTex1 === -1 ||
            this.unifColorTex2 === -1) {
            console.error('A sampler not bound!');
        }
    
        this.use();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, colTex1);
        gl.uniform1i(this.unifColorTex1, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, colTex2);
        gl.uniform1i(this.unifColorTex2, 2);

        // gl.activeTexture(gl.TEXTURE3);
        // gl.bindTexture(gl.TEXTURE_2D, depthTex1);
        // gl.uniform1i(this.unifDepthTex1, 3);

        // gl.activeTexture(gl.TEXTURE4);
        // gl.bindTexture(gl.TEXTURE_2D, depthTex2);
        // gl.uniform1i(this.unifDepthTex2, 4);
    }
}

export default PostCombineShaderProgram;