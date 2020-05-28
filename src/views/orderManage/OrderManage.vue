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
      :search="{
        showHeader: true,
        searchParam: ['box', 'name', 'phone', 'address', 'idCard', 'postNum'],
        localName: '订单'
      }"
      :extraHeight="400"
    >
      <template v-slot:name>
        <a-button type="primary" style="margin-left: 2px" v-show="showAddOrder" @click="showAddBatch = true">新增订单</a-button>
        <a-button type="primary" style="margin-left: 2px" @click="clearance" v-show="admin" :loading="clearanceLoading">报关</a-button>
        <a-button type="primary" style="margin-left: 2px" @click="showUpload = true" v-show="admin">批量导入</a-button>
      </template>
      <template slot="uuid" slot-scope="text, record">
        <span @click="handleEdit(record)" style="cursor: pointer">{{ text }}</span>
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
    <a-modal
      title="报关信息"
      :width="850"
      :visible="showErrorData"
      destroyOnClose
      :footer="null"
      @cancel="showErrorData = false">
      <a-table
        :columns="errorColumns"
        :dataSource="errorData"
        :pagination="false"
        :scroll="{y: 500}"
      >
      </a-table>
    </a-modal>
    <a-modal
      title="批量导入"
      :visible="showUpload"
      destroyOnClose
      :maskStyle="{ backgroundColor: 'rgba(0,0,0,0.2)' }"
      @cancel="showUpload = false; fileList = []"
    >
      <template slot="footer">
        <a-button @click="showUpload = false; fileList = []">关闭</a-button>
      </template>
      <a-tabs defaultActiveKey="1">
        <a-tab-pane tab="模板下载" key="1">
          <a-button icon="download" @click="getTemplate" type="primary">下载模板</a-button>
        </a-tab-pane>
        <a-tab-pane tab="文件上传" key="2">
          <a-upload
            name="file"
            :action="url"
            :data="{
              logisticsId: selectBatch || '',
              file: fileList
            }"
            :headers="headers"
            :fileList="fileList"
            @change="changeFile"
            v-if="showUpload"
          >
            <a-button>
              <a-icon type="upload" />上传文件
            </a-button>
          </a-upload>
        </a-tab-pane>
      </a-tabs>
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
          fixed: 'left',
          scopedSlots: { customRender: 'uuid' }
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
          title: '长',
          dataIndex: 'length',
          width: 120,
          sorter: (a, b) => a.length - b.length
        },
        {
          title: '宽',
          dataIndex: 'width',
          width: 120,
          sorter: (a, b) => a.width - b.width
        },
        {
          title: '高',
          dataIndex: 'height',
          width: 120,
          sorter: (a, b) => a.height - b.height
        },
        {
          title: '毛重',
          dataIndex: 'weight',
          width: 120,
          sorter: (a, b) => a.weight - b.weight
        },
        {
          title: '体积重',
          dataIndex: 'bulky',
          width: 120,
          sorter: (a, b) => a.bulky - b.bulky
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
      errorColumns: [
        {
          title: '订单流水号',
          dataIndex: 'uuid',
          align: 'center',
          ellipsis: true,
          width: 280
        },
        {
          title: '箱号',
          dataIndex: 'box',
          width: 120,
          align: 'center',
          ellipsis: true,
          sorter: (a, b) => a.box - b.box
        },
        {
          title: '收件人',
          dataIndex: 'name',
          align: 'center',
          ellipsis: true,
          width: 120
        },
        {
          title: '邮件单号',
          dataIndex: 'postNum',
          align: 'center',
          ellipsis: true,
          width: 120
        },
        {
          title: '报关状态',
          dataIndex: 'postState',
          width: 100,
          align: 'center',
          customRender: text => {
            if (text !== '') {
              return <span style="color: green">成功</span>
            } else {
              return <span style="color: red">失败</span>
            }
          }
        }
      ],
      showAddOrder: true,
      selectBatch: '',
      // 加载数据方法 必须为 Promise 对象
      tableLoading: false,
      showAddBatch: false,
      confirmLoading: false,
      clearanceLoading: false,
      showUpload: false,
      url: urls.order.upload,
      headers: {
        authorization: 'authorization-text',
        token: localStorage.getItem('LOGISTIC_TOKEN')
      },
      fileList: [],

      showErrorData: false,
      errorData: []
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
          const data = res.data.responseBody || []
          if (data.length === 0) {
            this.$message.info('没有可报关订单')
          } else {
            this.showErrorData = true
            this.errorData = data.map(item => {
              item.postState = item.postNum
              return item
            })
          }
        } else {
          this.$message.error(res.data.message)
        }
      }).finally(() => {
        this.clearanceLoading = false
      })
    },

    // 下载上传模板
    getTemplate () {
      const url = urls.order.downloadTemplate + '?token=' + this.headers.token
      window.location.href = url
    },
    // 文件上传
    changeFile ({ fileList }) {
      this.fileList = fileList
      const data = this.fileList[this.fileList.length - 1]
      if (data.status === 'error') {
        this.$message.error('文件上传失败')
        return
      }
      if (this.fileList.length > 0 && data.status === 'done') {
        const { response: { errorCode, responseBody } } = data
        if (errorCode === 0 && responseBody.length === 0) {
          this.$message.success('文件上传成功')
          this.tableLoading = true
          this.getOrder(this.selectBatch).then(res => {
            this.tableLoading = false
          })
        } else {
          responseBody.forEach(item => {
            this.$message.error(`第${item.line}行${item.message}`)
          })
        }
      }
    }
  }
}
</script>
