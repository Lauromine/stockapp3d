import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, PointerEventTypes, StandardMaterial, Color3 } from "@babylonjs/core";
import { AbstractMesh } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

class App {
    constructor() {
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

        const gridWidth: number = 9;
        const gridHeight: number = 9;

        let cubes: Mesh[] = []
        for(let i = 0; i <= gridWidth; i++) {
            for(let j = 0; j <= gridHeight; j++) {
                let cube: Mesh = MeshBuilder.CreateBox(`box${cubes.length}`, {size: 1}, scene);
                cube.position.x = i * 2;
                cube.position.y = j * 2;
                cube.position.z = -2 + Math.random() * 4;
                cubes = [...cubes, cube]
            }
        }
        
        scene.onPointerObservable.add((pointerInfo) => {
            switch(pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                    if(pointerInfo.pickInfo.hit) {
                        onPointerDown(pointerInfo.pickInfo.pickedMesh)
                    }
                break;
                case PointerEventTypes.POINTERUP:
                    if(pointerInfo.pickInfo.hit) {
                        onPointerUp(pointerInfo.pickInfo.pickedMesh)
                    }
                break;
            }
        })

        const beingClickedMaterial:StandardMaterial = new StandardMaterial("beingClickedMaterialmat")
        beingClickedMaterial.diffuseColor = new Color3(1, 0, 0);

        const alreadyClickedMaterial:StandardMaterial = new StandardMaterial("alreadyClickedMaterialmat")
        alreadyClickedMaterial.diffuseColor = new Color3(0, 1, 0);

        const onPointerDown = (pickedMesh:AbstractMesh) => {
            console.log("pointerDown, " + pickedMesh.name);
            pickedMesh.material = beingClickedMaterial; 
        }

        const onPointerUp = (pickedMesh:AbstractMesh) => {
            console.log("pointerUp, " + pickedMesh.name);
            pickedMesh.material = alreadyClickedMaterial; 
        }

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        const text: GUI.TextBlock = new GUI.TextBlock("textblock", "Super Papou Stock App")
        text.color = "white";
        text.fontSize = "24";
        text.top = "50px";
        text.left = "50px";
        text.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        text.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        advancedTexture.addControl(text);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();