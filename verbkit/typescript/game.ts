/// <reference path="PixiTS/pixi.d.ts" />
/// <reference path="level.ts" />
/// <reference path="utils.ts" />
/// <reference path="collectable.ts" />
/// <reference path="interactable.ts" />
/// <reference path="collidable.ts" />
/// <reference path="boundary.ts" />

class Game {
    renderer:(PIXI.WebGLRenderer | PIXI.CanvasRenderer);

    levels:Level[] = [];
    currentLevel:number = 0;

    globalGameObjects:GameObject[] = [];

    globalCollectables:Collectable[] = [];

    conditions:Condition[] = [];
    gameEvents:GameEvent[] = [];

    routines:GEvent[] = [];

    defaultStage:PIXI.Container = new PIXI.Container();

    ticker:PIXI.ticker.Ticker = new PIXI.ticker.Ticker();

    constructor() {
        this.initialize();
    }

    has(gameObject:GameObject | GameObject[]) {
        if(gameObject instanceof Array) {
            for(var g of gameObject) {
                this.globalGameObjects.push(g);
                this.defaultStage.addChild(g.graphic);
            }
        } else {
            this.globalGameObjects.push(<GameObject>gameObject);
            this.defaultStage.addChild((<GameObject>gameObject).graphic);
        }
        return this;
    }

    initialize():void {
        this.renderer = PIXI.autoDetectRenderer(840, 480, { backgroundColor: 0x6495ed });
        document.body.appendChild(this.renderer.view);
    }

    getCurrentLevel():Level {
        return this.levels[this.currentLevel];
    }

    update():void {
        if(this.getCurrentLevel() !== undefined) {
            this.getCurrentLevel().update();
        }

        for(var g of this.gameEvents) {
            g.invoke();
        }

        for(var r of this.routines) {
            r();
        }
    }

    draw():void {
        if(this.getCurrentLevel() !== undefined) {
            this.renderer.render(this.getCurrentLevel().stage);
        } else { this.renderer.render(this.defaultStage); }
    }
}

var game:Game = new Game();

/*class GameEvent {
    event:{[key:string]: ({});} = ({});
}

var gameEvent:GameEvent = new GameEvent();
gameEvent.event["hello"] = (function() { console.log("Hello"); });
gameEvent.event[0]();*/

function run() {
    requestAnimationFrame(run);

    for(var i:number = 0; i < keyInput.length; i++) {
        Keyboard.previous[i] = Keyboard.current[i];
        Keyboard.current[i] = keyInput[i];
    }

    game.update();
    game.draw();
}

var level = function(levelName:string):Level {
    for(var i:number = 0; i < game.levels.length; i++) {
        if(game.levels[i].levelName === levelName) {
            return game.levels[i];
        }
    }

    return null;
}

var hasLevel = function(levelName:string, width:number, height:number):Level {
    game.levels.push(new Level(levelName, width, height));
    return game.levels[game.levels.length - 1];
};


var when = function(conditions:Condition | Condition[], effect:GEvent, once:boolean = false) {
    if(conditions instanceof Array) {
        game.gameEvents.push(new GameEvent(<Condition[]>conditions, effect, once));
    } else {
        game.gameEvents.push(new GameEvent([<Condition>conditions], effect, once));
    }
};


var onlyOnce = function(conditions:Condition | Condition[], effect:GEvent) {
    when(conditions, effect, true);
};
