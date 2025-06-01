import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, PointerEventTypes, StandardMaterial, Color3, TransformNode } from "@babylonjs/core";
import { AbstractMesh } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import warehouses from "./resources/warehouse-map.json"

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
        const aislesCount: number = 7
        const racksCount: number = 16
        const floorsCount: number = 4

        
        const cubeSize = 1;
        const offset = 2;
        
        for(let i = 0; i < aislesCount; i++) {
            let aisleTransform: TransformNode = new TransformNode(`Allée - ${i}`, scene);
            aisleTransform.position.x = i * cubeSize + i * offset;
            for(let j = 0; j < racksCount; j++) {
                let rackTransform: TransformNode = new TransformNode(`Travée - ${j}`, scene);
                rackTransform.parent = aisleTransform;
                rackTransform.position.y = j * (4 * cubeSize);
                for(let k = 0; k < floorsCount; k++) {
                    let floorTransform: TransformNode = new TransformNode(`Etage - ${k}`, scene);
                    floorTransform.parent = rackTransform;
                    floorTransform.position.z = k * (2 * cubeSize);
                    for(let slotIndex = 0; slotIndex < 3; slotIndex++) {

                        let cube: Mesh = MeshBuilder.CreateBox(`Aisle${i}-Rack${j}-Floor${k}-Slot${slotIndex}`, {size: cubeSize});
                        cube.parent = floorTransform;
                        cube.position.y = slotIndex;
                        cubes = [...cubes, cube]
                    }
                }
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

        console.log(warehouses, "ok")

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