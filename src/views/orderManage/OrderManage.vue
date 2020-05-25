<template>
  <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row>
          <a-col :md="4" :sm="24">
            <a-form-item label="批次">
              <a-select v-model="selectBatch" :options="batchOptions" @change="handleChange">
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <Table
      bordered
      ref="table"
      :columns="columns"
      :data="loadData"
      :loading="tableLoading"
      :pagination="true"
      :scroll="{x: 'auto'}"
      :customRow="customClick"
      :search="{
        showHeader: true,
        searchParam: ['box', 'name', 'phone', 'address', 'idCard', 'postNum'],
        localName: '订单'
      }"
      :extraHeight="300"
    >
      <template v-slot:name>
        <a-button type="primary" v-show="showAddOrder" @click="showAddBatch = true">新增订单</a-button>
        <a-button type="primary" @click="clearance" v-show="admin" :loading="clearanceLoading">报关</a-button>
      </template>
      <span slot="createTime" slot-scope="text">
        {{ text | moment }}
      </span>
      <span slot="action" slot-scope="text, record">
        <template>
          <a-popconfirm
            title="确定删除吗?"
            @confirm="handleDel(record)"
          >
            <a @click.stop>删除</a>
          </a-popconfirm>
        </template>
      </span>
    </Table>
    <a-modal
      title="新增订单"
      :visible="showAddBatch"
      :maskClosable="false"
      destroyOnClose
      :confirmLoading="confirmLoading"
      :width="1000"
      :footer="null"
      @cancel="showAddBatch = false">
      <repository-form @addSuccess="showAddBatch = false" ref="repository" :selectBatch="selectBatch" />
    </a-modal>
  </a-card>
</template>

<script>
import moment from 'moment'
import RepositoryForm from './form/RepositoryForm'
import Table from '@/components/Table'
import { fetch, urls } from '@/api'
import { removeKeepAlive } from '@/utils/mixin'
import { mapActions, mapMutations, mapGetters } from 'vuex'

export default {
  name: 'OrderManage',
  mixins: [removeKeepAlive],
  components: { RepositoryForm, Table },
  data () {
    return {
      admin: localStorage.getItem('LOGISTIC_ADMIN') === '1',

      batchOptions: [],
      // 表头
      columns: [
        {
          title: '订单流水号',
          dataIndex: 'uuid',
          width: 280,
          fixed: 'left'
        },
        {
          title: '箱号',
          dataIndex: 'box',
          width: 120,
          sorter: (a, b) => a.box - b.box
        },
        {
          title: '收件人',
          dataIndex: 'name',
          width: 140
        },
        {
          title: '电话',
          dataIndex: 'phone',
          width: 140
        },
        {
          title: '地址',
          dataIndex: 'address',
          width: 200
        },
        {
          title: '身份证号',
          dataIndex: 'idCard',
          width: 200
        },
        {
          title: '邮件单号',
          dataIndex: 'postNum',
          width: 200
        },
        {
          title: '毛重',
          dataIndex: 'weight',
          width: 120,
          sorter: (a, b) => a.weight - b.weight
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: 160,
          sorter: (a, b) => a.createTime - b.createTime,
          scopedSlots: { customRender: 'createTime' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 160,
          scopedSlots: { customRender: 'action' }
        }
      ],
      showAddOrder: true,
      selectBatch: '',
      // 加载数据方法 必须为 Promise 对象
      tableLoading: false,
      showAddBatch: false,
      confirmLoading: false,
      clearanceLoading: false,
      customClick: record => ({
        on: {
          click: e => {
            e.preventDefault()
            this.handleEdit(record)
          }
        }
      })
    }
  },
  computed: {
    ...mapGetters({
      loadData: 'getLoadData'
    })
  },
  created () {
    this.tableLoading = true
    fetch(urls.batch.get).then(res => {
      const data = res.data.responseBody
      if (data.length > 0) {
        this.batchOptions = data.map(item => {
          const { uuid, name, status } = item
          return {
            value: uuid,
            status,
            label: name
          }
        })
        this.selectBatch = this.batchOptions[0].value
        this.showAddOrder = !this.batchOptions[0].status
      }
      this.getOrder(this.selectBatch).then(res => {
        this.tableLoading = false
        this.$nextTick(() => {
          this.$refs.table.onSearch()
        })
      })
    })
  },
  methods: {
    ...mapMutations(['setLoadData', 'setDeleteTab']),
    ...mapActions(['getOrder']),
    handleEdit (record) {
      this.setDeleteTab(`OrderDetail-${new Date().getTime()}`)
      this.$router.push({
        name: 'OrderDetail',
        query: {
          logisticsId: this.selectBatch,
          uuid: record.uuid
        },
        params: record
      })
    },
    handleDel ({ uuid }) {
      const ids = uuid.split(' ')
      this.tableLoading = true
      fetch(urls.order.delete, { ids }).then(res => {
        if (res.data.errorCode === 0) {
          this.$message.success('删除成功')
          const loadData = this.loadData.filter(item => item.uuid !== uuid)
          this.setLoadData(loadData)
          this.$nextTick(() => {
            this.$refs.table.onSearch()
          })
        } else {
          this.$message.error(res.data.message)
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    handleChange (value, { data }) {
      this.showAddOrder = !data.props.status
      this.tableLoading = true
      this.getOrder(value).then(res => {
        this.tableLoading = false
      })
    },
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    },
    clearance () {
      this.clearanceLoading = true
      fetch(urls.order.clearance, { logisticsId: this.selectBatch }).then(res => {
        if (res.data.errorCode === 0) {
          this.$message.success('报关打印成功')
        } else {
          this.$message.error(res.data.message)
        }
      }).finally(() => {
        this.clearanceLoading = false
      })
    }
  }
}
</script>
