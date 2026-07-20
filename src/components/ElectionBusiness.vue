<template>
  <div class="election-business-wrapper">
    <!-- 左：APP 按钮 -->
    <div class="floating-corner left">
      <div class="corner-btn" @click="showAppDialog = true">APP</div>
    </div>
    <!-- 右：总选业务按钮 -->
    <div class="floating-corner right">
      <div class="corner-btn" @click="showDialog = true">
        <el-icon class="btn-icon"><StarFilled /></el-icon>
        <span>总选业务</span>
      </div>
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
          >
            <img v-if="item.src" :src="item.src" :alt="item.label"
                 @click="openFullscreen(index)" />
            <div v-else class="announcement-body">
              <div v-if="announcementLoading" class="announcement-placeholder">加载中...</div>
              <div v-else-if="announcementError || !announcementText"
                   class="announcement-placeholder">暂无公告</div>
              <div v-else class="announcement-text">{{ announcementText }}</div>
              <div v-if="announcementDate" class="announcement-source">
                —— 来自 {{ announcementDate }} 的录播公告
              </div>
            </div>
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

    <!-- APP 安装说明 -->
    <el-dialog
      v-model="showAppDialog"
      title="网站PWA应用安装：手机APP/电脑桌面端"
      width="90%"
      :close-on-click-modal="true"
      class="app-dialog"
    >
      <div class="app-install-content">
        <p>网站可像软件一样可安装到手机/电脑桌面应用。</p>
        <p>用 Edge、Chrome、Safari、火狐等浏览器（国内的浏览器应该都不行，推荐使用 Edge 浏览器，安卓手机都能在自带的手机商店下载）打开该网站可安装到手机主屏幕/添加到手机/程序坞（Mac）。</p>
        <p>不知道怎么安装到手机/电脑的可以问豆包：<span class="ask-hint">xxx浏览器怎么安装pwa应用到xxx手机/电脑</span>（虽然电脑也没必要安装，电脑直接用网站最好）</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft, ArrowRight, StarFilled } from '@element-plus/icons-vue'
import * as p48 from '@/api/pocket48'

const images = [
  { label: '直播业务' },
  { src: '/images/election-business/直播间业务.jpg', label: '直播间业务' },
  { src: '/images/election-business/实物业务.jpg', label: '实物业务' },
  { src: '/images/election-business/彩蛋奖励.jpg', label: '彩蛋奖励' },
]

const announcementText = ref('')
const announcementDate = ref('')
const announcementLoading = ref(false)
const announcementError = ref(false)

onMounted(() => {
  fetchLatestAnnouncement()
})

async function fetchLatestAnnouncement() {
  announcementLoading.value = true
  announcementError.value = false
  try {
    const roomMap = await p48.getRoomMap()
    const pocketId = roomMap['谭思慧']
    if (!pocketId) return

    const data = await p48.getLiveList(Number(pocketId), '0')
    const liveList = data?.content?.liveList || []
    liveList.sort((a, b) => Number(b.ctime) - Number(a.ctime))

    for (const replay of liveList) {
      const detail = await p48.getLiveOne(replay.liveId)
      const ann = detail?.content?.announcement
      if (ann && ann.trim()) {
        announcementText.value = ann
        const d = new Date(Number(replay.ctime))
        announcementDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        return
      }
    }

    announcementError.value = true
  } catch (err) {
    console.error('获取最新公告失败:', err)
    announcementError.value = true
  } finally {
    announcementLoading.value = false
  }
}

const showDialog = ref(false)
const showAppDialog = ref(false)
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
  if (!images[index]?.src) return
  fullscreenIndex.value = index
  showFullscreen.value = true
}
</script>

<style scoped>
.election-business-wrapper {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  z-index: 101;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .election-business-wrapper {
    top: 60px;
  }
}

.floating-corner {
  position: absolute;
  top: 0;
}

.floating-corner.left {
  left: 20px;
}

.floating-corner.right {
  right: 20px;
}

.corner-btn {
  background: linear-gradient(135deg, #1a5276, #204fa1);
  color: #fff;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 4px 15px rgba(32, 79, 161, 0.4);
  transition: all 0.3s;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.corner-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(32, 79, 161, 0.55);
}

.btn-icon {
  font-size: 13px;
}

/* APP 安装说明弹窗 */
.app-install-content {
  line-height: 1.8;
  font-size: 15px;
  color: #303133;
  padding: 10px 0;
}
.app-install-content p {
  margin: 12px 0;
}
.ask-hint {
  color: #204fa1;
  font-style: normal;
  background: #f0f4ff;
  padding: 2px 8px;
  border-radius: 4px;
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

.announcement-body {
  width: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.announcement-text {
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 15px;
  color: #303133;
  max-height: 50vh;
  overflow-y: auto;
}

.announcement-source {
  margin-top: 16px;
  font-size: 13px;
  color: #909399;
  text-align: right;
}

.announcement-placeholder {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  font-size: 14px;
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
  background: #204fa1;
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

/* 弹窗标题居中加粗 */
:deep(.el-dialog__header) {
  text-align: center;
}
:deep(.el-dialog__title) {
  font-weight: 700;
}
</style>
