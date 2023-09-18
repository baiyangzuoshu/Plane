import { PoolManager } from '../../../Framework/Scripts/Managers/PoolManager';
import { _decorator, Component, Label, Node, v3, director, System, Canvas, view, Vec3, UITransform, tween, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

import { UIComponent } from '../../../Framework/Scripts/UI/UIComponent';
import { Bullet } from '../data/Bullet';
import { Collider2DTag, GameState } from '../Enum';
import { PlayerManager } from '../PlayerManager';

@ccclass('bullet2UICtrl')
export class bullet2UICtrl extends UIComponent {
    private bulletWidth:number=0;
    private bulletHeight:number=0;
    private visibleHigh:number=0;
    private visibleWidth:number=0;
    private data:Bullet=new Bullet(2,2,2);
    start(): void {
        let transfrom=this.node.getComponent(UITransform);
        this.bulletWidth=transfrom.width;
        this.bulletHeight=transfrom.height;
        this.visibleHigh=view.getVisibleSize().height;
        this.visibleWidth=view.getVisibleSize().width;
        // 注册单个碰撞体的回调函数
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    public getAttack():number{
        return this.data.Atk;
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if(otherCollider.tag==Collider2DTag.Enemy){
            PoolManager.Instance.PutNodeByPath("Charactors","bullet2",this.node);
        }
        
        // 只在两个碰撞体开始接触时被调用一次
        //console.log('bullet onBeginContact',otherCollider.tag);
    }

    update(deltaTime: number): void {
        if(PlayerManager.Instance.State==GameState.Playing){
            let x=this.node.position.x;
            let y=this.node.position.y+100*deltaTime;
            this.node.position=v3(x,y,0);
            
            if(y>this.visibleHigh+this.bulletHeight/2){
                PoolManager.Instance.PutNodeByPath("Charactors","bullet2",this.node);
            }
        }
    }
}
