import { EventManager } from '../../../Framework/Scripts/Managers/EventManager';
import { _decorator, Animation, AnimationState, Node, v3, director, System, Canvas, view, Vec3, UITransform, tween, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { Enemy } from '../data/Enemy';
import { Collider2DTag, GameState } from '../Enum';
import { PlayerManager } from '../PlayerManager';
import { bullet1UICtrl } from './bullet1UICtrl';
import { bullet2UICtrl } from './bullet2UICtrl';
import { SoundManager } from '../../../Framework/Scripts/Managers/SoundManager';

@ccclass('enemy1UICtrl')
export class enemy1UICtrl extends UIComponent {
    private enemyWidth:number=0;
    private enemyHeight:number=0;
    private visibleHigh:number=0;
    private visibleWidth:number=0;
    private data:Enemy=new Enemy(1,1,1,1,1);

    start(): void {
        let transfrom=this.node.getComponent(UITransform);
        this.enemyWidth=transfrom.width;
        this.enemyHeight=transfrom.height;
        this.visibleHigh=view.getVisibleSize().height;
        this.visibleWidth=view.getVisibleSize().width;

        this.node.position=v3(this.initPosition(this.enemyWidth),this.visibleHigh/2+this.enemyHeight/2,0);
       // 注册单个碰撞体的回调函数
       let collider = this.getComponent(Collider2D);
       if (collider) {
           collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
       }

       let animation=this.node.getComponent(Animation);
       animation.on(Animation.EventType.FINISHED,this.onAnimationFinished,this);
   }

   onAnimationFinished(event:Animation.EventType,state:AnimationState){
       if(event==Animation.EventType.FINISHED){
           if(state.name=="enemy1Die"){
                SoundManager.Instance.PlaySound("enemy1_down");
                EventManager.Instance.Emit("updateScore",{score:this.data.Score});
                this.node.destroy();
           }
           else if(state.name=="enemy1Hit"){
                this.node.getComponent(Animation).play("enemy1Normal");
           }
       }
   }

   onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
       if(otherCollider.tag==Collider2DTag.Bullet){
            let ts1=otherCollider.node.getComponent("bullet1UICtrl") as bullet1UICtrl;
            let ts2=otherCollider.node.getComponent("bullet2UICtrl") as bullet2UICtrl;
            if(ts1!=null){
                this.data.Hp-=ts1.getAttack();
            }
            else if(ts2!=null){
                this.data.Hp-=ts2.getAttack();
            }
            
            let animation=this.node.getComponent(Animation);
            if(this.data.Hp<=0){
                animation.play("enemy1Die");
            }
            else{
                animation.play("enemy1Hit");
            }
       }
       
       // 只在两个碰撞体开始接触时被调用一次
      // console.log('enemy onBeginContact',otherCollider.tag);
   }

    initPosition(selfWidth):number{
        let x= Math.random()*this.visibleWidth-this.visibleWidth/2;
        if(x<-selfWidth/2){
            x=-selfWidth/2;
        }else if(x>this.visibleWidth/2-selfWidth/2){
            x=this.visibleWidth/2-selfWidth/2;
        }

        return x;
    }

    update(deltaTime: number): void {
        if(PlayerManager.Instance.State==GameState.Playing){
            let x=this.node.position.x;
            let y=this.node.position.y-100*deltaTime;
            this.node.position=v3(x,y,0);
    
            if(y<-this.visibleHigh/2-this.enemyHeight/2){
                this.node.destroy();
            }
        }
    }
}
