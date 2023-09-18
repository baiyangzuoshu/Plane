export  class   Ufo{
    private level:number=0;
    private type:number=0;

    public  get Level():number{
        return  this.level;
    }
    public  set Level(value:number){
        this.level=value;
    }
    public  get Type():number{
        return  this.type;
    }
    public  set Type(value:number){
        this.type=value;
    }

    public  constructor(level:number,type:number){
        this.level=level;
        this.type=type;
    }
}