<template>
  <div v-if="visible" class="tool-bar" :style="toolbarStyle">
    <div class="canvas-bar">
      <i class="iconfont icon-quanping2" @click="drawGraph('square')"></i>
      <i class="syn-yuan-icon" @click="drawGraph('circle')"></i>
      <i class="iconfont icon-down1" @click="drawGraph('arrowLine')"></i>
      <i class="iconfont icon-75bianji" @click="drawGraph('graffiti')"></i>
      <i class="iconfont icon-font-size"></i>
      <i class="iconfont icon-download" @click="save()"></i>
      <i class="iconfont icon-chexiao2"></i>
      <i class="iconfont icon-close" @click="close()"></i>
      <i class="iconfont icon-check"></i>
    </div>
  </div>
</template>
<script>
import { getArrowCoordinate } from '../../utils/canvas';
import { remote, ipcRenderer } from 'electron'
const fs = require('fs');
export default {
  name: 'tool-bar',
  props: {
    visible: { // 是否显示
      type: Boolean,
      default: false
    },
    canvasObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      color: '#EB1212',
      displayCanvas: null,
      displayCtx: null,
      assistCanvas: null,
      assistCtx: null,
      toolbarStyle: {
        top: '0px',
        left: '0px'
      }
    }
  },
  watch: {
    canvasObj(val) {
      const { x, y, height } = val;
      this.toolbarStyle = {
        top: `${y + height + 4}px`,
        left: `${x}px`
      }
    }
  },
  mounted () {
    this.initCanvasData();
  },
  methods: {
    clearEvent() {
      document.onmousemove = null;
      document.onmouseup = null;
    },
    /**
     * 初始化canvas数据
     */
    initCanvasData() {
      this.displayCanvas = this.$parent.$refs.display;
      this.displayCtx = this.displayCanvas.getContext('2d');
      this.assistCanvas = this.$parent.$refs.assist;
      this.assistCtx = this.assistCanvas.getContext('2d');
    },
    /**
     * 画矩形
     */
    drawGraph(type) {
      const { x, y, width, height } = this.canvasObj;
      this.assistCanvas.onmousedown = e => {
        const x1 = e.clientX;
        const y1 = e.clientY;

        const X = x1 - x;
        const Y = y1 - y;
        let x2 = 0;
        let y2 = 0;
        let w = 0;
        let h = 0;
        this.assistCtx.moveTo(X, Y);
        this.assistCtx.strokeStyle = this.color;
        this.displayCtx.strokeStyle = this.color;
        this.assistCtx.fillStyle = this.color;
        this.displayCtx.fillStyle = this.color;
        let X2 = 0;
        let Y2 = 0;
        let a1 = 0;
        let b1 = 0;
        let a2 = 0;
        let b2 = 0;
        let a3 = 0;
        let b3 = 0;
        if(type === 'graffiti') {
          this.displayCtx.moveTo(X, Y);
        }
        document.onmousemove = e => {
          x2 = e.clientX;
          y2 = e.clientY;

          this.assistCtx.clearRect(0, 0, width, height);
          this.assistCtx.beginPath();
          if(type === 'square') {
            this.assistCtx.rect(X, Y, x2 - x1, y2 - y1);
          }else if(type === 'circle') {
            w = x2 - x1;
            h = y2 - y1;
            this.assistCtx.ellipse(X + w / 2, Y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
          }else if(type === 'arrowLine') {
            X2 = x2 - x;
            Y2 = y2 - y;
            [a1, b1, a2, b2, a3, b3] = getArrowCoordinate(X, Y, X2, Y2);
            this.assistCtx.moveTo(X, Y);
            this.assistCtx.lineTo(X2, Y2);
            this.assistCtx.moveTo(a1, b1);
            this.assistCtx.lineTo(a2, b2);
            this.assistCtx.lineTo(a3, b3);
            this.assistCtx.fill();
          }
          this.assistCtx.stroke();
          if(type === 'graffiti') {
            X2 = X2 - x;
            Y2 = Y2 - y;
            this.displayCtx.lineTo(X2, Y2);
            this.displayCtx.stroke();
          }
        }

        document.onmouseup = () => {
          this.assistCtx.clearRect(0, 0, width, height);
          if(type === 'square') {
            this.displayCtx.strokeRect(X, Y, x2 - x1, y2 - y1);
          }else if(type === 'circle') {
            this.displayCtx.beginPath();
            this.displayCtx.ellipse(X + w / 2, Y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            this.displayCtx.stroke();
          }else if(type === 'arrowLine') {
            this.displayCtx.beginPath();
            this.displayCtx.moveTo(X, Y);
            this.displayCtx.lineTo(X2, Y2);
            this.displayCtx.moveTo(a1, b1);
            this.displayCtx.lineTo(a2, b2);
            this.displayCtx.lineTo(a3, b3);
            this.displayCtx.fill();
            this.displayCtx.stroke();
          }

          this.clearEvent();
        }
      }
    },
    /**
     * 另存为
     */
    save() {
      const url = remote.app.getPath('pictures');
      remote.dialog.showSaveDialog({
        title: '图片另存为',
        defaultPath: `${url}\\${new Date().getTime()}.png`,
        filters: [
          { name: 'wq.png', extensions: ['png'] }
        ],
        nameFieldLabel: new Date().toLocaleTimeString()
      }).then(res => {
        const url = this.displayCanvas.toDataURL('image/png');
        const imageData = url.replace(/data:image\/png;base64,/, '');
        const imageBuffter = Buffer.alloc(imageData.length, imageData, 'base64');
        const fsStream = fs.createWriteStream(res.filePath, {
          encoding: 'utf8',
          autoClose: true
        });
        fsStream.write(imageBuffter);
        ipcRenderer.send('quit-app')
      })
    },
    /**
     * 关闭
     */
    close() {
      ipcRenderer.send('close-app');
      this.$emit('clear-data')
    }
  }
}
</script>
<style lang="scss" scoped>
.tool-bar {
  position: absolute;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 0 10px;
  color: #fff;
  min-width: 200px;
  .canvas-bar {
    height: 34px;
    @include flexStyle(row, center, space-around);
    i {
      font-size: 16px;
      cursor: pointer;
      &:hover {
        color: #409EFF;
        border-color: #409EFF;
      }
      &.icon-down1 {
        transform: rotate(45deg);
      }
    }
  }
}
</style>
