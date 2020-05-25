import { fetch, urls } from '@/api'
const orderManage = {
  state: {
    loadData: []
  },
  mutations: {
    setLoadData: (state, bool) => {
      state.loadData = bool
    }
  },
  actions: {
    getOrder ({ commit }, logisticsId) {
      return new Promise(resolve => {
        fetch(urls.order.get, { logisticsId }).then(res => {
          if (res.data.errorCode === 0) {
            commit('setLoadData', res.data.responseBody || [])
          } else {
            this.$message.error(res.data.message)
          }
        }).finally(() => {
          resolve()
        })
      })
    }
  }
}

export default orderManage
