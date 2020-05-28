let host = ''

host = window.config.baseUrl
if (process.env.NODE_ENV === 'production') {
  host = process.env.VUE_APP_HOST + '/logistics'
}

const logisticsPrefix = ''

const urls = {}
const logistics = {
  user: {
    login: '/user/login',
    logout: '/user/logout',
    add: '/user/add',
    update: '/user/update',
    delete: '/user/delete',
    get: '/user/get'
  },
  batch: {
    add: '/batch/add',
    update: '/batch/update',
    delete: '/batch/delete',
    get: '/batch/get'
  },

  // 订单
  order: {
    add: '/order/add',
    update: '/order/update',
    delete: '/order/delete',
    get: '/order/get',
    clearance: '/order/clearance',
    downloadTemplate: '/order/downloadTemplate',
    upload: '/order/upload',

    // 商品
    getCommodityByOrderId: '/order/getCommodityByOrderId',
    addCommodity: '/order/addCommodity',
    updateCommodity: '/order/updateCommodity',
    deleteCommodity: '/order/deleteCommodity',
    getByCode: '/commodity/getByCode'
  }

}
function addHost (urls, tag) {
  Object.keys(urls).forEach(key => {
    const value = urls[key]
    if (typeof value === 'string') {
      urls[key] = host + tag + value
    }
    if (typeof value === 'object') {
      addHost(value, tag)
    }
  })
}
addHost(logistics, logisticsPrefix)
Object.assign(urls, logistics)
export default urls
