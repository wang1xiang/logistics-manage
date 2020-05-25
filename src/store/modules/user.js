import { fetch, urls } from '@/api'
import router from '@/router/'

const user = {
  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        fetch(urls.user.login, userInfo)
          .then(res => {
            const data = res.data.responseBody
            if (res.data.errorCode === 0) {
              data.password = userInfo.password
              localStorage.setItem('LOGISTIC_TOKEN', data.token, 7 * 24 * 60 * 60 * 1000)

              localStorage.setItem('LOGISTIC_ADMIN', data.admin, 7 * 24 * 60 * 60 * 1000)
              localStorage.setItem('LOGISTICS_NAME', data.username, 7 * 24 * 60 * 60 * 1000)
              resolve()
            } else {
              reject(res.data.message)
            }
          }).catch(error => {
            reject(error)
          })
      })
    },

    // 登出
    Logout ({ commit }) {
      localStorage.clear()
      router.push({ path: '/user' })
    }
  }
}

export default user
