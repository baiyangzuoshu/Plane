export  class   Bullet{
    private atk:number=0;
    private speed:number=0;
    private level:number=0;

    public  get Atk():number{
        return  this.atk;
    }
    public  set Atk(value:number){
        this.atk=value;
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

    public  constructor(atk:number,speed:number,level:number){
        this.atk=atk;
        this.speed=speed;
        this.level=level;
    }
}