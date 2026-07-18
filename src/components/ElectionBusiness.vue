<template>
  <div class="election-business-wrapper">
    <!-- 浮动按钮 -->
    <div class="election-trigger" @click="showDialog = true">
      <span>总选业务</span>
    </div>

    <!-- 图片轮播弹窗 -->
    <el-dialog
      v-model="showDialog"
      title="总选业务"
      width="90%"
      :close-on-click-modal="true"
      destroy-on-close
      class="election-dialog"
    >
      <div class="carousel-container">
        <div
          class="carousel-track"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div
            v-for="(item, index) in images"
            :key="index"
            class="carousel-slide"
            @click="openFullscreen(index)"
          >
            <img :src="item.src" :alt="item.label" />
            <div class="slide-label">{{ item.label }}</div>
          </div>
        </div>

        <!-- 左右切换按钮 -->
        <div class="carousel-arrow left" @click="prev">
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <div class="carousel-arrow right" @click="next">
          <el-icon><ArrowRight /></el-icon>
        </div>

        <!-- 指示器 -->
        <div class="carousel-dots">
          <span
            v-for="(item, index) in images"
            :key="index"
            class="dot"
            :class="{ active: index === currentIndex }"
            @click="currentIndex = index"
          ></span>
        </div>
      </div>
    </el-dialog>

    <!-- 全屏查看 -->
    <el-dialog
      v-model="showFullscreen"
      :title="images[fullscreenIndex]?.label"
      fullscreen
      :close-on-click-modal="true"
      destroy-on-close
      class="fullscreen-dialog"
    >
      <div class="fullscreen-image-container" @click="showFullscreen = false">
        <img
          :src="images[fullscreenIndex]?.src"
          :alt="images[fullscreenIndex]?.label"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const images = [
  { src: '/images/election-business/直播业务.jpg', label: '直播业务' },
  { src: '/images/election-business/直播间业务.jpg', label: '直播间业务' },
  { src: '/images/election-business/实物业务.jpg', label: '实物业务' },
  { src: '/images/election-business/彩蛋奖励.jpg', label: '彩蛋奖励' },
]

const showDialog = ref(false)
const showFullscreen = ref(false)
const currentIndex = ref(0)
const fullscreenIndex = ref(0)

// 触摸滑动
let touchStartX = 0
let touchEndX = 0

function onTouchStart(e) {
  touchStartX = e.changedTouches[0].clientX
}

function onTouchMove(e) {
  touchEndX = e.changedTouches[0].clientX
}

function onTouchEnd() {
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      next()
    } else {
      prev()
    }
  }
}

function next() {
  if (currentIndex.value < images.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = images.length - 1
  }
}

function openFullscreen(index) {
  fullscreenIndex.value = index
  showFullscreen.value = true
}
</script>

<style scoped>
.election-business-wrapper {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 101;
}

@media (max-width: 768px) {
  .election-business-wrapper {
    top: 120px;
  }
}

.election-trigger {
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
  transition: all 0.3s;
  user-select: none;
}

.election-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.5);
}

.carousel-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-track {
  display: flex;
  transition: transform 0.3s ease;
}

.carousel-slide {
  min-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  box-sizing: border-box;
}

.carousel-slide img {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.2s;
}

.carousel-slide img:hover {
  transform: scale(1.02);
}

.slide-label {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
  z-index: 2;
}

.carousel-arrow:hover {
  background: rgba(0, 0, 0, 0.6);
}

.carousel-arrow.left {
  left: 10px;
}

.carousel-arrow.right {
  right: 10px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c0c4cc;
  cursor: pointer;
  transition: background 0.3s;
}

.dot.active {
  background: #409EFF;
}

.fullscreen-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
}

.fullscreen-image-container img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}
</style>
