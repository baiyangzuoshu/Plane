export  class   Enemy{
    private hp:number=0;
    private atk:number=0;
    private def:number=0;
    private speed:number=0;
    private level:number=0;
    private score:number=0;

    public  get Score():number{
        return  this.score;
    }
    public  set Score(value:number){
        this.score=value;
    }

    public  get Hp():number{
        return  this.hp;
    }
    public  set Hp(value:number){
        this.hp=value;
    }
    public  get Atk():number{
        return  this.atk;
    }
    public  set Atk(value:number){
        this.atk=value;
    }
    public  get Def():number{
        return  this.def;
    }
    public  set Def(value:number){
        this.def=value;
    }
    public  get Speed():number{
        return  this.speed;
    }
    public  set Speed(value:number){
        this.speed=value;
    }
    public  get Level():number{
        return  this.level;
    }
    public  set Level(value:number){
        this.level=value;
    }

    constructor(hp:number,atk:number,def:number,speed:number,level:number){
        this.hp=hp;
        this.atk=atk;
        this.def=def;
        this.speed=speed;
        this.level=level;
        this.score=level*10;
    }
}