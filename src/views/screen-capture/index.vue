<template>
  <div class="screen-capture">
    <div v-show="showSelectDiv" class="select-div" @mousedown="startConstituency"></div>
    <div v-show="showMask" ref="mask" class="mask"></div>
    <canvas ref="display" id="display-canvas"></canvas>
    <canvas ref="assist" id="assist-canvas"></canvas>
    <tool-bar
    :visible="toolbarVisivle"
    :canvasObj="canvasObj"
    @clear-data="clearData()"
    ></tool-bar>
    <!-- 桌面流 -->
    <canvas ref="desktop"></canvas>
    <video ref="video"></video>
  </div>
</template>
<script>
import { ipcRenderer, desktopCapturer, remote } from 'electron';
import { setCanvas } from '../../utils/canvas.js';
import ToolBar from '../tool-bar';
export default {
  name: 'screen-capture',
  components: {
    ToolBar
  },
  data() {
    return {
      screenSize: {},
      workAreaSize: {},
      showSelectDiv: true,
      showMask: false,
      canvasObj: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      toolbarVisivle: false
    }
  },
  created () {
    ipcRenderer.on('handle-screen-capture', () => {
      this.screenCapture();
    });
  },
  methods: {
    clipDesktop(x, y, width, height) {
      const desktop = this.$refs.desktop;
      const ctx = this.$refs.display.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(desktop, x, y, width, height, 0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    },
    /**
     * 画canvas
     * @param {Object} param canvas的位置、宽、高等值
     */
    drawCanvas() {
      // this.canvasObj = param;
      const { width, height, x, y } = this.canvasObj;
      setCanvas(this.$refs.display, width, height);
      setCanvas(this.$refs.assist, width, height);
      this.clipDesktop(x, y, width, height);
    },
    /**
     * 获取桌面流
     */
    screenCapture() {
      const { id, size, workAreaSize } = remote.screen.getPrimaryDisplay();
      this.screenSize = size;
      this.workAreaSize = workAreaSize;
      desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: {
          width: 0,
          height: 0
        }
      }).then(async sources => {
        for(const source of sources) {
          if(source.display_id === id.toString()) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source.id,
                    minWidth: size.width,
                    minHeight: size.height,
                    maxWidth: size.width,
                    maxHeight: size.height
                  }
                }
              })
              this.handleStream(stream)
            } catch (error) {
              console.error('screen-capture error: ', error);
            }
          }
        }
      })
    },
    /**
     * 桌面流转化为img
     */
    handleStream(stream) {
      const video = this.$refs.video;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        const desktopCanvas = this.$refs.desktop;
        const { width, height } = this.screenSize;
        desktopCanvas.width = width;
        desktopCanvas.height = height;
        desktopCanvas.style.width = `${width}px`;
        desktopCanvas.style.height = `${height}px`;

        const ctx = desktopCanvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        createImageBitmap(video).then(bmp => {
          ctx.drawImage(bmp, 0, 0);
          // 关闭视频
          stream.getTracks()[0].stop();
        })
      }
    },
    /**
     * 开始选区
     */
    startConstituency(e) {
      if(this.toolbarVisivle) return false;
      const x1 = e.clientX;
      const y1 = e.clientY;
      let x2 = 0;
      let y2 = 0;
      let width = 0;
      let height = 0;
      const display = this.$refs.display;
      display.style.top = `${y1}px`;
      display.style.left = `${x1}px`;
      const assist = this.$refs.assist;
      assist.style.top = `${y1}px`;
      assist.style.left = `${x1}px`;
      this.canvasObj.x = x1;
      this.canvasObj.y = y1;
      document.onmousemove = e => {
        this.showSelectDiv = false;
        this.showMask = true;
        x2 = e.clientX;
        y2 = e.clientY;
        width = x2 - x1;
        height = y2 - y1;
        this.canvasObj.width = width;
        this.canvasObj.height = height;
        this.drawCanvas();
      }
      document.onmouseup = e => {
        document.onmousemove = null;
        this.canvasObj = {
          x: x1,
          y: y1,
          width,
          height
        }
        this.toolbarVisivle = true;
        document.onmouseup = null;
      }
    },
    clearData() {
      const { width, height } = this.canvasObj;
      this.showSelectDiv = true;
      this.showMask = false;
      const desktopCanvas = this.$refs.desktop;
      const displayCanvas = this.$refs.display;
      const assistCanvas = this.$refs.assist;
      const displayCtx = displayCanvas.getContext('2d');
      const desktopCtx = desktopCanvas.getContext('2d');
      displayCtx.clearRect(0, 0, width, height);
      desktopCtx.clearRect(0, 0, this.screenSize.width, this.screenSize.height);
      displayCanvas.style.top = '0px';
      displayCanvas.style.left = '0px';
      displayCanvas.style.width = '0px';
      displayCanvas.style.height = '0px';
      assistCanvas.style.top = '0px';
      assistCanvas.style.left = '0px';
      assistCanvas.style.width = '0px';
      assistCanvas.style.height = '0px';
      this.toolbarVisivle = false;
    }
  }
}
</script>
<style lang="scss" scoped>
.screen-capture {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  video {
    visibility: hidden;
  }
  .select-div {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    border: 2px solid #409EFF;
  }
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.3);
  }
  #display-canvas,#assist-canvas {
    position: absolute;
    border: 1px solid #0B36F4;
    width: 0;
    height: 0;
    z-index: 99;
    pointer-events: none;
  }
  #assist-canvas {
    pointer-events: all;
  }
}
</style>
