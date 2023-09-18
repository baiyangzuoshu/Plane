import { EventManager } from '../../../Framework/Scripts/Managers/EventManager';
import { _decorator, Component, Label, Node, v3, director, System, Canvas, view, Vec3, UITransform, tween, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { Ufo } from '../data/Ufo';
import { Collider2DTag, GameState } from '../Enum';
import { PlayerManager } from '../PlayerManager';
import { SoundManager } from '../../../Framework/Scripts/Managers/SoundManager';

@ccclass('bombUICtrl')
export class bombUICtrl extends UIComponent {
    private bombWidth:number=0;
    private bombHeight:number=0;
    private visibleHigh:number=0;
    private visibleWidth:number=0;
    private data:Ufo=new Ufo(3,3);
    
    start(): void {
        let transfrom=this.node.getComponent(UITransform);
        this.bombWidth=transfrom.width;
        this.bombHeight=transfrom.height;
        this.visibleHigh=view.getVisibleSize().height;
        this.visibleWidth=view.getVisibleSize().width;

        this.node.position=v3(this.initPosition(this.bombWidth),this.visibleHigh/2+this.bombHeight/2,0)
        // 注册单个碰撞体的回调函数
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if(otherCollider.tag==Collider2DTag.Hero ){
            let heroLife=PlayerManager.Instance.HeroLife;
            if(heroLife>0){
                heroLife++;
                SoundManager.Instance.PlaySound("get_bomb");
                PlayerManager.Instance.HeroLife=heroLife;
                EventManager.Instance.Emit("refreshTop");
            }

            this.node.destroy();
        }
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
            
            if(y<-this.visibleHigh/2-this.bombHeight/2){
                this.node.destroy();
            }
        }
    }
}
