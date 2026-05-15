"use client";

import { useEffect, useRef, useCallback } from "react";

// ── WebGL Fluid Simulation ────────────────────────────────────────────
// Adapted from Pavel Dobryakov's WebGL fluid simulation.
// Simplified and tuned for the QLA Mentor login page.

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
  const program = gl.createProgram()!;
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  return program;
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

function createFBO(gl: WebGLRenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): FBO {
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    texture,
    fbo,
    width: w,
    height: h,
    attach(id: number) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    },
  };
}

function createDoubleFBO(gl: WebGLRenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, filter: number): DoubleFBO {
  let fbo1 = createFBO(gl, w, h, internalFormat, format, type, filter);
  let fbo2 = createFBO(gl, w, h, internalFormat, format, type, filter);
  return {
    width: w,
    height: h,
    read: fbo1,
    write: fbo2,
    swap() {
      const temp = fbo1;
      fbo1 = fbo2;
      fbo2 = temp;
      this.read = fbo1;
      this.write = fbo2;
    },
  };
}

// ── Shaders ───────────────────────────────────────────────────────────
const baseVS = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const splatFS = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const advectionFS = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main () {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = dissipation * texture2D(uSource, coord);
    float decay = max(1.0 - 0.0002, 0.0);
    gl_FragColor = decay * result;
  }
`;

const divergenceFS = `
  precision mediump float;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const pressureFS = `
  precision mediump float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const gradientSubtractFS = `
  precision mediump float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const displayFS = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  void main () {
    vec3 c = texture2D(uTexture, vUv).rgb;
    float a = max(c.r, max(c.g, c.b));
    gl_FragColor = vec4(c, a);
  }
`;

const clearFS = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

export default function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const reducedMotion = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const initFluid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If reduced motion, don't init WebGL at all
    if (reducedMotion.current) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    // Resolution scale
    const SCALE = 0.5;
    const resizeCanvas = () => {
      canvas.width = Math.floor(canvas.clientWidth * SCALE);
      canvas.height = Math.floor(canvas.clientHeight * SCALE);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Simulation params
    const SIM_RES = 128;
    const DYE_RES = 512;
    const DENSITY_DISSIPATION = 5.0;
    const VELOCITY_DISSIPATION = 3.5;
    const PRESSURE = 0.8;
    const SPLAT_RADIUS = 0.25;
    const CURL = 0;

    // Programs
    const splatProg = createProgram(gl, baseVS, splatFS);
    const advectionProg = createProgram(gl, baseVS, advectionFS);
    const divergenceProg = createProgram(gl, baseVS, divergenceFS);
    const pressureProg = createProgram(gl, baseVS, pressureFS);
    const gradSubProg = createProgram(gl, baseVS, gradientSubtractFS);
    const displayProg = createProgram(gl, baseVS, displayFS);
    const clearProg = createProgram(gl, baseVS, clearFS);

    // Quad
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    function getResolution(resolution: number) {
      let aspectRatio = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      return gl!.drawingBufferWidth > gl!.drawingBufferHeight
        ? { width: max, height: min }
        : { width: min, height: max };
    }

    const simRes = getResolution(SIM_RES);
    const dyeRes = getResolution(DYE_RES);

    let velocity = createDoubleFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
    let dye = createDoubleFBO(gl, dyeRes.width, dyeRes.height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
    let divergence = createFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST);
    let pressure = createDoubleFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST);

    function blit(target: WebGLFramebuffer | null) {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad);
      gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, idx);
      const posLoc = 0;
      gl!.vertexAttribPointer(posLoc, 2, gl!.FLOAT, false, 0, 0);
      gl!.enableVertexAttribArray(posLoc);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, target);
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    }

    // Mouse tracking
    let pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, down: false };

    const handleMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      pointer.dx = (x - pointer.x) * 10;
      pointer.dy = (y - pointer.y) * 10;
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
    };

    const handleDown = () => { pointer.down = true; };
    const handleUp = () => { pointer.down = false; };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    // Colors
    const VIOLET = [0.486, 0.228, 0.929]; // #7c3aed normalized
    const EMBER = [1.0, 0.478, 0.102]; // #ff7a1a normalized

    function splat(x: number, y: number, dx: number, dy: number, color: number[]) {
      // Velocity splat
      gl!.useProgram(splatProg);
      gl!.uniform1i(gl!.getUniformLocation(splatProg, "uTarget"), velocity.read.attach(0));
      gl!.uniform1f(gl!.getUniformLocation(splatProg, "aspectRatio"), canvas!.width / canvas!.height);
      gl!.uniform2f(gl!.getUniformLocation(splatProg, "point"), x, y);
      gl!.uniform3f(gl!.getUniformLocation(splatProg, "color"), dx, dy, 0);
      gl!.uniform1f(gl!.getUniformLocation(splatProg, "radius"), SPLAT_RADIUS / 100);
      gl!.uniform2f(gl!.getUniformLocation(splatProg, "texelSize"), 1 / simRes.width, 1 / simRes.height);
      gl!.viewport(0, 0, velocity.width, velocity.height);
      blit(velocity.write.fbo);
      velocity.swap();

      // Dye splat
      gl!.uniform1i(gl!.getUniformLocation(splatProg, "uTarget"), dye.read.attach(0));
      gl!.uniform3f(gl!.getUniformLocation(splatProg, "color"), color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
      gl!.viewport(0, 0, dye.width, dye.height);
      blit(dye.write.fbo);
      dye.swap();
    }

    function step(dt: number) {
      // Advect velocity
      gl!.useProgram(advectionProg);
      gl!.uniform2f(gl!.getUniformLocation(advectionProg, "texelSize"), 1 / simRes.width, 1 / simRes.height);
      gl!.uniform1i(gl!.getUniformLocation(advectionProg, "uVelocity"), velocity.read.attach(0));
      gl!.uniform1i(gl!.getUniformLocation(advectionProg, "uSource"), velocity.read.attach(0));
      gl!.uniform1f(gl!.getUniformLocation(advectionProg, "dt"), dt);
      gl!.uniform1f(gl!.getUniformLocation(advectionProg, "dissipation"), 1.0 / (1.0 + dt * VELOCITY_DISSIPATION));
      gl!.viewport(0, 0, velocity.width, velocity.height);
      blit(velocity.write.fbo);
      velocity.swap();

      // Advect dye
      gl!.uniform1i(gl!.getUniformLocation(advectionProg, "uVelocity"), velocity.read.attach(0));
      gl!.uniform1i(gl!.getUniformLocation(advectionProg, "uSource"), dye.read.attach(1));
      gl!.uniform1f(gl!.getUniformLocation(advectionProg, "dissipation"), 1.0 / (1.0 + dt * DENSITY_DISSIPATION));
      gl!.viewport(0, 0, dye.width, dye.height);
      blit(dye.write.fbo);
      dye.swap();

      // Divergence
      gl!.useProgram(divergenceProg);
      gl!.uniform2f(gl!.getUniformLocation(divergenceProg, "texelSize"), 1 / simRes.width, 1 / simRes.height);
      gl!.uniform1i(gl!.getUniformLocation(divergenceProg, "uVelocity"), velocity.read.attach(0));
      gl!.viewport(0, 0, simRes.width, simRes.height);
      blit(divergence.fbo);

      // Clear pressure
      gl!.useProgram(clearProg);
      gl!.uniform1i(gl!.getUniformLocation(clearProg, "uTexture"), pressure.read.attach(0));
      gl!.uniform1f(gl!.getUniformLocation(clearProg, "value"), PRESSURE);
      gl!.uniform2f(gl!.getUniformLocation(clearProg, "texelSize"), 1 / simRes.width, 1 / simRes.height);
      gl!.viewport(0, 0, pressure.width, pressure.height);
      blit(pressure.write.fbo);
      pressure.swap();

      // Pressure solve (Jacobi iterations)
      gl!.useProgram(pressureProg);
      gl!.uniform2f(gl!.getUniformLocation(pressureProg, "texelSize"), 1 / simRes.width, 1 / simRes.height);
      gl!.uniform1i(gl!.getUniformLocation(pressureProg, "uDivergence"), divergence.attach(0));
      for (let i = 0; i < 20; i++) {
        gl!.uniform1i(gl!.getUniformLocation(pressureProg, "uPressure"), pressure.read.attach(1));
        gl!.viewport(0, 0, pressure.width, pressure.height);
        blit(pressure.write.fbo);
        pressure.swap();
      }

      // Gradient subtract
      gl!.useProgram(gradSubProg);
      gl!.uniform2f(gl!.getUniformLocation(gradSubProg, "texelSize"), 1 / simRes.width, 1 / simRes.height);
      gl!.uniform1i(gl!.getUniformLocation(gradSubProg, "uPressure"), pressure.read.attach(0));
      gl!.uniform1i(gl!.getUniformLocation(gradSubProg, "uVelocity"), velocity.read.attach(1));
      gl!.viewport(0, 0, velocity.width, velocity.height);
      blit(velocity.write.fbo);
      velocity.swap();
    }

    let lastTime = Date.now();

    function render() {
      const now = Date.now();
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      dt = Math.min(dt, 0.016);

      if (pointer.moved) {
        pointer.moved = false;
        const color = pointer.down
          ? [EMBER[0] + Math.random() * 0.2, EMBER[1], EMBER[2]]
          : [VIOLET[0] + Math.random() * 0.15, VIOLET[1], VIOLET[2] + Math.random() * 0.1];
        splat(pointer.x, pointer.y, pointer.dx, pointer.dy, color);
      }

      step(dt);

      // Render to screen
      gl!.useProgram(displayProg);
      gl!.uniform1i(gl!.getUniformLocation(displayProg, "uTexture"), dye.read.attach(0));
      gl!.uniform2f(gl!.getUniformLocation(displayProg, "texelSize"), 1 / gl!.drawingBufferWidth, 1 / gl!.drawingBufferHeight);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      blit(null);

      animRef.current = requestAnimationFrame(render);
    }

    // Initial splats removed for cleaner, reactive-only experience

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanup = initFluid();
    return () => cleanup?.();
  }, [initFluid]);

  // If reduced motion, render static gradient instead
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.2) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "auto",
        mixBlendMode: "screen",
      }}
      aria-hidden="true"
    />
  );
}
