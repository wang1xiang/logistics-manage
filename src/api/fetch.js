import axios from 'axios'
import route from '@/router'
import store from '@/store'
import notification from 'ant-design-vue/es/notification'
const key = `open${Date.now()}`
const service = axios.create({
  baseURL: process.env.VUE_APP_HOST,
  timeout: 60000
})
service.interceptors.request.use(
  config => {
    config.headers.token = localStorage.getItem('LOGISTIC_TOKEN')
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
service.interceptors.response.use(
  response => {
    if (response.data.message === '请登录') {
      notification.error({
        message: '错误',
        description: '后台服务已重启，需重新登陆，请保存当前页面信息，再点击确定按钮',
        btn: h => {
          return h(
            'a-button',
            {
              props: {
                type: 'primary',
                size: 'small'
              },
              on: {
                click: () => {
                  notification.close(key)
                  store.dispatch('Logout')
                  route.replace({ path: '/login' })
                }
              }
            },
            '确定'
          )
        },
        key,
        onClose: close
      })
    } else {
      return response
    }
  },
  error => {
    if (
      error.response !== undefined &&
      (error.response.status === 500 || error.response.status === 503 || error.response.status === 404)
    ) {
      notification.error({
        key,
        message: '请求失败',
        description: '服务器异常，请稍后重试'
      })
    } else {
      notification.error({
        key,
        message: '请求超时',
        description: error.message
      })
    }

    return Promise.reject(error)
  }
)
async function fetch (url, data, methods = 'post') {
  let res = null
  if (methods === 'get') {
    res = await service.get(url, data)
  } else {
    res = await service.post(url, data)
  }
  return res
  // todo: 统一业务处理
}

export {
  fetch,
  service
}
