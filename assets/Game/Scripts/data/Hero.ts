export  class   Hero{
    private hp:number=0;
    private mp:number=0;
    private atk:number=0;
    private def:number=0;
    private speed:number=0;
    private level:number=0;
    private maxHp:number=0;

    public  get MaxHp():number{
        return  this.maxHp;
    }

    public  get Hp():number{
        return  this.hp;
    }
    public  set Hp(value:number){
        this.hp=value;
    }
    public  get Mp():number{
        return  this.mp;
    }
    public  set Mp(value:number){
        this.mp=value;
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
    public upgradeLevel():void{
        this.level++;
    }

    public  constructor(hp:number,mp:number,atk:number,def:number,speed:number,level:number){
        this.hp=hp;
        this.mp=mp;
        this.atk=atk;
        this.def=def;
        this.speed=speed;
        this.level=level;
        this.maxHp=hp;
    }

    public  static  CreateHero():Hero{
        return  new Hero(3,0,0,0,1,1);
    }
    
}