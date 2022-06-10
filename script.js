function jogo() {

    'use strict';

        const canvas = document.querySelector('#c');
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
        });
        renderer.autoClearColor = false;

        const fov = 60;
        const aspect = 2;
        const near = 0.1;
        const far = 200;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 30;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('white');

        const cameraPole = new THREE.Object3D();
        scene.add(cameraPole);
        cameraPole.add(camera);

        {
            const color = 0xFFFFFF;
            const intensity = 1.5;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-1, 2, 4);
            camera.add(light);
        }

        const radius = 0.18;
        const geometry = new THREE.OctahedronBufferGeometry(radius);

        function rand(min, max) {
            if (max === undefined) {
                max = min;
                min = 0;
            }
            return min + (max - min) * Math.random();
        }

        function randomColor() {
            return `hsl(${rand(200) | 193}, ${rand(50, 100) | 50}%, 40%)`;
        }

        const numObjects = 1200;
        for (let i = 0; i < numObjects; ++i) {
            const material = new THREE.MeshPhongMaterial({
                color: randomColor(),
                shininess: 150
            });

            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);

            cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
            cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
            cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
        }

        function resizeRendererToDisplaySize(renderer) {
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
            }
            return needResize;
        }

        class PickHelper {
            constructor() {
                this.raycaster = new THREE.Raycaster();
                this.pickedObject = null;
                this.pickedObjectSavedColor = 0;
            }
            pick(normalizedPosition, scene, camera, time) {

                if (this.pickedObject) {
                    this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
                    this.pickedObject = undefined;
                }

                this.raycaster.setFromCamera(normalizedPosition, camera);

                const intersectedObjects = this.raycaster.intersectObjects(scene.children);
                if (intersectedObjects.length) {

                    this.pickedObject = intersectedObjects[0].object;
                    this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
                    this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
                }
            }
        }

        const pickPosition = { x: 0, y: 0 };
        const pickHelper = new PickHelper();
        clearPickPosition();

        function render(time) {
            time *= 0.001;

            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

            cameraPole.rotation.y = time * .1;

            pickHelper.pick(pickPosition, scene, camera, time);

            renderer.render(scene, camera);

            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        function getCanvasRelativePosition(event) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };
        }

        function setPickPosition(event) {
            const pos = getCanvasRelativePosition(event);
            pickPosition.x = (pos.x / canvas.clientWidth) * 2 - 1;
            pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1;
        }

        function clearPickPosition() {

            pickPosition.x = -100000;
            pickPosition.y = -100000;
        }
        window.addEventListener('mousemove', setPickPosition);
        window.addEventListener('mouseout', clearPickPosition);
        window.addEventListener('mouseleave', clearPickPosition);

        window.addEventListener('touchstart', (event) => {
            event.preventDefault();
            setPickPosition(event.touches[0]);
        }, { passive: false });

        window.addEventListener('touchmove', (event) => {
            setPickPosition(event.touches[0]);
        });

        window.addEventListener('touchend', clearPickPosition);
 
}
