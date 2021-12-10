import { gl } from '../../globals';

const level = 0;
class Framebuffer {
    framebuffer: WebGLFramebuffer;
    texture: WebGLTexture = null;
    auxTexture1: WebGLTexture = null;
    depthBuffer: WebGLRenderbuffer = null;
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.resize(width, height);
    }

    bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    clear() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        if (this.texture) {
            gl.deleteTexture(this.texture);
        }

        if (this.depthBuffer) {
            gl.deleteRenderbuffer(this.depthBuffer);
        }

        // Create and bind the framebuffer
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        this.texture = this.createTexture();
        gl.framebufferTexture2D(gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0, 
            gl.TEXTURE_2D,
            this.texture,
            level);
        
        this.auxTexture1 = this.createTexture();
        gl.framebufferTexture2D(gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT1, 
            gl.TEXTURE_2D,
            this.auxTexture1,
            level);

        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);

        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer not complete: ' + status);
            console.log('Status Codes: ' + [
                gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT,
                gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS,
                gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT,
                gl.FRAMEBUFFER_UNSUPPORTED]);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    }

    private createTexture() {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

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

        return texture;
    }
}

export default Framebuffer;