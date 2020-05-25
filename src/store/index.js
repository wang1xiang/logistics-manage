import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import orderManage from './modules/orderManage'
import permission from './modules/permission'

// default router permission control

// dynamic router permission control (Experimental)
// import permission from './modules/async-router'
import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    orderManage,
    permission
  },
  state: {

  },
  mutations: {

  },
  actions: {

  },
  getters
})
