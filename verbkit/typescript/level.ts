/// <reference path="PixiTS/pixi.d.ts" />
/// <reference path="gameobject.ts" />
/// <reference path="boundary.ts" />
/// <reference path="collectable.ts" />
/// <reference path="interactable.ts" />
/// <reference path="collidable.ts" />
/// <reference path="camera.ts" />

/// <reference path="overlay.ts" />

/// <reference path="game.ts" />
/// <reference path="utils.ts" />

class Level {
    levelName:string = "";
    width:number = 0;
    height:number = 0;

    gameObjects:GameObject[] = [];
    gameObjectType:{[key:string]: GameObject[];} = {};


    boundaries:Boundary[] = [];
    collectables:Collectable[] = [];
    interactables:Interactable[] = [];
    collidables:Collidable[] = [];
    conditions:Condition[] = [];

    stage:PIXI.Container = new PIXI.Container();

    camera:Camera = new Camera();
    userInterfaces:UI[] = [];

    private winEvents:GameEvent[] = [];
    private loseEvents:GameEvent[] = [];

    private gameEvents:GameEvent[] = [];

    won:boolean = false;
    lost:boolean = false;

    constructor(levelName:string, width:number, height:number) {
        this.levelName = levelName;
        this.width = width;
        this.height = height;

        this.camera.viewPort = this.stage;

        return this;
    }

    levelWidth():number { return this.width; }
    levelHeight():number { return this.height; }


    winEvent(condition:(Condition | Condition[]), action) {
        if(condition instanceof Condition) {
            this.winEvents.push(new GameEvent([<Condition>condition], action));
        } else {
            this.winEvents.push(new GameEvent(<Condition[]>condition, action));
        }
        return this;
    }

    loseEvent(condition:(Condition | Condition[]), action) {
        if(condition instanceof Condition) {
            this.loseEvents.push(new GameEvent([<Condition>condition], action));
        } else {
            this.loseEvents.push(new GameEvent(<Condition[]>condition, action));
        }
        return this;
    }

    when(conditions:Condition | Condition[], effect:GEvent, once:boolean = false) {
        if(conditions instanceof Array) {
            this.gameEvents.push(new GameEvent(<Condition[]>conditions, effect, once));
        } else {
            this.gameEvents.push(new GameEvent([<Condition>conditions], effect, once));
        }
    };


    changeLevel(level:Level = undefined) {
        if(level === undefined) {
            game.currentLevel++;
        } else {
            for(var i:number = 0; i < game.levels.length; i++) {
                if(game.levels[i].levelName === level.levelName) {
                    game.currentLevel = i;
                    break;
                }
            }
        }
    }

    has(gameObject:GameObject) {
        this.gameObjects.push(gameObject);
        this.stage.addChild(gameObject.graphic);

        for(var w of gameObject.weapons) {
            if(w instanceof Gun) {
                for(var p of (<Gun>w).projectiles) {
                    if(p.graphic !== undefined) {
                        this.stage.addChild(p.graphic);
                    }
                }
            }
        }

        return this;
    }

    hasTextDisplay(display:(string | Pointer<number | boolean | string>), x:number, y:number, style:PIXI.TextStyle = undefined, background:string = undefined) {
        var textInterface:TextUI = new TextUI(display, style, new Vector2(x, y), background);

        this.userInterfaces.push(textInterface);

        this.stage.addChild(textInterface.background);
        this.stage.addChild(textInterface.text);

        return this;
    }

    hasWall(x:number, y:number, width:number, height:number) {
        var wall:Wall = new Wall(x, y, width, height);

        this.boundaries.push(wall);
        this.stage.addChild(wall.debugGraphic);

        return this;
    }

    hasCeiling(x:number, y:number, width:number, height:number) {
        var ceiling:Ceiling = new Ceiling(x, y, width, height);

        this.boundaries.push(ceiling);
        this.stage.addChild(ceiling.debugGraphic);

        return this;
    }

    hasFloor(x:number, y:number, width:number, height:number){
        var floor:Floor = new Floor(x, y, width, height);

        this.boundaries.push(floor);
        this.stage.addChild(floor.debugGraphic);

        return this;
    }

    hasPlatform(x:number, y:number, width:number, height:number){
        var platform:Platform = new Platform(x, y, width);

        this.boundaries.push(platform);
        this.stage.addChild(platform.debugGraphic);

        return this;
    }

    hasElevator(x:number, y:number, width:number, height:number){
        var elevator:Elevator = new Elevator(x, y, width, 8);

        this.boundaries.push(elevator);
        this.stage.addChild(elevator.debugGraphic);

        return this;
    }

    hasTheElevator(elevator:Elevator) {
        this.boundaries.push(elevator);
        this.stage.addChild(elevator.debugGraphic);
        return this;
    }

    hasSpringBoard(x:number, y:number, width:number, height:number, power:number) {
        var springBoard:SpringBoard = new SpringBoard(x, y, width, height, power);

        this.collidables.push(springBoard);
        this.stage.addChild(springBoard.debugGraphic);

        return this;
    }

    hasConveyorBelt(x:number, y:number, width:number, height:number, speed:number) {
        var conveyorBelt:ConveyorBelt = new ConveyorBelt(x, y, width, height, speed);

        this.collidables.push(conveyorBelt);
        this.stage.addChild(conveyorBelt.debugGraphic);

        return this;
    }

    hasCollectables(collectables:Collectable[]) {
        for(var i:number = 0; i < collectables.length; i++) {
            this.collectables.push(collectables[i]);
            this.stage.addChild(collectables[i].graphic);
        }

        return this;
    }

    hasDoor(door:Door) {
        this.boundaries.push(door);
        this.stage.addChild(door.debugGraphic);

        return this;
    }

    hasButton(x:number, y:number, width:number, height:number) {
        var button:Button = new Button(x, y, width, height);

        this.interactables.push(button);
        this.stage.addChild(button.debugGraphic);

        return this;
    }

    hasTheButton(button:Button) {
        this.interactables.push(button);
        this.stage.addChild(button.debugGraphic);
        return this;
    }

    hasLever(x:number, y:number, width:number, height:number) {
        var sw:Lever = new Lever(x, y, width, height);

        this.interactables.push(sw);
        this.stage.addChild(sw.debugGraphic);

        return this;
    }

    update() {
        for(var g of this.gameObjects) {
            g.update();

            for(var b of this.boundaries) {
                b.interacts(g);
            }

            for(var w of g.weapons) {
                if(w instanceof Gun) {
                    w.update();
                }
            }

            for(var c of this.collectables) {
                if(!c.collected) {
                    if(g.bounds.intersects(c.bounds)) {
                        c.collect();
                        this.stage.removeChild(c.graphic);
                    }
                } else {
                    c.update();
                    if(!c.destroyable || c.destroyed) {
                        this.collectables.splice(this.collectables.indexOf(c), 1);
                    }
                }
            }
            for(var collidable of this.collidables) {
                if(g.bounds.intersects(collidable.bounds)) {
                    collidable.contact(g);
                }
            }
        }

        for(var i of this.interactables) {
            i.update();
        }

        for(var ui of this.userInterfaces) {
            ui.update();
        }

        for(var gameEvent of this.gameEvents) {
            gameEvent.invoke();
        }

        if(!this.won && !this.lost) {
            for(var winEvent of this.winEvents) {
                if(winEvent.invoke()) {
                    this.won = true;
                }
            }
        }

        if(!this.lost) {
            for(var loseEvent of this.loseEvents) {
                if(loseEvent.invoke()) {
                    this.lost = true;
                }
            }
        }


        this.camera.update();
    }
}
