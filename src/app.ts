import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, PointerEventTypes, StandardMaterial, Color3, TransformNode, ActionManager, AxesViewer } from "@babylonjs/core";
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

        //var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, Vector3.Zero(), scene);
        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI * 3/2, Math.PI / 2 , 10, Vector3.Zero(), scene);
        //var camera: ArcRotateCamera = new ArcRotateCamera("Camera", 0, 0, 2, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1.5 }, scene);
        const axes = new AxesViewer(scene, 4)

        this.createWarehouseMap(this.createJsonWarehouseData(), scene);
        
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        const text: GUI.TextBlock = new GUI.TextBlock("textblock", "Super Papou Stock App")
        text.color = "white";
        text.fontSize = "24";
        text.top = "50px";
        text.left = "50px";
        text.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        text.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(text);

        const advancedTextureSelectedSlot = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
        const textSelectedSlot: GUI.TextBlock = new GUI.TextBlock("textblock", "Cliquer sur un bloc")
        textSelectedSlot.color = "white";
        textSelectedSlot.fontSize = "24";
        textSelectedSlot.top = "50px";
        textSelectedSlot.left = "-50px";
        textSelectedSlot.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        textSelectedSlot.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTextureSelectedSlot.addControl(textSelectedSlot);

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
                case ActionManager.OnPointerOverTrigger:

            }
        })

        const beingClickedMaterial:StandardMaterial = new StandardMaterial("beingClickedMaterialmat")
        beingClickedMaterial.diffuseColor = new Color3(1, 0, 0);

        const alreadyClickedMaterial:StandardMaterial = new StandardMaterial("alreadyClickedMaterialmat")
        alreadyClickedMaterial.diffuseColor = new Color3(0, 1, 0);

        const onPointerDown = (pickedMesh:AbstractMesh) => {
            console.log("pointerDown, " + pickedMesh.name);
            pickedMesh.material = beingClickedMaterial;
            textSelectedSlot.text = pickedMesh.name;
        }

        const onPointerUp = (pickedMesh:AbstractMesh) => {
            console.log("pointerUp, " + pickedMesh.name);
            pickedMesh.material = alreadyClickedMaterial; 
        }

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

    createJsonWarehouseData = function() {
        const AISLES_LETTERS = "ABCDEF"
        const AISLES_COUNT = AISLES_LETTERS.length;
        const RACKS_COUNT = 16;

        const FLOOR_LETTERS = "ABCD"
        const FLOORS_COUNT = 3;
        const FLOORS_COUNT_SPECIAL = 4
        const SLOTS_COUNT = 3;

        let warehouse = {
            name: "H0",
            aisles: []
        };

        for(let aisleIndex = 0; aisleIndex < AISLES_COUNT; aisleIndex++) {
            let aisle = {
                name: AISLES_LETTERS[aisleIndex],
                racks: []
            }
            warehouse.aisles.push(aisle);

            for(let rackIndex = 1; rackIndex <= RACKS_COUNT; rackIndex++) {
                //Aisle A doesnt have odd numbers
                if(AISLES_LETTERS[aisleIndex] == "A" && rackIndex % 2 != 0) 
                    continue;
                //Aisle F doesn't have even numbers
                if(AISLES_LETTERS[aisleIndex] == "F" && rackIndex % 2 == 0)
                    continue;
                let rack = {
                    name: `${rackIndex}`,
                    floors: []
                }
                aisle.racks.push(rack);

                let floorsCount = (rackIndex >= 15) ? FLOORS_COUNT_SPECIAL : FLOORS_COUNT;                
                for(let k = 0; k < floorsCount; k++) {
                    let floor = {
                        name: `${FLOOR_LETTERS[k]}`,
                        slots: []
                    }
                    rack.floors.push(floor);

                    for(let slotIndex = 1; slotIndex <= SLOTS_COUNT; slotIndex++) {
                        let slot = {
                            name: `Allée ${aisle.name} - Travée ${rack.name} - Etage ${floor.name} - Emplacement ${slotIndex}`,
                            shortName: `${warehouse.name}${aisle.name}${rack.name}${floor.name}${slotIndex}`,
                            available: true
                        }
                        floor.slots.push(slot);
                    }
                }
            }
        }

        return warehouse;
    }

    createWarehouseMap = function(warehouseData, scene): void {
        let cubes: Mesh[] = []

        const SLOT_SIZE: number = 0.9;
        const AISLES_OFFSET: number = 2.1;
        const AISLES_DIRECTION: number = -1;
        const RACKS_OFFSET: number = 1;
        const RACKS_DIRECTION: number = 1;
        const FLOORS_DIRECTION: number = -1;
        const SLOTS_PER_FLOOR: number = 3;

        
        for(let i = 0; i < warehouseData.aisles.length; i++) {
            let aisle = warehouseData.aisles[i];
            let aisleTransform: TransformNode = new TransformNode(`Allée - ${aisle.name}`, scene);
            aisleTransform.position.x = (i * SLOT_SIZE + i * AISLES_OFFSET) * AISLES_DIRECTION;

            let plane: Mesh = MeshBuilder.CreatePlane('label', {size : 2});
            plane.parent = aisleTransform;
            plane.position.y = -2;
            plane.isPickable = false;

            let advancedTexture: GUI.AdvancedDynamicTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
            let textLabel: GUI.TextBlock = new GUI.TextBlock("textLabel", `Allée - ${aisle.name}`)
            textLabel.color = "white";
            textLabel.fontSize = 160;
            textLabel.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            textLabel.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(textLabel);

            for(let rackIndex = 0; rackIndex < aisle.racks.length; rackIndex++) {
                let rack = aisle.racks[rackIndex];
                //The index of the rack in real life
                let actualRackIndex = Number.parseInt(rack.name);
                let rackTransform: TransformNode = new TransformNode(`Travée - ${rack.name}`, scene);
                rackTransform.parent = aisleTransform;

                //The row in real life
                let actualRow = Math.floor(actualRackIndex / 2 + actualRackIndex % 2) - 1;
                rackTransform.position.y = (actualRow * SLOT_SIZE * SLOTS_PER_FLOOR + actualRow * RACKS_OFFSET) * RACKS_DIRECTION;
                //If rack is even, put in on the left, it it's odd, put in on right
                rackTransform.position.x = (actualRackIndex % 2 == 0) ? -1 : 1;
                for(let k = 0; k < rack.floors.length; k++) {
                    let floor = rack.floors[k];
                    let floorTransform: TransformNode = new TransformNode(`Etage - ${floor.name}`, scene);
                    floorTransform.parent = rackTransform;
                    floorTransform.position.z = k * 2 * SLOT_SIZE * FLOORS_DIRECTION;

                    for(let slotIndex = 0; slotIndex < 3; slotIndex++) {
                        let cube: Mesh = MeshBuilder.CreateBox(`${floor.slots[slotIndex].shortName}`, {size: SLOT_SIZE});
                        cube.parent = floorTransform;
                        cube.position.y = slotIndex;
                        cubes = [...cubes, cube]
                    }
                }
            }
        }
    }
}
new App();