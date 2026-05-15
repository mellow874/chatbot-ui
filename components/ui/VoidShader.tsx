"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform vec2  u_resolution;
uniform float u_time;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 17.5);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.x *= u_resolution.x / u_resolution.y;
  float t = u_time * 0.06;

  vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(1.7, 9.2)));
  vec2 r = vec2(
    fbm(uv + 4.0 * q + vec2(1.7 + t, 9.2)),
    fbm(uv + 4.0 * q + vec2(8.3, 2.8 + t))
  );
  float f = fbm(uv + 4.0 * r);

  vec3 col = mix(vec3(0.01, 0.01, 0.05), vec3(0.03, 0.02, 0.10),
                 clamp(f * f * 4.0, 0.0, 1.0));
  col      = mix(col, vec3(0.06, 0.04, 0.20), clamp(f * 2.5, 0.0, 1.0));
  col      = mix(col, vec3(0.36, 0.31, 1.00), clamp(length(q), 0.0, 1.0) * 0.04);

  gl_FragColor = vec4(col, 0.85);
}`;

interface VoidShaderProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function VoidShader({ className = "", style }: VoidShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });

    // Failure A mitigation: graceful CSS fallback
    if (!gl) {
      canvas.style.background =
        "radial-gradient(ellipse at 30% 20%, rgba(45,30,120,0.4) 0%, transparent 60%)," +
        "radial-gradient(ellipse at 70% 80%, rgba(30,20,90,0.3) 0%, transparent 60%)";
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, "u_resolution");
    const uTime = gl.getUniformLocation(prog, "u_time");

    let raf: number;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2); // Failure D mitigation
      canvas.width  = canvas.clientWidth  * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Failure B mitigation: disconnect before cancel
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={style}
    />
  );
}
