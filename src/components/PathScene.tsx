import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  PATH_FIELDS,
  STILL_TURN,
  adjacentPairs,
  fieldPosition,
  ringRadius,
  tiltFromPointer,
} from "../lib/constellation";
import { prefersReducedMotion } from "../lib/motionPrefs";

function hashUnit(index: number, salt: number): number {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function disposeTree(root: THREE.Object3D) {
  root.traverse((child) => {
    const drawable = child as THREE.Object3D & {
      geometry?: { dispose: () => void };
      material?: THREE.Material | THREE.Material[];
    };
    drawable.geometry?.dispose();
    if (Array.isArray(drawable.material)) drawable.material.forEach((item) => item.dispose());
    else drawable.material?.dispose();
  });
}

export default function PathScene({ onReady }: { onReady: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion()) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let frame = 0;
    let running = true;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const gl = renderer;
    gl.setClearColor(0x000000, 0);
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.12;
    gl.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(gl.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    camera.position.set(0, 3.35, 8.15);
    camera.lookAt(0, 0.04, 0);

    const tilt = new THREE.Group();
    scene.add(tilt);

    const hemi = new THREE.HemisphereLight(0xd7e7f6, 0x1c2430, 1);
    const ambient = new THREE.AmbientLight(0xf7f1e8, 0.38);
    const key = new THREE.DirectionalLight(0xfffaf6, 1.5);
    key.position.set(4.4, 6.4, 3.2);
    const fill = new THREE.PointLight(0xe7c4a4, 10, 16, 2);
    fill.position.set(0.2, 0.5, 1.2);
    tilt.add(hemi, ambient, key, fill);

    const starPositions = new Float32Array(72 * 3);
    for (let index = 0; index < 72; index += 1) {
      const radius = 4.4 + hashUnit(index, 1) * 3.2;
      const theta = hashUnit(index, 2) * Math.PI * 2;
      starPositions[index * 3] = Math.cos(theta) * radius;
      starPositions[index * 3 + 1] = (hashUnit(index, 3) - 0.48) * 2.6;
      starPositions[index * 3 + 2] = Math.sin(theta) * radius * 0.7;
    }
    const stars = new THREE.BufferGeometry();
    stars.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    tilt.add(new THREE.Points(
      stars,
      new THREE.PointsMaterial({
        color: 0xfffaf6,
        size: 0.032,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    ));

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xe8c6aa,
        emissive: 0x8d4520,
        emissiveIntensity: 0.62,
        roughness: 0.32,
        metalness: 0.2,
      }),
    );
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.007, 12, 56),
      new THREE.MeshBasicMaterial({ color: 0xfffaf6, transparent: true, opacity: 0.42 }),
    );
    halo.rotation.x = Math.PI / 2.35;
    tilt.add(core, halo);

    for (const ring of [0, 1, 2]) {
      const radius = ringRadius(ring);
      const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.62, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(96).map((point) => new THREE.Vector3(point.x, 0, point.y));
      const material = new THREE.LineBasicMaterial({
        color: ring === 1 ? 0xe0b089 : 0xd7e6f4,
        transparent: true,
        opacity: ring === 0 ? 0.5 : 0.34,
      });
      tilt.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), material));
    }

    const bodies: THREE.Mesh[] = [];
    const materials: THREE.MeshStandardMaterial[] = [];
    for (const field of PATH_FIELDS) {
      const material = new THREE.MeshStandardMaterial({
        color: field.color,
        emissive: field.emissive,
        emissiveIntensity: 0.28,
        roughness: 0.36,
        metalness: 0.18,
      });
      materials.push(material);
      const size = field.ring === 0 ? 0.155 : field.ring === 1 ? 0.13 : 0.11;
      const body = new THREE.Mesh(new THREE.SphereGeometry(size, 26, 26), material);
      tilt.add(body);
      bodies.push(body);
    }

    const pairs = adjacentPairs(PATH_FIELDS);
    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pairs.length * 6), 3));
    const links = new THREE.LineSegments(
      linkGeometry,
      new THREE.LineBasicMaterial({ color: 0xe8eef5, transparent: true, opacity: 0.3 }),
    );
    tilt.add(links);

    const pointer = { x: 0, y: 0 };
    const projected = new THREE.Vector3();
    let turn = STILL_TURN;
    let hovering = false;
    let visible = true;
    let readySent = false;
    const clock = new THREE.Clock();

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (width < 2 || height < 2) return;
      gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 720 ? 1 : 1.35));
      gl.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointer = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      hovering = true;
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onLeave = () => {
      hovering = false;
      pointer.x = 0;
      pointer.y = 0;
    };

    const draw = () => {
      if (!running) return;
      frame = window.requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      const delta = Math.min(0.05, clock.getDelta());
      turn += delta * 0.15;
      const target = tiltFromPointer(pointer.x, pointer.y);
      tilt.rotation.x += (target.x - tilt.rotation.x) * 0.07;
      tilt.rotation.y += (target.y - tilt.rotation.y) * 0.07;

      let nearest = -1;
      let nearestDistance = 0.62;
      bodies.forEach((body, index) => {
        const point = fieldPosition(PATH_FIELDS[index], turn);
        body.position.set(point.x, point.y, point.z);
        body.getWorldPosition(projected);
        projected.project(camera);
        const distance = Math.hypot(projected.x - pointer.x, projected.y - pointer.y);
        if (hovering && distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });

      materials.forEach((material, index) => {
        const hot = index === nearest;
        const glow = hot ? 1 : 0.26;
        material.emissiveIntensity += (glow - material.emissiveIntensity) * 0.14;
        const scaleGoal = hot ? 1.32 : 1;
        const next = bodies[index].scale.x + (scaleGoal - bodies[index].scale.x) * 0.14;
        bodies[index].scale.setScalar(next);
      });

      const attribute = linkGeometry.getAttribute("position") as THREE.BufferAttribute;
      pairs.forEach((pair, index) => {
        const from = bodies[pair[0]].position;
        const to = bodies[pair[1]].position;
        attribute.setXYZ(index * 2, from.x, from.y, from.z);
        attribute.setXYZ(index * 2 + 1, to.x, to.y, to.z);
      });
      attribute.needsUpdate = true;
      halo.rotation.z += delta * 0.12;
      gl.render(scene, camera);

      const width = host.clientWidth;
      const height = host.clientHeight;
      const spots = bodies.map((body, index) => {
        body.getWorldPosition(projected);
        projected.project(camera);
        return {
          index,
          x: (projected.x * 0.5 + 0.5) * width,
          y: (-projected.y * 0.5 + 0.5) * height,
          z: projected.z,
        };
      });
      const ranked = [...spots].sort((left, right) => left.z - right.z);
      if (nearest >= 0) {
        const hotSpot = ranked.findIndex((spot) => spot.index === nearest);
        if (hotSpot > 0) {
          const [hot] = ranked.splice(hotSpot, 1);
          ranked.unshift(hot);
        }
      }
      const accepted: { x: number; y: number }[] = [];
      const visibleLabels = new Set<number>();
      const gap = width < 560 ? 84 : 92;
      for (const spot of ranked) {
        if (spot.z > 1 || spot.x < 28 || spot.y < 18 || spot.x > width - 28 || spot.y > height - 10) continue;
        const crowded = accepted.some((item) => Math.hypot(item.x - spot.x, item.y - spot.y) < gap);
        if (crowded) continue;
        accepted.push(spot);
        visibleLabels.add(spot.index);
        if (accepted.length >= 4) break;
      }
      spots.forEach((spot) => {
        const label = labelRefs.current[spot.index];
        if (!label) return;
        const shown = visibleLabels.has(spot.index);
        const hot = spot.index === nearest;
        label.style.transform = `translate(${spot.x}px, ${spot.y}px) translate(-50%, -170%)`;
        label.style.opacity = shown ? (hot ? "1" : "0.9") : "0";
        label.classList.toggle("is-hot", shown && hot);
      });

      if (!readySent) {
        readySent = true;
        readyRef.current();
      }
    };

    const visibility = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    });
    visibility.observe(host);
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(host);
    resize();
    host.addEventListener("pointermove", onPointer);
    host.addEventListener("pointerleave", onLeave);
    frame = window.requestAnimationFrame(draw);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      visibility.disconnect();
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
      disposeTree(scene);
      gl.dispose();
      gl.domElement.remove();
    };
  }, []);

  return (
    <div className="path-scene-root">
      <div ref={hostRef} className="path-scene" />
      <div className="path-labels">
        {PATH_FIELDS.map((field, index) => (
          <span
            key={field.id}
            className="path-label"
            ref={(node) => {
              labelRefs.current[index] = node;
            }}
          >
            {field.short}
          </span>
        ))}
      </div>
    </div>
  );
}
