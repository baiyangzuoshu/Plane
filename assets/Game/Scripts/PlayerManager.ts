import { GameState } from "./Enum";

export class    PlayerManager{
    private static  _instance:PlayerManager=null;
    private state:GameState=GameState.Start;
    private score:number=0;
    private historyScore:number=0;
    private heroLife:number=3;

    public loadLocalData(){
        let historyScore=localStorage.getItem("historyScore");
        if(historyScore!=null){
            this.HistoryScore=parseInt(historyScore);
        }
    }

    public get HeroLife():number{
        return this.heroLife;
    }
    public set HeroLife(value:number){
        this.heroLife=value;
    }

    public get HistoryScore():number{
        return this.historyScore;
    }
    public set HistoryScore(value:number){
        this.historyScore=value;
        localStorage.setItem("historyScore",value.toString());
    }

    public  get Score():number{
        return  this.score;
    }
    public  set Score(value:number){
        this.score=value;
    }

    public  get State():GameState{
        return  this.state;
    }
    public set State(value:GameState){
        this.state=value;
    }

    public  static  get Instance():PlayerManager{
        if(this._instance==null){
            this._instance=new PlayerManager();
            this._instance.loadLocalData();
        }
        return  this._instance;
    }
}