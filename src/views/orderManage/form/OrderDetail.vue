<template>
  <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
    <a-card class="card" :bordered="false">
      <h4 slot="title">
        订单详情---编号<span style="color: red">（{{ $route.query.uuid }}）</span>
      </h4>
      <repository-form ref="repository" />
    </a-card>
    <!-- table -->
    <a-card>
      <a-table
        :columns="columns"
        :dataSource="memberData"
        :loading="memberLoading"
      >
        <template slot="quantity" slot-scope="text, record">
          <a-input-number
            :min="1"
            :max="10000"
            v-if="record.editable"
            style="margin: -5px 0"
            :value="text"
            @change="value => handleChange(value, 'quantity', record.uuid)"
          />
          <template v-else>{{ text }}</template>
        </template>
        <template slot="operation" slot-scope="text, record">
          <template v-if="record.editable">
            <span>
              <a @click="saveRow(record)">保存</a>
              <a-divider type="vertical" />
              <a @click="cancel(record.uuid)">取消</a>
            </span>
          </template>
          <span v-else>
            <a @click="toggle(record.uuid)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm title="是否要删除此行？" @confirm="remove(record.uuid)">
              <a>删除</a>
            </a-popconfirm>
          </span>
        </template>
      </a-table>
      <a-button style="width: 100%; margin-top: 16px; margin-bottom: 8px" type="dashed" icon="plus" @click="newMember">新增商品</a-button>
    </a-card>
    <a-modal
      title="新增商品"
      :visible="showModal"
      :maskClosable="false"
      destroyOnClose
      style="top: 15px;position: absolute;"
      @cancel="showModal = false"
      :width="600">
      <template slot="footer">
        <a-button @click="showModal = false">取消</a-button>
        <a-button type="primary" :loading="confirmLoading" @click="handlerConfig(false)">保存</a-button>
        <a-button type="primary" :loading="confirmLoading" @click="handlerConfig(true)">保存并继续</a-button>
      </template>
      <Commodity @addSuccess="addSuccess" v-model="confirmLoading" :orderId="orderId" ref="commodity"></Commodity>
    </a-modal>
  </a-card>
</template>

<script>
import RepositoryForm from './RepositoryForm'
import FooterToolBar from '@/components/FooterToolbar'
import Commodity from './commodity/Commodity'
import { mixin, mixinDevice, removeKeepAlive } from '@/utils/mixin'
import { fetch, urls } from '@/api'

export default {
  name: 'OrderDetail',
  mixins: [mixin, mixinDevice, removeKeepAlive],
  components: {
    FooterToolBar,
    RepositoryForm,
    Commodity
  },
  data () {
    return {
      loading: false,
      memberLoading: false,
      paramData: this.$route.params,
      // table
      columns: [
        {
          title: '商品编号',
          dataIndex: 'code',
          key: 'code',
          width: '15%',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '数量',
          dataIndex: 'quantity',
          key: 'quantity',
          width: '10%',
          ellipsis: true,
          align: 'center',
          scopedSlots: { customRender: 'quantity' }
        },
        {
          title: '中文名/日文名',
          dataIndex: 'name',
          key: 'name',
          width: '10%',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '人民币/日元',
          dataIndex: 'price',
          key: 'price',
          width: '10%',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '品牌',
          dataIndex: 'brand',
          key: 'brand',
          align: 'center',
          ellipsis: true,
          width: '10%'
        },
        {
          title: '品性',
          dataIndex: 'nature',
          key: 'nature',
          width: '10%',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '净重',
          dataIndex: 'weight',
          key: 'weight',
          width: '10%',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '单位',
          dataIndex: 'unit',
          key: 'unit',
          width: '10%',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      memberData: [],
      orderId: this.$route.query.uuid,
      showModal: false,
      confirmLoading: false
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      if (this.paramData) {
        const { form: { setFieldsValue } } = this.$refs.repository
        const { address, box, createTime, idCard, name, phone, postNum, uuid, weight } = this.paramData
        this.$nextTick(() => {
          setFieldsValue({
            address, box, createTime, idCard, name, phone, postNum, uuid, weight
          })
        })
      }
      // 存在uuid 需要查一下商品
      this.getCommodityByOrderId()
    },
    getCommodityByOrderId () {
      if (this.orderId) {
        this.memberLoading = true
        fetch(urls.order.getCommodityByOrderId, { orderId: this.orderId }).then(res => {
          if (res.data.errorCode === 0) {
            const data = res.data.responseBody || []
            this.memberData = data.map(item => {
              item.name = `${item.cName}/${item.jName}`
              item.price = `${item.cPrice}/${item.jPrice}`
              item.editable = false
              return item
            })
          } else {
            this.$message.error(res.data.message)
          }
        }).finally(() => {
          this.memberLoading = false
        })
      }
    },
    addSuccess (flag) {
      if (!flag) {
        this.showModal = false
      }
      this.getCommodityByOrderId()
    },
    newMember () {
      this.showModal = true
    },
    remove (key) {
      const ids = key.split(' ')
      this.memberLoading = true
      fetch(urls.order.deleteCommodity, { ids }).then(res => {
        if (res.data.errorCode === 0) {
          this.$message.success('删除商品成功')
          const newData = this.memberData.filter(item => item.uuid !== key)
          this.memberData = newData
        } else {
          this.$message.error(res.data.message)
        }
      }).finally(() => {
        this.memberLoading = false
      })
    },
    saveRow (record) {
      this.memberLoading = true
      const { uuid, quantity } = record
      // 模拟网络请求、卡顿 800ms
      fetch(urls.order.updateCommodity, { uuid, quantity }).then(res => {
        if (res.data.errorCode === 0) {
          this.$message.success('修改商品数量成功')
        } else {
          this.$message.error(res.data.message)
        }
      }).finally(() => {
        const target = this.memberData.find(item => item.uuid === uuid)
        target.editable = false
        this.memberLoading = false
      })
    },
    toggle (key) {
      const target = this.memberData.find(item => item.uuid === key)
      target._originalData = { ...target }
      target.editable = true
    },
    cancel (key) {
      const target = this.memberData.find(item => item.uuid === key)
      Object.keys(target).forEach(key => { target[key] = target._originalData[key] })
      target._originalData = undefined
    },
    handleChange (value, key, uuid) {
      const newData = [...this.memberData]
      const target = newData.find(item => uuid === item.uuid)
      if (target) {
        target[key] = value
        this.memberData = newData
      }
    },
    handlerConfig (flag) {
      this.$refs.commodity.handleSubmit(flag)
    }
  }
}
</script>

<style lang="less" scoped>
  .card{
    margin-bottom: 24px;
  }
  .popover-wrapper {
    /deep/ .antd-pro-pages-forms-style-errorPopover .ant-popover-inner-content {
      min-width: 256px;
      max-height: 290px;
      padding: 0;
      overflow: auto;
    }
  }
  .antd-pro-pages-forms-style-errorIcon {
    user-select: none;
    margin-right: 24px;
    color: #f5222d;
    cursor: pointer;
    i {
          margin-right: 4px;
    }
  }
  .antd-pro-pages-forms-style-errorListItem {
    padding: 8px 16px;
    list-style: none;
    border-bottom: 1px solid #e8e8e8;
    cursor: pointer;
    transition: all .3s;

    &:hover {
      background: #e6f7ff;
    }
    .antd-pro-pages-forms-style-errorIcon {
      float: left;
      margin-top: 4px;
      margin-right: 12px;
      padding-bottom: 22px;
      color: #f5222d;
    }
    .antd-pro-pages-forms-style-errorField {
      margin-top: 2px;
      color: rgba(0,0,0,.45);
      font-size: 12px;
    }
  }
</style>
