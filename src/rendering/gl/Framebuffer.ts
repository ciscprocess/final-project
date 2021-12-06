import { gl } from '../../globals';

class Framebuffer {
    framebuffer: WebGLFramebuffer;
    texture: WebGLTexture = null;
    depthBuffer: WebGLRenderbuffer = null;
    width: number;
    height: number;
    attach: GLenum;


    constructor(width: number, height: number, attach:GLenum = gl.COLOR_ATTACHMENT0) {
        this.attach = attach;
        this.resize(width, height);
    }

    bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    clear() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    resize(w: number, h: number) {
        const level = 0;
        this.width = w;
        this.height = h;
        if (this.texture) {
            gl.deleteTexture(this.texture);
        }

        if (this.depthBuffer) {
            gl.deleteRenderbuffer(this.depthBuffer);
        }

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // Create empty texture.
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            gl.RGBA,
            this.width,
            this.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null);

        // Mip-mapping not needed since it will be on screen quad.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Create and bind the framebuffer
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        gl.framebufferTexture2D(gl.FRAMEBUFFER,
            this.attach, 
            gl.TEXTURE_2D,
            this.texture,
            level);
        
        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
    }
}

export default Framebuffer;