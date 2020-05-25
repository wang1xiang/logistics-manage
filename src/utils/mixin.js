// import Vue from 'vue'
import { deviceEnquire, DEVICE_TYPE } from '@/utils/device'
import { mapState } from 'vuex'

// const mixinsComputed = Vue.config.optionMergeStrategies.computed
// const mixinsMethods = Vue.config.optionMergeStrategies.methods

const mixin = {
  computed: {
    ...mapState({
      layoutMode: state => state.app.layout,
      navTheme: state => state.app.theme,
      primaryColor: state => state.app.color,
      colorWeak: state => state.app.weak,
      fixedHeader: state => state.app.fixedHeader,
      fixSiderbar: state => state.app.fixSiderbar,
      fixSidebar: state => state.app.fixSiderbar,
      contentWidth: state => state.app.contentWidth,
      autoHideHeader: state => state.app.autoHideHeader,
      sidebarOpened: state => state.app.sidebar,
      multiTab: state => state.app.multiTab
    })
  },
  methods: {
    isTopMenu () {
      return this.layoutMode === 'topmenu'
    },
    isSideMenu () {
      return !this.isTopMenu()
    }
  }
}

const mixinDevice = {
  computed: {
    ...mapState({
      device: state => state.app.device
    })
  },
  methods: {
    isMobile () {
      return this.device === DEVICE_TYPE.MOBILE
    },
    isDesktop () {
      return this.device === DEVICE_TYPE.DESKTOP
    },
    isTablet () {
      return this.device === DEVICE_TYPE.TABLET
    }
  }
}

const AppDeviceEnquire = {
  mounted () {
    const { $store } = this
    deviceEnquire(deviceType => {
      switch (deviceType) {
        case DEVICE_TYPE.DESKTOP:
          $store.commit('TOGGLE_DEVICE', 'desktop')
          $store.dispatch('setSidebar', true)
          break
        case DEVICE_TYPE.TABLET:
          $store.commit('TOGGLE_DEVICE', 'tablet')
          $store.dispatch('setSidebar', false)
          break
        case DEVICE_TYPE.MOBILE:
        default:
          $store.commit('TOGGLE_DEVICE', 'mobile')
          $store.dispatch('setSidebar', true)
          break
      }
    })
  }
}

const searchOptimize = {
  data () {
    return {
      searchValue: '',
      tableData: [],
      bakData: []
    }
  },
  watch: {
    searchValue (val) {
      if (val === '') this.onSearch('')
    }
  },
  methods: {
    onSearch (value, params) {
      if (value !== '') {
        this.tableData = this.bakData.filter(item => {
          let exist = false
          // 根据传入的参数 判断值是否存在
          params.forEach(pa => {
            if (item[pa] && item[pa].toLocaleUpperCase().includes(value.trim().toLocaleUpperCase())) exist = true
          })
          if (exist) return item
        })
      } else {
        this.tableData = this.bakData
      }
    }
  }
}

/**
 * 初始化table 计算table最佳行数
 * created或mounted中调用
 * length 页面除table外的其余高度
 */
const initTable = {
  data () {
    return {
      pagination: {
        pageSizeOptions: ['10', '20', '30', '40', '50'],
        showTotal: function (total) {
          return `共 ${total} 条`
        },
        pageSize: 10,
        showSizeChanger: true
      },
      tableHeight: 0
    }
  },
  methods: {
    initTable (length) {
      // 计算最隹的table条数
      // 120边框区域 + 37搜索条 + 48分页 + 48内部padding + 54表头
      this.tableHeight = window.innerHeight - length
      const bestSize = parseInt(this.tableHeight / 54)
      this.pagination.pageSize = bestSize
      const index = this.pagination.pageSizeOptions.findIndex(item => Number(item) > bestSize)
      if (Number(this.pagination.pageSizeOptions[index - 1]) !== bestSize) {
        this.pagination.pageSizeOptions.splice(index, 0, bestSize + '')
      }
    }
  }
}

/**
 * keepAvlie include变化时删除组件
 * 如果未删除组件 在vue-devtool中每点击一次就新增一个组件
 */
const removeKeepAlive = {
  data () {
    return {
      routeName: ''
    }
  },
  mounted () {
    this.routeName = this.$route.name
  },
  computed: {
    visitedViews () {
      return this.$store.state.permission.keepAlive
    }
  },
  watch: {
    visitedViews (value) {
      if (!value.includes(this.routeName)) {
        this.$destroy(this.$options.name)
      }
    }
  }
}

export { mixin, AppDeviceEnquire, mixinDevice, searchOptimize, initTable, removeKeepAlive }
