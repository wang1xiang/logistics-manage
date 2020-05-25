const permission = {
  state: {
    keepAlive: [],
    deleteTab: ''
  },
  mutations: {
    setDeleteTab: (state, name) => {
      state.deleteTab = name
    },
    addKeepAlive: (state, router) => {
      state.keepAlive.push(router)
    },
    removeKeepAlive: (state, router) => {
      state.keepAlive = state.keepAlive.filter(item => item !== router)
    },
    clearKeepAlive: (state, router) => {
      state.keepAlive = state.keepAlive.filter(item => item === router)
    }
  }
}
export default permission
