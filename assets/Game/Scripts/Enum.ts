export  class   GameState{
    public  static  readonly    Start:number=0;
    public  static  readonly    Playing:number=1;
    public  static  readonly    Pause:number=2;
    public  static  readonly    Over:number=3;
}

export  class   Collider2DTag{
    public static readonly    Hero:number=1;
    public static readonly    Enemy:number=3;
    public static readonly    Bullet:number=2;
    public static readonly    ufo:number=4;
    public static readonly    bomb:number=5;
}
