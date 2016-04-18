class Vector2 {
    x:number = 0;
    y:number = 0;

    constructor(x:number = 0, y:number = 0) {
        this.x = x;
        this.y = y;
    }

    length():number {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    normalize():Vector2 {
        var len:number = this.length();
        return new Vector2(this.x / len, this.y / len);
    }

    static distance(a:Vector2, b:Vector2):number {
        if(a !== undefined && b !== undefined) {
            var x:number = a.x - b.x;
            var y:number = a.y - b.y;

            return Math.sqrt(x * x + y * y);
        } return 0;
    }

    static direction(a:Vector2, b:Vector2):Vector2 {
        if(a !== undefined && b !== undefined) {
            var x:number = b.x - a.x;
            var y:number = b.y - a.y;

            var d:Vector2 = new Vector2(x, y);

            return d.normalize();
        }

        return new Vector2();
    }
}

var vec2 = function (x?:number, y?:number):Vector2 {
    return new Vector2(x, y);
}

class Movement {
    nameOf:string = "";
    direction:Vector2 = new Vector2();

    acceleration:number = 1;
    overTime:number = 0;
    elapsedTime:number = 0;

    constructor(nameOf:string, direction:Vector2, overTime:number = 0) {
        this.nameOf = nameOf;
        this.direction = direction;
        this.overTime = overTime;
        this.elapsedTime = overTime;
    }
}

class InputMovement extends Movement {
    key:number = -1;

    constructor(name:string, direction:Vector2 = new Vector2(), key:number = -1, overTime:number = 0) {
        super(name, direction, overTime);
        this.key = key;
    }
}

/*enum CollisionType {
    Wall,
    Floor,
    Box,
    Doorway,
    None
}

var aWall:CollisionType = CollisionType.Wall;
var aFloor:CollisionType = CollisionType.Floor;
var aBox:CollisionType = CollisionType.Box;
var aDoorWay:CollisionType = CollisionType.Doorway;*/

class Keys {
    static up:number = 38;
    static down:number = 40;
    static left:number = 37;
    static right:number = 39;
    static space:number = 32;
}

class Keyboard {
    static current:boolean[] = [];
    static previous:boolean[] = [];

    static keyDown(key:number):boolean {
        return Keyboard.current[key];
    }

    static keyPressed(key:number):boolean {
        return (!Keyboard.current[key] && Keyboard.previous[key]);
    }
}

var keyInput:boolean[] = [];

document.addEventListener("keydown", function(k) {
    keyInput[k.keyCode] = true;
});
document.addEventListener("keyup", function(k) {
    keyInput[k.keyCode] = false;
});


class Rectangle {
    x:number = 0;
    y:number = 0;
    width:number = 0;
    height:number = 0;

    constructor(x:number = 0, y:number = 0, width:number = 0, height:number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    left():Rectangle {
        return new Rectangle(this.x, this.y, 4, this.height);
    }

    right():Rectangle {
        return new Rectangle(this.x + this.width - 4, this.y, 4, this.height);
    }

    top():Rectangle {
        return new Rectangle(this.x, this.y + 4, this.width, 4);
    }

    bottom():Rectangle {
        return new Rectangle(this.x, this.y + this.height - 4, this.width, 4);
    }

    intersects(rectangle:Rectangle):boolean {
        var x:boolean = (this.x + this.width > rectangle.x && this.x < rectangle.x + rectangle.width);
        var y:boolean = (this.y + this.height > rectangle.y && this.y < rectangle.y + rectangle.height);
        return (x && y);
    }
}

interface GEvent {
    ():void;
}

class Expression {
    a:number;
    evaluate(val:number):boolean { return false; }
}

class LessThan implements Expression {
    a:number;
    constructor(a:number) {
        this.a = a;
    }

    evaluate(val:number):boolean {
        return this.a > val;
    }
}

class LessThanEqual extends LessThan {
    evaluate(val:number) {
        return this.a >= val;
    }
}

class GreaterThan implements Expression {
    a:number;
    constructor(a:number) {
        this.a = a;
    }
    evaluate(val:number):boolean {
        return this.a < val;
    }
}

class GreaterThanEqual extends GreaterThan {
    evaluate(val:number):boolean {
        return this.a <= val;
    }
}

class Pointer<T> {
    p:any; // object to reference
    key:string | number; // key of field 'pointed to'

    paramList:any[] = [];

    isFunction:boolean = false;

    public get():T {
        if(this.isFunction) {
            return this.p(this.key);
        }

        return this.p[this.key];
    }

    public set(value:T):void {
        if(!this.isFunction) {
            this.p[this.key] = value;
        }
    }

    public toString():string {
        return "" + this.get();
    }
}

var $ = function<T>(object:any, key:string | number) {
    var p:Pointer<T> = new Pointer<T>();
    p.p = object;
    p.key = key;

    if(typeof object === "function") {
        p.isFunction = true;
    }

    return p;
};

type Flag = (boolean | (number | number[]) | (Expression | Expression[]));

class Condition {
    pointer:Pointer<number | boolean>;
    flag:Flag;

    constructor(pointer:Pointer<number | boolean>, flag: Flag) {
        this.pointer = pointer;
        this.flag = flag;
    }

    evaluate():boolean {
        if(typeof this.flag === "boolean") {
            if(this.pointer.get() === <boolean>this.flag) {
                return true;
            }
        } else if(typeof this.flag === "number") {
            if(this.pointer.get() === <number>this.flag) {
                return true;
            }
        } else if(this.flag instanceof LessThan || this.flag instanceof GreaterThan ||
            this.flag instanceof LessThanEqual || this.flag instanceof GreaterThanEqual) {
            if((<Expression>this.flag).evaluate(<number>this.pointer.get())) {
                return true;
            }
        } else {
            if(this.flag instanceof Array) {
                for(var f of <number[] | Expression[]>this.flag) {
                    if(f instanceof LessThan || f instanceof GreaterThan ||
                        f instanceof LessThanEqual || f instanceof GreaterThanEqual) {
                        if(f.evaluate(<number>this.pointer.get())) {
                            return true;
                        }
                    } else if(typeof f === "number") {
                        if(this.pointer.get() === f) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}

/*var condition = function(p:Pointer<number | boolean>, flag:Flag[], effect:() => {}) {
    return new Condition(p, flag, effect);
};*/

var lessThan = function(a:number):LessThan {
    return new LessThan(a);
}

var lessThanEqual = function(a:number):LessThanEqual {
    return new LessThanEqual(a);
}

var greaterThan = function(a:number):GreaterThan {
    return new GreaterThan(a);
}

var greaterThanEqual = function(a:number):GreaterThanEqual {
    return new GreaterThanEqual(a);
}

class Attribute {
    value:(number | boolean);

    sub(val:number) {
        if(typeof this.value === "number") {
            var v:number = <number>this.value;
        }
    }

    add(val:number) {

    }

    mul(val:number) {

    }

    div(val:number) {

    }
}

class GameEvent {
    conditions:Condition[] = [];
    event:GEvent;
    invokeFlag:boolean = true;
    once:boolean = false;
    invoked:boolean = false;

    constructor(conditions:Condition[], event:GEvent, once:boolean = false) {
        for(var i:number = 0; i < conditions.length; i++) {
            this.conditions.push(conditions[i]);
        }
        this.event = event;
        this.once = once;


        //console.log("size: " + this.conditions.length + "; " + conditions.length);
    }

    invoke():boolean {
        if(this.once && this.invoked || this.conditions.length === 0) {
            return false;
        }

        var e:boolean = true;

        for(var i:number = 0; i < this.conditions.length; i++) {
            if(!this.conditions[i].evaluate()) {
                e = false;
            }
        }

        if(e) {
            this.event();
            this.invoked = true;
            return true;
        }

        return false;
    }
}
