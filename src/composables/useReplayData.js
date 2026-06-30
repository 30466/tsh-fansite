import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as p48 from '@/api/pocket48'

const HARDCODED_MEMBER = '谭思慧'

const loading = ref(false)
const loadingFull = ref(false)
const loaded = ref(false)
const loadedAll = ref(false)
const totalCount = ref(0)
const replaysByDate = ref({})

let nextPage = '0'
let pocketIdCache = null

function getReplayDate(ctimeMs) {
  const d = new Date(Number(ctimeMs))
  d.setHours(d.getHours() - 6)
  return d.toISOString().slice(0, 10)
}

function addReplays(liveList) {
  for (const r of liveList) {
    const dateKey = getReplayDate(r.ctime)
    if (!replaysByDate.value[dateKey]) {
      replaysByDate.value[dateKey] = []
    }
    replaysByDate.value[dateKey].push(r)
    totalCount.value++
  }
}

async function quickLoad() {
  if (loaded.value) return  // already loaded, skip
  loading.value = true
  totalCount.value = 0
  replaysByDate.value = {}

  try {
    const roomMap = await p48.getRoomMap()
    const pocketId = roomMap[HARDCODED_MEMBER]
    if (!pocketId) {
      ElMessage.error(`未找到${HARDCODED_MEMBER}的口袋房间号`)
      loading.value = false
      return
    }
    pocketIdCache = pocketId

    const data = await p48.getLiveList(Number(pocketId), '0')
    if (data?.content?.liveList?.length) {
      addReplays(data.content.liveList)
      nextPage = data.content.next
    }

    loaded.value = true
  } catch (err) {
    ElMessage.error('加载录播列表失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

async function loadAll() {
  if (!pocketIdCache) return
  loadingFull.value = true

  try {
    let next = nextPage
    let pageCount = 1
    while (next) {
      const data = await p48.getLiveList(Number(pocketIdCache), next)
      if (data?.content?.liveList?.length) {
        addReplays(data.content.liveList)
        next = data.content.next
        pageCount++
      } else {
        break
      }
    }

    loadedAll.value = true
    ElMessage.success(`加载完成，共 ${totalCount.value} 条录播记录`)
  } catch (err) {
    ElMessage.error('加载录播列表失败: ' + err.message)
  } finally {
    loadingFull.value = false
  }
}

export function useReplayData() {
  return {
    loading,
    loadingFull,
    loaded,
    loadedAll,
    totalCount,
    replaysByDate,
    quickLoad,
    loadAll
  }
}
