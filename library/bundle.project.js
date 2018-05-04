require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Game":[function(require,module,exports){
"use strict";
cc._RFpush(module, '4e12fLSQu1L+KV6QmxDiavU', 'Game');
// scripts\Game.js

cc.Class({
    'extends': cc.Component,

    properties: {
        // 这个属性引用了星星预制资源
        starPrefab: {
            'default': null,
            type: cc.Prefab
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        // 地面节点，用于确定星星生成的高度
        ground: {
            'default': null,
            type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            'default': null,
            type: cc.Node
        },
        // score label 的引用
        scoreDisplay: {
            'default': null,
            type: cc.Label
        },
        // 得分音效资源
        scoreAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height / 2;
        // 初始化计时器
        this.timer = 0;
        this.starDuration = 0;
        // 生成一个新的星星
        this.spawnNewStar();
        // 初始化计分
        this.score = 0;
    },

    spawnNewStar: function spawnNewStar() {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());
        // 将 Game 组件的实例传入星星组件
        newStar.getComponent('Star').game = this;
        // 重置计时器
        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function getNewStarPosition() {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + cc.random0To1() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        randX = cc.randomMinus1To1() * maxX;
        // 返回星星坐标
        return cc.p(randX, randY);
    },

    // called every frame
    update: function update(dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;
    },

    gainScore: function gainScore() {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    gameOver: function gameOver() {
        this.player.stopAllActions(); //停止 player 节点的跳跃动作
        cc.director.loadScene('game');
    }
});

cc._RFpop();
},{}],"Player":[function(require,module,exports){
"use strict";
cc._RFpush(module, '6c688v72QdOKamCGCT+xaAd', 'Player');
// scripts\Player.js

cc.Class({
    "extends": cc.Component,

    properties: {
        // 主角跳跃高度
        jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,
        // 加速度
        accel: 0,
        // 跳跃音效资源
        jumpAudio: {
            "default": null,
            url: cc.AudioClip
        }
    },

    setJumpAction: function setJumpAction() {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.playJumpSound, this);
        // 不断重复，而且每次完成落地动作后调用回调来播放声音
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
    },

    playJumpSound: function playJumpSound() {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    setInputControl: function setInputControl() {
        var self = this;
        //add keyboard input listener to jump, turnLeft and turnRight
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // set a flag when key pressed
            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            // unset a flag when key released
            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                        self.accRight = false;
                        break;
                }
            }
        }, self.node);
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 初始化跳跃动作
        this.jumpAction = this.setJumpAction();
        this.node.runAction(this.jumpAction);

        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        // 主角当前水平方向速度
        this.xSpeed = 0;

        // 初始化键盘输入监听
        this.setInputControl();
    },

    // called every frame
    update: function update(dt) {
        // 根据当前加速度方向每帧更新速度
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        // 限制主角的速度不能超过最大值
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            // if speed reach limit, use max speed with current direction
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        // 根据当前速度更新主角的位置
        this.node.x += this.xSpeed * dt;
    }
});

cc._RFpop();
},{}],"Star":[function(require,module,exports){
"use strict";
cc._RFpush(module, '4644f0m2WtABYRy+pn6dOaG', 'Star');
// scripts\Star.js

cc.Class({
    "extends": cc.Component,

    properties: {
        // 星星和主角之间的距离小于这个数值时，就会完成收集
        pickRadius: 0,
        // 暂存 Game 对象的引用
        game: {
            "default": null,
            serializable: false
        }
    },

    // use this for initialization
    onLoad: function onLoad() {},

    getPlayerDistance: function getPlayerDistance() {
        // 根据 player 节点位置判断距离
        var playerPos = this.game.player.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function onPicked() {
        // 当星星被收集时，调用 Game 脚本中的接口，生成一个新的星星
        this.game.spawnNewStar();
        // 调用 Game 脚本的得分方法
        this.game.gainScore();
        // 然后销毁当前星星节点
        this.node.destroy();
    },

    // called every frame
    update: function update(dt) {
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius) {
            // 调用收集行为
            this.onPicked();
            return;
        }
        // 根据 Game 脚本中的计时器更新星星的透明度
        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    }
});

cc._RFpop();
},{}]},{},["Game","Player","Star"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6L0NvY29zQ3JlYXRvci9yZXNvdXJjZXMvYXBwLmFzYXIvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImFzc2V0cy9zY3JpcHRzL0dhbWUuanMiLCJhc3NldHMvc2NyaXB0cy9QbGF5ZXIuanMiLCJhc3NldHMvc2NyaXB0cy9TdGFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBO0FBQ0k7QUFDSjtBQUNJO0FBQ0o7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ1E7QUFDQTtBQUNSO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDQTtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNRO0FBQ0E7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ0E7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ0E7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ0E7QUFDUjtBQUNRO0FBQ1I7QUFDQTtBQUNBO0FBQ0k7QUFDSjtBQUNBO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDUTtBQUNSO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNBO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNBO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNRO0FBQ0k7QUFDWjtBQUNZO0FBQ0k7QUFDSTtBQUNJO0FBQ0E7QUFDQTtBQUFNO0FBRU47QUFDQTtBQUNBO0FBQU07QUFFOUI7QUFDQTtBQUNZO0FBQ0k7QUFDSTtBQUNJO0FBQ0E7QUFBTTtBQUVOO0FBQ0E7QUFBTTtBQUU5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDSjtBQUNRO0FBQ0E7QUFDUjtBQUNBO0FBQ1E7QUFDQTtBQUNSO0FBQ1E7QUFDUjtBQUNBO0FBQ1E7QUFDUjtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBQ1E7QUFDSTtBQUNaO0FBQ1k7QUFDWjtBQUNBO0FBQ1E7QUFDUjtBQUNZO0FBQ1o7QUFDQTtBQUNBO0FBQ1E7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNJO0FBQ0o7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDSjtBQUlJO0FBRko7QUFJUTtBQUZSO0FBSVE7QUFDQTtBQUZSO0FBQ0E7QUFJSTtBQUZKO0FBSVE7QUFGUjtBQUlRO0FBRlI7QUFJUTtBQUZSO0FBQ0E7QUFDQTtBQUlJO0FBRko7QUFJUTtBQUZSO0FBSVk7QUFDQTtBQUZaO0FBQ0E7QUFJUTtBQUNBO0FBQ0E7QUFGUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g6L+Z5Liq5bGe5oCn5byV55So5LqG5pif5pif6aKE5Yi26LWE5rqQXG4gICAgICAgIHN0YXJQcmVmYWI6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5pif5pif5Lqn55Sf5ZCO5raI5aSx5pe26Ze055qE6ZqP5py66IyD5Zu0XG4gICAgICAgIG1heFN0YXJEdXJhdGlvbjogMCxcbiAgICAgICAgbWluU3RhckR1cmF0aW9uOiAwLFxuICAgICAgICAvLyDlnLDpnaLoioLngrnvvIznlKjkuo7noa7lrprmmJ/mmJ/nlJ/miJDnmoTpq5jluqZcbiAgICAgICAgZ3JvdW5kOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICAvLyBwbGF5ZXIg6IqC54K577yM55So5LqO6I635Y+W5Li76KeS5by56Lez55qE6auY5bqm77yM5ZKM5o6n5Yi25Li76KeS6KGM5Yqo5byA5YWzXG4gICAgICAgIHBsYXllcjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgICAgLy8gc2NvcmUgbGFiZWwg55qE5byV55SoXG4gICAgICAgIHNjb3JlRGlzcGxheToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOW+l+WIhumfs+aViOi1hOa6kFxuICAgICAgICBzY29yZUF1ZGlvOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6I635Y+W5Zyw5bmz6Z2i55qEIHkg6L205Z2Q5qCHXG4gICAgICAgIHRoaXMuZ3JvdW5kWSA9IHRoaXMuZ3JvdW5kLnkgKyB0aGlzLmdyb3VuZC5oZWlnaHQvMjtcbiAgICAgICAgLy8g5Yid5aeL5YyW6K6h5pe25ZmoXG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IDA7XG4gICAgICAgIC8vIOeUn+aIkOS4gOS4quaWsOeahOaYn+aYn1xuICAgICAgICB0aGlzLnNwYXduTmV3U3RhcigpO1xuICAgICAgICAvLyDliJ3lp4vljJborqHliIZcbiAgICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgfSxcblxuICAgIHNwYXduTmV3U3RhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOS9v+eUqOe7meWumueahOaooeadv+WcqOWcuuaZr+S4reeUn+aIkOS4gOS4quaWsOiKgueCuVxuICAgICAgICB2YXIgbmV3U3RhciA9IGNjLmluc3RhbnRpYXRlKHRoaXMuc3RhclByZWZhYik7XG4gICAgICAgIC8vIOWwhuaWsOWinueahOiKgueCuea3u+WKoOWIsCBDYW52YXMg6IqC54K55LiL6Z2iXG4gICAgICAgIHRoaXMubm9kZS5hZGRDaGlsZChuZXdTdGFyKTtcbiAgICAgICAgLy8g5Li65pif5pif6K6+572u5LiA5Liq6ZqP5py65L2N572uXG4gICAgICAgIG5ld1N0YXIuc2V0UG9zaXRpb24odGhpcy5nZXROZXdTdGFyUG9zaXRpb24oKSk7XG4gICAgICAgIC8vIOWwhiBHYW1lIOe7hOS7tueahOWunuS+i+S8oOWFpeaYn+aYn+e7hOS7tlxuICAgICAgICBuZXdTdGFyLmdldENvbXBvbmVudCgnU3RhcicpLmdhbWUgPSB0aGlzO1xuICAgICAgICAvLyDph43nva7orqHml7blmahcbiAgICAgICAgdGhpcy5zdGFyRHVyYXRpb24gPSB0aGlzLm1pblN0YXJEdXJhdGlvbiArIGNjLnJhbmRvbTBUbzEoKSAqICh0aGlzLm1heFN0YXJEdXJhdGlvbiAtIHRoaXMubWluU3RhckR1cmF0aW9uKTtcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgfSxcblxuICAgIGdldE5ld1N0YXJQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmFuZFggPSAwO1xuICAgICAgICAvLyDmoLnmja7lnLDlubPpnaLkvY3nva7lkozkuLvop5Lot7Pot4Ppq5jluqbvvIzpmo/mnLrlvpfliLDkuIDkuKrmmJ/mmJ/nmoQgeSDlnZDmoIdcbiAgICAgICAgdmFyIHJhbmRZID0gdGhpcy5ncm91bmRZICsgY2MucmFuZG9tMFRvMSgpICogdGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdQbGF5ZXInKS5qdW1wSGVpZ2h0ICsgNTA7XG4gICAgICAgIC8vIOagueaNruWxj+W5leWuveW6pu+8jOmaj+acuuW+l+WIsOS4gOS4quaYn+aYnyB4IOWdkOagh1xuICAgICAgICB2YXIgbWF4WCA9IHRoaXMubm9kZS53aWR0aC8yO1xuICAgICAgICByYW5kWCA9IGNjLnJhbmRvbU1pbnVzMVRvMSgpICogbWF4WDtcbiAgICAgICAgLy8g6L+U5Zue5pif5pif5Z2Q5qCHXG4gICAgICAgIHJldHVybiBjYy5wKHJhbmRYLCByYW5kWSk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIC8vIOavj+W4p+abtOaWsOiuoeaXtuWZqO+8jOi2hei/h+mZkOW6pui/mOayoeacieeUn+aIkOaWsOeahOaYn+aYn1xuICAgICAgICAvLyDlsLHkvJrosIPnlKjmuLjmiI/lpLHotKXpgLvovpFcbiAgICAgICAgaWYgKHRoaXMudGltZXIgPiB0aGlzLnN0YXJEdXJhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZXIgKz0gZHQ7XG4gICAgfSxcblxuICAgIGdhaW5TY29yZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNjb3JlICs9IDE7XG4gICAgICAgIC8vIOabtOaWsCBzY29yZURpc3BsYXkgTGFiZWwg55qE5paH5a2XXG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKTtcbiAgICAgICAgLy8g5pKt5pS+5b6X5YiG6Z+z5pWIXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5zY29yZUF1ZGlvLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucGxheWVyLnN0b3BBbGxBY3Rpb25zKCk7IC8v5YGc5q2iIHBsYXllciDoioLngrnnmoTot7Pot4PliqjkvZxcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdnYW1lJyk7XG4gICAgfVxufSk7XG4iLCJjYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDkuLvop5Lot7Pot4Ppq5jluqZcbiAgICAgICAganVtcEhlaWdodDogMCxcbiAgICAgICAgLy8g5Li76KeS6Lez6LeD5oyB57ut5pe26Ze0XG4gICAgICAgIGp1bXBEdXJhdGlvbjogMCxcbiAgICAgICAgLy8g5pyA5aSn56e75Yqo6YCf5bqmXG4gICAgICAgIG1heE1vdmVTcGVlZDogMCxcbiAgICAgICAgLy8g5Yqg6YCf5bqmXG4gICAgICAgIGFjY2VsOiAwLFxuICAgICAgICAvLyDot7Pot4Ppn7PmlYjotYTmupBcbiAgICAgICAganVtcEF1ZGlvOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgc2V0SnVtcEFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDot7Pot4PkuIrljYdcbiAgICAgICAgdmFyIGp1bXBVcCA9IGNjLm1vdmVCeSh0aGlzLmp1bXBEdXJhdGlvbiwgY2MucCgwLCB0aGlzLmp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uT3V0KCkpO1xuICAgICAgICAvLyDkuIvokL1cbiAgICAgICAgdmFyIGp1bXBEb3duID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIC10aGlzLmp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uSW4oKSk7XG4gICAgICAgIC8vIOa3u+WKoOS4gOS4quWbnuiwg+WHveaVsO+8jOeUqOS6juWcqOWKqOS9nOe7k+adn+aXtuiwg+eUqOaIkeS7rOWumuS5ieeahOWFtuS7luaWueazlVxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjYy5jYWxsRnVuYyh0aGlzLnBsYXlKdW1wU291bmQsIHRoaXMpO1xuICAgICAgICAvLyDkuI3mlq3ph43lpI3vvIzogIzkuJTmr4/mrKHlrozmiJDokL3lnLDliqjkvZzlkI7osIPnlKjlm57osIPmnaXmkq3mlL7lo7Dpn7NcbiAgICAgICAgcmV0dXJuIGNjLnJlcGVhdEZvcmV2ZXIoY2Muc2VxdWVuY2UoanVtcFVwLCBqdW1wRG93biwgY2FsbGJhY2spKTtcbiAgICB9LFxuXG4gICAgcGxheUp1bXBTb3VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDosIPnlKjlo7Dpn7PlvJXmk47mkq3mlL7lo7Dpn7NcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLmp1bXBBdWRpbywgZmFsc2UpO1xuICAgIH0sXG5cbiAgICBzZXRJbnB1dENvbnRyb2w6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL2FkZCBrZXlib2FyZCBpbnB1dCBsaXN0ZW5lciB0byBqdW1wLCB0dXJuTGVmdCBhbmQgdHVyblJpZ2h0XG4gICAgICAgIGNjLmV2ZW50TWFuYWdlci5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICBldmVudDogY2MuRXZlbnRMaXN0ZW5lci5LRVlCT0FSRCxcbiAgICAgICAgICAgIC8vIHNldCBhIGZsYWcgd2hlbiBrZXkgcHJlc3NlZFxuICAgICAgICAgICAgb25LZXlQcmVzc2VkOiBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaChrZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmE6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHVuc2V0IGEgZmxhZyB3aGVuIGtleSByZWxlYXNlZFxuICAgICAgICAgICAgb25LZXlSZWxlYXNlZDogZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2goa2V5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgc2VsZi5ub2RlKTtcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOWIneWni+WMlui3s+i3g+WKqOS9nFxuICAgICAgICB0aGlzLmp1bXBBY3Rpb24gPSB0aGlzLnNldEp1bXBBY3Rpb24oKTtcbiAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbih0aGlzLmp1bXBBY3Rpb24pO1xuXG4gICAgICAgIC8vIOWKoOmAn+W6puaWueWQkeW8gOWFs1xuICAgICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAvLyDkuLvop5LlvZPliY3msLTlubPmlrnlkJHpgJ/luqZcbiAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuXG4gICAgICAgIC8vIOWIneWni+WMlumUruebmOi+k+WFpeebkeWQrFxuICAgICAgICB0aGlzLnNldElucHV0Q29udHJvbCgpO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICAvLyDmoLnmja7lvZPliY3liqDpgJ/luqbmlrnlkJHmr4/luKfmm7TmlrDpgJ/luqZcbiAgICAgICAgaWYgKHRoaXMuYWNjTGVmdCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCAqIGR0O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWNjUmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkICs9IHRoaXMuYWNjZWwgKiBkdDtcbiAgICAgICAgfVxuICAgICAgICAvLyDpmZDliLbkuLvop5LnmoTpgJ/luqbkuI3og73otoXov4fmnIDlpKflgLxcbiAgICAgICAgaWYgKCBNYXRoLmFicyh0aGlzLnhTcGVlZCkgPiB0aGlzLm1heE1vdmVTcGVlZCApIHtcbiAgICAgICAgICAgIC8vIGlmIHNwZWVkIHJlYWNoIGxpbWl0LCB1c2UgbWF4IHNwZWVkIHdpdGggY3VycmVudCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHRoaXMueFNwZWVkID0gdGhpcy5tYXhNb3ZlU3BlZWQgKiB0aGlzLnhTcGVlZCAvIE1hdGguYWJzKHRoaXMueFNwZWVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOagueaNruW9k+WJjemAn+W6puabtOaWsOS4u+inkueahOS9jee9rlxuICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCAqIGR0O1xuICAgIH0sXG59KTtcbiIsImNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOaYn+aYn+WSjOS4u+inkuS5i+mXtOeahOi3neemu+Wwj+S6jui/meS4quaVsOWAvOaXtu+8jOWwseS8muWujOaIkOaUtumbhlxuICAgICAgICBwaWNrUmFkaXVzOiAwLFxuICAgICAgICAvLyDmmoLlrZggR2FtZSDlr7nosaHnmoTlvJXnlKhcbiAgICAgICAgZ2FtZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHNlcmlhbGl6YWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG5cblxuICAgIGdldFBsYXllckRpc3RhbmNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOagueaNriBwbGF5ZXIg6IqC54K55L2N572u5Yik5pat6Led56a7XG4gICAgICAgIHZhciBwbGF5ZXJQb3MgPSB0aGlzLmdhbWUucGxheWVyLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIC8vIOagueaNruS4pOeCueS9jee9ruiuoeeul+S4pOeCueS5i+mXtOi3neemu1xuICAgICAgICB2YXIgZGlzdCA9IGNjLnBEaXN0YW5jZSh0aGlzLm5vZGUucG9zaXRpb24sIHBsYXllclBvcyk7XG4gICAgICAgIHJldHVybiBkaXN0O1xuICAgIH0sXG5cbiAgICBvblBpY2tlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOW9k+aYn+aYn+iiq+aUtumbhuaXtu+8jOiwg+eUqCBHYW1lIOiEmuacrOS4reeahOaOpeWPo++8jOeUn+aIkOS4gOS4quaWsOeahOaYn+aYn1xuICAgICAgICB0aGlzLmdhbWUuc3Bhd25OZXdTdGFyKCk7XG4gICAgICAgIC8vIOiwg+eUqCBHYW1lIOiEmuacrOeahOW+l+WIhuaWueazlVxuICAgICAgICB0aGlzLmdhbWUuZ2FpblNjb3JlKCk7XG4gICAgICAgIC8vIOeEtuWQjumUgOavgeW9k+WJjeaYn+aYn+iKgueCuVxuICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICAvLyDmr4/luKfliKTmlq3lkozkuLvop5LkuYvpl7TnmoTot53nprvmmK/lkKblsI/kuo7mlLbpm4bot53nprtcbiAgICAgICAgaWYgKHRoaXMuZ2V0UGxheWVyRGlzdGFuY2UoKSA8IHRoaXMucGlja1JhZGl1cykge1xuICAgICAgICAgICAgLy8g6LCD55So5pS26ZuG6KGM5Li6XG4gICAgICAgICAgICB0aGlzLm9uUGlja2VkKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8g5qC55o2uIEdhbWUg6ISa5pys5Lit55qE6K6h5pe25Zmo5pu05paw5pif5pif55qE6YCP5piO5bqmXG4gICAgICAgIHZhciBvcGFjaXR5UmF0aW8gPSAxIC0gdGhpcy5nYW1lLnRpbWVyL3RoaXMuZ2FtZS5zdGFyRHVyYXRpb247XG4gICAgICAgIHZhciBtaW5PcGFjaXR5ID0gNTA7XG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gbWluT3BhY2l0eSArIE1hdGguZmxvb3Iob3BhY2l0eVJhdGlvICogKDI1NSAtIG1pbk9wYWNpdHkpKTtcbiAgICB9LFxufSk7XG4iXX0=