import { _decorator, Component, Label, Node, v3, director, System, Canvas, view, input, Input, EventTouch, tween, Vec3, PhysicsSystem2D, EPhysics2DDrawFlags, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;
import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { EventManager } from '../../../Framework/Scripts/Managers/EventManager';
import { PlayerManager } from '../PlayerManager';
import { GameState } from '../Enum';
import { PoolManager } from '../../../Framework/Scripts/Managers/PoolManager';
import { UIManager } from '../../../Framework/Scripts/Managers/UIManager';
import { SoundManager } from '../../../Framework/Scripts/Managers/SoundManager';

@ccclass('UIGameUICtrl')
export class UIGameUICtrl extends UIComponent {
    private bg1:Node=null;
    private bg2:Node=null;
    private bg3:Node=null;
    private visibleHigh:number=0;
    private shoot_copyright:Node=null;
    private tip:Node=null;
    private startView:Node=null;
    private createEnemyTime:number=0;
    private bulletParent:Node=null;
    private heroParent:Node=null;
    private enemyParent:Node=null;
    private top:Node=null;
    private over:Node=null;
    private pause:Node=null;
    private createEnemyInterval:number=0;
    private hpProgressBar:ProgressBar=null;  

    start(): void {
        this.startView=this.ViewNode("start");
        this.bg1=this.ViewNode("bg/bg1");
        this.bg2=this.ViewNode("bg/bg2");
        this.bg3=this.ViewNode("bg/bg3");
        this.shoot_copyright=this.ViewNode("start/shoot_copyright");
        this.tip=this.ViewNode("start/tip");
        this.bulletParent=this.ViewNode("bulletParent");
        this.heroParent=this.ViewNode("heroParent");
        this.enemyParent=this.ViewNode("enemyParent");
        this.hpProgressBar=this.ViewComponent<ProgressBar>("top/hp/progressBar",ProgressBar);

        this.top=this.ViewNode("top");
        this.over=this.ViewNode("over");
        this.pause=this.ViewNode("pause");

        this.top.active=false;
        this.over.active=false;
        this.pause.active=false;
        this.startView.active=true;
        this.createEnemyInterval=3;

        this.visibleHigh=view.getVisibleSize().height;

        this.initCollision();

        this.touchEvent();

        this.initGame();

        this.initData();

        this.refreshTop();

        this.AddButtonListener("top/pauseBtn",this,this.clickPauseBtn);
        this.AddButtonListener("pause/resumeBtn",this,this.clickResumeBtn);
        this.AddButtonListener("over/startBtn",this,this.restartGame);

        EventManager.Instance.AddEventListener("createBullet",this.createBullet,this);
        EventManager.Instance.AddEventListener("showOver",this.showOver,this);
        EventManager.Instance.AddEventListener("refreshTop",this.refreshTop,this);
        EventManager.Instance.AddEventListener("restartHero",this.restartHero,this);
        EventManager.Instance.AddEventListener("updateScore",this.updateScore,this);
        EventManager.Instance.AddEventListener("updateHeroHp",this.updateHeroHp,this);
    }

    private updateHeroHp(uname:string,udata:any):void{
        let hp=udata.hp;
        let maxHp=udata.maxHp;
        this.hpProgressBar.progress=hp/maxHp;
    }

    private restartHero():void{
        this.bulletParent.removeAllChildren();
        this.createHero();
    }

    private restartGame():void{
        SoundManager.Instance.PlaySound("button");
        this.over.active=false;
        this.startView.active=true;
        this.top.active=false;
        PlayerManager.Instance.Score=0;
        PlayerManager.Instance.HeroLife=3;
        PlayerManager.Instance.State=GameState.Start;
        this.initGame();
        this.refreshTop();
    }

    private refreshTop():void{
        if(PlayerManager.Instance.Score>PlayerManager.Instance.HistoryScore){
            PlayerManager.Instance.HistoryScore=PlayerManager.Instance.Score;
        }

        let historyLabel=this.ViewComponent<Label>("top/history/num",Label);
        historyLabel.string=PlayerManager.Instance.HistoryScore.toString();
        let scoreLabel=this.ViewComponent<Label>("top/current/num",Label);
        scoreLabel.string=PlayerManager.Instance.Score.toString();
        let lifeLabel=this.ViewComponent<Label>("top/life/num",Label);
        lifeLabel.string=PlayerManager.Instance.HeroLife.toString();

        let ret=Math.ceil(PlayerManager.Instance.Score/100);
        this.createEnemyInterval=3-ret*0.1;
        if(this.createEnemyInterval<0.5){
            this.createEnemyInterval=0.5;
        }
    }

    private updateScore(name:string,data:any):void{
        let curScore=PlayerManager.Instance.Score;
        PlayerManager.Instance.Score=curScore+data.score;
        let ret1=Math.ceil(curScore/100);
        let ret2=Math.ceil(PlayerManager.Instance.Score/100);
        if(ret1!=ret2){
            this.createUfo();
        }

        this.refreshTop();
    }

    private clickResumeBtn():void{
        SoundManager.Instance.PlaySound("button");
        this.pause.active=false;
        PlayerManager.Instance.State=GameState.Playing;
    }

    private clickPauseBtn():void{
        SoundManager.Instance.PlaySound("button");
        this.pause.active=true;
        PlayerManager.Instance.State=GameState.Pause;
    }

    private showOver():void{
        this.over.active=true;
        PlayerManager.Instance.State=GameState.Over;
        SoundManager.Instance.PlaySound("game_over");
        let highLabel=this.ViewComponent<Label>("over/high/num",Label);
        highLabel.string=PlayerManager.Instance.Score.toString();
    }

    private async initData():Promise<void>{
        await PoolManager.Instance.AddNodePoolByPath("Charactors", "bullet1", 10);
        await PoolManager.Instance.AddNodePoolByPath("Charactors", "bullet2", 10);
    }

    private async createBullet(uname:string,udata:any):Promise<void>{
        let worldPos=udata.worldPos;
        let heroLevel=udata.level;

        let nodePos=new Vec3(0,0,0);
        this.bulletParent.inverseTransformPoint(nodePos,worldPos);

        if(heroLevel>2)
            heroLevel=2;
        else if(heroLevel<1)
            heroLevel=1;

        var bullet: Node =PoolManager.Instance.GetNodeInPoolByPath("Charactors", "bullet"+heroLevel);
        let ts=bullet.getComponent("bullet"+heroLevel+"UICtrl");
        if(ts){
            ts.destroy();
        }
        bullet.addComponent("bullet"+heroLevel+"UICtrl");
        bullet.setParent(this.bulletParent);
        bullet.setPosition(nodePos);

        SoundManager.Instance.PlaySound("bullet");
    }

    private initCollision():void{
        PhysicsSystem2D.instance.enable = true;
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
        EPhysics2DDrawFlags.Pair |
        EPhysics2DDrawFlags.CenterOfMass |
        EPhysics2DDrawFlags.Joint |
        EPhysics2DDrawFlags.Shape;PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
        EPhysics2DDrawFlags.Pair |
        EPhysics2DDrawFlags.CenterOfMass |
        EPhysics2DDrawFlags.Joint |
        EPhysics2DDrawFlags.Shape;
    }

    private initGame():void{
        this.enemyParent.removeAllChildren();
        this.heroParent.removeAllChildren();
        this.bulletParent.removeAllChildren();

        tween(this.shoot_copyright)
        .repeatForever(tween().to(1.0,{angle:45},{easing:"sineInOut"}).to(1.0,{angle:-45},{easing:"sineInOut"}))
        .start();

        tween(this.tip)
        .repeatForever(tween().to(1.0,{scale:new Vec3(0.5,0.5,0.5)},{easing:"sineInOut"}).to(1.0,{scale:new Vec3(1,1,1)},{easing:"sineInOut"}))
        .start();
    }

    private startGame():void{
        this.startView.active=false;
        this.top.active=true;
        PlayerManager.Instance.State=GameState.Playing;
        SoundManager.Instance.PlaySound("game_music");
        this.createHero();
    }

    private createHero():void{
        this.hpProgressBar.progress=1;
        UIManager.Instance.IE_ShowUIView("hero",this.heroParent);
    }

    private touchEvent():void{
        input.on(Input.EventType.TOUCH_START, this.touchStart,this);
        input.on(Input.EventType.TOUCH_MOVE, this.touchMove,this);
        input.on(Input.EventType.TOUCH_END, this.touchEnd,this);
        input.on(Input.EventType.TOUCH_CANCEL, this.touchEnd,this);
    }

    private touchStart(event:EventTouch):void{
        let pos=event.getUIDelta();
        if(PlayerManager.Instance.State==GameState.Start){
            this.startGame();
        }
    }
    private touchMove(event:EventTouch):void{
        let pos=event.getUIDelta();
        if(PlayerManager.Instance.State==GameState.Playing){
            EventManager.Instance.Emit("updatePosition",{x:pos.x,y:pos.y,z:0});
        }
    }
    private touchEnd(event:EventTouch):void{

    }
    private touchCancel(event:EventTouch):void{

    }

    private createEnemy():void{
        let index=Math.floor(Math.random()*100);
        if(index<50){
            UIManager.Instance.IE_ShowUIView("enemy1",this.enemyParent);
        }else if(index<80){
            UIManager.Instance.IE_ShowUIView("enemy2",this.enemyParent);
        }else if(index<100){
            UIManager.Instance.IE_ShowUIView("enemy3",this.enemyParent);
        }
    }

    private createUfo():void{
        let index=Math.floor(Math.random()*100);
        if(index<50){
            UIManager.Instance.IE_ShowUIView("ufo1",this.enemyParent);
        }else if(index<80){
            UIManager.Instance.IE_ShowUIView("ufo2",this.enemyParent);
        }else if(index<100){
            UIManager.Instance.IE_ShowUIView("bomb",this.enemyParent);
        }
    }

    private updateBg(dt:number):void{
        let y1=this.bg1.position.y-Math.ceil(100*dt);
        let y2=this.bg2.position.y-Math.ceil(100*dt);
        let y3=this.bg3.position.y-Math.ceil(100*dt);
        if(y1<-this.visibleHigh){
            y1=this.visibleHigh-Math.ceil(100*dt);
        }
        if(y2<-this.visibleHigh){
            y2=this.visibleHigh-Math.ceil(100*dt);
        }
        if(y3<-this.visibleHigh){
            y3=this.visibleHigh-Math.ceil(100*dt);
        }
        this.bg1.position=v3(this.bg1.position.x,y1,this.bg1.position.z);
        this.bg2.position=v3(this.bg2.position.x,y2,this.bg2.position.z);
        this.bg3.position=v3(this.bg3.position.x,y3,this.bg3.position.z);
    }

    update(dt:number):void{
        if(PlayerManager.Instance.State==GameState.Playing){
            this.updateBg(dt);

            this.createEnemyTime+=dt;
            if(this.createEnemyTime>=this.createEnemyInterval){
                this.createEnemyTime=0;
                this.createEnemy();
            }
        }
    }
}
