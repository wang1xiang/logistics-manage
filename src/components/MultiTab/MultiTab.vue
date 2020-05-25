<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'MultiTab',
  data () {
    return {
      fullPathList: [],
      pages: [],
      activeKey: '',
      // 判断路由跳转时是否是tab触发
      tabClickFlag: false,
      newTabIndex: 0
    }
  },
  computed: {
    ...mapGetters({
      deleteTab: 'getDeleteTab',
      keepAlive: 'getKeepAlive'
    })
  },
  created () {
    this.pages.push(this.$route)
    this.fullPathList.push(this.$route.fullPath)
    if (!this.keepAlive.includes(this.$route.name)) {
      this.addKeepAlive(this.$route.name)
    }
    this.selectedLastPath()
  },
  methods: {
    ...mapMutations(['addKeepAlive', 'removeKeepAlive', 'clearKeepAlive']),
    onTabClick () {
      this.tabClickFlag = true
    },
    onEdit (targetKey, action) {
      this[action](targetKey)
    },
    remove (targetKey = this.activeKey) {
      const page = this.pages.find(page => page.fullPath === targetKey)
      this.pages = this.pages.filter(page => page.fullPath !== targetKey)
      this.fullPathList = this.fullPathList.filter(path => path !== targetKey)
      // 判断当前标签是否关闭，若关闭则跳转到最后一个还存在的标签页
      if (!this.fullPathList.includes(this.activeKey)) {
        this.selectedLastPath()
      }
      if (this.keepAlive.includes(page.name)) {
        this.removeKeepAlive(page.name)
      }
    },
    selectedLastPath () {
      this.activeKey = this.fullPathList[this.fullPathList.length - 1]
    },

    refresh () {
      this.$nextTick(() => {
        this.$router.replace({
          name: 'refresh'
        })
      })
    },
    removeOther () {
      this.pages = this.pages.filter(item => item.fullPath === this.activeKey)
      this.fullPathList = this.fullPathList.filter(path => path === this.activeKey)
      this.clearKeepAlive(this.pages[0].name)
    },
    removeAll () {
      this.pages = this.pages.slice(0, 1)
      this.fullPathList = this.fullPathList.slice(0, 1)
      if (!this.fullPathList.includes(this.activeKey)) {
        this.selectedLastPath()
      }
      this.clearKeepAlive(this.pages[0].name)
    },
    renderTabPaneMenu () {
      return (
        <a-dropdown placement="bottomRight">
          <a-menu slot="overlay">
            <a-menu-item {...{ on: { click: this.refresh } }} key="1">刷新当前选项卡</a-menu-item>
            <a-menu-item
              disabled={this.pages.length === 1}
              {...{ on: { click: () => this.remove() } }}
              key="2"
            >关闭当前选项卡</a-menu-item>
            <a-menu-item disabled={this.pages.length === 1} {...{ on: { click: this.removeOther } }} key="3">关闭其他选项卡</a-menu-item>
            <a-menu-item disabled={this.pages.length === 1} {...{ on: { click: this.removeAll } }} key="4">关闭所有选项卡</a-menu-item>
          </a-menu>
          <a-button>
            更多
            <a-icon type="down" />
          </a-button>
        </a-dropdown>
      )
    }
  },
  watch: {
    // 点击详情时先关闭此标签页
    deleteTab (val) {
      const name = val.split('-')[0]
      this.tabClickFlag = true
      this.pages = this.pages.filter(item => item.name !== name)
      this.fullPathList = this.fullPathList.filter(item => !item.includes(name))
      if (this.keepAlive.includes(name)) {
        this.removeKeepAlive(name)
      }
    },
    '$route': function (newVal) {
      if (newVal.name === 'refresh') return

      // 点击不是tab标签时，需重新刷新标签页
      if (!this.tabClickFlag && this.keepAlive.includes(newVal.name)) {
        this.removeKeepAlive(newVal.name)
        this.pages = this.pages.filter(item => item.fullPath !== newVal.fullPath)
        this.fullPathList = this.fullPathList.filter(item => item !== newVal.fullPath)
      }

      this.$nextTick(() => {
        if (!this.keepAlive.includes(newVal.name)) {
          this.addKeepAlive(newVal.name)
        }
        // 新增路由添加到keep-alive
        this.activeKey = newVal.fullPath
        if (this.fullPathList.indexOf(newVal.fullPath) < 0) {
          this.fullPathList.push(newVal.fullPath)
          this.pages.push(newVal)
        }
        // 重置tabClickFlag
        this.tabClickFlag = false
      })
    },
    activeKey: function (newPathKey) {
      this.$router.push({ path: newPathKey })
    }
  },
  render () {
    const { onEdit, onTabClick, refresh, $data: { pages } } = this
    const panes = pages.map(page => {
      const { icon, title } = page.meta
      return (
        <a-tab-pane
          style={{ height: 0 }}
          key={page.fullPath} closable={pages.length > 1}
        >
          <span slot="tab">
            <a-icon type={icon} />
            { title }
          </span>
        </a-tab-pane>)
    })

    const menus = this.renderTabPaneMenu()
    return (
      <div class="ant-pro-multi-tab">
        <div class="ant-pro-multi-tab-wrapper">
          <a-tabs
            hideAdd
            type={'editable-card'}
            v-model={this.activeKey}
            tabBarStyle={{ background: '#FFF', margin: 0 }}
            {...{ on: { edit: onEdit, tabClick: onTabClick } }}>
            {panes}
            <template slot="tabBarExtraContent">
              <a-icon
                {...{ on: { click: refresh } }}
                type="sync"
                class="fullscreen"
                title="刷新当前选项卡"
              />
               {menus}
            </template>
          </a-tabs>
        </div>
      </div>
    )
  }
}
</script>
<style scoped>
.fullscreen {
  font-size: 20px;
  margin-right: 15px;
  cursor: pointer;
}
</style>
