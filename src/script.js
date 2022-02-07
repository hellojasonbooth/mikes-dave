import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'lil-gui'
import gsap from 'gsap'


/**
 * Debug
 */
//const gui = new dat.GUI()


const canvasTag = document.querySelector('canvas')
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('textures/03.jpg')
let positions = []

const planeMaterial = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    map: texture
 })

const planeGeometry = new THREE.PlaneGeometry(1.1, 1.6)

class Boiler {

    constructor(canvas) {

        this.params = {
            width: window.innerWidth,
            height: window.innerHeight,
            canvas: canvas.dom,

            planeCount: 10,
            radius: 2
        }

        this.giuParameters = {
            bgColor: '#e0c2ae',
            planeCount: 10,
            radius: 2.2,
            offset: 0,
            animationSpeed: 0,
            objectDistance: 1
        }
        
        // gui
        //     .addColor(this.giuParameters, 'bgColor')
        //     .onChange(() => {
        //         this.renderer.setClearColor(this.giuParameters.bgColor, 1)
        //     })

        // gui.add(this.giuParameters, 'planeCount').min(1).max(24).step(1).onFinishChange(this.createPlanes.bind(this))
        // gui.add(this.giuParameters, 'radius').min(0.5).max(3).step(0.1).onFinishChange(this.createPlanes.bind(this))
        // gui.add(this.giuParameters, 'offset').min(0).max(3).step(0.1)
        // gui.add(this.giuParameters, 'animationSpeed').min(0).max(5).step(0.05)
        // gui.add(this.giuParameters, 'objectDistance').min(0.5).max(5).step(0.5).onFinishChange(this.createPlanes.bind(this))

        this.planeGroup = null

        this.objectDistance = 2

		this.clock = new THREE.Clock()
        this.previousTime = 0

        this.gltfPath = 'model/scene.gltf'
        this.model = null

        this.plane = null

        // this.scrollableDistance = window.scrollY / (window.innerHeight * this.giuParameters.planeCount)
        this.scrollableDistance = null
        this.aimDistance = null

        this.init()
    }

    init() {
        this.createScene()
        this.createCamera()
        this.createRenderer()

        this.createLoader()
        this.addLights()
		//this.addControls()

        this.createPlanes()

        window.addEventListener('resize', this.handleResize.bind(this))

    }

    createPlanes() {

        if(this.plane !== null) {
            positions = []
            this.scene.remove(this.planeGroup)
        }

        this.planeGroup = new THREE.Group()

        for(let i = 0; i < this.giuParameters.planeCount; i++) {

            const calcAngle = (i % this.giuParameters.planeCount) / this.giuParameters.planeCount * Math.PI * 4
            const moveRadius = this.giuParameters.radius

            this.plane = new THREE.Mesh(planeGeometry, planeMaterial)
            positions.push(this.plane)

            const x = Math.sin(calcAngle) * moveRadius
            const z = Math.cos(calcAngle) * moveRadius

            // const y = i

            positions[i].position.x = x
            positions[i].position.z = z

            positions[i].position.y = -this.giuParameters.objectDistance * i

            this.plane.rotation.y = calcAngle
 
            this.planeGroup.add(this.plane)
 
            this.planeGroup.add(this.plane)

        }

        this.scene.add(this.planeGroup)
        
    }

    createLoader() {
        this.loader = new GLTFLoader()

        this.loader.load(this.gltfPath, 
            gltf => {
                this.model = gltf.scene
                this.model.position.y = 1
                this.model.position.x = -0.2 
                // this.model.scale.set(0.1, 0.1, 0.1)
                this.scene.add(this.model)
            }
        )
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight('#ffffff', 2)

        const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
        directionalLight.position.set(0, 1, 2)

        this.scene.add(ambientLight, directionalLight)
    }

	
	addControls() {
		// Controls
		this.controls = new OrbitControls(this.camera, this.params.canvas)
		this.controls.enableDamping = true
	}

    createScene() {
        this.scene = new THREE.Scene()
    }

    handleResize() {
        this.params.width = window.innerWidth
        this.params.height = window.innerHeight
    
        this.camera.aspect = this.params.width / this.params.height
        this.camera.updateProjectionMatrix()
    
        this.renderer.setSize(this.params.width, this.params.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.params.canvas,
            alpha: true
        })
        this.renderer.setSize(this.params.width, this.params.height)
        this.renderer.setClearColor(this.giuParameters.bgColor, 1)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(35, this.params.width / this.params.height, 0.1, 100)
        this.camera.position.z = 6
        this.scene.add(this.camera)
    }

    animate() {

		//this.controls.update()

        const elapsedTime = this.clock.getElapsedTime()
        const deltaTime = elapsedTime - this.previousTime
        this.previousTime = elapsedTime


        this.aimDistance = window.scrollY / (window.innerHeight * 10)
        this.scrollableDistance += (this.aimDistance - this.scrollableDistance) * (deltaTime * 6)

        if(this.model) {
            this.model.position.y = (-window.scrollY / (this.params.height * 1.1) * this.giuParameters.objectDistance) + 1
            this.model.rotation.y = -this.scrollableDistance * 0.6
        }


        this.camera.position.y = - window.scrollY / this.params.height * this.giuParameters.objectDistance
        this.planeGroup.rotation.y = -this.scrollableDistance * Math.PI * 4

        //this.planeGroup.rotation.y = - window.scrollY / this.params.height * this.giuParameters.objectDistance

        this.renderer.render(this.scene, this.camera)

    }

}

const boiler = new Boiler({
	dom: canvasTag
})

gsap.ticker.add(() => {
	boiler.animate()
})
