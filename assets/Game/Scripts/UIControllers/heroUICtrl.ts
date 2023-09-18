import { _decorator, Animation, AnimationState, Node, v3, director, System, Canvas, view, Vec3, UITransform, tween, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { EventManager } from '../../../Framework/Scripts/Managers/EventManager';
import { Collider2DTag, GameState } from '../Enum';
import { Hero } from '../data/Hero';
import { PlayerManager } from '../PlayerManager';

@ccclass('heroUICtrl')
export class heroUICtrl extends UIComponent {
    private heroWidth:number=0;
    private heroHeight:number=0;
    private visibleHigh:number=0;
    private visibleWidth:number=0;
    private bulletTime:number=0;
    private data:Hero=Hero.CreateHero();
    private mask:Node=null;
    private isActive=false;
    private createBulletTime=3;

    start(): void {
        this.AddEventListener("updatePosition",this.updatePosition,this);
        this.AddEventListener("upgradeHeroSpeed",this.upgradeHeroSpeed,this);
        this.AddEventListener("upgradeHeroLevel",this.upgradeHeroLevel,this);

        this.mask=this.ViewNode("mask");

        let transfrom=this.node.getComponent(UITransform);
        this.heroWidth=transfrom.width;
        this.heroHeight=transfrom.height;
        this.visibleHigh=view.getVisibleSize().height;
        this.visibleWidth=view.getVisibleSize().width;

        this.updatePosition("updatePosition",v3(0,-this.visibleHigh/2,0));

        tween(this.node).to(1.5,{position:v3(0,-200,0)}).start();
        let action=tween(this.mask).show().delay(0.5).hide().delay(0.5);
        tween(this.mask).repeat(5,action).call(()=>{
            this.isActive=true;
        }).start();
        // 注册单个碰撞体的回调函数
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            collider.on(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
            collider.on(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        }
        let animation=this.node.getComponent(Animation);
        animation.on(Animation.EventType.FINISHED,this.onAnimationFinished,this);
    }

    onAnimationFinished(event:Animation.EventType,state:AnimationState){
        if(event==Animation.EventType.FINISHED){
            if(state.name=="heroDie"){
                let heroLife=PlayerManager.Instance.HeroLife;
                heroLife-=1;
                PlayerManager.Instance.HeroLife=heroLife;
                EventManager.Instance.Emit("refreshTop");
                this.node.destroy();

                if(heroLife<=0){
                    EventManager.Instance.Emit("showOver");
                }
                else{
                    EventManager.Instance.Emit("restartHero");
                }
            }
            else if(state.name=="heroHit"){
                EventManager.Instance.Emit("updateHeroHp",{hp:this.data.Hp,maxHp:this.data.MaxHp});
                this.node.getComponent(Animation).play("heroNormal");
            }
        }

    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if(otherCollider.tag==Collider2DTag.Enemy && this.isActive){
            let curHp=this.data.Hp;
            curHp-=1;
            this.data.Hp=curHp;
            if(curHp<=0){
                let animation=this.node.getComponent(Animation);
                animation.play("heroDie");
            }
            else{
                let animation=this.node.getComponent(Animation);
                animation.play("heroHit");
            }
        }
        else if(otherCollider.tag==Collider2DTag.ufo){

        }
        else if(otherCollider.tag==Collider2DTag.bomb){
            
        }

        // 只在两个碰撞体开始接触时被调用一次
        console.log('onBeginContact',otherCollider.tag);
    }
    onEndContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
        //console.log('onEndContact');
    }
    onPreSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 每次将要处理碰撞体接触逻辑时被调用
       // console.log('onPreSolve');
    }
    onPostSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 每次处理完碰撞体接触逻辑时被调用
        //console.log('onPostSolve');
    }
    
    private upgradeHeroSpeed():void{
        let speed=this.data.Speed;
        speed+=1;
        if(speed>5){
            speed=5;
        }
        this.data.Speed=speed;
    }

    private upgradeHeroLevel():void{
        let level=this.data.Level;
        level+=1;
        if(level>2){
            level=2;
        }
        this.data.Level=level;
    }

    private updatePosition(uname:string,p:Vec3):void{
        let x=this.node.position.x+p.x;
        let y=this.node.position.y+p.y;
        if(x<-this.visibleWidth/2+this.heroWidth/2){
            x=-this.visibleWidth/2+this.heroWidth/2;
        }
        if(x>this.visibleWidth/2-this.heroWidth/2){
            x=this.visibleWidth/2-this.heroWidth/2;
        }
        if(y<-this.visibleHigh/2+this.heroHeight/2){
            y=-this.visibleHigh/2+this.heroHeight/2;
        }
        if(y>this.visibleHigh/2-this.heroHeight/2){
            y=this.visibleHigh/2-this.heroHeight/2;
        }
        this.node.position=v3(x,y,this.node.position.z);
    }

    private createBullet():void{
        let worldPos=new Vec3(0,0,0);
        this.node.getWorldPosition(worldPos);
        let level=this.data.Level;

        EventManager.Instance.Emit("createBullet",{worldPos:worldPos,level:level});
    }

    update(deltaTime: number): void {
        //创建子弹，每隔1.0秒创建一个子弹
        if(PlayerManager.Instance.State==GameState.Playing){
            this.bulletTime+=deltaTime;
            if(this.bulletTime>(this.createBulletTime-0.4*this.data.Speed)){
                this.bulletTime=0;
    
                this.createBullet();
            }
        }
    }
}
